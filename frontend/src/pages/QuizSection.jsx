import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  Cpu,
  Database,
  Network,
  Settings,
  Calculator,
  Search,
  MessageSquare,
  PieChart,
  ArrowLeft
} from 'lucide-react';

const QuizSection = () => {
  const { sectionId } = useParams();

  const sectionData = {
    'सामान्य अध्ययन': [
      { id: 'इतिहास', title: 'इतिहास (History)', icon: <Cpu />, color: '#6366f1' },
      { id: 'भूगोल', title: 'भूगोल (Geography)', icon: <Database />, color: '#10b981' },
      { id: 'राज्यशास्त्र', title: 'राज्यशास्त्र (Polity)', icon: <Network />, color: '#f59e0b' },
      { id: 'अर्थशास्त्र', title: 'अर्थशास्त्र (Economics)', icon: <Settings />, color: '#ef4444' }
    ],
    'बुद्धिमत्ता चाचणी': [
      { id: 'अंकगणित', title: 'अंकगणित (Quant)', icon: <Calculator />, color: '#8b5cf6' },
      { id: 'तर्कशक्ती', title: 'तर्कशक्ती (Reasoning)', icon: <Search />, color: '#0ea5e9' },
      { id: 'डेटा विश्लेषण', title: 'डेटा विश्लेषण (DI)', icon: <PieChart />, color: '#f97316' }
    ],
    'स्पर्धा परीक्षा तयारी': [
      { id: 'MPSC Pattern', title: 'MPSC Pattern', icon: <Cpu />, color: '#ef4444' },
      { id: 'Talathi Pattern', title: 'Talathi Pattern', icon: <Search />, color: '#10b981' },
      { id: 'Police Bharti Pattern', title: 'Police Bharti Pattern', icon: <Network />, color: '#6366f1' },
      { id: 'ZP Exam Pattern', title: 'ZP Exam Pattern', icon: <Database />, color: '#f59e0b' }
    ]
  };

  const subsections = sectionData[sectionId] || [];

  return (
    <div className="quiz-section-container">
      <Link to="/quizzes" className="nav-link" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center' }}>
        <ArrowLeft size={18} /> श्रेणी निवडीकडे परत जा
      </Link>

      <div className="section-title">
        {sectionId} - उप-विषय (Topics)
      </div>

      <div className="dashboard-grid">
        {subsections.map((sub) => (
          <Link to={`/quizzes/section/${sectionId}/${sub.id}`} key={sub.id} className="quiz-card" style={{ textDecoration: 'none' }}>
            <div className="quiz-card-header">
              <div className="stat-icon" style={{ background: `${sub.color}15`, color: sub.color }}>
                {sub.icon}
              </div>
              <div className="badge">विषय</div>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{sub.title}</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '1rem' }}>
              या विषयासाठी उपलब्ध असलेल्या सराव चाचण्या निवडा आणि तुमची तयारी तपासा.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', color: sub.color, fontWeight: '600' }}>
              चाचणी सुरू करा <ChevronRight size={18} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default QuizSection;
