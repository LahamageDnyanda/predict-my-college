import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, MapPin, Loader2, Calendar, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import TrendChart from '../components/TrendChart';

const YEARS = ['2025', '2024', '2023'];

// ─── StarTS for avg rating display ────────────────────────────────────────
const pct = (v) => (v != null ? Number(v).toFixed(4) : '—');

export default function CollegePage() {
  // ── List view state ─────────────────────────────────────────────────────
  const [colleges,   setColleges]   = useState([]);  // [{ name, city }]
  const [listLoad,   setListLoad]   = useState(true);
  const [listError,  setListError]  = useState(null);
  const [search,     setSearch]     = useState('');
  const [listYear,   setListYear]   = useState('2025');

  // ── Detail view state ───────────────────────────────────────────────────
  const [selected,   setSelected]   = useState(null); // collegeName string
  const [detail,     setDetail]     = useState(null);  // { collegeName, city, branches }
  const [detailLoad, setDetailLoad] = useState(false);
  const [detailYear, setDetailYear] = useState('2025');
  const [branchFilter, setBranchFilter] = useState('');
  const [extendedTrend, setExtendedTrend] = useState(null); // "${branch}-${category}"

  // ── Fetch unique college names for the list ──────────────────────────────
  useEffect(() => {
    setListLoad(true);
    setListError(null);

    api.get(`/colleges?year=${listYear}`)
      .then((res) => {
        const rows = res.data?.data || [];
        setColleges(rows.map(r => ({ name: r.name, city: r.city })));
      })
      .catch(() => setListError('Failed to load colleges. Please try again.'))
      .finally(() => setListLoad(false));
  }, [listYear]);

  // ── Fetch detail for selected college ────────────────────────────────────
  const loadDetail = useCallback(async (name) => {
    setDetailLoad(true);
    setDetail(null);
    try {
      const res = await api.get(`/college/${encodeURIComponent(name)}`);
      setDetail(res.data);
    } catch {
      setDetail({ error: true, collegeName: name });
    } finally {
      setDetailLoad(false);
    }
  }, []);

  const handleSelect = (name) => {
    setSelected(name);
    setBranchFilter('');
    setExtendedTrend(null);
    loadDetail(name);
  };

  const handleYearChange = (y) => {
    setDetailYear(y);
    // No re-fetch needed; we already have all years
  };

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = colleges.filter(c =>
    c.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  // ── Branches to show ──────────────────────────────────────────────────────
  const visibleBranches = detail?.branches?.filter(b =>
    !branchFilter || b.branch.toLowerCase().includes(branchFilter.toLowerCase())
  ) || [];

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <main className="p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-[calc(100vh-80px)] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[100px] pointer-events-none" />

      {/* Page header */}
      <header className="text-center mb-8 sm:mb-10 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-3">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">
            Colleges &amp; Cutoffs
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Browse MHT-CET CAP round cutoffs for 2023, 2024, and 2025.
        </p>
      </header>

      {/* ── LIST VIEW ─────────────────────────────────────────────────────── */}
      {!selected && (
        <>
          {/* Filters */}
          <section className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 max-w-4xl mx-auto p-4 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 relative z-10">
            <div className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search college name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all text-sm"
              />
            </div>
            <div className="relative w-full sm:w-44 shrink-0">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-600 dark:text-cyan-500 w-4 h-4" />
              <select
                value={listYear}
                onChange={(e) => setListYear(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 transition-all text-sm appearance-none cursor-pointer"
              >
                {YEARS.map(y => <option key={y} value={y}>{y} Data</option>)}
              </select>
            </div>
          </section>

          {listLoad ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-cyan-500 mb-3" size={40} />
              <p className="text-slate-500 dark:text-slate-400">Loading colleges…</p>
            </div>
          ) : listError ? (
            <div className="text-center py-16 text-red-500">{listError}</div>
          ) : (
            <>
              <p className="text-center text-sm text-slate-400 mb-6">{filtered.length} colleges found</p>
              <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 max-w-7xl mx-auto">
                {filtered.map((college) => (
                  <button
                    key={college.name}
                    onClick={() => handleSelect(college.name)}
                    className="bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-lg dark:shadow-none hover:border-cyan-400 dark:hover:border-cyan-500/50 transition-all duration-200 hover:-translate-y-1 text-left flex flex-col"
                  >
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <h2 className="text-sm font-bold text-slate-800 dark:text-blue-300 leading-snug mb-3">{college.name}</h2>
                      {college.city && (
                        <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin size={11} className="text-red-400" /> {college.city}
                        </span>
                      )}
                    </div>
                    <div className="bg-cyan-50 dark:bg-slate-800 px-5 py-2.5 text-xs font-semibold text-cyan-700 dark:text-cyan-400 border-t border-cyan-100 dark:border-slate-700">
                      View Cutoffs →
                    </div>
                  </button>
                ))}
              </section>
            </>
          )}
        </>
      )}

      {/* ── DETAIL VIEW ───────────────────────────────────────────────────── */}
      {selected && (
        <div className="max-w-5xl mx-auto relative z-10">
          {/* Back + title bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => { setSelected(null); setDetail(null); }}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition-colors text-sm"
            >
              <ChevronLeft size={18} /> Back to Colleges
            </button>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white text-center flex-1">{selected}</h2>

            {/* Year selector */}
            <div className="flex gap-1.5">
              {YEARS.map(y => (
                <button
                  key={y}
                  onClick={() => handleYearChange(y)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    detailYear === y
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          {detailLoad ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-cyan-500 mb-3" size={40} />
              <p className="text-slate-400">Loading branch data…</p>
            </div>
          ) : detail?.error ? (
            <p className="text-center text-red-500 py-10">Failed to load college data.</p>
          ) : detail ? (
            <>
              {/* Branch search */}
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Filter branches..."
                  value={branchFilter}
                  onChange={e => setBranchFilter(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all"
                />
              </div>

              {visibleBranches.length === 0 ? (
                <p className="text-center text-slate-500 dark:text-slate-400 py-12">
                  No branch data found for {selected}.
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {visibleBranches.map(({ branch, categories }) => (
                    <div key={branch} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                      {/* Branch header */}
                      <div className="px-6 py-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-800 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{branch}</h3>
                      </div>
                      {/* Category-wise cutoffs table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                              <th className="px-5 py-2.5 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</th>
                              {Object.keys(categories[0]?.cutoffs || {}).sort().map(y => (
                                <th key={y} className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{y}</th>
                              ))}
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trend</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {categories.map(({ category, cutoffs }) => {
                              const isExpanded = extendedTrend === `${branch}-${category}`;
                              return (
                                <React.Fragment key={category}>
                                  <tr 
                                    onClick={() => setExtendedTrend(isExpanded ? null : `${branch}-${category}`)}
                                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group"
                                  >
                                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{category}</td>
                                    {Object.keys(cutoffs).sort().map(y => (
                                      <td key={y} className="px-4 py-3 text-right text-slate-700 dark:text-slate-300 font-mono text-xs">
                                        {pct(cutoffs[y])}
                                      </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                      <TrendingUp 
                                        size={14} 
                                        className={`inline-block transition-colors ${isExpanded ? 'text-cyan-500' : 'text-slate-400 group-hover:text-cyan-400'}`} 
                                      />
                                    </td>
                                  </tr>
                                  {isExpanded && (
                                    <tr>
                                      <td colSpan={6} className="bg-slate-50/50 dark:bg-slate-900/50 px-6 py-4">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Historical Performance Trend</span>
                                          <span className="text-[10px] font-bold text-cyan-500 uppercase">{branch} • {category}</span>
                                        </div>
                                        <TrendChart data={cutoffs} />
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </main>
  );
}