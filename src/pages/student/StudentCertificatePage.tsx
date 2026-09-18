import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  AlertCircle,
  RotateCcw,
  Copy,
  Check,
  BookOpen,
  FlaskConical,
  Building2
} from 'lucide-react';
import api from '../../services/api';
import { Certificate } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { downloadCertificatePdfFile } from '../../utils/printCertificate';

export const StudentCertificatePage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/certificates/my');
      setCertificates(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to retrieve certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleReset = async () => {
    try {
      setResetting(true);
      setError(null);
      setSuccessMsg(null);
      try {
        const resetRes = await api.post('/certificates/my/reset');
        if (resetRes.data?.certificate) {
          setCertificates([resetRes.data.certificate]);
          setSuccessMsg('Certificate view & clearance nodes reset to fresh institutional state.');
          setTimeout(() => setSuccessMsg(null), 4000);
          return;
        }
      } catch {
        // Fallback to fetch
      }
      const res = await api.get('/certificates/my');
      setCertificates(res.data);
      setSuccessMsg('Certificate view and clearance status refreshed successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setError('Unable to refresh certificate data. Please check connection.');
    } finally {
      setResetting(false);
    }
  };

  const handleDownloadPdf = async (certId: number, certNumber?: string) => {
    try {
      setDownloading(true);
      setError(null);
      await downloadCertificatePdfFile(certId, certNumber);
      setSuccessMsg('PDF Certificate downloaded successfully.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setError('Unable to download PDF. Please try again or refresh.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = (code: string) => {
    const url = `${window.location.origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        Loading certificate records...
      </div>
    );
  }

  const activeCert = certificates.find((c) => c.is_valid) || certificates[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
            Digital No Due Certificate & Clearance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            College of Engineering (Autonomous) — Digital Verified Clearance Certificate
          </p>
        </div>

        {activeCert && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Reset / Refresh Button */}
            <button
              id="btn-reset-cert-view"
              onClick={handleReset}
              disabled={resetting}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
              title="Reset and refresh certificate data"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
              Reset View
            </button>

            {/* Download Certificate Button */}
            <button
              id="btn-download-pdf"
              onClick={() => handleDownloadPdf(activeCert.id, activeCert.certificate_number)}
              disabled={downloading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download Official Certificate PDF"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Downloading...' : 'Download PDF'}
            </button>
          </div>
        )}
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between gap-2 shadow-2xs print:hidden animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-emerald-600 hover:text-emerald-900 text-xs font-bold px-1.5"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-600 hover:text-rose-900 text-xs font-bold px-1.5"
          >
            &times;
          </button>
        </div>
      )}

      {!activeCert ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-800 space-y-4 transition-colors">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              No Due Certificate Pending Clearance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              Your official certificate will be issued once staff clearances, HOD endorsement, and formal Admin approval are completed.
            </p>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={async () => {
                try {
                  setError(null);
                  await api.post('/certificates/my/claim');
                  await fetchCerts();
                } catch (err: any) {
                  setError(err.response?.data?.detail || 'Clearance or Admin approval is still pending.');
                }
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs inline-flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" /> Check Clearance & Admin Approval Status
            </button>
            <Link
              to="/student/request"
              className="px-5 py-2.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800/60 rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              View Clearance Nodes &rarr;
            </Link>
          </div>
        </div>
      ) : (
        /* Digital Verifiable Certificate View */
        <div
          id="certificate-print-sheet"
          className="w-full max-w-[840px] mx-auto bg-white rounded-xl p-5 sm:p-7 border-[3px] border-slate-900 shadow-2xl print:shadow-none print:border-[3px] print:border-slate-900 relative overflow-hidden text-slate-900"
        >
          {/* Inner Gold Framing Border */}
          <div className="absolute inset-1.5 sm:inset-2 border border-amber-600/40 rounded-lg pointer-events-none"></div>

          {/* Decorative Corner Embellishments */}
          <div className="absolute top-2.5 left-2.5 text-amber-700/60 font-serif text-xs select-none pointer-events-none">&#10022;</div>
          <div className="absolute top-2.5 right-2.5 text-amber-700/60 font-serif text-xs select-none pointer-events-none">&#10022;</div>
          <div className="absolute bottom-2.5 left-2.5 text-amber-700/60 font-serif text-xs select-none pointer-events-none">&#10022;</div>
          <div className="absolute bottom-2.5 right-2.5 text-amber-700/60 font-serif text-xs select-none pointer-events-none">&#10022;</div>

          {/* Subtle Watermark BG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <GraduationCap className="w-96 h-96 text-slate-900" />
          </div>

          {/* Certificate Inner Content */}
          <div className="relative z-10 text-center space-y-2 flex flex-col justify-between h-full">
            {/* 1. Header / College Crest */}
            <div className="border-b border-slate-300 pb-2">
              <div className="flex items-center justify-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center shadow-xs border border-amber-500/40">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h2 className="font-serif font-black text-lg sm:text-xl text-slate-950 uppercase tracking-tight leading-tight">
                    Apex College of Engineering
                  </h2>
                  <p className="text-[8px] sm:text-[9px] font-bold text-amber-900 tracking-wider uppercase">
                    (Autonomous Institution &bull; Affiliated to Anna University &bull; Approved by AICTE, New Delhi)
                  </p>
                </div>
              </div>
              <p className="text-[8px] sm:text-[8.5px] font-semibold text-slate-600 tracking-wide uppercase">
                Accredited with 'A+' Grade by NAAC &bull; NBA Tier-1 Accredited &bull; ISO 9001:2015 Certified
              </p>
              <p className="text-[8px] font-bold text-slate-500 tracking-widest uppercase mt-0.5">
                Office of Academic Affairs &bull; Controller of Examinations &bull; Institutional Clearance Cell
              </p>
            </div>

            {/* 2. Certificate Title & Verification Metadata Ribbon */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-[9px] font-bold uppercase tracking-widest">
                <span>Official Institutional Document</span>
              </div>
              <h3 className="font-serif font-black text-sm sm:text-base text-slate-950 uppercase tracking-tight mt-1">
                Institutional No Due Clearance Certificate
              </h3>
              <p className="text-[8.5px] italic text-slate-500 font-serif">
                (Issued for Graduation, CIAT & End Semester Examination Clearance)
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-1 px-3 bg-slate-50/90 rounded-md border border-slate-200 text-[9px] font-mono text-slate-700 max-w-2xl mx-auto mt-1">
                <div>
                  <span className="text-slate-400">Cert No: </span>
                  <span className="font-bold text-slate-950">{activeCert.certificate_number}</span>
                </div>
                <div className="h-2.5 w-px bg-slate-300"></div>
                <div>
                  <span className="text-slate-400">Security Code: </span>
                  <span className="font-bold text-indigo-800">{activeCert.verification_code}</span>
                </div>
                <div className="h-2.5 w-px bg-slate-300"></div>
                <div>
                  <span className="text-slate-400">Academic Year: </span>
                  <span className="font-bold text-slate-900">{activeCert.academic_year || '2025-2026'} (Sem {activeCert.semester || 7})</span>
                </div>
                <div className="h-2.5 w-px bg-slate-300"></div>
                <div>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300 text-[8.5px]">
                    <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ALL DUES CLEARED
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Candidate Profile Details Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/70 p-2 sm:p-2.5 rounded-lg border border-slate-200 text-left text-xs">
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Student Name</span>
                <span className="font-bold text-slate-950 text-[11px] truncate block">{(activeCert.student_name || 'STUDENT').toUpperCase()}</span>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Register Number</span>
                <span className="font-mono font-bold text-indigo-950 text-[11px] truncate block">{activeCert.register_number || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Degree & Branch</span>
                <span className="font-bold text-slate-800 text-[10.5px] truncate block">{activeCert.course_name || 'B.E. Computer Science'}</span>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Department</span>
                <span className="font-bold text-slate-800 text-[10.5px] truncate block">{activeCert.department_name || 'Computer Science & Engineering'}</span>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Academic Year & Semester</span>
                <span className="font-bold text-slate-800 text-[10.5px] truncate block">Year {activeCert.year || Math.ceil((activeCert.semester || 7) / 2)} / Semester {activeCert.semester || 7} ({activeCert.academic_year || '2025-2026'})</span>
              </div>
              <div>
                <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Examination / Clearance Scope</span>
                <span className="font-bold text-slate-800 text-[10.5px] truncate block">{activeCert.exam_type || 'CIAT & End Semester Examinations'}</span>
              </div>
            </div>

            {/* 4. Academic Clearance: Part I - Theory Courses Table */}
            {activeCert.subjects && activeCert.subjects.length > 0 && (
              <div className="text-left">
                <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100/90 border border-slate-300 rounded-t-md">
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-900" />
                    <span className="font-serif font-bold text-[9.5px] text-slate-950 uppercase tracking-wide">
                      Part I: Academic Clearance &bull; Theory Courses ({activeCert.subjects.length} Subjects)
                    </span>
                  </div>
                  <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                    {activeCert.subjects.length} / {activeCert.subjects.length} Cleared
                  </span>
                </div>
                <div className="border border-t-0 border-slate-300 rounded-b-md overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[8.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-0.5 w-14">Slot</th>
                        <th className="px-2 py-0.5">Course Code & Title</th>
                        <th className="px-2 py-0.5">Faculty In-Charge</th>
                        <th className="px-2 py-0.5 text-center w-24">Clearance</th>
                        <th className="px-2 py-0.5 text-right w-20">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-[9px]">
                      {activeCert.subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-2 py-0.5 font-mono text-[8px] font-bold text-slate-500">
                            <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{sub.slot || `SUB ${idx + 1}`}</span>
                          </td>
                          <td className="px-2 py-0.5">
                            <span className="font-semibold text-slate-950">{sub.name}</span>
                            {sub.code && (
                              <span className="ml-1.5 font-mono text-[8px] font-bold text-indigo-900 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                                {sub.code}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-0.5 text-slate-600 font-medium">
                            {sub.faculty_name || 'Faculty In-Charge'}
                          </td>
                          <td className="px-2 py-0.5 text-center">
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> No Dues
                            </span>
                          </td>
                          <td className="px-2 py-0.5 text-right font-mono text-[8px] text-slate-500">
                            {sub.signature_date || new Date(activeCert.issued_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. Academic Clearance: Part II - Practical Laboratories Table */}
            {activeCert.labs && activeCert.labs.length > 0 && (
              <div className="text-left">
                <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100/90 border border-slate-300 rounded-t-md">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-800" />
                    <span className="font-serif font-bold text-[9.5px] text-slate-950 uppercase tracking-wide">
                      Part II: Practical Laboratories & Experiments ({activeCert.labs.length} Courses)
                    </span>
                  </div>
                  <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                    {activeCert.labs.length} / {activeCert.labs.length} Cleared
                  </span>
                </div>
                <div className="border border-t-0 border-slate-300 rounded-b-md overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[8.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-0.5 w-14">Slot</th>
                        <th className="px-2 py-0.5">Laboratory Course & Code</th>
                        <th className="px-2 py-0.5">Lab In-Charge</th>
                        <th className="px-2 py-0.5 text-center w-24">Clearance</th>
                        <th className="px-2 py-0.5 text-right w-20">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-[9px]">
                      {activeCert.labs.map((lab, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-2 py-0.5 font-mono text-[8px] font-bold text-slate-500">
                            <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{lab.slot || `LAB ${idx + 1}`}</span>
                          </td>
                          <td className="px-2 py-0.5">
                            <span className="font-semibold text-slate-950">{lab.name}</span>
                            {lab.code && (
                              <span className="ml-1.5 font-mono text-[8px] font-bold text-indigo-900 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                                {lab.code}
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-0.5 text-slate-600 font-medium">
                            {lab.faculty_name || 'Lab In-Charge'}
                          </td>
                          <td className="px-2 py-0.5 text-center">
                            <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> No Dues
                            </span>
                          </td>
                          <td className="px-2 py-0.5 text-right font-mono text-[8px] text-slate-500">
                            {lab.signature_date || new Date(activeCert.issued_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. Institutional Clearance: Part III - Common Nodes Table */}
            {activeCert.common_nodes && activeCert.common_nodes.length > 0 && (
              <div className="text-left">
                <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100/90 border border-slate-300 rounded-t-md">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-amber-800" />
                    <span className="font-serif font-bold text-[9.5px] text-slate-950 uppercase tracking-wide">
                      Part III: Institutional Central Clearance Nodes ({activeCert.common_nodes.length} Facilities)
                    </span>
                  </div>
                  <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                    {activeCert.common_nodes.length} / {activeCert.common_nodes.length} Cleared
                  </span>
                </div>
                <div className="border border-t-0 border-slate-300 rounded-b-md overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-[8.5px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-2 py-0.5 w-14">Slot</th>
                        <th className="px-2 py-0.5">Department / Central Facility</th>
                        <th className="px-2 py-0.5">Officer In-Charge</th>
                        <th className="px-2 py-0.5 text-center w-24">Clearance</th>
                        <th className="px-2 py-0.5 text-right w-20">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-[9px]">
                      {activeCert.common_nodes.map((node, idx) => {
                        const isExempt = node.dues_status?.toLowerCase().includes('exempted');
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="px-2 py-0.5 font-mono text-[8px] font-bold text-slate-500">
                              <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{node.slot || `COM ${idx + 1}`}</span>
                            </td>
                            <td className="px-2 py-0.5">
                              <span className="font-semibold text-slate-950">{node.name}</span>
                              {node.code && (
                                <span className="ml-1.5 font-mono text-[8px] font-bold text-indigo-900 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                                  {node.code}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-0.5 text-slate-600 font-medium">
                              {node.faculty_name || 'Officer In-Charge'}
                            </td>
                            <td className="px-2 py-0.5 text-center">
                              {isExempt ? (
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-sky-800 bg-sky-50 border border-sky-200 px-1.5 py-0.2 rounded">
                                  Exempted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[8px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> No Dues
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-0.5 text-right font-mono text-[8px] text-slate-500">
                              {node.signature_date || new Date(activeCert.issued_at).toLocaleDateString('en-GB')}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. Formal Attestation Declaration Statement */}
            <div className="p-1.5 bg-slate-50 border border-slate-300 rounded-md text-[9px] text-slate-800 font-serif text-center leading-normal">
              <strong>OFFICIAL ATTESTATION:</strong> This is to certify that all academic departments, specialized laboratories, central library, physical education cell, hostels, and finance accounts have been audited. There are <strong>NO OUTSTANDING LIABILITIES, FEES, OR DUES</strong> against this student.
            </div>

            {/* 7. Footer: QR Code, Autonomous Seal & Signatories */}
            <div className="pt-2 border-t-2 border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* QR Verification */}
              <div className="flex items-center gap-2 text-left">
                <div className="p-1 bg-white rounded border border-slate-300 shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                      `${window.location.origin}/verify/${activeCert.verification_code}`
                    )}`}
                    alt="Certificate QR Verification"
                    className="w-13 h-13"
                  />
                </div>
                <div>
                  <p className="text-[9.5px] font-bold text-slate-950 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> Tamper-Proof QR
                  </p>
                  <p className="text-[8px] text-slate-500 max-w-[130px] leading-tight">
                    Scan to verify authentic certificate on institutional registry
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Link
                      to={`/verify/${activeCert.verification_code}`}
                      target="_blank"
                      className="text-[8px] text-indigo-700 hover:text-indigo-900 font-bold inline-flex items-center gap-0.5"
                    >
                      Verify <ExternalLink className="w-2 h-2" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(activeCert.verification_code)}
                      className="text-[8px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-0.5 cursor-pointer"
                      title="Copy public verification link"
                    >
                      {copied ? <Check className="w-2 h-2 text-emerald-600" /> : <Copy className="w-2 h-2" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Official Seal Emblem */}
              <div className="border-2 border-amber-600/70 bg-amber-50/60 rounded-full w-18 h-18 p-1 flex flex-col items-center justify-center text-center text-amber-950 shadow-2xs">
                <span className="text-[6.5px] font-bold uppercase tracking-wider text-amber-800">Apex College</span>
                <span className="text-[7.5px] font-serif font-black uppercase text-slate-900">[ SEAL ]</span>
                <span className="text-[6.5px] font-bold text-emerald-800 uppercase">AUDITED</span>
              </div>

              {/* Authorized Signatories */}
              <div className="flex items-center gap-3 sm:gap-5 text-center text-xs">
                <div>
                  <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                    Faculty Advisor
                  </div>
                  <div className="w-18 sm:w-20 border-t border-slate-400 mt-0.5"></div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">Faculty Advisor</p>
                </div>

                <div>
                  <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                    Dr. K. Manickam
                  </div>
                  <div className="w-18 sm:w-20 border-t border-slate-400 mt-0.5"></div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">HOD</p>
                </div>

                <div>
                  <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                    Dean (Academics)
                  </div>
                  <div className="w-18 sm:w-20 border-t border-slate-400 mt-0.5"></div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">Dean</p>
                </div>

                <div>
                  <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                    Dr. T. Senthilvel
                  </div>
                  <div className="w-18 sm:w-20 border-t border-slate-400 mt-0.5"></div>
                  <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">Principal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCertificatePage;

