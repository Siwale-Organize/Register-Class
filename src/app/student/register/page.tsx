'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Save, X } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { isSupabaseConfigured, fallbackAddStudent } from '@/lib/fallback-db';
import PhotoUploadCard from './_components/photo-upload';
import RegistrationInfoSection from './_components/registration-info';
import PersonalInfoSection from './_components/personal-info';
import AddressSection from './_components/address';
import ParentsSection from './_components/parents';
import DocumentsSection from './_components/documents';
import { FormData, initialForm, fallbackBranchNames, fallbackStatusNames, fallbackGenderNames, fallbackProvinceNames, fallbackDistrictNames, fallbackSubDistrictNames } from './_components/ui';
import type { DbBranch, DbStudentStatus, DbGender, DbProvince, DbDistrict, DbSubDistrict } from '@/lib/data';

export default function StudentRegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editStudentId = searchParams.get('edit');
  const isEdit = !!editStudentId;

  const [form, setForm] = useState<FormData>(initialForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(isEdit);

  // Reference data from Supabase
  const [branches, setBranches] = useState<DbBranch[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<DbStudentStatus[]>([]);
  const [genders, setGenders] = useState<DbGender[]>([]);
  const [provinces, setProvinces] = useState<DbProvince[]>([]);
  const [districts, setDistricts] = useState<DbDistrict[]>([]);
  const [subDistricts, setSubDistricts] = useState<DbSubDistrict[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured()) {
        setLoadingRefs(false);
        return;
      }
      const supabase = createClient();
      try {
        const [
          { data: b },
          { data: s },
          { data: g },
          { data: p },
          { data: d },
          { data: sd },
        ] = await Promise.all([
          supabase.from('branches').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('student_statuses').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('genders').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('provinces').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('districts').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
          supabase.from('sub_districts').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
        ]);
        setBranches(b ?? []);
        setStudentStatuses(s ?? []);
        setGenders(g ?? []);
        setProvinces(p ?? []);
        setDistricts(d ?? []);
        setSubDistricts(sd ?? []);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      } finally {
        setLoadingRefs(false);
      }
    }
    load();
  }, []);

  // Load existing student data in edit mode
  useEffect(() => {
    if (!editStudentId || !isSupabaseConfigured()) {
      setLoadingEdit(false);
      return;
    }
    async function loadStudent() {
      const supabase = createClient();
      try {
        const [
          { data: student },
          { data: address },
          { data: parents },
        ] = await Promise.all([
          supabase.from('students').select('*').eq('id', editStudentId).single(),
          supabase.from('addresses').select('*').eq('student_id', editStudentId).maybeSingle(),
          supabase.from('parents').select('*').eq('student_id', editStudentId),
        ]);
        if (!student || student.deleted_at) return;

        const statusName = studentStatuses.find(s => s.code === student.status)?.name_th || fallbackStatusNames[0];
        const branchName = branches.find(b => b.id === student.branch)?.name_th || (student.branch || '');
        const genderName = genders.find(g => g.code === student.gender)?.name_th || (student.gender || '');

        const father = parents?.find(p => p.type === 'father');
        const mother = parents?.find(p => p.type === 'mother');
        const guardian = parents?.find(p => p.type === 'guardian');

        setForm({
          studentId: student.student_id || '',
          branch: branchName,
          registerDate: student.register_date || '',
          status: statusName,
          idCard: student.id_card || '',
          birthDate: student.birth_date || '',
          firstNameTh: student.first_name_th || '',
          lastNameTh: student.last_name_th || '',
          firstNameEn: student.first_name_en || '',
          lastNameEn: student.last_name_en || '',
          nickname: student.nickname || '',
          gender: genderName,
          age: student.age != null ? String(student.age) : '',
          currentSchool: student.current_school || '',
          gradeLevel: student.grade_level || '',
          educationLevel: student.education_level || '',
          phone: student.phone || '',
          mobile: student.mobile || '',
          houseNo: address?.house_no || '',
          village: address?.village || '',
          moo: address?.moo || '',
          road: address?.road || '',
          soi: address?.soi || '',
          province: address?.province || '',
          district: address?.district || '',
          subDistrict: address?.sub_district || '',
          zipCode: address?.zip_code || '',
          fatherFirstName: father?.first_name || '',
          fatherLastName: father?.last_name || '',
          fatherPhone: father?.phone || '',
          fatherOccupation: father?.occupation || '',
          fatherWorkplace: father?.workplace || '',
          motherFirstName: mother?.first_name || '',
          motherLastName: mother?.last_name || '',
          motherPhone: mother?.phone || '',
          motherOccupation: mother?.occupation || '',
          motherWorkplace: mother?.workplace || '',
          guardianFirstName: guardian?.first_name || '',
          guardianLastName: guardian?.last_name || '',
          guardianPhone: guardian?.phone || '',
          guardianRelation: guardian?.relation || '',
        });
      } catch (err) {
        console.error('Failed to load student for edit:', err);
      } finally {
        setLoadingEdit(false);
      }
    }
    loadStudent();
  }, [editStudentId, branches, studentStatuses, genders]);

  const update = (key: keyof FormData) => (value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'province') {
        next.district = '';
        next.subDistrict = '';
      }
      if (key === 'district') {
        next.subDistrict = '';
      }
      return next;
    });
  };

  // Build string option arrays for selects (fallback when DB unavailable)
  const branchOptions = ['เลือกสาขา', ...(branches.length ? branches.map(b => b.name_th) : fallbackBranchNames.slice(1))];
  const statusOptions = ['เลือกสถานะ', ...(studentStatuses.length ? studentStatuses.map(s => s.name_th) : fallbackStatusNames)];
  const genderOptions = ['เลือกเพศ', ...(genders.length ? genders.map(g => g.name_th) : fallbackGenderNames)];
  const provinceOptions = ['เลือกจังหวัด', ...(provinces.length ? provinces.map(p => p.name_th) : fallbackProvinceNames.slice(1))];

  const selectedProvince = provinces.find(p => p.name_th === form.province);
  const filteredDistrictNames = selectedProvince
    ? districts.filter(d => d.province_id === selectedProvince.id).map(d => d.name_th)
    : fallbackDistrictNames.slice(1);
  const districtOptions = ['เลือกอำเภอ/เขต', ...filteredDistrictNames];

  const selectedDistrict = districts.find(d => d.name_th === form.district);
  const filteredSubDistrictNames = selectedDistrict
    ? subDistricts.filter(s => s.district_id === selectedDistrict.id).map(s => s.name_th)
    : fallbackSubDistrictNames.slice(1);
  const subDistrictOptions = ['เลือกตำบล/แขวง', ...filteredSubDistrictNames];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const statusValue = (studentStatuses.find(s => s.name_th === form.status)?.code || 'active') as 'active' | 'inactive' | 'on-leave';

    try {
      if (!isSupabaseConfigured()) {
        // Fallback: save to localStorage
        const parentParts: string[] = [];
        if (form.fatherFirstName) parentParts.push(`${form.fatherFirstName} ${form.fatherLastName || ''} (พ่อ)`);
        if (form.motherFirstName) parentParts.push(`${form.motherFirstName} ${form.motherLastName || ''} (แม่)`);
        if (form.guardianFirstName) parentParts.push(`${form.guardianFirstName} ${form.guardianLastName || ''} (${form.guardianRelation || 'ผู้ปกครอง'})`);

        fallbackAddStudent({
          studentId: form.studentId || undefined,
          fullName: `${form.firstNameTh} ${form.lastNameTh}`,
          nickname: form.nickname,
          status: statusValue,
          age: form.age ? parseInt(form.age) : 0,
          level: form.gradeLevel || form.educationLevel || '',
          phone: form.phone || form.mobile || '',
          parents: parentParts.join(', '),
          courses: [],
        });

        alert('บันทึกข้อมูลสำเร็จ (โหมดออฟไลน์)');
        router.push('/dashboard');
        return;
      }

      // Supabase mode
      const studentPayload = {
        student_id: form.studentId || null,
        branch: form.branch || null,
        register_date: form.registerDate || null,
        status: statusValue,
        id_card: form.idCard || null,
        birth_date: form.birthDate || null,
        first_name_th: form.firstNameTh,
        last_name_th: form.lastNameTh,
        first_name_en: form.firstNameEn || null,
        last_name_en: form.lastNameEn || null,
        nickname: form.nickname || null,
        gender: form.gender || null,
        age: form.age ? parseInt(form.age) : null,
        current_school: form.currentSchool || null,
        grade_level: form.gradeLevel || null,
        education_level: form.educationLevel || null,
        phone: form.phone || null,
        mobile: form.mobile || null,
      };

      const supabase = createClient();
      let studentId = editStudentId || '';

      if (isEdit) {
        await supabase.from('students').update(studentPayload).eq('id', studentId);
      } else {
        const { data: studentData } = await supabase.from('students').insert(studentPayload).select('id').single();
        studentId = studentData!.id;
      }

      if (isEdit) {
        await supabase.from('addresses').delete().eq('student_id', studentId);
      }
      if (form.houseNo || form.province) {
        await supabase.from('addresses').insert({
          student_id: studentId,
          house_no: form.houseNo || null,
          village: form.village || null,
          moo: form.moo || null,
          road: form.road || null,
          soi: form.soi || null,
          province: form.province || null,
          district: form.district || null,
          sub_district: form.subDistrict || null,
          zip_code: form.zipCode || null,
        });
      }

      if (isEdit) {
        await supabase.from('parents').delete().eq('student_id', studentId);
      }
      if (form.fatherFirstName) {
        await supabase.from('parents').insert({
          student_id: studentId, type: 'father',
          first_name: form.fatherFirstName, last_name: form.fatherLastName || null,
          phone: form.fatherPhone || null, occupation: form.fatherOccupation || null,
          workplace: form.fatherWorkplace || null,
        });
      }
      if (form.motherFirstName) {
        await supabase.from('parents').insert({
          student_id: studentId, type: 'mother',
          first_name: form.motherFirstName, last_name: form.motherLastName || null,
          phone: form.motherPhone || null, occupation: form.motherOccupation || null,
          workplace: form.motherWorkplace || null,
        });
      }
      if (form.guardianFirstName) {
        await supabase.from('parents').insert({
          student_id: studentId, type: 'guardian',
          first_name: form.guardianFirstName, last_name: form.guardianLastName || null,
          phone: form.guardianPhone || null, relation: form.guardianRelation || null,
        });
      }

      alert(isEdit ? 'แก้ไขข้อมูลสำเร็จ' : 'บันทึกข้อมูลสำเร็จ');
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด: ' + (err instanceof Error ? err.message : 'unknown'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/dashboard')} className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'สมัครเรียน'}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{isEdit ? 'แก้ไขข้อมูลนักเรียนที่มีอยู่' : 'กรอกข้อมูลนักเรียนเพื่อลงทะเบียนเข้าเรียน'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/dashboard')} className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
            <X className="w-4 h-4" />ยกเลิก
          </button>
          <button type="submit" form="register-form" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60">
            <Save className="w-4 h-4" />{saving ? 'กำลังบันทึก...' : (isEdit ? 'บันทึกการแก้ไข' : 'บันทึก')}
          </button>
        </div>
      </div>

      <form id="register-form" onSubmit={handleSubmit} className="space-y-6">
        <PhotoUploadCard />
        <RegistrationInfoSection form={form} update={update} branchOptions={branchOptions} statusOptions={statusOptions} loading={loadingRefs} />
        <PersonalInfoSection form={form} update={update} genderOptions={genderOptions} loading={loadingRefs} />
        <AddressSection form={form} update={update} provinceOptions={provinceOptions} districtOptions={districtOptions} subDistrictOptions={subDistrictOptions} loading={loadingRefs} />
        <ParentsSection form={form} update={update} />
        <DocumentsSection />

        <div className="flex items-center justify-end gap-3 pb-8">
          <button type="button" onClick={() => router.push('/dashboard')} className="px-6 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">ยกเลิก</button>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-xl hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60">{saving ? 'กำลังบันทึก...' : (isEdit ? 'บันทึกการแก้ไข' : 'บันทึกข้อมูล')}</button>
        </div>
      </form>
    </div>
  );
}
