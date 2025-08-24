/**
 * Task pages exports
 * 
 * This file provides a centralized export point for all task-related
 * pages and components.
 * 
 * Usage:
 * - import { TaskList, TaskForm, TaskDetail } from '@/pages/tasks'
 * - Use in routing configuration
 * 
 * Note:
 * - All task pages integrate with useTaskStore
 * - Follow consistent design patterns and validation
 * - Implement proper loading and error states
 */

export { default as TaskList } from './task-list';
export { default as TaskForm } from './task-form';
export { default as TaskDetail } from './task-detail';