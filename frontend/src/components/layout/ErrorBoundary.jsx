import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Error boundary captures and displays the error without logging to the console.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-full bg-error/10 border border-error/20 flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-error text-4xl">error</span>
            </div>
            <h1 className="text-3xl font-bold text-on-surface mb-3">Something went wrong</h1>
            <p className="text-on-surface-variant mb-2">An unexpected error occurred.</p>
            <code className="text-xs text-error/70 bg-error/5 border border-error/10 px-3 py-2 rounded-lg block mb-8 break-all">
              {this.state.error?.message}
            </code>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/'; }}
              className="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
