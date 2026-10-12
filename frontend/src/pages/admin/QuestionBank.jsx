import React, { useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { TopBar } from '../../components/TopBar';
import api from '../../api/client';
import { Plus, Edit2, Trash2, CheckCircle2, Search, X } from 'lucide-react';

export const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [form, setForm] = useState({
    category: 'Computer Science',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1.0,
    explanation: ''
  });

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/questions');
      setQuestions(res.data);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const openCreateModal = () => {
    setEditingQuestion(null);
    setForm({
      category: 'Computer Science',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      marks: 1.0,
      explanation: ''
    });
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setForm({
      category: q.category,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      marks: q.marks,
      explanation: q.explanation || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingQuestion) {
        await api.put(`/admin/questions/${editingQuestion.id}`, form);
      } else {
        await api.post('/admin/questions', form);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      alert('Error saving question: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await api.delete(`/admin/questions/${id}`);
        fetchQuestions();
      } catch (err) {
        alert('Failed to delete question');
      }
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.question_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <div className="main-content">
        <TopBar title="Examination Question Bank" />

        <div className="page-wrapper">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 14px', borderRadius: '10px', border: '1px solid var(--border)', width: '320px' }}>
              <Search size={18} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search questions by text or category..."
                style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button onClick={openCreateModal} className="btn btn-primary">
              <Plus size={18} /> Add New Question
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredQuestions.length === 0 ? (
              <div style={{ background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', color: '#94a3b8', border: '1px solid var(--border)' }}>
                No questions found. Click "Add New Question" to create one.
              </div>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={q.id} style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.95rem' }}>Q{idx + 1}.</span>
                      <span className="badge badge-purple">{q.category}</span>
                      <span className="badge badge-gray">{q.marks} Mark</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditModal(q)} className="btn btn-sm btn-outline">
                        <Edit2 size={14} /> Edit
                      </button>
                      <button onClick={() => handleDelete(q.id)} className="btn btn-sm" style={{ color: '#ef4444' }}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '1rem', color: '#0f172a', marginBottom: '16px' }}>
                    {q.question_text}
                  </p>

                  <div className="grid-2" style={{ gap: '10px' }}>
                    {['A', 'B', 'C', 'D'].map((opt) => {
                      const optKey = `option_${opt.toLowerCase()}`;
                      const isCorrect = q.correct_option === opt;
                      return (
                        <div
                          key={opt}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: isCorrect ? '#ecfdf5' : '#f8fafc',
                            border: isCorrect ? '1.5px solid #10b981' : '1px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.875rem',
                          }}
                        >
                          <span><strong>{opt}:</strong> {q[optKey]}</span>
                          {isCorrect && <CheckCircle2 size={16} color="#10b981" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#64748b', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px' }}>
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Modal for Creating / Editing Question */}
          {showModal && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                    {editingQuestion ? 'Edit Question' : 'Create New MCQ Question'}
                  </h3>
                  <button onClick={() => setShowModal(false)}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Marks</label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        className="form-control"
                        value={form.marks}
                        onChange={(e) => setForm({ ...form, marks: parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Question Text *</label>
                    <textarea
                      required
                      rows={3}
                      className="form-control"
                      value={form.question_text}
                      onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                    />
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Option A *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.option_a}
                        onChange={(e) => setForm({ ...form, option_a: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Option B *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.option_b}
                        onChange={(e) => setForm({ ...form, option_b: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Option C *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.option_c}
                        onChange={(e) => setForm({ ...form, option_c: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Option D *</label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        value={form.option_d}
                        onChange={(e) => setForm({ ...form, option_d: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Correct Answer *</label>
                      <select
                        className="form-control"
                        value={form.correct_option}
                        onChange={(e) => setForm({ ...form, correct_option: e.target.value })}
                      >
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Explanation (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.explanation}
                        onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingQuestion ? 'Update Question' : 'Save Question'}
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
