import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, BookOpen } from 'lucide-react';
import api from '../api';
import loginBg from '../assets/maharashtra_exam_prep_bg.png';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      // In this app, data might be the user object or contain a token
      const userInfo = data.user || data;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (data.token) localStorage.setItem('token', data.token);
      setUser(userInfo);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'लॉगिन अयशस्वी. कृपया ईमेल आणि पासवर्ड तपासा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-hero-layout">
          {/* Image Side */}
          <div 
            className="auth-image-side" 
            style={{ backgroundImage: `url(${loginBg})` }}
          >
            <div className="auth-image-content">
              <div className="badge" style={{ marginBottom: '1rem', background: 'var(--primary)', color: '#fff' }}>
                महाराष्ट्र स्पर्धा परीक्षा
              </div>
              <h2>तुमच्या यशाचा मार्ग<br />इथून सुरू होतो</h2>
              <p style={{ opacity: 0.8, maxWidth: '300px' }}>पोलीस भरती, MPSC आणि इतर राज्यस्तरीय परीक्षांच्या तयारीसाठी सर्वोत्तम प्लॅटफॉर्म.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="auth-form-side">
            <div className="auth-header">
              <h1 className="auth-title">लॉगिन करा</h1>
              <p className="auth-subtitle">तुमच्या कामगिरीचे विश्लेषण करा आणि तयारीला गती द्या.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-text" style={{ marginBottom: '1.5rem' }}>{error}</div>}
              
              <div className="form-group">
                <label className="form-label">ईमेल पत्ता</label>
                <div style={{ position: 'relative' }}>
                  <Mail 
                    size={18} 
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} 
                  />
                  <input
                    type="email"
                    className="form-input"
                    placeholder="उदा. name@example.com"
                    style={{ paddingLeft: '3rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">पासवर्ड</label>
                <div style={{ position: 'relative' }}>
                  <Lock 
                    size={18} 
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} 
                  />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="तुमचा पासवर्ड टाका"
                    style={{ paddingLeft: '3rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? <Loader2 size={22} className="animate-spin" /> : <>लॉगिन करा <ArrowRight size={20} /></>}
              </button>
            </form>

            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              नवीन खाते नाही? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>नोंदणी करा</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
