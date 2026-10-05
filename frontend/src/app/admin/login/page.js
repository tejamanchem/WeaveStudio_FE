'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLogin } from '@/lib/api';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin({ email, password });
      localStorage.setItem('admin_token', res.data.token);
      localStorage.setItem('admin_email', res.data.email);
      toast.success('Welcome back to the WeaveStudio Atelier');
      router.push('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F5] px-4 py-12 relative overflow-hidden">
      {/* Decorative Atelier background circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-terracotta-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sage-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-card border border-brand-200 p-8 sm:p-10 relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-terracotta-500 text-white font-serif font-bold text-2xl shadow-soft mb-1">
            W
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-600">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atelier Management Portal</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
            WeaveStudio Admin
          </h1>
          <p className="text-xs text-charcoal-500">
            Secure console for orders, crochet inventory, patron notifications, and sales analytics.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs pl-10 pr-4 py-3 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all font-medium placeholder:text-charcoal-400"
                placeholder="admin@weavestudio.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs pl-10 pr-4 py-3 bg-brand-50/70 border border-brand-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:bg-white text-charcoal-900 transition-all font-medium placeholder:text-charcoal-400"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-charcoal-900 hover:bg-terracotta-600 text-white py-3.5 rounded-2xl text-xs font-semibold shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Enter Atelier Console</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Security badge and storefront link */}
        <div className="pt-4 border-t border-brand-100 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500">
            <ShieldCheck className="w-3.5 h-3.5 text-sage-600" />
            <span>Encrypted Token-Based Atelier Access</span>
          </div>

          <Link
            href="/"
            className="text-xs text-charcoal-500 hover:text-terracotta-600 transition-colors"
          >
            ← Return to WeaveStudio Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
