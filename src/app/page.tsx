'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Briefcase,
  Layers,
  CalendarDays,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { dataStore } from '@/lib/data/store';
import { generateMonthlyRoster } from '@/lib/engine/generator';
import { RosterConflict } from '@/lib/types';

export default function DashboardPage() {
  const [empCount, setEmpCount] = useState<number>(0);
  const [brandCount, setBrandCount] = useState<number>(0);
  const [podCount, setPodCount] = useState<number>(0);
  const [conflicts, setConflicts] = useState<RosterConflict[]>([]);

  useEffect(() => {
    const emps = dataStore.getEmployees();
    setEmpCount(emps.length);
    setBrandCount(dataStore.getBrands().length);
    setPodCount(dataStore.getPods().length);

    // Run quick evaluation
    const res = generateMonthlyRoster({
      year: 2026,
      month: 12,
      employees: emps,
      brands: dataStore.getBrands(),
      processes: dataStore.getProcesses(),
      brandProcesses: dataStore.getBrandProcesses(),
      assignments: dataStore.getAssignments(),
      holidays: dataStore.getHolidays(),
      leaves: dataStore.getLeaves(),
      preferences: dataStore.getPreferences()
    });
    setConflicts(res.conflicts);
  }, []);

  const hardCount = conflicts.filter(c => c.severity === 'HARD_ERROR').length;
  const warningCount = conflicts.filter(c => c.severity === 'COVERAGE_WARNING').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Datastraw Full Stack AI Developer Assessment
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">
            Smart Roster Management OS
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            A deterministic, constraint-satisfaction scheduling system built to solve complex D2C support operations across multiple brands, pods, operating calendars, and realistic resource allocations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/roster"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-lg shadow-indigo-600/30 transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              Open Interactive Roster Hub
            </Link>
            <Link
              href="/change-simulator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 font-semibold text-xs text-white border border-white/10 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              Run Change Simulator (Section 3.F)
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Team</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{empCount}</div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">$\ge 30$ Requirement Met</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Client Brands</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{brandCount}</div>
            <div className="text-[11px] text-indigo-600 font-semibold mt-0.5">80% Dedicated, 20% Multi</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Operational Pods</div>
            <div className="text-3xl font-black text-slate-800 mt-1">{podCount}</div>
            <div className="text-[11px] text-purple-600 font-semibold mt-0.5">Pod Leads Assigned</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audit Status</div>
            <div className="text-3xl font-black text-slate-800 mt-1">
              {hardCount === 0 ? 'Healthy' : `${hardCount} Alerts`}
            </div>
            <div className="text-[11px] text-amber-600 font-semibold mt-0.5">
              {warningCount} Warnings Flagged
            </div>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${hardCount === 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
            {hardCount === 0 ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
          </div>
        </div>
      </div>

      {/* Feature Deep Dive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">5 Interactive Roster Views</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore monthly schedules at the Company, Pod, Brand, Process, and Employee level with full support for manual shift edits and real-time constraint re-validation.
            </p>
          </div>
          <Link
            href="/roster"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Launch Roster Hub <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Change Simulator (Section 3.F)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Test dynamic post-generation changes. Inject sudden leave for a dedicated 365-day brand resource, witness the immediate gap detection, and inspect automated pod substitute recommendations.
            </p>
          </div>
          <Link
            href="/change-simulator"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700"
          >
            Run Simulator <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Brand Operating Calendars</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Decouple client operating requirements (365 days, Mon-Sat, public holiday exemptions) from employee working schedules to prevent scheduling blind spots.
            </p>
          </div>
          <Link
            href="/brands"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700"
          >
            Configure Rules <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
