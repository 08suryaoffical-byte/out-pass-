import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const StudentProfile: React.FC = () => {
  const { currentUser } = useApp();

  const [isEditContactOpen, setIsEditContactOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Edit contact form state
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765-10420');
  const [guardianPhone, setGuardianPhone] = useState(currentUser?.parentPhone || '+91 98765-43210');
  const [guardianName, setGuardianName] = useState(currentUser?.parentName || 'S. Kumar');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password state
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsEditContactOpen(false);
    }, 1200);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) {
      alert('Passwords do not match');
      return;
    }
    setPassSuccess(true);
    setTimeout(() => {
      setPassSuccess(false);
      setIsPasswordModalOpen(false);
      setCurrPass('');
      setNewPass('');
      setConfirmPass('');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Dossier Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-2xl flex items-center justify-center ring-4 ring-blue-50 border border-slate-200 shadow-sm uppercase tracking-wider">
                {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : 'SU'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{currentUser?.name || 'Surya'}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  Verified Resident
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500 mt-1">
                REG NO: <span className="font-bold text-slate-700">{currentUser?.registerNumber || '21BCE1042'}</span> • {currentUser?.departmentName}
              </p>
              <p className="text-xs text-slate-500">
                {currentUser?.year || '3rd Year'} • {currentUser?.section || 'Sec B'} • {currentUser?.hostelBlock || 'Kaveri Boys Hostel (Block 3)'}
              </p>
            </div>
          </div>

          {/* Quick Actions & University Logo on the right */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditContactOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center gap-1.5 shadow-xs transition"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                <span>Edit Contact</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition"
              >
                <span className="material-symbols-outlined text-base">lock_reset</span>
                <span>Change PIN / Password</span>
              </button>
            </div>

            {/* University Logo on the right */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-white border-2 border-amber-300 shadow-lg shadow-amber-500/10 shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/dsu_983323a0.webp"
                alt="Dhanalakshmi Srinivasan University Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* 4 Overview Metric Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Applications</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">18</div>
            <span className="text-[11px] text-slate-500">Academic Year 2026-2027</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Clearance Rate</span>
            <div className="text-2xl font-bold text-emerald-600 mt-1">77.8%</div>
            <span className="text-[11px] text-slate-500">14 Approved Outpasses</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Curfew Adherence</span>
            <div className="text-2xl font-bold text-slate-900 mt-1">100%</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Zero Infractions Logged</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Days Away From Campus</span>
            <div className="text-2xl font-bold text-blue-600 mt-1">26.5</div>
            <span className="text-[11px] text-slate-500">Cumulative Egress Total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Academic & Faculty Info */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600 text-lg">school</span>
            Academic Profile & Faculty Mentor
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Institutional Email</span>
              <p className="font-semibold text-slate-800 mt-0.5">{currentUser?.email || '21bce1042@dsuniversity.ac.in'}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Mobile Phone</span>
              <p className="font-semibold text-slate-800 mt-0.5">{phone}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Cumulative GPA (CGPA)</span>
              <p className="font-bold text-emerald-700 mt-0.5">8.92 / 10.0 (First Class Distinction)</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Biometric Enrollment</span>
              <p className="font-semibold text-emerald-700 mt-0.5">Dual-Fingerprint Active</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-2">Assigned Faculty Mentor</span>
            <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
                  SS
                </div>
                <div>
                  <div className="font-bold text-slate-900">{currentUser?.mentorName || 'Sivaselvi (AP/CYS)'}</div>
                  <div className="text-[11px] text-slate-500">Assistant Professor (AP/CYS) • Dept. of Cyber Security (CYS)</div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <div>Cabin #204, Cyber Security Block</div>
                <div className="text-blue-600 font-medium">sivaselvi@dsuniversity.ac.in</div>
              </div>
            </div>
          </div>
        </div>

        {/* Residential & Hostel Details */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
            <span className="material-symbols-outlined text-blue-600 text-lg">hotel</span>
            Hostel Quarters & Parental Consent
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Hostel Block</span>
              <p className="font-semibold text-slate-800 mt-0.5">{currentUser?.hostelBlock || 'Kaveri Boys Hostel (Block 3)'}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Allocated Room</span>
              <p className="font-semibold text-slate-800 mt-0.5">{currentUser?.room || 'Room 412 • West Wing'}</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Parent / Guardian Name</span>
              <p className="font-semibold text-slate-800 mt-0.5">{guardianName} (Father)</p>
            </div>
            <div>
              <span className="text-slate-400 uppercase font-semibold text-[10px] block">Guardian SMS OTP Line</span>
              <p className="font-semibold text-emerald-700 mt-0.5">{guardianPhone} ✓</p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-slate-400 uppercase font-semibold text-[10px] block mb-2">Gate Turnstile Authorizations</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Hostel Turnstile Gate 01</span>
                <span className="text-[11px] text-emerald-600 font-medium">24/7 RFID + Face Recognition</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block">Campus Main Gate 04</span>
                <span className="text-[11px] text-blue-600 font-medium">Active with Approved QR Token</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Telemetry & System Device Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Institutional Security & Biometrics
            </div>
            <h4 className="text-lg font-bold mt-1">Biometric Tokenization & Active Sessions</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Cryptographic keys for outpass turnstile QR codes are generated dynamically with HMAC-SHA256 and authenticated with Central Campus Security servers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono space-y-1">
            <div className="text-slate-400">BIOMETRIC HASH:</div>
            <div className="font-bold text-emerald-400">BIO-SHA256-4b8a1c99f82</div>
            <div className="text-slate-400 text-[10px] mt-1">LAST SCAN: 18 FEB 2025 • 19:28 IST (GATE 04)</div>
          </div>
        </div>
      </div>

      {/* Edit Contact Modal */}
      {isEditContactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">contact_phone</span>
                Update Contact & Guardian Details
              </h3>
              <button
                onClick={() => setIsEditContactOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student Mobile Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Guardian / Parent Name</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Guardian Emergency & OTP Mobile</label>
                <input
                  type="text"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  All outpass OTP clearance links are sent to this number.
                </span>
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                  Contact details updated successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditContactOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">lock_reset</span>
                Change Residential Access PIN
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Current Password</label>
                <input
                  type="password"
                  value={currPass}
                  onChange={(e) => setCurrPass(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Password / PIN</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>

              {passSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                  Password updated successfully!
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg font-semibold hover:bg-slate-50 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs"
                >
                  Update Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
