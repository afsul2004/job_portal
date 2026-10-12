import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Download, Search, CheckCircle2, XCircle, Award } from 'lucide-react';

export const ExamReports = () => {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/admin/reports/results');
        setReports(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filtered = reports.filter((r) =>
    r.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.candidate_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.exam_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ['Candidate Name', 'Email', 'Qualification', 'Academic %', 'Exam Title', 'Score', 'Percentage', 'Passed', 'Date'];
    const rows = filtered.map(r => [
      `"${r.candidate_name}"`,
      `"${r.candidate_email}"`,
      `"${r.qualification}"`,
      r.academic_percentage,
      `"${r.exam_title}"`,
      r.score_obtained,
      r.percentage,
      r.is_passed ? 'YES' : 'NO',
      `"${new Date(r.submitted_at).toLocaleDateString()}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'examination_marks_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Examination Marks & Candidate Results Report" />

        <div className="page-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search by candidate name or exam..."
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={exportCSV} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={16} /> Export CSV Report
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Qualification & Aggregate</th>
                  <th>Exam Title</th>
                  <th>Marks Scored</th>
                  <th>Percentage</th>
                  <th>Evaluation Status</th>
                  <th>Date Submitted</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                      No examination submission records found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.result_id}>
                      <td>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{r.candidate_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.candidate_email}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.qualification}</div>
                        <div style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 600 }}>{r.academic_percentage}% Academics</div>
                      </td>
                      <td style={{ fontWeight: 600, color: '#334155' }}>{r.exam_title}</td>
                      <td>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: r.score_obtained >= 8 ? '#16a34a' : r.score_obtained >= 6 ? '#2563eb' : '#dc2626' }}>
                          {r.score_obtained} / {r.max_score}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-purple">{r.percentage.toFixed(1)}%</span>
                      </td>
                      <td>
                        <span className={`badge ${r.is_passed ? 'badge-success' : 'badge-danger'}`}>
                          {r.is_passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        {new Date(r.submitted_at).toLocaleDateString()}
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
