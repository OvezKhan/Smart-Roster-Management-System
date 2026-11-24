import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';
import {
  CalendarDays,
  LayoutDashboard,
  Zap,
  Briefcase,
  Users,
  PlaneTakeoff,
  ShieldCheck,
  Database
} from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/client';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Datastraw | Smart Roster Management System',
  description: 'AI-assisted, deterministic roster management system across D2C brands, processes, and pods.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen flex antialiased`}>
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 z-40 border-r border-slate-800">
          {/* Logo Header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/30">
              D
            </div>
            <div>
              <div className="font-bold text-white text-base tracking-tight leading-none">Datastraw</div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 uppercase">
                Smart Roster OS
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
              Main Operations
            </div>

            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800/80 hover:text-white transition-all text-slate-300"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-400" />
              <span>Operations Dashboard</span>
            </Link>

            <Link
              href="/roster"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-all"
            >
              <CalendarDays className="w-4 h-4 text-indigo-400" />
              <span>Interactive Roster Hub</span>
            </Link>

            <Link
              href="/change-simulator"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800/80 hover:text-white transition-all text-slate-300"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <div className="flex items-center justify-between flex-1">
                <span>Change Simulator</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                  Section 3.F
                </span>
              </div>
            </Link>

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mt-6 mb-2">
              Configurations & Data
            </div>

            <Link
              href="/brands"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800/80 hover:text-white transition-all text-slate-300"
            >
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>Brands & Calendars</span>
            </Link>

            <Link
              href="/teams"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800/80 hover:text-white transition-all text-slate-300"
            >
              <Users className="w-4 h-4 text-slate-400" />
              <span>Teams & Pod Leads (32)</span>
            </Link>

            <Link
              href="/leaves"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800/80 hover:text-white transition-all text-slate-300"
            >
              <PlaneTakeoff className="w-4 h-4 text-slate-400" />
              <span>Leaves & Comp-Offs</span>
            </Link>
          </nav>

          {/* Footer Badge */}
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
            <div className="flex items-center gap-2 font-medium text-slate-300 mb-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Constraint Engine Active</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
              <Database className="w-3 h-3 text-indigo-400" />
              <span>{isSupabaseConfigured ? 'Supabase Live Connected' : 'Local Seed Store (Offline)'}</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 ml-64 flex flex-col min-h-screen">
          <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
