export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import StudentRegisterClient from './_components/StudentRegisterClient';

export default function StudentRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-500 rounded-full animate-spin mr-3" />
        กำลังโหลด...
      </div>
    }>
      <StudentRegisterClient />
    </Suspense>
  );
}
