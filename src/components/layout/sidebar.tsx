/**
 * Sidebar Component
 * 
 * This component provides the main navigation sidebar for the application.
 * Features include navigation links, task statistics, and category management.
 * 
 * Features:
 * - Main navigation links (Dashboard, Tasks, Profile)
 * - Task statistics overview
 * - Category list with task counts
 * - Quick actions for creating tasks and categories
 * - Responsive design (collapsible on mobile)
 * - Active route highlighting
 * 
 * Usage:
 * - Used in the main Layout component
 * - Can be toggled on mobile devices
 * - Integrates with task and auth stores
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Follows design system from product requirements
 * - Implements proper accessibility features
 */

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  CheckSquare,
  User,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  Tag,
} from 'lucide-react';
import { useTaskStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    categories, 
    getTaskStats, 
    fetchCategories, 
    fetchTasks 
  } = useTaskStore();
  
  const taskStats = getTaskStats();

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCategories();
    }
  }, [user, fetchTasks, fetchCategories]);

  /**
   * Check if current route is active
   */
  const isActiveRoute = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  /**
   * Navigation items configuration
   */
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: Home,
      current: isActiveRoute('/'),
    },
    {
      name: 'All Tasks',
      href: '/tasks',
      icon: CheckSquare,
      current: isActiveRoute('/tasks'),
      count: taskStats.total,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      current: isActiveRoute('/profile'),
    },
  ];

  /**
   * Task status items for quick filtering
   */
  const taskStatusItems = [
    {
      name: 'Pending',
      href: '/tasks?status=pending',
      icon: Clock,
      count: taskStats.pending,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'In Progress',
      href: '/tasks?status=in_progress',
      icon: AlertCircle,
      count: taskStats.inProgress,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Completed',
      href: '/tasks?status=completed',
      icon: CheckCircle,
      count: taskStats.completed,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Overdue',
      href: '/tasks?overdue=true',
      icon: Calendar,
      count: taskStats.overdue,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Main Navigation */}
            <nav className="px-4 mt-6">
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                        item.current
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0",
                        item.current ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      )} />
                      {item.name}
                      {item.count !== undefined && (
                        <span className={cn(
                          "ml-auto inline-block py-0.5 px-2 text-xs rounded-full",
                          item.current
                            ? "bg-blue-100 text-blue-600"
                            : "bg-gray-100 text-gray-600"
                        )}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Quick Actions */}
            <div className="px-4 mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/tasks/new"
                  onClick={onClose}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </div>
            </div>

            {/* Task Status Overview */}
            <div className="px-4 mt-8">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Task Status
              </h3>
              <div className="space-y-2">
                {taskStatusItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={cn(
                        "flex items-center justify-center w-6 h-6 rounded mr-3",
                        item.bgColor
                      )}>
                        <Icon className={cn("h-3 w-3", item.color)} />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-900 flex-1">
                        {item.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {item.count}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Categories */}
            <div className="px-4 mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Categories
                </h3>
                <Link
                  to="/categories/new"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Add Category"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-1">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 italic px-3 py-2">
                    No categories yet
                  </p>
                ) : (
                  categories.slice(0, 5).map((category) => (
                    <Link
                      key={category.id}
                      to={`/tasks?category=${category.id}`}
                      onClick={onClose}
                      className="flex items-center px-3 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div 
                        className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-gray-700 group-hover:text-gray-900 flex-1 truncate">
                        {category.name}
                      </span>
                    </Link>
                  ))
                )}
                {categories.length > 5 && (
                  <Link
                    to="/categories"
                    onClick={onClose}
                    className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    View all categories
                  </Link>
                )}
              </div>
            </div>

            {/* Completion Rate */}
            <div className="px-4 mt-8 mb-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Progress
              </h3>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Completion Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {taskStats.completionRate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${taskStats.completionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {taskStats.completed} of {taskStats.total} tasks completed
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { Sidebar };