import React from 'react';
import { CheckCircle, XCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * AnswerReview component
 * Displays a list of questions with user's selected option, the correct option,
 * and a detailed explanation for each.
 */
const AnswerReview = ({ questions, answers }) => {
  const [expanded, setExpanded] = React.useState({});

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="answer-review-section" style={{ marginTop: '3rem' }}>
      <h2 style={{ 
        fontSize: '1.6rem', 
        marginBottom: '1.5rem', 
        color: 'var(--text-active)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        🔍 विस्तृत स्पष्टीकरण (Detailed Review)
      </h2>
      
      <div className="review-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {questions.map((q, idx) => {
          const userAns = answers[q._id];
          const isCorrect = userAns === q.correctAnswer;
          const isSelected = (opt) => userAns === opt;
          const isCorrectOpt = (opt) => q.correctAnswer === opt;
          const questionText = q.questionText || q.text;

          return (
            <div key={q._id} className="review-card panel" style={{ 
              padding: '1.5rem', 
              borderLeft: `6px solid ${userAns === null || userAns === undefined ? '#6b7280' : (isCorrect ? '#22c55e' : '#ef4444')}`,
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              {/* Header: Question Number + Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <span style={{ fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                  प्रश्न {idx + 1}
                </span>
                {userAns === null || userAns === undefined ? (
                  <span style={{ color: '#6b7280', fontSize: '0.9rem', fontWeight: 600 }}>सोडलेले</span>
                ) : (
                  isCorrect ? 
                    <span style={{ color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
                      <CheckCircle size={16} /> बरोबर उत्तर
                    </span> : 
                    <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700 }}>
                      <XCircle size={16} /> चुकीचे उत्तर
                    </span>
                )}
              </div>

              {/* Question Text */}
              <p style={{ fontSize: '1.15rem', marginBottom: '1.5rem', color: '#fff', lineHeight: 1.6, fontWeight: 500 }}>
                {questionText}
              </p>

              {/* Options Grid */}
              <div className="review-options" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem' }}>
                {q.options.map((opt, i) => {
                  const isCorrectAnswer = isCorrectOpt(opt);
                  const isUserSelection = isSelected(opt);
                  
                  let borderColor = 'rgba(255,255,255,0.08)';
                  let backgroundColor = 'transparent';
                  let textColor = 'rgba(255,255,255,0.6)';

                  if (isCorrectAnswer) {
                    borderColor = '#22c55e';
                    backgroundColor = 'rgba(34,197,94,0.08)';
                    textColor = '#22c55e';
                  } else if (isUserSelection && !isCorrect) {
                    borderColor = '#ef4444';
                    backgroundColor = 'rgba(239, 68, 68, 0.08)';
                    textColor = '#ef4444';
                  }

                  return (
                    <div key={i} style={{ 
                      padding: '1rem', 
                      borderRadius: '0.875rem', 
                      fontSize: '0.95rem',
                      border: '1px solid',
                      borderColor,
                      background: backgroundColor,
                      color: textColor,
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      transition: 'all 0.2s'
                    }}>
                      <span style={{ fontWeight: 800, opacity: 0.5, fontSize: '0.85rem' }}>{String.fromCharCode(65 + i)}.</span>
                      <span style={{ flex: 1 }}>{opt}</span>
                      {isCorrectAnswer && <CheckCircle size={16} />}
                      {isUserSelection && !isCorrect && <XCircle size={16} />}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Toggle */}
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                <button 
                  onClick={() => toggleExpand(q._id)}
                  style={{ 
                    background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', 
                    color: '#a5b4fc', padding: '0.6rem 1.2rem', 
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.6rem', 
                    fontSize: '0.9rem', fontWeight: 700, borderRadius: '0.75rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Info size={18} /> स्पष्टीकरण पहा (Show Explanation) {expanded[q._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {expanded[q._id] && (
                  <div style={{ 
                    marginTop: '1rem', padding: '1.25rem', borderRadius: '1rem', 
                    background: 'rgba(99,102,241,0.03)', border: '1px dashed rgba(99,102,241,0.2)',
                    fontSize: '1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7,
                    animation: 'slideDown 0.3s ease'
                  }}>
                    <div style={{ color: '#a5b4fc', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <GraduationCap size={18} /> स्पष्टीकरण:
                    </div>
                    {q.explanation || "या प्रश्नासाठी स्पष्टीकरण सध्या उपलब्ध नाही. तथापि, दिलेले बरोबर उत्तर हे अधिकृत अभ्यासक्रमावर आधारित आहे."}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .review-card:hover {
          background: rgba(255,255,255,0.03) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }
      `}} />
    </div>
  );
};

const GraduationCap = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 10L12 5L2 10L12 15L22 10Z"></path>
    <path d="M6 12V17C6 17 8 20 12 20C16 20 18 17 18 17V12"></path>
  </svg>
);

export default AnswerReview;
