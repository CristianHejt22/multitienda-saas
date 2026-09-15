import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fef2f2', color: '#991b1b', borderRadius: '8px', margin: '20px', border: '1px solid #ef4444' }}>
          <h3>Oops! Algo salió mal en esta sección.</h3>
          <p>Por favor, envíame este texto exacto:</p>
          <pre style={{ background: '#7f1d1d', color: '#fecaca', padding: '12px', borderRadius: '4px', overflowX: 'auto', marginTop: '12px' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Recargar Página</button>
        </div>
      );
    }

    return this.props.children; 
  }
}
