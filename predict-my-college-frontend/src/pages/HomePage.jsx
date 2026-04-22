import React from 'react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom'; // 🟢 Add this
import { ArrowRight, Search, BookOpen, Users, GraduationCap, Star, TrendingUp } from 'lucide-react';

export default function HomePage({ currentPage, setCurrentPage }) {
  const navigate = useNavigate(); // 🟢 Hook to programmatically navigate

  const handleLetsGo = () => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/predict');
    } else {
      navigate('/login');
    }
  };

   return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/20 blur-[120px] pointer-events-none transition-colors"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] pointer-events-none"></div>

      <main className="flex items-center justify-between px-8 py-16 max-w-7xl mx-auto relative z-10">
  <div className="flex-1 max-w-2xl relative">
    <h1 className="text-6xl font-black text-slate-900 dark:text-white leading-tight mb-6 transition-colors">
      Find Your Best-Fit<br />
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">Engineering College</span>
    </h1>

    <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed font-light transition-colors">
      Effortlessly predict which colleges you can get into for Engineering 
      based on your MHT-CET percentile, category, and preferences. No complex filters - 
      just fast, accurate, and personalized results.
    </p>

    <button
        onClick={handleLetsGo}
        className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-cyan-500 rounded-full hover:bg-cyan-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-600 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:-translate-y-1 space-x-2"
      >
        <span>LET’S GO</span>
        <ArrowRight className="w-5 h-5" />
      </button>

    {/* ✅ Moved inside the same div */}
    <div className="absolute top-1/2 left-1/3 w-6 h-6 bg-cyan-400 rounded-full animate-bounce shadow-[0_0_15px_rgba(34,211,238,0.8)]"></div>
  </div>

        {/* Right Illustration */}
        <div className="flex-1 relative">
          <div className="relative w-full h-96">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                <div className="w-64 h-48 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 transform rotate-12 flex items-center justify-center overflow-hidden transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-fuchsia-500/5 dark:from-cyan-500/10 dark:to-fuchsia-500/10 transition-colors"></div>
                  <div className="w-full px-6 z-10 space-y-4">
                    <div className="h-2 w-3/4 bg-slate-200 dark:bg-slate-700 rounded mb-3 transition-colors"></div>
                    <div className="h-2 w-full bg-slate-300 dark:bg-slate-800 rounded transition-colors"></div>
                    <div className="h-2 w-5/6 bg-slate-300 dark:bg-slate-800 rounded transition-colors"></div>
                    <div className="h-2 w-1/2 bg-cyan-500/50 rounded shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                  </div>
                </div>
                <div className="absolute -top-8 -left-4 w-14 h-14 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.4)] floating-element border border-cyan-300/30">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(217,70,239,0.4)] floating-element-delayed border border-fuchsia-300/30">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="absolute top-4 -right-8 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-2xl floating-element-delayed-2 border border-slate-200 dark:border-slate-700 transition-colors">
                  <BookOpen className="w-8 h-8 text-cyan-500 dark:text-cyan-400" />
                </div>

                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] border-2 border-slate-100 dark:border-slate-800 transition-colors">
                    <Search className="w-10 h-10 text-fuchsia-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-8 w-8 h-8 bg-yellow-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-8 left-4 w-6 h-6 bg-pink-400 rounded-full bounce-delayed"></div>
            <div className="absolute top-16 right-8 w-10 h-10 bg-green-400 rounded-full pulse-delayed"></div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-24 bg-white/50 dark:bg-slate-950/50 backdrop-blur-3xl border-t border-slate-200 dark:border-white/5 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-4xl font-black text-center mb-16 text-slate-900 dark:text-white transition-colors">Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">FutureCollege.com?</span></h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:border-cyan-300 dark:hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)] dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] group">
              <div className="bg-cyan-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Search className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white transition-colors">Smart Prediction</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">AI-powered college prediction based on your MHT-CET percentile and category.</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:border-fuchsia-300 dark:hover:border-fuchsia-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(217,70,239,0.2)] dark:hover:shadow-[0_0_30px_rgba(217,70,239,0.1)] group md:-translate-y-4">
              <div className="bg-fuchsia-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-fuchsia-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white transition-colors">Accurate Results</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">Get precise admission probabilities for top Engineering institutions.</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-800 p-8 rounded-3xl hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] group">
              <div className="bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:scale-110 transition-transform">
                <Star className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white transition-colors">Verified Reviews</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed transition-colors">Read authentic reviews from current students and verified alumni.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <style>
        {`
          .floating-element {
            animation: float 3s ease-in-out infinite;
          }
          .floating-element-delayed {
            animation: float 3s ease-in-out infinite;
            animation-delay: 1s;
          }
          .floating-element-delayed-2 {
            animation: float 3s ease-in-out infinite;
            animation-delay: 2s;
          }
          .bounce-delayed {
            animation: bounce 2s infinite;
            animation-delay: 1.5s;
          }
          .pulse-delayed {
            animation: pulse 2s infinite;
            animation-delay: 0.5s;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-25%); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>

      <Footer /> {/* ✅ Footer placed at the bottom */}
    </div>
  );
}
