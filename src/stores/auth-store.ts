/**
 * Authentication store using Zustand
 * 
 * This store manages user authentication state and provides methods for
 * sign in, sign up, sign out, and profile management using Supabase Auth.
 * 
 * Features:
 * - Automatic session persistence
 * - User profile management
 * - Loading states for async operations
 * - Error handling
 * 
 * Usage:
 * - const { user, signIn, signOut } = useAuthStore()
 * - Call signIn/signUp/signOut methods for authentication
 * - Access user and loading state for UI updates
 * 
 * Note:
 * - Follows Flux pattern for unidirectional data flow
 * - Integrates with Supabase Auth service
 * - Automatically syncs with Supabase session changes
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { AuthState, User, Profile } from '@/types';

interface AuthStore extends AuthState {
  error: string | null;
  initialized: boolean;
  isRateLimited: boolean;
  rateLimitCooldown: number;
  lastAttemptTime: number;
  initialize: () => Promise<void>;
  clearError: () => void;
  checkRateLimit: () => boolean;
  setRateLimit: (cooldownSeconds: number) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,
  isRateLimited: false,
  rateLimitCooldown: 0,
  lastAttemptTime: 0,

  /**
   * Initialize the auth store and set up session listener
   * Should be called once when the app starts
   */
  initialize: async () => {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ error: error.message, loading: false, initialized: true });
        return;
      }

      // Set initial user if session exists
      if (session?.user) {
        const userWithProfile = await loadUserProfile(session.user);
        set({ user: userWithProfile, loading: false, initialized: true });
      } else {
        set({ user: null, loading: false, initialized: true });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (session?.user) {
          const userWithProfile = await loadUserProfile(session.user);
          set({ user: userWithProfile, loading: false });
        } else {
          set({ user: null, loading: false });
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to initialize auth',
        loading: false,
        initialized: true
      });
    }
  },

  /**
   * Sign in with email and password
   */
  signIn: async (email: string, password: string) => {
    const { checkRateLimit, setRateLimit } = get();
    
    // Check if we're currently rate limited
    if (checkRateLimit()) {
      const { rateLimitCooldown, lastAttemptTime } = get();
      const remainingTime = Math.ceil(rateLimitCooldown - (Date.now() - lastAttemptTime) / 1000);
      throw new Error(`Please wait ${remainingTime} more seconds before trying again.`);
    }
    
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle rate limiting errors
        if (error.message.includes('429') || error.message.includes('Too Many Requests') || 
            error.message.includes('security purposes') || error.message.includes('after 4 seconds')) {
          console.log('Rate limit detected during sign in, setting cooldown');
          setRateLimit(5); // 5 second cooldown
          set({ loading: false });
          throw new Error('Too many login attempts. Please wait 5 seconds before trying again.');
        }
        
        set({ error: error.message, loading: false });
        throw error;
      }

      // User will be set automatically by the auth state change listener
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Sign up with email, password, and full name
   */
  signUp: async (email: string, password: string, fullName: string) => {
    const { checkRateLimit, setRateLimit } = get();
    
    // Check if we're currently rate limited
    if (checkRateLimit()) {
      const { rateLimitCooldown, lastAttemptTime } = get();
      const remainingTime = Math.ceil(rateLimitCooldown - (Date.now() - lastAttemptTime) / 1000);
      throw new Error(`Please wait ${remainingTime} more seconds before trying again.`);
    }
    
    set({ loading: true, error: null });
    
    try {
      console.log('Starting signup process for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: undefined, // Disable email confirmation for development
        },
      });

      if (error) {
        console.error('Supabase signup error:', error);
        
        // Handle rate limiting errors
        if (error.message.includes('429') || error.message.includes('Too Many Requests') || 
            error.message.includes('security purposes') || error.message.includes('after 4 seconds')) {
          console.log('Rate limit detected, setting cooldown');
          setRateLimit(5); // 5 second cooldown
          set({ loading: false });
          throw new Error('Too many signup attempts. Please wait 5 seconds before trying again.');
        }
        
        set({ error: error.message, loading: false });
        throw error;
      }

      console.log('Signup successful:', data);
      
      // Ensure profile is created - fallback mechanism
      if (data.user) {
        try {
          // Wait a moment for the trigger to complete
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Check if profile exists, if not create it manually
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();
          
          if (!existingProfile) {
            console.log('Profile not found, creating manually...');
            // Use the fallback function to ensure profile creation
            const { error: profileError } = await supabase.rpc('ensure_user_profile', {
              user_id: data.user.id,
              user_email: email,
              user_name: fullName
            });
            
            if (profileError) {
              console.error('Error creating profile manually:', profileError);
            } else {
              console.log('Profile created manually successfully');
            }
          } else {
            console.log('Profile already exists from trigger');
          }
        } catch (profileError) {
          console.error('Error checking/creating profile:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }
      
      set({ loading: false });
      
      // If email confirmation is disabled, user should be logged in immediately
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but email not confirmed. Check Supabase email settings.');
      }
      
    } catch (error) {
      console.error('Signup process failed:', error);
      const message = error instanceof Error ? error.message : 'Sign up failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Sign out the current user
   */
  signOut: async () => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }

      // User will be cleared automatically by the auth state change listener
      set({ loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign out failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: Partial<Profile>) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (error) {
        set({ error: error.message, loading: false });
        throw error;
      }

      // Reload user profile
      const updatedUser = await loadUserProfile(user);
      set({ user: updatedUser, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Profile update failed';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Clear any error messages
   */
  clearError: () => set({ error: null }),

  /**
   * Check if we're currently rate limited
   */
  checkRateLimit: () => {
    const { isRateLimited, rateLimitCooldown, lastAttemptTime } = get();
    if (!isRateLimited) return false;
    
    const now = Date.now();
    const timeElapsed = (now - lastAttemptTime) / 1000;
    
    if (timeElapsed >= rateLimitCooldown) {
      set({ isRateLimited: false, rateLimitCooldown: 0 });
      return false;
    }
    
    return true;
  },

  /**
   * Set rate limit state with cooldown period
   */
  setRateLimit: (cooldownSeconds: number) => {
    set({
      isRateLimited: true,
      rateLimitCooldown: cooldownSeconds,
      lastAttemptTime: Date.now(),
      error: `Too many requests. Please wait ${cooldownSeconds} seconds before trying again.`,
    });
    
    // Auto-clear rate limit after cooldown
    setTimeout(() => {
      const { isRateLimited: stillLimited } = get();
      if (stillLimited) {
        set({ isRateLimited: false, rateLimitCooldown: 0, error: null });
      }
    }, cooldownSeconds * 1000);
  },
}));

/**
 * Helper function to load user profile data
 */
async function loadUserProfile(user: any): Promise<User> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading profile:', error);
    }

    return {
      ...user,
      profile: profile || null,
    };
  } catch (error) {
    console.error('Error loading user profile:', error);
    return user;
  }
}

// Note: User profiles are automatically created by the database trigger
// when a new user signs up. See supabase/migrations/001_initial_schema.sql