import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div className="stat-icon" style={{ width: '5rem', height: '5rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)' }}>
            <AlertTriangle size={40} />
          </div>
          <h1 className="auth-title" style={{ fontSize: '2.5rem' }}>Something went wrong.</h1>
          <p className="auth-subtitle" style={{ maxWidth: '500px' }}>
            We encountered an unexpected error while rendering this page. Our team has been notified.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => window.location.href = '/dashboard'}
            >
              <Home size={18} /> Return Home
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={18} /> Reload Page
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '3rem', padding: '1rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'left', maxWidth: '800px', overflow: 'auto' }}>
              <pre style={{ color: '#fca5a5', fontSize: '0.8rem' }}>{this.state.error?.toString()}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
