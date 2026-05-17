'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Users, CheckCircle2, Loader2, KeyRound, Pencil, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/fallback-db';
import type { DbStudent } from '@/lib/data';

interface ExistingAccount {
  id: string;
  username: string;
  password: string;
  is_active: boolean;
}

export default function ParentCreateClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillStudentId = searchParams.get('studentId') || '';

  const [studentId, setStudentId] = useState(prefillStudentId);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Existing account state
  const [existingAccount, setExistingAccount] = useState<ExistingAccount | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load students
  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setFetching(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('students')
          .select('id, student_id, first_name_th, last_name_th, nickname')
          .is('deleted_at', null)
          .order('student_id', { ascending: true });
        setStudents((data as unknown as DbStudent[]) ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    }
    load();
  }, []);

  // Check existing account when studentId changes
  useEffect(() => {
    if (!studentId || !isSupabaseConfigured()) {
      setExistingAccount(null);
      setIsEditing(false);
      return;
    }

    async function check() {
      setCheckingExisting(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('parent_accounts')
          .select('id, username, password, is_active')
          .eq('student_id', studentId)
          .maybeSingle();

        setExistingAccount(data ?? null);
        setIsEditing(false);
      } catch (err) {
        console.error(err);
      } finally {
        setCheckingExisting(false);
      }
    }
    check();
  }, [studentId]);

  const selectedStudent = students.find(s => s.id === studentId);

  // CREATE new account
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!studentId) { setError('กรุณาเลือกนักเรียน'); return; }
    if (!password) { setError('กรุณากรอกรหัสผ่าน'); return; }
    if (password.length < 4) { setError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'); return; }
    if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }

    if (!isSupabaseConfigured()) {
      setError('ไม่สามารถสร้างแอคเคาท์ได้ในโหมดออฟไลน์');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const student = students.find(s => s.id === studentId);
      if (!student) { setError('ไม่พบข้อมูลนักเรียน'); setLoading(false); return; }

      await supabase.from('parent_accounts').insert({
        student_id: studentId,
        username: student.student_id,
        password: password,
        is_active: true,
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('สร้างแอคเคาท์ไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setLoading(false);
    }
  };

  // UPDATE password
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password) { setError('กรุณากรอกรหัสผ่าน'); return; }
    if (password.length < 4) { setError('รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'); return; }
    if (password !== confirmPassword) { setError('รหัสผ่านไม่ตรงกัน'); return; }

    if (!isSupabaseConfigured() || !existingAccount) {
      setError('ไม่สามารถอัปเดตได้'); return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      await supabase
        .from('parent_accounts')
        .update({ password })
        .eq('id', existingAccount.id);

      setExistingAccount({ ...existingAccount, password });
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('อัปเดตรหัสผ่านไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS STATE (after create)
  if (success && !existingAccount) {
    return (
      <div className="max-w-lg mx-auto pt-20 px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">สร้างแอคเคาท์สำเร็จ</h2>
          <p className="text-slate-500 mb-6">
            แอคเคาท์ผู้ปกครองสำหรับ {selectedStudent?.first_name_th} {selectedStudent?.last_name_th} ถูกสร้างเรียบร้อยแล้ว
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div>
              <p className="text-sm text-slate-500 mb-1">ชื่อผู้ใช้ (รหัสนักเรียน)</p>
              <p className="font-semibold text-slate-800 font-mono text-lg">{selectedStudent?.student_id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">รหัสผ่าน</p>
              <p className="font-semibold text-slate-800 font-mono text-lg">{password}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors"
          >
            กลับไปหน้าภาพรวม
          </button>
        </div>
      </div>
    );
  }

  const pageTitle = existingAccount ? 'ข้อมูลแอคเคาท์ผู้ปกครอง' : 'สร้างแอคเคาท์ผู้ปกครอง';
  const pageSubtitle = existingAccount
    ? `แอคเคาท์สำหรับ ${selectedStudent?.first_name_th} ${selectedStudent?.last_name_th}`
    : 'สร้างบัญชีเข้าใช้งานสำหรับผู้ปกครอง';

  return (
    <div className="max-w-lg mx-auto pt-8 px-4 pb-12">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{pageTitle}</h1>
          <p className="text-sm text-slate-500">{pageSubtitle}</p>
        </div>
      </div>

      {/* Success toast after update */}
      {success && existingAccount && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-5 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700 font-medium">อัปเดตรหัสผ่านสำเร็จ</p>
        </div>
      )}

      {/* Student Selector (always visible) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          <Users className="w-4 h-4 inline mr-1.5 text-slate-400" />
          เลือกนักเรียน
        </label>
        {fetching ? (
          <div className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-400">
            กำลังโหลด...
          </div>
        ) : (
          <select
            value={studentId}
            onChange={e => setStudentId(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
          >
            <option value="">-- เลือกนักเรียน --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>
                {s.student_id} — {s.first_name_th} {s.last_name_th} ({s.nickname})
              </option>
            ))}
          </select>
        )}

        {selectedStudent && (
          <div className="mt-3 bg-violet-50 border border-violet-100 rounded-xl p-3">
            <p className="text-xs text-violet-600 font-medium mb-0.5">นักเรียนที่เลือก</p>
            <p className="text-sm text-slate-800 font-semibold">
              {selectedStudent.first_name_th} {selectedStudent.last_name_th} ({selectedStudent.nickname})
            </p>
            <p className="text-xs text-slate-500">รหัสนักเรียน: {selectedStudent.student_id}</p>
          </div>
        )}
      </div>

      {/* Checking indicator */}
      {checkingExisting && studentId && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
          <p className="text-sm text-slate-500 mt-2">กำลังตรวจสอบข้อมูล...</p>
        </div>
      )}

      {/* EXISTING ACCOUNT SUMMARY */}
      {existingAccount && !checkingExisting && !isEditing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">แอคเคาท์ผู้ปกครอง</h3>
              <p className="text-xs text-slate-500">
                {existingAccount.is_active ? 'ใช้งานได้' : 'ถูกระงับ'}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">ชื่อผู้ใช้ (รหัสนักเรียน)</p>
              <p className="font-semibold text-slate-800 font-mono text-base">{existingAccount.username}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">รหัสผ่าน</p>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 font-mono text-base">
                  {showPassword ? existingAccount.password : '••••••••'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              กลับไปหน้าภาพรวม
            </button>
            <button
              onClick={() => {
                setIsEditing(true);
                setPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <Pencil className="w-3.5 h-3.5" />
              แก้ไขรหัสผ่าน
            </button>
          </div>
        </div>
      )}

      {/* EDIT PASSWORD FORM */}
      {existingAccount && isEditing && (
        <form onSubmit={handleUpdate} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">แก้ไขรหัสผ่าน</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="ตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setPassword(''); setConfirmPassword(''); setError(''); }}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่าน'}
            </button>
          </div>
        </form>
      )}

      {/* CREATE NEW ACCOUNT FORM */}
      {!existingAccount && !checkingExisting && studentId && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
              <KeyRound className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">ตั้งรหัสผ่านสำหรับแอคเคาท์ใหม่</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              รหัสผ่าน
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="ตั้งรหัสผ่านอย่างน้อย 4 ตัวอักษร"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              ยืนยันรหัสผ่าน
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors inline-flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {loading ? 'กำลังบันทึก...' : 'สร้างแอคเคาท์'}
            </button>
          </div>
        </form>
      )}

      {/* Empty state when no student selected */}
      {!studentId && !fetching && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">กรุณาเลือกนักเรียนเพื่อดำเนินการต่อ</p>
        </div>
      )}
    </div>
  );
}
