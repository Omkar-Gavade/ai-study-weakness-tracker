/**
 * QuizStartPage — Direct quiz experience at /quiz/start/:testId
 *
 * testId format: {examId}-{groupId}-{subjectId}-{topicId}-{testNum}
 * Example: mpsc-group-a-history-ancient-test-1
 *
 * Parses testId → derives sectionId → fetches questions from backend → starts quiz.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Timer, ChevronLeft, ChevronRight, Flag, CheckCircle,
  Loader2, BookOpen, AlertTriangle, RotateCcw
} from 'lucide-react';
import api from '../api';
import { getExam, getSubjects, getTopics } from '../data/quizData';

// ─── testId → meta info ─────────────────────────────────────────────────────
const parseTestId = (testId = '') => {
  // Pattern: examId-groupId-subjectId-topicId-testNum
  // e.g.  : mpsc-group-a-history-ancient-test-1
  const parts = testId.split('-');
  
  // Test number is always last segment. Find it.
  const testNum = parts[parts.length - 1]; // "1" or "2"
  // "test" is always second-to-last
  const withoutTest = parts.slice(0, -2); // removes "test" and "1"

  // examId is first
  const examId = withoutTest[0]; // "mpsc"
  
  let groupId = null, subjectId = null, topicId = null;
  
  // MPSC: mpsc - group - a - subjectId - topicId
  if (examId === 'mpsc') {
    // groupId = "group" + "-" + next char  e.g. group-a
    groupId = withoutTest[1] + '-' + withoutTest[2]; // "group-a"
    subjectId = withoutTest[3];
    topicId = withoutTest.slice(4).join('-');
  } else {
    // Others: examId - "general" - subjectId - topicId
    groupId = withoutTest[1]; // "general"
    subjectId = withoutTest[2];
    topicId = withoutTest.slice(3).join('-');
  }

  return { examId, groupId, subjectId, topicId, testNum: parseInt(testNum, 10) };
};

// Map exam+group → backend sectionId
const toSectionId = (examId, groupId) => {
  const mapping = {
    'mpsc': 'MPSC Pattern',
    'police': 'Police Bharti',
    'talathi': 'Talathi Pattern',
    'zp': 'ZP भरती',
    'mhada': 'Mhada / इतर',
  };
  return mapping[examId] || 'MPSC Pattern';
};

// ── Utility ──────────────────────────────────────────────────────────────────
const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

// ── Result Screen ─────────────────────────────────────────────────────────────
const ResultScreen = ({ questions, answers, onRetry, onExit }) => {
  const correct = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const attempted = Object.values(answers).filter(a => a !== null).length;
  const pct = Math.round((correct / questions.length) * 100);

  return (
    <div className="result-screen panel" style={{ textAlign: 'center', padding: '4rem 2rem', maxWidth: '600px', margin: '3rem auto', animation: 'fadeUp 0.5s ease' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{pct >= 60 ? '🎉' : '📚'}</div>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
        {pct >= 60 ? 'उत्तम! तुम्ही उत्तीर्ण झालात!' : 'आणखी सराव करा!'}
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', margin: '2.5rem 0' }}>
        {[
          { label: 'एकूण प्रश्न',   value: questions.length, color: 'var(--primary)' },
          { label: 'बरोबर',         value: correct,           color: 'var(--success)' },
          { label: 'गुण (टक्के)',   value: pct + '%',         color: pct >= 60 ? 'var(--success)' : 'var(--warning)' },
        ].map((s, i) => (
          <div key={i} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', padding: '1.5rem' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: s.color }}>{s.value}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary" style={{ width: 'auto', padding: '0.875rem 2rem' }} onClick={onRetry}>
          <RotateCcw size={18} /> पुन्हा सराव
        </button>
        <button className="btn btn-primary" style={{ width: 'auto', padding: '0.875rem 2rem' }} onClick={onExit}>
          <CheckCircle size={18} /> डॅशबोर्डवर जा
        </button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const QuizStartPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const meta = parseTestId(testId);
  const { examId, groupId, subjectId, topicId, testNum } = meta;

  // Derive human-readable labels
  const exam     = getExam(examId);
  const subjects = getSubjects(examId, groupId);
  const subject  = subjects.find(s => s.id === subjectId);
  const topics   = getTopics(subjectId);
  const topic    = topics.find(t => t.id === topicId);
  const group    = exam?.groups?.find(g => g.id === groupId);
  const sectionId = toSectionId(examId, groupId);

  // State
  const [questions,   setQuestions]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [currentIdx,  setCurrentIdx]  = useState(0);
  const [answers,     setAnswers]     = useState({});
  const [marked,      setMarked]      = useState(new Set());
  const [timeLeft,    setTimeLeft]    = useState(30 * 60); // 30 min
  const [submitted,   setSubmitted]   = useState(false);
  const [visited,     setVisited]     = useState(new Set([0]));
  const timerRef = useRef();

  // Fetch questions via backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Step 1: Generate a quiz from the section (backend picks questions)
        let generatedQuiz = null;
        try {
          const genRes = await api.post('/quizzes/generate', {
            subject: sectionId,
            limit: 30
          });
          generatedQuiz = genRes.data;
        } catch {
          // Fallback: use any available questions for the section
          const fallbackRes = await api.post('/quizzes/generate', { limit: 30 });
          generatedQuiz = fallbackRes.data;
        }

        if (!generatedQuiz?._id) throw new Error('Could not generate quiz');

        // Step 2: Fetch full question details
        const { data } = await api.get(`/quizzes/${generatedQuiz._id}`);
        const qs = data.questions || [];
        setQuestions(qs);

        const init = {};
        qs.forEach(q => { init[q._id] = null; });
        setAnswers(init);
      } catch (err) {
        console.error('Failed to load questions:', err);
        setError('प्रश्न लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [testId, sectionId, testNum]);

  // Timer
  useEffect(() => {
    if (loading || submitted) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, submitted]);

  // Answer
  const selectAnswer = (option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questions[currentIdx]._id]: option }));
  };

  // Navigate questions
  const goTo = (idx) => {
    setCurrentIdx(idx);
    setVisited(prev => new Set([...prev, idx]));
  };

  // Mark for review
  const toggleMark = () => {
    const qId = questions[currentIdx]._id;
    setMarked(prev => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  };

  // Submit
  const handleSubmit = () => {
    clearInterval(timerRef.current);
    setSubmitted(true);
  };

  // Status per question
  const qStatus = (q, idx) => {
    if (marked.has(q._id)) return 'marked';
    if (answers[q._id])    return 'answered';
    if (visited.has(idx))  return 'visited';
    return 'not_visited';
  };

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  const buildBreadcrumbs = () => {
    const crumbs = [
      { label: 'प्रश्नमंजुषा',         href: '/quizzes' },
      { label: exam?.name || examId,  href: `/quizzes/${examId}` },
    ];
    if (group) crumbs.push({ label: group.name, href: `/quizzes/${examId}/${groupId}` });
    if (subject) crumbs.push({ label: subject.name, href: `/quizzes/${examId}/${groupId}/${subjectId}` });
    if (topic) crumbs.push({ label: topic.name, href: `/quizzes/${examId}/${groupId}/${subjectId}/${topicId}` });
    crumbs.push({ label: `चाचणी ${testNum}` });
    return crumbs;
  };

  // ── Renders ─────────────────────────────────────────────────────────────────

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <Loader2 size={44} style={{ color: 'var(--primary)', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)' }}>प्रश्न लोड होत आहेत…</p>
      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );

  if (error) return (
    <div className="panel" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
      <AlertTriangle size={44} style={{ color: 'var(--warning)', marginBottom: '1rem' }} />
      <h2>त्रुटी आली</h2>
      <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      <button className="btn btn-primary" style={{ width: 'auto', marginTop: '1.5rem', padding: '0.875rem 2rem' }} onClick={() => window.location.reload()}>
        पुन्हा प्रयत्न करा
      </button>
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

  if (questions.length === 0) return (
    <div className="panel" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
      <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
      <h2>प्रश्न उपलब्ध नाहीत</h2>
      <p style={{ color: 'var(--text-muted)' }}>या विषयासाठी अद्याप प्रश्न जोडले नाहीत.</p>
      <button className="btn btn-secondary" style={{ width: 'auto', marginTop: '1.5rem', padding: '0.875rem 2rem' }} onClick={() => navigate(-1)}>
        परत जा
      </button>
    </div>
  );

  const currentQ = questions[currentIdx];
  const isLast   = currentIdx === questions.length - 1;
  const timerRed = timeLeft < 300;
  const crumbs   = buildBreadcrumbs();

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      {/* ── Sticky Top Bar ── */}
      <div className="quiz-topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <BookOpen size={20} style={{ color: 'var(--primary)' }} />
          <nav className="qnav-breadcrumb" style={{ margin: 0 }}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {c.href
                  ? <Link to={c.href}>{c.label}</Link>
                  : <span style={{ color: 'var(--primary)', fontWeight: 500 }}>{c.label}</span>
                }
                {i < crumbs.length - 1 && <ChevronRight size={12} />}
              </React.Fragment>
            ))}
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: timerRed ? 'var(--danger)' : 'var(--text-active)', fontWeight: '700', fontSize: '1.4rem' }}>
          <Timer size={22} style={{ color: timerRed ? 'var(--danger)' : 'var(--warning)' }} />
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* ── Layout ── */}
      <div className="quiz-layout" style={{ marginTop: '2rem' }}>
        {/* Main question area */}
        <div className="quiz-main">
          <div className="panel" style={{ minHeight: '420px' }}>
            {/* Progress bar */}
            <div className="progress-container">
              <div className="progress-fill" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
            </div>

            <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              प्रश्न {currentIdx + 1} पैकी {questions.length}
            </div>

            <div className="question-text">{currentQ.text}</div>

            <div className="options-grid">
              {currentQ.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${answers[currentQ._id] === opt ? 'selected' : ''}`}
                  onClick={() => selectAnswer(opt)}
                >
                  <span style={{ marginRight: '1rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  {opt}
                </button>
              ))}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} disabled={currentIdx === 0} onClick={() => goTo(currentIdx - 1)}>
                <ChevronLeft size={18} /> मागील
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1, color: marked.has(currentQ._id) ? 'var(--warning)' : '' }}
                onClick={toggleMark}
              >
                <Flag size={18} /> {marked.has(currentQ._id) ? 'चिन्हांकित' : 'पुनरावलोकन'}
              </button>
              {isLast ? (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>
                  <CheckCircle size={18} /> चाचणी पूर्ण करा
                </button>
              ) : (
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => goTo(currentIdx + 1)}>
                  पुढील <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar palette */}
        <div className="quiz-sidebar">
          <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', color: 'var(--text-muted)' }}>
            प्रश्न सूची
          </h3>
          <div className="palette-grid">
            {questions.map((q, idx) => (
              <button
                key={q._id}
                className={`palette-btn ${qStatus(q, idx)} ${idx === currentIdx ? 'current-active' : ''}`}
                onClick={() => goTo(idx)}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <div className="palette-legend" style={{ marginTop: '1.5rem' }}>
            {[
              { cls: 'answered',   label: 'उत्तर दिलेले' },
              { cls: 'marked',     label: 'पुनरावलोकन' },
              { cls: 'visited',    label: 'पाहिलेले' },
              { cls: 'not_visited', label: 'न पाहिलेले' },
            ].map(l => (
              <div key={l.cls} className="legend-item">
                <div className={`legend-box ${l.cls}`} />
                <span style={{ fontSize: '0.85rem' }}>{l.label}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-primary"
            style={{ marginTop: '2rem', width: '100%', background: 'linear-gradient(135deg, var(--danger), #fca5a5)' }}
            onClick={() => { if (window.confirm('चाचणी सोडायची का? प्रगती जतन होणार नाही.')) navigate(-1); }}
          >
            चाचणी सोडा
          </button>

          <button className="btn btn-primary" style={{ marginTop: '0.75rem', width: '100%' }} onClick={handleSubmit}>
            <CheckCircle size={16} /> सबमिट करा
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .quiz-topbar {
          position: sticky;
          top: 80px;
          z-index: 40;
          background: rgba(11, 15, 25, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          margin: 0 -5%;
          padding: 0.875rem 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .qnav-breadcrumb {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap;
        }
        .qnav-breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
        .qnav-breadcrumb a:hover { color: var(--primary); }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .result-screen { animation: fadeUp 0.5s ease; }
      `}} />
    </div>
  );
};

export default QuizStartPage;
