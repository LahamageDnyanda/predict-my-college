import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Eye, EyeOff, Mail, Lock, User, ArrowRight,
  GraduationCap, BookOpen, Award, Target, Sparkles, Loader2
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const Login = ({ defaultSignUp = false }) => {
  const [isSignUp, setIsSignUp]           = useState(defaultSignUp);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [formData, setFormData]           = useState({ name: '', email: '', password: '', confirmPassword: '' });

  const navigate  = useNavigate();
  const location   = useLocation();
  const { login }  = useAuth();
  const from       = location.state?.from?.pathname || null;

  // If user already logged in, bounce them away
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role  = localStorage.getItem('userRole');
    if (token) navigate(role === 'admin' ? '/admin' : '/predict', { replace: true });
  }, [navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // ── SIGN UP ──────────────────────────────────────────────────────
        const res = await api.post('/auth/register', {
          name:     formData.name,
          email:    formData.email,
          password: formData.password,
        });
        toast.success(res.data.message || 'Account created! Please sign in.');
        setIsSignUp(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        // ── SIGN IN ──────────────────────────────────────────────────────
        const res = await api.post('/auth/login', {
          email:    formData.email,
          password: formData.password,
        });
        const { token, user } = res.data;
        login(user, token);
        toast.success(`Welcome back, ${user.name}! 🎉`);

        // Redirect: back to attempted page, or role-based default
        setTimeout(() => {
          const destination = from || (user.role === 'admin' ? '/admin' : '/predict');
          navigate(destination, { replace: true });
        }, 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const FloatingBubble = ({ Icon, className, color, delay = 0 }) => (
    <div
      className={`absolute w-14 h-14 ${color} rounded-full flex items-center justify-center shadow-lg ${className}`}
      style={{ animation: `float 3s ease-in-out infinite`, animationDelay: `${delay}s` }}
    >
      <Icon className="w-7 h-7 text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden flex items-center justify-center px-4">
      <Toaster position="top-center" />

      {/* Animated background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      {/* Floating icons */}
      <FloatingBubble Icon={GraduationCap} className="top-16 left-8 hidden md:flex"  color="bg-cyan-600"    delay={0}   />
      <FloatingBubble Icon={BookOpen}      className="top-24 right-16 hidden md:flex" color="bg-green-600"   delay={1}   />
      <FloatingBubble Icon={Award}         className="bottom-24 left-16 hidden md:flex" color="bg-purple-600" delay={2}   />
      <FloatingBubble Icon={Target}        className="bottom-16 right-8 hidden md:flex"  color="bg-rose-600"   delay={0.5} />

      {/* Card */}
      <div className="w-full max-w-md relative z-10">
        {/* Logo / Brand */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 mb-8 mx-auto w-fit"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">
            FutureCollege.com
          </span>
        </button>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-white mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp
                ? 'Start your college prediction journey today'
                : 'Sign in to access your personalised predictions'}
            </p>
          </div>

          {/* Toggle tabs */}
          <div className="flex bg-slate-800/60 rounded-xl p-1 mb-8 gap-1">
            {['Sign In', 'Sign Up'].map((tab, i) => (
              <button
                key={tab}
                onClick={() => setIsSignUp(i === 1)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isSignUp === (i === 1)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (signup only) */}
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all"
                />
              </div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-12 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Confirm password (signup only) */}
            {isSignUp && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  <span>{isSignUp ? "LET'S GO" : 'SIGN IN'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <p className="text-center text-slate-500 text-sm mt-6">
          <button onClick={() => navigate('/')} className="hover:text-cyan-400 transition-colors underline">
            ← Back to Home
          </button>
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
};

export default Login;
