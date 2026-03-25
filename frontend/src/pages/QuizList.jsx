/**
 * QuizNavigator — Smart multi-level navigation for Maharashtra Exam Quiz system
 *
 * Levels:
 *  0: /quizzes                                    → exam cards
 *  1: /quizzes/:examId                            → groups (MPSC) | subjects (others)
 *  2: /quizzes/:examId/:groupId                   → subjects (MPSC) | topics (others)
 *  3: /quizzes/:examId/:groupId/:subjectId        → topics | tests
 *  4: /quizzes/:examId/:groupId/:subjectId/:topicId → tests (→ quiz attempt)
 */
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookMarked, ChevronRight, ArrowLeft, Rocket, ClipboardList
} from 'lucide-react';
import ExamCard  from '../components/ExamCard';
import SubjectCard from '../components/SubjectCard';
import GroupCard from '../components/GroupCard';
import {
  EXAMS, getExam, getSubjects, getTopics, TESTS
} from '../data/quizData';

// ─── image assets (reuse existing) ─────────────────────────────────────────
import mpscImg   from '../assets/mpsc_card.png';
import policeImg from '../assets/police_card.png';
import generalImg from '../assets/maharashtra_exam_prep_bg.png';

const EXAM_IMAGES = {
  mpsc:   mpscImg,
  police: policeImg,
  talathi: generalImg,
  zp:      generalImg,
  mhada:   generalImg,
};

// ─── Reusable Breadcrumb ─────────────────────────────────────────────────────
const Breadcrumb = ({ crumbs }) => (
  <nav className="qnav-breadcrumb">
    {crumbs.map((c, i) => (
      <React.Fragment key={i}>
        {c.href
          ? <Link to={c.href}>{c.label}</Link>
          : <span className="current">{c.label}</span>
        }
        {i < crumbs.length - 1 && <ChevronRight size={14} />}
      </React.Fragment>
    ))}
  </nav>
);

// ─── Reusable Page Header ────────────────────────────────────────────────────
const PageHeader = ({ emoji, title, subtitle, onBack }) => (
  <div className="qnav-header">
    {onBack && (
      <button className="qnav-back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> परत जा
      </button>
    )}
    <div className="qnav-title-row">
      {emoji && <span className="qnav-header-emoji">{emoji}</span>}
      <div>
        <h1 className="qnav-title">{title}</h1>
        {subtitle && <p className="qnav-subtitle">{subtitle}</p>}
      </div>
    </div>
  </div>
);

// ─── Test cards (final level) ────────────────────────────────────────────────
// testId builder: {examId}-{groupId}-{subjectId}-{topicId}-test-{num}
const buildTestId = (examId, groupId, subjectId, topicId, testNum) =>
  [examId, groupId, subjectId, topicId, 'test', testNum].filter(Boolean).join('-');

