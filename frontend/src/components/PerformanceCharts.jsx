/**
 * PerformanceCharts.jsx
 * Three Recharts charts: Line (progress), Bar (subject-wise), Pie (correct/wrong/skipped)
 */
import React from 'react';
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from 'recharts';

// ── Shared tooltip style ─────────────────────────────────────────────────────
const tooltipStyle = {
  contentStyle: {
    background: 'rgba(11,15,25,0.95)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem',
    color: '#f1f5f9',
    fontSize: '0.82rem',
  },
  labelStyle: { color: '#94a3b8', marginBottom: '4px' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

// ── Sample fallback data (shown when no real attempts exist) ──────────────────
const SAMPLE_PROGRESS = [
  { name: '#1', score: 40 }, { name: '#2', score: 55 },
  { name: '#3', score: 48 }, { name: '#4', score: 62 },
  { name: '#5', score: 70 }, { name: '#6', score: 65 },
  { name: '#7', score: 78 }, { name: '#8', score: 85 },
];
const SAMPLE_SUBJECT = [
  { name: 'इतिहास',   score: 55 },
  { name: 'भूगोल',    score: 72 },
  { name: 'राज्यशास्त्र', score: 48 },
  { name: 'विज्ञान',  score: 65 },
  { name: 'अर्थशास्त्र', score: 38 },
];
const SAMPLE_PIE = [
  { name: 'बरोबर',   value: 60, fill: '#22c55e' },
  { name: 'चुकीचे',  value: 28, fill: '#ef4444' },
  { name: 'सोडलेले', value: 12, fill: '#6b7280' },
];

// ── Custom pie label ──────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
const PerformanceCharts = ({ progressData, subjectData, pieData, hasData }) => {
  const pData = (progressData?.length)  ? progressData  : SAMPLE_PROGRESS;
  const sData = (subjectData?.length)   ? subjectData   : SAMPLE_SUBJECT;
  const piData = (pieData?.some(p=>p.value>0)) ? pieData : SAMPLE_PIE;

  const isSample = !hasData;

  return (
    <div className="charts-section">
      {isSample && (
        <div className="charts-sample-notice">
          📊 आत्ता नमुना डेटा दाखवत आहोत. चाचण्या पूर्ण केल्यावर तुमचे खरे ग्राफ येथे दिसतील.
        </div>
      )}

      <div className="charts-grid">

        {/* ── Line chart ── */}
        <div className="chart-card chart-wide">
          <div className="chart-title">📈 प्रगती (गुण कालांतराने)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={pData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => [`${v}%`, 'गुण']}
              />
              <Line
                type="monotone" dataKey="score"
                stroke="#6366f1" strokeWidth={2.5}
                dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#a5b4fc' }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bar chart ── */}
        <div className="chart-card chart-wide">
          <div className="chart-title">📊 विषयानुसार कामगिरी</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => [`${v}%`, 'सरासरी गुण']}
              />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} animationDuration={900}>
                {sData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.score >= 70 ? '#22c55e' : entry.score >= 50 ? '#f59e0b' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Pie chart ── */}
        <div className="chart-card chart-narrow">
          <div className="chart-title">🎯 उत्तरांचे विश्लेषण</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={piData} cx="50%" cy="50%"
                innerRadius={55} outerRadius={85}
                paddingAngle={3} dataKey="value"
                labelLine={false} label={PieLabel}
                animationDuration={900}
              >
                {piData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                {...tooltipStyle}
                formatter={(v, n) => [v, n]}
              />
              <Legend
                iconType="circle" iconSize={10}
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .charts-section { margin-bottom: 2.5rem; }

        .charts-sample-notice {
          background: rgba(245,158,11,0.1);
          border: 1px solid rgba(245,158,11,0.25);
          border-radius: 0.75rem;
          padding: 0.65rem 1rem;
          font-size: 0.82rem;
          color: #fde68a;
          margin-bottom: 1.25rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 320px;
          gap: 1rem;
        }
        @media (max-width: 1100px) {
          .charts-grid { grid-template-columns: 1fr 1fr; }
          .chart-narrow { grid-column: span 2; }
        }
        @media (max-width: 650px) {
          .charts-grid { grid-template-columns: 1fr; }
          .chart-narrow { grid-column: span 1; }
        }

        .chart-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 1.25rem;
          padding: 1.5rem 1.25rem 1rem;
          transition: box-shadow 0.2s;
        }
        .chart-card:hover { box-shadow: 0 6px 24px rgba(0,0,0,0.35); }

        .chart-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-active);
          margin-bottom: 1rem;
          letter-spacing: 0.01em;
        }
      `}} />
    </div>
  );
};

export default PerformanceCharts;
