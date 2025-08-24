/**
 * Task Detail Component
 * 
 * This component provides a detailed view of a single task with all its information
 * and quick action buttons for editing, status updates, and deletion.
 * 
 * Features:
 * - Complete task information display
 * - Status and priority indicators with colors
 * - Category information with color coding
 * - Due date with overdue warnings
 * - Quick action buttons (edit, delete, status change)
 * - Task description with proper formatting
 * - Breadcrumb navigation
 * - Responsive design
 * 
 * Usage:
 * - Rendered at /tasks/:id route
 * - Displays task details and provides action buttons
 * - Integrates with useTaskStore for data operations
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Implements proper loading and error states
 * - Follows design system from product requirements
 */

import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Flag,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Copy,
} from 'lucide-react';
import { useTaskStore, useAuthStore } from '@/stores';
import { cn } from '@/lib/utils';
import type { Task, TaskWithCategory } from '@/types';

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    tasks,
    loading,
    updateTask,
    deleteTask,
    fetchTasks,
  } = useTaskStore();

  const [task, setTask] = useState<TaskWithCategory | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Find the task from the store
  useEffect(() => {
    if (tasks.length > 0 && id) {
      const foundTask = tasks.find(t => t.id === id);
      if (foundTask) {
        setTask(foundTask);
      } else {
        // Task not found, redirect to task list
        navigate('/tasks');
      }
    }
  }, [tasks, id, navigate]);

  // Fetch tasks when component mounts
  useEffect(() => {
    if (user && tasks.length === 0) {
      fetchTasks();
    }
  }, [user, tasks.length, fetchTasks]);

  /**
   * Handle status update
   */
  const handleStatusUpdate = async (newStatus: string) => {
    if (!task) return;

    setIsUpdating(true);
    try {
      await updateTask(task.id, { status: newStatus as any });
      // Task will be updated in the store automatically
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Handle task deletion
   */
  const handleDelete = async () => {
    if (!task) return;

    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTask(task.id);
        navigate('/tasks');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  /**
   * Handle task duplication
   */
  const handleDuplicate = () => {
    if (!task) return;
    
    // Navigate to create form with pre-filled data
    const params = new URLSearchParams({
      title: `${task.title} (Copy)`,
      description: task.description || '',
      priority: task.priority,
      categoryId: task.category_id || '',
    });
    
    navigate(`/tasks/new?${params.toString()}`);
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
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    if (diffDays < 0) {
      return {
        text: formattedDate,
        status: `${Math.abs(diffDays)} days overdue`,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    } else if (diffDays === 0) {
      return {
        text: formattedDate,
        status: 'Due today',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    } else if (diffDays === 1) {
      return {
        text: formattedDate,
        status: 'Due tomorrow',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
      };
    } else if (diffDays <= 7) {
      return {
        text: formattedDate,
        status: `Due in ${diffDays} days`,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
      };
    } else {
      return {
        text: formattedDate,
        status: `Due in ${diffDays} days`,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
    }
  };

  /**
   * Get task status display
   */
  const getTaskStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Completed',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'in_progress':
        return {
          icon: AlertCircle,
          label: 'In Progress',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      default:
        return {
          icon: Clock,
          label: 'Unknown',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  /**
   * Get priority display
   */
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          label: 'High Priority',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'medium':
        return {
          label: 'Medium Priority',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'low':
        return {
          label: 'Low Priority',
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      default:
        return {
          label: 'Unknown Priority',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  if (loading || !task) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statusDisplay = getTaskStatusDisplay(task.status);
  const priorityDisplay = getPriorityDisplay(task.priority);
  const dueDate = formatDueDate(task.due_date);
  const StatusIcon = statusDisplay.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to="/tasks"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  <li>
                    <Link to="/tasks" className="text-sm text-gray-500 hover:text-gray-700">
                      Tasks
                    </Link>
                  </li>
                  <li>
                    <span className="text-sm text-gray-400">/</span>
                  </li>
                  <li>
                    <span className="text-sm text-gray-900 font-medium">
                      {task.title}
                    </span>
                  </li>
                </ol>
              </nav>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Link
              to={`/tasks/${task.id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              
              {showActions && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1">
                    <button
                      onClick={handleDuplicate}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleDelete}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Title and Description */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {task.title}
            </h1>
            
            {task.description ? (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 italic">
                No description provided
              </p>
            )}
          </div>

          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="flex flex-wrap gap-2">
              {task.status !== 'pending' && (
                <button
                  onClick={() => handleStatusUpdate('pending')}
                  disabled={isUpdating}
                  className="inline-flex items-center px-3 py-2 border border-yellow-300 rounded-lg text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-50 transition-colors"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Mark Pending
                </button>
              )}
              {task.status !== 'in_progress' && (
                <button
                  onClick={() => handleStatusUpdate('in_progress')}
                  disabled={isUpdating}
                  className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 transition-colors"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Mark In Progress
                </button>
              )}
              {task.status !== 'completed' && (
                <button
                  onClick={() => handleStatusUpdate('completed')}
                  disabled={isUpdating}
                  className="inline-flex items-center px-3 py-2 border border-green-300 rounded-lg text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 disabled:opacity-50 transition-colors"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Status
            </h3>
            <div className={cn(
              "inline-flex items-center px-3 py-2 rounded-lg border",
              statusDisplay.color,
              statusDisplay.bgColor,
              statusDisplay.borderColor
            )}>
              <StatusIcon className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {statusDisplay.label}
              </span>
            </div>
          </div>

          {/* Priority */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Priority
            </h3>
            <div className={cn(
              "inline-flex items-center px-3 py-2 rounded-lg border",
              priorityDisplay.color,
              priorityDisplay.bgColor,
              priorityDisplay.borderColor
            )}>
              <Flag className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">
                {priorityDisplay.label}
              </span>
            </div>
          </div>

          {/* Due Date */}
          {dueDate && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Due Date
              </h3>
              <div className={cn(
                "p-3 rounded-lg border",
                dueDate.bgColor,
                dueDate.borderColor
              )}>
                <div className="flex items-center mb-2">
                  <Calendar className={cn("h-4 w-4 mr-2", dueDate.color)} />
                  <span className={cn("text-sm font-medium", dueDate.color)}>
                    {dueDate.status}
                  </span>
                </div>
                <p className="text-sm text-gray-700">
                  {dueDate.text}
                </p>
              </div>
            </div>
          )}

          {/* Category */}
          {task.category && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Category
              </h3>
              <div className="flex items-center">
                <div
                  className="w-4 h-4 rounded-full mr-3"
                  style={{ backgroundColor: task.category.color }}
                />
                <span className="text-sm font-medium text-gray-900">
                  {task.category.name}
                </span>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Timestamps
            </h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm text-gray-900">
                  {new Date(task.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Updated</p>
                <p className="text-sm text-gray-900">
                  {new Date(task.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close actions dropdown */}
      {showActions && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default TaskDetail;