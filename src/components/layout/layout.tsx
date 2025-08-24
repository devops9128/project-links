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
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Top Header Container - Contains both Sidebar header and Main header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex h-16">
          {/* Sidebar Header Section - Hidden on mobile */}
          <div className="hidden lg:flex w-64 items-center justify-between px-4 border-r border-gray-200 bg-white">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          
          {/* Main Header Section */}
          <div className="flex-1">
            <Header onMenuClick={() => setSidebarOpen(true)}>
              {children}
            </Header>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - Fixed positioning */}
      <div className="hidden lg:block fixed top-16 left-0 bottom-0 w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto z-30">
        <Sidebar isOpen={true} onClose={() => setSidebarOpen(false)} hideHeader={true} />
      </div>

      {/* Mobile Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} hideHeader={false} />
    </>
  );
};