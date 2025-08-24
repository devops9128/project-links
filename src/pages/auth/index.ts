/**
 * Authentication pages exports
 * 
 * This file provides a centralized export point for all authentication
 * related pages and components.
 * 
 * Usage:
 * - import { Login, Register } from '@/pages/auth'
 * - Use in routing configuration
 * 
 * Note:
 * - All auth pages follow consistent design patterns
 * - Integrate with useAuthStore for state management
 * - Include proper form validation and error handling
 */

export { default as Login } from './login';
export { default as Register } from './register';