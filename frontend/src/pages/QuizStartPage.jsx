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
import AnswerReview from '../components/AnswerReview';
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

// ── AI Performance Analysis Engine (Rule-Based) ───────────────────────────────
const analyzePerformance = (questions, answers, subjectName, topicName) => {
  const total     = questions.length;
  const attempted = Object.values(answers).filter(a => a !== null).length;
  const correct   = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const overall   = total > 0 ? Math.round((correct / total) * 100) : 0;
  const accuracy  = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;

  // Group by topic/subject field on question, fallback to passed props
  const topicMap = {};
  questions.forEach(q => {
    const key = q.topic || q.subject || subjectName || topicName || 'सामान्य';
    if (!topicMap[key]) topicMap[key] = { total: 0, correct: 0, wrong: 0 };
    topicMap[key].total++;
    if (answers[q._id] === q.correctAnswer) topicMap[key].correct++;
    else if (answers[q._id] !== null && answers[q._id] !== undefined) topicMap[key].wrong++;
  });

  const topicStats = Object.entries(topicMap).map(([name, s]) => ({
    name,
    ...s,
    pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }));

  const weak   = topicStats.filter(t => t.pct < 50);
  const medium = topicStats.filter(t => t.pct >= 50 && t.pct < 75);
  const strong = topicStats.filter(t => t.pct >= 75);

  // ── Generate smart Marathi suggestions ──────────────────────────────────────
  const suggestions = [];

  if (weak.length > 0) {
    const names = weak.map(t => t.name).join(' आणि ');
    suggestions.push({ urgency: 'high',   text: `📖 पुढील ३ दिवस ${names} विषयाचा सखोल अभ्यास करा.` });
    suggestions.push({ urgency: 'high',   text: `✍️ ${names} वरील मागील वर्षांचे प्रश्न सोडवा.` });
  }
  if (medium.length > 0) {
    const names = medium.map(t => t.name).join(' आणि ');
    suggestions.push({ urgency: 'medium', text: `📝 ${names} मध्ये आणखी सराव केल्यास उत्तम गुण मिळतील.` });
  }
  if (strong.length > 0) {
    const names = strong.map(t => t.name).join(' आणि ');
    suggestions.push({ urgency: 'low',    text: `✅ ${names} मध्ये तुम्ही चांगले आहात — फक्त देखभाल सराव ठेवा.` });
  }

  if (overall < 40)
    suggestions.push({ urgency: 'high',   text: '🔁 दररोज किमान ३० प्रश्न सोडवण्याची सवय लावा.' });
  else if (overall < 60)
    suggestions.push({ urgency: 'medium', text: '⏱️ वेळेचे नियोजन करा — प्रत्येक प्रश्नासाठी जास्तीत जास्त ६० सेकंद.' });
  else
    suggestions.push({ urgency: 'low',    text: '🏆 उत्कृष्ट सराव! आता मॉक टेस्ट द्या आणि कमकुवत भाग ओळखा.' });

  // ── Overall verdict ──────────────────────────────────────────────────────────
  const subLabel = subjectName || topicName || 'या विषयात';
  let verdict = '';
  if (weak.length > 0 && strong.length === 0)
    verdict = `⚠️ तुम्ही ${weak.map(t=>t.name).join(' आणि ')} मध्ये कमकुवत आहात. अधिक सराव आवश्यक आहे.`;
  else if (strong.length > 0 && weak.length === 0)
    verdict = `🌟 तुम्ही ${strong.map(t=>t.name).join(' आणि ')} मध्ये चांगले आहात!`;
  else if (weak.length > 0)
    verdict = `📊 तुम्ही ${strong.map(t=>t.name).join(', ')} मध्ये चांगले आहात, पण ${weak.map(t=>t.name).join(' आणि ')} मध्ये सुधारणा आवश्यक आहे.`;
  else
    verdict = `👍 ${subLabel} मध्ये तुमची कामगिरी सरासरी आहे. नियमित सरावाने सुधारणा होईल.`;

  return { overall, accuracy, topicStats, weak, medium, strong, suggestions, verdict };
};

