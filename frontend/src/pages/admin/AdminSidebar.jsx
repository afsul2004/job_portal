import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileQuestion, GraduationCap, MapPin, 
  Building, UserCheck, BarChart3, LogOut, Shield 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Candidate Approvals', path: '/admin/candidates', icon: <UserCheck size={18} /> },
    { name: 'Question Bank', path: '/admin/questions', icon: <FileQuestion size={18} /> },
    { name: 'Exam Settings', path: '/admin/exams', icon: <GraduationCap size={18} /> },
    { name: 'Cities & Centres', path: '/admin/centres', icon: <Building size={18} /> },
    { name: 'HR Accounts', path: '/admin/hr-management', icon: <Users size={18} /> },
    { name: 'Exam Results Report', path: '/admin/reports', icon: <BarChart3 size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge">
          <Shield size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Admin Console</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>System Management</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="sidebar-link"
          style={{ width: '100%', color: '#f87171' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
