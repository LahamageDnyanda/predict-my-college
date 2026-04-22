import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, XCircle, TrendingUp, Sparkles, MapPin, Loader2 } from 'lucide-react';
import api from '../utils/api';

const ComparePage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  // Selection states
  const [college1, setCollege1] = useState('');
  const [branch1, setBranch1] = useState('');
  
  const [college2, setCollege2] = useState('');
  const [branch2, setBranch2] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/cutoffs/2024'); // Use current default year
        setData(response.data);
      } catch (err) {
        console.error("Failed to load compare data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const uniqueColleges = [...new Set(data.map(item => item.institute))].sort();

  // Find branches for a specific college
  const getBranchesForCollege = (collegeName) => {
    if (!collegeName) return [];
    return data.filter(item => item.institute === collegeName).map(item => item.course).sort();
  };

  // Find selected data
  const getCollegeData = (collegeName, branchName) => {
    if (!collegeName || !branchName) return null;
    return data.find(item => item.institute === collegeName && item.course === branchName);
  };

  const data1 = getCollegeData(college1, branch1);
  const data2 = getCollegeData(college2, branch2);

  // Helper to safely get the primary Open Cutoff (GOPEN)
  const getGopenCutoffData = (collegeData) => {
    if (!collegeData || !collegeData.cutoffs) return null;
    
    // Look for any cutoff key that represents General Open
    const openKey = Object.keys(collegeData.cutoffs).find(k => 
      k.toUpperCase().includes('GOPEN') || k.toUpperCase() === 'GOPENS'
    );
    
    if (openKey) return collegeData.cutoffs[openKey];
    
    // Fallback to the first available cutoff if GOPEN isn't found
    const firstKey = Object.keys(collegeData.cutoffs)[0];
    return firstKey ? collegeData.cutoffs[firstKey] : null;
  };

  const val1 = getGopenCutoffData(data1) ? parseFloat(getGopenCutoffData(data1).percentile) : 0;
  const val2 = getGopenCutoffData(data2) ? parseFloat(getGopenCutoffData(data2).percentile) : 0;
  const winner = (val1 > 0 && val2 > 0) ? (val1 > val2 ? 1 : val2 > val1 ? 2 : 0) : 0;

  const renderCollegeColumn = (side, college, setCollege, branch, setBranch, collegeData, isWinner) => {
    const isLeft = side === 1;
    const branches = getBranchesForCollege(college);
    const cutoffData = getGopenCutoffData(collegeData);
    
    const themeColor = isLeft ? "blue" : "fuchsia";
    const themeColorLight = isLeft ? "blue-700" : "fuchsia-600";
    const themeColorDark = isLeft ? "cyan-400" : "fuchsia-400";
    
    return (
      <div className="flex flex-col gap-4">
        {/* Selectors */}
        <div className="bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 relative z-10">
          <div className="relative">
            <select
              value={college}
              onChange={(e) => {
                setCollege(e.target.value);
                setBranch(''); // Reset branch on college change
              }}
              className={`w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 font-bold text-${themeColorLight} dark:text-${themeColorDark} focus:ring-2 focus:border-${isLeft ? 'cyan' : 'fuchsia'}-500 appearance-none`}
            >
              <option value="" disabled>Select College {side}</option>
              {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
          </div>

          <div className="relative">
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              disabled={!college}
              className={`w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-700 dark:text-slate-300 focus:ring-2 focus:border-${isLeft ? 'cyan' : 'fuchsia'}-500 disabled:opacity-50 appearance-none`}
            >
              <option value="" disabled>Select Branch</option>
              {branches.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none ${!college ? 'opacity-50' : ''}`} size={18} />
          </div>
        </div>
        
        {/* Data Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-none border border-slate-200 dark:border-slate-800 min-h-[350px]">
          {!college || !branch ? (
            <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4 py-12">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <Search size={24} />
              </div>
              <p className="text-center font-medium max-w-[200px]">Select a college and branch to view data.</p>
            </div>
          ) : !cutoffData ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 py-12">
              <XCircle className="text-red-400" size={48} />
              <p className="text-center font-bold text-red-500">Data missing for this combination.</p>
            </div>
          ) : (
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col h-full space-y-6">
              <div>
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight mb-2">{college}</h3>
                  {isWinner && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-amber-200 dark:border-amber-800/50 shadow-sm shrink-0 animate-pulse">
                      🏆 Highest Tier
                    </span>
                  )}
                </div>
                <p className={`text-sm font-semibold text-${themeColor}-600 dark:text-${themeColor}-400 border border-${themeColor}-200 dark:border-${themeColor}-900/50 bg-${themeColor}-50 dark:bg-${themeColor}-900/20 inline-block px-3 py-1 rounded-full`}>{branch}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 flex-1">
                <div className="text-center mb-4">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">General Open Percentile</p>
                  <p className="text-5xl font-black text-slate-800 dark:text-white">{cutoffData.percentile || '-'}<span className="text-2xl text-slate-400">%</span></p>
                </div>
                
                <div className="space-y-3 mt-6">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Choice Code</span>
                    <span className="font-bold text-slate-900 dark:text-white">{collegeData.choice_code || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white dark:bg-slate-800 px-4 py-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Merit Rank</span>
                    <span className="font-bold text-slate-900 dark:text-white">{cutoffData.rank || '-'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
     return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-cyan-500" size={48} />
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col relative bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-80px)] font-inter text-slate-800 dark:text-slate-200">
      <header className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
          Head-to-Head <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">Comparison</span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto font-light">
          Compare any specific branch from one college directly against a branch from another!
        </p>
      </header>

      {/* Compare Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative mt-4">
        
        {/* VS Label */}
        <div className="hidden md:flex absolute top-[10%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-16 h-16 bg-gradient-to-br from-blue-600 to-fuchsia-600 rounded-full items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.4)] border-4 border-slate-50 dark:border-slate-950">
          <span className="font-black text-white italic text-xl">VS</span>
        </div>

        {renderCollegeColumn(1, college1, setCollege1, branch1, setBranch1, data1, winner === 1)}
        {renderCollegeColumn(2, college2, setCollege2, branch2, setBranch2, data2, winner === 2)}
        
      </div>
    </div>
  );
};

export default ComparePage;
