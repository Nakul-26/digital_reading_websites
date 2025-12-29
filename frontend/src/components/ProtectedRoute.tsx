import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const ProtectedRoute: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (authContext === undefined) {
    return null; // Or a loading indicator
  }

  return authContext.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
