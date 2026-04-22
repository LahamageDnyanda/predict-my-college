import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Mail, TrendingUp, ShieldCheck, Clock, Loader2,
  ArrowLeft, Activity, Search, RefreshCw, ChevronLeft, ChevronRight,
  Star, MessageSquare, Trash2
} from 'lucide-react';
import api from '../utils/api';

// ─── Sub-components ────────────────────────────────────────────────────────

const StatCard = ({ icon: Icon, label, value, iconColor, trend }) => (
  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none relative overflow-hidden group">
    <div className={`absolute -right-6 -top-6 ${iconColor}/10 group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={120} className={iconColor} />
    </div>
    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">{label}</p>
    <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-3">{value ?? '—'}</h3>
    {trend && <div className="flex items-center text-emerald-500 text-sm font-semibold"><TrendingUp size={14} className="mr-1" />{trend}</div>}
  </div>
);

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    user:  'bg-slate-100  text-slate-600  dark:bg-slate-800      dark:text-slate-400  border-slate-200  dark:border-slate-700',
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${styles[role] || styles.user}`}>
      {role || 'user'}
    </span>
  );
};

const Pagination = ({ page, pages, onPrev, onNext }) => (
  <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-100 dark:border-slate-800">
    <span className="text-xs text-slate-500">Page {page} of {pages}</span>
    <button onClick={onPrev} disabled={page <= 1} className="p-1 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <ChevronLeft size={18} />
    </button>
    <button onClick={onNext} disabled={page >= pages} className="p-1 rounded-lg disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
      <ChevronRight size={18} />
    </button>
  </div>
);

