import { ReactNode } from 'react';

export interface FormData {
  branch: string; registerDate: string; studentId: string; status: string;
  idCard: string; birthDate: string; firstNameTh: string; lastNameTh: string;
  firstNameEn: string; lastNameEn: string; nickname: string; gender: string;
  age: string; currentSchool: string; gradeLevel: string; educationLevel: string;
  phone: string; mobile: string; houseNo: string; village: string; moo: string;
  road: string; soi: string; province: string; district: string;
  subDistrict: string; zipCode: string;
  fatherFirstName: string; fatherLastName: string; fatherPhone: string;
  fatherOccupation: string; fatherWorkplace: string;
  motherFirstName: string; motherLastName: string; motherPhone: string;
  motherOccupation: string; motherWorkplace: string;
  guardianFirstName: string; guardianLastName: string; guardianPhone: string;
  guardianRelation: string;
}

export const initialForm: FormData = {
  branch: '', registerDate: '', studentId: '', status: '',
  idCard: '', birthDate: '', firstNameTh: '', lastNameTh: '',
  firstNameEn: '', lastNameEn: '', nickname: '', gender: '', age: '',
  currentSchool: '', gradeLevel: '', educationLevel: '', phone: '', mobile: '',
  houseNo: '', village: '', moo: '', road: '', soi: '',
  province: '', district: '', subDistrict: '', zipCode: '',
  fatherFirstName: '', fatherLastName: '', fatherPhone: '', fatherOccupation: '', fatherWorkplace: '',
  motherFirstName: '', motherLastName: '', motherPhone: '', motherOccupation: '', motherWorkplace: '',
  guardianFirstName: '', guardianLastName: '', guardianPhone: '', guardianRelation: '',
};

export const fallbackBranchNames = ['เลือกสาขา', 'คณิตศาสตร์','ศูนย์ประสานงาน','กลุ่มโรงเรียน สช'];
export const fallbackStatusNames = ['กำลังเรียน', 'ลาพัก', 'พ้นสภาพ'];
export const fallbackGenderNames = ['ชาย', 'หญิง'];
export const fallbackProvinceNames = ['เลือกจังหวัด', 'กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ', 'ชลบุรี', 'เชียงใหม่'];
export const fallbackDistrictNames = ['เลือกอำเภอ/เขต', 'เมือง', 'บางรัก', 'ปากเกร็ด', 'ห้วยขวาง'];
export const fallbackSubDistrictNames = ['เลือกตำบล/แขวง', 'บางกะปิ', 'ลาดพร้าว', 'คลองเตย', 'สามแคว้้น'];

export function SectionTitle({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">{icon}</div>
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
    </div>
  );
}

export function Field({ label, required, children, className = '' }: { label: string; required?: boolean; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function Input({ value, onChange, placeholder = '', type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white transition-all"
    />
  );
}

export function Select({ value, onChange, options, disabled }: { value: string; onChange: (v: string) => void; options: string[]; disabled?: boolean }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
      className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-white transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {options.map(o => <option key={o} value={o === options[0] ? '' : o}>{o}</option>)}
    </select>
  );
}
