import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CandidateSidebar } from './CandidateSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Award, CheckCircle2, XCircle, Printer, Download, ArrowRight, ShieldCheck } from 'lucide-react';

export const CandidateResultReport = () => {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [myResults, setMyResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        if (resultId) {
          const res = await api.get(`/results/${resultId}/report`);
          setReport(res.data);
        } else {
          const resList = await api.get('/results/my-results');
          setMyResults(resList.data);
          if (resList.data.length > 0) {
            const firstReport = await api.get(`/results/${resList.data[0].result_id}/report`);
            setReport(firstReport.data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [resultId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="dashboard-layout">
      <CandidateSidebar />
      <div className="main-content">
        <TopBar title="Examination Marks & Recruitment Eligibility Report" />

        <div className="page-wrapper">
          {report ? (
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginBottom: '20px' }}>
                <button onClick={handlePrint} className="btn btn-primary">
                  <Printer size={16} /> Print / Save PDF Report
                </button>
              </div>

              {/* Printable Result Card */}
              <div id="print-section" style={{ background: 'white', borderRadius: '20px', padding: '40px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
                
                {/* Formal Header */}
                <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a8a' }}>
                      Online Examination Assessment Report
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '4px' }}>
                      Official evaluation and recruitment eligibility evaluation scorecard
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-purple" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                      {report.report_id}
                    </span>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                      Evaluated on: {new Date(report.submitted_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Candidate & Exam Metadata */}
                <div className="grid-2" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '28px' }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Candidate Name</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{report.candidate.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>{report.candidate.email} • {report.candidate.phone}</div>
                    <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginTop: '4px' }}>
                      Degree: {report.candidate.qualification} ({report.candidate.academic_percentage}% Aggregate)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Examination Subject</div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{report.exam.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '2px' }}>Category: {report.exam.category}</div>
                    <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                      Testing Centre: {report.candidate.centre}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Cards */}
                <div className="grid-4" style={{ marginBottom: '28px' }}>
                  <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>Score Obtained</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e3a8a', marginTop: '4px' }}>
                      {report.scores.score_obtained} / {report.scores.max_score}
                    </div>
                  </div>

                  <div style={{ background: '#f5f3ff', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#6d28d9', fontWeight: 600 }}>Test Percentage</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#5b21b6', marginTop: '4px' }}>
                      {report.scores.percentage.toFixed(1)}%
                    </div>
                  </div>

                  <div style={{ background: '#ecfdf5', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600 }}>Correct Answers</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#065f46', marginTop: '4px' }}>
                      {report.scores.correct_answers}
                    </div>
                  </div>

                  <div style={{ background: report.scores.is_passed ? '#ecfdf5' : '#fef2f2', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: report.scores.is_passed ? '#047857' : '#b91c1c', fontWeight: 600 }}>Qualifying Status</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: report.scores.is_passed ? '#15803d' : '#dc2626', marginTop: '6px' }}>
                      {report.scores.is_passed ? 'PASSED' : 'FAILED'}
                    </div>
                  </div>
                </div>

                {/* Configurable Job Eligibility Determination Section */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', background: '#ffffff', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="#2563eb" /> Job Selection & Eligibility Evaluation
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {report.eligibility_decisions?.map((elig, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          borderRadius: '10px',
                          background: elig.is_eligible ? '#f0fdf4' : '#fff7ed',
                          border: elig.is_eligible ? '1px solid #bbf7d0' : '1px solid #ffedd5'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{elig.job_title}</span>
                          <span className={`badge ${elig.is_eligible ? 'badge-success' : 'badge-warning'}`}>
                            {elig.is_eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                          {elig.decision_reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  * This score report is generated directly by the system server. Final employment appointments are subject to HR interview and certificate verification.
                </div>

              </div>
            </div>
          ) : (
            <div style={{ background: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', color: '#94a3b8' }}>
              No examination records found. Please attend an examination first.
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