const TestCard = ({ test, examId, groupId, subjectId, topicId }) => {
  const navigate = useNavigate();
  const testId = buildTestId(examId, groupId, subjectId, topicId, test.id.replace('test-', ''));
  return (
    <div className="test-card" onClick={() => navigate(`/quiz/start/${testId}`)}>
      <div className="test-card-icon"><ClipboardList size={28} /></div>
      <div className="test-card-body">
        <h3>{test.name}</h3>
        <p>{test.desc}</p>
      </div>
      <button className="btn btn-primary test-start-btn" onClick={(e) => { e.stopPropagation(); navigate(`/quiz/start/${testId}`); }}>
        <Rocket size={16} /> चाचणी सुरू करा
      </button>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const QuizNavigator = () => {
  const { examId, groupId, subjectId, topicId } = useParams();
  const navigate = useNavigate();

  const exam    = examId    ? getExam(examId)    : null;
  const subjects = exam     ? getSubjects(examId, groupId) : [];
  const topics   = subjectId ? getTopics(subjectId)         : [];
  const group    = exam?.hasGroups && groupId
    ? exam.groups?.find(g => g.id === groupId)
    : null;
  const subject  = subjects.find(s => s.id === subjectId);
  const topic    = topics.find(t => t.id === topicId);

  // Build breadcrumbs
  const crumbs = [{ label: 'प्रश्नमंजुषा', href: '/quizzes' }];
  if (exam)    crumbs.push({ label: exam.name,    href: exam.hasGroups ? `/quizzes/${examId}` : `/quizzes/${examId}` });
  if (group)   crumbs.push({ label: group.name,   href: `/quizzes/${examId}/${groupId}` });
  if (subject) crumbs.push({ label: subject.name, href: `/quizzes/${examId}/${groupId ?? 'general'}/${subjectId}` });
  if (topic)   crumbs.push({ label: topic.name });
  // mark last crumb as current
  if (crumbs.length > 1) crumbs[crumbs.length - 1].href = undefined;

  // testId is now built inside TestCard — no global handler needed
  const handleStartTest = null; // retained for DirectTestList fallback

  // ── LEVEL 0: Exam selection ──────────────────────────────────────────────
  if (!examId) {
    return (
      <div className="qnav-container">
        <div className="section-title">
          <BookMarked size={28} className="text-primary" />
          प्रश्नमंजुषा — परीक्षा निवडा
        </div>
        <div className="dashboard-grid">
          {EXAMS.map(ex => (
            <ExamCard
              key={ex.id}
              title={ex.name}
              description={ex.desc}
              image={EXAM_IMAGES[ex.id]}
              color={ex.color}
              route={`/quizzes/${ex.id}`}
              icon={<span style={{ fontSize: '2rem' }}>{ex.emoji}</span>}
            />
          ))}
        </div>
        <QuizNavStyles />
      </div>
    );
  }

  // ── LEVEL 1: Groups (MPSC) OR Subjects (others) ─────────────────────────
  if (examId && !groupId && !subjectId) {
    if (exam?.hasGroups) {
      // Show groups (MPSC special case)
      return (
        <div className="qnav-container">
          <Breadcrumb crumbs={crumbs} />
          <PageHeader
            emoji={exam.emoji}
            title={exam.name + ' — गट निवडा'}
            subtitle="परीक्षेतील गट निवडा आणि विषय सराव सुरू करा."
            onBack={() => navigate('/quizzes')}
          />
          <div className="group-grid">
            {exam.groups.map(g => (
              <GroupCard
                key={g.id}
                group={g}
                route={`/quizzes/${examId}/${g.id}`}
              />
            ))}
          </div>
          <QuizNavStyles />
        </div>
      );
    } else {
      // Show subjects directly (Police, Talathi, ZP, Mhada)
      return (
        <div className="qnav-container">
          <Breadcrumb crumbs={crumbs} />
          <PageHeader
            emoji={exam.emoji}
            title={exam.name + ' — विषय निवडा'}
            subtitle="सराव करायचा विषय निवडा."
            onBack={() => navigate('/quizzes')}
          />
          <div className="subject-grid">
            {subjects.map(s => (
              <SubjectCard
                key={s.id}
                subject={s}
                route={`/quizzes/${examId}/general/${s.id}`}
              />
            ))}
          </div>
          <QuizNavStyles />
        </div>
      );
    }
  }

  // ── LEVEL 2: Subjects (MPSC with group) OR Topics (others with subject) ──
  if (examId && groupId && !subjectId) {
    if (exam?.hasGroups) {
      // Show subjects for this MPSC group
      return (
        <div className="qnav-container">
          <Breadcrumb crumbs={crumbs} />
          <PageHeader
            emoji={group?.emoji}
            title={`${group?.name || ''} — विषय निवडा`}
            subtitle="कोणत्या विषयात सराव करायचा आहे?"
            onBack={() => navigate(`/quizzes/${examId}`)}
          />
          <div className="subject-grid">
            {subjects.map(s => (
              <SubjectCard
                key={s.id}
                subject={s}
                route={`/quizzes/${examId}/${groupId}/${s.id}`}
              />
            ))}
          </div>
          <QuizNavStyles />
        </div>
      );
    } else {
      // For non-MPSC, groupId is 'general' — show topics for the "subject" (which is groupId)
      const topicSubjects = getTopics(groupId);
      const subjectForNonMpsc = getSubjects(examId).find(s => s.id === groupId);
      return (
        <div className="qnav-container">
          <Breadcrumb crumbs={[
            { label: 'प्रश्नमंजुषा', href: '/quizzes' },
            { label: exam.name, href: `/quizzes/${examId}` },
            { label: subjectForNonMpsc?.name || groupId },
          ]} />
          <PageHeader
            emoji={subjectForNonMpsc?.emoji}
            title={(subjectForNonMpsc?.name || groupId) + ' — प्रकरण निवडा'}
            subtitle="कोणत्या प्रकरणातून सराव करायचा आहे?"
            onBack={() => navigate(`/quizzes/${examId}`)}
          />
          {topicSubjects.length > 0 ? (
            <div className="topic-grid">
              {topicSubjects.map(t => (
                <TopicCard
                  key={t.id}
                  topic={t}
                  route={`/quizzes/${examId}/${groupId}/${t.id}`}
                  color={subjectForNonMpsc?.color}
                />
              ))}
            </div>
          ) : (
            <DirectTestList
              examId={examId}
              groupId={groupId}
              subjectId={groupId}
              topicId={null}
            />
          )}
          <QuizNavStyles />
        </div>
      );
    }
  }

  // ── LEVEL 3: Topics for subject ──────────────────────────────────────────
  if (examId && groupId && subjectId && !topicId) {
    return (
      <div className="qnav-container">
        <Breadcrumb crumbs={crumbs} />
        <PageHeader
          emoji={subject?.emoji}
          title={(subject?.name || subjectId) + ' — प्रकरण निवडा'}
          subtitle="कोणत्या प्रकरणातून सराव करायचा आहे?"
          onBack={() => navigate(`/quizzes/${examId}/${groupId}`)}
        />
        {topics.length > 0 ? (
          <div className="topic-grid">
            {topics.map(t => (
              <TopicCard
                key={t.id}
                topic={t}
                route={`/quizzes/${examId}/${groupId}/${subjectId}/${t.id}`}
                color={subject?.color}
              />
            ))}
          </div>
        ) : (
          <DirectTestList sectionId={exam?.sectionId} onStart={handleStartTest} />
        )}
        <QuizNavStyles />
      </div>
    );
  }

  // ── LEVEL 4: Tests for topic ─────────────────────────────────────────────
  if (examId && groupId && subjectId && topicId) {
    return (
      <div className="qnav-container">
        <Breadcrumb crumbs={crumbs} />
        <PageHeader
          emoji="📝"
          title={(topic?.name || topicId) + ' — चाचणी निवडा'}
          subtitle="कोणती चाचणी द्यायची आहे?"
          onBack={() => navigate(`/quizzes/${examId}/${groupId}/${subjectId}`)}
        />
        <div className="test-list">
          {TESTS.map(test => (
            <TestCard
              key={test.id}
              test={test}
              examId={examId}
              groupId={groupId}
              subjectId={subjectId}
              topicId={topicId}
            />
          ))}
        </div>
        <QuizNavStyles />
      </div>
    );
  }

  return null;
};

// ── Helper: Topic card ───────────────────────────────────────────────────────
const TopicCard = ({ topic, route, color = '#6366f1' }) => (
  <Link to={route} style={{ textDecoration: 'none' }}>
    <div className="topic-card" style={{ borderLeft: `4px solid ${color}` }}>
      <div className="topic-card-body">
        <h3 style={{ color: 'var(--text-active)' }}>{topic.name}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{topic.desc}</p>
      </div>
      <ChevronRight size={20} style={{ color, flexShrink: 0 }} />
    </div>
  </Link>
);

// ── Helper: Direct test list (when no topics defined) ────────────────────────
const DirectTestList = ({ examId, groupId, subjectId, topicId }) => (
  <div>
    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
      खालील चाचण्या उपलब्ध आहेत:
    </p>
    <div className="test-list">
      {TESTS.map(test => (
        <TestCard
          key={test.id}
          test={test}
          examId={examId}
          groupId={groupId}
          subjectId={subjectId}
          topicId={topicId}
        />
      ))}
    </div>
  </div>
);

// ── Scoped styles ─────────────────────────────────────────────────────────────
const QuizNavStyles = () => (
  <style dangerouslySetInnerHTML={{ __html: `
    .qnav-container { max-width: 1100px; margin: 0 auto; padding-bottom: 4rem; animation: fadeUp 0.4s ease; }
    @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }

    /* Breadcrumb */
    .qnav-breadcrumb { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.5rem; flex-wrap: wrap; }
    .qnav-breadcrumb a { color: var(--text-muted); text-decoration: none; transition: color 0.2s; }
    .qnav-breadcrumb a:hover { color: var(--primary); }
    .qnav-breadcrumb .current { color: var(--primary); font-weight: 500; }

    /* Header */
    .qnav-header { margin-bottom: 2.5rem; }
    .qnav-back-btn { background: none; border: none; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; cursor: pointer; margin-bottom: 1rem; padding: 0; transition: color 0.2s; }
    .qnav-back-btn:hover { color: var(--text-active); }
    .qnav-title-row { display: flex; align-items: center; gap: 1rem; }
    .qnav-header-emoji { font-size: 2.75rem; line-height: 1; }
    .qnav-title { font-size: 2rem; font-weight: 700; margin: 0; }
    .qnav-subtitle { color: var(--text-muted); margin: 0.4rem 0 0; font-size: 1rem; }

    /* Group grid */
    .group-grid { display: flex; flex-direction: column; gap: 1.25rem; }
    .group-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.75rem 2rem; background: var(--surface); border: 1px solid var(--accent, var(--border)); border-radius: 1.25rem; transition: all 0.3s; cursor: pointer; }
    .group-card:hover { transform: translateX(8px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
    .group-emoji-box { width: 4rem; height: 4rem; border-radius: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .group-emoji { font-size: 1.75rem; }
    .group-card-content { flex: 1; }
    .group-card-title { font-size: 1.3rem; font-weight: 700; margin: 0 0 0.4rem; text-transform: none; }
    .group-card-desc { color: var(--text-muted); margin: 0; font-size: 0.95rem; }

    /* Subject grid */
    .subject-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1.5rem; }
    .subject-card { background: var(--surface); border-radius: 1.25rem; overflow: hidden; transition: all 0.3s; cursor: pointer; position: relative; border: 1px solid var(--border); }
    .subject-card:hover { transform: translateY(-6px); box-shadow: 0 12px 28px rgba(0,0,0,0.35); }
    .subject-card-bar { height: 4px; background: var(--accent, var(--primary)); }
    .subject-emoji { font-size: 2.5rem; padding: 1.5rem 1.5rem 0.5rem; display: block; }
    .subject-card-body { padding: 0 1.5rem 1rem; }
    .subject-card-title { font-size: 1.15rem; font-weight: 700; margin: 0 0 0.4rem; color: var(--text-active); }
    .subject-card-desc { color: var(--text-muted); font-size: 0.85rem; margin: 0; line-height: 1.5; }
    .subject-card-footer { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1.5rem; background: rgba(0,0,0,0.15); color: var(--accent, var(--primary)); font-size: 0.85rem; font-weight: 600; }

    /* Topic grid */
    .topic-grid { display: flex; flex-direction: column; gap: 1rem; }
    .topic-card { display: flex; align-items: center; gap: 1.5rem; padding: 1.5rem 2rem; background: var(--surface); border-radius: 1.25rem; transition: all 0.3s; cursor: pointer; }
    .topic-card:hover { transform: translateX(6px); background: var(--surface-hover); }
    .topic-card-body { flex: 1; }

    /* Test cards */
    .test-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .test-card { display: flex; align-items: center; gap: 1.5rem; padding: 2rem; background: var(--surface); border-radius: 1.25rem; border: 1px solid var(--border); cursor: pointer; transition: all 0.3s; }
    .test-card:hover { border-color: var(--primary); box-shadow: 0 8px 24px rgba(99,102,241,0.2); transform: translateY(-3px); }
    .test-card-icon { width: 3.5rem; height: 3.5rem; background: var(--primary-bg); color: var(--primary); border-radius: 1rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .test-card-body { flex: 1; }
    .test-card-body h3 { margin: 0 0 0.3rem; font-size: 1.3rem; }
    .test-card-body p { margin: 0; color: var(--text-muted); font-size: 0.9rem; }
    .test-start-btn { width: auto; padding: 0.75rem 2rem; font-size: 0.95rem; }

    @media (max-width: 768px) {
      .subject-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
      .qnav-title { font-size: 1.5rem; }
      .test-card { flex-direction: column; align-items: flex-start; }
      .test-start-btn { width: 100%; justify-content: center; }
    }
  `}} />
);

export default QuizNavigator;
