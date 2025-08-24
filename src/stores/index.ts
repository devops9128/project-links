/**
 * Store exports
 * 
 * This file provides a centralized export point for all Zustand stores
 * used throughout the application.
 * 
 * Usage:
 * - import { useAuthStore, useTaskStore } from '@/stores'
 * - Use individual stores in components as needed
 * 
 * Note:
 * - All stores follow the Flux pattern for unidirectional data flow
 * - Stores are lightweight and performant
 * - Each store manages its own domain of state
 */

export { useAuthStore } from './auth-store';
export { useTaskStore } from './task-store';

// Re-export types for convenience
export type { AuthState } from '@/types';