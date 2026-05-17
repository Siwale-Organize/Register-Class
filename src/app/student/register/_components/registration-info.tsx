'use client';

import { BookOpen } from 'lucide-react';
import { FormData, SectionTitle, Field, Input, Select } from './ui';

interface Props {
  form: FormData;
  update: (k: keyof FormData) => (v: string) => void;
  branchOptions: string[];
  statusOptions: string[];
  loading?: boolean;
}

export default function RegistrationInfoSection({ form, update, branchOptions, statusOptions, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <SectionTitle icon={<BookOpen className="w-4 h-4 text-violet-600" />} title="ข้อมูลการสมัคร" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="สาขา" required><Select value={form.branch} onChange={update('branch')} options={branchOptions} disabled={loading} /></Field>
        <Field label="วันที่สมัคร" required><Input value={form.registerDate} onChange={update('registerDate')} type="date" /></Field>
        <Field label="รหัสประจำตัวนักเรียน"><Input value={form.studentId} onChange={update('studentId')} placeholder="เช่น ST-2024-001" /></Field>
        <Field label="สถานะ"><Select value={form.status} onChange={update('status')} options={statusOptions} disabled={loading} /></Field>
        <Field label="รหัสประจำตัวประชาชน"><Input value={form.idCard} onChange={update('idCard')} placeholder="X-XXXX-XXXXX-XX-X" /></Field>
        <Field label="วันเกิด" required><Input value={form.birthDate} onChange={update('birthDate')} type="date" /></Field>
      </div>
    </div>
  );
}
