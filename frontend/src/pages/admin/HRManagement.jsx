import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Users, Plus, ShieldCheck, Mail, Phone, X } from 'lucide-react';

export const HRManagement = () => {
  const [hrAccounts, setHrAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    employee_code: '',
    department: 'Human Resources',
    designation: 'Recruitment Officer'
  });

  const fetchHRs = async () => {
    try {
      const res = await api.get('/admin/hr-accounts');
      setHrAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHRs();
  }, []);

  const handleCreateHR = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/hr-accounts', form);
      setShowModal(false);
      setForm({
        full_name: '',
        email: '',
        password: '',
        phone: '',
        employee_code: '',
        department: 'Human Resources',
        designation: 'Recruitment Officer'
      });
      fetchHRs();
    } catch (err) {
      alert('Failed to provision HR account: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="HR & Recruitment Officers Management" />

        <div className="page-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Create and manage authorized HR recruitment accounts for candidate shortlisting, resume review, and onboarding.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={18} /> Provision New HR Account
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>HR Officer Name</th>
                  <th>Employee Code</th>
                  <th>Department & Designation</th>
                  <th>Email & Phone</th>
                  <th>Account Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {hrAccounts.map((hr) => (
                  <tr key={hr.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0f172a' }}>{hr.full_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>User ID: #{hr.id}</div>
                    </td>
                    <td>
                      <span className="badge badge-purple">{hr.employee_code}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{hr.designation}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{hr.department}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>{hr.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{hr.phone || '-'}</div>
                    </td>
                    <td>
                      <span className="badge badge-success">{hr.status}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                      {new Date(hr.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Provision HR Account</h3>
                  <button onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>
                <form onSubmit={handleCreateHR}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Sarah Jenkins"
                        value={form.full_name}
                        onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Employee Code *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. HR-2026-002"
                        value={form.employee_code}
                        onChange={(e) => setForm({ ...form, employee_code: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Official Email *</label>
                      <input
                        type="email"
                        required
                        className="form-control"
                        placeholder="hr@jobportal.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Initial Password *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        className="form-control"
                        placeholder="At least 6 chars"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Designation</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Department</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create HR Account</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
