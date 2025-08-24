/**
 * Main Layout Component
 * 
 * This component provides the main application layout structure,
 * combining the header and sidebar components with the main content area.
 * It handles responsive design and mobile navigation states.
 * 
 * Features:
 * - Responsive sidebar that collapses on mobile
 * - Header with user profile and navigation
 * - Main content area with proper spacing
 * - Mobile menu toggle functionality
 * - Authentication-aware rendering
 * 
 * Usage:
 * - Wrap around protected pages that need the full layout
 * - Automatically handles authentication checks
 * - Provides consistent layout across the application
 * 
 * Note:
 * - Only renders for authenticated users
 * - Handles mobile responsiveness automatically
 * - Integrates with authentication store
 */

import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { useAuthStore } from '@/stores';

export const Layout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading, initialize } = useAuthStore();

  // Initialize authentication on component mount
  useEffect(() => {
    initialize();
  }, [initialize]);

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

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};