/**
 * Profile Page Component
 * 
 * This component provides a user interface for managing user profile information,
 * account settings, and preferences.
 * 
 * Features:
 * - User profile information editing (name, email)
 * - Password change functionality
 * - Account preferences and settings
 * - Avatar upload (optional)
 * - Account deletion with confirmation
 * - Data export functionality
 * - Notification preferences
 * 
 * Usage:
 * - Rendered at /profile route
 * - Allows users to manage their account information
 * - Integrates with useAuthStore for profile updates
 * 
 * Note:
 * - Uses Tailwind CSS for styling
 * - Implements proper form validation
 * - Follows design system from product requirements
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Save,
  Camera,
  Download,
  Trash2,
  Bell,
  Shield,
  Settings,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore, useTaskStore } from '@/stores';
import type { ProfileFormData } from '@/types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile, signOut, loading } = useAuthStore();
  const { tasks } = useTaskStore();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences' | 'account'>('profile');
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [formErrors, setFormErrors] = useState<Partial<ProfileFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    darkMode: false,
  });

  // Initialize form data with user information
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.profile?.full_name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Load preferences from user profile
      if (user.profile?.preferences) {
        setPreferences({
          emailNotifications: user.profile.preferences.emailNotifications ?? true,
          taskReminders: user.profile.preferences.taskReminders ?? true,
          weeklyDigest: user.profile.preferences.weeklyDigest ?? false,
          darkMode: user.profile.preferences.darkMode ?? false,
        });
      }
    }
  }, [user]);

  /**
   * Validate profile form
   */
  const validateProfileForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Validate password form
   */
  const validatePasswordForm = (): boolean => {
    const errors: Partial<ProfileFormData> = {};
    
    // Current password validation
    if (!formData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }
    
    // New password validation
    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'New password must be at least 6 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle profile update
   */
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        full_name: formData.fullName,
      });
      
      // Show success message (you could add a toast notification here)
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update failed:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle password change
   */
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Note: Password change would typically require Supabase auth update
      // This is a simplified implementation
      alert('Password change functionality would be implemented here');
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      console.error('Password change failed:', error);
      alert('Failed to change password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle preferences update
   */
  const handlePreferencesUpdate = async () => {
    setIsSubmitting(true);
    
    try {
      await updateProfile({
        preferences: {
          ...user?.profile?.preferences,
          ...preferences,
        },
      });
      
      alert('Preferences updated successfully!');
    } catch (error) {
      console.error('Preferences update failed:', error);
      alert('Failed to update preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle data export
   */
  const handleDataExport = () => {
    const userData = {
      profile: user?.profile,
      tasks: tasks,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `project-links-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  };

  /**
   * Handle account deletion
   */
  const handleAccountDeletion = async () => {
    const confirmation = window.prompt(
      'Are you sure you want to delete your account? This action cannot be undone.\n\nType "DELETE" to confirm:'
    );
    
    if (confirmation === 'DELETE') {
      try {
        // Note: Account deletion would require backend implementation
        alert('Account deletion functionality would be implemented here');
        // await deleteAccount();
        // navigate('/login');
      } catch (error) {
        console.error('Account deletion failed:', error);
        alert('Failed to delete account. Please try again.');
      }
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof ProfileFormData]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  /**
   * Handle preference changes
   */
  const handlePreferenceChange = (key: string, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Get user initials for avatar
   */
  const getUserInitials = () => {
    const name = user?.profile?.full_name || user?.email || 'User';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'account', label: 'Account', icon: Trash2 },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Profile Information</h2>
              
              {/* Avatar Section */}
              <div className="flex items-center space-x-6 mb-6">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-medium">
                    {user?.profile?.avatar_url ? (
                      <img
                        className="h-20 w-20 rounded-full"
                        src={user.profile.avatar_url}
                        alt="Profile"
                      />
                    ) : (
                      getUserInitials()
                    )}
                  </div>
                  <button className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors">
                    <Camera className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Profile Photo</h3>
                  <p className="text-sm text-gray-500">Update your profile photo</p>
                </div>
              </div>
              
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.fullName
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Email address cannot be changed
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h2>
              
              <form onSubmit={handlePasswordChange} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.currentPassword
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.currentPassword}</p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.newPassword
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.newPassword}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        formErrors.confirmPassword
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300 bg-white'
                      }`}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Lock className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Preferences</h2>
              
              <div className="space-y-6">
                {/* Notification Preferences */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                        <p className="text-sm text-gray-500">Receive email updates about your tasks</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.emailNotifications}
                        onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Task Reminders</p>
                        <p className="text-sm text-gray-500">Get reminded about upcoming due dates</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.taskReminders}
                        onChange={(e) => handlePreferenceChange('taskReminders', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Weekly Digest</p>
                        <p className="text-sm text-gray-500">Receive a weekly summary of your productivity</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.weeklyDigest}
                        onChange={(e) => handlePreferenceChange('weeklyDigest', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Appearance Preferences */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Appearance</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Dark Mode</p>
                        <p className="text-sm text-gray-500">Use dark theme for the interface</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.darkMode}
                        onChange={(e) => handlePreferenceChange('darkMode', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Preferences */}
                <div className="pt-4">
                  <button
                    onClick={handlePreferencesUpdate}
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSubmitting ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Account Management</h2>
              
              <div className="space-y-6">
                {/* Data Export */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Export Data</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Download all your data including tasks and profile information
                      </p>
                    </div>
                    <button
                      onClick={handleDataExport}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Account Statistics */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
                      <p className="text-sm text-gray-500">Total Tasks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {user?.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                      </p>
                      <p className="text-sm text-gray-500">Days Active</p>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                  <h3 className="text-sm font-medium text-red-900 mb-2">Danger Zone</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleAccountDeletion}
                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;