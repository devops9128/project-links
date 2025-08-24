/**
 * Home Page Component
 * 
 * This component serves as the main entry point for authenticated users.
 * It renders the Dashboard component which provides task overview and statistics.
 * 
 * Usage:
 * - Rendered at / route for authenticated users
 * - Redirects to login if user is not authenticated
 * - Provides comprehensive task management dashboard
 * 
 * Note:
 * - Uses Dashboard component for main functionality
 * - Integrates with authentication and task stores
 * - Follows responsive design principles
 */

import React from 'react';
import { Dashboard } from './dashboard';

const Home: React.FC = () => {
  return <Dashboard />;
};

export default Home;