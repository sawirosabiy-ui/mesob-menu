import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MESOB Global Runtime Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '24px', background: '#1c1917', color: '#fef3c7', fontFamily: 'sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '12px', color: '#f59e0b' }}>MESOB Application Alert</h2>
          <p style={{ maxWidth: '480px', fontSize: '14px', color: '#d6d3d1', marginBottom: '16px' }}>{this.state.error?.message || 'An unexpected rendering error occurred.'}</p>
          <button
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.location.hash = '/mesob/welcome';
              window.location.reload();
            }}
            style={{ padding: '10px 20px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reset Session & Reload Welcome Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
