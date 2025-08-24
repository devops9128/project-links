/**
 * Supabase client configuration
 * 
 * This module initializes and exports the Supabase client instance
 * used throughout the application for database operations and authentication.
 * 
 * Usage:
 * - Import { supabase } from '@/lib/supabase'
 * - Use supabase.auth for authentication operations
 * - Use supabase.from() for database operations
 * 
 * Note:
 * - Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in environment variables
 * - The anon key is safe to use in frontend applications
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Environment variables validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create and export Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Development settings to handle email confirmation
    flowType: 'pkce',
    debug: import.meta.env.DEV,
  },
  // Global settings
  global: {
    headers: {
      'X-Client-Info': 'project-links-web',
    },
  },
});

// Export types for convenience
export type { Database } from '@/types/database';