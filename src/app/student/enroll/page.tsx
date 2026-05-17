export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import StudentEnrollClient from './_components/StudentEnrollClient';

export default function EnrollmentPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin mr-3" />
        กำลังโหลด...
      </div>
    }>
      <StudentEnrollClient />
    </Suspense>
  );
}
