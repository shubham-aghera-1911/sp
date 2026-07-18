import React from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/layout.css';

export default function Layout({ children }) {
  const { user } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content-area">{children}</div>
      </div>
    </div>
  );
}
