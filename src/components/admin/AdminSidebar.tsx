'use client';

// =============================================================================
// THE A 5995 - Admin Sidebar Component
// =============================================================================

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Properties', href: '/admin/properties', icon: Building2 },
  { label: 'Inquiries', href: '/admin/inquiries', icon: MessageSquare },
  { label: 'Blog', href: '/admin/blog', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function AdminSidebar({ userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 border-b border-primary-600">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/logo-image.png"
            alt="The A 5995 Property"
            width={isCollapsed ? 40 : 140}
            height={isCollapsed ? 40 : 48}
            className={cn(
              'brightness-0 invert',
              isCollapsed ? 'h-10 w-10 object-contain' : 'h-12 w-auto',
            )}
          />
          {!isCollapsed && (
            <p className="text-primary-300 text-xs tracking-wider uppercase">Admin</p>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-secondary-400/20 text-secondary-400'
                  : 'text-primary-200 hover:bg-primary-600 hover:text-white',
                isCollapsed && 'justify-center px-2',
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-secondary-400')} />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div className="border-t border-primary-600 p-4">
        {!isCollapsed && (
          <div className="mb-3 px-2">
            <p className="text-white text-sm font-medium truncate">{userName || 'Admin'}</p>
            <p className="text-primary-300 text-xs truncate">{userEmail || ''}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-primary-200 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200',
            isCollapsed && 'justify-center px-2',
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:block border-t border-primary-600 p-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full py-2 text-primary-300 hover:text-white transition-colors"
        >
          <ChevronLeft
            className={cn(
              'w-5 h-5 transition-transform duration-200',
              isCollapsed && 'rotate-180',
            )}
          />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-700 text-white rounded-lg shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 h-full w-64 bg-primary-700 z-50 flex flex-col transform transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 text-primary-200 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed top-0 left-0 h-full bg-primary-700 transition-all duration-300 z-30',
          isCollapsed ? 'w-20' : 'w-64',
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
