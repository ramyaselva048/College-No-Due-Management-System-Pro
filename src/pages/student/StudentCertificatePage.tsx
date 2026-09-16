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
import {
  downloadCertificatePdfFile
} from '../../utils/printCertificate';

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
      setError('Unable to generate PDF directly. Please use the Print button to Save as PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = (cert: Certificate) => {
    // Open dedicated full-page print sheet with instant auto-print
    const printUrl = `/certificate/print/${cert.id}?autoprint=true`;
    window.open(printUrl, '_blank', 'noopener,noreferrer');
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors inline-flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              title="Download Official Certificate PDF"
            >
              <Download className="w-4 h-4" />
              {downloading ? 'Generating Certificate...' : 'Download Certificate'}
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
          className="printable-certificate bg-white rounded-3xl p-8 sm:p-12 border-2 border-indigo-900/20 shadow-xl print:shadow-none print:border-none relative overflow-hidden text-slate-900"
        >
          {/* Subtle Watermark BG */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none">
            <GraduationCap className="w-96 h-96 text-indigo-900" />
          </div>

          {/* Certificate Inner Content */}
          <div className="relative z-10 text-center space-y-6">
            {/* Header / Crest */}
            <div className="border-b-2 border-slate-900/10 pb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-indigo-950 uppercase tracking-tight">
                College of Engineering
              </h1>
              <p className="text-xs font-bold text-slate-600 tracking-wider uppercase mt-1">
                Autonomous Institution • Approved by AICTE & Affiliated to Anna University • NAAC 'A+'
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Office of Academic Affairs & Institutional Clearances (CIAT - I / II / End Sem)
              </p>
            </div>

            {/* Title */}
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-900 font-display font-bold text-xs uppercase tracking-widest">
                Official Institutional Clearance
              </span>
              <h2 className="font-display font-black text-xl sm:text-2xl text-slate-900 uppercase tracking-tight mt-3">
                No Due Certificate
              </h2>
            </div>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 py-2 px-4 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 max-w-xl mx-auto">
              <div>
                <span className="text-slate-400">Cert No: </span>
                <span className="font-bold text-slate-900">{activeCert.certificate_number}</span>
              </div>
              <div className="h-3 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">Verification: </span>
                <span className="font-bold text-indigo-700">{activeCert.verification_code}</span>
              </div>
            </div>

            {/* Body Certification Statement */}
            <div className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 text-justify pt-2">
              <p>
                This is to officially certify that <span className="font-bold text-slate-900">{activeCert.student_name}</span>, holding Registration Number <span className="font-mono font-bold text-indigo-900 bg-slate-100 px-1.5 py-0.5 rounded">{activeCert.register_number}</span>, enrolled in the academic program <span className="font-bold text-slate-900">{activeCert.course_name}</span> within the Department of <span className="font-bold text-slate-900">{activeCert.department_name}</span> {activeCert.semester ? `(Semester ${activeCert.semester}, Year ${activeCert.year || Math.ceil(activeCert.semester / 2)})` : ''}, has successfully completed all institutional clearance protocols.
              </p>
            </div>

            {/* 1. Academic Clearance: Theory Courses */}
            {activeCert.subjects && activeCert.subjects.length > 0 && (
              <div className="text-left space-y-2 pt-2">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span className="font-display font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Academic Clearance: Theory Courses
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {activeCert.subjects.length} / {activeCert.subjects.length} Cleared
                  </span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 w-20">Slot</th>
                        <th className="px-3 py-2">Theory Course & Code</th>
                        <th className="px-3 py-2">Faculty In-Charge</th>
                        <th className="px-3 py-2 text-center w-28">Clearance</th>
                        <th className="px-3 py-2 text-right w-24">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeCert.subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2 font-mono text-[10px] text-slate-500 font-bold">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{sub.slot || `SUB ${idx + 1}`}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-900">{sub.name}</span>
                            {sub.code && (
                              <span className="ml-2 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {sub.code}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-600 font-medium">
                            {sub.faculty_name || 'Faculty In-Charge'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Dues
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[10px] text-slate-400">
                            {sub.signature_date || new Date(activeCert.issued_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Academic Clearance: Laboratory & Practical Sessions */}
            {activeCert.labs && activeCert.labs.length > 0 && (
              <div className="text-left space-y-2 pt-2">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-600" />
                    <span className="font-display font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Academic Clearance: Laboratory & Practical Sessions
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {activeCert.labs.length} / {activeCert.labs.length} Cleared
                  </span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 w-20">Slot</th>
                        <th className="px-3 py-2">Practical Course & Code</th>
                        <th className="px-3 py-2">Lab In-Charge</th>
                        <th className="px-3 py-2 text-center w-28">Clearance</th>
                        <th className="px-3 py-2 text-right w-24">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeCert.labs.map((lab, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-3 py-2 font-mono text-[10px] text-slate-500 font-bold">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{lab.slot || `LAB ${idx + 1}`}</span>
                          </td>
                          <td className="px-3 py-2">
                            <span className="font-semibold text-slate-900">{lab.name}</span>
                            {lab.code && (
                              <span className="ml-2 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {lab.code}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-slate-600 font-medium">
                            {lab.faculty_name || 'Lab In-Charge'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Dues
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-[10px] text-slate-400">
                            {lab.signature_date || new Date(activeCert.issued_at).toLocaleDateString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 3. Institutional Common Clearance Nodes */}
            {activeCert.common_nodes && activeCert.common_nodes.length > 0 && (
              <div className="text-left space-y-2 pt-2">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-t-xl">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    <span className="font-display font-bold text-xs text-slate-900 uppercase tracking-wide">
                      Institutional Common Clearance Nodes
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {activeCert.common_nodes.length} / {activeCert.common_nodes.length} Cleared
                  </span>
                </div>
                <div className="border border-t-0 border-slate-200 rounded-b-xl overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-2 w-20">Slot</th>
                        <th className="px-3 py-2">Department / Facility</th>
                        <th className="px-3 py-2">Allocated Officer</th>
                        <th className="px-3 py-2 text-center w-28">Clearance</th>
                        <th className="px-3 py-2 text-right w-24">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {activeCert.common_nodes.map((node, idx) => {
                        const isExempt = node.dues_status?.toLowerCase().includes('exempted');
                        return (
                          <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-3 py-2 font-mono text-[10px] text-slate-500 font-bold">
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{node.slot || `COM ${idx + 1}`}</span>
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-slate-900">{node.name}</span>
                              {node.code && (
                                <span className="ml-2 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                                  {node.code}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-slate-600 font-medium">
                              {node.faculty_name || 'Officer In-Charge'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {isExempt ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                                  Exempted
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> No Dues
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[10px] text-slate-400">
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

            {/* Summary Confirmation Note */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium text-center">
              Institutional Clearance Record: There are <span className="font-bold uppercase tracking-wide">NO OUTSTANDING DUES</span> recorded across any college division, laboratory, or central facility.
            </div>

            {/* Footer with QR Code and Signatures */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* QR Verification Seal */}
              <div className="flex items-center gap-4 text-left">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=90x90&data=${encodeURIComponent(
                      `${window.location.origin}/verify/${activeCert.verification_code}`
                    )}`}
                    alt="Certificate QR Verification"
                    className="w-18 h-18"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Tamper-Proof QR
                  </p>
                  <p className="text-[10px] text-slate-500 max-w-[150px] mt-0.5 leading-tight">
                    Scan using any camera to verify validity on official institutional registry
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Link
                      to={`/verify/${activeCert.verification_code}`}
                      target="_blank"
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1"
                    >
                      Open Verifier <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleCopyLink(activeCert.verification_code)}
                      className="text-[10px] text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1 cursor-pointer"
                      title="Copy public verification link"
                    >
                      {copied ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5" />}
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Authorized Signatories */}
              <div className="flex items-center gap-8 text-center text-xs">
                <div>
                  <div className="h-10 flex items-end justify-center font-display italic text-indigo-900 font-semibold text-sm">
                    Dean of Academics
                  </div>
                  <div className="w-28 border-t border-slate-400 mt-1"></div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Dean (Academics)</p>
                </div>

                <div>
                  <div className="h-10 flex items-end justify-center font-display italic text-indigo-900 font-semibold text-sm">
                    Dr. T. Senthilvel
                  </div>
                  <div className="w-28 border-t border-slate-400 mt-1"></div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5 uppercase">PRINCIPAL</p>
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

