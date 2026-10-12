import React, { useState, useEffect } from 'react';
import { CandidateSidebar } from './CandidateSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Briefcase, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export const CandidateJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resJobs, resApps] = await Promise.all([
        api.get('/jobs'),
        api.get('/candidates/applications')
      ]);
      setJobs(resJobs.data);
      setApplications(resApps.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    try {
      setApplyingId(jobId);
      const res = await api.post(`/candidates/apply/${jobId}`);
      setMsg(res.data.message);
      fetchData();
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      alert('Application error: ' + (err.response?.data?.detail || err.message));
    } finally {
      setApplyingId(null);
    }
  };

  const isApplied = (jobId) => applications.some((a) => a.job_id === jobId);

  return (
    <div className="dashboard-layout">
      <CandidateSidebar />
      <div className="main-content">
        <TopBar title="Available Job Positions & Eligibility Requirements" />

        <div className="page-wrapper">
          {msg && (
            <div style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600 }}>
              {msg}
            </div>
          )}

          {/* Rules Banner from Project Reference Document */}
          <div style={{ background: '#eff6ff', borderRadius: '16px', padding: '20px 24px', border: '1px solid #bfdbfe', marginBottom: '24px' }}>
            <h4 style={{ color: '#1e40af', fontWeight: 700, fontSize: '0.95rem', marginBottom: '8px' }}>
              Project Specification Recruitment Rules
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#1e3a8a', lineHeight: 1.6 }}>
              • <strong>Programmer:</strong> Online Exam Score must be <strong>greater than 8 out of 10</strong> AND academic aggregate must be <strong>&gt; 75%</strong>.<br />
              • <strong>Data Entry Operator:</strong> Online Exam Score must be <strong>between 6 and 8 out of 10</strong> AND academic aggregate must be <strong>&gt; 65%</strong>.<br />
              • Your eligibility status is automatically computed upon exam completion, followed by HR shortlisting.
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {jobs.map((job) => {
              const applied = isApplied(job.id);
              const appInfo = applications.find((a) => a.job_id === job.id);

              return (
                <div key={job.id} style={{ background: 'white', borderRadius: '16px', padding: '24px 28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                  <div style={{ maxWidth: '680px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span className="badge badge-primary">{job.department}</span>
                      <span className="badge badge-purple">{job.openings_count} Openings</span>
                    </div>

                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a' }}>{job.title}</h3>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px', lineHeight: 1.5 }}>
                      {job.description}
                    </p>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '0.825rem', color: '#475569' }}>
                      <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px' }}>
                        Min Academics: <strong>{job.min_academic_percentage}%</strong>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px' }}>
                        Required Exam Score: <strong>{job.min_exam_score} - {job.max_exam_score || 10.0} / 10</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    {applied ? (
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${
                          appInfo?.status === 'ELIGIBLE' ? 'badge-success' :
                          appInfo?.status === 'SELECTED' ? 'badge-success' :
                          appInfo?.status === 'SHORTLISTED' ? 'badge-purple' :
                          appInfo?.status === 'NOT_ELIGIBLE' ? 'badge-danger' : 'badge-primary'
                        }`} style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
                          Status: {appInfo?.status}
                        </span>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
                          Applied on {new Date(appInfo?.application_date).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(job.id)}
                        disabled={applyingId === job.id}
                        className="btn btn-primary"
                        style={{ padding: '12px 24px' }}
                      >
                        {applyingId === job.id ? 'Submitting...' : (
                          <>
                            <span>Apply for Position</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
};
