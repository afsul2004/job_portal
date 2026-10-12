import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Briefcase, FileCheck, Award, UserPlus, 
  LogOut, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const HRSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'HR Dashboard', path: '/hr', icon: <LayoutDashboard size={18} /> },
    { name: 'Candidate Review & Search', path: '/hr/candidates', icon: <Users size={18} /> },
    { name: 'Job Applications Pipeline', path: '/hr/applications', icon: <Briefcase size={18} /> },
    { name: 'Employee Records', path: '/hr/employees', icon: <UserPlus size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge" style={{ background: 'linear-gradient(135deg, #0284c7, #06b6d4)' }}>
          <Briefcase size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>HR Officer Portal</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Talent Acquisition</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/hr'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { backgroundColor: '#0284c7', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' } : {}}
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
