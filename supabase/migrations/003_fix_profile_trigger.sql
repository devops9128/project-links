-- Fix Profile Creation Trigger for User Signup
-- This migration fixes the handle_new_user() function to work properly with RLS policies

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved function that bypasses RLS for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile with explicit security context
  -- Using SECURITY DEFINER to bypass RLS policies during trigger execution
  INSERT INTO public.profiles (id, email, full_name, preferences)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    '{}'
  );
  
  -- Log successful profile creation
  RAISE LOG 'Profile created for user: %', NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions to the function
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- Temporarily disable RLS for profile creation during signup
-- This allows the trigger to insert profiles without RLS restrictions
CREATE POLICY "Allow service role to insert profiles" ON public.profiles
  FOR INSERT TO service_role
  WITH CHECK (true);

-- Update the existing RLS policy to be more permissive for inserts
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    auth.uid() = id OR 
    auth.role() = 'service_role' OR
    current_setting('role') = 'service_role'
  );

-- Add a policy to allow the trigger function to insert profiles
CREATE POLICY "Allow trigger to insert profiles" ON public.profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow inserts from the trigger function context
    current_setting('application_name', true) LIKE '%trigger%' OR
    current_user = 'postgres' OR
    session_user = 'postgres'
  );

-- Ensure the profiles table has proper permissions
GRANT INSERT ON public.profiles TO postgres;
GRANT INSERT ON public.profiles TO service_role;

-- Add a function to manually create profile if trigger fails
CREATE OR REPLACE FUNCTION public.ensure_user_profile(user_id UUID, user_email TEXT, user_name TEXT)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, preferences)
  VALUES (user_id, COALESCE(user_email, ''), COALESCE(user_name, ''), '{}')
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_user_profile(UUID, TEXT, TEXT) TO service_role;