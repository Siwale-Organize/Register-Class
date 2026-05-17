'use client';

import { Users } from 'lucide-react';
import { FormData, SectionTitle, Field, Input } from './ui';

export default function ParentsSection({ form, update }: { form: FormData; update: (k: keyof FormData) => (v: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <SectionTitle icon={<Users className="w-4 h-4 text-violet-600" />} title="ข้อมูลผู้ปกครอง" />

      {/* Father */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />ข้อมูลบิดา
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="ชื่อบิดา"><Input value={form.fatherFirstName} onChange={update('fatherFirstName')} placeholder="ชื่อบิดา" /></Field>
          <Field label="นามสกุล"><Input value={form.fatherLastName} onChange={update('fatherLastName')} placeholder="นามสกุล" /></Field>
          <Field label="เบอร์โทร"><Input value={form.fatherPhone} onChange={update('fatherPhone')} placeholder="เบอร์โทร" /></Field>
          <Field label="อาชีพ"><Input value={form.fatherOccupation} onChange={update('fatherOccupation')} placeholder="อาชีพ" /></Field>
          <Field label="สถานที่ทำงาน" className="sm:col-span-2 lg:col-span-2"><Input value={form.fatherWorkplace} onChange={update('fatherWorkplace')} placeholder="สถานที่ทำงาน" /></Field>
        </div>
      </div>

      {/* Mother */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />ข้อมูลมารดา
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="ชื่อมารดา"><Input value={form.motherFirstName} onChange={update('motherFirstName')} placeholder="ชื่อมารดา" /></Field>
          <Field label="นามสกุล"><Input value={form.motherLastName} onChange={update('motherLastName')} placeholder="นามสกุล" /></Field>
          <Field label="เบอร์โทร"><Input value={form.motherPhone} onChange={update('motherPhone')} placeholder="เบอร์โทร" /></Field>
          <Field label="อาชีพ"><Input value={form.motherOccupation} onChange={update('motherOccupation')} placeholder="อาชีพ" /></Field>
          <Field label="สถานที่ทำงาน" className="sm:col-span-2 lg:col-span-2"><Input value={form.motherWorkplace} onChange={update('motherWorkplace')} placeholder="สถานที่ทำงาน" /></Field>
        </div>
      </div>

      {/* Guardian */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />กรณีผู้ปกครองไม่ใช่ บิดา หรือ มารดา
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Field label="ชื่อผู้ปกครอง"><Input value={form.guardianFirstName} onChange={update('guardianFirstName')} placeholder="ชื่อผู้ปกครอง" /></Field>
          <Field label="นามสกุล"><Input value={form.guardianLastName} onChange={update('guardianLastName')} placeholder="นามสกุล" /></Field>
          <Field label="เบอร์โทร"><Input value={form.guardianPhone} onChange={update('guardianPhone')} placeholder="เบอร์โทร" /></Field>
          <Field label="ความสัมพันธ์"><Input value={form.guardianRelation} onChange={update('guardianRelation')} placeholder="เช่น ปู่ ย่า ลุง ป้า" /></Field>
        </div>
      </div>
    </div>
  );
}
