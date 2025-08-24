/**
 * Task management store using Zustand
 * 
 * This store manages task-related state including tasks, categories,
 * filters, and provides methods for CRUD operations.
 * 
 * Features:
 * - Task CRUD operations
 * - Category management
 * - Filtering and sorting
 * - Statistics calculation
 * - Real-time updates
 * 
 * Usage:
 * - const { tasks, createTask, updateTask } = useTaskStore()
 * - Call CRUD methods for task operations
 * - Access filtered tasks and statistics
 * 
 * Note:
 * - Follows Flux pattern for unidirectional data flow
 * - Integrates with Supabase database
 * - Automatically updates UI when data changes
 */

import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type {
  Task,
  Category,
  TaskWithCategory,
  TaskFormData,
  CategoryFormData,
  TaskFilters,
  TaskSort,
  TaskStats,
  TaskInsert,
  TaskUpdate,
  CategoryInsert,
} from '@/types';

interface TaskStore {
  // State
  tasks: TaskWithCategory[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  sort: TaskSort;
  
  // Task operations
  fetchTasks: () => Promise<void>;
  createTask: (taskData: TaskFormData) => Promise<Task>;
  updateTask: (id: string, taskData: Partial<TaskFormData>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Category operations
  fetchCategories: () => Promise<void>;
  createCategory: (categoryData: CategoryFormData) => Promise<Category>;
  updateCategory: (id: string, categoryData: Partial<CategoryFormData>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Filtering and sorting
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSort: (sort: TaskSort) => void;
  clearFilters: () => void;
  
  // Computed values
  getFilteredTasks: () => TaskWithCategory[];
  getTaskStats: () => TaskStats;
  
  // Utility
  clearError: () => void;
}

const DEFAULT_SORT: TaskSort = {
  field: 'created_at',
  direction: 'desc',
};

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  tasks: [],
  categories: [],
  loading: false,
  error: null,
  filters: {},
  sort: DEFAULT_SORT,

  /**
   * Fetch all tasks for the current user
   */
  fetchTasks: async () => {
    set({ loading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ tasks: tasks || [], loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
      set({ error: message, loading: false });
    }
  },

  /**
   * Create a new task
   */
  createTask: async (taskData: TaskFormData) => {
    set({ loading: true, error: null });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const taskInsert: TaskInsert = {
        title: taskData.title,
        description: taskData.description || null,
        due_date: taskData.dueDate || null,
        priority: taskData.priority,
        status: taskData.status,
        category_id: taskData.categoryId || null,
        user_id: user.id,
      };

      const { data: task, error } = await supabase
        .from('tasks')
        .insert(taskInsert)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      // Add to local state
      const { tasks } = get();
      set({ tasks: [task, ...tasks], loading: false });
      
      return task;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create task';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: string, taskData: Partial<TaskFormData>) => {
    set({ loading: true, error: null });
    
    try {
      const taskUpdate: any = {
        ...(taskData.title && { title: taskData.title }),
        ...(taskData.description !== undefined && { description: taskData.description || null }),
        ...(taskData.dueDate !== undefined && { due_date: taskData.dueDate || null }),
        ...(taskData.priority && { priority: taskData.priority }),
        ...(taskData.status && { status: taskData.status }),
        ...(taskData.categoryId !== undefined && { category_id: taskData.categoryId || null }),
      };

      const { data: task, error } = await supabase
        .from('tasks')
        .update(taskUpdate)
        .eq('id', id)
        .select(`
          *,
          category:categories(*)
        `)
        .single();

      if (error) throw error;

      // Update local state
      const { tasks } = get();
      const updatedTasks = tasks.map(t => t.id === id ? task : t);
      set({ tasks: updatedTasks, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update task';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      const { tasks } = get();
      const filteredTasks = tasks.filter(t => t.id !== id);
      set({ tasks: filteredTasks, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete task';
      set({ error: message, loading: false });
      throw error;
    }
  },

  /**
   * Fetch all categories for the current user
   */
  fetchCategories: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: categories, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;

      set({ categories: categories || [] });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch categories';
      set({ error: message });
    }
  },

  /**
   * Create a new category
   */
  createCategory: async (categoryData: CategoryFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const categoryInsert: CategoryInsert = {
        name: categoryData.name,
        color: categoryData.color,
        user_id: user.id,
      };

      const { data: category, error } = await supabase
        .from('categories')
        .insert(categoryInsert)
        .select()
        .single();

      if (error) throw error;

      // Add to local state
      const { categories } = get();
      set({ categories: [...categories, category] });
      
      return category;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Update an existing category
   */
  updateCategory: async (id: string, categoryData: Partial<CategoryFormData>) => {
    try {
      const { data: category, error } = await supabase
        .from('categories')
        .update(categoryData as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const { categories } = get();
      const updatedCategories = categories.map(c => c.id === id ? category : c);
      set({ categories: updatedCategories });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Delete a category
   */
  deleteCategory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local state
      const { categories } = get();
      const filteredCategories = categories.filter(c => c.id !== id);
      set({ categories: filteredCategories });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      set({ error: message });
      throw error;
    }
  },

  /**
   * Set task filters
   */
  setFilters: (newFilters: Partial<TaskFilters>) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  /**
   * Set task sorting
   */
  setSort: (sort: TaskSort) => {
    set({ sort });
  },

  /**
   * Clear all filters
   */
  clearFilters: () => {
    set({ filters: {} });
  },

  /**
   * Get filtered and sorted tasks
   */
  getFilteredTasks: () => {
    const { tasks, filters, sort } = get();
    
    let filteredTasks = [...tasks];

    // Apply filters
    if (filters.status?.length) {
      filteredTasks = filteredTasks.filter(task => filters.status!.includes(task.status));
    }
    
    if (filters.priority?.length) {
      filteredTasks = filteredTasks.filter(task => filters.priority!.includes(task.priority));
    }
    
    if (filters.categoryId?.length) {
      filteredTasks = filteredTasks.filter(task => 
        task.category_id && filters.categoryId!.includes(task.category_id)
      );
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filteredTasks.sort((a, b) => {
      const aValue = a[sort.field];
      const bValue = b[sort.field];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sort.direction === 'asc' ? comparison : -comparison;
    });

    return filteredTasks;
  },

  /**
   * Calculate task statistics
   */
  getTaskStats: () => {
    const { tasks } = get();
    const now = new Date();
    
    const stats: TaskStats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.due_date && 
        new Date(t.due_date) < now && 
        t.status !== 'completed'
      ).length,
      completionRate: tasks.length > 0 
        ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
        : 0,
    };
    
    return stats;
  },

  /**
   * Clear any error messages
   */
  clearError: () => set({ error: null }),
}));