'use client';

import { FileText, Upload, GraduationCap } from 'lucide-react';
import { SectionTitle } from './ui';

function UploadRow({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50/50 hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center">{icon}</div>
          <div>
            <p className="text-sm font-medium text-slate-700">{title}</p>
            <p className="text-xs text-slate-400 mt-0.5">{description}</p>
          </div>
        </div>
        <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          เลือกไฟล์
          <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
        </label>
      </div>
    </div>
  );
}

export default function DocumentsSection() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <SectionTitle icon={<FileText className="w-4 h-4 text-violet-600" />} title="เอกสารแนบ" />
      <div className="space-y-4">
        <UploadRow icon={<Upload className="w-5 h-5 text-slate-400" />} title="แนบสำเนาสูติบัตร / บัตรประชาชน" description="รองรับไฟล์ .pdf, .jpg, .png ขนาดไม่เกิน 5 MB" />
        <UploadRow icon={<Upload className="w-5 h-5 text-slate-400" />} title="แนบเอกสารอื่น ๆ" description="รองรับไฟล์ .pdf, .jpg, .png ขนาดไม่เกิน 5 MB" />
        <UploadRow icon={<GraduationCap className="w-5 h-5 text-slate-400" />} title="เอกสารหลักฐานแสดงระดับชั้นที่กำลังศึกษา" description="รองรับไฟล์ .pdf, .jpg, .png ขนาดไม่เกิน 5 MB" />
      </div>
    </div>
  );
}
