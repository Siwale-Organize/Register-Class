'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, KeyRound, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/fallback-db';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'admin' | 'parent'>('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'admin') {
        // Admin login: any non-empty credentials work (demo mode)
        localStorage.setItem('authRole', 'admin');
        localStorage.setItem('authUsername', username);
        localStorage.removeItem('authStudentId');
        router.push('/dashboard');
      } else {
        // Parent login: validate against parent_accounts
        if (!isSupabaseConfigured()) {
          setError('ไม่สามารถเข้าสู่ระบบได้ในโหมดออฟไลน์');
          setLoading(false);
          return;
        }

        const supabase = createClient();
        const { data: account } = await supabase
          .from('parent_accounts')
          .select('student_id, is_active')
          .eq('username', username)
          .eq('password', password)
          .maybeSingle();

        if (!account) {
          setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
          setLoading(false);
          return;
        }

        if (!account.is_active) {
          setError('แอคเคาท์นี้ถูกระงับ');
          setLoading(false);
          return;
        }

        localStorage.setItem('authRole', 'parent');
        localStorage.setItem('authUsername', username);
        localStorage.setItem('authStudentId', account.student_id);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold text-slate-900 mb-2"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
          >
            Academy.
          </h1>
          <p className="text-slate-500">ระบบจัดการนักเรียนและการลงทะเบียน</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                mode === 'admin'
                  ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-500'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              เจ้าหน้าที่
            </button>
            <button
              onClick={() => { setMode('parent'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                mode === 'parent'
                  ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-500'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              ผู้ปกครอง
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">
              {mode === 'admin' ? 'เข้าสู่ระบบเจ้าหน้าที่' : 'เข้าสู่ระบบผู้ปกครอง'}
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              {mode === 'admin'
                ? 'ใช้ชื่อผู้ใช้และรหัสผ่านของเจ้าหน้าที่'
                : 'ใช้รหัสนักเรียนและรหัสผ่านที่สร้างไว้'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {mode === 'admin' ? 'ชื่อผู้ใช้' : 'รหัสนักเรียน'}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === 'admin' ? 'admin' : 'ST-2024-0001'}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <KeyRound className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                  รหัสผ่าน
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
                />
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </button>
            </form>

            {mode === 'admin' && (
              <p className="mt-4 text-center text-xs text-slate-400">
                สำหรับทดสอบ: กรอกชื่อผู้ใช้และรหัสผ่านใดก็ได้
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
