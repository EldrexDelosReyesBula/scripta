import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Scripta caught an unhandled exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.removeItem('scripta_auto_recovery');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0e101c',
          color: '#eef2ff',
          fontFamily: 'Inter, system-ui, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            background: '#151829',
            border: '1px solid #232742',
            borderRadius: '16px',
            padding: '32px 24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'rgba(226, 75, 75, 0.15)',
              color: '#e24b4b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>Desk Recovery</h2>
            <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
              Scripta encountered a temporary disruption while loading your space. Your text state is safe.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px', width: '100%' }}>
              <button 
                type="button" 
                onClick={this.handleReload}
                style={{
                  flex: 1,
                  padding: '12px 18px',
                  background: '#e24b4b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <RefreshCw size={16} />
                <span>Reload Desk</span>
              </button>

              <button 
                type="button" 
                onClick={this.handleReset}
                style={{
                  padding: '12px 16px',
                  background: '#1a1e33',
                  color: '#94a3b8',
                  border: '1px solid #232742',
                  borderRadius: '8px',
                  fontWeight: '500',
                  fontSize: '0.85rem',
                  cursor: 'pointer'
                }}
                title="Clear local session cache if reload fails"
              >
                Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
