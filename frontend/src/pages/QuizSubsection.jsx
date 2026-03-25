import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Trophy,
  ArrowLeft,
  Play,
  Loader2
} from 'lucide-react';
import api from '../api';

const QuizSubsection = () => {
  const { sectionId, subsection } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startQuiz = async (testNum) => {
    setLoading(testNum);
    try {
      const { data } = await api.post('/quizzes/generate', {
        subsection,
        testNumber: testNum
      });
      navigate(`/quizzes/attempt/${data._id}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to generate quiz.');
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    { num: 1, title: 'सराव चाचणी - १', questions: 30, difficulty: 'मिश्र' },
    { num: 2, title: 'सराव चाचणी - २', questions: 30, difficulty: 'मिश्र' }
  ];

  return (
    <div className="quiz-subsection-container">
      <Link to={`/quizzes/section/${sectionId}`} className="nav-link" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center' }}>
        <ArrowLeft size={18} /> विभागांकडे परत जा
      </Link>

      <div className="section-title">
        {subsection} - उपलब्ध सराव चाचण्या
      </div>

      <div className="dashboard-grid">
        {tests.map((test) => (
          <div key={test.num} className="quiz-card">
            <div className="quiz-card-header">
              <div className="stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                <Trophy size={24} />
              </div>
              <div className="badge">{test.difficulty}</div>
            </div>

            <h3>{test.title}</h3>
            <div style={{ margin: '1rem 0', color: 'var(--text-muted)' }}>
              <p>• {test.questions} अनन्य प्रश्न</p>
              <p>• स्पर्धा परीक्षा स्तर</p>
              <p>• वेळ: ३० मिनिटे</p>
            </div>

            <button
              className="btn btn-primary"
              style={{ marginTop: 'auto' }}
              disabled={loading}
              onClick={() => startQuiz(test.num)}
            >
              {loading === test.num ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>परीक्षा सुरू करा <Play size={16} /></>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuizSubsection;
