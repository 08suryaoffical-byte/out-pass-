import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Shield, Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, UserCheck } from 'lucide-react';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<AuthModalProps> = () => {
  const { login, users } = useApp();

  // Mode: student login vs institutional (faculty, hod, admin)
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [regOrEmail, setRegOrEmail] = useState('21BCE1042');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset fills
  const setQuickStudent = (reg: string) => {
    setActiveTab('student');
    setRegOrEmail(reg);
    setPassword('student123');
    setErrorMsg('');
  };

  const setQuickStaff = (email: string) => {
    setActiveTab('staff');
    setRegOrEmail(email);
    setPassword('staff123');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    setTimeout(() => {
      const ok = login(regOrEmail);
      if (ok) {
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setErrorMsg('Invalid credentials or unregistered account. Please check Roll Number / Official Email.');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Top Security Banner */}
      <header className="w-full bg-[#0F172A] border-b border-slate-800 text-slate-300 py-2.5 px-4 sm:px-8 text-xs flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-slate-200">
            {activeTab === 'student' ? 'Official Student Access Portal' : 'Official Administrative & Faculty Portal'}
          </span>
          <span className="text-slate-500 hidden md:inline">• Academic Year 2026–2027</span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center space-x-1.5 text-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Protocol</span>
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 text-xs">Emergency Security Desk: ext. 4400</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
          
          {/* LEFT BRANDING PANEL */}
          <section className="lg:col-span-5 bg-gradient-to-br from-[#0F172A] via-[#131F37] to-[#1E293B] text-white p-8 sm:p-10 flex flex-col justify-center relative overflow-hidden">
            {/* Ambient pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,0 L100,100 M20,0 L100,80 M0,20 L80,100" stroke="currentColor" strokeWidth="0.75" fill="none" strokeDasharray="3,3" />
                <circle cx="90" cy="10" r="40" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <circle cx="10" cy="90" r="50" stroke="currentColor" strokeWidth="0.5" fill="none" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg border border-amber-300/60 bg-white flex items-center justify-center shrink-0 p-1">
                  <img
                    src="/assets/aistudio/dsu_983323a0.webp"
                    alt="Dhanalakshmi Srinivasan University Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="text-[12px] font-bold uppercase tracking-wider text-amber-300">Dhanalakshmi Srinivasan University</div>
                  <div className="text-xs text-slate-300">Samayapuram, Trichy • Academic & Residential Affairs</div>
                </div>
              </div>

              <div className="mt-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-medium mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  <span>Instant Digital Gate Pass</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">Smart Outpass</h1>
                <p className="text-blue-200/90 text-sm font-medium tracking-wide">Your campus. Your access. Simplified.</p>
              </div>
            </div>
          </section>

          {/* RIGHT FORM PANEL */}
          <section className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white relative">
            <div className="max-w-md w-full mx-auto">
              
              {/* Portal Header / Tab Switcher */}
              <div className="mb-6">
                <div className="flex items-center justify-between pb-3">
                  <div className="inline-flex p-1 bg-slate-100 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('student');
                        setRegOrEmail('21BCE1042');
                        setErrorMsg('');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Student Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('staff');
                        setRegOrEmail('sivaselvi@dsuniversity.ac.in');
                        setErrorMsg('');
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all ${
                        activeTab === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Faculty & Admin Login
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SSO Active
                    </span>
                    <div className="w-8 h-8 rounded-full p-0.5 bg-white border border-amber-300 shadow-xs flex items-center justify-center shrink-0">
                      <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] mt-2 mb-1">
                  {activeTab === 'student' ? 'Student Sign In' : 'Institutional Sign In'}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeTab === 'student'
                    ? 'Access outpasses, check approval timeline, and scan biometric QR tokens.'
                    : 'Unified portal with automatic role detection for Mentors, HODs, and Administration.'}
                </p>
              </div>

              {/* Quick Preset Selector Buttons */}
              <div className="mb-5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Quick Fill Demo Credentials:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTab === 'student' ? (
                    <button
                      type="button"
                      onClick={() => setQuickStudent('21BCE1042')}
                      className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 font-medium transition shadow-xs"
                    >
                      Student (Surya • 21BCE1042)
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setQuickStaff('sivaselvi@dsuniversity.ac.in')}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 font-medium transition shadow-xs"
                      >
                        Faculty (Sivaselvi AP/CYS)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickStaff('ravindra.krishna@dsuniversity.ac.in')}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 font-medium transition shadow-xs"
                      >
                        HOD (Dr. Ravindra Krishna)
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickStaff('shankar@dsuniversity.ac.in')}
                        className="px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 font-medium transition shadow-xs"
                      >
                        Assoc. Dean / Admin (Dr. Shankar)
                      </button>
                    </>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Area */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                    {activeTab === 'student' ? 'Registration / Roll Number' : 'Institutional Email or Staff ID'}
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      type="text"
                      value={regOrEmail}
                      onChange={e => setRegOrEmail(e.target.value)}
                      placeholder={activeTab === 'student' ? 'e.g. 21BCE1042' : 'e.g. sivaselvi@dsuniversity.ac.in'}
                      required
                      className="block w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-200/70 px-1.5 py-0.5 rounded">
                        {activeTab === 'student' ? 'Roll No' : 'Staff Auth'}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <a href="#help" onClick={(e) => { e.preventDefault(); alert('Demo password reset instruction: choose any quick-fill button above to sign in.'); }} className="text-xs font-semibold text-blue-600 hover:underline">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative rounded-xl shadow-sm">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="block w-full px-3.5 pr-10 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-600 select-none">Remember Me on this device</span>
                  </label>
                  <span className="text-[11px] text-slate-400">Campus WiFi 802.1X</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/25 active:scale-[0.99] transition"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : `Sign In to ${activeTab === 'student' ? 'Student' : 'Institutional'} Portal`}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Notice */}
              <div className="mt-6 p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start space-x-2.5 text-xs text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-semibold">Curfew Notice:</span>
                  <span className="text-amber-700 ml-1">
                    Night outpasses require verified Parent OTP authentication 2 hours prior to 19:30 IST.
                  </span>
                </div>
              </div>

            </div>
          </section>

        </div>
      </main>

      {/* Global Footer */}
      <footer className="w-full py-4 px-6 text-center text-xs text-slate-500 border-t border-slate-200/80 bg-white/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-5 h-5 object-contain rounded-full shadow-xs" />
            <span className="font-semibold text-slate-700">Dhanalakshmi Srinivasan University, Samayapuram, Trichy</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="text-slate-500 text-[11px]">© 2026–2027 Smart Outpass System</span>
          </div>
          <div className="flex items-center space-x-5 text-slate-500 text-xs">
            <a href="#privacy" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition">Privacy Policy</a>
            <span className="text-slate-300">•</span>
            <a href="#terms" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition">Terms of Use</a>
            <span className="text-slate-300">•</span>
            <a href="#hostel" onClick={e => e.preventDefault()} className="hover:text-blue-600 transition">Hostel Regulations</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
