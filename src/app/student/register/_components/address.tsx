'use client';

import { Home } from 'lucide-react';
import { FormData, SectionTitle, Field, Input, Select } from './ui';

interface Props {
  form: FormData;
  update: (k: keyof FormData) => (v: string) => void;
  provinceOptions: string[];
  districtOptions: string[];
  subDistrictOptions: string[];
  loading?: boolean;
}

export default function AddressSection({ form, update, provinceOptions, districtOptions, subDistrictOptions, loading }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <SectionTitle icon={<Home className="w-4 h-4 text-violet-600" />} title="ที่อยู่" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="เลขที่"><Input value={form.houseNo} onChange={update('houseNo')} placeholder="เลขที่บ้าน" /></Field>
        <Field label="หมู่บ้าน / อาคาร"><Input value={form.village} onChange={update('village')} placeholder="ชื่อหมู่บ้านหรืออาคาร" /></Field>
        <Field label="หมู่ที่"><Input value={form.moo} onChange={update('moo')} placeholder="หมู่ที่" /></Field>
        <Field label="ถนน"><Input value={form.road} onChange={update('road')} placeholder="ชื่อถนน" /></Field>
        <Field label="ซอย"><Input value={form.soi} onChange={update('soi')} placeholder="ชื่อซอย" /></Field>
        <Field label="จังหวัด"><Select value={form.province} onChange={update('province')} options={provinceOptions} disabled={loading} /></Field>
        <Field label="อำเภอ / เขต"><Select value={form.district} onChange={update('district')} options={districtOptions} disabled={loading} /></Field>
        <Field label="ตำบล / แขวง"><Select value={form.subDistrict} onChange={update('subDistrict')} options={subDistrictOptions} disabled={loading} /></Field>
        <Field label="รหัสไปรษณีย์"><Input value={form.zipCode} onChange={update('zipCode')} placeholder="รหัสไปรษณีย์" /></Field>
      </div>
    </div>
  );
}
