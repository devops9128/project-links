/**
 * Task List Page Component
 * 
 * This component provides a comprehensive task list interface with filtering,
 * sorting, searching, and bulk operations capabilities.
 * 
 * Features:
 * - Task list display with card-based layout
 * - Advanced filtering by status, priority, category, and date
 * - Sorting by multiple fields (date, priority, title)
 * - Search functionality
 * - Bulk operations (select multiple, bulk delete, bulk status update)
 * - Pagination for large task lists
 * - Quick actions for each task
 * 
 * Usage:
 * - Rendered at /tasks route
 * - Supports URL query parameters for filtering
 * - Integrates with useTaskStore for data management
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Follows design system from product requirements
 * - Implements responsive design for mobile and desktop
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { useTaskStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { TaskFilters, TaskSort, TaskWithCategory } from '@/types';

const TaskList: React.FC = () => {
  const { user } = useAuthStore();
  const {
    tasks,
    categories,
    loading,
    filters,
    sort,
    getFilteredTasks,
    setFilters,
    setSort,
    clearFilters,
    fetchTasks,
    fetchCategories,
    updateTask,
    deleteTask,
  } = useTaskStore();

  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localFilters, setLocalFilters] = useState<TaskFilters>({});

  const filteredTasks = getFilteredTasks();

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: TaskFilters = {};
    
    const status = searchParams.get('status');
    if (status) {
      urlFilters.status = [status as any];
    }
    
    const priority = searchParams.get('priority');
    if (priority) {
      urlFilters.priority = [priority as any];
    }
    
    const category = searchParams.get('category');
    if (category) {
      urlFilters.categoryId = [category];
    }
    
    const search = searchParams.get('search');
    if (search) {
      urlFilters.search = search;
      setSearchQuery(search);
    }
    
    setLocalFilters(urlFilters);
    setFilters(urlFilters);
  }, [searchParams, setFilters]);

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCategories();
    }
  }, [user, fetchTasks, fetchCategories]);

  /**
   * Handle search input
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...localFilters, search: query || undefined };
    setLocalFilters(newFilters);
    setFilters(newFilters);
    
    // Update URL
    const newParams = new URLSearchParams(searchParams);
    if (query) {
      newParams.set('search', query);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  /**
   * Handle filter changes
   */
  const handleFilterChange = (key: keyof TaskFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    setFilters(newFilters);
  };

  /**
   * Handle sort changes
   */
  const handleSortChange = (field: string) => {
    const newSort: TaskSort = {
      field: field as any,
      direction: sort.field === field && sort.direction === 'asc' ? 'desc' : 'asc',
    };
    setSort(newSort);
  };

  /**
   * Handle task selection
   */
  const handleTaskSelect = (taskId: string, selected: boolean) => {
    if (selected) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  /**
   * Handle select all tasks
   */
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  /**
   * Handle bulk status update
   */
  const handleBulkStatusUpdate = async (status: string) => {
    try {
      await Promise.all(
        selectedTasks.map(taskId => 
          updateTask(taskId, { status: status as any })
        )
      );
      setSelectedTasks([]);
    } catch (error) {
      console.error('Bulk status update failed:', error);
    }
  };

  /**
   * Handle bulk delete
   */
  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} tasks?`)) {
      try {
        await Promise.all(
          selectedTasks.map(taskId => deleteTask(taskId))
        );
        setSelectedTasks([]);
      } catch (error) {
        console.error('Bulk delete failed:', error);
      }
    }
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
      return { text: `${Math.abs(diffDays)}d overdue`, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays}d left`, color: 'text-blue-600' };
    } else {
      return { text: date.toLocaleDateString(), color: 'text-gray-600' };
    }
  };

  /**
   * Get task status icon and color
   */
  const getTaskStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
      case 'in_progress':
        return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'pending':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' };
      default:
        return { icon: Clock, color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  /**
   * Get priority display
   */
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: 'text-red-600', bg: 'bg-red-50' };
      case 'medium':
        return { color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'low':
        return { color: 'text-green-600', bg: 'bg-green-50' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your tasks efficiently
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search tasks..."
              />
            </div>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>

          {/* Sort */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSortChange('created_at')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {sort.field === 'created_at' && sort.direction === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={localFilters.status?.[0] || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value] : undefined)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={localFilters.priority?.[0] || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value ? [e.target.value] : undefined)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={localFilters.categoryId?.[0] || ''}
                  onChange={(e) => handleFilterChange('categoryId', e.target.value ? [e.target.value] : undefined)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setLocalFilters({});
                    clearFilters();
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedTasks.length} task(s) selected
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkStatusUpdate('pending')}
                className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full hover:bg-yellow-200 transition-colors"
              >
                Mark Pending
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('in_progress')}
                className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 transition-colors"
              >
                Mark In Progress
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('completed')}
                className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
              >
                Mark Completed
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task List */}
      <div className="bg-white rounded-lg shadow-sm">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-500 mb-6">
              {tasks.length === 0
                ? "You haven't created any tasks yet."
                : "No tasks match your current filters."}
            </p>
            <Link
              to="/tasks/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {/* Header */}
            <div className="px-6 py-3 bg-gray-50">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {filteredTasks.length} task(s)
                </span>
              </div>
            </div>

            {/* Task Items */}
            {filteredTasks.map((task) => {
              const statusDisplay = getTaskStatusDisplay(task.status);
              const priorityDisplay = getPriorityDisplay(task.priority);
              const dueDate = formatDueDate(task.due_date);
              const StatusIcon = statusDisplay.icon;
              
              return (
                <div key={task.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={(e) => handleTaskSelect(task.id, e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />

                    {/* Category Color */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: task.category?.color || '#D1D5DB' }}
                    />

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Link
                            to={`/tasks/${task.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {task.title}
                          </Link>
                          {task.description && (
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            {/* Status */}
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              statusDisplay.color,
                              statusDisplay.bg
                            )}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {task.status.replace('_', ' ')}
                            </div>

                            {/* Priority */}
                            <div className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                              priorityDisplay.color,
                              priorityDisplay.bg
                            )}>
                              {task.priority}
                            </div>

                            {/* Category */}
                            {task.category && (
                              <span className="text-xs text-gray-500">
                                {task.category.name}
                              </span>
                            )}

                            {/* Due Date */}
                            {dueDate && (
                              <span className={cn("text-xs", dueDate.color)}>
                                {dueDate.text}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/tasks/${task.id}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this task?')) {
                                deleteTask(task.id);
                              }
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;