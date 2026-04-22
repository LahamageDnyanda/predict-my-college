import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Sparkles, GraduationCap, ChevronDown, SlidersHorizontal, ArrowLeft, ShieldAlert, Download } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/api';
import CollegeCard from '../components/CollegeCard';

const Predictor = () => {
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({
    percentile: '',
    branch: '',
    category: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  React.useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await api.get('/options');
        if (response.data.success) {
          const fetchedBranches = response.data.data.branches;
          const fetchedCategories = response.data.data.categories;
          
          setBranches(fetchedBranches);
          setCategories(fetchedCategories);
          
          if (fetchedBranches.length > 0 && fetchedCategories.length > 0) {
            setFormData(prev => ({
              ...prev, 
              branch: fetchedBranches[0],
              category: fetchedCategories[0]
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch options", error);
        toast.error("Could not load form options from server.");
      }
    };
    fetchOptions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!formData.percentile || formData.percentile < 0 || formData.percentile > 100) {
      toast.error("Please enter a valid percentile between 0 and 100");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    const start = Date.now();

    try {
      const response = await api.post('/predict', formData);
      const elapsed = Date.now() - start;
      if (elapsed < 800) await new Promise(r => setTimeout(r, 800 - elapsed));

      if (response.data.success) {
        // Backend already returns fully-grouped cards with:
        //   cutoff_2023, cutoff_2024, cutoff_2025, predicted_cutoff_2026
        // Just sort and hand them straight to CollegeCard
        const cards = response.data.data
          .sort((a, b) => (b.predicted || 0) - (a.predicted || 0));

        setResults(cards);
        if (cards.length === 0) {
          toast("No colleges found for this criteria.", { icon: "ℹ️" });
        } else {
          toast.success(`Found ${cards.length} colleges matching your profile!`);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.error || "Error connecting to server.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 flex flex-col relative">
      <Toaster position="top-center" />
      
        <header className="mb-8 md:mb-12 relative z-10 print:hidden">
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            Discover Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Dream College</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
            Advanced prediction engine using real MHT-CET CAP round data from 2023-2025.
          </p>
        </header>

        <div className="flex flex-col xl:flex-row gap-8">
          {/* Input Form Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full xl:w-[400px] shrink-0 relative z-10 print:hidden"
          >
          <div className="glass-card rounded-3xl p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 text-cyan-400">
              <Sparkles size={100} />
            </div>

            <form onSubmit={handlePredict} className="relative z-10 flex flex-col gap-6">
              
              {/* Percentile Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <GraduationCap size={16} className="text-cyan-400"/> Your Percentile
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.0000001"
                    name="percentile"
                    value={formData.percentile}
                    onChange={handleInputChange}
                    placeholder="e.g. 94.5678123"
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-3.5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all font-sans placeholder:text-slate-600 shadow-inner"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%ile</span>
                </div>
              </div>

              {/* Branch Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-cyan-400"/> Preferred Branch
                </label>
                <div className="relative">
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-3.5 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    {branches.map(b => <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                </div>
              </div>

              {/* Category & Quota Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Search size={16} className="text-cyan-400"/> Seat Type / Category
                </label>
                <div className="relative">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-3.5 text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all appearance-none cursor-pointer shadow-inner"
                  >
                    {categories.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={20} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 transition-all active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <Sparkles className="group-hover:rotate-12 transition-transform" size={20} /> 
                    Predict Colleges
                  </>
                )}
              </button>

            </form>
          </div>
        </motion.div>

        {/* Results Section */}
        <div className="flex-1 w-full min-h-[400px]">
          <AnimatePresence mode="wait">
            {!hasSearched ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50"
              >
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(34,211,238,0.2)] border border-slate-800">
                  <Search className="text-cyan-400" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Ready to Predict?</h3>
                <p className="text-slate-400 max-w-md">
                  Enter your MHT-CET percentile and preferences to see your predicted college admissions in deep space.
                </p>
              </motion.div>
            ) : loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center py-20"
              >
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-cyan-500 rounded-full border-t-transparent animate-spin shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
                </div>
                <p className="mt-6 text-cyan-400 font-medium animate-pulse">Analyzing CAP Round cutoff patterns...</p>
              </motion.div>
            ) : results && results.length > 0 ? (
              <motion.div 
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    Predicted Matches <span className="text-sm font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-md shadow-[0_0_10px_rgba(34,211,238,0.2)]">{results.length}</span>
                  </h3>
                  <div className="flex items-center gap-4 print:hidden">
                    <button onClick={() => window.print()} className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-semibold shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                      <Download size={16} /> Download PDF
                    </button>
                    <button onClick={() => {setHasSearched(false); setResults(null);}} className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                      <ArrowLeft size={16} /> Reset
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                  {results.map((college, idx) => (
                    <CollegeCard key={`${college.collegeName}-${idx}`} college={college} index={idx} />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-red-100 rounded-3xl bg-red-50/30"
              >
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                  <ShieldAlert className="text-red-500" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Matches Found</h3>
                <p className="text-slate-500 max-w-md">
                  We couldn't find any colleges matching your criteria. Try adjusting your preferred branch or percentile safely.
                </p>
                <button onClick={() => {setHasSearched(false); setResults(null);}} className="mt-6 text-brand-600 font-semibold hover:underline">
                  Try Again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Predictor;
