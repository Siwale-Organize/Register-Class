export interface Course {
  name: string;
  instructor: string;
  schedule: string;
  status: 'completed' | 'in-progress' | 'upcoming';
}

export interface Student {
  id: string;
  studentId: string;
  fullName: string;
  nickname: string;
  status: 'active' | 'inactive' | 'on-leave';
  age: number;
  level: string;
  phone: string;
  parents: string;
  courses: Course[];
}

// Types matching Supabase schema
export interface DbStudent {
  id: string;
  student_id: string | null;
  branch: string | null;
  register_date: string | null;
  status: 'active' | 'inactive' | 'on-leave';
  id_card: string | null;
  birth_date: string | null;
  first_name_th: string;
  last_name_th: string;
  first_name_en: string | null;
  last_name_en: string | null;
  nickname: string | null;
  gender: ('ชาย' | 'หญิง') | null;
  age: number | null;
  current_school: string | null;
  grade_level: string | null;
  education_level: string | null;
  phone: string | null;
  mobile: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbParent {
  id: string;
  student_id: string;
  type: 'father' | 'mother' | 'guardian';
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  occupation: string | null;
  workplace: string | null;
  relation: string | null;
  created_at: string;
}

export interface DbAddress {
  id: string;
  student_id: string;
  house_no: string | null;
  village: string | null;
  moo: string | null;
  road: string | null;
  soi: string | null;
  province: string | null;
  district: string | null;
  sub_district: string | null;
  zip_code: string | null;
  created_at: string;
}

// ─── Reference / Lookup Types ────────────────────────

export interface DbBranch {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbStudentStatus {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbGender {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbProvince {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbDistrict {
  id: string;
  province_id: string;
  code: string | null;
  name_th: string;
  name_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbSubDistrict {
  id: string;
  district_id: string;
  code: string | null;
  name_th: string;
  name_en: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// ─── Enrollment & Payment Types ──────────────────────

export interface DbCourseLevel {
  id: string;
  grade_code: string;
  grade_name_th: string;
  grade_name_en: string;
  abacus_type: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbCourse {
  id: string;
  course_level_id: string | null;
  name: string;
  instructor: string;
  schedule: string;
  status: 'completed' | 'in-progress' | 'upcoming';
  is_active: boolean;
  created_at: string;
}

export interface DbAbacusType {
  id: string;
  name: string;
  price: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface DbTextbookType {
  id: string;
  code: string;
  name: string;
  grade_level: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface DbFeeType {
  id: string;
  code: string;
  name_th: string;
  name_en: string | null;
  category: 'income' | 'expense' | 'discount';
  is_required: boolean;
  is_active: boolean;
  created_at: string;
}

export interface DbEnrollment {
  id: string;
  student_id: string;
  enrollment_no: string | null;
  enrollment_date: string;
  branch: string | null;
  center: string;
  course_level_id: string | null;
  course_level_name: string | null;
  course_id: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  total_amount: number;
  discount_amount: number;
  net_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbEnrollmentFee {
  id: string;
  enrollment_id: string;
  fee_type_id: string | null;
  fee_type_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  reference_id: string | null;
  reference_name: string | null;
  sort_order: number;
  created_at: string;
}

export interface DbPayment {
  id: string;
  enrollment_id: string;
  payment_no: string | null;
  payment_date: string;
  payment_method: 'เงินสด' | 'โอนเงิน' | 'เช็ค' | 'บัตรเครดิต' | 'QR Code';
  amount: number;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  receipt_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── App Types for Enrollment ────────────────────────

export interface EnrollmentFeeItem {
  feeTypeCode: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  referenceId?: string;
  referenceName?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  enrollmentNo: string;
  enrollmentDate: string;
  branch: string;
  center: string;
  courseLevel: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  fees: EnrollmentFeeItem[];
  payment?: DbPayment;
}

/** Convert DB student row to app Student format */
export function dbStudentToStudent(db: DbStudent, courses: Course[] = [], parentsList: DbParent[] = []): Student {
  const parentNames = parentsList
    .filter(p => p.student_id === db.id)
    .map(p => {
      const name = [p.first_name, p.last_name].filter(Boolean).join(' ');
      const typeLabel = p.type === 'father' ? 'พ่อ' : p.type === 'mother' ? 'แม่' : p.relation || 'ผู้ปกครอง';
      return `${name} (${typeLabel})`;
    })
    .join(', ');

  return {
    id: db.id,
    studentId: db.student_id || db.id.slice(0, 8).toUpperCase(),
    fullName: `${db.first_name_th} ${db.last_name_th}`,
    nickname: db.nickname || '',
    status: db.status,
    age: db.age || 0,
    level: db.grade_level || db.education_level || '',
    phone: db.phone || db.mobile || '',
    parents: parentNames || '',
    courses,
  };
}
