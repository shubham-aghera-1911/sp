import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <h2>Welcome, {user?.name}!</h2>
      </div>

      <div className="header-right">
        <button className="header-btn notification-btn">
          <Bell size={20} />
        </button>

        <button className="header-btn settings-btn" onClick={() => navigate('/settings')}>
          <Settings size={20} />
        </button>

        <button className="header-btn logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}
