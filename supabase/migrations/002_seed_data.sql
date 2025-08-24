-- Seed Data for Project Links Task Management
-- This migration adds initial data for testing and demonstration

-- Insert default categories (these will be created for each user via the application)
-- Note: This is just for reference, actual categories will be user-specific

-- Sample data will be created through the application interface
-- This file serves as a placeholder for any global seed data

-- Create a function to insert default categories for a user
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default categories for the user
  INSERT INTO public.categories (name, description, color, user_id) VALUES
    ('Work', 'Work-related tasks and projects', '#3B82F6', user_id),
    ('Personal', 'Personal tasks and activities', '#10B981', user_id),
    ('Learning', 'Educational and skill development tasks', '#F59E0B', user_id),
    ('Health', 'Health and fitness related tasks', '#EF4444', user_id),
    ('Finance', 'Financial planning and money management', '#8B5CF6', user_id)
  ON CONFLICT (name, user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to also create default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  -- Create default categories
  PERFORM public.create_default_categories_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get task statistics for a user
CREATE OR REPLACE FUNCTION public.get_task_statistics(user_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  pending_tasks BIGINT,
  in_progress_tasks BIGINT,
  completed_tasks BIGINT,
  overdue_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_tasks,
    COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE status != 'completed' AND due_date < NOW()) as overdue_tasks
  FROM public.tasks
  WHERE tasks.user_id = get_task_statistics.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get category statistics for a user
CREATE OR REPLACE FUNCTION public.get_category_statistics(user_id UUID)
RETURNS TABLE (
  category_id UUID,
  category_name TEXT,
  task_count BIGINT,
  completed_count BIGINT,
  pending_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    COUNT(t.id) as task_count,
    COUNT(t.id) FILTER (WHERE t.status = 'completed') as completed_count,
    COUNT(t.id) FILTER (WHERE t.status = 'pending') as pending_count
  FROM public.categories c
  LEFT JOIN public.tasks t ON c.id = t.category_id
  WHERE c.user_id = get_category_statistics.user_id
  GROUP BY c.id, c.name
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.create_default_categories_for_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_statistics(UUID) TO authenticated;