/**
 * Header Component
 * 
 * This component provides the main navigation header for the application.
 * Features include user profile dropdown, navigation links, and logout functionality.
 * 
 * Features:
 * - Application logo and title
 * - User profile dropdown with avatar
 * - Navigation menu for different sections
 * - Logout functionality
 * - Responsive design for mobile and desktop
 * - Search functionality (optional)
 * 
 * Usage:
 * - Used in the main Layout component
 * - Displays user information when authenticated
 * - Provides navigation between different app sections
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Integrates with useAuthStore for user data
 * - Follows design system from product requirements
 */

import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Home,
  CheckSquare,
  User,
  Settings,
  LogOut,
  Menu,
  Search,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/stores';

interface HeaderProps {
  onMenuClick?: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  /**
   * Handle search submission
   */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to tasks page with search query
      navigate(`/tasks?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (user?.profile?.full_name) {
      return user.profile.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    const name = getUserDisplayName();
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Check if current route is active
   */
  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Left section - Logo and Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              type="button"
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
              onClick={onMenuClick}
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <CheckSquare className="h-8 w-8 text-blue-600" />
                <span className="ml-3 text-xl font-bold text-gray-900">
                  Project Links
                </span>
              </div>
            </Link>
          </div>

          {/* Center section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6 lg:mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Search tasks..."
                />
              </div>
            </form>
          </div>

          {/* Right section - Navigation and User Menu */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActiveRoute('/')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Home className="h-4 w-4 mr-1.5" />
                Dashboard
              </Link>
              <Link
                to="/tasks"
                className={`inline-flex items-center px-2 py-1 text-sm font-medium border-b-2 transition-all duration-200 ${
                  isActiveRoute('/tasks')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CheckSquare className="h-4 w-4 mr-1.5" />
                Tasks
              </Link>
            </nav>

            {/* Notifications */}
            <button className="p-2.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg transition-all duration-200">
              <Bell className="h-5 w-5" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative ml-2">
              <button
                type="button"
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:shadow-md"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              >
                <div className="h-9 w-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium shadow-sm">
                  {user?.profile?.avatar_url ? (
                    <img
                      className="h-9 w-9 rounded-full object-cover"
                      src={user.profile.avatar_url}
                      alt={getUserDisplayName()}
                    />
                  ) : (
                    getUserInitials()
                  )}
                </div>
                <span className="ml-3 text-sm font-medium text-gray-700 hidden sm:block">
                  {getUserDisplayName()}
                </span>
              </button>

              {/* Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Positioned below header container */}
      <div className="min-h-screen bg-gray-50 pt-8 pb-8 flex flex-col">
        <div className="flex-1 w-full max-w-none mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="min-h-full flex flex-col justify-center items-center gap-8 py-4 px-2">
            <div className="w-full max-w-6xl flex flex-col items-stretch space-y-6">
              {children || <Outlet />}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search tasks..."
            />
          </div>
        </form>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
};

export { Header };