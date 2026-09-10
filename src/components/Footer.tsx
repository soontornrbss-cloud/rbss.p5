import React from 'react';
import { School, ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-8 mt-16 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* School Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white font-semibold text-sm">
              <School className="w-4 h-4 text-amber-400" />
              <span>โรงเรียนราษฎร์บำรุงศิลป์</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              ระบบคลังเก็บข้อสอบออนไลน์และฐานข้อมูลการวัดผลประเมินผลทางการศึกษา ระดับชั้นประถมศึกษาปีที่ 1 ถึง มัธยมศึกษาปีที่ 3
            </p>
            <p className="text-[11px] text-slate-500">
              ฝ่ายบริหารงานวิชาการ • กลุ่มสาระการเรียนรู้ 8 กลุ่มสาระ
            </p>
          </div>

          {/* Quick Guide */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>การใช้งานระบบ (Dynamic Blocks)</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li>• สลับดูข้อสอบแต่ละระดับชั้น (ป.1 - ม.3) ได้จากแถบเมนูด้านบน</li>
              <li>• กดปุ่ม <strong>"เพิ่มรายวิชา (+)"</strong> เพื่อสร้างบล็อก HTML ของรายวิชาใหม่ในระดับชั้นนั้นๆ ทันที</li>
              <li>• ในแต่ละบล็อกวิชา สามารถกด <strong>"แนบข้อสอบ"</strong> เพื่อใส่ไฟล์ PDF, Word หรือลิงก์ Google Forms พร้อมเฉลย</li>
            </ul>
          </div>

          {/* Standards & Security */}
          <div className="space-y-2 md:text-right">
            <div className="inline-flex items-center gap-1.5 text-white font-semibold text-sm md:justify-end">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>มาตรฐานการจัดเก็บข้อมูล</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              รองรับการเก็บข้อมูลในเครื่อง (Client-Side Storage) พร้อมส่งออกและนำเข้าข้อมูลสำหรับการบริหารจัดการสอบ
            </p>
            <p className="text-[11px] text-slate-500">
              © {new Date().getFullYear()} โรงเรียนราษฎร์บำรุงศิลป์ สงวนลิขสิทธิ์
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
};
