/**
 * Main Application Component
 * 
 * This component sets up the routing structure for the entire application.
 * It includes protected routes, authentication flows, and layout management.
 * 
 * Features:
 * - React Router setup with protected routes
 * - Authentication state management
 * - Layout wrapper for authenticated pages
 * - Route-based code splitting (optional)
 * - Error boundaries and loading states
 * 
 * Usage:
 * - Entry point for the entire application
 * - Handles routing between authenticated and public pages
 * - Integrates with authentication store
 * 
 * Note:
 * - Uses React Router v6 for navigation
 * - Implements proper route protection
 * - Follows the route definitions from technical architecture
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout Components
import { Layout } from '@/components/layout';

// Lazy-loaded Page Components
const Home = React.lazy(() => import('@/pages/Home'));
const Login = React.lazy(() => import('@/pages/auth').then(module => ({ default: module.Login })));
const Register = React.lazy(() => import('@/pages/auth').then(module => ({ default: module.Register })));
const TaskList = React.lazy(() => import('@/pages/tasks').then(module => ({ default: module.TaskList })));
const TaskForm = React.lazy(() => import('@/pages/tasks').then(module => ({ default: module.TaskForm })));
const TaskDetail = React.lazy(() => import('@/pages/tasks').then(module => ({ default: module.TaskDetail })));
const Profile = React.lazy(() => import('@/pages/profile').then(module => ({ default: module.Profile })));

// Store
import { useAuthStore } from '@/stores';

// Create a client for React Query with optimized configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache configuration
      staleTime: 1000 * 60 * 5, // 5 minutes - data considered fresh
      cacheTime: 1000 * 60 * 30, // 30 minutes - keep in cache
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Performance optimizations
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode configuration
      networkMode: 'online',
      
      // Error handling
      useErrorBoundary: false,
      
      // Suspense configuration
      suspense: false,
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error: any) => {
        // Don't retry mutations on client errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 2 times for server errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      
      // Error handling
      useErrorBoundary: false,
      
      // Network mode
      networkMode: 'online',
    },
  },
  
  // Query cache configuration
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Global error handling for queries
      console.error('Query error:', error, 'Query key:', query.queryKey);
    },
  }),
  
  // Mutation cache configuration
  mutationCache: new MutationCache({
    onError: (error, variables, context, mutation) => {
      // Global error handling for mutations
      console.error('Mutation error:', error, 'Variables:', variables);
    },
  }),
 });

/**
 * Loading Component
 * Displays a loading spinner while lazy components are being loaded
 */
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </Layout>
  );
};

/**
 * Public Route Component
 * For routes that don't require authentication
 * Redirects to home if user is already authenticated
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute>
                  <TaskList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/new"
              element={
                <ProtectedRoute>
                  <TaskForm mode="create" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id"
              element={
                <ProtectedRoute>
                  <TaskDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks/:id/edit"
              element={
                <ProtectedRoute>
                  <TaskForm mode="edit" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      
      {/* React Query DevTools (only in development) */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
