'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronLeft, User, BookOpen, Calculator,
  CreditCard, Receipt, Printer, CheckCircle2, Landmark, Banknote, Loader2, Clock, Home
} from 'lucide-react';
import { dbStudentToStudent, type Student, type DbStudent, type DbParent } from '@/lib/data';
import { createClient } from '@/lib/supabase';
import { isSupabaseConfigured } from '@/lib/fallback-db';
import type { DbCourse, DbCourseLevel, DbAbacusType, DbTextbookType, DbEnrollment, DbEnrollmentFee, DbPayment } from '@/lib/data';

// ─── Helpers ─────────────────────────────────────────
function thaiDate(d = new Date()) {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
}

const paymentMethods = ['เงินสด', 'โอนเงิน', 'เช็ค', 'บัตรเครดิต'];

// Fallback static data when Supabase is not configured
const fallbackCourseLevels: DbCourseLevel[] = [
  { id: 'g1', grade_code: 'G1', grade_name_th: 'ระดับ 1', grade_name_en: 'Grade 1', abacus_type: '5 beads', description: null, is_active: true, created_at: '' },
  { id: 'g2', grade_code: 'G2', grade_name_th: 'ระดับ 2', grade_name_en: 'Grade 2', abacus_type: '5 beads', description: null, is_active: true, created_at: '' },
  { id: 'g3', grade_code: 'G3', grade_name_th: 'ระดับ 3', grade_name_en: 'Grade 3', abacus_type: '7 beads', description: null, is_active: true, created_at: '' },
  { id: 'g4', grade_code: 'G4', grade_name_th: 'ระดับ 4', grade_name_en: 'Grade 4', abacus_type: '10 beads', description: null, is_active: true, created_at: '' },
  { id: 'g5', grade_code: 'G5', grade_name_th: 'ระดับ 5', grade_name_en: 'Grade 5', abacus_type: '10 beads', description: null, is_active: true, created_at: '' },
  { id: 'g6', grade_code: 'G6', grade_name_th: 'ระดับ 6', grade_name_en: 'Grade 6', abacus_type: '10 beads', description: null, is_active: true, created_at: '' },
  { id: 'g7', grade_code: 'G7', grade_name_th: 'ระดับ 7', grade_name_en: 'Grade 7', abacus_type: '10 beads', description: null, is_active: true, created_at: '' },
  { id: 'g8', grade_code: 'G8', grade_name_th: 'ระดับ 8', grade_name_en: 'Grade 8', abacus_type: '4-1', description: null, is_active: true, created_at: '' },
  { id: 'g9', grade_code: 'G9', grade_name_th: 'ระดับ 9', grade_name_en: 'Grade 9', abacus_type: '4-1', description: null, is_active: true, created_at: '' },
  { id: 'g10', grade_code: 'G10', grade_name_th: 'ระดับ 10', grade_name_en: 'Grade 10', abacus_type: '4-1', description: null, is_active: true, created_at: '' },
];

const fallbackCourses: DbCourse[] = [
  { id: 'c1', course_level_id: 'g1', name: 'จินตคณิต ระดับ 1', instructor: 'คุณครู สมศรี ใจดี', schedule: 'เสาร์-อาทิตย์ 08:00-09:30', status: 'in-progress', is_active: true, created_at: '' },
  { id: 'c2', course_level_id: 'g1', name: 'จินตคณิต ระดับ 1', instructor: 'คุณครู วิไล รักษ์', schedule: 'เสาร์-อาทิตย์ 10:00-11:30', status: 'in-progress', is_active: true, created_at: '' },
  { id: 'c3', course_level_id: 'g2', name: 'จินตคณิต ระดับ 2', instructor: 'คุณครู สมศรี ใจดี', schedule: 'เสาร์-อาทิตย์ 08:00-09:30', status: 'in-progress', is_active: true, created_at: '' },
  { id: 'c4', course_level_id: 'g3', name: 'จินตคณิต ระดับ 3', instructor: 'คุณครู มานี มีนา', schedule: 'เสาร์-อาทิตย์ 13:00-14:30', status: 'in-progress', is_active: true, created_at: '' },
  { id: 'c5', course_level_id: 'g4', name: 'จินตคณิต ระดับ 4', instructor: 'คุณครู นพดล วิทยา', schedule: 'เสาร์-อาทิตย์ 10:00-11:30', status: 'in-progress', is_active: true, created_at: '' },
  { id: 'c6', course_level_id: 'g5', name: 'จินตคณิต ระดับ 5', instructor: 'คุณครู วิไล รักษ์', schedule: 'เสาร์-อาทิตย์ 13:00-14:30', status: 'in-progress', is_active: true, created_at: '' },
];

