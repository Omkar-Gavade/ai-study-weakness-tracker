import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';
import registerBg from '../assets/maharashtra_exam_prep_bg.png';

const Register = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('पासवर्ड जुळत नाहीत.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      const userInfo = data.user || data;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      if (data.token) localStorage.setItem('token', data.token);
      setUser(userInfo);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-hero-layout" style={{ flexDirection: 'row-reverse' }}>
          {/* Image Side */}
          <div 
            className="auth-image-side" 
            style={{ backgroundImage: `url(${registerBg})` }}
          >
            <div className="auth-image-content">
              <div className="badge" style={{ marginBottom: '1rem', background: 'var(--success)', color: '#fff' }}>
                नवीन सुरुवात
              </div>
              <h2>तुमच्या स्वप्नांना<br />बळ द्या</h2>
              <p style={{ opacity: 0.8, maxWidth: '300px' }}>आजच नोंदणी करा आणि तुमच्या तयारीला एक नवी दिशा द्या.</p>
            </div>
          </div>

          {/* Form Side */}
          <div className="auth-form-side">
            <div className="auth-header">
              <h1 className="auth-title">नोंदणी करा</h1>
              <p className="auth-subtitle">तुमच्या यशाच्या प्रवासाला आजच सुरुवात करा.</p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && <div className="error-text" style={{ marginBottom: '1.5rem' }}>{error}</div>}
              
              <div className="form-group">
                <label className="form-label">पूर्ण नाव</label>
                <div style={{ position: 'relative' }}>
                  <User 
                    size={18} 
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} 
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="उदा. राहुल पाटील"
                    style={{ paddingLeft: '3rem' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

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
                    placeholder="किमान ६ अक्षरे"
                    style={{ paddingLeft: '3rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">पासवर्ड पुष्टी करा</label>
                <div style={{ position: 'relative' }}>
                  <Lock 
                    size={18} 
                    style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} 
                  />
                  <input
                    type="password"
                    className="form-input"
                    placeholder="पासवर्ड पुन्हा टाका"
                    style={{ paddingLeft: '3rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? <Loader2 size={22} className="animate-spin" /> : <>नोंदणी करा <ArrowRight size={20} /></>}
              </button>
            </form>

            <p style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              आधीच खाते आहे? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>लॉगिन करा</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
