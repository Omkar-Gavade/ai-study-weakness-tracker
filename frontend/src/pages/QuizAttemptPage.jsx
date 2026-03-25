import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle,
  Loader2,
  BookOpen
} from 'lucide-react';
import api from '../api';

const QuizAttemptPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: selectedOption }
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [stagedAnswers, setStagedAnswers] = useState({}); // For internal state
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await api.get(`/quizzes/${id}`);
        setQuiz(data);
        const initialAnswers = {};
        data.questions.forEach(q => initialAnswers[q._id] = null);
        setAnswers(initialAnswers);
      } catch (err) {
        setError('Failed to load quiz details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option) => {
    setAnswers(prev => ({ ...prev, [quiz.questions[currentIdx]._id]: option }));
  };

  const toggleMarkForReview = () => {
    const newMarked = new Set(markedForReview);
    const qId = quiz.questions[currentIdx]._id;
    if (newMarked.has(qId)) newMarked.delete(qId);
    else newMarked.add(qId);
    setMarkedForReview(newMarked);
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      await api.post(`/quizzes/${id}/attempt`, { answers: payload });
      alert('चाचणी यशस्वीरित्या सबमिट केली!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('चाचणी सबमिट करण्यात त्रुटी आली.');
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader2 size={40} className="animate-spin" color="var(--primary)" />
    </div>
  );

  const currentQuestion = quiz?.questions[currentIdx];
  const questionIds = quiz?.questions.map(q => q._id) || [];

  return (
    <div className="quiz-attempt-container">
      <div className="navbar" style={{ top: '80px', position: 'sticky', background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid var(--border)', margin: '0 -5% 2rem -5%', padding: '0.75rem 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <BookOpen size={20} className="text-primary" />
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{quiz?.title}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: timeLeft < 300 ? 'var(--danger)' : 'var(--text-active)' }}>
          <Timer size={20} />
          <span style={{ fontWeight: '700', fontSize: '1.25rem' }}>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="quiz-layout">
        {/* Main Quiz Area */}
        <div className="quiz-main">
          <div className="panel" style={{ minHeight: '400px' }}>
            <div className="progress-container">
              <div
                className="progress-fill"
                style={{ width: `${((currentIdx + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>

            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              प्रश्न {currentIdx + 1} पैकी {quiz.questions.length}
            </div>

            <div className="question-text">
              {currentQuestion?.text}
            </div>

            <div className="options-grid">
              {currentQuestion?.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${answers[currentQuestion._id] === option ? 'selected' : ''}`}
                  onClick={() => handleOptionSelect(option)}
                >
                  <span style={{ marginRight: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {option}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
              >
                <ChevronLeft size={18} /> मागील
              </button>

              <button
                className="btn btn-secondary"
                style={{ flex: 1, color: markedForReview.has(currentQuestion._id) ? 'var(--warning)' : '' }}
                onClick={toggleMarkForReview}
              >
                <Flag size={18} /> {markedForReview.has(currentQuestion._id) ? 'चिन्हांकित' : 'पुनरावलोकनासाठी चिन्हांकित करा'}
              </button>

              {currentIdx === quiz.questions.length - 1 ? (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <><CheckCircle size={18} /> चाचणी पूर्ण करा</>}
                </button>
              ) : (
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                >
                  Next <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Sidebar */}
        <div className="quiz-sidebar">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>प्रश्न सूची</h3>
          <div className="palette-grid">
            {quiz.questions.map((q, idx) => {
              let status = 'not_visited';
              if (answers[q._id]) status = 'answered';
              else if (idx === currentIdx) status = 'visited';
              if (markedForReview.has(q._id)) status = 'marked';

              return (
                <button
                  key={q._id}
                  className={`palette-btn ${status} ${idx === currentIdx ? 'current-active' : ''}`}
                  onClick={() => setCurrentIdx(idx)}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="palette-legend">
            <div className="legend-item">
              <div className="legend-box answered"></div>
              <span>उत्तर दिलेले</span>
            </div>
            <div className="legend-item">
              <div className="legend-box marked"></div>
              <span>पुनरावलोकनासाठी</span>
            </div>
            <div className="legend-item">
              <div className="legend-box not_visited"></div>
              <span>उत्तर न दिलेले</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '2rem', width: '100%', background: 'linear-gradient(135deg, var(--danger) 0%, #fca5a5 100%)' }}
            onClick={() => { if (window.confirm('Are you sure you want to exit? Progress will be lost.')) navigate('/dashboard'); }}
          >
            बाहेर पडा
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizAttemptPage;
