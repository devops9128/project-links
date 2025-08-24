/**
 * Database type definitions for Supabase
 * 
 * This file contains TypeScript interfaces that match the database schema
 * defined in the technical architecture document.
 * 
 * Usage:
 * - Import specific types: import { Task, Category, Profile } from '@/types/database'
 * - Use with Supabase client for type safety
 * 
 * Note:
 * - These types should match the actual database schema
 * - Update these types when database schema changes
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      tasks: {
        Row: Task;
        Insert: TaskInsert;
        Update: TaskUpdate;
      };
    };
  };
}

// Profile types
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  preferences: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProfileInsert {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  preferences?: Record<string, any>;
}

export interface ProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  preferences?: Record<string, any>;
}

// Category types
export interface Category {
  id: string;
  name: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryInsert {
  name: string;
  color?: string;
  user_id: string;
}

export interface CategoryUpdate {
  name?: string;
  color?: string;
}

// Task types
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  user_id: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskInsert {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  user_id: string;
  category_id?: string | null;
}

export interface TaskUpdate {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  category_id?: string | null;
}

// Extended types with relations
export interface TaskWithCategory extends Task {
  category?: Category | null;
}

export interface CategoryWithTaskCount extends Category {
  task_count?: number;
}