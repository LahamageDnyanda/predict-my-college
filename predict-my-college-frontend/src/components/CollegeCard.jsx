import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, CheckCircle, Target, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Helper to merge tailwind classes
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const CollegeCard = ({ college, index }) => {
  const {
    collegeName,
    branch,
    category,
    city,
    cutoffs,
    predicted,
    tier,
    chance,
    chanceColor
  } = college;

  const formatScore = (val) => val && val !== 'NA' ? Number(val).toFixed(4) : '-';

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, delay: index * 0.05 } }
  };

  const getChanceStyle = (color) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
      case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20';
      case 'red': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      default: return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
    }
  };

  const getChanceIcon = (color) => {
    switch (color) {
      case 'green': return <CheckCircle size={14} className="min-w-[14px]"/>;
      case 'yellow': return <Target size={14} className="min-w-[14px]"/>;
      case 'red': return <ShieldAlert size={14} className="min-w-[14px]"/>;
      default: return null;
    }
  };

  return (
    <motion.div 
      variants={itemVariants}
      initial="hidden"
      animate="show"
      className="bg-white dark:bg-slate-900/60 rounded-xl p-6 flex flex-col shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-colors w-full group cursor-pointer"
    >
      {/* Top Section: Info */}
      <div className="flex-1 mb-5">
        <a 
          href={`https://www.google.com/search?q=${encodeURIComponent(collegeName + " official website")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-snug mb-4 hover:text-blue-600 dark:hover:text-cyan-400 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-3 inline-block">
            {collegeName}
          </h3>
        </a>
        <div className="flex flex-wrap items-center gap-2.5 text-sm">
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-300">
            <MapPin size={12} className="text-red-500" /> {city || 'Maharashtra'}
          </span>
          <span className="font-semibold px-2.5 py-1.5 flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 text-xs">
            {branch}
          </span>
          {category && (
            <span className="font-semibold px-2.5 py-1.5 flex items-center rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800/50 text-xs">
              {category}
            </span>
          )}
          {tier !== 'Unknown' && (
            <span className="text-[10px] font-bold tracking-widest uppercase flex items-center text-slate-500 dark:text-slate-400 px-2.5 py-1.5 rounded-md border border-dashed border-slate-300 dark:border-slate-600">
              {tier}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px w-full bg-slate-100 dark:bg-slate-800/50 my-1"></div>

      {/* Bottom Section: Data metrics */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-3">
        
        {/* Historical Pills */}
        <div className="flex flex-col w-full sm:w-auto">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-2 uppercase tracking-wider">Past Cutoffs</span>
          <div className="flex gap-2">
            {[2023, 2024, 2025].map((year) => (
              <div 
                key={year} 
                className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/50 w-[60px] py-1.5 rounded border border-slate-200 dark:border-slate-700/50 shadow-sm"
              >
                <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase">'{year.toString().slice(2)}</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {formatScore(cutoffs?.[year])}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Expected block */}
        <div className="flex flex-col w-full sm:w-auto items-start sm:items-end min-w-[140px] bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
          <div className="text-left sm:text-right flex items-center gap-2 mb-1 w-full justify-start sm:justify-end">
            <span className="text-[10px] text-blue-600 dark:text-cyan-400 font-bold uppercase flex items-center gap-1">
              <TrendingUp size={12} /> '26 Expected
            </span>
          </div>
          <div className="flex items-center sm:items-end justify-between sm:justify-end w-full gap-2">
             <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              {predicted ? Number(predicted).toFixed(4) : '-'}
             </span>
             {chance !== 'Unknown' && (
              <div className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 border whitespace-nowrap", getChanceStyle(chanceColor))}>
                {getChanceIcon(chanceColor)} <span>{chance}</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default CollegeCard;