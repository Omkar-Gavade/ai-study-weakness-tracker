import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, Shield, UserCheck, FileText,
  Building2, Home, TrendingUp,
  ClipboardList, CalendarCheck, Trophy, BarChart2
} from 'lucide-react';
import ExamCard from '../components/ExamCard';
import PerformanceCharts from '../components/PerformanceCharts';
import api from '../api';
import mpscImg   from '../assets/mpsc_card.png';
import policeImg from '../assets/police_card.png';
import generalImg from '../assets/maharashtra_exam_prep_bg.png';

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="dash-stat-card" style={{ borderColor: color + '44', background: bg }}>
    <div className="dash-stat-icon" style={{ background: color + '22', color }}>
      <Icon size={22} />
    </div>
    <div className="dash-stat-body">
      <div className="dash-stat-value" style={{ color }}>{value}</div>
      <div className="dash-stat-label">{label}</div>
    </div>
  </div>
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get('/quizzes/stats')
      .then(res => setStats(res.data))
      .catch(() => setStats({ totalTests: 0, todayTests: 0, bestScore: 0, averageScore: 0 }))
      .finally(() => setStatsLoading(false));
  }, []);

  const examCategories = [
    {
      id: 'mpsc', name: 'MPSC (राज्य सेवा)',
      icon: <UserCheck size={32} />, color: '#6366f1',
      description: 'महाराष्ट्र लोकसेवा आयोग - वर्ग १ आणि २ पदे.', image: mpscImg
    },
    {
      id: 'police', name: 'पोलीस भरती (Police Bharti)',
      icon: <Shield size={32} />, color: '#10b981',
      description: 'महाराष्ट्र पोलीस दलात सामील होण्यासाठी सराव करा.', image: policeImg
    },
    {
      id: 'talathi', name: 'तलाठी भरती (Talathi)',
      icon: <FileText size={32} />, color: '#f59e0b',
      description: 'महसूल विभाग - तलाठी पदासाठी संपूर्ण तयारी.', image: generalImg
    },
    {
      id: 'zp', name: 'ZP भरती',
      icon: <Building2 size={32} />, color: '#ec4899',
      description: 'जिल्हा परिषद अंतर्गत विविध पदांची तयारी.', image: generalImg
    },
    {
      id: 'mhada', name: 'Mhada / इतर परीक्षा',
      icon: <Home size={32} />, color: '#8b5cf6',
      description: 'गृहनिर्माण आणि इतर राज्यस्तरीय स्पर्धा परीक्षा.', image: generalImg
    }
  ];

  const statCards = [
    { icon: ClipboardList, label: 'दिलेल्या चाचण्या',   value: statsLoading ? '…' : stats?.totalTests   ?? 0,  color: '#6366f1', bg: 'rgba(99,102,241,0.08)'  },
    { icon: CalendarCheck, label: 'आजच्या चाचण्या',    value: statsLoading ? '…' : stats?.todayTests    ?? 0,  color: '#10b981', bg: 'rgba(16,185,129,0.08)'  },
    { icon: Trophy,        label: 'सर्वोत्तम गुण',      value: statsLoading ? '…' : (stats?.bestScore    ?? 0) + '%', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
    { icon: BarChart2,     label: 'सरासरी गुण',         value: statsLoading ? '…' : (stats?.averageScore ?? 0) + '%', color: '#ec4899', bg: 'rgba(236,72,153,0.08)'  },
  ];

  return (
    <div className="dashboard-container">
      <div className="section-title">
        <LayoutDashboard size={28} className="text-primary" />
        डॅशबोर्ड
      </div>

      {/* ── Stats bar ── */}
      <div className="dash-stats-bar">
        {statCards.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      {/* ── Performance charts ── */}
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: 'var(--text-active)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          📈 कामगिरी ग्राफ
        </h2>
        <PerformanceCharts
          progressData={stats?.progressData}
          subjectData={stats?.subjectData}
          pieData={stats?.pieData}
          hasData={stats?.totalTests > 0}
        />
      </div>

      {/* ── Exam categories ── */}
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

      {/* ── Performance quick link ── */}
      <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, transparent 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ color: 'var(--text-active)', marginBottom: '0.5rem' }}>तुमची प्रगती तपासा</h3>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>तुमच्या मॉक टेस्टचा निकाल आणि विश्लेषणासाठी येथे जा.</p>
          </div>
          <Link to="/quizzes" className="btn btn-primary" style={{ width: 'auto' }}>
            विश्लेषण पहा <TrendingUp size={18} />
          </Link>
        </div>

        {stats?.weakTopics?.length > 0 && (
          <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fca5a5', marginBottom: '0.25rem', fontSize: '1rem' }}>🎯 कमकुवत विषयात सुधारणा करा</h4>
              <p style={{ color: 'rgba(252, 165, 165, 0.7)', fontSize: '0.85rem', margin: 0 }}>
                तुम्ही <strong>{stats.weakTopics.join(', ')}</strong> मध्ये मागे आहात. विशेष सराव करा.
              </p>
            </div>
            <Link to="/quiz/practice/weak" className="btn" style={{ width: 'auto', background: '#ef4444', color: '#fff', padding: '0.6rem 1.25rem' }}>
              कमकुवत विषय सराव करा
            </Link>
          </div>
        )}
      </div>

      {/* ── Scoped CSS ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Stats bar */
        .dash-stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        @media (max-width: 800px) { .dash-stats-bar { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .dash-stats-bar { grid-template-columns: 1fr; } }

        .dash-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem 1.5rem;
          border-radius: 1rem;
          border: 1px solid;
          backdrop-filter: blur(10px);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: default;
        }
        .dash-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .dash-stat-icon {
          width: 48px; height: 48px; border-radius: 0.75rem;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dash-stat-body { display: flex; flex-direction: column; }
        .dash-stat-value { font-size: 1.75rem; font-weight: 800; line-height: 1; }
        .dash-stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem; }
      `}} />
    </div>
  );
};

export default Dashboard;
