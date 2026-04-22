import React, { useState } from 'react';
import { GraduationCap, Sparkles, ChevronRight, LayoutDashboard, History } from 'lucide-react';
const Home = () => {
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar - Makes it look like a serious Dashboard */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col p-6">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-700 mb-10">
          <Sparkles className="fill-blue-600" size={24} /> PredictMyCollege
        </div>
        
        <nav className="space-y-2">
          <div className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-xl font-medium">
            <LayoutDashboard size={20} /> Predictor
          </div>
          <div className="flex items-center gap-3 p-3 text-slate-400 hover:bg-slate-50 rounded-xl transition cursor-not-allowed">
            <History size={20} /> History
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-12">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">College Predictor 2026</h1>
            <p className="text-slate-500">Based on latest MHTCET 2023-2025 cutoff data.</p>
          </header>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
            <div className="p-8 md:p-12">
              {step === 1 && (
                <div className="space-y-8 animate-in">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-slate-900">Step 1: Your Score</h2>
                    <p className="text-slate-500 text-sm">Enter your merit rank or percentile to begin.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                      <input 
                        type="number" 
                        placeholder="Enter your Rank (e.g. 15400)" 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white outline-none transition-all font-medium"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2 group transition-all"
                  >
                    Continue <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in">
                   <h2 className="text-2xl font-bold text-slate-900">Step 2: Preferences</h2>
                   {/* Dropdowns for Branch and Category go here */}
                   <button onClick={() => setStep(1)} className="text-slate-400 font-medium text-sm">← Go Back</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;