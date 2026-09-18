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
            padding: 14px 18px !important;
            margin: 0 !important;
            border: 3px solid #0f172a !important;
            border-radius: 4px !important;
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
              Institutional Official No Due Certificate
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
            {downloading ? 'Downloading...' : 'Download Official PDF'}
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
        className="w-full max-w-[840px] bg-white rounded-xl p-5 sm:p-7 border-[3px] border-slate-900 shadow-2xl print:shadow-none print:border-[3px] print:border-slate-900 relative overflow-hidden"
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

        {/* Certificate Content */}
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
                <span className="font-bold text-slate-950">{cert.certificate_number}</span>
              </div>
              <div className="h-2.5 w-px bg-slate-300"></div>
              <div>
                <span className="text-slate-400">Security Code: </span>
                <span className="font-bold text-indigo-800">{cert.verification_code}</span>
              </div>
              <div className="h-2.5 w-px bg-slate-300"></div>
              <div>
                <span className="text-slate-400">Academic Year: </span>
                <span className="font-bold text-slate-900">{acadYear} (Sem {sem})</span>
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
              <span className="font-bold text-slate-950 text-[11px] truncate block">{(cert.student_name || 'STUDENT').toUpperCase()}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Register Number</span>
              <span className="font-mono font-bold text-indigo-950 text-[11px] truncate block">{cert.register_number || 'N/A'}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Degree & Branch</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">{cert.course_name || 'B.E. Computer Science'}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Department</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">{cert.department_name || 'Computer Science & Engineering'}</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Academic Year & Semester</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">Year {year} / Semester {sem} ({acadYear})</span>
            </div>
            <div>
              <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-500">Examination / Clearance Scope</span>
              <span className="font-bold text-slate-800 text-[10.5px] truncate block">{examType}</span>
            </div>
          </div>

          {/* 4. Academic Clearance: Theory Courses Table */}
          {subjects.length > 0 && (
            <div className="text-left">
              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100/80 border border-slate-300 rounded-t-md">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-slate-800" />
                  <span className="font-serif font-bold text-[9.5px] text-slate-950 uppercase tracking-wide">
                    Part I: Academic Clearance &bull; Theory Courses ({subjects.length} Subjects)
                  </span>
                </div>
                <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                  {subjects.length} / {subjects.length} Cleared
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
                  <tbody className="divide-y divide-slate-100 text-slate-800 text-[9.5px]">
                    {subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50">
                        <td className="px-2 py-0.5 font-mono text-[8.5px] font-bold text-slate-500">
                          <span className="bg-slate-100 px-1 py-0.2 rounded border border-slate-200">{sub.slot || `SUB ${idx + 1}`}</span>
                        </td>
                        <td className="px-2 py-0.5">
                          <span className="font-semibold text-slate-950">{sub.name}</span>
                          {sub.code && (
                            <span className="ml-1.5 font-mono text-[8.5px] font-bold text-indigo-900 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-100">
                              {sub.code}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-0.5 text-slate-600 font-medium">
                          {sub.faculty_name || 'Faculty In-Charge'}
                        </td>
                        <td className="px-2 py-0.5 text-center">
                          <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" /> No Dues
                          </span>
                        </td>
                        <td className="px-2 py-0.5 text-right font-mono text-[8.5px] text-slate-500">
                          {sub.signature_date || issuedDateStr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. Academic Clearance: Part II - Practical Laboratories Table */}
          {labs && labs.length > 0 && (
            <div className="text-left">
              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100/90 border border-slate-300 rounded-t-md">
                <div className="flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="font-serif font-bold text-[9.5px] text-slate-950 uppercase tracking-wide">
                    Part II: Practical Laboratories & Experiments ({labs.length} Courses)
                  </span>
                </div>
                <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                  {labs.length} / {labs.length} Cleared
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
                    {labs.map((lab, idx) => (
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
                          {lab.signature_date || issuedDateStr}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Institutional Clearance: Part III - Common Nodes Table */}
          {commonNodes && commonNodes.length > 0 && (
            <div className="text-left">
              <div className="flex items-center justify-between px-2.5 py-1 bg-slate-100/90 border border-slate-300 rounded-t-md">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-800" />
                  <span className="font-serif font-bold text-[9.5px] text-slate-950 uppercase tracking-wide">
                    Part III: Institutional Central Clearance Nodes ({commonNodes.length} Facilities)
                  </span>
                </div>
                <span className="text-[8.5px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded">
                  {commonNodes.length} / {commonNodes.length} Cleared
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
                    {commonNodes.map((node, idx) => {
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
                            {node.signature_date || issuedDateStr}
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
          <div className="pt-2 border-t-2 border-slate-300 flex items-center justify-between gap-3">
            {/* QR Verification */}
            <div className="flex items-center gap-2 text-left">
              <div className="p-1 bg-white rounded border border-slate-300 shadow-2xs">
                <img
                  src={qrUrl}
                  alt="Certificate QR Verification"
                  className="w-13 h-13"
                />
              </div>
              <div>
                <p className="text-[9.5px] font-bold text-slate-950 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" /> Tamper-Proof QR
                </p>
                <p className="text-[8px] text-slate-500 max-w-[120px] leading-tight">
                  Scan to verify authentic certificate on institutional registry
                </p>
                <p className="text-[8px] font-mono text-indigo-900 font-bold mt-0.5">
                  {cert.verification_code}
                </p>
              </div>
            </div>

            {/* Official Seal Emblem */}
            <div className="border-2 border-amber-600/70 bg-amber-50/60 rounded-full w-18 h-18 p-1 flex flex-col items-center justify-center text-center text-amber-950 shadow-2xs">
              <span className="text-[6.5px] font-bold uppercase tracking-wider text-amber-800">Apex College</span>
              <span className="text-[7.5px] font-serif font-black uppercase text-slate-900">[ SEAL ]</span>
              <span className="text-[6.5px] font-bold text-emerald-800 uppercase">AUDITED</span>
            </div>

            {/* Authorized Signatories */}
            <div className="flex items-center gap-4 sm:gap-6 text-center text-xs">
              <div>
                <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                  Faculty Advisor
                </div>
                <div className="w-20 sm:w-22 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">Faculty Advisor</p>
              </div>

              <div>
                <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                  Dr. K. Manickam
                </div>
                <div className="w-20 sm:w-22 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">HOD / Dept Chair</p>
              </div>

              <div>
                <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                  Dean (Academics)
                </div>
                <div className="w-20 sm:w-22 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">Dean of Academics</p>
              </div>

              <div>
                <div className="h-5 flex items-end justify-center font-serif italic text-slate-900 font-semibold text-[11px]">
                  Dr. T. Senthilvel
                </div>
                <div className="w-20 sm:w-22 border-t border-slate-400 mt-0.5"></div>
                <p className="text-[8px] text-slate-600 font-bold uppercase mt-0.5">Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintCertificatePage;
