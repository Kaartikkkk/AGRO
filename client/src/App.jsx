import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';
import { FarmProvider } from './context/FarmContext';
import { LocationProvider } from './context/LocationContext';
import { ToastProvider } from './components/common/Toast';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 max-w-2xl mx-auto my-12 bg-rose-50 border border-rose-200 rounded-2xl shadow-lg font-sans">
          <h2 className="text-xl font-bold text-rose-800 mb-2">Something went wrong (React Render Crash)</h2>
          <p className="text-sm text-rose-600 mb-4">Please see the technical error logs below:</p>
          <pre className="p-4 bg-rose-950 text-rose-200 text-xs font-mono rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {this.state.error && this.state.error.toString()}
            {"\n\nComponent Stack:\n"}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <LocationProvider>
            <FarmProvider>
              <div className="min-h-screen">
                <ErrorBoundary>
                  <AppRoutes />
                </ErrorBoundary>
              </div>
            </FarmProvider>
          </LocationProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
