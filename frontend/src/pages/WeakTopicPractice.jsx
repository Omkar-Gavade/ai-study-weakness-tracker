/**
 * WeakTopicPractice — Targeted practice mode at /quiz/practice/weak
 * Fetches 15 questions from user's weak topics and conducts a quick quiz.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Timer, ChevronLeft, ChevronRight, CheckCircle,
  Loader2, BookOpen, AlertTriangle, RotateCcw,
  Target, GraduationCap
} from 'lucide-react';
import api from '../api';
import AnswerReview from '../components/AnswerReview';

// ── Utility ──────────────────────────────────────────────────────────────────
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ── AI Performance Analysis Engine (Rule-Based) ───────────────────────────────
const analyzePerformance = (questions, answers) => {
  const total     = questions.length;
  const attempted = Object.values(answers).filter(a => a !== null).length;
  const correct   = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const overall   = total > 0 ? Math.round((correct / total) * 100) : 0;
  const accuracy  = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  const topicMap = {};
  questions.forEach(q => {
    const key = q.topic || q.subject || q.section || 'सामान्य';
    if (!topicMap[key]) topicMap[key] = { total: 0, correct: 0, wrong: 0 };
    topicMap[key].total++;
    if (answers[q._id] === q.correctAnswer) topicMap[key].correct++;
    else if (answers[q._id] !== null) topicMap[key].wrong++;
  });

  const topicStats = Object.entries(topicMap).map(([name, s]) => ({
    name, ...s, pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }));

  const weak   = topicStats.filter(t => t.pct < 50);
  const strong = topicStats.filter(t => t.pct >= 75);

  let verdict = `या सरावानंतर तुम्ही ${strong.length > 0 ? strong.map(t=>t.name).join(', ') : 'काही विषयांत'} प्रगती केली आहे.`;
  if (weak.length > 0) verdict += ` अजूनही ${weak.map(t=>t.name).join(' आणि ')} मध्ये सराव हवा.`;

  return { overall, accuracy, topicStats, weak, strong, verdict };
};

// ── AI Analysis Panel ─────────────────────────────────────────────────────────
const AIAnalysisPanel = ({ analysis }) => {
  const { overall, accuracy, weak, strong, verdict } = analysis;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <span className="ai-badge">🤖 AI</span>
        <h2 className="ai-panel-title">AI विश्लेषण</h2>
      </div>
      <div className="ai-verdict">{verdict}</div>
      <div className="ai-metrics">
        <div className="ai-metric-pill" style={{ borderColor: '#6366f155', background: '#6366f115' }}>
          <span className="ai-metric-value" style={{ color: '#6366f1' }}>{overall}%</span>
          <span className="ai-metric-label">एकूण गुण</span>
        </div>
        <div className="ai-metric-pill" style={{ borderColor: '#22c55e55', background: '#22c55e15' }}>
          <span className="ai-metric-value" style={{ color: '#22c55e' }}>{accuracy}%</span>
          <span className="ai-metric-label">अचूकता</span>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .ai-panel { background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.2); border-radius: 1rem; padding: 1.5rem; margin-bottom: 2rem; }
        .ai-badge { background: #6366f1; color:#fff; font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:99px; }
        .ai-panel-header { display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; }
        .ai-panel-title { font-size:1.1rem; margin:0; }
        .ai-verdict { font-size:0.9rem; margin-bottom:1rem; color:var(--text-active); }
        .ai-metrics { display:flex; gap:1rem; }
        .ai-metric-pill { flex:1; display:flex; flex-direction:column; align-items:center; padding:1rem; border-radius:0.75rem; border:1px solid; }
        .ai-metric-value { font-size:1.4rem; font-weight:800; }
        .ai-metric-label { font-size:0.75rem; color:var(--text-muted); }
      `}} />
    </div>
  );
};

// ── Result Screen ─────────────────────────────────────────────────────────────
const ResultScreen = ({ questions, answers, onRetry, onExit }) => {
  const analysis = analyzePerformance(questions, answers);
  const { overall } = analysis;

  return (
    <div className="result-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <div className="result-header" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎯 सराव पूर्ण!</h1>
        <p style={{ color: 'var(--text-muted)' }}>तुमच्या कमकुवत विषयांवर आधारित विशेष सराव संपला आहे.</p>
      </div>

      <div className="score-display" style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
        <div style={{ width: '180px', height: '180px', borderRadius: '50%', border: '8px solid #6366f1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.05)' }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, color: '#6366f1' }}>{overall}%</span>
          <span style={{ color: 'var(--text-muted)' }}>गुण</span>
        </div>
      </div>

      <AIAnalysisPanel analysis={analysis} />

      <AnswerReview questions={questions} answers={answers} />

      <div className="result-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onRetry} style={{ width: 'auto' }}>
          <RotateCcw size={18} /> पुन्हा सराव करा
        </button>
        <button className="btn btn-primary" onClick={onExit} style={{ width: 'auto' }}>
          <CheckCircle size={18} /> डॅशबोर्डवर जा
        </button>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const WeakTopicPractice = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [quizId, setQuizId] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get('/quizzes/generate/weak')
      .then(res => {
        setQuestions(res.data.questions || []);
        setQuizId(res.data._id);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'कमकुवत विषय शोधण्यात अडचण आली.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!loading && questions.length > 0 && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [loading, questions, submitted]);

  const handleOption = (option) => {
    setAnswers(prev => ({ ...prev, [questions[currentIdx]._id]: option }));
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setSubmitted(true);
    
    // Save attempt to backend
    api.post(`/quizzes/${quizId || 'weak-practice'}/attempt`, {
      answers: Object.entries(answers).map(([qId, val]) => ({ questionId: qId, selectedOption: val }))
    }).catch(console.error);
  };

  if (loading) return (
    <div className="loader-container" style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={48} className="animate-spin text-primary" style={{ marginBottom: '1rem' }} />
      <p style={{ color: 'var(--text-muted)' }}>तुमचे कमकुवत विषय शोधत आहे...</p>
    </div>
  );

  if (error) return (
    <div className="error-container" style={{ padding: '3rem', textAlign: 'center' }}>
      <Target size={64} style={{ color: '#ef4444', marginBottom: '1.5rem', opacity: 0.5 }} />
      <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>थांबा!</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error}</p>
      <Link to="/dashboard" className="btn btn-primary" style={{ width: 'auto' }}>डॅशबोर्डवर परत जा</Link>
    </div>
  );

  if (submitted) return (
    <ResultScreen 
      questions={questions} 
      answers={answers} 
      onRetry={() => window.location.reload()} 
      onExit={() => navigate('/dashboard')} 
    />
  );

  const currentQ = questions[currentIdx];

  return (
    <div className="practice-layout" style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fca5a5', marginBottom: '0.25rem' }}>
            <Target size={20} />
            <span style={{ fontWeight: 700, letterSpacing: '0.02em', fontSize: '0.85rem' }}>कमकुवत विषय सराव</span>
          </div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>तुमच्या कमकुवत विषयांवर आधारित सराव चाचणी</h1>
        </div>
        <div style={{ background: timeLeft < 60 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)', padding: '0.75rem 1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Timer size={20} style={{ color: timeLeft < 60 ? '#ef4444' : '#6366f1' }} />
          <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: timeLeft < 60 ? '#ef4444' : '#fff' }}>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
        <main className="panel" style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ padding: '0.3rem 0.8rem', background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
              प्रश्न {currentIdx + 1} / {questions.length}
            </span>
            <p style={{ fontSize: '1.25rem', marginTop: '1rem', lineHeight: 1.6, color: 'var(--text-active)' }}>
              {currentQ.questionText}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                className="option-btn"
                onClick={() => handleOption(opt)}
                style={{
                  padding: '1.25rem', textAlign: 'left', borderRadius: '1rem', border: '1px solid',
                  borderColor: answers[currentQ._id] === opt ? '#6366f1' : 'rgba(255,255,255,0.08)',
                  background: answers[currentQ._id] === opt ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)',
                  color: answers[currentQ._id] === opt ? '#fff' : 'var(--text-muted)',
                  fontSize: '1rem', transition: 'all 0.2s'
                }}
              >
                <span style={{ marginRight: '1rem', color: answers[currentQ._id] === opt ? '#6366f1' : '#64748b', fontWeight: 800 }}>{String.fromCharCode(65 + idx)}.</span>
                {opt}
              </button>
            ))}
          </div>

          <footer style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setCurrentIdx(prev => prev - 1)}
              disabled={currentIdx === 0}
              style={{ width: 'auto' }}
            >
              <ChevronLeft size={20} /> मागे
            </button>
            {currentIdx === questions.length - 1 ? (
              <button className="btn btn-primary" onClick={handleSubmit} style={{ width: 'auto', background: '#22c55e' }}>
                <CheckCircle size={20} /> चाचणी जमा करा
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setCurrentIdx(prev => prev + 1)} style={{ width: 'auto' }}>
                पुढील <ChevronRight size={20} />
              </button>
            )}
          </footer>
        </main>

        {/* Sidebar Palette */}
        <aside>
          <div className="panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>प्रश्न सूची</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.6rem' }}>
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIdx(i)}
                  style={{
                    height: '40px', borderRadius: '0.6rem', border: '1px solid',
                    background: i === currentIdx ? 'rgba(99,102,241,0.25)' : (answers[questions[i]._id] ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)'),
                    borderColor: i === currentIdx ? '#6366f1' : (answers[questions[i]._id] ? '#22c55e' : 'transparent'),
                    color: i === currentIdx ? '#fff' : (answers[questions[i]._id] ? '#22c55e' : '#64748b'),
                    fontSize: '0.9rem', fontWeight: 800
                  }}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(99,102,241,0.25)', border: '1px solid #6366f1' }} /> चालू
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e' }} /> सोडवलेले
              </div>
            </div>
          </div>
        </aside>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 800px) {
          .practice-layout > div { grid-template-columns: 1fr !important; }
        }
        .option-btn:hover { background: rgba(99,102,241,0.05) !important; border-color: rgba(99,102,241,0.3) !important; color: #fff !important; }
      `}} />
    </div>
  );
};

export default WeakTopicPractice;
