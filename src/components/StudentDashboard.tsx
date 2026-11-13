import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  PlusCircle, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Layers, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Bell, 
  FileText, 
  HelpCircle,
  ExternalLink,
  ChevronRight,
  History
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string, outpassId?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate }) => {
  const { currentUser, outpasses } = useApp();

  const studentOutpasses = outpasses.filter(o => o.studentId === currentUser?.id);
  const totalCount = studentOutpasses.length;
  const approvedCount = studentOutpasses.filter(o => o.status === 'Approved' || o.status === 'Completed').length;
  const pendingCount = studentOutpasses.filter(o => o.status.startsWith('Pending')).length;
  const rejectedCount = studentOutpasses.filter(o => o.status === 'Rejected').length;

  const clearanceRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 100;

  // Active outpass
  const activeOutpass = studentOutpasses.find(o => o.status === 'Approved' || o.status.startsWith('Pending')) || studentOutpasses[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Master Action Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Good Morning, {currentUser?.name || 'Surya'}!
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-semibold">
              AY 2026–2027
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Track your residential outpass approvals and gate QR authorizations.
          </p>
        </div>

        {/* Master Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigate('gate-passes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 font-semibold text-xs sm:text-sm transition cursor-pointer"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>View Active QR Pass</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider">
              VALID
            </span>
          </button>

          <button
            onClick={() => onNavigate('apply-outpass')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-600/20 active:scale-[0.99] transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for New Outpass</span>
          </button>
        </div>
      </div>

      {/* Profile & Key Metrics Grid (Bento Arrangement matching code_b8ec0dd1 / screen_2a0f9ca7) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Student Residential Credentials Dossier (5 cols) */}
        <div className="xl:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-inner bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center shrink-0 uppercase tracking-wider">
                  {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'SU'}
                  <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white"></div>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">{currentUser?.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {currentUser?.year} • {currentUser?.section}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">
                    Reg. No: <span className="font-semibold text-slate-800">{currentUser?.registerNumber}</span>
                  </p>
                  <p className="text-xs text-blue-600 font-medium mt-0.5">
                    {currentUser?.departmentName}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
                <div className="w-12 h-12 rounded-full p-0.5 bg-white border border-amber-300 shadow-sm flex items-center justify-center">
                  <img
                    src="/assets/aistudio/dsu_983323a0.webp"
                    alt="DSU Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Academic & Residence Metadata Split */}
            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Hostel Quarters
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-1">
                  {currentUser?.hostelBlock}
                </span>
                <span className="text-xs text-blue-600 font-mono block mt-0.5">
                  {currentUser?.room}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Assigned Faculty Mentor
                </span>
                <span className="text-xs font-bold text-slate-800 block mt-1">
                  {currentUser?.mentorName || 'Sivaselvi (AP/CYS)'}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Dept. CYS • Cabin #204
                </span>
              </div>
            </div>
          </div>

          {/* Compliance & Biometrics Checklist Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-slate-100">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Biometric Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
              Guardian: {currentUser?.parentPhone}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
              Parent SMS Consent ON
            </span>
          </div>
        </div>

        {/* 4 Key Statistics Cards (7 cols) */}
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Total Outpasses */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Outpasses</span>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-mono">{totalCount}</span>
                <span className="text-xs text-slate-500">requests logged</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Academic Session</span>
                <span className="font-semibold text-slate-800">2026–2027</span>
              </div>
            </div>
          </div>

          {/* Card 2: Approved Requests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved Requests</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-600 font-mono">{approvedCount}</span>
                <span className="text-xs text-emerald-700 font-semibold">{clearanceRate}% clearance</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Gate Exits Authorized</span>
                <span className="font-semibold text-slate-800">{approvedCount} of {totalCount}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Pending Approvals */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Approvals</span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-600 font-mono">0{pendingCount}</span>
                <span className="text-xs text-amber-700 font-semibold">in review queue</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Current Stage</span>
                <span className="font-semibold text-slate-800 truncate">Mentor & HOD Review</span>
              </div>
            </div>
          </div>

          {/* Card 4: Rejected Requests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected Requests</span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-rose-600 font-mono">0{rejectedCount}</span>
                <span className="text-xs text-slate-500">all-time total</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                <span>Current Term Violations</span>
                <span className="font-semibold text-emerald-600">0 this term</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Active Application Showcase & 5-Step Approval Stepper */}
      {activeOutpass && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-lg font-bold text-slate-900">#{activeOutpass.id}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase">
                    {activeOutpass.type}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                    Parent Consent Confirmed
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" /> {activeOutpass.destinationAddress.slice(0, 32)}...
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Depart: {new Date(activeOutpass.departureTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Return: {new Date(activeOutpass.expectedReturnTime).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('my-applications', activeOutpass.id)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Track Live Status</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper */}
          <div className="mt-5 p-4 sm:p-5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Institutional Clearance Lifecycle
              </span>
              <span className="text-xs font-semibold text-blue-600">
                Stage {activeOutpass.currentStage} of {activeOutpass.totalStages} • {activeOutpass.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              {activeOutpass.approvalSteps.map((step: any, idx: number) => {
                const isPassed = step.status === 'approved';
                const isCurrent = step.status === 'pending' && idx + 1 === activeOutpass.currentStage;
                return (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-xs flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 ${
                      isPassed 
                        ? 'bg-emerald-600 text-white' 
                        : isCurrent 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">{step.roleName}</span>
                    <span className={`text-[10px] font-semibold mt-0.5 ${
                      isPassed ? 'text-emerald-600' : isCurrent ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                      {isPassed ? 'Approved' : isCurrent ? 'In Review' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Recent Applications & Alerts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        
        {/* Table of Recent Outpass Applications (8 cols) */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Outpass Applications</h3>
                <p className="text-xs text-slate-500">Historical audit ledger with current clearance status</p>
              </div>
              <button
                onClick={() => onNavigate('outpass-history')}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <th className="py-3 px-4">Outpass ID</th>
                    <th className="py-3 px-4">Destination & Reason</th>
                    <th className="py-3 px-4">Departure</th>
                    <th className="py-3 px-4">Return</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {studentOutpasses.slice(0, 4).map(op => (
                    <tr key={op.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        #{op.id}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-semibold text-slate-900 truncate">{op.destinationAddress.split(',')[0]}</div>
                        <div className="text-[11px] text-slate-500 truncate">{op.type}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {new Date(op.departureTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {new Date(op.expectedReturnTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          op.status === 'Approved' || op.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : op.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {op.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => onNavigate('my-applications', op.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold transition cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Showing {Math.min(4, studentOutpasses.length)} of {studentOutpasses.length} applications</span>
            <button
              onClick={() => onNavigate('outpass-history')}
              className="text-blue-600 font-semibold hover:underline"
            >
              See complete archive →
            </button>
          </div>
        </div>

        {/* Notifications & Institutional Alerts (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Campus Alerts & Logs</h3>
              </div>
              <span className="text-[11px] text-slate-400">Live</span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Faculty Approval Issued</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Sivaselvi (AP/CYS) approved Weekend Outpass <span className="font-mono text-blue-600">#OP-2025-0842</span>.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">15 mins ago</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Hostel Curfew Advisory</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Turnstile security locks strictly enforced at 21:00 IST sharp for Kaveri residents.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">2 hours ago</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Digital Gate Pass Generated</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Signed token initialized for Emergency Clinic transit <span className="font-mono text-blue-600">#OP-2025-0791</span>.
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">Yesterday, 14:15 IST</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-800">Warden Helpline</p>
              <p className="text-slate-500 font-mono text-[11px]">+91 044-2257-8900</p>
            </div>
            <a
              href="tel:+9104422578900"
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-blue-600 font-semibold shadow-xs hover:bg-slate-50"
            >
              Call Desk
            </a>
          </div>
        </div>

      </div>

      {/* Operational Quick Actions Hub (4 Bento Launchers) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Quick Operational Launcher</h3>
          <span className="text-xs text-slate-400">Fast Access Modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('apply-outpass')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition">
                <PlusCircle className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">Apply Outpass</h4>
              <p className="text-xs text-slate-500 mt-0.5">Submit new leave or outing form with automated mentor dispatch.</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('my-applications')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition">
                <Clock className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition">Track Status</h4>
              <p className="text-xs text-slate-500 mt-0.5">Live review tracker with HOD and Warden timestamps.</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('gate-passes')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition">
                <QrCode className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">Digital Gate Pass</h4>
              <p className="text-xs text-slate-500 mt-0.5">Turnstile QR token with cryptographic HMAC verification.</p>
            </div>
          </div>

          <div
            onClick={() => onNavigate('outpass-history')}
            className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-300 transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white flex items-center justify-center transition">
                <History className="w-5 h-5" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition" />
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition">Outpass History</h4>
              <p className="text-xs text-slate-500 mt-0.5">Full historical attendance logs for residential compliance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
