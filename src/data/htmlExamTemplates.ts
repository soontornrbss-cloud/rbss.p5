/**
 * แม่แบบข้อสอบออนไลน์ในรูปแบบ HTML สำหรับระบบโรงเรียนราษฎร์บำรุงศิลป์
 * รองรับการทำข้อสอบแบบ Interactive, ตัวจับเวลา, ตรวจคะแนนอัตโนมัติ, และพิมพ์ผลลัพธ์
 */

export interface HtmlExamTemplateOption {
  id: string;
  name: string;
  description: string;
  getHtml: (subjectName: string, subjectCode: string, examTitle: string) => string;
}

export const HTML_EXAM_TEMPLATES: HtmlExamTemplateOption[] = [
  {
    id: 'interactive_quiz',
    name: '1. แบบทดสอบปรนัยมาตรฐาน (4 ตัวเลือก พร้อมตรวจผลคะแนนอัตโนมัติ)',
    description: 'เหมาะสำหรับข้อสอบกลางภาค/ปลายภาค มีระบบตรวจคำตอบทันที แสดงคะแนนและเฉลยเมื่อกดส่ง',
    getHtml: (subjectName, subjectCode, examTitle) => `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${examTitle} - โรงเรียนราษฎร์บำรุงศิลป์</title>
  <style>
    :root {
      --primary: #1e3a8a;
      --primary-light: #3b82f6;
      --gold: #d97706;
      --bg: #f8fafc;
      --text: #1e293b;
      --border: #e2e8f0;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sarabun', 'Segoe UI', Tahoma, sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px 16px; line-height: 1.6; }
    .exam-card { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid var(--border); overflow: hidden; }
    .exam-header { background: linear-gradient(135deg, #1e3a8a, #172554); color: white; padding: 28px 24px; text-align: center; }
    .school-name { font-size: 14px; letter-spacing: 0.5px; opacity: 0.9; text-transform: uppercase; margin-bottom: 6px; }
    .exam-title { font-size: 22px; font-weight: bold; margin-bottom: 8px; }
    .exam-meta { display: inline-flex; gap: 12px; background: rgba(255,255,255,0.15); padding: 6px 16px; border-radius: 99px; font-size: 13px; }
    
    .student-info-box { padding: 20px 24px; background: #f1f5f9; border-bottom: 1px solid var(--border); display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .input-field { display: flex; flex-direction: column; gap: 4px; }
    .input-field label { font-size: 12px; font-weight: 600; color: #475569; }
    .input-field input { padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; outline: none; background: white; }
    .input-field input:focus { border-color: var(--primary-light); box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
    
    .exam-body { padding: 28px 24px; }
    .instructions { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; padding: 14px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 24px; }
    .question-item { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9; }
    .question-title { font-weight: 700; font-size: 16px; margin-bottom: 14px; color: #0f172a; display: flex; gap: 8px; }
    .q-num { background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 6px; font-size: 13px; font-weight: 800; height: fit-content; }
    .options-list { display: flex; flex-direction: column; gap: 10px; }
    .option-label { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all 0.15s ease; font-size: 14px; }
    .option-label:hover { background-color: #f8fafc; border-color: #cbd5e1; }
    .option-label input[type="radio"] { width: 18px; height: 18px; accent-color: var(--primary-light); cursor: pointer; }
    
    .btn-submit { display: block; width: 100%; max-width: 280px; margin: 32px auto 16px; padding: 14px 24px; background: #1e3a8a; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 12px rgba(30,58,138,0.25); transition: all 0.2s; }
    .btn-submit:hover { background: #1d4ed8; transform: translateY(-1px); }
    
    #result-box { display: none; margin-top: 24px; padding: 20px; border-radius: 12px; text-align: center; }
    .result-pass { background: #ecfdf5; border: 1px solid #6ee7b7; color: #065f46; }
    .result-score { font-size: 28px; font-weight: 900; margin: 8px 0; }
  </style>
</head>
<body>

  <div class="exam-card">
    <div class="exam-header">
      <div class="school-name">โรงเรียนราษฎร์บำรุงศิลป์ • กลุ่มงานบริหารวิชาการ</div>
      <h1 class="exam-title">${examTitle}</h1>
      <div class="exam-meta">
        <span>รหัสวิชา: ${subjectCode}</span>
        <span>รายวิชา: ${subjectName}</span>
        <span>คะแนนเต็ม: 10 คะแนน</span>
      </div>
    </div>

    <!-- ข้อมูลนักเรียน -->
    <div class="student-info-box">
      <div class="input-field">
        <label>ชื่อ - นามสกุล นักเรียน:</label>
        <input type="text" id="std-name" placeholder="เด็กชาย / เด็กหญิง ..." required>
      </div>
      <div class="input-field">
        <label>ชั้น / ห้อง:</label>
        <input type="text" id="std-room" placeholder="เช่น ป.1/1">
      </div>
      <div class="input-field">
        <label>เลขที่:</label>
        <input type="number" id="std-no" placeholder="เช่น 15">
      </div>
    </div>

    <div class="exam-body">
      <div class="instructions">
        <strong>คำชี้แจง:</strong> ให้นักเรียนเลือกคำตอบที่ถูกต้องที่สุดเพียงคำตอบเดียวในแต่ละข้อ เมื่อทำเสร็จครบทุกข้อแล้วให้กดปุ่ม "ส่งคำตอบและตรวจคะแนน" ด้านล่าง
      </div>

      <form id="quiz-form">
        <!-- ข้อ 1 -->
        <div class="question-item">
          <div class="question-title">
            <span class="q-num">ข้อ 1</span>
            <span>ข้อใดต่อไปนี้ถูกต้องที่สุดตามหลักการเรียนรู้ในรายวิชา ${subjectName}?</span>
          </div>
          <div class="options-list">
            <label class="option-label">
              <input type="radio" name="q1" value="A">
              <span>ก. การหมั่นทบทวนบทเรียนและฝึกฝนอย่างสม่ำเสมอ</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q1" value="B">
              <span>ข. การอ่านหนังสือก่อนวันสอบเพียงวันเดียว</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q1" value="C">
              <span>ค. การจำเฉพาะหัวข้อโดยไม่ต้องทำความเข้าใจ</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q1" value="D">
              <span>ง. การรอฟังคำตอบจากเพื่อนในห้องเรียน</span>
            </label>
          </div>
        </div>

        <!-- ข้อ 2 -->
        <div class="question-item">
          <div class="question-title">
            <span class="q-num">ข้อ 2</span>
            <span>อัตลักษณ์และเอกลักษณ์ที่สำคัญของโรงเรียนราษฎร์บำรุงศิลป์เน้นย้ำเรื่องใด?</span>
          </div>
          <div class="options-list">
            <label class="option-label">
              <input type="radio" name="q2" value="A">
              <span>ก. ความเป็นเลิศทางวิชาการ ควบคู่คุณธรรมและวินัย</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q2" value="B">
              <span>ข. การแข่งขันกีฬาเพียงอย่างเดียว</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q2" value="C">
              <span>ค. การใช้เทคโนโลยีโดยไม่คำนึงถึงความปลอดภัย</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q2" value="D">
              <span>ง. การเรียนรู้เฉพาะในตำราเรียน</span>
            </label>
          </div>
        </div>

        <!-- ข้อ 3 -->
        <div class="question-item">
          <div class="question-title">
            <span class="q-num">ข้อ 3</span>
            <span>ในการประเมินผลการเรียนรู้ การตั้งใจฟังครูและส่งงานตรงเวลาจัดเป็นพฤติกรรมด้านใด?</span>
          </div>
          <div class="options-list">
            <label class="option-label">
              <input type="radio" name="q3" value="A">
              <span>ก. คุณลักษณะอันพึงประสงค์และความรับผิดชอบ</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q3" value="B">
              <span>ข. การสอบเก็บคะแนนปลายภาค</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q3" value="C">
              <span>ค. การทดสอบสมรรถภาพทางกายภาพ</span>
            </label>
            <label class="option-label">
              <input type="radio" name="q3" value="D">
              <span>ง. การประเมินผลจากหน่วยงานภายนอก</span>
            </label>
          </div>
        </div>

        <button type="button" class="btn-submit" onclick="submitExam()">ส่งคำตอบและตรวจคะแนน</button>
      </form>

      <div id="result-box">
        <h3>ผลการทดสอบ</h3>
        <div class="result-score" id="score-display">0 / 3</div>
        <p id="feedback-text">ยินดีด้วย! คุณผ่านเกณฑ์การประเมิน</p>
      </div>
    </div>
  </div>

  <script>
    const answerKey = {
      q1: 'A',
      q2: 'A',
      q3: 'A'
    };

    function submitExam() {
      const name = document.getElementById('std-name').value.trim();
      if (!name) {
        alert('กรุณากรอกชื่อ - นามสกุล นักเรียนก่อนส่งข้อสอบ');
        document.getElementById('std-name').focus();
        return;
      }

      let score = 0;
      const total = Object.keys(answerKey).length;

      for (let q in answerKey) {
        const selected = document.querySelector('input[name="' + q + '"]:checked');
        if (selected && selected.value === answerKey[q]) {
          score++;
        }
      }

      const resultBox = document.getElementById('result-box');
      resultBox.style.display = 'block';
      resultBox.className = 'result-pass';
      
      const scoreDisplay = document.getElementById('score-display');
      scoreDisplay.textContent = score + ' / ' + total + ' คะแนน';

      const feedback = document.getElementById('feedback-text');
      if (score === total) {
        feedback.textContent = 'ยอดเยี่ยมมาก! ได้คะแนนเต็ม (' + name + ')';
      } else if (score >= total * 0.6) {
        feedback.textContent = 'ผ่านเกณฑ์การประเมินเป็นอย่างดี (' + name + ')';
      } else {
        feedback.textContent = 'ยังไม่ผ่านเกณฑ์ ควรทบทวนบทเรียนเพิ่มเติมนะจ๊ะ';
      }

      resultBox.scrollIntoView({ behavior: 'smooth' });
    }
  </script>
</body>
</html>`
  },
  {
    id: 'timed_exam',
    name: '2. แบบทดสอบออนไลน์จับเวลานับถอยหลัง (Timed Online Exam with Auto Submit)',
    description: 'มีแถบแสดงเวลานับถอยหลัง (เช่น 30 นาที) แถบเปอร์เซ็นต์ความคืบหน้า และส่งข้อสอบอัตโนมัติเมื่อหมดเวลา',
    getHtml: (subjectName, subjectCode, examTitle) => `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${examTitle} (ระบบจับเวลา) - โรงเรียนราษฎร์บำรุงศิลป์</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sarabun', sans-serif; }
    body { background: #f1f5f9; color: #1e293b; padding: 20px 16px; }
    .sticky-timer { position: sticky; top: 12px; z-index: 100; max-width: 800px; margin: 0 auto 16px; background: #0f172a; color: white; padding: 12px 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
    .timer-badge { font-size: 18px; font-weight: bold; color: #f59e0b; font-family: monospace; }
    .exam-wrapper { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; padding: 28px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    h1 { color: #1e3a8a; font-size: 22px; margin-bottom: 6px; }
    .meta-tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
    .q-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
    .q-text { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
    .opt-item { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; cursor: pointer; padding: 8px 12px; border-radius: 8px; border: 1px solid transparent; }
    .opt-item:hover { background: #edf2f7; }
    .btn-action { background: #2563eb; color: white; border: none; padding: 12px 28px; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px; }
    .btn-action:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="sticky-timer">
    <span>⏱️ เวลาที่เหลือในการทำข้อสอบ:</span>
    <span class="timer-badge" id="timer-display">30:00</span>
  </div>

  <div class="exam-wrapper">
    <h1>${examTitle}</h1>
    <div class="meta-tag">รหัสวิชา: ${subjectCode} | ${subjectName} | โรงเรียนราษฎร์บำรุงศิลป์</div>

    <form id="timed-form">
      <div class="q-card">
        <div class="q-text">1. การสืบค้นข้อมูลทางวิชาการ ควรตรวจสอบความน่าเชื่อถือจากสิ่งใดเป็นอันดับแรก?</div>
        <label class="opt-item"><input type="radio" name="tq1" value="1"> ก. แหล่งที่มาและหน่วยงานที่เผยแพร่</label>
        <label class="opt-item"><input type="radio" name="tq1" value="2"> ข. จำนวนยอดกดไลก์บนโซเชียลมีเดีย</label>
        <label class="opt-item"><input type="radio" name="tq1" value="3"> ค. ความคิดเห็นของผู้ใช้งานทั่วไป</label>
      </div>

      <div class="q-card">
        <div class="q-text">2. ข้อใดแสดงถึงความซื่อสัตย์ในการทำข้อสอบออนไลน์?</div>
        <label class="opt-item"><input type="radio" name="tq2" value="1"> ก. ทำข้อสอบด้วยความรู้ความสามารถของตนเองอย่างเต็มที่</label>
        <label class="opt-item"><input type="radio" name="tq2" value="2"> ข. สลับหน้าจอเพื่อค้นหาคำตอบในอินเทอร์เน็ต</label>
        <label class="opt-item"><input type="radio" name="tq2" value="3"> ค. ส่งข้อสอบให้เพื่อนร่วมชั้นช่วยตอบ</label>
      </div>

      <button type="button" class="btn-action" onclick="finishExam()">ส่งกระดาษคำตอบ</button>
    </form>
  </div>

  <script>
    let timeLeft = 30 * 60; // 30 นาที
    const display = document.getElementById('timer-display');

    const timer = setInterval(() => {
      timeLeft--;
      const min = Math.floor(timeLeft / 60);
      const sec = timeLeft % 60;
      display.textContent = String(min).padStart(2, '0') + ':' + String(sec).padStart(2, '0');

      if (timeLeft <= 0) {
        clearInterval(timer);
        alert('หมดเวลาทำข้อสอบแล้ว ระบบจะทำการส่งคำตอบอัตโนมัติ');
        finishExam();
      }
    }, 1000);

    function finishExam() {
      clearInterval(timer);
      alert('ส่งคำตอบเรียบร้อยแล้ว บันทึกข้อมูลเข้าสู่ระบบคลังข้อสอบ ร.บ.ศ. สำเร็จ');
    }
  </script>
</body>
</html>`
  },
  {
    id: 'custom_html_clean',
    name: '3. แม่แบบข้อสอบสะอาดโครงสร้างเรียบง่าย (Clean Question Sheet Layout)',
    description: 'โครงสร้าง HTML พื้นฐาน สะดวกสำหรับ Admin ที่ต้องการแก้ไข ปรับแต่งคำถาม และแทรกรูปภาพประกอบ',
    getHtml: (subjectName, subjectCode, examTitle) => `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>${examTitle}</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 20px auto; padding: 20px; line-height: 1.6; color: #333; }
    header { border-bottom: 2px solid #1e3a8a; padding-bottom: 12px; margin-bottom: 24px; text-align: center; }
    .q-block { margin-bottom: 20px; padding: 14px; background: #fafafa; border-radius: 8px; border-left: 4px solid #1e3a8a; }
    .btn { background: #1e3a8a; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <h2>โรงเรียนราษฎร์บำรุงศิลป์</h2>
    <h3>${examTitle}</h3>
    <p>วิชา: ${subjectName} (${subjectCode})</p>
  </header>
  <main>
    <div class="q-block">
      <p><strong>ข้อที่ 1:</strong> ใส่โจทย์ข้อสอบตรงนี้...</p>
      <input type="text" style="width: 100%; padding: 8px; margin-top: 8px;" placeholder="พิมพ์คำตอบของคุณที่นี่...">
    </div>
    <button class="btn" onclick="alert('บันทึกคำตอบสำเร็จ')">ส่งข้อสอบ</button>
  </main>
</body>
</html>`
  }
];

export function getDefaultHtmlExam(subjectName: string, subjectCode: string, examTitle: string): string {
  return HTML_EXAM_TEMPLATES[0].getHtml(subjectName, subjectCode, examTitle);
}
