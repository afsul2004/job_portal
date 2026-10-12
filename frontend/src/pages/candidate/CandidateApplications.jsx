import React, { useState, useEffect } from 'react';
import { CandidateSidebar } from './CandidateSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const CandidateApplications = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await api.get('/candidates/applications');
        setApps(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  return (
    <div className="dashboard-layout">
      <CandidateSidebar />
      <div className="main-content">
        <TopBar title="My Job Applications & Status Tracking" />

        <div className="page-wrapper">
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Position</th>
                  <th>Department</th>
                  <th>Application Date</th>
                  <th>Recruitment Status</th>
                  <th>Status Remarks</th>
                </tr>
              </thead>
              <tbody>
                {apps.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No active job applications found. Explore the "Available Job Positions" tab to apply.
                    </td>
                  </tr>
                ) : (
                  apps.map((a) => (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a' }}>{a.job_title}</td>
                      <td>{a.department}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(a.application_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          a.status === 'SELECTED' ? 'badge-success' :
                          a.status === 'SHORTLISTED' ? 'badge-purple' :
                          a.status === 'ELIGIBLE' ? 'badge-primary' :
                          a.status === 'NOT_ELIGIBLE' ? 'badge-danger' :
                          a.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>
                        {a.remarks || 'Application under review.'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
