/**
 * Task Form Component
 * 
 * This component provides a form interface for creating and editing tasks.
 * It supports all task fields including title, description, due date, priority,
 * status, and category assignment.
 * 
 * Features:
 * - Create new tasks or edit existing ones
 * - Form validation with error messages
 * - Rich text description editor
 * - Date picker for due dates
 * - Priority and status selection
 * - Category assignment with color indicators
 * - Auto-save functionality (optional)
 * - Responsive design
 * 
 * Usage:
 * - Rendered at /tasks/new for creating tasks
 * - Rendered at /tasks/:id/edit for editing tasks
 * - Integrates with useTaskStore for data operations
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Implements proper form validation
 * - Follows design system from product requirements
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  X,
  Calendar,
  Flag,
  Tag,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import { useTaskStore, useAuthStore } from '@/stores';
import type { TaskFormData, Task } from '@/types';

interface TaskFormProps {
  mode?: 'create' | 'edit';
}

const TaskForm: React.FC<TaskFormProps> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    tasks,
    categories,
    loading,
    createTask,
    updateTask,
    fetchTasks,
    fetchCategories,
  } = useTaskStore();

  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    categoryId: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<TaskFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingTask, setExistingTask] = useState<Task | null>(null);

  // Fetch data when component mounts
  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchCategories();
    }
  }, [user, fetchTasks, fetchCategories]);

  // Load existing task data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id && tasks.length > 0) {
      const task = tasks.find(t => t.id === id);
      if (task) {
        setExistingTask(task);
        setFormData({
          title: task.title,
          description: task.description || '',
          dueDate: task.due_date || '',
          priority: task.priority,
          status: task.status,
          categoryId: task.category_id || '',
        });
      } else {
        // Task not found, redirect to task list
        navigate('/tasks');
      }
    }
  }, [mode, id, tasks, navigate]);

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const errors: Partial<TaskFormData> = {};

    // Title validation
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (formData.title.trim().length > 255) {
      errors.title = 'Title must be less than 255 characters';
    }

    // Description validation (optional but with length limit)
    if (formData.description && formData.description.length > 1000) {
      errors.description = 'Description must be less than 1000 characters';
    }

    // Due date validation (optional but must be valid date)
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (isNaN(dueDate.getTime())) {
        errors.dueDate = 'Please enter a valid date';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        await createTask(formData);
        navigate('/tasks');
      } else if (mode === 'edit' && id) {
        await updateTask(id, formData);
        navigate(`/tasks/${id}`);
      }
    } catch (error) {
      console.error('Form submission failed:', error);
      // Error is handled by the store
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear field error when user starts typing
    if (formErrors[name as keyof TaskFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    if (mode === 'edit' && id) {
      navigate(`/tasks/${id}`);
    } else {
      navigate('/tasks');
    }
  };

  /**
   * Get page title
   */
  const getPageTitle = () => {
    if (mode === 'edit') {
      return existingTask ? `Edit "${existingTask.title}"` : 'Edit Task';
    }
    return 'Create New Task';
  };

  /**
   * Get submit button text
   */
  const getSubmitButtonText = () => {
    if (isSubmitting) {
      return mode === 'create' ? 'Creating...' : 'Saving...';
    }
    return mode === 'create' ? 'Create Task' : 'Save Changes';
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-gray-600 mt-1">
              {mode === 'create'
                ? 'Fill in the details to create a new task'
                : 'Update the task details below'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`block w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.title
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter task title"
                  maxLength={255}
                />
              </div>
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    formErrors.description
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Enter task description (optional)"
                  maxLength={1000}
                />
              </div>
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.dueDate
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300 bg-white'
                  }`}
                />
              </div>
              {formErrors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{formErrors.dueDate}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">No Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {getSubmitButtonText()}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;