'use client';

import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Trophy,
  Table,
  Calendar,
  Settings,
  MessageSquare,
  Library,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  UserPlus,
  CreditCard,
  UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'ภาพรวม',
    icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
    path: '/dashboard',
  },
  {
    title: 'งานทะเบียน',
    icon: <ClipboardList className="w-[18px] h-[18px]" />,
    children: [
      { title: 'สมัครเรียน', icon: <UserPlus className="w-[16px] h-[16px]" />, path: '/student/register' },
      { title: 'ลงทะเบียนเรียน - ชำระเงิน', icon: <CreditCard className="w-[16px] h-[16px]" />, path: '/student/enroll' },
      { title: 'สร้างแอคเคาท์ผู้ปกครอง', icon: <UserCog className="w-[16px] h-[16px]" />, path: '/parent/create' },
    ],
  }

];

const otherItems: MenuItem[] = [

  {
    title: 'ตั้งค่า',
    icon: <Settings className="w-[18px] h-[18px]" />,
    path: '/settings',
  },
  {
    title: 'ช่วยเหลือ',
    icon: <HelpCircle className="w-[18px] h-[18px]" />,
    path: '/support',
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['กิจกรรม', 'งานทะเบียน']);
  const [authRole, setAuthRole] = useState('');

  useEffect(() => {
    setAuthRole(localStorage.getItem('authRole') || '');
  }, []);

  const isParent = authRole === 'parent';

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(item => item !== title) : [...prev, title]
    );
  };

  const isActive = (path?: string) => path === pathname;

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.path);

    return (
      <div key={item.title}>
        <button
          onClick={() =>
            hasChildren
              ? toggleExpand(item.title)
              : item.path && (window.location.href = item.path)
          }
          className={cn(
            "w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all",
            active
              ? "bg-[#E9D5FF]/60 text-slate-900 shadow-sm"
              : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
            level > 0 && "pl-5 py-2.5"
          )}
        >
          <div
            className={cn(
              "flex items-center justify-center shrink-0 transition-all",
              active
                ? "w-8 h-8 bg-slate-900 rounded-xl text-white"
                : "w-8 h-8 text-slate-400"
            )}
          >
            {item.icon}
          </div>
          <span className="flex-1 text-left text-[15px] font-medium">{item.title}</span>
          {hasChildren && (
            isExpanded ? (
              <ChevronDown className="w-4 h-4 text-slate-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-slate-400" />
            )
          )}
        </button>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 pl-3">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-[260px] bg-[#EDE8F5] h-screen fixed left-0 top-0 overflow-y-auto flex flex-col">
      {/* Brand */}
      <div className="px-6 pt-8 pb-6">
        <h1
          className="text-[32px] font-bold text-slate-900 tracking-tight"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Academy.
        </h1>
      </div>

      {/* Menu Section */}
      <div className="px-4 flex-1">
        <p className="text-[13px] font-medium text-slate-400 mb-3 px-3">
          Menu
        </p>
        <div className="space-y-1.5">
          {menuItems
            .filter(item => !isParent || item.path === '/dashboard')
            .map(item => renderMenuItem(item))}
        </div>

        <div className="mt-8">
          <p className="text-[13px] font-medium text-slate-400 mb-3 px-3">
            Other
          </p>
          <div className="space-y-1.5">
            {otherItems
              .filter(item => !isParent || item.path === '/support')
              .map(item => renderMenuItem(item))}
          </div>
        </div>
      </div>
    </div>
  );
}
