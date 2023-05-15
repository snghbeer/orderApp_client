import React from 'react';
import { Route, RouteProps, Redirect, } from 'react-router-dom';
import { UserObject, UserPrivileges } from '../components/interfaces/interfaces';
import { MySQLiteDBConnection } from '../components/interfaces/controllers/Database';

interface ProtectedRouteProps extends RouteProps {
  component: React.FC<any>;
  isAuthenticated: boolean;
  storage?: MySQLiteDBConnection | null |undefined;
}

interface AdminRouteProps extends RouteProps {
  component: React.FC<any>;
  user?: UserObject
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ component: Component, isAuthenticated, ...rest }) => (
  <Route {...rest} render={(props) => (
    isAuthenticated ? <Component {...props} /> : <Redirect to="/" />
  )} />
);

export const AdminRoute: React.FC<AdminRouteProps> = ({ component: Component, user, ...rest }) => {
  const isAdmin = user && (user.role === UserPrivileges.Admin || user.role === UserPrivileges.Manager);

  return(
  <Route {...rest} render={(props) => (
    isAdmin ? <Component {...props} /> : <Redirect to="/menu" />
  )} />)
  };
