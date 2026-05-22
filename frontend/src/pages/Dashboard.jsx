import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { StudentDashboard } from './StudentDashboard';
import { EmployeeDashboard } from './EmployeeDashboard';

export const Dashboard = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500">Checking credentials...</p>
      </div>
    );
  }

  // Redirect to login if user session is not found
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Segment user experience by role type
  if (user.role === 'employee') {
    return <EmployeeDashboard />;
  }

  return <StudentDashboard />;
};
