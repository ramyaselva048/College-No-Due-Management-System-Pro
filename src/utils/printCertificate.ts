import { Certificate } from '../types';
import api from '../services/api';

/**
 * Builds a standalone, print-optimized HTML string for the No Due Certificate.
 * Formatted and engineered to fit ALL details (Theory Courses, Labs, Common Nodes,
 * Student Matrix, Signatures & QR Code) cleanly onto EXACTLY ONE A4 PAGE.
 */
export function buildCertificatePrintHtml(cert: Certificate, originUrl?: string): string {
  const origin = originUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const verifyUrl = `${origin}/verify/${cert.verification_code}`;
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>No Due Certificate - ${cert.certificate_number} - ${cert.student_name || 'Student'}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 8mm;
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    html, body {
      background-color: #f8fafc;
      color: #0f172a;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.35;
      margin: 0;
      padding: 8px;
    }
    .cert-outer-wrapper {
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      border: 2.5px double #1e1b4b;
      border-radius: 14px;
      padding: 16px 20px;
      position: relative;
      box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    @media print {
      html, body {
        background-color: #ffffff !important;
        padding: 0 !important;
        margin: 0 !important;
        width: 210mm !important;
        height: 297mm !important;
        overflow: hidden !important;
      }
      .cert-outer-wrapper {
        border: 2px double #1e1b4b !important;
        box-shadow: none !important;
        padding: 12px 18px !important;
        width: 100% !important;
        max-width: 100% !important;
        height: 284mm !important;
        max-height: 284mm !important;
        border-radius: 8px !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        overflow: hidden !important;
      }
      .no-print {
        display: none !important;
      }
    }
    .watermark {
      position: absolute;
      top: 52%;
      left: 50%;
      transform: translate(-50%, -50%);
      opacity: 0.028;
      pointer-events: none;
      user-select: none;
      z-index: 0;
    }
    .watermark svg {
      width: 320px;
      height: 320px;
    }
    .cert-content {
      position: relative;
      z-index: 1;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .header-crest {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      background-color: #1e1b4b;
      color: #ffffff;
      border-radius: 10px;
      margin-bottom: 4px;
      box-shadow: 0 2px 6px rgba(30, 27, 75, 0.2);
    }
    .header-crest svg {
      width: 22px;
      height: 22px;
    }
    .college-name {
      font-family: 'Cinzel', Georgia, serif;
      font-weight: 800;
      font-size: 20px;
      letter-spacing: 0.5px;
      color: #0f172a;
      text-transform: uppercase;
      line-height: 1.15;
    }
    .affiliation {
      font-size: 8.5px;
      font-weight: 700;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 2px;
    }
    .sub-office {
      font-size: 8px;
      color: #64748b;
      font-weight: 600;
      margin-top: 1px;
    }
    .header-divider {
      height: 1.5px;
      background: linear-gradient(to right, transparent, #cbd5e1, transparent);
      margin: 3px 0;
    }
    .cert-main-title {
      font-size: 15px;
      font-weight: 900;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 1px 0;
    }
    .meta-ribbon {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 4px 12px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      color: #475569;
      margin: 0 auto;
      width: 100%;
      max-width: 660px;
    }
    .meta-ribbon strong {
      color: #0f172a;
    }
    .meta-ribbon .code-highlight {
      color: #4338ca;
      font-weight: 700;
    }
    .status-ok-tag {
      color: #047857;
      font-weight: 700;
      background: #d1fae5;
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid #a7f3d0;
    }

    /* Candidate Details Grid */
    .student-matrix {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 5px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 6px 12px;
      text-align: left;
      font-size: 9.5px;
    }
    .matrix-item {
      display: flex;
      flex-direction: column;
    }
    .matrix-label {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .matrix-val {
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Tables */
    .clearance-section {
      text-align: left;
      page-break-inside: avoid;
    }
    .section-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 3px 8px;
      background-color: #f1f5f9;
      border: 1px solid #e2e8f0;
      border-radius: 6px 6px 0 0;
    }
    .section-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #1e293b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .section-counter {
      font-size: 8.5px;
      font-weight: 700;
      color: #047857;
      background: #d1fae5;
      border: 1px solid #a7f3d0;
      padding: 0.5px 6px;
      border-radius: 9999px;
    }
    .clearance-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 6px 6px;
      overflow: hidden;
      font-size: 9.5px;
    }
    .clearance-table th {
      background-color: #f8fafc;
      color: #475569;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 8px;
      letter-spacing: 0.4px;
      padding: 3px 6px;
      border-bottom: 1px solid #e2e8f0;
      border-right: 1px solid #f1f5f9;
      text-align: left;
    }
    .clearance-table td {
      padding: 3px 6px;
      border-bottom: 1px solid #f1f5f9;
      border-right: 1px solid #f8fafc;
      color: #334155;
      vertical-align: middle;
      line-height: 1.25;
    }
    .clearance-table tr:last-child td {
      border-bottom: none;
    }
    .clearance-table tr:nth-child(even) td {
      background-color: #fafbfc;
    }
    .slot-pill {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      font-size: 8px;
      color: #475569;
      background: #f1f5f9;
      padding: 0.5px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }
    .code-pill {
      display: inline-block;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
      font-size: 8px;
      color: #4338ca;
      background: #eef2ff;
      padding: 0.5px 4px;
      border-radius: 3px;
      margin-left: 4px;
    }
    .status-badge-cleared {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 700;
      font-size: 8px;
      color: #065f46;
      background-color: #d1fae5;
      border: 1px solid #a7f3d0;
      padding: 1px 5px;
      border-radius: 4px;
      white-space: nowrap;
    }
    .status-badge-exempt {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-weight: 700;
      font-size: 8px;
      color: #0369a1;
      background-color: #e0f2fe;
      border: 1px solid #bae6fd;
      padding: 1px 5px;
      border-radius: 4px;
      white-space: nowrap;
    }

    /* Side-by-Side 2 Column Container */
    .two-col-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      text-align: left;
    }

    .cert-footer {
      margin-top: 6px;
      padding-top: 8px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      page-break-inside: avoid;
    }
    .qr-block {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }
    .qr-frame {
      padding: 4px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .qr-frame img {
      display: block;
      width: 62px;
      height: 62px;
    }
    .qr-meta-title {
      font-size: 9.5px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .qr-meta-sub {
      font-size: 8px;
      color: #64748b;
      max-width: 140px;
      line-height: 1.25;
      margin-top: 2px;
    }
    .qr-meta-link {
      font-size: 8px;
      font-family: 'JetBrains Mono', monospace;
      color: #4f46e5;
      margin-top: 2px;
    }

    .seal-emblem {
      border: 1.5px double #ca8a04;
      border-radius: 8px;
      padding: 4px 10px;
      text-align: center;
      background: #fefce8;
      color: #854d0e;
      font-size: 8px;
      font-weight: 700;
      line-height: 1.2;
    }

    .signatories-block {
      display: flex;
      align-items: flex-end;
      gap: 24px;
      text-align: center;
    }
    .signatory {
      width: 110px;
    }
    .sig-name {
      font-family: 'Cinzel', Georgia, serif;
      font-style: italic;
      font-size: 11px;
      font-weight: 700;
      color: #1e1b4b;
      min-height: 20px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .sig-line {
      height: 1.2px;
      background-color: #64748b;
      margin: 4px auto 2px;
      width: 95px;
    }
    .sig-title {
      font-size: 8px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
  </style>
</head>
<body>
  <div class="cert-outer-wrapper">
    <!-- Institutional Watermark -->
    <div class="watermark">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
        <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
      </svg>
    </div>

    <div class="cert-content">
      <!-- Header / Crest -->
      <div>
        <div class="header-crest">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
            <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
          </svg>
        </div>
        <h1 class="college-name">College of Engineering</h1>
        <p class="affiliation">Autonomous Institution &bull; Approved by AICTE &bull; Affiliated to Anna University &bull; Accredited NAAC 'A+'</p>
        <p class="sub-office">OFFICE OF ACADEMIC AFFAIRS & INSTITUTIONAL CLEARANCES (CIAT & END SEMESTER)</p>
      </div>

      <div class="header-divider"></div>

      <!-- Title & Ribbon -->
      <h2 class="cert-main-title">Institutional No Due Clearance Certificate</h2>

      <div class="meta-ribbon">
        <div><span>Cert No:</span> <strong>${cert.certificate_number}</strong></div>
        <div style="color: #cbd5e1;">|</div>
        <div><span>Verification Code:</span> <span class="code-highlight">${cert.verification_code}</span></div>
        <div style="color: #cbd5e1;">|</div>
        <div><span>Academic Year:</span> <strong>${acadYear} (Sem ${sem})</strong></div>
        <div style="color: #cbd5e1;">|</div>
        <div><span>Status:</span> <span class="status-ok-tag">&#10003; ALL DUES CLEARED</span></div>
      </div>

      <!-- Candidate Details Matrix -->
      <div class="student-matrix">
        <div class="matrix-item">
          <span class="matrix-label">Candidate Name</span>
          <span class="matrix-val">${(cert.student_name || 'STUDENT').toUpperCase()}</span>
        </div>
        <div class="matrix-item">
          <span class="matrix-label">Register Number</span>
          <span class="matrix-val font-mono" style="color: #3730a3;">${cert.register_number || 'N/A'}</span>
        </div>
        <div class="matrix-item">
          <span class="matrix-label">Degree / Program</span>
          <span class="matrix-val">${cert.course_name || 'B.E. Computer Science and Engineering'}</span>
        </div>
        <div class="matrix-item">
          <span class="matrix-label">Academic Department</span>
          <span class="matrix-val">${cert.department_name || 'Computer Science & Engineering'}</span>
        </div>
        <div class="matrix-item">
          <span class="matrix-label">Semester & Year</span>
          <span class="matrix-val">Semester ${sem} / Year ${year} (${acadYear})</span>
        </div>
        <div class="matrix-item">
          <span class="matrix-label">Examination Purpose</span>
          <span class="matrix-val">${examType}</span>
        </div>
      </div>

      <!-- 1. Academic Clearance: Theory Courses Table -->
      ${subjects.length > 0 ? `
      <div class="clearance-section">
        <div class="section-banner">
          <span class="section-title">
            <svg style="width:11px; height:11px; color:#4338ca;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
            </svg>
            Academic Clearance: Theory Courses (${subjects.length} Subjects)
          </span>
          <span class="section-counter">${subjects.length} / ${subjects.length} Verified</span>
        </div>
        <table class="clearance-table">
          <thead>
            <tr>
              <th style="width: 50px;">Slot</th>
              <th>Theory Course Title & Code</th>
              <th>Faculty In-Charge</th>
              <th style="text-align: center; width: 85px;">Clearance</th>
              <th style="text-align: right; width: 75px;">Verified</th>
            </tr>
          </thead>
          <tbody>
            ${subjects.map((sub, idx) => `
              <tr>
                <td><span class="slot-pill">${sub.slot || `SUB ${idx + 1}`}</span></td>
                <td>
                  <strong>${sub.name}</strong>
                  ${sub.code ? `<span class="code-pill">${sub.code}</span>` : ''}
                </td>
                <td>${sub.faculty_name || 'Faculty In-Charge'}</td>
                <td style="text-align: center;">
                  <span class="status-badge-cleared">&#10003; No Dues</span>
                </td>
                <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #64748b;">
                  ${sub.signature_date || issuedDateStr}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- 2. Academic Clearance: Part II - Practical Laboratory Courses -->
      ${labs.length > 0 ? `
      <div class="clearance-section">
        <div class="section-banner" style="background-color: #f0fdf4; border-color: #bbf7d0;">
          <span class="section-title" style="color: #166534;">
            <svg style="width:11px; height:11px; color:#15803d;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"></path>
            </svg>
            Part II: Practical Laboratories & Experiments (${labs.length} Courses)
          </span>
          <span class="section-counter" style="background:#bbf7d0; color:#14532d;">${labs.length} / ${labs.length} Cleared</span>
        </div>
        <table class="clearance-table">
          <thead>
            <tr>
              <th style="width: 50px;">Slot</th>
              <th>Laboratory Course & Code</th>
              <th>Lab In-Charge</th>
              <th style="text-align: center; width: 85px;">Clearance</th>
              <th style="text-align: right; width: 75px;">Verified</th>
            </tr>
          </thead>
          <tbody>
            ${labs.map((lab, idx) => `
              <tr>
                <td><span class="slot-pill">${lab.slot || `LAB ${idx + 1}`}</span></td>
                <td>
                  <strong>${lab.name}</strong>
                  ${lab.code ? `<span class="code-pill">${lab.code}</span>` : ''}
                </td>
                <td>${lab.faculty_name || 'Lab In-Charge'}</td>
                <td style="text-align: center;">
                  <span class="status-badge-cleared">&#10003; No Dues</span>
                </td>
                <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #64748b;">
                  ${lab.signature_date || issuedDateStr}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- 3. Institutional Clearance: Part III - Central Nodes Table -->
      ${commonNodes.length > 0 ? `
      <div class="clearance-section">
        <div class="section-banner" style="background-color: #fffbeb; border-color: #fde68a;">
          <span class="section-title" style="color: #92400e;">
            <svg style="width:11px; height:11px; color:#b45309;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path>
            </svg>
            Part III: Institutional Central Clearance Nodes (${commonNodes.length} Facilities)
          </span>
          <span class="section-counter" style="background:#fef3c7; color:#78350f;">${commonNodes.length} / ${commonNodes.length} Cleared</span>
        </div>
        <table class="clearance-table">
          <thead>
            <tr>
              <th style="width: 50px;">Slot</th>
              <th>Department / Central Facility</th>
              <th>Officer In-Charge</th>
              <th style="text-align: center; width: 85px;">Clearance</th>
              <th style="text-align: right; width: 75px;">Verified</th>
            </tr>
          </thead>
          <tbody>
            ${commonNodes.map((node, idx) => {
              const isExempt = node.dues_status?.toLowerCase().includes('exempt');
              const exemptLabel = node.dues_status?.includes('Day Scholar')
                ? 'Exempt (Day Scholar)'
                : node.dues_status?.includes('Hosteller')
                ? 'Exempt (Hosteller)'
                : 'Exempt';
              return `
              <tr>
                <td><span class="slot-pill">${node.slot || `COM ${idx + 1}`}</span></td>
                <td>
                  <strong>${node.name}</strong>
                  ${node.code ? `<span class="code-pill">${node.code}</span>` : ''}
                </td>
                <td>${node.faculty_name || 'Officer In-Charge'}</td>
                <td style="text-align: center;">
                  ${isExempt 
                    ? `<span class="status-badge-exempt">${exemptLabel}</span>` 
                    : '<span class="status-badge-cleared">&#10003; No Dues</span>'}
                </td>
                <td style="text-align: right; font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #64748b;">
                  ${node.signature_date || issuedDateStr}
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- Institutional Clearance Confirmation Note -->
      <div style="padding: 4px 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; font-size: 9px; color: #065f46; text-align: center; font-weight: 600;">
        Official Institutional Record: There are <span style="font-weight: 800; text-transform: uppercase;">NO OUTSTANDING DUES</span> recorded across any college division, laboratory, or central facility.
      </div>

      <!-- Footer: QR Code, Autonomous Seal & Signatures -->
      <div class="cert-footer">
        <!-- QR Code -->
        <div class="qr-block">
          <div class="qr-frame">
            <img src="${qrUrl}" alt="Verification QR" />
          </div>
          <div>
            <div class="qr-meta-title">
              <svg style="width:12px; height:12px; color:#059669;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              Tamper-Proof QR
            </div>
            <p class="qr-meta-sub">
              Scan with any mobile camera to verify validity on official registry.
            </p>
            <p class="qr-meta-link">${cert.verification_code}</p>
          </div>
        </div>

        <!-- Institutional Seal Emblem -->
        <div class="seal-emblem">
          <div style="font-size: 7.5px; letter-spacing: 0.5px;">COLLEGE OF ENGINEERING</div>
          <div style="font-size: 9px; font-weight: 900; margin: 1px 0;">[ SEAL VERIFIED ]</div>
          <div style="font-size: 7.5px; color: #047857;">DIGITALLY CERTIFIED</div>
        </div>

        <!-- Authorized Signatures -->
        <div class="signatories-block">
          <div class="signatory">
            <div class="sig-name">Dean of Academics</div>
            <div class="sig-line"></div>
            <div class="sig-title">Dean (Academics)</div>
          </div>
          <div class="signatory">
            <div class="sig-name">Dr. T. Senthilvel</div>
            <div class="sig-line"></div>
            <div class="sig-title">Principal</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers printing reliably.
 * First tries opening the dedicated print view with auto-print.
 * Also supports iframe printing when allowed by browser security context.
 */
export async function printCertificateDirectly(cert: Certificate): Promise<{ ok: boolean; error?: string }> {
  try {
    const printUrl = `/print/certificate/${cert.id}?autoprint=true`;
    
    // Try opening clean print window first
    const printWin = window.open(printUrl, '_blank', 'noopener,noreferrer,width=900,height=1100');
    if (printWin) {
      return { ok: true };
    }

    // Fallback: Use hidden iframe in current page
    const htmlContent = buildCertificatePrintHtml(cert, window.location.origin);
    const iframe = document.createElement('iframe');
    iframe.id = 'certificate-hidden-printer';
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '1px';
    iframe.style.height = '1px';
    iframe.style.border = 'none';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      document.body.removeChild(iframe);
      window.location.href = printUrl;
      return { ok: true };
    }

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Give stylesheet and QR code brief moment to render
    await new Promise((resolve) => setTimeout(resolve, 350));

    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch {
          // ignore cleanup errors
        }
      }, 60000);
      return { ok: true };
    }

    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Print dispatch failed' };
  }
}

/**
 * Downloads official PDF for the certificate from backend.
 * Now contains the full enriched data (Theory, Labs, Institutional Nodes).
 */
export async function downloadCertificatePdfFile(certId: number, certNumber?: string): Promise<void> {
  const res = await api.get(`/certificates/${certId}/download`, {
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `NoDueCertificate_${certNumber || certId}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