// ── AI Analysis Panel ─────────────────────────────────────────────────────────
const AIAnalysisPanel = ({ analysis }) => {
  const { overall, accuracy, topicStats, weak, strong, suggestions, verdict } = analysis;

  return (
    <div className="ai-panel">
      {/* Header */}
      <div className="ai-panel-header">
        <span className="ai-badge">🤖 AI</span>
        <h2 className="ai-panel-title">AI विश्लेषण</h2>
        <span className="ai-subtitle">तुमच्या उत्तरांवर आधारित स्वयंचलित विश्लेषण</span>
      </div>

      {/* Verdict banner */}
      <div className="ai-verdict">{verdict}</div>

      {/* Overall + Accuracy */}
      <div className="ai-metrics">
        {[
          { label: 'एकूण गुण',   value: overall  + '%', color: overall  >= 60 ? '#22c55e' : overall  >= 40 ? '#f59e0b' : '#ef4444' },
          { label: 'अचूकता',     value: accuracy + '%', color: accuracy >= 70 ? '#22c55e' : accuracy >= 50 ? '#f59e0b' : '#ef4444' },
        ].map((m, i) => (
          <div key={i} className="ai-metric-pill" style={{ borderColor: m.color + '55', background: m.color + '15' }}>
            <span className="ai-metric-value" style={{ color: m.color }}>{m.value}</span>
            <span className="ai-metric-label">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Three-column cards */}
      <div className="ai-cards">
        {/* Weak topics */}
        <div className="ai-card ai-card-weak">
          <div className="ai-card-head">⚠️ कमकुवत विषय</div>
          {weak.length === 0
            ? <p className="ai-empty">कोणताही कमकुवत विषय नाही 🎉</p>
            : weak.map((t, i) => (
              <div key={i} className="ai-topic-row">
                <span className="ai-topic-name">{t.name}</span>
                <div className="ai-topic-bar-bg">
                  <div className="ai-topic-bar-fill" style={{ width: t.pct + '%', background: '#ef4444' }} />
                </div>
                <span className="ai-topic-pct" style={{ color: '#ef4444' }}>{t.pct}%</span>
              </div>
            ))
          }
        </div>

        {/* Strong topics */}
        <div className="ai-card ai-card-strong">
          <div className="ai-card-head">✅ उत्कृष्ट विषय</div>
          {strong.length === 0
            ? <p className="ai-empty">अद्याप कोणताही उत्कृष्ट विषय नाही</p>
            : strong.map((t, i) => (
              <div key={i} className="ai-topic-row">
                <span className="ai-topic-name">{t.name}</span>
                <div className="ai-topic-bar-bg">
                  <div className="ai-topic-bar-fill" style={{ width: t.pct + '%', background: '#22c55e' }} />
                </div>
                <span className="ai-topic-pct" style={{ color: '#22c55e' }}>{t.pct}%</span>
              </div>
            ))
          }
        </div>

        {/* Study suggestions */}
        <div className="ai-card ai-card-suggest">
          <div className="ai-card-head">💡 AI अभ्यास योजना</div>
          {suggestions.map((s, i) => (
            <div key={i} className={`ai-suggestion ai-sug-${s.urgency}`}>
              {s.text}
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        /* ── AI Panel ── */
        .ai-panel {
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.06));
          border: 1px solid rgba(99,102,241,0.25);
          border-radius: 1.25rem;
          padding: 2rem;
          margin-bottom: 2rem;
        }
        .ai-panel-header {
          display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem;
        }
        .ai-badge {
          background: linear-gradient(135deg,#6366f1,#a855f7);
          color:#fff; font-size:0.72rem; font-weight:700;
          padding:0.2rem 0.6rem; border-radius:999px; letter-spacing:0.05em;
        }
        .ai-panel-title { font-size: 1.2rem; font-weight: 800; margin: 0; }
        .ai-subtitle { font-size: 0.82rem; color: var(--text-muted); }

        .ai-verdict {
          background: rgba(255,255,255,0.05); border-left: 3px solid #6366f1;
          border-radius: 0.5rem; padding: 0.75rem 1rem;
          font-size: 0.95rem; color: var(--text-active);
          margin-bottom: 1.5rem; line-height: 1.5;
        }

        .ai-metrics { display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .ai-metric-pill {
          display:flex; flex-direction:column; align-items:center;
          padding:0.75rem 1.5rem; border-radius:1rem; border:1px solid;
        }
        .ai-metric-value { font-size:1.5rem; font-weight:800; }
        .ai-metric-label { font-size:0.75rem; color:var(--text-muted); }

        /* Three-column cards */
        .ai-cards {
          display:grid; grid-template-columns:repeat(3,1fr); gap:1rem;
        }
        @media(max-width:700px){ .ai-cards{ grid-template-columns:1fr; } }

        .ai-card {
          border-radius:1rem; padding:1.25rem; border:1px solid;
        }
        .ai-card-weak   { background:rgba(239,68,68,0.07);   border-color:rgba(239,68,68,0.25);   }
        .ai-card-strong { background:rgba(34,197,94,0.07);   border-color:rgba(34,197,94,0.25);   }
        .ai-card-suggest{ background:rgba(245,158,11,0.07);  border-color:rgba(245,158,11,0.25);  }

        .ai-card-head {
          font-size:0.85rem; font-weight:700; letter-spacing:0.03em;
          margin-bottom:1rem; color:var(--text-active);
        }
        .ai-empty { font-size:0.85rem; color:var(--text-muted); }

        .ai-topic-row {
          display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;
        }
        .ai-topic-name {
          width:80px; font-size:0.78rem; color:var(--text-muted);
          white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex-shrink:0;
        }
        .ai-topic-bar-bg {
          flex:1; height:8px; background:rgba(255,255,255,0.1); border-radius:99px; overflow:hidden;
        }
        .ai-topic-bar-fill { height:100%; border-radius:99px; transition:width 0.8s ease; }
        .ai-topic-pct { width:35px; text-align:right; font-size:0.75rem; font-weight:700; }

        .ai-suggestion {
          font-size:0.82rem; padding:0.55rem 0.75rem; border-radius:0.5rem;
          margin-bottom:0.5rem; line-height:1.45; border-left:3px solid;
        }
        .ai-sug-high   { background:rgba(239,68,68,0.1);  border-color:#ef4444; color:#fca5a5; }
        .ai-sug-medium { background:rgba(245,158,11,0.1); border-color:#f59e0b; color:#fde68a; }
        .ai-sug-low    { background:rgba(34,197,94,0.1);  border-color:#22c55e; color:#86efac; }
      `}} />
    </div>
  );
};

const ResultScreen = ({ questions, answers, subjectName, topicName, onRetry, onExit }) => {
  const total     = questions.length;
  const attempted = Object.values(answers).filter(a => a !== null).length;
  const unattempted = total - attempted;
  const correct   = questions.filter(q => answers[q._id] === q.correctAnswer).length;
  const wrong     = attempted - correct;
  const pct       = total > 0 ? Math.round((correct / total) * 100) : 0;

  // ── Subject-wise breakdown ──────────────────────────────────────────────────
  // Group questions by their topic/subject field if available, else use provided name
  const subjectMap = {};
  questions.forEach(q => {
    const key = q.topic || q.subject || subjectName || 'विषय';
    if (!subjectMap[key]) subjectMap[key] = { total: 0, correct: 0 };
    subjectMap[key].total++;
    if (answers[q._id] === q.correctAnswer) subjectMap[key].correct++;
  });

  const subjectStats = Object.entries(subjectMap).map(([name, s]) => ({
    name,
    total: s.total,
    correct: s.correct,
    pct: Math.round((s.correct / s.total) * 100),
  }));

  const weak   = subjectStats.filter(s => s.pct < 50);
  const strong = subjectStats.filter(s => s.pct >= 70);

  // ── Feedback message ────────────────────────────────────────────────────────
  const feedbackLabel = subjectName || topicName || 'या विषयात';
  const feedback = pct >= 80
    ? `🎉 उत्तम! तुम्ही ${feedbackLabel}मध्ये खूप चांगले आहात!`
    : pct >= 60
    ? `👍 बरे आहे! थोडा आणखी सराव करा.`
    : `📚 तुम्ही ${feedbackLabel}मध्ये कमकुवत आहात. अधिक सराव आवश्यक आहे.`;

  // ── Score ring ──────────────────────────────────────────────────────────────
  const radius = 54;
  const circ   = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const ringColor = pct >= 60 ? '#22c55e' : pct >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="result-page">
      {/* Header */}
      <div className="result-header">
        <h1 className="result-title">{pct >= 60 ? '🎉 चाचणी पूर्ण!' : '📚 चाचणी संपली'}</h1>
        <p className="result-subtitle">{feedback}</p>
      </div>

      {/* Score ring + stat grid */}
      <div className="result-top">
        {/* Circular score */}
        <div className="score-ring-wrap">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
            <circle
              cx="70" cy="70" r={radius} fill="none"
              stroke={ringColor} strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
          </svg>
          <div className="score-ring-inner">
            <div className="score-ring-pct" style={{ color: ringColor }}>{pct}%</div>
            <div className="score-ring-label">गुण</div>
          </div>
        </div>

        {/* 5-stat grid */}
        <div className="result-stats">
          {[
            { label: 'एकूण प्रश्न',      value: total,       color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
            { label: 'प्रयत्न केलेले',   value: attempted,   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
            { label: 'न सोडवलेले',       value: unattempted, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
            { label: 'बरोबर',            value: correct,     color: '#22c55e', bg: 'rgba(34,197,94,0.12)'  },
            { label: 'चुकीचे',           value: wrong,       color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ background: s.bg, borderColor: s.color + '44' }}>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject analysis */}
      {subjectStats.length > 0 && (
        <div className="result-analysis">
          <h3 className="analysis-title">📊 विषयनिहाय विश्लेषण</h3>
          <div className="subject-bars">
            {subjectStats.map((s, i) => (
              <div key={i} className="subject-row">
                <div className="subject-row-name">{s.name}</div>
                <div className="subject-bar-bg">
                  <div
                    className="subject-bar-fill"
                    style={{
                      width: `${s.pct}%`,
                      background: s.pct >= 70 ? 'linear-gradient(90deg,#16a34a,#22c55e)'
                               : s.pct >= 40 ? 'linear-gradient(90deg,#b45309,#f59e0b)'
                               :               'linear-gradient(90deg,#991b1b,#ef4444)',
                    }}
                  />
                </div>
                <div className="subject-row-pct" style={{ color: s.pct >= 70 ? '#22c55e' : s.pct >= 40 ? '#f59e0b' : '#ef4444' }}>
                  {s.pct}%
                </div>
              </div>
            ))}
          </div>

          {/* Weak / Strong tags */}
          {(weak.length > 0 || strong.length > 0) && (
            <div className="subject-tags-row">
              {weak.length > 0 && (
                <div className="subject-tag-group">
                  <span className="tag-heading tag-weak">⚠️ कमकुवत विषय</span>
                  {weak.map((s, i) => (
                    <span key={i} className="subject-tag weak-tag">{s.name}</span>
                  ))}
                </div>
              )}
              {strong.length > 0 && (
                <div className="subject-tag-group">
                  <span className="tag-heading tag-strong">✅ उत्कृष्ट विषय</span>
                  {strong.map((s, i) => (
                    <span key={i} className="subject-tag strong-tag">{s.name}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── AI Analysis Panel ── */}
      <AIAnalysisPanel analysis={analyzePerformance(questions, answers, subjectName, topicName)} />

      {/* ── Answer Review Section ── */}
      <AnswerReview questions={questions} answers={answers} />

      {/* Action buttons */}
      <div className="result-actions">
        <button className="btn btn-secondary result-btn" onClick={onRetry}>
          <RotateCcw size={18} /> पुन्हा चाचणी द्या
        </button>
        <button className="btn btn-primary result-btn" onClick={onExit}>
          <CheckCircle size={18} /> डॅशबोर्डवर जा
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .result-page {
          max-width: 860px; margin: 2rem auto; padding: 0 1rem 4rem;
          animation: fadeUp 0.5s ease;
        }
        .result-header { text-align: center; margin-bottom: 2.5rem; }
        .result-title { font-size: 2.2rem; font-weight: 800; margin-bottom: 0.5rem; }
        .result-subtitle {
          font-size: 1.05rem; color: var(--text-muted);
          background: rgba(255,255,255,0.05); border-radius: 0.75rem;
          display: inline-block; padding: 0.5rem 1.5rem;
        }

        /* Top row: ring + stats */
        .result-top {
          display: flex; gap: 2rem; align-items: center;
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: 1.25rem; padding: 2rem; margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        .score-ring-wrap { position: relative; flex-shrink: 0; }
        .score-ring-inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .score-ring-pct { font-size: 1.8rem; font-weight: 800; }
        .score-ring-label { font-size: 0.75rem; color: var(--text-muted); }

        /* Stat cards */
        .result-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem; flex: 1;
        }
        @media (max-width: 480px) { .result-stats { grid-template-columns: repeat(2,1fr); } }
        .stat-card {
          border-radius: 0.875rem; border: 1px solid; padding: 1rem;
          text-align: center;
        }
        .stat-value { font-size: 1.75rem; font-weight: 800; }
        .stat-label { font-size: 0.78rem; color: var(--text-muted); margin-top: 0.2rem; }

        /* Subject analysis */
        .result-analysis {
          background: rgba(255,255,255,0.04); border: 1px solid var(--border);
          border-radius: 1.25rem; padding: 2rem; margin-bottom: 2rem;
        }
        .analysis-title {
          font-size: 1.05rem; font-weight: 700; margin-bottom: 1.5rem;
        }
        .subject-bars { display: flex; flex-direction: column; gap: 0.85rem; }
        .subject-row { display: flex; align-items: center; gap: 0.75rem; }
        .subject-row-name { width: 130px; font-size: 0.85rem; color: var(--text-muted); flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .subject-bar-bg { flex: 1; height: 10px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
        .subject-bar-fill { height: 100%; border-radius: 99px; transition: width 0.8s ease; }
        .subject-row-pct { width: 40px; text-align: right; font-size: 0.82rem; font-weight: 700; }

        /* Tags */
        .subject-tags-row { display: flex; gap: 1.5rem; flex-wrap: wrap; margin-top: 1.5rem; }
        .subject-tag-group { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
        .tag-heading { font-size: 0.82rem; font-weight: 700; }
        .tag-weak { color: #ef4444; }
        .tag-strong { color: #22c55e; }
        .subject-tag {
          font-size: 0.78rem; padding: 0.2rem 0.7rem; border-radius: 999px; font-weight: 600;
        }
        .weak-tag { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
        .strong-tag { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); }

        /* Buttons */
        .result-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .result-btn { width: auto !important; padding: 0.9rem 2.5rem !important; font-size: 1rem; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
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
  const [quizId,      setQuizId]      = useState(null);
  const timerRef = useRef();

  // Fetch questions via backend
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Step 1: Generate a quiz from the section (backend picks questions)
        let generatedQuiz = null;
        try {
          // If we have a specific topic and test number (isolated series), use them
          const payload = {};
          if (subject?.name && topic?.name && testNum) {
            payload.subject = subject.name;     // e.g. "इतिहास"
            payload.subsection = topic.name;   // e.g. "प्राचीन भारत"
            payload.testNumber = testNum;      // e.g. 1
          } else {
            payload.subject = sectionId;
            payload.limit = 30;
          }

          const genRes = await api.post('/quizzes/generate', payload);
          generatedQuiz = genRes.data;
        } catch (err) {
          console.error('Quiz generation failed:', err);
          // Fallback: use any available questions for the section
          const fallbackRes = await api.post('/quizzes/generate', { limit: 30 });
          generatedQuiz = fallbackRes.data;
        }

        if (!generatedQuiz?._id) throw new Error('Could not generate quiz');

        // Step 2: Fetch full question details
        const { data } = await api.get(`/quizzes/${generatedQuiz._id}`);
        setQuizId(generatedQuiz._id);
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
  const handleSubmit = async () => {
    clearInterval(timerRef.current);
    setSubmitted(true);

    try {
      // Save attempt to backend
      await api.post(`/quizzes/${quizId}/attempt`, {
        answers: Object.entries(answers).map(([qId, val]) => ({
          questionId: qId,
          selectedOption: val
        }))
      });
    } catch (err) {
      console.error('Failed to submit attempt:', err);
    }
  };

  // Status per question
  // States: current | answered | not-answered | marked | not-visited
  const qStatus = (q, idx) => {
    if (idx === currentIdx)  return 'current';       // Blue ring — you are here
    if (marked.has(q._id))  return 'marked';         // Orange — flagged for review
    if (answers[q._id])     return 'answered';        // Green — answered
    if (visited.has(idx))   return 'not-answered';   // Red — seen but skipped
    return 'not-visited';                            // Grey — never opened
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
      subjectName={subject?.name || subjectId}
      topicName={topic?.name || topicId}
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

  const currentQ  = questions[currentIdx];
  const isLast    = currentIdx === questions.length - 1;
  const timerRed  = timeLeft < 300;   // last 5 min → red
  const timerBlink = timeLeft < 60;   // last 1 min → blink
  const crumbs    = buildBreadcrumbs();

  return (
    <div style={{ maxWidth: '1250px', margin: '0 auto' }}>
      {/* ── Sticky Top Bar ── */}
      <div className="quiz-topbar">
        {/* Left — breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
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

        {/* Centre — prominent timer */}
        <div
          className={`quiz-timer-badge ${timerRed ? 'timer-red' : ''} ${timerBlink ? 'timer-blink' : ''}`}
          title={timerBlink ? 'एक मिनिट बाकी!' : 'वेळ'}
        >
          <Timer size={20} />
          <span className="timer-digits">{formatTime(timeLeft)}</span>
          {timerBlink && <span className="timer-warn-label">एक मिनिट बाकी!</span>}
        </div>

        {/* Right — spacer to balance layout */}
        <div style={{ flex: 1 }} />
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
                  disabled={submitted}
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
                style={{ flex: 1, color: marked.has(currentQ._id) ? '#a855f7' : '', background: marked.has(currentQ._id) ? 'rgba(168,85,247,0.15)' : '' }}
                onClick={toggleMark}
              >
                <Flag size={18} /> {marked.has(currentQ._id) ? 'पाहिले ✔' : 'पुन्हा पाहा'}
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
          <h3 className="palette-heading">प्रश्न सूची</h3>
          <div className="palette-grid">
            {questions.map((q, idx) => (
              <button
                key={q._id}
                className={`palette-btn pq-${qStatus(q, idx)}`}
                onClick={() => goTo(idx)}
                title={`प्रश्न ${idx + 1}`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="palette-legend">
            {[
              { cls: 'pq-answered',     label: 'उत्तर दिलेले',    dot: '#22c55e' },
              { cls: 'pq-not-answered', label: 'उत्तर न दिलेले', dot: '#ef4444' },
              { cls: 'pq-current',      label: 'सध्याचा प्रश्न', dot: '#6366f1' },
              { cls: 'pq-marked',       label: 'पुन्हा पाहा',       dot: '#a855f7' },
              { cls: 'pq-not-visited',  label: 'न पाहिलेले',     dot: '#6b7280' },
            ].map(l => (
              <div key={l.cls} className="legend-item">
                <div className="legend-dot" style={{ background: l.dot }} />
                <span>{l.label}</span>
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

        /* ── Timer badge ── */
        .quiz-timer-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: 2rem;
          background: rgba(245,158,11,0.12);
          border: 1.5px solid rgba(245,158,11,0.35);
          color: var(--warning);
          font-size: 1rem;
          font-weight: 700;
          white-space: nowrap;
          transition: background 0.3s, border-color 0.3s;
        }
        .quiz-timer-badge.timer-red {
          background: rgba(239,68,68,0.15);
          border-color: rgba(239,68,68,0.5);
          color: var(--danger);
        }
        .timer-digits {
          font-size: 1.35rem;
          letter-spacing: 0.06em;
          font-variant-numeric: tabular-nums;
        }
        .timer-warn-label {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.9;
          margin-left: 0.25rem;
        }
        @keyframes blink {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.25; }
        }
        .timer-blink { animation: blink 0.85s ease-in-out infinite; }

        /* ────────── QUESTION PALETTE ────────── */
        .palette-heading {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }

        /* Grid: 6 columns on desktop, 5 on small screens */
        .palette-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.45rem;
        }
        @media (max-width: 480px) {
          .palette-grid { grid-template-columns: repeat(5, 1fr); }
        }

        /* Base palette button */
        .palette-btn {
          width: 100%;
          aspect-ratio: 1;
          border-radius: 0.4rem;
          border: 2px solid transparent;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .palette-btn:hover {
          transform: scale(1.12);
          box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        }

        /* —— State colours —— */
        /* Not visited → Grey */
        .pq-not-visited {
          background: #374151;
          color: #9ca3af;
          border-color: #4b5563;
        }
        /* Current → Blue ring (Yellow fill) */
        .pq-current {
          background: #fbbf24;
          color: #1e1b4b;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.5);
          transform: scale(1.15);
        }
        /* Answered → Green */
        .pq-answered {
          background: #16a34a;
          color: #fff;
          border-color: #22c55e;
        }
        /* Visited but not answered → Red */
        .pq-not-answered {
          background: #b91c1c;
          color: #fff;
          border-color: #ef4444;
        }
        /* Marked for review → Purple */
        .pq-marked {
          background: #6b21a8;
          color: #e9d5ff;
          border-color: #a855f7;
        }

        /* Legend */
        .palette-legend {
          margin-top: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .legend-dot {
          width: 14px;
          height: 14px;
          border-radius: 3px;
          flex-shrink: 0;
        }

        /* —— Responsive: stack palette below on mobile —— */
        @media (max-width: 900px) {
          .quiz-layout {
            flex-direction: column;
          }
          .quiz-sidebar {
            order: -1;
          }
        }
      `}} />
    </div>
  );
};

export default QuizStartPage;
