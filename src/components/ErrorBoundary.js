import { Component } from 'react';

/**
 * Error Boundary - catches any runtime error in the component
 * tree and renders a graceful fallback instead of a blank page.
 * Must be a class component; hooks cannot catch render errors.
 * Console logging is dev-only to avoid leaking stack traces.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== 'production') console.error('[ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: '#000', color: '#ef4444', minHeight: '100vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', fontFamily: 'monospace', padding: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>An unexpected error occurred. Please refresh.</p>
          <button onClick={() => window.location.reload()} style={{
            padding: '0.75rem 1.5rem', background: '#7f1d1d',
            border: '1px solid #ef4444', color: '#fca5a5', fontFamily: 'monospace', cursor: 'pointer'
          }}>RELOAD PAGE</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
