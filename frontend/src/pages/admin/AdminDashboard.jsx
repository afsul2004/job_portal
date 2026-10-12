import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { 
  Users, UserCheck, GraduationCap, CheckCircle, Award, 
  MapPin, Clock, ArrowUpRight 
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Administrator Dashboard" />

        <div className="page-wrapper">
          {/* Welcome Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', borderRadius: '16px', padding: '28px 32px', color: 'white', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome, Administrator</h2>
              <p style={{ color: '#bfdbfe', fontSize: '0.9rem', marginTop: '6px' }}>
                Full control over user approvals, question banks, online examinations, testing centres, and reports.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats?.total_candidates || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#e0f2fe' }}>Total Applicants</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px 18px', borderRadius: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{stats?.completed_exams || 0}</div>
                <div style={{ fontSize: '0.75rem', color: '#e0f2fe' }}>Completed Tests</div>
              </div>
            </div>
          </div>

          {/* Key Metric Cards */}
          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Registered Users</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {stats?.total_users || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ArrowUpRight size={14} /> Candidates, HR & Admins
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Pending Approvals</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>
                  {stats?.pending_approvals || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                  Awaiting profile review
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <UserCheck size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Available Online Exams</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {stats?.total_exams || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  {stats?.total_questions || 0} active questions
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <GraduationCap size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Selected Candidates</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                  {stats?.selected_candidates || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px' }}>
                  {stats?.shortlisted_candidates || 0} shortlisted
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>
                <Award size={24} />
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Cities/Centres Overview & Recent Audit Activities */}
          <div className="grid-2">
            {/* Quick Status */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
                Testing Infrastructure Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>Registered Exam Cities</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{stats?.total_cities || 0} Cities</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>Active Assessment Centres</span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>{stats?.total_centres || 0} Centres</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.9rem', color: '#475569' }}>Total Job Applications</span>
                  <span style={{ fontWeight: 700, color: '#2563eb' }}>{stats?.total_applications || 0} Applications</span>
                </div>
              </div>
            </div>

            {/* Recent Audit Activities */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: '#1e293b' }}>
                Recent System Activities
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats?.recent_activities?.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No recent audit events.</p>
                ) : (
                  stats?.recent_activities?.map((act) => (
                    <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563eb', marginTop: '6px' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1e293b' }}>{act.action}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{act.details}</div>
                        <div style={{ fontSize: '0.725rem', color: '#94a3b8', marginTop: '2px' }}>
                          {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