const fallbackAbacusTypes: DbAbacusType[] = [
  { id: 'a1', name: 'ลูกคิด 10 เม็ด (มาตรฐาน)', price: 350, description: null, is_active: true, created_at: '' },
  { id: 'a2', name: 'ลูกคิด 4-1 (ญี่ปุ่น)', price: 450, description: null, is_active: true, created_at: '' },
  { id: 'a3', name: 'ลูกคิดพลาสติก 10 เม็ด', price: 250, description: null, is_active: true, created_at: '' },
  { id: 'a4', name: 'ลูกคิดไฟฟ้า (แบบฝึกหัด)', price: 1200, description: null, is_active: true, created_at: '' },
];

const fallbackTextbookTypes: DbTextbookType[] = [
  { id: 't1', code: 'junior', name: 'Junior', grade_level: 'ระดับเริ่มต้น', price: 120, is_active: true, created_at: '' },
  { id: 't2', code: 'j2', name: 'J.2', grade_level: 'ระดับ 1-2', price: 120, is_active: true, created_at: '' },
  { id: 't3', code: 'j3', name: 'J.3', grade_level: 'ระดับ 3-4', price: 150, is_active: true, created_at: '' },
  { id: 't4', code: 'k', name: 'K', grade_level: 'ระดับ 5-6', price: 150, is_active: true, created_at: '' },
  { id: 't5', code: 'g1', name: 'G.1', grade_level: 'ระดับ 7-8', price: 180, is_active: true, created_at: '' },
  { id: 't6', code: 'g2', name: 'G.2', grade_level: 'ระดับ 9-10', price: 180, is_active: true, created_at: '' },
];

const tuitionOptions = [
  { label: 'ยกเว้นค่าเรียน', value: 0 },
  { label: 'คอร์สรายเดือน - 2,500 บาท/เดือน', value: 2500 },
  { label: 'คอร์สรายคอร์ส - 3,500 บาท', value: 3500 },
  { label: 'คอร์สเข้มข้น - 5,000 บาท', value: 5000 },
];

// ─── Components ──────────────────────────────────────
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">{icon}</div>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">{label}</label>
      <p className="text-sm font-semibold text-slate-800">{value || '-'}</p>
    </div>
  );
}

