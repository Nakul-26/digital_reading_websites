import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const GuestRoute: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (authContext === undefined) {
    return null; // Or a loading indicator
  }

  return !authContext.isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

export default GuestRoute;
