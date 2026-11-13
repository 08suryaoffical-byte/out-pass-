import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { OutpassType } from '../types';

interface ApplyOutpassProps {
  onSuccess?: (outpassId: string) => void;
  onCancel?: () => void;
}

export const ApplyOutpass: React.FC<ApplyOutpassProps> = ({ onSuccess, onCancel }) => {
  const { currentUser, applyOutpass } = useApp();

  const [category, setCategory] = useState<OutpassType>('Home Visit');
  const [destination, setDestination] = useState('142 Gandhi Puram Road, West RS Puram, Coimbatore - 641002');
  const [purpose, setPurpose] = useState('Attending sister\'s wedding ceremony and scheduled family gathering.');
  const [transitMode, setTransitMode] = useState('Train / Intercity Express');
  
  // Dates
  const [departureDate, setDepartureDate] = useState('2025-02-22');
  const [departureTime, setDepartureTime] = useState('17:00');
  const [returnDate, setReturnDate] = useState('2025-02-24');
  const [returnTime, setReturnTime] = useState('20:00');

  // Documents
  const [documents, setDocuments] = useState<{ name: string; size: string; type: 'pdf' | 'image' }[]>([
    { name: 'Parent_Consent_Letter_Signed.pdf', size: '1.8 MB', type: 'pdf' }
  ]);
  const [dragOver, setDragOver] = useState(false);

  // Declarations
  const [dec1, setDec1] = useState(true);
  const [dec2, setDec2] = useState(true);
  const [dec3, setDec3] = useState(true);

  // Success modal state
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Compute duration
  const depDateTime = new Date(`${departureDate}T${departureTime}`);
  const retDateTime = new Date(`${returnDate}T${returnTime}`);
  const diffHours = Math.max(1, Math.round((retDateTime.getTime() - depDateTime.getTime()) / (1000 * 60 * 60)));
  const days = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  const isExtended = diffHours > 48;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!dec1 || !dec2 || !dec3) {
      alert('Please accept all institutional declarations before submitting.');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newId = applyOutpass({
        type: category,
        destinationAddress: destination,
        purpose,
        departureTime: `${departureDate}T${departureTime}`,
        expectedReturnTime: `${returnDate}T${returnTime}`,
        documents,
      });
      setSubmitting(false);
      setSubmittedId(newId);
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDocuments(prev => [
        ...prev,
        {
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type: file.name.endsWith('.pdf') ? 'pdf' : 'image',
        }
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 uppercase tracking-wider">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-4 h-4 object-contain rounded-full" />
            <span>Dhanalakshmi Srinivasan University, Samayapuram, Trichy • Egress Protocol</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Apply for Outpass</h1>
          <p className="text-sm text-slate-500">
            Submit your residential leave authorization request with verified guardian consent.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            Biometric Enrolled
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="material-symbols-outlined text-[15px]">shield</span>
            Hostel Block 3 • Room 412
          </span>
          <div className="w-10 h-10 rounded-full p-0.5 bg-white border border-amber-300 shadow-xs flex items-center justify-center shrink-0">
            <img src="/assets/aistudio/dsu_983323a0.webp" alt="DSU Logo" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Outpass Category Picker */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">category</span>
                Select Outpass Category <span className="text-rose-500">*</span>
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Routing path and required approval authorities depend on the selected category and duration.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    type: 'Home Visit' as OutpassType,
                    label: 'Weekend Home Visit',
                    badge: '>48h Multi-Tier',
                    desc: 'Visit to permanent residential address with verified parental consent OTP.',
                    icon: 'home',
                  },
                  {
                    type: 'Local Day Out' as OutpassType,
                    label: 'Local Day Outing',
                    badge: 'Curfew 21:00',
                    desc: 'Short trip within municipal limits. Return before hostel turnstile closure.',
                    icon: 'directions_walk',
                  },
                  {
                    type: 'Emergency Medical' as OutpassType,
                    label: 'Emergency Medical',
                    badge: 'Priority Dispatch',
                    desc: 'Urgent hospital, clinic, or specialized diagnostic center visit with proof.',
                    icon: 'local_hospital',
                  },
                  {
                    type: 'Official Duty' as OutpassType,
                    label: 'Official Duty / Symposium',
                    badge: 'Faculty Endorsed',
                    desc: 'Academic competitions, hackathons, seminars, or college representation.',
                    icon: 'assignment_turned_in',
                  },
                ].map((item) => {
                  const isSelected = category === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setCategory(item.type)}
                      className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isSelected ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5">
                          {item.label}
                          {isSelected && <span className="material-symbols-outlined text-blue-600 text-sm">check_circle</span>}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Travel Transit & Itinerary */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">route</span>
                Outpass Transit Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>Destination & Residence Address <span className="text-rose-500">*</span></span>
                    <span className="text-[11px] font-normal text-slate-400">Street-level address required</span>
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">location_on</span>
                    <textarea
                      rows={2}
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      placeholder="Enter detailed destination address..."
                      className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Reason for Leaving / Purpose <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                    placeholder="E.g., Family event, medical consultation, symposium..."
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Mode of Transit</label>
                  <select
                    value={transitMode}
                    onChange={(e) => setTransitMode(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                  >
                    <option value="Train / Intercity Express">Train / Intercity Express</option>
                    <option value="State Transport Bus">State Transport Bus</option>
                    <option value="Flight / Aviation">Flight / Aviation</option>
                    <option value="Personal Car / Two-Wheeler">Personal Car / Two-Wheeler</option>
                    <option value="Cab / Rideshare (Ola/Uber)">Cab / Rideshare (Ola/Uber)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Parental Verification Status</label>
                  <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                      OTP Verified (+91 98765-XXXXX)
                    </span>
                    <span className="text-[10px] uppercase font-bold text-emerald-600">Active</span>
                  </div>
                </div>
              </div>

              {/* Date & Time Grid */}
              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Departure */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-sm">flight_takeoff</span>
                      Departure Window
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Departure Date</label>
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Time</label>
                        <input
                          type="time"
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Return */}
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-sm">flight_land</span>
                      Expected Return Curfew
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Return Date</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Time</label>
                        <input
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded font-medium focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Duration Banner */}
                <div className={`mt-3 p-3 rounded-lg border flex items-center justify-between text-xs ${
                  isExtended
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-blue-50/80 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      {isExtended ? 'warning' : 'schedule'}
                    </span>
                    <div>
                      <span className="font-semibold">Calculated Egress Duration: </span>
                      <span>{days > 0 ? `${days} Days, ${remHours} Hours (${diffHours}h)` : `${diffHours} Hours`}</span>
                    </div>
                  </div>
                  {isExtended ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Tier 2 & 3 Review Required (&gt;48h)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-900">
                      Tier 1 Fast Track (&lt;48h)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Supporting Proof Documents */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-lg">attach_file</span>
                    Supporting Proof Documents
                  </h2>
                  <p className="text-xs text-slate-500">
                    Upload signed parental consent, medical prescription, or symposium invitation letter.
                  </p>
                </div>
                <span className="text-xs text-slate-400">PDF, PNG, JPG up to 10MB</span>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    const f = e.dataTransfer.files[0];
                    setDocuments(prev => [...prev, { name: f.name, size: `${(f.size / (1024*1024)).toFixed(1)} MB`, type: f.name.endsWith('.pdf') ? 'pdf' : 'image' }]);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">cloud_upload</span>
                <p className="text-xs font-semibold text-slate-700">
                  Drag and drop files here, or{' '}
                  <label className="text-blue-600 hover:underline cursor-pointer">
                    browse files
                    <input type="file" onChange={handleFileUpload} className="hidden" />
                  </label>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Official institution-recognized documents only</p>
              </div>

              {/* Document List */}
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="p-2 rounded bg-rose-100 text-rose-700">
                          <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">{doc.name}</p>
                          <p className="text-slate-400 text-[11px]">{doc.size} • Verified Attachment</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDocuments(docs => docs.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-rose-600"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Declarations & Undertakings */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-lg">policy</span>
                Declarations & Residential Undertakings
              </h2>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dec1}
                    onChange={(e) => setDec1(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I confirm that all destination details, travel dates, and emergency contact records provided in this form are genuine and completely verified.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dec2}
                    onChange={(e) => setDec2(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I agree to strictly comply with the Residential Hostel Curfew Regulations (Code 402-B) and report through the biometric gate turnstiles on or prior to the declared return time.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dec3}
                    onChange={(e) => setDec3(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    I acknowledge that an automated real-time SMS notification with Parent OTP verification link will be immediately dispatched upon submission to mentor desk.
                  </span>
                </label>
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Discard Draft
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm hover:shadow transition disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting Application...
                  </>
                ) : (
                  <>
                    <span>Submit Outpass Request</span>
                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Routing Pipeline & Guidelines */}
        <div className="lg:col-span-4 space-y-6">
          {/* Clearance Pathway */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-base">timeline</span>
              Institutional Clearance Pathway
            </h3>
            
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                <p className="text-xs font-bold text-slate-900">Stage 01 • Application Submission</p>
                <p className="text-[11px] text-slate-500">Self-lodged via student portal with Parent OTP.</p>
              </div>

              <div className="relative">
                <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center text-[10px] font-bold">2</span>
                <p className="text-xs font-bold text-slate-900">Stage 02 • Faculty Mentor Review</p>
                <p className="text-[11px] text-slate-500">Sivaselvi (AP/CYS, Dept. of Cyber Security) checks attendance & labs.</p>
              </div>

              {isExtended && (
                <>
                  <div className="relative">
                    <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-amber-100 text-amber-700 border border-amber-300 flex items-center justify-center text-[10px] font-bold">3</span>
                    <p className="text-xs font-bold text-slate-900">Stage 03 • HOD Endorsement (&gt;48h)</p>
                    <p className="text-[11px] text-slate-500">Dr. Ravindra Krishna reviews extended leave justification.</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center text-[10px] font-bold">4</span>
                    <p className="text-xs font-bold text-slate-900">Stage 04 • Associate Dean Sanction</p>
                    <p className="text-[11px] text-slate-500">Dr. Shankar grants final institutional approval.</p>
                  </div>
                </>
              )}

              <div className="relative">
                <span className="absolute -left-6 top-0 w-5 h-5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center text-[10px] font-bold">{isExtended ? 5 : 3}</span>
                <p className="text-xs font-bold text-slate-900">Final • Turnstile Gate QR Token</p>
                <p className="text-[11px] text-slate-500">HMAC-SHA256 encrypted pass activated on gate barrier.</p>
              </div>
            </div>
          </div>

          {/* Curfew Regulations */}
          <div className="bg-amber-50/70 rounded-xl p-5 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-base">timer</span>
              Curfew & Return Advisory
            </div>
            <ul className="text-xs text-amber-800 space-y-2 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>All local day passes require entry scan at <strong>Main Gate 01 or 04</strong> prior to <strong>21:00 IST</strong>.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Unaccounted delays beyond 30 minutes generate automated escalation alerts to Head of Department & Hostel Warden.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-amber-600 font-bold">•</span>
                <span>Always ensure mobile battery is sufficient to display the digital dynamic QR pass at biometric checkpoints.</span>
              </li>
            </ul>
          </div>

          {/* Warden Emergency Contact */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Hostel Desk Emergency</div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <p className="text-sm font-semibold">Kaveri Boys Hostel (Block 3)</p>
            <p className="text-xs text-slate-400 mt-1">Chief Resident Warden Desk • Room 102</p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Security Hotline:</span>
              <a href="tel:+9104422578900" className="text-blue-400 hover:text-blue-300 font-mono font-medium">
                +91 044-2257-8900
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Receipt Modal */}
      {submittedId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
              <span className="material-symbols-outlined text-3xl">check</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Outpass Request Submitted!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your application has been registered with ID <span className="font-mono font-bold text-blue-600">#{submittedId}</span>
            </p>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Routing Path:</span>
                <span className="font-semibold text-slate-800">
                  {isExtended ? 'Mentor → HOD → Dean' : 'Faculty Mentor Direct'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Parent OTP SMS:</span>
                <span className="font-semibold text-emerald-600">Dispatched & Verified</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Assigned Reviewer:</span>
                <span className="font-semibold text-blue-600">Sivaselvi (AP/CYS)</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSuccess) onSuccess(submittedId);
                }}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow transition"
              >
                Track Live Application Status →
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedId(null);
                  if (onCancel) onCancel();
                }}
                className="w-full py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
