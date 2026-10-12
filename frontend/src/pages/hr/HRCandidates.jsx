import React, { useState, useEffect } from 'react';
import { HRSidebar } from './HRSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Search, Filter, FileText, CheckCircle, XCircle, Award, ExternalLink } from 'lucide-react';

export const HRCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [qualification, setQualification] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [minScore, setMinScore] = useState('');
  const [roleEligibility, setRoleEligibility] = useState('ALL'); // 'ALL' | 'PROGRAMMER' | 'DEO'

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const params = {};
      if (qualification) params.qualification = qualification;
      if (minPercentage) params.min_percentage = parseFloat(minPercentage);
      if (minScore) params.min_score = parseFloat(minScore);

      const res = await api.get('/hr/candidates', { params });
      setCandidates(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [qualification, minPercentage, minScore]);

  const filtered = candidates.filter((c) => {
    if (roleEligibility === 'PROGRAMMER') {
      return c.eligibility?.['Programmer']?.eligible === true;
    }
    if (roleEligibility === 'DEO') {
      return c.eligibility?.['Data Entry Operator']?.eligible === true;
    }
    return true;
  });

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="main-content">
        <TopBar title="Candidate Search, Filter & Eligibility Review" />

        <div className="page-wrapper">
          {/* Advanced Search & Filtering Bar */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', marginBottom: '28px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="#0284c7" /> Filter Candidates by Qualification, Percentage & Examination Score
            </h4>

            <div className="grid-4" style={{ gap: '16px' }}>
              <div>
                <label className="form-label">Degree / Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech, B.Sc"
                  className="form-control"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Min Academic Aggregate %</label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  className="form-control"
                  value={minPercentage}
                  onChange={(e) => setMinPercentage(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Min Exam Score (out of 10)</label>
                <input
                  type="number"
                  placeholder="e.g. 8"
                  className="form-control"
                  value={minScore}
                  onChange={(e) => setMinScore(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Role Eligibility Target</label>
                <select
                  className="form-control"
                  value={roleEligibility}
                  onChange={(e) => setRoleEligibility(e.target.value)}
                >
                  <option value="ALL">All Candidates</option>
                  <option value="PROGRAMMER">Eligible for Programmer (&gt;8 score &amp; &gt;75%)</option>
                  <option value="DEO">Eligible for Data Entry (6-8 score &amp; &gt;65%)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Candidates List */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Candidate Profile</th>
                  <th>Academics & Year</th>
                  <th>Exam Performance</th>
                  <th>Job Eligibility Decisions</th>
                  <th>CV / Resume</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No candidate records found matching these criteria.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.candidate_id}>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{c.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{c.phone || '-'}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{c.qualification} ({c.stream || 'Gen'})</div>
                        <div style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700 }}>
                          {c.academic_percentage}% Aggregate
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Class of {c.passing_year}</div>
                      </td>

                      <td>
                        {c.latest_exam_score !== null ? (
                          <div>
                            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: c.latest_exam_score >= 8 ? '#16a34a' : c.latest_exam_score >= 6 ? '#2563eb' : '#dc2626' }}>
                              {c.latest_exam_score} / 10
                            </span>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                              ({c.latest_exam_percentage?.toFixed(1)}%)
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                              {c.latest_exam_title}
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Test Pending</span>
                        )}
                      </td>

                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {c.eligibility?.['Programmer'] && (
                            <div style={{ fontSize: '0.775rem' }}>
                              <span style={{ fontWeight: 600 }}>Programmer: </span>
                              <span className={`badge ${c.eligibility['Programmer'].eligible ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                {c.eligibility['Programmer'].eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                              </span>
                            </div>
                          )}
                          {c.eligibility?.['Data Entry Operator'] && (
                            <div style={{ fontSize: '0.775rem' }}>
                              <span style={{ fontWeight: 600 }}>Data Entry: </span>
                              <span className={`badge ${c.eligibility['Data Entry Operator'].eligible ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                                {c.eligibility['Data Entry Operator'].eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                              </span>
                            </div>
                          )}
                          {Object.keys(c.eligibility || {}).length === 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Not evaluated yet</span>
                          )}
                        </div>
                      </td>

                      <td>
                        {c.resume_path ? (
                          <a
                            href={`http://localhost:8000${c.resume_path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          >
                            <FileText size={14} color="#2563eb" /> View PDF
                          </a>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>No CV attached</span>
                        )}
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
