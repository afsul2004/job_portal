import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  UserCheck, Briefcase, GraduationCap, FileText, Award, 
  LogOut, LayoutDashboard 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const CandidateSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'My Profile & CV', path: '/candidate', icon: <UserCheck size={18} /> },
    { name: 'Available Job Positions', path: '/candidate/jobs', icon: <Briefcase size={18} /> },
    { name: 'Online Examination', path: '/candidate/exams', icon: <GraduationCap size={18} /> },
    { name: 'My Results & Certificate', path: '/candidate/results', icon: <Award size={18} /> },
    { name: 'My Applications', path: '/candidate/applications', icon: <FileText size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-badge" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
          <GraduationCap size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Candidate Portal</div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Applicant Dashboard</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/candidate'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => isActive ? { backgroundColor: '#059669', boxShadow: '0 4px 12px rgba(5,150,105,0.3)' } : {}}
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
