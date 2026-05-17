'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell, User, LogOut } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const [authRole, setAuthRole] = useState('');
  const [authUsername, setAuthUsername] = useState('');

  useEffect(() => {
    setAuthRole(localStorage.getItem('authRole') || '');
    setAuthUsername(localStorage.getItem('authUsername') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authRole');
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authStudentId');
    router.push('/login');
  };

  const displayName = authUsername || 'Guest';
  const roleLabel = authRole === 'parent' ? 'ผู้ปกครอง' : 'เจ้าหน้าที่';

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 h-16 fixed top-0 right-0 left-[260px] z-10">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 bg-slate-50/50 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
            <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{displayName}</p>
              <p className="text-xs text-slate-500">{roleLabel}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="ออกจากระบบ"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
