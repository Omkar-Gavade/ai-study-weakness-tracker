import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  UserCheck,
  FileText,
  Building2,
  Home,
  TrendingUp
} from 'lucide-react';
import ExamCard from '../components/ExamCard';
import mpscImg from '../assets/mpsc_card.png';
import policeImg from '../assets/police_card.png';
import generalImg from '../assets/maharashtra_exam_prep_bg.png';

const Dashboard = () => {
  const examCategories = [
    {
      id: 'mpsc',
      name: 'MPSC (राज्य सेवा)',
      icon: <UserCheck size={32} />,
      color: '#6366f1',
      description: 'महाराष्ट्र लोकसेवा आयोग - वर्ग १ आणि २ पदे.',
      image: mpscImg
    },
    {
      id: 'police',
      name: 'पोलीस भरती (Police Bharti)',
      icon: <Shield size={32} />,
      color: '#10b981',
      description: 'महाराष्ट्र पोलीस दलात सामील होण्यासाठी सराव करा.',
      image: policeImg
    },
    {
      id: 'talathi',
      name: 'तलाठी भरती (Talathi)',
      icon: <FileText size={32} />,
      color: '#f59e0b',
      description: 'महसूल विभाग - तलाठी पदासाठी संपूर्ण तयारी.',
      image: generalImg // Placeholder
    },
    {
      id: 'zp',
      name: 'ZP भरती',
      icon: <Building2 size={32} />,
      color: '#ec4899',
      description: 'जिल्हा परिषद अंतर्गत विविध पदांची तयारी.',
      image: generalImg // Placeholder
    },
    {
      id: 'mhada',
      name: 'Mhada / इतर परीक्षा',
      icon: <Home size={32} />,
      color: '#8b5cf6',
      description: 'गृहनिर्माण आणि इतर राज्यस्तरीय स्पर्धा परीक्षा.',
      image: generalImg // Placeholder
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="section-title">
        <LayoutDashboard size={28} className="text-primary" />
        डॅशबोर्ड
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text-active)' }}>परीक्षांचे प्रकार</h2>
        <div className="dashboard-grid">
          {examCategories.map((exam) => (
            <ExamCard
              key={exam.id}
              title={exam.name}
              description={exam.description}
              icon={exam.icon}
              color={exam.color}
              image={exam.image}
              route={`/exam/${exam.id}`}
            />
          ))}
        </div>
      </div>

      {/* Performance Quick Link */}
      <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)' }}>
        <div>
          <h3 style={{ color: 'var(--text-active)', marginBottom: '0.5rem' }}>तुमची प्रगती तपासा</h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>तुमच्या मॉक टेस्टचा निकाल आणि विश्लेषणासाठी येथे जा.</p>
        </div>
        <Link to="/quizzes" className="btn btn-primary" style={{ width: 'auto' }}>
          विश्लेषण पहा <TrendingUp size={18} />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
