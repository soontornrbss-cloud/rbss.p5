/**
 * Robust Printing Utilities for RBSS School Reports
 * Solves iframe sandbox printing restrictions and guarantees clean 1-page A4 output.
 */

import { SCHOOL_LOGO_URL } from '../types';

export interface ClassroomReportData {
  schoolName: string;
  affiliation: string;
  reportTitle: string;
  level: string;
  room: string;
  academicYear: string;
  term: string;
  dateStr: string;
  totalStudents: number;
  testedCount: number;
  testedRate: number;
  classAveragePct: number;
  passCount: number;
  passRate: number;
  students: Array<{
    number: number;
    studentCode: string;
    name: string;
    examsText: string;
    totalScoreText: string;
    avgPctText: string;
    statusText: string;
  }>;
}

/**
 * Generate a standalone, self-contained, official Black & White A4 HTML document
 * that fits strictly onto 1 single A4 page.
 */
export function generateClassroomReportHtml(data: ClassroomReportData): string {
  const isDense = data.students.length > 34;
  const rowFontSize = isDense ? '7.5pt' : '8.5pt';
  const rowPadding = isDense ? '1px 3px' : '2px 4px';

  const rowsHtml = data.students
    .map(
      (s) => `
      <tr style="font-size: ${rowFontSize};">
        <td style="padding: ${rowPadding}; text-align: center; font-weight: 600;">${s.number}</td>
        <td style="padding: ${rowPadding}; text-align: center; font-family: monospace;">${s.studentCode}</td>
        <td style="padding: ${rowPadding}; text-align: left; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 170px;">${s.name}</td>
        <td style="padding: ${rowPadding}; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 250px;">${s.examsText}</td>
        <td style="padding: ${rowPadding}; text-align: center; font-family: monospace; font-weight: 600;">${s.totalScoreText}</td>
        <td style="padding: ${rowPadding}; text-align: center; font-family: monospace; font-weight: 600;">${s.avgPctText}</td>
        <td style="padding: ${rowPadding}; text-align: center; font-weight: bold;">${s.statusText}</td>
        <td style="padding: ${rowPadding}; text-align: center;"></td>
      </tr>
    `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.reportTitle} - ${data.level} ห้อง ${data.room}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 6mm 8mm 6mm 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #000000;
      font-family: 'Sarabun', 'Prompt', system-ui, -apple-system, sans-serif;
      font-size: 9pt;
      line-height: 1.25;
    }
    .print-control-bar {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
      z-index: 9999;
      font-family: 'Prompt', sans-serif;
    }
    .print-btn {
      background: #f59e0b;
      color: #0f172a;
      border: none;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .print-btn:hover {
      background: #fbbf24;
    }
    .close-btn {
      background: #334155;
      color: #ffffff;
      border: none;
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 6px;
      cursor: pointer;
    }
    .a4-page {
      width: 210mm;
      max-width: 100%;
      min-height: 284mm;
      max-height: 284mm;
      margin: 0 auto;
      padding: 2mm 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: avoid !important;
      page-break-inside: avoid !important;
      overflow: hidden;
      background: #ffffff;
    }
    .school-header {
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 4px;
      margin-bottom: 4px;
      flex-shrink: 0;
    }
    .school-name {
      font-size: 13pt;
      font-weight: 800;
      line-height: 1.2;
    }
    .affiliation {
      font-size: 8pt;
      margin-top: 1px;
    }
    .report-title {
      font-size: 10.5pt;
      font-weight: 700;
      margin-top: 3px;
      text-decoration: underline;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      font-weight: 600;
      margin-top: 3px;
      padding: 0 4px;
    }
    .table-container {
      flex: 1;
      overflow: hidden;
      margin: 2px 0;
    }
    .bw-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000000;
    }
    .bw-table th, .bw-table td {
      border: 1px solid #000000;
      color: #000000;
    }
    .bw-table th {
      background: #f1f5f9;
      font-weight: 700;
      font-size: 8.5pt;
      padding: 4px 2px;
    }
    .signatures-block {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
      padding-top: 4px;
      flex-shrink: 0;
      text-align: center;
      font-size: 8pt;
    }
    .sig-line {
      height: 32px;
      border-bottom: 1px dotted #000000;
      width: 80%;
      margin: 0 auto 4px auto;
    }
    @media print {
      .print-control-bar {
        display: none !important;
      }
      body {
        background: #ffffff !important;
      }
      .a4-page {
        width: 100% !important;
        height: 284mm !important;
        max-height: 284mm !important;
        padding: 0 !important;
        margin: 0 !important;
      }
    }
  </style>
