import React, { useState, useEffect, useCallback } from 'react';
import { Star, StarOff, Send, Loader2, Trash2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// Star rating component
const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={readonly}
        onClick={() => onChange && onChange(star)}
        className={`transition-transform ${readonly ? 'cursor-default' : 'hover:scale-110'}`}
      >
        {star <= value
          ? <Star size={20} className="text-amber-400 fill-amber-400" />
          : <StarOff size={20} className="text-slate-300 dark:text-slate-600" />}
      </button>
    ))}
  </div>
);

// Single review card
const ReviewCard = ({ review, onDelete, isAdmin }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {(review.userName || 'A')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{review.userName || 'Anonymous'}</p>
            <p className="text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>
        <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-2 truncate">
          🏫 {review.collegeName}
        </p>
        <StarRating value={review.rating} readonly />
        <p className="text-slate-600 dark:text-slate-300 text-sm mt-3 leading-relaxed">{review.comment}</p>
      </div>
      {isAdmin && (
        <button
          onClick={() => onDelete(review.id)}
          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors shrink-0"
          title="Delete review"
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  </div>
);

export default function ReviewPage() {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';
  const isLoggedIn = !!user;

  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [page,     setPage]     = useState(1);
  const [pages,    setPages]    = useState(1);
  const [total,    setTotal]    = useState(0);

  const [form, setForm] = useState({ collegeName: '', rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchReviews = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/reviews?page=${p}&limit=12`);
      if (res.data.success) {
        setReviews(res.data.data);
        setPages(res.data.pagination.pages || 1);
        setTotal(res.data.pagination.total || 0);
        setPage(p);
      }
    } catch (err) {
      toast.error('Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(1); }, [fetchReviews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.collegeName.trim()) return toast.error('Please enter a college name.');
    if (form.rating === 0)        return toast.error('Please select a rating.');
    if (!form.comment.trim())     return toast.error('Please write a comment.');

    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      toast.success('Review submitted! Thank you.');
      setForm({ collegeName: '', rating: 0, comment: '' });
      setShowForm(false);
      fetchReviews(1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      toast.success('Review deleted.');
      fetchReviews(page);
    } catch (err) {
      toast.error('Failed to delete review.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
      <Toaster position="top-center" />

      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-fuchsia-600 dark:from-cyan-400 dark:to-fuchsia-500">
              Student Reviews
            </span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl mx-auto">
            Authentic college experiences shared by real students.
          </p>
          <div className="mt-2 text-sm text-slate-400">{total} review{total !== 1 ? 's' : ''} total</div>
        </div>

        {/* Write Review button / form */}
        {!showForm ? (
          <div className="flex justify-center mb-10">
            <button
              onClick={() => {
                if (!isLoggedIn) {
                  toast('Please log in to write a review.', { icon: '🔒' });
                  return;
                }
                setShowForm(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold px-6 py-3 rounded-2xl shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-0.5 transition-all"
            >
              <MessageSquare size={18} /> Write a Review
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl mb-10 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <MessageSquare size={20} className="text-cyan-500" /> Write a Review
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">College Name *</label>
                <input
                  type="text"
                  placeholder="e.g. MIT Academy of Engineering, Alandi"
                  value={form.collegeName}
                  onChange={e => setForm(f => ({ ...f, collegeName: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rating *</label>
                <StarRating value={form.rating} onChange={r => setForm(f => ({ ...f, rating: r }))} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Your Review *</label>
                <textarea
                  rows={4}
                  placeholder="Share your experience — academics, campus life, placements..."
                  value={form.comment}
                  onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60 transition-all hover:-translate-y-0.5"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Reviews grid */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-cyan-500" size={40} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star size={32} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Reviews Yet</h3>
            <p className="text-slate-400">Be the first to share your college experience!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reviews.map(review => (
                <ReviewCard key={review.id} review={review} onDelete={handleDelete} isAdmin={isAdmin} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button onClick={() => fetchReviews(page - 1)} disabled={page <= 1} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">Page {page} of {pages}</span>
                <button onClick={() => fetchReviews(page + 1)} disabled={page >= pages} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
