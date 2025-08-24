/**
 * Dashboard Page Component
 * 
 * This component provides the main dashboard interface with task statistics,
 * recent tasks, quick actions, and productivity insights.
 * 
 * Features:
 * - Task statistics cards (total, pending, in progress, completed, overdue)
 * - Recent tasks list with quick actions
 * - Quick action buttons for creating tasks
 * - Productivity charts and completion rate
 * - Category overview with task counts
 * - Responsive grid layout
 * 
 * Usage:
 * - Rendered at / route (home page)
 * - First page users see after login
 * - Provides overview of user's task management status
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Integrates with useTaskStore for data
 * - Follows design system from product requirements
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Users,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useTaskStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { Task, TaskWithCategory } from '@/types';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const {
    tasks,
    categories,
    loading,
    getTaskStats,
    getFilteredTasks,
    fetchTasks,
    fetchCategories,
  } = useTaskStore();

  const taskStats = getTaskStats();
  const recentTasks = tasks.slice(0, 5);

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCategories();
    }
  }, [user, fetchTasks, fetchCategories]);

  /**
   * Get greeting based on time of day
   */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  /**
   * Get user display name
   */
  const getUserDisplayName = () => {
    if (user?.profile?.full_name) {
      return user.profile.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  /**
   * Format task due date
   */
  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-600' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-gray-600' };
    }
  };

  /**
   * Get task status color
   */
  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'in_progress':
        return 'text-blue-600 bg-blue-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  /**
   * Statistics cards configuration
   */
  const statsCards = [
    {
      title: 'Total Tasks',
      value: taskStats.total,
      icon: CheckSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/tasks',
    },
    {
      title: 'Pending',
      value: taskStats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/tasks?status=pending',
    },
    {
      title: 'In Progress',
      value: taskStats.inProgress,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/tasks?status=in_progress',
    },
    {
      title: 'Completed',
      value: taskStats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/tasks?status=completed',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getGreeting()}, {getUserDisplayName()}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's what's happening with your tasks today.
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Link>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.href}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <div className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-lg",
                  card.bgColor
                )}>
                  <Icon className={cn("h-6 w-6", card.color)} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Tasks</h2>
                <Link
                  to="/tasks"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  View all
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No tasks yet</p>
                  <Link
                    to="/tasks/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first task
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => {
                    const dueDate = formatDueDate(task.due_date);
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            task.category?.color ? '' : 'bg-gray-300'
                          )} style={{
                            backgroundColor: task.category?.color || '#D1D5DB'
                          }} />
                          <div>
                            <Link
                              to={`/tasks/${task.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {task.title}
                            </Link>
                            {dueDate && (
                              <p className={cn("text-xs", dueDate.color)}>
                                {dueDate.text}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
                            getTaskStatusColor(task.status)
                          )}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-5">
          {/* Completion Rate */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Progress</h3>
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="#10B981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - taskStats.completionRate / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-gray-900">
                    {taskStats.completionRate}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {taskStats.completed} of {taskStats.total} tasks completed
              </p>
            </div>
          </div>

          {/* Categories Overview */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Categories</h3>
              <Link
                to="/categories"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Manage
              </Link>
            </div>
            {categories.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No categories yet
              </p>
            ) : (
              <div className="space-y-3">
                {categories.slice(0, 4).map((category) => {
                  const categoryTasks = tasks.filter(t => t.category_id === category.id);
                  return (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {categoryTasks.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/tasks/new"
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Link>
              <Link
                to="/tasks?status=pending"
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Clock className="h-4 w-4 mr-2" />
                View Pending
              </Link>
              <Link
                to="/tasks?overdue=true"
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Calendar className="h-4 w-4 mr-2" />
                View Overdue
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;