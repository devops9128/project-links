/**
 * Application type definitions
 * 
 * This file contains TypeScript interfaces and types used throughout
 * the application for components, forms, and business logic.
 * 
 * Usage:
 * - Import specific types: import { User, AuthState, TaskFormData } from '@/types'
 * - Use for component props, form validation, and state management
 * 
 * Note:
 * - These types are separate from database types for better separation of concerns
 * - Update these types when adding new features or changing component interfaces
 */

import type { User as SupabaseUser } from '@supabase/supabase-js';
import type { Task, Category, Profile, TaskPriority, TaskStatus } from './database';

// Re-export database types for convenience
export type { 
  Task, 
  Category, 
  Profile, 
  TaskPriority, 
  TaskStatus,
  TaskWithCategory,
  CategoryWithTaskCount
} from './database';
export type { Database } from './database';

// Database operation types
import type { Database as DatabaseType } from './database';
export type TaskInsert = DatabaseType['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = DatabaseType['public']['Tables']['tasks']['Update'];
export type CategoryInsert = DatabaseType['public']['Tables']['categories']['Insert'];

// Authentication types
export interface User extends SupabaseUser {
  profile?: Profile;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

// Form data types
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  acceptTerms: boolean;
}

export interface TaskFormData {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  categoryId?: string;
}

export interface CategoryFormData {
  name: string;
  color: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

// Filter and sort types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  categoryId?: string[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export type TaskSortField = 'created_at' | 'updated_at' | 'due_date' | 'title' | 'priority';
export type SortDirection = 'asc' | 'desc';

export interface TaskSort {
  field: TaskSortField;
  direction: SortDirection;
}

// Dashboard statistics types
export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

export interface CategoryStats extends Category {
  taskCount: number;
  completedCount: number;
}

// UI component types
export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

// Route types
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  title?: string;
  description?: string;
}