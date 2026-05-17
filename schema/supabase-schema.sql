-- ============================================================
-- Supabase Schema for Academy Class Registration System
-- Run this in your Supabase SQL Editor
-- ============================================================

-- --------------------------------------------------------
-- 1. Students table
-- --------------------------------------------------------
create table students (
  id uuid default gen_random_uuid() primary key,
  student_id text unique,
  branch text,
  register_date date,
  status text default 'active' check (status in ('active', 'inactive', 'on-leave')),
  id_card text,
  birth_date date,
  first_name_th text not null,
  last_name_th text not null,
  first_name_en text,
  last_name_en text,
  nickname text,
  gender text check (gender in ('ชาย', 'หญิง')),
  age integer,
  current_school text,
  grade_level text,
  education_level text,
  phone text,
  mobile text,
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 2. Addresses table (1-to-1 with students)
-- --------------------------------------------------------
create table addresses (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  house_no text,
  village text,
  moo text,
  road text,
  soi text,
  province text,
  district text,
  sub_district text,
  zip_code text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 3. Parents table (many-to-1 with students)
-- --------------------------------------------------------
create table parents (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  type text not null check (type in ('father', 'mother', 'guardian')),
  first_name text,
  last_name text,
  phone text,
  occupation text,
  workplace text,
  relation text, -- only for guardian
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 4. Documents table (metadata for uploaded files)
-- --------------------------------------------------------
create table documents (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  doc_type text not null check (doc_type in ('birth_certificate', 'other', 'education_proof')),
  file_url text not null,
  file_name text,
  uploaded_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 5. Courses table
-- --------------------------------------------------------
create table courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  instructor text,
  schedule text,
  status text default 'upcoming' check (status in ('completed', 'in-progress', 'upcoming')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 6. Student-Courses junction table
-- --------------------------------------------------------
create table student_courses (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  course_id uuid references courses(id) on delete cascade not null,
  enrollment_date date,
  unique(student_id, course_id)
);

-- --------------------------------------------------------
-- Row Level Security (RLS) policies
-- For demo / internal use: allow all authenticated operations
-- In production, restrict these policies!
-- --------------------------------------------------------
alter table students enable row level security;
alter table addresses enable row level security;
alter table parents enable row level security;
alter table documents enable row level security;
alter table courses enable row level security;
alter table student_courses enable row level security;

create policy "Allow all" on students for all using (true) with check (true);
create policy "Allow all" on addresses for all using (true) with check (true);
create policy "Allow all" on parents for all using (true) with check (true);
create policy "Allow all" on documents for all using (true) with check (true);
create policy "Allow all" on courses for all using (true) with check (true);
create policy "Allow all" on student_courses for all using (true) with check (true);

-- --------------------------------------------------------
-- Indexes for common queries
-- --------------------------------------------------------
create index idx_students_status on students(status);
create index idx_students_student_id on students(student_id);
create index idx_parents_student_id on parents(student_id);
create index idx_addresses_student_id on addresses(student_id);
create index idx_documents_student_id on documents(student_id);
create index idx_student_courses_student_id on student_courses(student_id);

-- --------------------------------------------------------
-- Insert sample courses
-- --------------------------------------------------------
insert into courses (name, instructor, schedule, status) values
  ('คณิตศาสตร์เพิ่มเติม', 'อ.สุดา รักเรียน', 'จันทร์/พุธ 16:00 - 18:00', 'in-progress'),
  ('ภาษาอังกฤษเข้มข้น', 'อ.ดาวิด สมิธ', 'อังคาร/พฤหัส 16:00 - 18:00', 'in-progress'),
  ('วิทยาศาสตร์เบื้องต้น', 'อ.มานี มีนา', 'เสาร์ 09:00 - 12:00', 'completed'),
  ('คณิตศาสตร์พื้นฐาน', 'อ.สุดา รักเรียน', 'จันทร์/พุธ 14:00 - 16:00', 'in-progress'),
  ('ภาษาไทยประยุกต์', 'อ.วิไล วัฒนา', 'ศุกร์ 15:00 - 17:00', 'in-progress'),
  ('ฟิสิกส์เตรียมสอบ', 'อ.นพดล วิทยา', 'เสาร์/อาทิตย์ 09:00 - 12:00', 'in-progress'),
  ('เคมีเข้มข้น', 'อ.วรรณา ศิลป์', 'อังคาร/พฤหัส 17:00 - 19:00', 'in-progress'),
  ('คณิตศาสตร์โอลิมปิก', 'อ.สุดา รักเรียน', 'เสาร์ 13:00 - 17:00', 'upcoming'),
  ('พัฒนาทักษะการอ่าน', 'อ.วิไล วัฒนา', 'จันทร์/พุธ 10:00 - 12:00', 'completed'),
  ('ศิลปะสร้างสรรค์', 'อ.มานี มีนา', 'เสาร์ 13:00 - 15:00', 'completed'),
  ('ชีววิทยาเบื้องต้น', 'อ.วรรณา ศิลป์', 'เสาร์ 09:00 - 12:00', 'in-progress'),
  ('ภาษาอังกฤษสนุกคิด', 'อ.ดาวิด สมิธ', 'ศุกร์ 15:00 - 17:00', 'upcoming');

-- --------------------------------------------------------
-- 7. Course Levels (จินตคณิต ระดับ Grade 1-10)
-- --------------------------------------------------------
create table course_levels (
  id uuid default gen_random_uuid() primary key,
  grade_code text not null unique, -- G1, G2, ... G10
  grade_name_th text not null,     -- ระดับ 1, ระดับ 2, ...
  grade_name_en text not null,     -- Grade 1, Grade 2, ...
  abacus_type text not null,       -- 10 beads, 4-1, etc.
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 8. Abacus Types (ประเภทลูกคิด)
-- --------------------------------------------------------
create table abacus_types (
  id uuid default gen_random_uuid() primary key,
  name text not null,           -- ลูกคิด 10 เม็ด, ลูกคิด 4-1, etc.
  price integer not null,       -- ราคา
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 9. Textbook Types (เกรดหนังสือเรียน)
-- --------------------------------------------------------
create table textbook_types (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,    -- junior, j2, j3, k, g1, etc.
  name text not null,           -- Junior, J.2, J.3, K, G.1, etc.
  grade_level text,             -- ชั้นเรียนที่เหมาะสม
  price integer not null,       -- ราคาต่อเล่ม
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 10. Fee Types (ประเภทค่าใช้จ่าย)
-- --------------------------------------------------------
create table fee_types (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,    -- admission, tuition, abacus, textbook, digital_card, discount
  name_th text not null,         -- ชื่อภาษาไทย
  name_en text,                  -- ชื่อภาษาอังกฤษ
  category text not null check (category in ('income', 'expense', 'discount')),
  is_required boolean default false,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 11. Enrollments (การลงทะเบียนเรียน)
-- --------------------------------------------------------
create table enrollments (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  enrollment_no text unique,    -- เลขที่ใบลงทะเบียน EN-YYYY-NNNN
  enrollment_date date not null,
  branch text,
  center text default 'ศูนย์ประสานงานหลัก',
  course_level_id uuid references course_levels(id),
  course_level_name text,       -- snapshot for reporting
  status text default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  total_amount integer not null default 0,     -- รวมก่อนส่วนลด
  discount_amount integer not null default 0,  -- ส่วนลด
  net_amount integer not null default 0,       -- รวมสุทธิ
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 12. Enrollment Fees (รายการค่าใช้จ่ายแต่ละบรรทัด)
-- --------------------------------------------------------
create table enrollment_fees (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  fee_type_id uuid references fee_types(id),
  fee_type_code text not null,   -- snapshot: admission, tuition, abacus, textbook, digital_card, discount
  description text not null,     -- เช่น "ค่าเรียนรายเดือน", "ลูกคิด 10 เม็ด"
  quantity integer not null default 1,
  unit_price integer not null default 0,
  amount integer not null,       -- quantity * unit_price (discount = negative)
  reference_id uuid,             -- textbook_id, abacus_id, etc.
  reference_name text,           -- snapshot
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 13. Payments (การชำระเงิน)
-- --------------------------------------------------------
create table payments (
  id uuid default gen_random_uuid() primary key,
  enrollment_id uuid references enrollments(id) on delete cascade not null,
  payment_no text unique,         -- เลขที่ใบเสร็จ PM-YYYY-NNNN
  payment_date date not null,
  payment_method text not null check (payment_method in ('เงินสด', 'โอนเงิน', 'เช็ค', 'บัตรเครดิต', 'QR Code')),
  amount integer not null,
  status text default 'pending' check (status in ('pending', 'paid', 'refunded', 'cancelled')),
  receipt_url text,               -- ไฟล์ใบเสร็จ (ถ้ามี)
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 14. Parent Accounts (แอคเคาท์ผู้ปกครอง)
-- --------------------------------------------------------
create table parent_accounts (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references students(id) on delete cascade not null,
  username text not null unique,   -- รหัสนักเรียน
  password text not null,          -- รหัสผ่าน (ให้ผู้ใช้ตั้งเอง)
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- Row Level Security (RLS) for new tables
-- --------------------------------------------------------
alter table course_levels enable row level security;
alter table abacus_types enable row level security;
alter table textbook_types enable row level security;
alter table fee_types enable row level security;
alter table enrollments enable row level security;
alter table enrollment_fees enable row level security;
alter table payments enable row level security;

create policy "Allow all" on course_levels for all using (true) with check (true);
create policy "Allow all" on abacus_types for all using (true) with check (true);
create policy "Allow all" on textbook_types for all using (true) with check (true);
create policy "Allow all" on fee_types for all using (true) with check (true);
create policy "Allow all" on enrollments for all using (true) with check (true);
create policy "Allow all" on enrollment_fees for all using (true) with check (true);
create policy "Allow all" on payments for all using (true) with check (true);

alter table parent_accounts enable row level security;
create policy "Allow all" on parent_accounts for all using (true) with check (true);

-- --------------------------------------------------------
-- Indexes for new tables
-- --------------------------------------------------------
create index idx_parent_accounts_student_id on parent_accounts(student_id);
create index idx_parent_accounts_username on parent_accounts(username);
create index idx_enrollments_student_id on enrollments(student_id);
create index idx_enrollments_status on enrollments(status);
create index idx_enrollment_fees_enrollment_id on enrollment_fees(enrollment_id);
create index idx_payments_enrollment_id on payments(enrollment_id);
create index idx_payments_status on payments(status);

-- --------------------------------------------------------
-- Seed data: Course Levels (จินตคณิต Grade 1-10)
-- --------------------------------------------------------
insert into course_levels (grade_code, grade_name_th, grade_name_en, abacus_type, description) values
  ('G1',  'ระดับ 1',  'Grade 1',  '5 beads',   'เริ่มต้นจับลูกคิด 5 เม็ด'),
  ('G2',  'ระดับ 2',  'Grade 2',  '5 beads',   'บวกลบ 1-2 หลัก'),
  ('G3',  'ระดับ 3',  'Grade 3',  '7 beads',   'บวกลบ 3-4 หลัก'),
  ('G4',  'ระดับ 4',  'Grade 4',  '10 beads',  'บวกลบ 5 หลัก คูณ 1 หลัก'),
  ('G5',  'ระดับ 5',  'Grade 5',  '10 beads',  'คูณ 2 หลัก หาร 1 หลัก'),
  ('G6',  'ระดับ 6',  'Grade 6',  '10 beads',  'คูณ 3 หลัก หาร 2 หลัก'),
  ('G7',  'ระดับ 7',  'Grade 7',  '10 beads',  'คูณ 4 หลัก หาร 3 หลัก'),
  ('G8',  'ระดับ 8',  'Grade 8',  '4-1',       'ลูกคิด 4-1 ระดับกลาง'),
  ('G9',  'ระดับ 9',  'Grade 9',  '4-1',       'ลูกคิด 4-1 ระดับสูง'),
  ('G10', 'ระดับ 10', 'Grade 10', '4-1',       'ลูกคิด 4-1 ขั้นเทพ');

-- --------------------------------------------------------
-- Seed data: Abacus Types
-- --------------------------------------------------------
insert into abacus_types (name, price, description) values
  ('ลูกคิด 10 เม็ด (มาตรฐาน)', 350, 'ลูกคิดไม้ 10 เม็ด สำหรับจินตคณิต'),
  ('ลูกคิด 4-1 (ญี่ปุ่น)', 450, 'ลูกคิดระบบญี่ปุ่น 4 ลูกบน 1 ลูกล่าง'),
  ('ลูกคิดพลาสติก 10 เม็ด', 250, 'ลูกคิดพลาสติกแบบเบา'),
  ('ลูกคิดไฟฟ้า (แบบฝึกหัด)', 1200, 'ลูกคิดไฟฟ้าสำหรับฝึกออนไลน์');

-- --------------------------------------------------------
-- Seed data: Textbook Types
-- --------------------------------------------------------
insert into textbook_types (code, name, grade_level, price) values
  ('junior', 'Junior',  'ระดับเริ่มต้น',  120),
  ('j2',     'J.2',     'ระดับ 1-2',       120),
  ('j3',     'J.3',     'ระดับ 3-4',       150),
  ('k',      'K',       'ระดับ 5-6',       150),
  ('g1',     'G.1',     'ระดับ 7-8',       180),
  ('g2',     'G.2',     'ระดับ 9-10',      180);

-- --------------------------------------------------------
-- Seed data: Fee Types
-- --------------------------------------------------------
insert into fee_types (code, name_th, name_en, category, is_required) values
  ('admission',    'ค่าแรกเข้า',     'Admission Fee',     'income', true),
  ('tuition',      'ค่าเรียน',       'Tuition Fee',       'income', true),
  ('abacus',       'ค่าลูกคิด',       'Abacus Fee',        'income', false),
  ('textbook',     'ค่าหนังสือเรียน', 'Textbook Fee',      'income', false),
  ('digital_card', 'บัตรดิจิตอล',    'Digital Card Fee',  'income', false),
  ('discount',     'ส่วนลด',         'Discount',          'discount', false);

-- --------------------------------------------------------
-- 11. Branches (สาขา)
-- --------------------------------------------------------
create table branches (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name_th text not null,
  name_en text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 12. Student Statuses (สถานะนักเรียน)
-- --------------------------------------------------------
create table student_statuses (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,    -- active, inactive, on-leave
  name_th text not null,
  name_en text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 13. Genders (เพศ)
-- --------------------------------------------------------
create table genders (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,    -- male, female
  name_th text not null,
  name_en text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 14. Provinces (จังหวัด)
-- --------------------------------------------------------
create table provinces (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  name_th text not null,
  name_en text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 15. Districts (อำเภอ/เขต) — linked to province
-- --------------------------------------------------------
create table districts (
  id uuid default gen_random_uuid() primary key,
  province_id uuid references provinces(id) on delete cascade not null,
  code text,
  name_th text not null,
  name_en text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- 16. Sub Districts (ตำบล/แขวง) — linked to district
-- --------------------------------------------------------
create table sub_districts (
  id uuid default gen_random_uuid() primary key,
  district_id uuid references districts(id) on delete cascade not null,
  code text,
  name_th text not null,
  name_en text,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------
-- RLS for reference tables
-- --------------------------------------------------------
alter table branches enable row level security;
alter table student_statuses enable row level security;
alter table genders enable row level security;
alter table provinces enable row level security;
alter table districts enable row level security;
alter table sub_districts enable row level security;

create policy "Allow all" on branches for all using (true) with check (true);
create policy "Allow all" on student_statuses for all using (true) with check (true);
create policy "Allow all" on genders for all using (true) with check (true);
create policy "Allow all" on provinces for all using (true) with check (true);
create policy "Allow all" on districts for all using (true) with check (true);
create policy "Allow all" on sub_districts for all using (true) with check (true);

-- --------------------------------------------------------
-- Indexes for reference tables
-- --------------------------------------------------------
create index idx_districts_province_id on districts(province_id);
create index idx_sub_districts_district_id on sub_districts(district_id);
create index idx_branches_active on branches(is_active);
create index idx_student_statuses_active on student_statuses(is_active);
create index idx_provinces_active on provinces(is_active);
create index idx_districts_active on districts(is_active);
create index idx_sub_districts_active on sub_districts(is_active);

-- --------------------------------------------------------
-- Seed data for reference tables
-- --------------------------------------------------------
insert into branches (code, name_th, name_en, sort_order) values
  ('coordinator','ศูนย์ประสานงาน',      'Coordinator Center', 1),
  ('school-group','กลุ่มโรงเรียน สช', 'School Group',      2);

insert into student_statuses (code, name_th, name_en, sort_order) values
  ('active',    'กำลังเรียน', 'Active',    1),
  ('on-leave',  'ลาพัก',     'On Leave',  2),
  ('inactive',  'พ้นสภาพ',   'Inactive',  3);

insert into genders (code, name_th, name_en, sort_order) values
  ('male',   'ชาย', 'Male',   1),
  ('female', 'หญิง', 'Female', 2);

insert into provinces (code, name_th, name_en, sort_order) values
  ('bkk',  'กรุงเทพมหานคร', 'Bangkok',       1),
  ('nont', 'นนทบุรี',        'Nonthaburi',    2),
  ('pat',  'ปทุมธานี',      'Pathum Thani',  3),
  ('sam',  'สมุทรปราการ',   'Samut Prakan',  4),
  ('chon', 'ชลบุรี',        'Chon Buri',     5),
  ('cm',   'เชียงใหม่',     'Chiang Mai',    6);

-- Districts for Bangkok
insert into districts (province_id, code, name_th, name_en, sort_order) values
  ((select id from provinces where code = 'bkk'), 'bang-rak',    'บางรัก',    'Bang Rak',    1),
  ((select id from provinces where code = 'bkk'), 'huay-kwang',  'ห้วยขวาง',  'Huai Khwang', 2),
  ((select id from provinces where code = 'bkk'), 'bang-kapi',   'บางกะปิ',   'Bang Kapi',   3),
  ((select id from provinces where code = 'bkk'), 'lat-phrao',   'ลาดพร้าว',  'Lat Phraao',  4);

-- Districts for Nonthaburi
insert into districts (province_id, code, name_th, name_en, sort_order) values
  ((select id from provinces where code = 'nont'), 'pak-kret',    'ปากเกร็ด',  'Pak Kret',    1),
  ((select id from provinces where code = 'nont'), 'mueang',      'เมืองนนทบุรี', 'Mueang Nonthaburi', 2);

-- Sub-districts for Bang Kapi (Bangkok)
insert into sub_districts (district_id, code, name_th, name_en, sort_order) values
  ((select id from districts where code = 'bang-kapi'), 'bk1', 'บางกะปิ', 'Bang Kapi', 1),
  ((select id from districts where code = 'bang-kapi'), 'bk2', 'คลองจั่น', 'Khlong Chan', 2);

-- Sub-districts for Lat Phrao (Bangkok)
insert into sub_districts (district_id, code, name_th, name_en, sort_order) values
  ((select id from districts where code = 'lat-phrao'), 'lp1', 'ลาดพร้าว', 'Lat Phrao', 1),
  ((select id from districts where code = 'lat-phrao'), 'lp2', 'สามแคว้ง', 'Sam Wa',    2);

-- Sub-districts for Pak Kret (Nonthaburi)
insert into sub_districts (district_id, code, name_th, name_en, sort_order) values
  ((select id from districts where code = 'pak-kret'), 'pk1', 'ปากเกร็ด', 'Pak Kret', 1),
  ((select id from districts where code = 'pak-kret'), 'pk2', 'บางตลาด', 'Bang Talat', 2);

-- --------------------------------------------------------
-- Migration: Link courses to course_levels + add teacher/schedule
-- --------------------------------------------------------

-- 1. Add course_level_id to courses
alter table courses add column if not exists course_level_id uuid references course_levels(id);
alter table courses add column if not exists is_active boolean default true;

-- 3. Add course_id to enrollments
alter table enrollments add column if not exists course_id uuid references courses(id);

-- 4. Index for course-level lookup
create index if not exists idx_courses_course_level_id on courses(course_level_id);
create index if not exists idx_enrollments_course_id on enrollments(course_id);

-- 5. Clear old generic courses and insert abacus-math class sections
-- Each course_level can have multiple class sections with different teachers/times
delete from courses;

insert into courses (course_level_id, name, instructor, schedule, status, is_active) values
  ((select id from course_levels where grade_code = 'G1'), 'จินตคณิต ระดับ 1', 'คุณครู สมศรี ใจดี',      'เสาร์-อาทิตย์ 08:00-09:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G1'), 'จินตคณิต ระดับ 1', 'คุณครู วิไล รักษ์',        'เสาร์-อาทิตย์ 10:00-11:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G2'), 'จินตคณิต ระดับ 2', 'คุณครู สมศรี ใจดี',      'เสาร์-อาทิตย์ 08:00-09:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G2'), 'จินตคณิต ระดับ 2', 'คุณครู นพดล วิทยา',       'เสาร์-อาทิตย์ 13:00-14:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G3'), 'จินตคณิต ระดับ 3', 'คุณครู วิไล รักษ์',        'เสาร์-อาทิตย์ 10:00-11:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G3'), 'จินตคณิต ระดับ 3', 'คุณครู มานี มีนา',        'เสาร์-อาทิตย์ 13:00-14:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G4'), 'จินตคณิต ระดับ 4', 'คุณครู สมศรี ใจดี',      'เสาร์-อาทิตย์ 08:00-09:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G4'), 'จินตคณิต ระดับ 4', 'คุณครู นพดล วิทยา',       'เสาร์-อาทิตย์ 10:00-11:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G5'), 'จินตคณิต ระดับ 5', 'คุณครู วิไล รักษ์',        'เสาร์-อาทิตย์ 13:00-14:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G5'), 'จินตคณิต ระดับ 5', 'คุณครู มานี มีนา',        'เสาร์-อาทิตย์ 08:00-09:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G6'), 'จินตคณิต ระดับ 6', 'คุณครู นพดล วิทยา',       'เสาร์-อาทิตย์ 10:00-11:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G6'), 'จินตคณิต ระดับ 6', 'คุณครู วรรณา ศิลป์',      'เสาร์-อาทิตย์ 13:00-14:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G7'), 'จินตคณิต ระดับ 7', 'คุณครู มานี มีนา',        'เสาร์-อาทิตย์ 08:00-09:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G7'), 'จินตคณิต ระดับ 7', 'คุณครู วรรณา ศิลป์',      'เสาร์-อาทิตย์ 10:00-11:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G8'), 'จินตคณิต ระดับ 8', 'คุณครู วรรณา ศิลป์',      'เสาร์-อาทิตย์ 13:00-14:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G8'), 'จินตคณิต ระดับ 8', 'คุณครู ดาวิด สมิธ',       'เสาร์-อาทิตย์ 15:00-16:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G9'), 'จินตคณิต ระดับ 9', 'คุณครู ดาวิด สมิธ',       'เสาร์-อาทิตย์ 08:00-09:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G9'), 'จินตคณิต ระดับ 9', 'คุณครู วิไล วัฒนา',       'เสาร์-อาทิตย์ 10:00-11:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G10'), 'จินตคณิต ระดับ 10', 'คุณครู ดาวิด สมิธ',      'เสาร์-อาทิตย์ 13:00-14:30', 'in-progress', true),
  ((select id from course_levels where grade_code = 'G10'), 'จินตคณิต ระดับ 10', 'คุณครู นพดล วิทยา',      'เสาร์-อาทิตย์ 15:00-16:30', 'in-progress', true);

-- --------------------------------------------------------
-- Migration: Soft-delete support for students
-- --------------------------------------------------------

-- Add deleted_at column for soft delete
alter table students add column if not exists deleted_at timestamp with time zone;

-- Create index for filtering active students
create index if not exists idx_students_deleted_at on students(deleted_at) where deleted_at is null;

-- Update existing RLS policy to exclude soft-deleted students (optional, for stricter access)
-- drop policy if exists "Allow all" on students;
-- create policy "Allow all" on students for all using (deleted_at is null) with check (true);

-- --------------------------------------------------------
-- Note: Create a Supabase Storage bucket named "student-files"
-- with folders: "photos/" and "documents/"
-- Also create: "receipts/" for payment receipts
-- --------------------------------------------------------
