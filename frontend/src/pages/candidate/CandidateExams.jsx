import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CandidateSidebar } from './CandidateSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { GraduationCap, Clock, Award, CheckCircle2, ArrowRight, AlertTriangle } from 'lucide-react';

export const CandidateExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get('/exams');
      setExams(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStartExam = async (examId) => {
    try {
      const res = await api.post(`/attempts/start/${examId}`);
      const attemptId = res.data.attempt_id;
      navigate(`/candidate/exam/${attemptId}`);
    } catch (err) {
      alert(err.response?.data?.detail || 'Unable to start examination.');
    }
  };

  return (
    <div className="dashboard-layout">
      <CandidateSidebar />
      <div className="main-content">
        <TopBar title="Online Examination System" />

        <div className="page-wrapper">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Assessment Tests</h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
              Select an examination below. The test evaluates your technical aptitude and determines job eligibility for Programmer and Data Entry positions.
            </p>
          </div>

          <div className="grid-2">
            {exams.map((ex) => (
              <div key={ex.id} style={{ background: 'white', borderRadius: '16px', padding: '28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span className="badge badge-primary">{ex.category}</span>
                    {ex.has_attempted ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={14} /> Completed
                      </span>
                    ) : ex.attempt_status === 'IN_PROGRESS' ? (
                      <span className="badge badge-warning">In Progress</span>
                    ) : (
                      <span className="badge badge-purple">Ready to Attend</span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {ex.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', padding: '14px', background: '#f8fafc', borderRadius: '10px', margin: '16px 0' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Duration</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.duration_minutes} Mins</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Questions</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.total_questions} MCQs</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Max Score</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.total_marks} Marks</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Passing Criteria</div>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>&gt;= {ex.passing_marks}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong>Instructions:</strong>
                    <p style={{ marginTop: '4px', whiteSpace: 'pre-line' }}>{ex.instructions}</p>
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  {ex.has_attempted && !ex.allow_retake ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.85rem', color: '#15803d', fontWeight: 600 }}>
                        Attempt Submitted & Evaluated
                      </span>
                      <button onClick={() => navigate('/candidate/results')} className="btn btn-outline btn-sm">
                        View Result
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartExam(ex.id)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      <span>{ex.attempt_status === 'IN_PROGRESS' ? 'Resume Ongoing Exam' : 'Start Online Exam Now'}</span>
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};
