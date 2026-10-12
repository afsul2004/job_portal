import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { GraduationCap, Plus, Clock, FileCheck, X } from 'lucide-react';

export const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: 'Computer Science & Aptitude',
    duration_minutes: 15,
    total_questions: 10,
    total_marks: 10.0,
    passing_marks: 6.0,
    is_published: true,
    randomize_questions: true,
    instructions: '',
    question_ids: []
  });

  const fetchData = async () => {
    try {
      const [resExams, resQ] = await Promise.all([
        api.get('/admin/exams'),
        api.get('/admin/questions')
      ]);
      setExams(resExams.data);
      setQuestions(resQ.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleQuestion = (id) => {
    if (form.question_ids.includes(id)) {
      setForm({ ...form, question_ids: form.question_ids.filter((qid) => qid !== id) });
    } else {
      setForm({ ...form, question_ids: [...form.question_ids, id] });
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/exams', {
        ...form,
        total_questions: form.question_ids.length > 0 ? form.question_ids.length : form.total_questions,
        total_marks: form.question_ids.length > 0 ? form.question_ids.length * 1.0 : form.total_marks
      });
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error creating exam: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Examination Settings & Configurations" />

        <div className="page-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Configure examination durations, passing thresholds, randomized question pools, and active publications.
            </p>
            <button onClick={() => setShowModal(true)} className="btn btn-primary">
              <Plus size={18} /> Create Exam Assessment
            </button>
          </div>

          <div className="grid-2">
            {exams.map((ex) => (
              <div key={ex.id} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="badge badge-primary">{ex.category}</span>
                    <span className={`badge ${ex.is_published ? 'badge-success' : 'badge-gray'}`}>
                      {ex.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    {ex.title}
                  </h3>

                  <div style={{ display: 'flex', gap: '16px', margin: '16px 0', padding: '12px', background: '#f8fafc', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Duration</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.duration_minutes} Mins</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Questions</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.total_questions} Questions</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Marks</div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{ex.total_marks} Marks</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pass Criteria</div>
                      <div style={{ fontWeight: 700, color: '#16a34a' }}>&gt;= {ex.passing_marks}</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    <strong>Instructions:</strong>
                    <p style={{ marginTop: '4px', whiteSpace: 'pre-line' }}>{ex.instructions || 'No special instructions.'}</p>
                  </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    {ex.linked_questions_count} Questions Linked from Question Bank
                  </span>
                  <span className="badge badge-purple">
                    {ex.randomize_questions ? 'Randomized' : 'Sequential'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '680px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Create Online Examination</h3>
                  <button onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleCreateExam}>
                  <div className="form-group">
                    <label className="form-label">Exam Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Graduate Aptitude & Technical Test 2026"
                      className="form-control"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="grid-3">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Duration (Minutes)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={form.duration_minutes}
                        onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Passing Marks</label>
                      <input
                        type="number"
                        step="0.5"
                        className="form-control"
                        value={form.passing_marks}
                        onChange={(e) => setForm({ ...form, passing_marks: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Exam Instructions</label>
                    <textarea
                      rows={3}
                      className="form-control"
                      placeholder="Enter guidelines, negative marking rules, timer details..."
                      value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Select Questions to include ({form.question_ids.length} selected):</label>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px' }}>
                      {questions.map((q) => (
                        <label key={q.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', fontSize: '0.85rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={form.question_ids.includes(q.id)}
                            onChange={() => handleToggleQuestion(q.id)}
                          />
                          <span><strong>Q{q.id}:</strong> {q.question_text.slice(0, 80)}...</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Publish Examination
                    </button>
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
