'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function PhotoUploadCard() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          {preview ? (
            <img src={preview} alt="student" className="w-20 h-20 rounded-2xl object-cover border border-slate-200" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <User className="w-8 h-8 text-slate-300" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">อัปโหลดรูปนักเรียน</p>
          <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ .jpg, .jpeg, .png ขนาดไม่เกิน 5 MB</p>
          <p className="text-xs text-slate-400">ขนาดภาพขั้นต่ำ 400 x 400 px</p>
        </div>
        <label className="cursor-pointer px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
          เลือกรูปภาพ
          <input type="file" className="hidden" accept=".jpg,.jpeg,.png" onChange={handleChange} />
        </label>
      </div>
    </div>
  );
}