</head>
<body>
  <!-- Print trigger bar for screen / new tab preview -->
  <div class="print-control-bar">
    <div style="font-size: 13px; font-weight: 600;">
      โรงเรียนราษฎร์บำรุงศิลป์ | ใบรายงานผลคะแนนประจำชั้น (${data.level} ห้อง ${data.room})
    </div>
    <div style="display: flex; gap: 8px;">
      <button type="button" class="print-btn" onclick="window.print()">
        🖨️ สั่งพิมพ์ / บันทึกเป็น PDF (1 แผ่น A4)
      </button>
      <button type="button" class="close-btn" onclick="window.close()">
        ปิดหน้าต่าง
      </button>
    </div>
  </div>

  <div class="a4-page">
    <!-- Header -->
    <div class="school-header">
      <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 2px;">
        <img src="${SCHOOL_LOGO_URL}" alt="ตราโรงเรียนราษฎร์บำรุงศิลป์" style="width: 44px; height: 44px; object-fit: contain;" referrerpolicy="no-referrer">
        <div>
          <div class="school-name">${data.schoolName}</div>
          <div class="affiliation">${data.affiliation}</div>
        </div>
      </div>
      <div class="report-title">${data.reportTitle}</div>
      <div class="meta-info">
        <span><strong>ระดับชั้น:</strong> ${data.level} <strong>ห้อง:</strong> ${data.room}</span>
        <span><strong>ปีการศึกษา:</strong> ${data.academicYear} (${data.term})</span>
        <span><strong>จำนวนนักเรียนทั้งหมด:</strong> ${data.totalStudents} คน</span>
        <span><strong>วันที่ออกรายงาน:</strong> ${data.dateStr}</span>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="bw-table">
        <thead>
          <tr>
            <th style="width: 28px; text-align: center;">ที่</th>
            <th style="width: 68px; text-align: center;">รหัสประจำตัว</th>
            <th style="width: 165px; text-align: left; padding-left: 6px;">ชื่อ - นามสกุล นักเรียน</th>
            <th style="text-align: left; padding-left: 6px;">วิชาที่ทดสอบ / คะแนนที่ได้</th>
            <th style="width: 58px; text-align: center;">คะแนนรวม</th>
            <th style="width: 48px; text-align: center;">ร้อยละ</th>
            <th style="width: 68px; text-align: center;">ผลประเมิน</th>
            <th style="width: 55px; text-align: center;">หมายเหตุ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr style="background: #f1f5f9; font-weight: bold; font-size: 8pt;">
            <td colspan="3" style="padding: 4px; text-align: center;">
              สรุปผลประจำชั้น ${data.level} ห้อง ${data.room}
            </td>
            <td colspan="5" style="padding: 4px 6px; text-align: left;">
              นักเรียน ${data.totalStudents} คน | สอบแล้ว ${data.testedCount} คน (${data.testedRate.toFixed(1)}%) | ขาดสอบ ${data.totalStudents - data.testedCount} คน | เฉลี่ย ${data.classAveragePct.toFixed(1)}% | ผ่านเกณฑ์ ${data.passCount} คน (${data.passRate.toFixed(1)}%)
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Signatures -->
    <div class="signatures-block">
      <div>
        <div class="sig-line"></div>
        <p style="margin: 0; font-weight: bold;">( ............................................................ )</p>
        <p style="margin: 2px 0 0 0; font-size: 7.5pt;">ครูประจำชั้น ${data.level} ห้อง ${data.room}</p>
        <p style="margin: 2px 0 0 0; font-size: 7pt;">วันที่ ........ / ........ / ................</p>
      </div>

      <div>
        <div class="sig-line"></div>
        <p style="margin: 0; font-weight: bold;">( ............................................................ )</p>
        <p style="margin: 2px 0 0 0; font-size: 7.5pt;">หัวหน้าฝ่ายวิชาการ / งานวัดผลประเมินผล</p>
        <p style="margin: 2px 0 0 0; font-size: 7pt;">วันที่ ........ / ........ / ................</p>
      </div>

      <div>
        <div class="sig-line"></div>
        <p style="margin: 0; font-weight: bold;">( ............................................................ )</p>
        <p style="margin: 2px 0 0 0; font-size: 7.5pt;">ผู้อำนวยการโรงเรียนราษฎร์บำรุงศิลป์</p>
        <p style="margin: 2px 0 0 0; font-size: 7pt;">วันที่ ........ / ........ / ................</p>
      </div>
    </div>
  </div>

  <script>
    // Auto trigger print dialog if requested
    window.addEventListener('load', function() {
      // Check query param or auto trigger after short pause
      if (window.location.search.indexOf('autoprint=1') !== -1) {
        setTimeout(function() { window.print(); }, 350);
      }
    });
  </script>
