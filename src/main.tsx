/**
 * Application Entry Point
 * 
 * This file initializes the React application and sets up the root rendering.
 * It includes global styles, authentication initialization, and error boundaries.
 * 
 * Features:
 * - React 18 concurrent features
 * - Global CSS imports
 * - Authentication state initialization
 * - Error boundary setup
 * - Development mode optimizations
 * 
 * Usage:
 * - Entry point for the entire application
 * - Handles initial app setup and configuration
 * - Manages global state initialization
 * 
 * Note:
 * - Uses React 18's createRoot API
 * - Includes StrictMode for development
 * - Initializes authentication on app start
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { useAuthStore } from '@/stores';

// Initialize authentication state
const initializeAuth = async () => {
  try {
    await useAuthStore.getState().initialize();
  } catch (error) {
    console.error('Failed to initialize authentication:', error);
  }
};

// Initialize auth before rendering
initializeAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
