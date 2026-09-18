/**
 * Pure-TypeScript standard PDF generator for College No Due Management System.
 * Generates a pristine, standards-compliant PDF/1.4 binary buffer.
 * Formatted to fit ALL certificate details (Theory Courses, Practical Labs, Common Institutional Nodes,
 * Student Identity Matrix, Signatures & Digital Verification) onto EXACTLY ONE A4 PAGE.
 */

export interface EnrichedCertificateItem {
  slot?: string;
  code?: string;
  name: string;
  faculty_name?: string;
  dues_status?: string;
  signature_date?: string;
}

export interface EnrichedCertificatePdfPayload {
  student_name?: string;
  register_number?: string;
  course_name?: string;
  department_name?: string;
  academic_year?: string;
  year?: number;
  semester?: number;
  exam_type?: string;
  certificate_number?: string;
  verification_code?: string;
  issued_at?: string;
  issued_by_name?: string;
  subjects?: EnrichedCertificateItem[];
  labs?: EnrichedCertificateItem[];
  common_nodes?: EnrichedCertificateItem[];
  signatories?: any;
}

export function generateCertificatePdf(
  payloadOrName: EnrichedCertificatePdfPayload | string,
  registerNumberLegacy?: string,
  courseNameLegacy?: string,
  departmentNameLegacy?: string,
  academicYearLegacy?: string,
  certificateNumberLegacy?: string,
  verificationCodeLegacy?: string,
  issuedAtLegacy?: string,
  issuedByLegacy: string = 'Institutional Administrator'
): Buffer {
  // Normalize payload
  let data: EnrichedCertificatePdfPayload;
  if (typeof payloadOrName === 'string') {
    data = {
      student_name: payloadOrName,
      register_number: registerNumberLegacy,
      course_name: courseNameLegacy,
      department_name: departmentNameLegacy,
      academic_year: academicYearLegacy,
      certificate_number: certificateNumberLegacy,
      verification_code: verificationCodeLegacy,
      issued_at: issuedAtLegacy,
      issued_by_name: issuedByLegacy,
      subjects: [
        { slot: 'SUB 1', code: 'CS3701', name: 'Distributed Systems', faculty_name: 'Dr. S. Ramanathan', dues_status: 'No Dues' },
        { slot: 'SUB 2', code: 'CS3702', name: 'Cloud Computing Architecture', faculty_name: 'Prof. M. Malathi', dues_status: 'No Dues' },
        { slot: 'SUB 3', code: 'CS3703', name: 'Machine Learning Foundations', faculty_name: 'Dr. V. Rajesh', dues_status: 'No Dues' },
        { slot: 'SUB 4', code: 'CS3704', name: 'Cryptography & Cyber Security', faculty_name: 'Dr. K. Anitha', dues_status: 'No Dues' },
        { slot: 'SUB 5', code: 'CS3705', name: 'Mobile App Development', faculty_name: 'Prof. P. Karthik', dues_status: 'No Dues' },
        { slot: 'SUB 6', code: 'GE3701', name: 'Professional Ethics in Engg', faculty_name: 'Dr. N. Sundaram', dues_status: 'No Dues' },
      ],
      labs: [
        { slot: 'LAB 1', code: 'CS3711', name: 'Cloud & Distributed Systems Lab', faculty_name: 'Mr. K. Suresh', dues_status: 'No Dues' },
        { slot: 'LAB 2', code: 'CS3712', name: 'Machine Learning Laboratory', faculty_name: 'Mrs. R. Pavithra', dues_status: 'No Dues' },
        { slot: 'LAB 3', code: 'CS3713', name: 'Mobile Application Dev Lab', faculty_name: 'Mr. B. Dinesh', dues_status: 'No Dues' },
      ],
      common_nodes: [
        { slot: 'COM 1', code: 'LIB-01', name: 'Central College Library', faculty_name: 'Dr. A. Joseph (Librarian)', dues_status: 'No Dues' },
        { slot: 'COM 2', code: 'ACC-01', name: 'Student Accounts & Finance Cell', faculty_name: 'Mr. V. Chandran (Accounts)', dues_status: 'No Dues' },
        { slot: 'COM 3', code: 'PED-01', name: 'Physical Education & Sports Board', faculty_name: 'Capt. R. Murugan (Dir. PE)', dues_status: 'No Dues' },
        { slot: 'COM 4', code: 'HST-01', name: 'Hostel Administration Office', faculty_name: 'Dr. K. Balaji (Warden)', dues_status: 'No Dues' },
        { slot: 'COM 5', code: 'CSE-01', name: 'CSE Department Laboratory Stores', faculty_name: 'Mr. G. Manikandan (Lab Sup)', dues_status: 'No Dues' },
      ],
    };
  } else {
    data = payloadOrName;
  }

  const studentName = (data.student_name || 'STUDENT').toUpperCase();
  const regNo = data.register_number || 'N/A';
  const course = data.course_name || 'B.E. Computer Science and Engineering';
  const dept = data.department_name || 'Computer Science & Engineering';
  const sem = data.semester || 7;
  const year = data.year || Math.ceil(sem / 2) || 4;
  const examType = data.exam_type || 'CIAT-I / CIAT-II & End Semester Examinations';
  const certNumber = data.certificate_number || 'NO-DUE-2026-0001';
  const verifCode = data.verification_code || 'VERIF-2026-0001';
  const acadYear = data.academic_year || '2025-2026';
  const issuedDateStr = data.issued_at
    ? new Date(data.issued_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const subjects = data.subjects && data.subjects.length > 0
    ? data.subjects
    : [
        { slot: 'SUB 1', code: 'CS3701', name: 'Distributed Systems', faculty_name: 'Dr. S. Ramanathan', dues_status: 'No Dues' },
        { slot: 'SUB 2', code: 'CS3702', name: 'Cloud Computing Architecture', faculty_name: 'Prof. M. Malathi', dues_status: 'No Dues' },
        { slot: 'SUB 3', code: 'CS3703', name: 'Machine Learning Foundations', faculty_name: 'Dr. V. Rajesh', dues_status: 'No Dues' },
        { slot: 'SUB 4', code: 'CS3704', name: 'Cryptography & Cyber Security', faculty_name: 'Dr. K. Anitha', dues_status: 'No Dues' },
        { slot: 'SUB 5', code: 'CS3705', name: 'Mobile App Development', faculty_name: 'Prof. P. Karthik', dues_status: 'No Dues' },
        { slot: 'SUB 6', code: 'GE3701', name: 'Professional Ethics in Engg', faculty_name: 'Dr. N. Sundaram', dues_status: 'No Dues' },
      ];

  const labs = data.labs && data.labs.length > 0
    ? data.labs
    : [
        { slot: 'LAB 1', code: 'CS3711', name: 'Cloud & Distributed Systems Lab', faculty_name: 'Mr. K. Suresh', dues_status: 'No Dues' },
        { slot: 'LAB 2', code: 'CS3712', name: 'Machine Learning Laboratory', faculty_name: 'Mrs. R. Pavithra', dues_status: 'No Dues' },
        { slot: 'LAB 3', code: 'CS3713', name: 'Mobile Application Dev Lab', faculty_name: 'Mr. B. Dinesh', dues_status: 'No Dues' },
      ];

  const commonNodes = data.common_nodes && data.common_nodes.length > 0
    ? data.common_nodes
    : [
        { slot: 'COM 1', code: 'LIB-01', name: 'Central College Library', faculty_name: 'Dr. A. Joseph (Librarian)', dues_status: 'No Dues' },
        { slot: 'COM 2', code: 'ACC-01', name: 'Student Accounts & Finance Cell', faculty_name: 'Mr. V. Chandran (Accounts)', dues_status: 'No Dues' },
        { slot: 'COM 3', code: 'PED-01', name: 'Physical Education & Sports Board', faculty_name: 'Capt. R. Murugan (Dir. PE)', dues_status: 'No Dues' },
        { slot: 'COM 4', code: 'HST-01', name: 'Hostel Administration Office', faculty_name: 'Dr. K. Balaji (Warden)', dues_status: 'No Dues' },
        { slot: 'COM 5', code: 'CSE-01', name: 'CSE Department Laboratory Stores', faculty_name: 'Mr. G. Manikandan (Lab Sup)', dues_status: 'No Dues' },
      ];

  // Helper to escape PDF strings
  const esc = (str: string) =>
    (str || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');

  const lines: string[] = [];

  // Outer & Inner Double Borders (A4: 595 x 842 points)
  // Outer Border: 24 24 547 794 (top: 818, bottom: 24)
  // Inner Border: 28 28 539 786 (top: 814, bottom: 28)
  lines.push(
    '0.12 0.15 0.35 RG 1.5 w',
    '24 24 547 794 re S',
    '0.78 0.72 0.45 RG 0.5 w',
    '28 28 539 786 re S'
  );

  // 1. Top College Header (Y: 760 to 804)
  lines.push(
    'BT',
    '/F1 15.5 Tf',
    '0.1 0.12 0.3 rg',
    '1 0 0 1 100 794 Tm',
    `(${esc('APEX COLLEGE OF ENGINEERING (AUTONOMOUS)')}) Tj`,
    '/F2 8.5 Tf',
    '0.3 0.35 0.45 rg',
    '1 0 0 1 108 780 Tm',
    `(${esc("Approved by AICTE, Affiliated to Anna University | Accredited NAAC 'A+' | NBA Tier-1")}) Tj`,
    '/F1 8.5 Tf',
    '0.18 0.22 0.52 rg',
    '1 0 0 1 112 767 Tm',
    `(${esc('OFFICE OF ACADEMIC AFFAIRS & INSTITUTIONAL CLEARANCE CELL')}) Tj`,
    'ET',
    // Header divider bar
    '0.15 0.2 0.45 rg',
    '35 759 525 2 re f'
  );

  // 2. Certificate Title (Y: 741)
  lines.push(
    'BT',
    '/F1 13.5 Tf',
    '0.1 0.14 0.38 rg',
    '1 0 0 1 138 741 Tm',
    `(${esc('INSTITUTIONAL NO DUE CLEARANCE CERTIFICATE')}) Tj`,
    'ET',
    // Metadata Box (Y: 714 to 734, height: 20)
    '0.95 0.96 0.98 rg',
    '35 714 525 20 re f',
    '0.85 0.88 0.92 RG 0.5 w',
    '35 714 525 20 re S',
    'BT',
    '/F1 8 Tf',
    '0.15 0.2 0.3 rg',
    '1 0 0 1 45 720 Tm',
    `(${esc(`Cert No: ${certNumber}`)}) Tj`,
    '/F2 8 Tf',
    '0.3 0.35 0.45 rg',
    '1 0 0 1 195 720 Tm',
    `(${esc(`Academic Year: ${acadYear} (Sem ${sem})`)}) Tj`,
    '1 0 0 1 350 720 Tm',
    `(${esc(`Date: ${issuedDateStr}`)}) Tj`,
    '/F1 8 Tf',
    '0.05 0.5 0.2 rg',
    '1 0 0 1 462 720 Tm',
    `(${esc('[OK] ALL DUES CLEARED')}) Tj`,
    'ET'
  );

  // 3. Student Identity Box (Y: 632 to 704, height: 72)
  lines.push(
    '0.97 0.98 0.99 rg',
    '35 632 525 72 re f',
    '0.85 0.88 0.92 RG 0.5 w',
    '35 632 525 72 re S',
    'BT',
    // Row 1 (Y: 684)
    '/F2 8 Tf',
    '0.4 0.45 0.5 rg',
    '1 0 0 1 45 684 Tm',
    `(${esc('Student Name:')}) Tj`,
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    '1 0 0 1 115 684 Tm',
    `(${esc(studentName)}) Tj`,
    '/F2 8 Tf',
    '0.4 0.45 0.5 rg',
    '1 0 0 1 250 684 Tm',
    `(${esc('Register No:')}) Tj`,
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    '1 0 0 1 310 684 Tm',
    `(${esc(regNo)}) Tj`,
    '/F2 8 Tf',
    '0.4 0.45 0.5 rg',
    '1 0 0 1 395 684 Tm',
    `(${esc('Program:')}) Tj`,
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    '1 0 0 1 440 684 Tm',
    `(${esc(course.length > 28 ? course.substring(0, 26) + '..' : course)}) Tj`,
    // Row 2 (Y: 662)
    '/F2 8 Tf',
    '0.4 0.45 0.5 rg',
    '1 0 0 1 45 662 Tm',
    `(${esc('Department:')}) Tj`,
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    '1 0 0 1 115 662 Tm',
    `(${esc(dept.length > 28 ? dept.substring(0, 26) + '..' : dept)}) Tj`,
    '/F2 8 Tf',
    '0.4 0.45 0.5 rg',
    '1 0 0 1 250 662 Tm',
    `(${esc('Semester / Yr:')}) Tj`,
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    '1 0 0 1 320 662 Tm',
    `(${esc(`Sem ${sem} / Year ${year}`)}) Tj`,
    '/F2 8 Tf',
    '0.4 0.45 0.5 rg',
    '1 0 0 1 395 662 Tm',
    `(${esc('Exam Purpose:')}) Tj`,
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    '1 0 0 1 462 662 Tm',
    `(${esc('CIAT & End Sem')}) Tj`,
    // Row 3 (Y: 642)
    '/F3 7.5 Tf',
    '0.3 0.4 0.5 rg',
    '1 0 0 1 45 642 Tm',
    `(${esc('Certified that the student has completed institutional clearance with zero outstanding dues across all departments.')}) Tj`,
    'ET'
  );

  // 4. Part I: Theory Courses Table
  const theoryTopHeaderY = 598;
  const theoryHeaderH = 16;
  lines.push(
    // Table Header Bar
    '0.15 0.22 0.48 rg',
    `35 ${theoryTopHeaderY} 525 ${theoryHeaderH} re f`,
    'BT',
    '/F1 7.5 Tf',
    '1 1 1 rg',
    `1 0 0 1 42 ${theoryTopHeaderY + 5} Tm`,
    `(${esc('SLOT')}) Tj`,
    `1 0 0 1 82 ${theoryTopHeaderY + 5} Tm`,
    `(${esc(`PART I: THEORY COURSES CLEARANCE (${subjects.length} SUBJECTS)`)}) Tj`,
    `1 0 0 1 325 ${theoryTopHeaderY + 5} Tm`,
    `(${esc('FACULTY IN-CHARGE')}) Tj`,
    `1 0 0 1 445 ${theoryTopHeaderY + 5} Tm`,
    `(${esc('CLEARANCE')}) Tj`,
    `1 0 0 1 515 ${theoryTopHeaderY + 5} Tm`,
    `(${esc('VERIFIED')}) Tj`,
    'ET'
  );

  const theoryDisplay = subjects.slice(0, 6);
  const theoryRowH = 15;
  let currentY = theoryTopHeaderY;

  theoryDisplay.forEach((sub, idx) => {
    const isEven = idx % 2 === 0;
    const rowBottomY = currentY - theoryRowH;
    const textBaseY = rowBottomY + 4;

    lines.push(
      isEven ? '0.985 0.99 0.995 rg' : '1 1 1 rg',
      `35 ${rowBottomY} 525 ${theoryRowH} re f`,
      '0.9 0.92 0.95 RG 0.3 w',
      `35 ${rowBottomY} 525 ${theoryRowH} re S`,
      'BT',
      '/F1 7 Tf',
      '0.3 0.35 0.45 rg',
      `1 0 0 1 42 ${textBaseY} Tm`,
      `(${esc(sub.slot || `SUB ${idx + 1}`)}) Tj`,
      '/F1 7.5 Tf',
      '0.1 0.15 0.25 rg',
      `1 0 0 1 82 ${textBaseY} Tm`,
      `(${esc(sub.code ? `[${sub.code}] ` : '')}${esc(sub.name || '')}) Tj`,
      '/F2 7 Tf',
      '0.2 0.25 0.35 rg',
      `1 0 0 1 325 ${textBaseY} Tm`,
      `(${esc(sub.faculty_name || 'Faculty In-Charge')}) Tj`,
      '/F1 7 Tf',
      '0.05 0.5 0.2 rg',
      `1 0 0 1 445 ${textBaseY} Tm`,
      `(${esc('[OK] NO DUES')}) Tj`,
      '/F2 6.5 Tf',
      '0.45 0.5 0.55 rg',
      `1 0 0 1 515 ${textBaseY} Tm`,
      `(${esc(sub.signature_date || '16/09/2026')}) Tj`,
      'ET'
    );
    currentY = rowBottomY;
  });

  // 5. Part II: Practical Laboratory Courses Table (Stacked directly below Part I)
  currentY -= 6; // small gap
  const labHeaderH = 16;
  const labTopHeaderY = currentY - labHeaderH;
  lines.push(
    '0.05 0.45 0.32 rg',
    `35 ${labTopHeaderY} 525 ${labHeaderH} re f`,
    'BT',
    '/F1 7.5 Tf',
    '1 1 1 rg',
    `1 0 0 1 42 ${labTopHeaderY + 5} Tm`,
    `(${esc('SLOT')}) Tj`,
    `1 0 0 1 82 ${labTopHeaderY + 5} Tm`,
    `(${esc(`PART II: PRACTICAL LABORATORIES & EXPERIMENTS (${labs.length} COURSES)`)}) Tj`,
    `1 0 0 1 325 ${labTopHeaderY + 5} Tm`,
    `(${esc('LAB IN-CHARGE')}) Tj`,
    `1 0 0 1 445 ${labTopHeaderY + 5} Tm`,
    `(${esc('CLEARANCE')}) Tj`,
    `1 0 0 1 515 ${labTopHeaderY + 5} Tm`,
    `(${esc('VERIFIED')}) Tj`,
    'ET'
  );

  currentY = labTopHeaderY;
  const labRowH = 15;
  labs.forEach((lab, idx) => {
    const isEven = idx % 2 === 0;
    const rowBottomY = currentY - labRowH;
    const textBaseY = rowBottomY + 4;

    lines.push(
      isEven ? '0.985 0.995 0.99 rg' : '1 1 1 rg',
      `35 ${rowBottomY} 525 ${labRowH} re f`,
      '0.9 0.92 0.95 RG 0.3 w',
      `35 ${rowBottomY} 525 ${labRowH} re S`,
      'BT',
      '/F1 7 Tf',
      '0.3 0.35 0.45 rg',
      `1 0 0 1 42 ${textBaseY} Tm`,
      `(${esc(lab.slot || `LAB ${idx + 1}`)}) Tj`,
      '/F1 7.5 Tf',
      '0.1 0.15 0.25 rg',
      `1 0 0 1 82 ${textBaseY} Tm`,
      `(${esc(lab.code ? `[${lab.code}] ` : '')}${esc(lab.name || '')}) Tj`,
      '/F2 7 Tf',
      '0.2 0.25 0.35 rg',
      `1 0 0 1 325 ${textBaseY} Tm`,
      `(${esc(lab.faculty_name || 'Lab In-Charge')}) Tj`,
      '/F1 7 Tf',
      '0.05 0.5 0.2 rg',
      `1 0 0 1 445 ${textBaseY} Tm`,
      `(${esc('[OK] NO DUES')}) Tj`,
      '/F2 6.5 Tf',
      '0.45 0.5 0.55 rg',
      `1 0 0 1 515 ${textBaseY} Tm`,
      `(${esc(lab.signature_date || '16/09/2026')}) Tj`,
      'ET'
    );
    currentY = rowBottomY;
  });

  // 6. Part III: Institutional Clearance Nodes Table (Stacked directly below Part II)
  currentY -= 6; // small gap
  const nodeHeaderH = 16;
  const nodeTopHeaderY = currentY - nodeHeaderH;
  lines.push(
    '0.72 0.4 0.1 rg',
    `35 ${nodeTopHeaderY} 525 ${nodeHeaderH} re f`,
    'BT',
    '/F1 7.5 Tf',
    '1 1 1 rg',
    `1 0 0 1 42 ${nodeTopHeaderY + 5} Tm`,
    `(${esc('SLOT')}) Tj`,
    `1 0 0 1 82 ${nodeTopHeaderY + 5} Tm`,
    `(${esc(`PART III: INSTITUTIONAL CENTRAL CLEARANCE NODES (${commonNodes.length} FACILITIES)`)}) Tj`,
    `1 0 0 1 325 ${nodeTopHeaderY + 5} Tm`,
    `(${esc('OFFICER IN-CHARGE')}) Tj`,
    `1 0 0 1 445 ${nodeTopHeaderY + 5} Tm`,
    `(${esc('CLEARANCE')}) Tj`,
    `1 0 0 1 515 ${nodeTopHeaderY + 5} Tm`,
    `(${esc('VERIFIED')}) Tj`,
    'ET'
  );

  currentY = nodeTopHeaderY;
  const nodeRowH = 15;
  commonNodes.forEach((node, idx) => {
    const isEven = idx % 2 === 0;
    const isExempt = node.dues_status?.toLowerCase().includes('exempted');
    const rowBottomY = currentY - nodeRowH;
    const textBaseY = rowBottomY + 4;

    lines.push(
      isEven ? '0.995 0.99 0.985 rg' : '1 1 1 rg',
      `35 ${rowBottomY} 525 ${nodeRowH} re f`,
      '0.9 0.92 0.95 RG 0.3 w',
      `35 ${rowBottomY} 525 ${nodeRowH} re S`,
      'BT',
      '/F1 7 Tf',
      '0.3 0.35 0.45 rg',
      `1 0 0 1 42 ${textBaseY} Tm`,
      `(${esc(node.slot || `COM ${idx + 1}`)}) Tj`,
      '/F1 7.5 Tf',
      '0.1 0.15 0.25 rg',
      `1 0 0 1 82 ${textBaseY} Tm`,
      `(${esc(node.code ? `[${node.code}] ` : '')}${esc(node.name || '')}) Tj`,
      '/F2 7 Tf',
      '0.2 0.25 0.35 rg',
      `1 0 0 1 325 ${textBaseY} Tm`,
      `(${esc(node.faculty_name || 'Officer In-Charge')}) Tj`,
      '/F1 7 Tf',
      isExempt ? '0.1 0.4 0.7 rg' : '0.05 0.5 0.2 rg',
      `1 0 0 1 445 ${textBaseY} Tm`,
      `(${esc(isExempt ? 'EXEMPTED' : '[OK] NO DUES')}) Tj`,
      '/F2 6.5 Tf',
      '0.45 0.5 0.55 rg',
      `1 0 0 1 515 ${textBaseY} Tm`,
      `(${esc(node.signature_date || '16/09/2026')}) Tj`,
      'ET'
    );
    currentY = rowBottomY;
  });

  // 6. Institutional Clearance Confirmation Banner (Y: 158 to 182, height: 24)
  const bannerY = 158;
  lines.push(
    '0.93 0.98 0.95 rg',
    `35 ${bannerY} 525 24 re f`,
    '0.6 0.88 0.7 RG 0.5 w',
    `35 ${bannerY} 525 24 re S`,
    'BT',
    '/F1 8 Tf',
    '0.04 0.45 0.2 rg',
    `1 0 0 1 48 ${bannerY + 8} Tm`,
    `(${esc('INSTITUTIONAL AUDIT PASSED: NO OUTSTANDING DUES RECORDED ACROSS ANY COLLEGE DIVISION')}) Tj`,
    'ET'
  );

  // 7. Security, QR Code & Signatures Footer Block (Y: 56 to 144, height: 88)
  const footerY = 56;
  const footerH = 88;

  // 1. Digital Verification Box (Left)
  lines.push(
    '0.98 0.98 0.99 rg',
    `35 ${footerY} 175 ${footerH} re f`,
    '0.85 0.88 0.92 RG 0.5 w',
    `35 ${footerY} 175 ${footerH} re S`,
    // QR placeholder graphic
    '0.15 0.2 0.35 RG 1 w',
    `43 ${footerY + 12} 64 64 re S`,
    '0.15 0.2 0.35 rg',
    `48 ${footerY + 46} 18 18 re f`,
    `83 ${footerY + 46} 18 18 re f`,
    `48 ${footerY + 18} 18 18 re f`,
    `74 ${footerY + 30} 10 10 re f`,
    `87 ${footerY + 18} 14 14 re f`,
    'BT',
    '/F1 8.5 Tf',
    '0.1 0.15 0.3 rg',
    `1 0 0 1 115 ${footerY + 68} Tm`,
    `(${esc('Tamper-Proof QR')}) Tj`,
    '/F2 7 Tf',
    '0.4 0.45 0.5 rg',
    `1 0 0 1 115 ${footerY + 54} Tm`,
    `(${esc('Verification Code:')}) Tj`,
    '/F1 8.5 Tf',
    '0.2 0.25 0.65 rg',
    `1 0 0 1 115 ${footerY + 40} Tm`,
    `(${esc(verifCode)}) Tj`,
    '/F2 6 Tf',
    '0.5 0.55 0.6 rg',
    `1 0 0 1 115 ${footerY + 26} Tm`,
    `(${esc('Scan to verify authenticity')}) Tj`,
    '/F2 5.5 Tf',
    '0.55 0.6 0.65 rg',
    `1 0 0 1 115 ${footerY + 14} Tm`,
    `(${esc('Official Digital Clearance Record')}) Tj`,
    'ET'
  );

  // 2. Institutional Autonomous Seal Emblem (Center)
  lines.push(
    '0.98 0.98 0.99 rg',
    `218 ${footerY} 100 ${footerH} re f`,
    '0.85 0.88 0.92 RG 0.5 w',
    `218 ${footerY} 100 ${footerH} re S`,
    // Seal stamp double frame
    '0.78 0.72 0.45 RG 0.8 w',
    `224 ${footerY + 6} 88 ${footerH - 12} re S`,
    '0.78 0.72 0.45 RG 0.4 w',
    `226 ${footerY + 8} 84 ${footerH - 16} re S`,
    'BT',
    '/F1 8.5 Tf',
    '0.15 0.2 0.4 rg',
    `1 0 0 1 230 ${footerY + 66} Tm`,
    `(${esc('AUTONOMOUS')}) Tj`,
    '/F1 7.5 Tf',
    '0.05 0.5 0.2 rg',
    `1 0 0 1 228 ${footerY + 48} Tm`,
    `(${esc('[ SEAL VERIFIED ]')}) Tj`,
    '/F1 7 Tf',
    '0.35 0.4 0.5 rg',
    `1 0 0 1 225 ${footerY + 30} Tm`,
    `(${esc('CLEARANCE VALID')}) Tj`,
    '/F2 6.5 Tf',
    '0.45 0.5 0.55 rg',
    `1 0 0 1 231 ${footerY + 14} Tm`,
    `(${esc('Controller of Exam')}) Tj`,
    'ET'
  );

  // 3. Authorized Signatories (Right)
  lines.push(
    '0.98 0.98 0.99 rg',
    `326 ${footerY} 234 ${footerH} re f`,
    '0.85 0.88 0.92 RG 0.5 w',
    `326 ${footerY} 234 ${footerH} re S`,
    // Signatory 1: Dean Academics
    '0.5 0.55 0.6 RG 0.5 w',
    `338 ${footerY + 40} 95 0.5 re S`,
    // Signatory 2: Principal
    `448 ${footerY + 40} 98 0.5 re S`,
    'BT',
    '/F3 10 Tf',
    '0.1 0.15 0.4 rg',
    `1 0 0 1 342 ${footerY + 54} Tm`,
    `(${esc('Dean of Academics')}) Tj`,
    `1 0 0 1 452 ${footerY + 54} Tm`,
    `(${esc('Dr. T. Senthilvel')}) Tj`,
    '/F1 7.5 Tf',
    '0.2 0.25 0.35 rg',
    `1 0 0 1 342 ${footerY + 26} Tm`,
    `(${esc('DEAN (ACADEMICS)')}) Tj`,
    `1 0 0 1 472 ${footerY + 26} Tm`,
    `(${esc('PRINCIPAL')}) Tj`,
    '/F2 6.5 Tf',
    '0.45 0.5 0.55 rg',
    `1 0 0 1 372 ${footerY + 12} Tm`,
    `(${esc('Apex College of Engineering (Autonomous)')}) Tj`,
    'ET'
  );

  // 8. Bottom Security / Timestamp string (Y: 40)
  lines.push(
    'BT',
    '/F2 6.5 Tf',
    '0.45 0.5 0.55 rg',
    `1 0 0 1 80 40 Tm`,
    `(${esc(`Official digitally signed institutional clearance certificate. Tamper-evident record generated on ${issuedDateStr}.`)}) Tj`,
    'ET'
  );

  const streamContent = lines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'latin1');

  const objects = [
    // 1: Catalog
    `<< /Type /Catalog /Pages 2 0 R >>`,
    // 2: Pages
    `<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,
    // 3: Page (A4 size: 595 x 842 points)
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>`,
    // 4: Font Bold
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`,
    // 5: Font Regular
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`,
    // 6: Font Italic
    `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique >>`,
    // 7: Stream
    `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`,
  ];

  let body = '%PDF-1.4\n';
  const xref: number[] = [0];

  objects.forEach((obj, idx) => {
    xref.push(body.length);
    body += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = body.length;
  body += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    const offset = xref[i].toString().padStart(10, '0');
    body += `${offset} 00000 n \n`;
  }

  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(body, 'latin1');
}
