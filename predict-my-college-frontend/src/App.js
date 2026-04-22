import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';

import HomePage       from './pages/HomePage';
import AboutPage      from './pages/AboutPage';
import CollegesPage   from './pages/CollegesPage';
import ReviewPage     from './pages/ReviewPage';
import ComparePage    from './pages/ComparePage';
import AdminDashboard from './pages/AdminDashboard';
import Login          from './pages/Login';
import Predictor      from './pages/Predictor';

import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider  } from './context/AuthContext';

// Layout wraps public + protected pages with nav/footer
const Layout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-200 transition-colors duration-300">
    <Navigation />
    <main className="flex-1 w-full bg-transparent">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public routes ─────────────────────────────────── */}
            <Route path="/"       element={<HomePage />} />
            <Route path="/about"  element={<Layout><AboutPage /></Layout>} />
            <Route path="/login"  element={<Login />} />
            <Route path="/signup" element={<Login defaultSignUp={true} />} />

            {/* ── Protected routes (require login) ──────────────── */}
            <Route path="/predict" element={
              <PrivateRoute>
                <Layout><Predictor /></Layout>
              </PrivateRoute>
            } />
            <Route path="/colleges" element={
              <PrivateRoute>
                <Layout><CollegesPage /></Layout>
              </PrivateRoute>
            } />
            <Route path="/compare" element={
              <PrivateRoute>
                <Layout><ComparePage /></Layout>
              </PrivateRoute>
            } />
            <Route path="/reviews" element={
              <PrivateRoute>
                <Layout><ReviewPage /></Layout>
              </PrivateRoute>
            } />
            <Route path="/admin" element={
              <PrivateRoute>
                <Layout><AdminDashboard /></Layout>
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;