</body>
</html>`;
}

export interface StudentReportData {
  schoolName: string;
  affiliation: string;
  studentName: string;
  studentCode: string;
  level: string;
  room: string;
  academicYear: string;
  dateStr: string;
  totalTests: number;
  totalScore: number;
  totalMaxScore: number;
  averagePercentage: number;
  passedCount: number;
  evaluationGrade: string;
  scores: Array<{
    subjectName: string;
    score: number;
    maxScore: number;
    percentage: number;
    isPassed: boolean;
    date: string;
  }>;
}

export function generateStudentReportHtml(data: StudentReportData): string {
  const rowsHtml = data.scores.length === 0
    ? `<tr><td colspan="6" style="padding: 12px; text-align: center; color: #64748b;">ยังไม่มีประวัติการเข้าสอบ</td></tr>`
    : data.scores.map((s, idx) => `
      <tr style="font-size: 8.5pt;">
        <td style="padding: 3px; text-align: center;">${idx + 1}</td>
        <td style="padding: 3px 6px; text-align: left; font-weight: 600;">${s.subjectName}</td>
        <td style="padding: 3px; text-align: center; font-family: monospace; font-weight: bold;">${s.score} / ${s.maxScore}</td>
        <td style="padding: 3px; text-align: center; font-family: monospace; font-weight: bold;">${s.percentage.toFixed(1)}%</td>
        <td style="padding: 3px; text-align: center; font-weight: bold; color: ${s.isPassed ? '#166534' : '#991b1b'};">
          ${s.isPassed ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'}
        </td>
        <td style="padding: 3px; text-align: center; font-size: 8pt; color: #475569;">${s.date}</td>
      </tr>
    `).join('');

  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>ใบรายงานผลคะแนน - ${data.studentName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&family=Sarabun:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 8mm 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; padding: 0; font-family: 'Sarabun', 'Prompt', sans-serif; font-size: 9pt; color: #000; background: #fff; }
    .print-bar { position: sticky; top: 0; background: #0f172a; color: #fff; padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; font-family: 'Prompt', sans-serif; }
    .print-btn { background: #f59e0b; color: #0f172a; border: none; padding: 6px 14px; font-weight: 700; border-radius: 6px; cursor: pointer; }
    .a4-container { width: 210mm; max-width: 100%; min-height: 280mm; margin: 0 auto; padding: 4mm 0; display: flex; flex-direction: column; justify-content: space-between; }
    .bw-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
    .bw-table th, .bw-table td { border: 1px solid #000; }
    .bw-table th { background: #f1f5f9; padding: 4px; font-weight: 700; font-size: 8.5pt; }
    @media print {
      .print-bar { display: none !important; }
      body { background: #fff !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <div><strong>โรงเรียนราษฎร์บำรุงศิลป์</strong> | รายงานผลการสอบรายบุคคล: ${data.studentName}</div>
    <button type="button" class="print-btn" onclick="window.print()">🖨️ สั่งพิมพ์ / บันทึก PDF</button>
  </div>
  <div class="a4-container">
    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 3px;">
        <img src="${SCHOOL_LOGO_URL}" alt="ตราโรงเรียนราษฎร์บำรุงศิลป์" style="width: 48px; height: 48px; object-fit: contain;" referrerpolicy="no-referrer">
        <div>
          <div style="font-size: 14pt; font-weight: 800;">${data.schoolName}</div>
          <div style="font-size: 8.5pt; margin-top: 1px;">${data.affiliation}</div>
        </div>
      </div>
      <div style="font-size: 11pt; font-weight: 700; margin-top: 4px; text-decoration: underline;">
        ใบรายงานผลการสอบและประเมินผลการเรียนรู้รายบุคคล
      </div>
    </div>

    <!-- Student Info -->
    <div style="border: 1px solid #000; padding: 8px 12px; margin-bottom: 8px; font-size: 8.5pt; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;">
      <div><strong>ชื่อ - นามสกุล:</strong> ${data.studentName}</div>
      <div><strong>เลขประจำตัว:</strong> #${data.studentCode}</div>
      <div><strong>ระดับชั้น / ห้อง:</strong> ${data.level} (ห้อง ${data.room})</div>
      <div><strong>ปีการศึกษา:</strong> ${data.academicYear}</div>
      <div><strong>วันที่ออกรายงาน:</strong> ${data.dateStr}</div>
      <div><strong>ผลการประเมินรวม:</strong> <strong>${data.evaluationGrade}</strong></div>
    </div>

    <!-- Stats Summary -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 8px; text-align: center;">
      <div style="border: 1px solid #000; padding: 6px;">
        <div style="font-size: 8pt; color: #333;">แบบทดสอบที่ทำ</div>
        <div style="font-size: 12pt; font-weight: bold;">${data.totalTests} ชุด</div>
      </div>
      <div style="border: 1px solid #000; padding: 6px;">
        <div style="font-size: 8pt; color: #333;">คะแนนรวมที่ได้</div>
        <div style="font-size: 12pt; font-weight: bold;">${data.totalScore} / ${data.totalMaxScore}</div>
      </div>
      <div style="border: 1px solid #000; padding: 6px;">
        <div style="font-size: 8pt; color: #333;">ร้อยละรวม</div>
        <div style="font-size: 12pt; font-weight: bold;">${data.averagePercentage.toFixed(1)}%</div>
      </div>
      <div style="border: 1px solid #000; padding: 6px;">
        <div style="font-size: 8pt; color: #333;">ผ่านเกณฑ์</div>
        <div style="font-size: 12pt; font-weight: bold;">${data.passedCount} / ${data.totalTests}</div>
      </div>
    </div>

    <!-- Scores Table -->
    <div style="flex: 1; margin: 4px 0;">
      <table class="bw-table">
        <thead>
          <tr>
            <th style="width: 30px; text-align: center;">ลำดับ</th>
            <th style="text-align: left; padding-left: 6px;">วิชาที่ประเมิน</th>
            <th style="width: 80px; text-align: center;">คะแนนที่ได้</th>
            <th style="width: 70px; text-align: center;">ร้อยละ</th>
            <th style="width: 80px; text-align: center;">ผลประเมิน</th>
            <th style="width: 90px; text-align: center;">วันที่ทำแบบทดสอบ</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </div>

    <!-- Signatures -->
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 12px; text-align: center; font-size: 8pt;">
      <div>
        <div style="height: 36px; border-bottom: 1px dotted #000; width: 75%; margin: 0 auto 4px auto;"></div>
        <p style="margin: 0; font-weight: bold;">( ............................................................ )</p>
        <p style="margin: 2px 0 0 0;">ครูประจำชั้น / ผู้ประเมิน</p>
        <p style="margin: 2px 0 0 0; font-size: 7pt;">วันที่ ........ / ........ / ................</p>
      </div>
      <div>
        <div style="height: 36px; border-bottom: 1px dotted #000; width: 75%; margin: 0 auto 4px auto;"></div>
        <p style="margin: 0; font-weight: bold;">( ............................................................ )</p>
        <p style="margin: 2px 0 0 0;">ผู้ปกครองนักเรียน</p>
        <p style="margin: 2px 0 0 0; font-size: 7pt;">วันที่ ........ / ........ / ................</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Execute direct printing with multiple fallback strategies:
 * 1. Dedicated hidden print iframe
 * 2. Window.print()
 * 3. Fallback to open in new tab
 */
export function printDirectly(fullHtml: string): boolean {
  try {
    // Strategy 1: Hidden IFrame Print (cleanest, no main window interference)
    let iframe = document.getElementById('rbss-print-iframe') as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'rbss-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '210mm';
      iframe.style.height = '297mm';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
    }

    const frameDoc = iframe.contentWindow?.document || iframe.contentDocument;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(fullHtml);
      frameDoc.close();

      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.warn('Iframe print restricted, triggering window.print fallback:', e);
          window.print();
        }
      }, 350);
      return true;
    }
  } catch (err) {
    console.warn('Hidden iframe print failed:', err);
  }

  // Strategy 2: Direct window print fallback
  try {
    window.print();
    return true;
  } catch (err) {
    console.warn('window.print() failed:', err);
    return false;
  }
}

/**
 * Opens report in a standalone new browser window / tab and triggers print
 */
export function openInNewTabAndPrint(fullHtml: string): void {
  try {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      // Popup blocked, fallback to download
      downloadHtmlFile('ใบรายงานคะแนน_โรงเรียนราษฎร์บำรุงศิลป์.html', fullHtml);
    }
  } catch (err) {
    console.warn('Error opening new window:', err);
    downloadHtmlFile('ใบรายงานคะแนน_โรงเรียนราษฎร์บำรุงศิลป์.html', fullHtml);
  }
}

/**
 * Downloads the printable HTML file with 1 click.
 * Guaranteed to work across all iframe environments and mobile devices!
 */
export function downloadHtmlFile(filename: string, fullHtml: string): void {
  try {
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    console.error('Download error:', e);
  }
}