// ─── Main Dashboard ────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats,     setStats]     = useState(null);
  const [users,     setUsers]     = useState([]);
  const [activity,  setActivity]  = useState([]);
  const [reviews,   setReviews]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [userPage,   setUserPage]   = useState(1);
  const [userPages,  setUserPages]  = useState(1);
  const [actPage,    setActPage]    = useState(1);
  const [actPages,   setActPages]   = useState(1);
  const [revPage,    setRevPage]    = useState(1);
  const [revPages,   setRevPages]   = useState(1);

  const navigate = useNavigate();

  // Guard: redirect if not admin
  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'admin') navigate('/', { replace: true });
  }, [navigate]);

  const fetchStats = useCallback(async () => {
    try {
      const r = await api.get('/admin/dashboard');
      setStats(r.data.stats);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load dashboard stats');
    }
  }, []);

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      const r = await api.get(`/admin/users?page=${page}&limit=10`);
      setUsers(r.data.data);
      setUserPages(r.data.pagination.pages);
      setUserPage(page);
    } catch (err) { console.error(err); }
  }, []);

  const fetchActivity = useCallback(async (page = 1) => {
    try {
      const r = await api.get(`/admin/activity?page=${page}&limit=20`);
      setActivity(r.data.data);
      setActPages(r.data.pagination.pages);
      setActPage(page);
    } catch (err) { console.error(err); }
  }, []);

  const fetchReviews = useCallback(async (page = 1) => {
    try {
      const r = await api.get(`/admin/reviews?page=${page}&limit=20`);
      setReviews(r.data.data);
      setRevPages(r.data.pagination.pages);
      setRevPage(page);
    } catch (err) { console.error(err); }
  }, []);

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      fetchReviews(revPage);
      fetchStats();
    } catch {}
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(1), fetchActivity(1), fetchReviews(1)])
      .finally(() => setLoading(false));
  }, [fetchStats, fetchUsers, fetchActivity, fetchReviews]);

  const handleRefresh = () => {
    setLoading(true);
    Promise.all([fetchStats(), fetchUsers(userPage), fetchActivity(actPage), fetchReviews(revPage)])
      .finally(() => setLoading(false));
  };

  if (loading && !stats) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-cyan-500" size={48} />
          <p className="text-slate-500 font-medium">Loading Admin Dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl border border-red-200 dark:border-red-800 text-center max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="mb-4">{error}</p>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Return Home</button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview',  Icon: ShieldCheck },
    { id: 'users',    label: 'All Users', Icon: Users        },
    { id: 'activity', label: 'Activity',  Icon: Activity     },
    { id: 'reviews',  label: 'Reviews',   Icon: MessageSquare},
  ];

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <ShieldCheck className="text-cyan-500 w-8 h-8" />
              Admin Control Panel
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Manage users, monitor searches, and oversee platform health.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2 font-semibold shadow-sm transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 flex items-center gap-2 font-semibold shadow-sm transition"
            >
              <ArrowLeft size={16} /> Exit Admin
            </button>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 w-fit shadow-sm">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                activeTab === id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />{label}
            </button>
          ))}
        </nav>

        {/* ── Overview Tab ───────────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={Users}    label="Total Users"       value={stats?.totalUsers}       iconColor="text-blue-500"  trend="Active Community" />
              <StatCard icon={Mail}     label="Subscribers"       value={stats?.totalSubscribers} iconColor="text-purple-500" trend="Newsletter Growth" />
              <StatCard icon={Search}   label="Total Searches"    value={stats?.totalSearches}    iconColor="text-cyan-500"  trend="Prediction Queries" />
            </div>

            {/* Recent Signups */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock size={20} className="text-cyan-500" /> Recent Signups
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                      {['Name', 'Email', 'Role', 'Joined'].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {stats?.recentUsers?.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{u.name}</td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-sm">{u.email}</td>
                        <td className="px-6 py-4"><RoleBadge role={u.role} /></td>
                        <td className="px-6 py-4 text-slate-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No users yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Users Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-blue-500" /> All Registered Users
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Page {userPage} of {userPages}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                    {['#', 'Name', 'Email', 'Role', 'Searches', 'Joined'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {users.map((u, i) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 text-slate-400 text-sm">{(userPage - 1) * 10 + i + 1}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-sm">{u.email}</td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4">
                        <span className="bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 px-2.5 py-1 rounded-lg text-xs font-bold">
                          {u.searchCount ?? 0}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={userPage} pages={userPages}
              onPrev={() => fetchUsers(userPage - 1)}
              onNext={() => fetchUsers(userPage + 1)} />
          </div>
        )}

        {/* ── Activity Tab ───────────────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-fuchsia-500" /> Search Activity Log
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Page {actPage} of {actPages}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                    {['User', 'Email', 'Percentile', 'Branch', 'Category', 'Time'].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {activity.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white text-sm">{log.userName}</td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-xs">{log.userEmail}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-cyan-600 dark:text-cyan-400">{Number(log.percentile).toFixed(2)}</span>
                        <span className="text-slate-400 text-xs ml-1">%ile</span>
                      </td>
                      <td className="px-5 py-4 text-slate-700 dark:text-slate-300 text-sm">{log.branch}</td>
                      <td className="px-5 py-4">
                        <span className="bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-200 dark:border-fuchsia-800 px-2 py-0.5 rounded text-xs font-bold">
                          {log.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {activity.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No activity logs yet. Activity is recorded when users search for colleges.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={actPage} pages={actPages}
              onPrev={() => fetchActivity(actPage - 1)}
              onNext={() => fetchActivity(actPage + 1)} />
          </div>
        )}

        {/* ── Reviews Tab ─────────────────────────────────────────────────── */}
        {activeTab === 'reviews' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={20} className="text-amber-500" /> All Reviews
              </h2>
              <span className="text-xs text-slate-400">Page {revPage} of {revPages}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-left">
                    {['User', 'College', 'Rating', 'Comment', 'Date', ''].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reviews.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-slate-900 dark:text-white text-sm">
                        <div>{r.userName}</div>
                        <div className="text-xs text-slate-400">{r.userEmail}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300 text-sm max-w-[180px] truncate">{r.collegeName}</td>
                      <td className="px-5 py-4">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} size={14} className={s <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400 text-sm max-w-[250px]">
                        <p className="line-clamp-2">{r.comment}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => deleteReview(r.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No reviews yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination page={revPage} pages={revPages}
              onPrev={() => fetchReviews(revPage - 1)}
              onNext={() => fetchReviews(revPage + 1)} />
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;

