import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Printer,
  Download,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  BookOpen,
  FlaskConical,
  Building2,
  RotateCcw,
  Check,
  FileCheck2,
} from 'lucide-react';
import api from '../../services/api';
import { Certificate } from '../../types';
import { downloadCertificatePdfFile } from '../../utils/printCertificate';

export const PrintCertificatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const autoPrint = searchParams.get('autoprint') === 'true';
  const navigate = useNavigate();

  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const fetchCertificate = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const isNum = !isNaN(Number(id));
      const url = isNum ? `/certificates/${id}` : `/certificates/verify/${id}`;
      const res = await api.get(url);
      setCert(res.data);
    } catch (err: any) {
      try {
        const verifyRes = await api.get(`/certificates/verify/${id}`);
        setCert({
          id: typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : 1,
          student_id: 1,
          student_name: verifyRes.data.student_name,
          register_number: verifyRes.data.register_number,
          course_name: verifyRes.data.course_name,
          department_name: verifyRes.data.department_name,
          certificate_number: verifyRes.data.certificate_number,
          verification_code: verifyRes.data.verification_code,
          issued_at: verifyRes.data.issued_at,
          is_valid: verifyRes.data.is_valid,
          created_at: verifyRes.data.issued_at,
          subjects: verifyRes.data.subjects,
          labs: verifyRes.data.labs,
          common_nodes: verifyRes.data.common_nodes,
          year: verifyRes.data.year,
          semester: verifyRes.data.semester,
          academic_year: verifyRes.data.academic_year,
          exam_type: verifyRes.data.exam_type,
        });
      } catch (innerErr: any) {
        setError(innerErr.response?.data?.detail || 'Failed to load certificate record');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!id) return;
    try {
      setResetting(true);
      setError(null);
      try {
        const resetRes = await api.post(`/certificates/${id}/reset`);
        if (resetRes.data?.certificate) {
          setCert(resetRes.data.certificate);
          setResetSuccess(true);
          setTimeout(() => setResetSuccess(false), 3000);
          return;
        }
      } catch {
        // Fallback to refetch
      }
      await fetchCertificate();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset certificate data');
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  useEffect(() => {
    if (cert && autoPrint && !hasPrinted) {
      const timer = setTimeout(() => {
        try {
          window.print();
          setHasPrinted(true);
        } catch (e) {
          console.warn('Auto print failed or was blocked by browser', e);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [cert, autoPrint, hasPrinted]);

  const handlePrintNow = () => {
    try {
      window.print();
    } catch (err) {
      alert('Your browser blocked print. Please press Ctrl+P (or ⌘+P) to print.');
    }
  };

  const handleDownload = async () => {
    if (!cert) return;
    try {
      setDownloading(true);
      await downloadCertificatePdfFile(cert.id, cert.certificate_number);
    } catch (err: any) {
      alert('Unable to generate PDF directly. Please use the Print button to Save as PDF.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-slate-600 text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Preparing high-resolution printable certificate...</span>
        </div>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-display font-bold text-base text-slate-900">Certificate Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'Could not locate the requested certificate record.'}</p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={fetchCertificate}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify/${cert.verification_code}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(verifyUrl)}`;
  const issuedDateStr = cert.issued_at
    ? new Date(cert.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const sem = cert.semester || 7;
  const year = cert.year || Math.ceil(sem / 2) || 4;
  const acadYear = cert.academic_year || '2025-2026';
  const examType = cert.exam_type || 'CIAT-I / CIAT-II & End Semester Examinations';

  const subjects = cert.subjects && cert.subjects.length > 0 ? cert.subjects : [];
  const labs = cert.labs && cert.labs.length > 0 ? cert.labs : [];
  const commonNodes = cert.common_nodes && cert.common_nodes.length > 0 ? cert.common_nodes : [];

  return (
    <div className="min-h-screen bg-slate-100/90 text-slate-900 p-2 sm:p-6 flex flex-col items-center">
      {/* Top Embedded Print Styles for strict 1-page A4 */}
      <style>{`
        @page {
          size: A4 portrait;
          margin: 6mm 8mm;
        }
        @media print {
          html, body {
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            overflow: hidden !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #certificate-print-sheet {
            width: 100% !important;
            max-width: 100% !important;
            height: 284mm !important;
            max-height: 284mm !important;
            padding: 12px 18px !important;
            margin: 0 !important;
            border: 2px double #1e1b4b !important;
            border-radius: 8px !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            overflow: hidden !important;
            box-sizing: border-box !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .print-hidden-toolbar {
            display: none !important;
          }
        }
      `}</style>

      {/* Action Toolbar (Hidden during browser printing) */}
      <div className="print-hidden-toolbar w-full max-w-4xl mb-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-display font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              1-Page Official Certificate Print & Download
            </h1>
            <p className="text-[11px] text-slate-500 font-mono">
              {cert.certificate_number} &bull; {cert.student_name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="px-3 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Reset certificate data and refresh clearance breakdown"
          >
            {resetSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${resetting ? 'animate-spin' : ''}`} />
            )}
            {resetSuccess ? 'Reset Complete' : resetting ? 'Resetting...' : 'Reset View'}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" />
            {downloading ? 'Downloading...' : 'Download Full PDF'}
          </button>
          <button
            onClick={handlePrintNow}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" /> Print Certificate (1-Page A4)
          </button>
        </div>
      </div>

      {/* Printable Sheet (Fits cleanly on 1 Page A4) */}
      <div
        id="certificate-print-sheet"
        className="w-full max-w-[840px] bg-white rounded-2xl p-4 sm:p-7 border-2 sm:border-3 border-indigo-950/20 shadow-xl print:shadow-none print:border-2 print:border-indigo-950 relative overflow-hidden"
      >
        {/* Subtle Watermark BG */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.028] select-none">
          <GraduationCap className="w-80 h-80 text-indigo-950" />
        </div>

        {/* Certificate Content - Compact & Clean One-Page Assembly */}
        <div className="relative z-10 text-center space-y-2.5 flex flex-col justify-between h-full">
          {/* Header / Crest */}
          <div className="border-b border-slate-200 pb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-900 text-white flex items-center justify-center mx-auto mb-1.5 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="font-display font-black text-lg sm:text-xl text-indigo-950 uppercase tracking-tight">
              College of Engineering
            </h2>
            <p className="text-[9.5px] font-bold text-slate-600 tracking-wider uppercase mt-0.5">
              Autonomous Institution &bull; Approved by AICTE &bull; Affiliated to Anna University &bull; Accredited NAAC 'A+'
            </p>
            <p className="text-[8.5px] text-slate-500 font-semibold tracking-wide mt-0.5 uppercase">
              Office of Academic Affairs & Institutional Clearances (CIAT & End Semester)
            </p>
          </div>

          {/* Title & Metadata Ribbon */}
          <div>
            <h3 className="font-display font-black text-sm sm:text-base text-slate-900 uppercase tracking-tight">
              Institutional No Due Clearance Certificate
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 py-1 px-3 bg-slate-50 rounded-lg border border-slate-200 text-[9.5px] font-mono text-slate-600 max-w-2xl mx-auto mt-1">
              <div>
                <span className="text-slate-400">Cert No: </span>
                <span className="font-bold text-slate-900">{cert.certificate_number}</span>
              </div>
              <div className="h-2.5 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">Verification: </span>
                <span className="font-bold text-indigo-700">{cert.verification_code}</span>
              </div>
              <div className="h-2.5 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">Period: </span>
                <span className="font-bold text-slate-900">{acadYear} (Sem {sem})</span>
              </div>
              <div className="h-2.5 w-px bg-slate-200"></div>
              <div>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[9px]">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> ALL DUES CLEARED
                </span>
              </div>
            </div>
          </div>

          {/* Candidate Details Matrix (Compact 3-column / 6-item box) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 text-left text-xs">
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Candidate Name</span>
              <span className="font-bold text-slate-900 text-[11px] truncate block">{(cert.student_name || 'STUDENT').toUpperCase()}</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Register Number</span>
              <span className="font-mono font-bold text-indigo-900 text-[11px] truncate block">{cert.register_number || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Degree / Program</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">{cert.course_name || 'B.E. Computer Science'}</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Department</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">{cert.department_name || 'Computer Science & Engineering'}</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Semester & Year</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">Semester {sem} / Year {year} ({acadYear})</span>
            </div>
            <div>
              <span className="block text-[8.5px] font-bold uppercase tracking-wider text-slate-400">Examination Purpose</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">{examType}</span>
            </div>
          </div>

          {/* 1. Academic Clearance: Theory Courses Table */}
          {subjects.length > 0 && (
            <div className="text-left">
              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-t-lg">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-display font-bold text-[10px] text-slate-900 uppercase tracking-wide">
                    Academic Clearance: Theory Courses ({subjects.length} Subjects)
                  </span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                  {subjects.length} / {subjects.length} Cleared
                </span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50/70 text-[9px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-1 w-14">Slot</th>
                      <th className="px-2 py-1">Course Code & Title</th>
                      <th className="px-2 py-1">Faculty In-Charge</th>
                      <th className="px-2 py-1 text-center w-24">Status</th>
                      <th className="px-2 py-1 text-right w-20">Verified</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 text-[10px]">
                    {subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-2 py-0.5 font-mono text-[9px] font-bold text-slate-500">
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{sub.slot || `SUB ${idx + 1}`}</span>
                        </td>
                        <td className="px-2 py-0.5">
                          <span className="font-bold text-slate-900">{sub.name}</span>
                          {sub.code && (
                            <span className="ml-1.5 font-mono text-[9px] font-bold text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                              {sub.code}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-0.5 text-slate-600 font-medium">
                          {sub.faculty_name || 'Faculty In-Charge'}
                        </td>
                        <td className="px-2 py-0.5 text-center">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> No Dues
                          </span>
                        </td>
                        <td className="px-2 py-0.5 text-right font-mono text-[9px] text-slate-400">
                          {sub.signature_date || issuedDateStr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2 & 3. Side-by-Side: Laboratory Courses & Institutional Common Nodes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
            {/* Practical Laboratory Clearance */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 bg-emerald-50/70 border border-emerald-200 rounded-t-lg">
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="font-display font-bold text-[10px] text-emerald-950 uppercase tracking-wide">
                    Practical Sessions ({labs.length})
                  </span>
                </div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                  {labs.length} Cleared
                </span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
                <table className="w-full text-[9.5px] text-left">
                  <thead className="bg-slate-50/70 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-1 w-12">Slot</th>
                      <th className="px-2 py-1">Practical Course</th>
                      <th className="px-2 py-1">In-Charge</th>
                      <th className="px-2 py-1 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {labs.map((lab, idx) => (
                      <tr key={idx}>
                        <td className="px-2 py-0.5 font-mono text-[8.5px] font-bold text-slate-500">
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{lab.slot || `L${idx + 1}`}</span>
                        </td>
                        <td className="px-2 py-0.5 font-semibold text-slate-900 truncate max-w-[120px]">
                          {lab.name}
                          {lab.code && <span className="ml-1 text-[8.5px] text-indigo-600">[{lab.code}]</span>}
                        </td>
                        <td className="px-2 py-0.5 text-slate-600 truncate max-w-[90px]">{lab.faculty_name || 'Lab In-Charge'}</td>
                        <td className="px-2 py-0.5 text-center">
                          <span className="inline-flex items-center gap-0.5 text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                            <Check className="w-2.5 h-2.5" /> Cleared
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Institutional Common Nodes */}
            <div>
              <div className="flex items-center justify-between px-2 py-1 bg-amber-50/70 border border-amber-200 rounded-t-lg">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700" />
                  <span className="font-display font-bold text-[10px] text-amber-950 uppercase tracking-wide">
                    Institutional Nodes ({commonNodes.length})
                  </span>
                </div>
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-200 px-1.5 py-0.2 rounded-full">
                  {commonNodes.length} Cleared
                </span>
              </div>
              <div className="border border-t-0 border-slate-200 rounded-b-lg overflow-hidden">
                <table className="w-full text-[9.5px] text-left">
                  <thead className="bg-slate-50/70 text-[8.5px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-2 py-1">Department / Center</th>
                      <th className="px-2 py-1">Officer</th>
                      <th className="px-2 py-1 text-center w-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {commonNodes.map((node, idx) => {
                      const isExempt = node.dues_status?.toLowerCase().includes('exempted');
                      return (
                        <tr key={idx}>
                          <td className="px-2 py-0.5 font-semibold text-slate-900 truncate max-w-[130px]">
                            {node.name}
                          </td>
                          <td className="px-2 py-0.5 text-slate-600 truncate max-w-[90px]">{node.faculty_name || 'Officer'}</td>
                          <td className="px-2 py-0.5 text-center">
                            {isExempt ? (
                              <span className="text-[8.5px] font-bold text-sky-700 bg-sky-50 px-1 py-0.2 rounded border border-sky-200">
                                Exempt
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                <Check className="w-2.5 h-2.5" /> No Dues
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Institutional Confirmation Note */}
          <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-[9.5px] text-emerald-800 font-medium text-center">
            Institutional Clearance Record: There are <span className="font-bold uppercase">NO OUTSTANDING DUES</span> or liabilities recorded against this student across any college division or facility.
          </div>

          {/* Footer with QR Code, Autonomous Seal and Signatures */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
            {/* QR Verification */}
            <div className="flex items-center gap-2.5 text-left">
              <div className="p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
                <img
                  src={qrUrl}
                  alt="Certificate QR Verification"
                  className="w-14 h-14"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Tamper-Proof QR
                </p>
                <p className="text-[8.5px] text-slate-500 max-w-[130px] leading-tight">
                  Scan to verify authentic status on college portal
                </p>
                <p className="text-[8.5px] font-mono text-indigo-600 mt-0.5">
                  {cert.verification_code}
                </p>
              </div>
            </div>

            {/* Institutional Seal Emblem */}
            <div className="hidden sm:block border-2 border-double border-amber-400 bg-amber-50/70 rounded-lg px-2.5 py-1 text-center text-amber-900">
              <div className="text-[7.5px] font-bold tracking-wider uppercase">Autonomous Institution</div>
              <div className="text-[8.5px] font-black tracking-wide">[ SEAL VERIFIED ]</div>
              <div className="text-[7.5px] text-emerald-700 font-bold uppercase">Audit Cleared</div>
            </div>

            {/* Authorized Signatories */}
            <div className="flex items-center gap-5 text-center text-xs">
              <div>
                <div className="h-6 flex items-end justify-center font-display italic text-indigo-900 font-semibold text-xs">
                  Dean of Academics
                </div>
                <div className="w-24 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mt-0.5">Dean (Academics)</p>
              </div>

              <div>
                <div className="h-6 flex items-end justify-center font-display italic text-indigo-900 font-semibold text-xs">
                  Dr. T. Senthilvel
                </div>
                <div className="w-24 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[8.5px] text-slate-500 font-bold uppercase mt-0.5">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCertificatePage;
