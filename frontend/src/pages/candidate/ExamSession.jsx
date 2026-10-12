import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, AlertTriangle, Send } from 'lucide-react';

export const ExamSession = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: 'A' | 'B' | 'C' | 'D' }
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [submitting, setSubmitting] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const fetchExam = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/attempts/${attemptId}/questions`);
        setExamData(res.data);
        setQuestions(res.data.questions);

        // Preload existing answers
        const ansMap = {};
        res.data.questions.forEach((q) => {
          if (q.selected_option) {
            ansMap[q.id] = q.selected_option;
          }
        });
        setAnswers(ansMap);

        // Initialize timer (total minutes * 60)
        const totalSecs = res.data.duration_minutes * 60;
        setTimeLeft(totalSecs);
      } catch (err) {
        alert(err.response?.data?.detail || 'Failed to load examination.');
        navigate('/candidate/exams');
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [attemptId, navigate]);

  // Timer Countdown Effect
  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timeLeft, submitting]);

  const handleSelectOption = async (option) => {
    const currentQ = questions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: option };
    setAnswers(newAnswers);

    // Auto-save to backend immediately
    try {
      setSavingAnswer(true);
      await api.post(`/attempts/${attemptId}/save-answer`, {
        question_id: currentQ.id,
        selected_option: option
      });
    } catch (err) {
      console.error('Failed to save answer:', err);
    } finally {
      setSavingAnswer(false);
    }
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! The examination is submitting automatically.');
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (submitting) return;

    const unansweredCount = questions.length - Object.keys(answers).length;
    if (timeLeft > 0 && unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Are you sure you want to finalize your submission?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      clearInterval(timerRef.current);

      const durationSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const res = await api.post(`/attempts/${attemptId}/submit`, {
        duration_spent_seconds: durationSpent
      });

      // Redirect directly to the graded result page
      navigate(`/candidate/results/${res.data.result_id}`);
    } catch (err) {
      alert('Error submitting exam: ' + (err.response?.data?.detail || err.message));
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#64748b', fontWeight: 600 }}>Loading Examination Questions...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Test Header with Timer */}
      <header style={{ background: '#0f172a', color: 'white', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 'var(--shadow-md)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{examData?.exam_title}</h2>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Question {currentIndex + 1} of {questions.length} • Category: {currentQ?.category}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Countdown Timer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: timeLeft < 180 ? '#7f1d1d' : '#1e293b',
            color: timeLeft < 180 ? '#fca5a5' : '#38bdf8',
            padding: '8px 18px',
            borderRadius: '10px',
            fontWeight: 800,
            fontSize: '1.2rem',
            border: timeLeft < 180 ? '1px solid #ef4444' : '1px solid #334155'
          }}>
            <Clock size={20} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary"
            style={{ background: '#16a34a', padding: '10px 20px', fontWeight: 700 }}
          >
            <Send size={16} /> {submitting ? 'Grading Answers...' : 'Submit Test'}
          </button>
        </div>
      </header>

      {/* Main Examination Body */}
      <div style={{ display: 'flex', flex: 1, padding: '24px 32px', gap: '28px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {/* Left Side: Question Display */}
        <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '36px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span className="badge badge-primary">Question {currentIndex + 1}</span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Marks: <strong>{currentQ?.marks} Mark</strong></span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.5, marginBottom: '28px' }}>
              {currentQ?.question_text}
            </h3>

            {/* Answer Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {['A', 'B', 'C', 'D'].map((opt) => {
                const optText = currentQ?.[`option_${opt.toLowerCase()}`];
                const isSelected = answers[currentQ?.id] === opt;

                return (
                  <div
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: isSelected ? '#2563eb' : '#f1f5f9',
                      color: isSelected ? '#ffffff' : '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}>
                      {opt}
                    </div>
                    <span style={{ fontSize: '1rem', color: '#1e293b', fontWeight: isSelected ? 600 : 400 }}>
                      {optText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Navigation Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '36px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="btn btn-outline"
            >
              <ChevronLeft size={18} /> Previous Question
            </button>

            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {savingAnswer ? 'Saving answer...' : 'Answer auto-saved'}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="btn btn-primary"
            >
              Next Question <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Side: Question Navigation Palette */}
        <div style={{ width: '320px', background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px' }}>Question Palette</h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    height: '42px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    border: isCurrent ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: isAnswered ? '#16a34a' : '#f8fafc',
                    color: isAnswered ? 'white' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: '#64748b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '4px', background: '#16a34a' }} />
              <span>Answered ({Object.keys(answers).length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: 14, height: 14, borderRadius: '4px', background: '#f8fafc', border: '1px solid #cbd5e1' }} />
              <span>Unanswered ({questions.length - Object.keys(answers).length})</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
