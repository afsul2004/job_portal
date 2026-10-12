import React, { useState, useEffect } from 'react';
import { HRSidebar } from './HRSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Plus, Edit2, UserCheck, X } from 'lucide-react';

export const HREmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  const [form, setForm] = useState({
    user_id: '',
    employee_id_number: '',
    designation: 'Junior Programmer',
    department: 'Software Engineering',
    joining_date: new Date().toISOString().split('T')[0],
    salary: 50000.0,
    employment_status: 'PROBATION'
  });

  const fetchData = async () => {
    try {
      const [resEmp, resCand] = await Promise.all([
        api.get('/hr/employees'),
        api.get('/hr/candidates')
      ]);
      setEmployees(resEmp.data);
      setCandidates(resCand.data);
      if (resCand.data.length > 0) {
        setForm((prev) => ({ ...prev, user_id: resCand.data[0].candidate_id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/hr/employees', {
        ...form,
        user_id: parseInt(form.user_id),
        salary: parseFloat(form.salary)
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating employee record: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="dashboard-layout">
      <HRSidebar />
      <div className="main-content">
        <TopBar title="Onboarded Employee Records & Staff Directory" />

        <div className="page-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Final selected candidates converted to official employee records upon recruitment approval.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={18} /> Onboard New Employee Record
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Employee Code</th>
                  <th>Employee Name</th>
                  <th>Designation & Dept</th>
                  <th>Contact Email</th>
                  <th>Date of Joining</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No onboarded employees currently recorded.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        <span className="badge badge-purple" style={{ fontWeight: 700 }}>
                          {emp.employee_id_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{emp.full_name}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{emp.designation}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{emp.department}</div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{emp.email}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(emp.joining_date).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="badge badge-success">{emp.employment_status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Onboard Selected Candidate</h3>
                  <button onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleCreate}>
                  <div className="form-group">
                    <label className="form-label">Select Candidate *</label>
                    <select
                      className="form-control"
                      value={form.user_id}
                      onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    >
                      {candidates.map((c) => (
                        <option key={c.candidate_id} value={c.candidate_id}>
                          {c.full_name} ({c.email}) - {c.qualification}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Employee ID Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. EMP-2026-101"
                        className="form-control"
                        value={form.employee_id_number}
                        onChange={(e) => setForm({ ...form, employee_id_number: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Designation *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Department *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Joining Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={form.joining_date}
                        onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                    <button type="submit" className="btn btn-primary">Create Employee Record</button>
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
