import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return <Navigate to="/login" />;
  }

  const { user, loading } = authContext;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && user.role === 'admin') {
    return children;
  }

  return <Navigate to="/" />;
};

export default AdminRoute;
