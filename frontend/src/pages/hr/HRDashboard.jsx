import React, { useState, useEffect } from 'react';
import { HRSidebar } from './HRSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Users, Briefcase, Award, CheckCircle, FileText, ArrowUpRight } from 'lucide-react';

export const HRDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/hr/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="main-content">
        <TopBar title="HR Recruitment Dashboard" />

        <div className="page-wrapper">
          <div style={{ background: 'linear-gradient(135deg, #0369a1, #0284c7)', borderRadius: '16px', padding: '28px 32px', color: 'white', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome, Recruitment Officer</h2>
            <p style={{ color: '#e0f2fe', fontSize: '0.9rem', marginTop: '6px' }}>
              Review candidate qualifications, verify examination scores against Programmer and Data Entry criteria, shortlist candidates, and maintain employee records.
            </p>
          </div>

          <div className="grid-4" style={{ marginBottom: '28px' }}>
            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Total Applicants</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                  {stats?.total_candidates || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                  Registered candidates
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#eff6ff', color: '#0284c7' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Eligible Programmers</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                  {stats?.eligible_programmers || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '4px' }}>
                  Score &gt; 8 &amp; Academics &gt; 75%
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#ecfdf5', color: '#16a34a' }}>
                <Award size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Eligible Data Entry Ops</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                  {stats?.eligible_data_entry_operators || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '4px' }}>
                  Score 6-8 &amp; Academics &gt; 65%
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
                <FileText size={24} />
              </div>
            </div>

            <div className="stat-card">
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active Employee Records</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                  {stats?.total_employees || 0}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6d28d9', marginTop: '4px' }}>
                  Onboarded staff
                </div>
              </div>
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <CheckCircle size={24} />
              </div>
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
              Recruitment Quick Action Links
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Navigate to Candidate Review to filter applicants by academic percentage, examination score, and resume link.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a href="/hr/candidates" className="btn btn-primary">Filter Eligible Candidates</a>
              <a href="/hr/applications" className="btn btn-outline">Review Application Pipeline</a>
              <a href="/hr/employees" className="btn btn-outline">Manage Employee Records</a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