function MoneyInput({ value, onChange, placeholder = '0' }: { value: number; onChange: (v: number) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <input
        type="number"
        min={0}
        value={value || ''}
        onChange={e => onChange(Number(e.target.value))}
        placeholder={placeholder}
        className="w-full pr-12 pl-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white transition-all text-right"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">บาท</span>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────
export default function EnrollmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentId = searchParams.get('studentId');

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reference data from Supabase
  const [courseLevels, setCourseLevels] = useState<DbCourseLevel[]>(fallbackCourseLevels);
  const [courses, setCourses] = useState<DbCourse[]>(fallbackCourses);
  const [abacusTypes, setAbacusTypes] = useState<DbAbacusType[]>(fallbackAbacusTypes);
  const [textbookTypes, setTextbookTypes] = useState<DbTextbookType[]>(fallbackTextbookTypes);

  // Form state
  const [registerDate, setRegisterDate] = useState(thaiDate());
  const [branch, setBranch] = useState('');
  const [center, setCenter] = useState('ศูนย์ประสานงานหลัก');
  const [courseLevelId, setCourseLevelId] = useState(fallbackCourseLevels[3].id); // G4
  const [courseId, setCourseId] = useState('');

  // Costs
  const [admissionFee] = useState(0);
  const [tuitionFee, setTuitionFee] = useState(0);
  const [abacusId, setAbacusId] = useState('');
  const [textbookId, setTextbookId] = useState(fallbackTextbookTypes[2].id); // J.3
  const [textbookQty, setTextbookQty] = useState(1);
  const [digitalCardFee] = useState(0);
  const [digitalCardQty, setDigitalCardQty] = useState(0);
  const [discount, setDiscount] = useState(0);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState('เงินสด');
  const [paymentDate, setPaymentDate] = useState(thaiDate());

  // Summary
  const [showSummary, setShowSummary] = useState(false);

  const selectedAbacus = abacusTypes.find(a => a.id === abacusId);
  const abacusFee = selectedAbacus ? selectedAbacus.price : 0;
  const selectedTextbook = textbookTypes.find(t => t.id === textbookId);
  const textbookTotal = (selectedTextbook ? selectedTextbook.price : 0) * textbookQty;
  const digitalTotal = digitalCardFee * digitalCardQty;
  const total = admissionFee + tuitionFee + abacusFee + textbookTotal + digitalTotal - discount;
  const selectedCourseLevel = courseLevels.find(c => c.id === courseLevelId);
  const filteredCourses = courses.filter(c => c.course_level_id === courseLevelId && c.is_active);
  const selectedCourse = courses.find(c => c.id === courseId);

  // Auto-select first course when level changes
  useEffect(() => {
    if (filteredCourses.length > 0) {
      setCourseId(filteredCourses[0].id);
    } else {
      setCourseId('');
    }
  }, [courseLevelId, courses]);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      try {
        // Load student from Supabase
        if (studentId) {
          const [
            { data: dbStudent },
            { data: dbParents },
          ] = await Promise.all([
            supabase.from('students').select('*').eq('id', studentId).limit(1).single(),
            supabase.from('parents').select('*').eq('student_id', studentId),
          ]);
          if (dbStudent && !dbStudent.deleted_at) {
            setStudent(dbStudentToStudent(dbStudent, [], dbParents || []));
          }
        }

        // Load reference data
        const [
          { data: levels },
          { data: dbCourses },
          { data: abacuses },
          { data: textbooks },
        ] = await Promise.all([
          supabase.from('course_levels').select('*').eq('is_active', true).order('grade_code', { ascending: true }),
          supabase.from('courses').select('*').eq('is_active', true),
          supabase.from('abacus_types').select('*').eq('is_active', true),
          supabase.from('textbook_types').select('*').eq('is_active', true),
        ]);
        if (levels?.length) setCourseLevels(levels);
        if (dbCourses?.length) {
          setCourses(dbCourses);
        }
        if (abacuses?.length) setAbacusTypes(abacuses);
        if (textbooks?.length) setTextbookTypes(textbooks);
      } catch (err) {
        console.error('Failed to load data from Supabase:', err);
      }

      setLoading(false);
    }
    load();
  }, [studentId]);

  const handleConfirm = async () => {
    if (!student) return;
    setSaving(true);

    try {
      if (isSupabaseConfigured()) {
        // 1. Create enrollment
        const enrollmentPayload = {
          student_id: student.id,
          enrollment_no: `EN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
          enrollment_date: new Date().toISOString().split('T')[0],
          branch: branch || null,
          center: center || 'ศูนย์ประสานงานหลัก',
          course_level_id: courseLevelId || null,
          course_level_name: selectedCourseLevel?.grade_name_en || null,
          course_id: courseId || null,
          status: 'confirmed',
          total_amount: admissionFee + tuitionFee + abacusFee + textbookTotal + digitalTotal,
          discount_amount: discount,
          net_amount: total,
        };

        const supabase = createClient();
        const { data: enrollment } = await supabase.from('enrollments').insert(enrollmentPayload).select().single();
        const enrollmentId = enrollment!.id;

        // 2. Create enrollment fees line items
        const feeItems = [];
        if (admissionFee > 0) {
          feeItems.push({
            enrollment_id: enrollmentId, fee_type_code: 'admission',
            description: 'ค่าแรกเข้า', quantity: 1, unit_price: admissionFee, amount: admissionFee,
            sort_order: 1,
          });
        }
        if (tuitionFee > 0) {
          feeItems.push({
            enrollment_id: enrollmentId, fee_type_code: 'tuition',
            description: tuitionOptions.find(t => t.value === tuitionFee)?.label || 'ค่าเรียน',
            quantity: 1, unit_price: tuitionFee, amount: tuitionFee,
            sort_order: 2,
          });
        }
        if (abacusFee > 0) {
          feeItems.push({
            enrollment_id: enrollmentId, fee_type_code: 'abacus',
            description: selectedAbacus?.name || 'ค่าลูกคิด',
            quantity: 1, unit_price: abacusFee, amount: abacusFee,
            reference_id: abacusId || null, reference_name: selectedAbacus?.name || null,
            sort_order: 3,
          });
        }
        if (textbookTotal > 0) {
          feeItems.push({
            enrollment_id: enrollmentId, fee_type_code: 'textbook',
            description: `ค่าหนังสือเรียน ${selectedTextbook?.name || ''}`,
            quantity: textbookQty, unit_price: selectedTextbook?.price || 0, amount: textbookTotal,
            reference_id: textbookId || null, reference_name: selectedTextbook?.name || null,
            sort_order: 4,
          });
        }
        if (digitalTotal > 0) {
          feeItems.push({
            enrollment_id: enrollmentId, fee_type_code: 'digital_card',
            description: 'บัตรดิจิตอล', quantity: digitalCardQty,
            unit_price: digitalCardFee, amount: digitalTotal,
            sort_order: 5,
          });
        }
        if (discount > 0) {
          feeItems.push({
            enrollment_id: enrollmentId, fee_type_code: 'discount',
            description: 'ส่วนลด', quantity: 1,
            unit_price: discount, amount: -discount,
            sort_order: 99,
          });
        }

        for (const item of feeItems) {
          await supabase.from('enrollment_fees').insert(item);
        }

        // 3. Create payment record
        await supabase.from('payments').insert({
          enrollment_id: enrollmentId,
          payment_no: `PM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
          payment_date: new Date().toISOString().split('T')[0],
          payment_method: paymentMethod,
          amount: total,
          status: 'paid',
        });

        // 4. Link student to course so it appears on dashboard
        if (courseId) {
          await supabase.from('student_courses').insert({
            student_id: student.id,
            course_id: courseId,
            enrollment_date: new Date().toISOString().split('T')[0],
          });
        }

        alert('บันทึกการลงทะเบียนและชำระเงินสำเร็จ');
      } else {
        // Fallback: just show summary without saving to DB
        alert('โหมดออฟไลน์: แสดงสรุปรายการเท่านั้น (ไม่ได้บันทึกลงฐานข้อมูล)');
      }

      setShowSummary(true);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-slate-500">ไม่พบข้อมูลนักเรียน</p>
        <button onClick={() => router.push('/dashboard')} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm">
          กลับไปหน้าข้อมูลนักเรียน
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">ลงทะเบียนเรียน - ชำระเงิน</h1>
            <p className="text-sm text-slate-500 mt-0.5">ลงทะเบียนหลักสูตรจินตคณิตและชำระค่าใช้จ่าย</p>
          </div>
        </div>
        {!isSupabaseConfigured() && (
          <span className="text-xs text-amber-600 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
            โหมดออฟไลน์
          </span>
        )}
      </div>

      {/* ── Student Info (Read-only) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <SectionTitle icon={<User className="w-4 h-4 text-violet-600" />} title="ข้อมูลนักเรียน" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-5">
          <ReadOnlyField label="เลขประจำตัวนักเรียน" value={student.studentId} />
          <ReadOnlyField label="วันที่ลงทะเบียน" value={registerDate} />
          <Field label="สาขา">
            <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="ระบุสาขา" className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white" />
          </Field>
          <Field label="ศูนย์ประสานงาน">
            <input value={center} onChange={e => setCenter(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white" />
          </Field>
          <ReadOnlyField label="เลขบัตรประจำตัวประชาชน" value="-" />
          <ReadOnlyField label="วันเกิด" value="-" />
          <ReadOnlyField label="ชื่อ (ไทย)" value={student.fullName.split(' ')[0]} />
          <ReadOnlyField label="นามสกุล (ไทย)" value={student.fullName.split(' ')[1] || ''} />
          <ReadOnlyField label="ชื่อ (Eng)" value="-" />
          <ReadOnlyField label="นามสกุล (Eng)" value="-" />
          <ReadOnlyField label="ชื่อเล่น" value={student.nickname} />
          <ReadOnlyField label="เพศ" value="-" />
          <ReadOnlyField label="อายุ" value={String(student.age)} />
          <ReadOnlyField label="สถานศึกษาปัจจุบัน" value="-" />
        </div>
      </div>

      {/* ── Course Enrollment ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <SectionTitle icon={<BookOpen className="w-4 h-4 text-violet-600" />} title="ลงทะเบียนหลักสูตรจินตคณิต" />
        <div className="space-y-4">
          <Field label="ระดับ">
            <select value={courseLevelId} onChange={e => setCourseLevelId(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white appearance-none">
              {courseLevels.map((level: DbCourseLevel) => (
                <option key={level.id} value={level.id}>
                  {level.grade_name_en} ({level.abacus_type}) - {level.grade_name_th}
                </option>
              ))}
            </select>
          </Field>
          {selectedCourseLevel && (
            <p className="text-xs text-slate-500">{selectedCourseLevel.description || ''}</p>
          )}

          <Field label="รอบเรียน / ครูผู้สอน">
            <select value={courseId} onChange={e => setCourseId(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white appearance-none">
              {filteredCourses.length === 0 && <option value="">ไม่มีรอบเรียน</option>}
              {filteredCourses.map((c: DbCourse) => (
                <option key={c.id} value={c.id}>
                  {c.instructor} — {c.schedule}
                </option>
              ))}
            </select>
          </Field>
          {selectedCourse && (
            <div className="flex items-center gap-4 text-xs text-slate-500 bg-slate-50 rounded-xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-violet-500" />
                <span className="font-medium text-slate-700">{selectedCourse.instructor}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                <span>{selectedCourse.schedule}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Cost Breakdown ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <SectionTitle icon={<Calculator className="w-4 h-4 text-violet-600" />} title="ค่าใช้จ่าย" />
        <div className="space-y-4">
          {/* Admission */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div><p className="text-sm font-medium text-slate-700">ค่าแรกเข้า</p></div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800">{admissionFee.toLocaleString()}</span>
              <span className="text-xs text-slate-400 w-8">บาท</span>
            </div>
          </div>

          {/* Tuition */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div><p className="text-sm font-medium text-slate-700">ค่าเรียน</p></div>
            <div className="flex items-center gap-3">
              <select value={tuitionFee} onChange={e => setTuitionFee(Number(e.target.value))} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white min-w-[220px]">
                {tuitionOptions.map((o: { label: string; value: number }) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <span className="text-sm font-semibold text-slate-800 w-16 text-right">{tuitionFee.toLocaleString()}</span>
              <span className="text-xs text-slate-400 w-8">บาท</span>
            </div>
          </div>

          {/* Abacus */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div><p className="text-sm font-medium text-slate-700">ค่าลูกคิด</p></div>
            <div className="flex items-center gap-3">
              <select value={abacusId} onChange={e => setAbacusId(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white min-w-[200px]">
                <option value="">เลือกระบบลูกคิด</option>
                {abacusTypes.map((a: DbAbacusType) => <option key={a.id} value={a.id}>{a.name} - {a.price.toLocaleString()} บาท</option>)}
              </select>
              <span className="text-sm font-semibold text-slate-800 w-16 text-right">{abacusFee.toLocaleString()}</span>
              <span className="text-xs text-slate-400 w-8">บาท</span>
            </div>
          </div>

          {/* Textbook */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-slate-700">ค่าหนังสือเรียน</p>
              <select value={textbookId} onChange={e => setTextbookId(e.target.value)} className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-white">
                {textbookTypes.map((t: DbTextbookType) => <option key={t.id} value={t.id}>{t.name} ({t.grade_level || ''}) - {t.price.toLocaleString()} บาท</option>)}
              </select>
              <div className="flex items-center gap-2">
                <input type="number" min={0} value={textbookQty} onChange={e => setTextbookQty(Number(e.target.value))} className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center focus:outline-none" />
                <span className="text-xs text-slate-500">เล่ม</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800 w-16 text-right">{textbookTotal.toLocaleString()}</span>
              <span className="text-xs text-slate-400 w-8">บาท</span>
            </div>
          </div>

          {/* Digital Card */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <p className="text-sm font-medium text-slate-700">บัตรดิจิตอล</p>
              <div className="flex items-center gap-2">
                <input type="number" min={0} value={digitalCardQty} onChange={e => setDigitalCardQty(Number(e.target.value))} className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center focus:outline-none" />
                <span className="text-xs text-slate-500">บัตร</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800 w-16 text-right">{digitalTotal.toLocaleString()}</span>
              <span className="text-xs text-slate-400 w-8">บาท</span>
            </div>
          </div>

          {/* Discount */}
          <div className="flex items-center justify-between py-3 border-b border-slate-100">
            <p className="text-sm font-medium text-slate-700">ส่วนลด</p>
            <div className="flex items-center gap-3"><MoneyInput value={discount} onChange={setDiscount} /></div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between py-4 bg-violet-50 rounded-xl px-4 mt-2">
            <p className="text-base font-bold text-violet-900">รวมทั้งสิ้น</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-violet-700">{total.toLocaleString()}</span>
              <span className="text-sm text-violet-600">บาท</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Payment ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <SectionTitle icon={<CreditCard className="w-4 h-4 text-violet-600" />} title="การชำระเงิน" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Field label="ศูนย์บาทถ้วน">
            <div className="relative">
              <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value="สำนักงานใหญ่" readOnly className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-600" />
            </div>
          </Field>
          <Field label="ชำระโดย">
            <div className="relative">
              <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white appearance-none">
                {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </Field>
          <Field label="วันที่ชำระ">
            <input value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 bg-white" />
          </Field>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <button onClick={() => router.push('/dashboard')} className="px-6 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
          ยกเลิก
        </button>
        <button
          onClick={handleConfirm}
          disabled={saving}
          className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          {saving ? 'กำลังบันทึก...' : 'ชำระเงิน'}
        </button>
      </div>

      {/* ── Summary Modal ── */}
      {showSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">สรุปรายการชำระเงิน</h3>
                    <p className="text-xs text-slate-500">รหัส {student.studentId} · {student.fullName}</p>
                  </div>
                </div>
                <button onClick={() => setShowSummary(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400">✕</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">ค่าแรกเข้า</span><span className="font-medium">{admissionFee.toLocaleString()} บาท</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ค่าเรียน</span><span className="font-medium">{tuitionFee.toLocaleString()} บาท</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ค่าลูกคิด</span><span className="font-medium">{abacusFee.toLocaleString()} บาท</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ค่าหนังสือเรียน ({textbookQty} เล่ม)</span><span className="font-medium">{textbookTotal.toLocaleString()} บาท</span></div>
                <div className="flex justify-between"><span className="text-slate-500">บัตรดิจิตอล ({digitalCardQty} บัตร)</span><span className="font-medium">{digitalTotal.toLocaleString()} บาท</span></div>
                {discount > 0 && <div className="flex justify-between text-rose-600"><span>ส่วนลด</span><span className="font-medium">-{discount.toLocaleString()} บาท</span></div>}
                <div className="border-t border-slate-200 pt-2 flex justify-between">
                  <span className="font-bold text-slate-800">รวมทั้งสิ้น</span>
                  <span className="font-extrabold text-violet-700 text-lg">{total.toLocaleString()} บาท</span>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p><span className="font-medium">ชำระโดย:</span> {paymentMethod}</p>
                <p><span className="font-medium">วันที่ชำระ:</span> {paymentDate}</p>
                <p><span className="font-medium">หลักสูตร:</span> จินตคณิต {selectedCourseLevel?.grade_name_en} ({selectedCourseLevel?.abacus_type})</p>
                {selectedCourse && (
                  <>
                    <p><span className="font-medium">ครูผู้สอน:</span> {selectedCourse.instructor}</p>
                    <p><span className="font-medium">เวลาเรียน:</span> {selectedCourse.schedule}</p>
                  </>
                )}
                <p><span className="font-medium">ศูนย์:</span> {center}</p>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm font-medium text-slate-700">สแกน QR Code เพื่อชำระเงิน</p>
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`ACADEMY:${student.studentId}:${total}:${paymentDate}`)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <p className="text-xs text-slate-400">หรือบันทึก QR Code เพื่อแจ้งชำระผ่านแอพธนาคาร</p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={() => setShowSummary(false)} className="px-5 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50">ปิด</button>
              <button onClick={handlePrint} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 inline-flex items-center gap-2">
                <Printer className="w-4 h-4" />
                พิมพ์ใบเสร็จ
              </button>
              <button
                onClick={() => router.push(`/dashboard?studentId=${student.id}`)}
                className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 inline-flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                ยืนยันการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
