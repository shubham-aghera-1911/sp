import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Menu,
  Home,
  CheckSquare,
  BookOpen,
  Calendar,
  Users,
  FileText,
  Settings,
  Clock,
  PieChart,
  Bell,
  X,
} from 'lucide-react';
import '../styles/sidebar.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/assignments', icon: CheckSquare, label: 'Assignments' },
    { path: '/exams', icon: BookOpen, label: 'Exams' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/timetable', icon: Clock, label: 'Timetable' },
    { path: '/projects', icon: Users, label: 'Projects' },
    { path: '/study-timer', icon: Clock, label: 'Study Timer' },
    { path: '/gpa-calculator', icon: PieChart, label: 'GPA Calculator' },
    { path: '/ai-planner', icon: BookOpen, label: 'AI Planner' },
  ];

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">StudyOS</h1>
        <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className="nav-item">
              <Icon size={20} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link to="/settings" className="nav-item">
          <Settings size={20} />
          {isOpen && <span>Settings</span>}
        </Link>
      </div>
    </div>
  );
}
