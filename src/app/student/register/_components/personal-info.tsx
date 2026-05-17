'use client';

import { User } from 'lucide-react';
import { FormData, SectionTitle, Field, Input, Select } from './ui';

interface Props {
  form: FormData;
  update: (k: keyof FormData) => (v: string) => void;
  genderOptions: string[];
  loading?: boolean;
}

export default function PersonalInfoSection({ form, update, genderOptions, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <SectionTitle icon={<User className="w-4 h-4 text-violet-600" />} title="ข้อมูลส่วนตัว" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="ชื่อ (ไทย)" required><Input value={form.firstNameTh} onChange={update('firstNameTh')} placeholder="ไม่ต้องมีคำนำหน้า" /></Field>
        <Field label="นามสกุล (ไทย)" required><Input value={form.lastNameTh} onChange={update('lastNameTh')} placeholder="นามสกุลภาษาไทย" /></Field>
        <Field label="ชื่อ (Eng)"><Input value={form.firstNameEn} onChange={update('firstNameEn')} placeholder="First name" /></Field>
        <Field label="นามสกุล (Eng)"><Input value={form.lastNameEn} onChange={update('lastNameEn')} placeholder="Last name" /></Field>
        <Field label="ชื่อเล่น"><Input value={form.nickname} onChange={update('nickname')} placeholder="ชื่อเล่น" /></Field>
        <Field label="เพศ"><Select value={form.gender} onChange={update('gender')} options={genderOptions} disabled={loading} /></Field>
        <Field label="อายุ"><Input value={form.age} onChange={update('age')} type="number" placeholder="อายุ" /></Field>
        <Field label="สถานศึกษาปัจจุบัน"><Input value={form.currentSchool} onChange={update('currentSchool')} placeholder="ชื่อโรงเรียน" /></Field>
        <Field label="ระดับชั้น"><Input value={form.gradeLevel} onChange={update('gradeLevel')} placeholder="เช่น ประถมศึกษาปีที่ 6" /></Field>
        <Field label="ระดับ"><Input value={form.educationLevel} onChange={update('educationLevel')} placeholder="เช่น ประถม/มัธยม" /></Field>
        <Field label="เบอร์โทร"><Input value={form.phone} onChange={update('phone')} placeholder="เบอร์โทรศัพท์" /></Field>
        <Field label="มือถือ"><Input value={form.mobile} onChange={update('mobile')} placeholder="เบอร์มือถือ" /></Field>
      </div>
    </div>
  );
}
