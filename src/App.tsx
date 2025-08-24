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

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Layout Components
import { Layout } from '@/components/layout';

// Page Components
import Home from '@/pages/Home';
import { Login, Register } from '@/pages/auth';
import { TaskList, TaskForm, TaskDetail } from '@/pages/tasks';
import { Profile } from '@/pages/profile';

// Store
import { useAuthStore } from '@/stores';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Layout>
      {children}
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
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
