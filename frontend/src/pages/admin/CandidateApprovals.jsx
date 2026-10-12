import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Check, X, Search, Filter, AlertCircle } from 'lucide-react';

export const CandidateApprovals = () => {
  const [candidates, setCandidates] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users', { params: { role: 'CANDIDATE' } });
      setCandidates(res.data);
    } catch (err) {
      console.error('Failed to load candidate registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      setActionMsg(`Candidate status updated to ${newStatus}`);
      fetchCandidates();
      setTimeout(() => setActionMsg(''), 4000);
    } catch (err) {
      alert('Failed to update candidate status: ' + (err.response?.data?.detail || err.message));
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.status === filter;
    const matchesSearch =
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.profile?.qualification && c.profile.qualification.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Candidate Registrations & Approvals" />

        <div className="page-wrapper">
          {actionMsg && (
            <div style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontWeight: 600, fontSize: '0.9rem' }}>
              {actionMsg}
            </div>
          )}

          {/* Action & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by name, email or degree..."
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilter(st)}
                  className={`btn btn-sm ${filter === st ? 'btn-primary' : 'btn-outline'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Applicant Name</th>
                  <th>Contact Info</th>
                  <th>Qualification & Aggregate</th>
                  <th>Preferred City</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No candidates found matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{c.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #{c.id}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{c.email}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone || 'N/A'}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{c.profile?.qualification || '-'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>
                          Aggregate: {c.profile?.percentage ? `${c.profile.percentage}%` : '-'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>{c.profile?.preferred_city || 'Not specified'}</div>
                        {c.profile?.allocated_centre && (
                          <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Centre: {c.profile.allocated_centre}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${
                          c.status === 'APPROVED' ? 'badge-success' :
                          c.status === 'PENDING' ? 'badge-warning' :
                          c.status === 'REJECTED' ? 'badge-danger' : 'badge-primary'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          {c.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'APPROVED')}
                              className="btn btn-sm"
                              style={{ background: '#dcfce7', color: '#15803d' }}
                              title="Approve registration"
                            >
                              <Check size={14} /> Approve
                            </button>
                          )}
                          {c.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'REJECTED')}
                              className="btn btn-sm"
                              style={{ background: '#fee2e2', color: '#b91c1c' }}
                              title="Reject registration"
                            >
                              <X size={14} /> Reject
                            </button>
                          )}
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
