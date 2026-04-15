import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-800">Something went wrong</h1>
            <p className="text-slate-500 text-sm">An unexpected error occurred. Please refresh the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 px-5 py-2.5 bg-orange-500 text-white text-sm font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
