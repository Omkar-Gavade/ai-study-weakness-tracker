import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { BookOpen, LogOut, LayoutDashboard } from 'lucide-react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamDetails from './pages/ExamDetails';
import QuizList from './pages/QuizList';
import QuizAttemptPage from './pages/QuizAttemptPage';
import QuizSection from './pages/QuizSection';
import QuizSubsection from './pages/QuizSubsection';
import QuizStartPage from './pages/QuizStartPage';
import WeakTopicPractice from './pages/WeakTopicPractice';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="layout">
        <nav className="navbar">
          <Link to={user ? "/dashboard" : "/"} className="nav-brand">
            <BookOpen size={24} color="var(--primary)" />
            <span>स्पर्धा मित्र</span>
          </Link>
          <div className="nav-links">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">
                  <LayoutDashboard size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  डॅशबोर्ड
                </Link>
                <Link to="/quizzes" className="nav-link">परीक्षा केंद्र</Link>
                <button onClick={logout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', width: 'auto' }}>
                  <LogOut size={16} /> बाहेर पडा
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">लॉगिन</Link>
                <Link to="/register" className="nav-link active">नोंदणी करा</Link>
              </>
            )}
          </div>
        </nav>

        <main className="main-content">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              <Route path="/login" element={<Login setUser={setUser} />} />
              <Route path="/register" element={<Register setUser={setUser} />} />
              <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/exam/:examId" element={user ? <ExamDetails /> : <Navigate to="/login" />} />
              <Route path="/exam/:examId/:subGroupId" element={user ? <ExamDetails /> : <Navigate to="/login" />} />
              {/* ── Quiz Navigation (4-level deep) ── */}
              <Route path="/quizzes" element={user ? <QuizList /> : <Navigate to="/login" />} />
              <Route path="/quizzes/:examId" element={user ? <QuizList /> : <Navigate to="/login" />} />
              <Route path="/quizzes/:examId/:groupId" element={user ? <QuizList /> : <Navigate to="/login" />} />
              <Route path="/quizzes/:examId/:groupId/:subjectId" element={user ? <QuizList /> : <Navigate to="/login" />} />
              <Route path="/quizzes/:examId/:groupId/:subjectId/:topicId" element={user ? <QuizList /> : <Navigate to="/login" />} />
              {/* ── Direct quiz start (no redirect) ── */}
              <Route path="/quiz/start/:testId" element={user ? <QuizStartPage /> : <Navigate to="/login" />} />
              <Route path="/quiz/practice/weak" element={user ? <WeakTopicPractice /> : <Navigate to="/login" />} />
              {/* ── Actual quiz attempt (existing) ── */}
              <Route path="/quizzes/section/:sectionId" element={user ? <QuizSection /> : <Navigate to="/login" />} />
              <Route path="/quizzes/section/:sectionId/:subsection" element={user ? <QuizSubsection /> : <Navigate to="/login" />} />
              <Route path="/quizzes/attempt/:id" element={user ? <QuizAttemptPage /> : <Navigate to="/login" />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;
