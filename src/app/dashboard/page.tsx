'use client';

import { useState, useMemo, Fragment, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { dbStudentToStudent, type Student, type Course, type DbEnrollment, type DbEnrollmentFee, type DbPayment } from '@/lib/data';
import { createClient } from '@/lib/supabase';
import { isSupabaseConfigured, fallbackGetStudents } from '@/lib/fallback-db';
import {
  Download, Search, ChevronDown, ChevronRight,
  BookOpen, Clock, UserCheck, Users, UserCheck2,
  UserX, Timer, GraduationCap, CalendarDays,
  CreditCard, Receipt, Pencil, Trash2, UserCog,
  AlertCircle
} from 'lucide-react';

const statusConfig: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  active: {
    label: 'กำลังเรียน',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  inactive: {
    label: 'พ้นสภาพ',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  'on-leave': {
    label: 'ลาพัก',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
};

const courseStatusConfig: Record<string, { label: string; bg: string; text: string }> = {
  completed: { label: 'เรียนจบ', bg: 'bg-violet-100', text: 'text-violet-700' },
  'in-progress': { label: 'กำลังเรียน', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  upcoming: { label: 'รอเริ่มเรียน', bg: 'bg-slate-100', text: 'text-slate-600' },
};

const tabs = [
  { key: 'all', label: 'ทั้งหมด', count: null as number | null },
  { key: 'active', label: 'กำลังเรียน', count: null as number | null },
  { key: 'on-leave', label: 'ลาพัก', count: null as number | null },
  { key: 'inactive', label: 'พ้นสภาพ', count: null as number | null },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightStudentId = searchParams.get('studentId');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, Array<DbEnrollment & { fees: DbEnrollmentFee[]; payment?: DbPayment }>>>({});
  const [coursesMap, setCoursesMap] = useState<Record<string, { name: string; instructor: string; schedule: string }>>({});

  // Auth state
  const [authRole, setAuthRole] = useState<string>('');
  const [authStudentId, setAuthStudentId] = useState<string | null>(null);

  useEffect(() => {
    setAuthRole(localStorage.getItem('authRole') || '');
    setAuthStudentId(localStorage.getItem('authStudentId'));
  }, []);

  const isParent = authRole === 'parent';

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setAllStudents([]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      try {
        const [
          { data: dbStudents },
          { data: dbParents },
          { data: dbCourses },
          { data: dbStudentCourses },
          { data: dbEnrollments },
        ] = await Promise.all([
          supabase.from('students').select('*'),
          supabase.from('parents').select('*'),
          supabase.from('courses').select('*'),
          supabase.from('student_courses').select('student_id,course_id'),
          supabase.from('enrollments').select('*,enrollment_fees(*),payments(*)'),
        ]);

        const activeStudents = (dbStudents ?? []).filter((s: any) => !s.deleted_at);
        const students = activeStudents.map((s: any) => {
          const scList = dbStudentCourses ?? [];
          const courseList = dbCourses ?? [];
          const courseIds = scList
            .filter((sc: any) => sc.student_id === s.id)
            .map((sc: any) => sc.course_id);
          const courses: Course[] = courseList
            .filter((c: any) => courseIds.includes(c.id))
            .map((c: any) => ({
              name: c.name,
              instructor: c.instructor || '',
              schedule: c.schedule || '',
              status: c.status,
            }));
          return dbStudentToStudent(s, courses, dbParents ?? []);
        });

        // Build enrollment lookup by student_id (array for multiple histories)
        const enrollmentMap: Record<string, Array<DbEnrollment & { fees: DbEnrollmentFee[]; payment?: DbPayment }>> = {};
        for (const en of (dbEnrollments ?? [])) {
          const fees = en.enrollment_fees || [];
          const payment = en.payments && en.payments.length > 0 ? en.payments[0] : undefined;
          if (!enrollmentMap[en.student_id]) {
            enrollmentMap[en.student_id] = [];
          }
          enrollmentMap[en.student_id].push({ ...en, fees, payment });
        }

        // Build course lookup by id
        const courseLookup: Record<string, { name: string; instructor: string; schedule: string }> = {};
        for (const c of (dbCourses ?? [])) {
          courseLookup[c.id] = {
            name: c.name || '',
            instructor: c.instructor || '',
            schedule: c.schedule || '',
          };
        }

        // Filter for parent view
        const visibleStudents = isParent && authStudentId
          ? students.filter((s: Student) => s.id === authStudentId)
          : students;

        setAllStudents(visibleStudents);
        setEnrollments(enrollmentMap);
        setCoursesMap(courseLookup);

        // Auto-expand student passed from enrollment page (admin only)
        if (!isParent && highlightStudentId) {
          const found = students.find((s: Student) => s.id === highlightStudentId);
          if (found) {
            setExpandedId(found.id);
          }
        }

        // Parent: auto-expand their student
        if (isParent && visibleStudents.length > 0) {
          setExpandedId(visibleStudents[0].id);
        }
      } catch (err) {
        console.error('Supabase fetch failed:', err);
        setAllStudents([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [authRole, authStudentId]);

  const tabCounts = useMemo(() => ({
    all: allStudents.length,
    active: allStudents.filter(s => s.status === 'active').length,
    'on-leave': allStudents.filter(s => s.status === 'on-leave').length,
    inactive: allStudents.filter(s => s.status === 'inactive').length,
  }), [allStudents]);

  const filteredStudents = useMemo(() => {
    let result = allStudents;
    if (activeTab !== 'all') {
      result = result.filter(s => s.status === activeTab);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.trim();
      result = result.filter(s =>
        s.fullName.includes(q) ||
        s.studentId.includes(q) ||
        s.nickname.includes(q) ||
        s.level.includes(q) ||
        s.phone.includes(q) ||
        s.parents.includes(q)
      );
    }
    return result;
  }, [allStudents, activeTab, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / entriesPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * entriesPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + entriesPerPage);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  // Scroll to expanded row and ensure correct page when highlighted from enrollment
  useEffect(() => {
    if (!expandedId || !highlightStudentId) return;
    // Find page containing the highlighted student
    const idx = filteredStudents.findIndex(s => s.id === expandedId);
    if (idx >= 0) {
      const page = Math.floor(idx / entriesPerPage) + 1;
      setCurrentPage(page);
    }
    // Scroll into view after render
    setTimeout(() => {
      const el = document.getElementById(`student-row-${expandedId}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [expandedId, filteredStudents, entriesPerPage, highlightStudentId]);

  const handleExport = () => {
    const rows = [
      ['ลำดับ', 'รหัสนักเรียน', 'ชื่อ-นามสกุล', 'ชื่อเล่น', 'สถานะ', 'อายุ', 'ระดับที่เรียน', 'เบอร์โทร', 'พ่อแม่'],
      ...filteredStudents.map((s, i) => [
        i + 1,
        s.studentId,
        s.fullName,
        s.nickname,
        statusConfig[s.status].label,
        s.age,
        s.level,
        s.phone,
        s.parents,
      ]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students.csv';
    a.click();
  };

  const handleDelete = async (studentId: string) => {
    if (!isSupabaseConfigured()) {
      alert('ไม่สามารถลบได้ในโหมดออฟไลน์');
      return;
    }
    try {
      const supabase = createClient();
      // Try soft-delete first (requires deleted_at column)
      let { error } = await supabase
        .from('students')
        .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
        .eq('id', studentId);

      // Fallback: if deleted_at column doesn't exist yet, update status only
      if (error && (error.message?.includes('deleted_at') || error.message?.includes('schema cache'))) {
        const result = await supabase
          .from('students')
          .update({ status: 'inactive' })
          .eq('id', studentId);
        error = result.error;
      }

      if (error) throw error;
      setAllStudents(prev => prev.filter(s => s.id !== studentId));
      setExpandedId(null);
    } catch (err) {
      console.error(err);
      alert('ลบไม่สำเร็จ: ' + (err instanceof Error ? err.message : 'unknown'));
    }
  };

  // Parent-specific stats
  const parentStudent = isParent ? allStudents[0] : null;
  const parentEnrollments = parentStudent ? (enrollments[parentStudent.id] || []) : [];
  const parentTotalCourses = parentStudent?.courses?.length || 0;
  const parentTotalFees = parentEnrollments.reduce((sum, e) => sum + (e.net_amount || 0), 0);
  const parentTotalPaid = parentEnrollments.reduce((sum, e) => {
    const p = e.payment;
    return sum + (p && p.status === 'paid' ? (p.amount || 0) : 0);
  }, 0);
  const parentRemaining = parentTotalFees - parentTotalPaid;

  const statCards = isParent
    ? [
        {
          title: 'จำนวนคอร์สที่ลงทะเบียน',
          value: parentTotalCourses,
          icon: <BookOpen className="w-5 h-5 text-violet-600" />,
          gradient: 'from-violet-100 to-fuchsia-50',
          border: 'border-violet-100',
        },
        {
          title: 'ค่าธรรมเนียมรวม',
          value: parentTotalFees.toLocaleString('th-TH'),
          icon: <Receipt className="w-5 h-5 text-emerald-600" />,
          gradient: 'from-emerald-100 to-teal-50',
          border: 'border-emerald-100',
        },
        {
          title: 'ชำระแล้ว',
          value: parentTotalPaid.toLocaleString('th-TH'),
          icon: <CreditCard className="w-5 h-5 text-sky-600" />,
          gradient: 'from-sky-100 to-cyan-50',
          border: 'border-sky-100',
        },
        {
          title: 'ค้างชำระ',
          value: parentRemaining.toLocaleString('th-TH'),
          icon: <AlertCircle className="w-5 h-5 text-amber-600" />,
          gradient: 'from-amber-100 to-orange-50',
          border: 'border-amber-100',
        },
      ]
    : [
        {
          title: 'นักเรียนทั้งหมด',
          value: allStudents.length,
          icon: <Users className="w-5 h-5 text-violet-600" />,
          gradient: 'from-violet-100 to-fuchsia-50',
          border: 'border-violet-100',
        },
        {
          title: 'กำลังเรียน',
          value: tabCounts.active,
          icon: <UserCheck2 className="w-5 h-5 text-emerald-600" />,
          gradient: 'from-emerald-100 to-teal-50',
          border: 'border-emerald-100',
        },
        {
          title: 'ลาพักการเรียน',
          value: tabCounts['on-leave'],
          icon: <Timer className="w-5 h-5 text-amber-600" />,
          gradient: 'from-amber-100 to-orange-50',
          border: 'border-amber-100',
        },
        {
          title: 'พ้นสภาพ',
          value: tabCounts.inactive,
          icon: <UserX className="w-5 h-5 text-rose-600" />,
          gradient: 'from-rose-100 to-pink-50',
          border: 'border-rose-100',
        },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isParent ? 'ข้อมูลนักเรียนของท่าน' : 'ข้อมูลนักเรียน'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isParent
              ? 'ดูข้อมูลการลงทะเบียนและคอร์สเรียนของนักเรียน'
              : 'จัดการข้อมูลการลงทะเบียนและคอร์สเรียนของนักเรียน'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!isParent && (
            <>
              <button
                onClick={() => router.push('/student/enroll')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white text-sm font-medium rounded-xl hover:bg-violet-700 transition-colors shadow-sm"
              >
                <CreditCard className="w-4 h-4" />
                ลงทะเบียนเรียน
              </button>
              <button
                onClick={() => router.push('/parent/create')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <UserCog className="w-4 h-4" />
                สร้างแอคเคาท์ผู้ปกครอง
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center shadow-sm">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 pt-6 pb-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              const count = tabCounts[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-md text-xs font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + Entries */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ค้นหา..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9 pr-4 py-2 w-56 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition-all"
              />
            </div>
            <select
              value={entriesPerPage}
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white"
            >
              <option value={10}>10 รายการ</option>
              <option value={25}>25 รายการ</option>
              <option value={50}>50 รายการ</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-b border-slate-100 bg-slate-50/60">
                <th className="px-6 py-3.5 text-left font-semibold text-slate-500 w-14">ลำดับ</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">รหัสนักเรียน</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">ชื่อเล่น</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">สถานะ</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">อายุ</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">ระดับที่เรียน</th>
                <th className="px-4 py-3.5 text-left font-semibold text-slate-500">เบอร์โทร</th>
                <th className="px-6 py-3.5 text-left font-semibold text-slate-500">พ่อแม่</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
                      <p>กำลังโหลดข้อมูล...</p>
                    </div>
                  </td>
                </tr>
              ) : currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-slate-300" />
                      <p>ไม่พบข้อมูลนักเรียน</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, index) => {
                  const cfg = statusConfig[student.status];
                  const isOpen = expandedId === student.id;
                  return (
                    <Fragment key={student.id}>
                      <tr
                        id={`student-row-${student.id}`}
                        onClick={() => toggleExpand(student.id)}
                        className="border-b border-slate-50 hover:bg-violet-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 text-slate-500 font-medium">{startIndex + index + 1}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {student.studentId}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isOpen ? 'bg-violet-100 text-violet-600' : 'bg-slate-100 text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600'}`}>
                              {isOpen ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                            <span className="font-semibold text-slate-800">{student.fullName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-600">{student.nickname}</td>
                        <td className="px-4 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-700 font-medium">{student.age}</td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <GraduationCap className="w-4 h-4 text-slate-400" />
                            {student.level}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-slate-600 font-mono text-xs">{student.phone}</td>
                        <td className="px-6 py-4 text-slate-600 max-w-[220px] truncate" title={student.parents}>
                          {student.parents}
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/40">
                          <td colSpan={9} className="p-0">
                            <div className="px-6 py-6">
                              <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-violet-600" />
                                  </div>
                                  <h3 className="text-base font-bold text-slate-800">
                                    คอร์สที่ลงทะเบียน — {student.fullName}
                                  </h3>
                                </div>
                                {!isParent && (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/student/register?edit=${student.id}`);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                      <Pencil className="w-3.5 h-3.5" />
                                      แก้ไขข้อมูล
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/parent/create?studentId=${student.id}`);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                      <UserCog className="w-3.5 h-3.5" />
                                      สร้าง/แก้ไขแอคเคาท์ผู้ปกครอง
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/student/enroll?studentId=${student.id}`);
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 text-white text-xs font-medium rounded-lg hover:bg-violet-700 transition-colors"
                                    >
                                      <CreditCard className="w-3.5 h-3.5" />
                                      ลงทะเบียนเรียน
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm(`ยืนยันการลบนักเรียน ${student.fullName}?`)) {
                                          handleDelete(student.id);
                                        }
                                      }}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-100 transition-colors"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      ลบ
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {student.courses.map((course, idx) => {
                                  const ccfg = courseStatusConfig[course.status];
                                  return (
                                    <div
                                      key={idx}
                                      className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md hover:border-violet-200 transition-all"
                                    >
                                      <div className="flex items-start justify-between mb-3">
                                        <h4 className="font-semibold text-slate-800 text-sm leading-snug pr-2">{course.name}</h4>
                                        <span className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${ccfg.bg} ${ccfg.text}`}>
                                          {ccfg.label}
                                        </span>
                                      </div>
                                      <div className="space-y-2 text-xs text-slate-500">
                                        <div className="flex items-center gap-2">
                                          <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                          <span className="text-slate-700">{course.instructor}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                                          <span>{course.schedule}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                                          <span className="text-slate-600">{course.status === 'completed' ? 'เรียนจบแล้ว' : course.status === 'in-progress' ? 'กำลังเรียนอยู่' : 'ยังไม่เริ่ม'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Enrollment & Payment Info */}
                              {(() => {
                                const ens = enrollments[student.id];
                                if (!ens || ens.length === 0) return null;
                                return (
                                  <div className="mt-5 pt-5 border-t border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Receipt className="w-4 h-4 text-emerald-600" />
                                      </div>
                                      <h3 className="text-sm font-bold text-slate-800">
                                        ประวัติการลงทะเบียนและชำระเงิน ({ens.length} รายการ)
                                      </h3>
                                    </div>
                                    <div className="space-y-3">
                                      {ens.map((en) => (
                                        <div key={en.id} className="bg-white border border-slate-200 rounded-xl p-4">
                                          {(() => {
                                            const course = en.course_id ? coursesMap[en.course_id] : null;
                                            return (
                                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                  <p className="text-xs text-slate-400">เลขที่ใบลงทะเบียน</p>
                                                  <p className="font-semibold text-slate-800">{en.enrollment_no || '-'}</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-slate-400">วันที่ลงทะเบียน</p>
                                                  <p className="font-semibold text-slate-800">{en.enrollment_date}</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-slate-400">ระดับ</p>
                                                  <p className="font-semibold text-slate-800">{en.course_level_name || '-'}</p>
                                                </div>
                                                <div>
                                                  <p className="text-xs text-slate-400">สถานะ</p>
                                                  <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-medium ${
                                                    en.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                                                    en.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    en.status === 'completed' ? 'bg-violet-100 text-violet-700' :
                                                    'bg-rose-100 text-rose-700'
                                                  }`}>
                                                    {en.status === 'confirmed' ? 'ยืนยันแล้ว' :
                                                     en.status === 'pending' ? 'รอดำเนินการ' :
                                                     en.status === 'completed' ? 'เสร็จสิ้น' : 'ยกเลิก'}
                                                  </span>
                                                </div>
                                                {course && (
                                                  <>
                                                    <div>
                                                      <p className="text-xs text-slate-400">คอร์ส</p>
                                                      <p className="font-semibold text-slate-800">{course.name}</p>
                                                    </div>
                                                    <div>
                                                      <p className="text-xs text-slate-400">ครูผู้สอน</p>
                                                      <p className="font-semibold text-slate-800">{course.instructor}</p>
                                                    </div>
                                                    <div>
                                                      <p className="text-xs text-slate-400">เวลาเรียน</p>
                                                      <p className="font-semibold text-slate-800">{course.schedule}</p>
                                                    </div>
                                                  </>
                                                )}
                                              </div>
                                            );
                                          })()}
                                          {en.fees && en.fees.length > 0 && (
                                            <div className="border-t border-slate-100 pt-3">
                                              <p className="text-xs text-slate-400 mb-2">รายการค่าใช้จ่าย</p>
                                              <div className="space-y-1 text-xs">
                                                {en.fees.filter((f: DbEnrollmentFee) => f.amount !== 0).map((fee: DbEnrollmentFee) => (
                                                  <div key={fee.id} className="flex justify-between">
                                                    <span className="text-slate-600">{fee.description}</span>
                                                    <span className={`font-medium ${fee.amount < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                                                      {fee.amount.toLocaleString()} บาท
                                                    </span>
                                                  </div>
                                                ))}
                                              </div>
                                              <div className="flex justify-between mt-2 pt-2 border-t border-slate-100">
                                                <span className="text-xs font-bold text-slate-700">รวมสุทธิ</span>
                                                <span className="text-xs font-extrabold text-violet-700">{en.net_amount.toLocaleString()} บาท</span>
                                              </div>
                                            </div>
                                          )}
                                          {en.payment && (
                                            <div className="border-t border-slate-100 pt-3 mt-3">
                                              <p className="text-xs text-slate-400 mb-1">การชำระเงิน</p>
                                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                                                <span className="text-slate-600">เลขที่ใบเสร็จ: <strong className="text-slate-800">{en.payment.payment_no || '-'}</strong></span>
                                                <span className="text-slate-600">วันที่: <strong className="text-slate-800">{en.payment.payment_date}</strong></span>
                                                <span className="text-slate-600">ชำระโดย: <strong className="text-slate-800">{en.payment.payment_method}</strong></span>
                                                <span className="text-slate-600">จำนวน: <strong className="text-emerald-700">{en.payment.amount.toLocaleString()} บาท</strong></span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-slate-500">
            แสดง {filteredStudents.length > 0 ? startIndex + 1 : 0} ถึง {Math.min(startIndex + entriesPerPage, filteredStudents.length)} จาก {filteredStudents.length} รายการ
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ก่อนหน้า
            </button>
            <span className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 rounded-xl border border-slate-200">
              {safePage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ถัดไป
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
