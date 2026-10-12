import React, { useState, useEffect } from 'react';
import { HRSidebar } from './HRSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Check, X, FileText, UserCheck, AlertCircle, Award } from 'lucide-react';

export const HRApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchApps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hr/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/hr/applications/${appId}/status`, {
        status: newStatus,
        remarks: `Updated by Recruitment Officer to ${newStatus}`
      });
      setStatusMsg(`Application #${appId} updated to ${newStatus}`);
      fetchApps();
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="main-content">
        <TopBar title="Recruitment Applications Pipeline & Decision Review" />

        <div className="page-wrapper">
          {statusMsg && (
            <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600 }}>
              {statusMsg}
            </div>
          )}

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Applied Position</th>
                  <th>Academics & Score</th>
                  <th>System Eligibility</th>
                  <th>Current Status</th>
                  <th style={{ textAlign: 'right' }}>HR Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No candidate applications in the pipeline.
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{app.candidate_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{app.candidate_email}</div>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: '#1e40af' }}>{app.job_title}</span>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{app.academic_percentage}% Academics</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2563eb' }}>
                          Score: {app.exam_score !== null ? `${app.exam_score}/10` : 'Not Taken'}
                        </div>
                      </td>

                      <td>
                        {app.is_eligible !== null ? (
                          <span className={`badge ${app.is_eligible ? 'badge-success' : 'badge-danger'}`}>
                            {app.is_eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                          </span>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending Exam</span>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${
                          app.status === 'SELECTED' ? 'badge-success' :
                          app.status === 'SHORTLISTED' ? 'badge-purple' :
                          app.status === 'REJECTED' ? 'badge-danger' : 'badge-primary'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                            className="btn btn-sm"
                            style={{ background: '#f3e8ff', color: '#7e22ce' }}
                            title="Shortlist Candidate"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'SELECTED')}
                            className="btn btn-sm"
                            style={{ background: '#dcfce7', color: '#15803d' }}
                            title="Final Selection"
                          >
                            Select
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'REJECTED')}
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#b91c1c' }}
                            title="Reject Candidate"
                          >
                            Reject
                          </button>
                        </div>
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
