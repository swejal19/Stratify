import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../ui/Loader';

export const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && profile?.role !== allowedRole) {
    // Redirect to the correct dashboard based on their role
    switch (profile?.role) {
      case 'employee':
        return <Navigate to="/employee" replace />;
      case 'manager':
        return <Navigate to="/manager" replace />;
      case 'admin':
        return <Navigate to="/admin" replace />;
      default:
        // Fallback if role is missing or invalid
        return <Navigate to="/login" replace />;
    }
  }

  return children;
};
