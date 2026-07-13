import Link from "next/link";
import { Shield, Eye, Database, Lock, AlertCircle, History, Fingerprint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="size-5 text-primary shrink-0" />
          ความเป็นส่วนตัว
        </h1>
        <p className="text-xs text-muted-foreground">
          นโยบายความเป็นส่วนตัวและสิทธิ์ในการควบคุมข้อมูลของท่าน
        </p>
      </div>

      {/* Main Statement Card */}
      <Card className="border border-primary/10 bg-accent/20">
        <CardContent className="space-y-3 py-4 text-sm text-foreground/90 leading-relaxed font-sans">
          HealthCoach เก็บบันทึกการกิน การนอน และการเคลื่อนไหวที่คุณกรอกเอง เพื่อแสดง pattern และให้คำแนะนำสำหรับคุณเท่านั้น ข้อมูลของคุณไม่ถูกแชร์ให้ผู้ใช้คนอื่นหรือบุคคลที่สาม คุณแก้ไขหรือลบข้อมูลทั้งหมดได้ทุกเมื่อจากหน้านี้ ระบบนี้เป็นผู้ช่วยดูแลสุขภาพทั่วไป ไม่ใช่บริการทางการแพทย์
        </CardContent>
      </Card>

      {/* Table: Collected Data */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="size-4 text-primary shrink-0" />
            ประเภทข้อมูลที่จัดเก็บ
          </CardTitle>
          <CardDescription className="text-xs">
            เราจัดเก็บเฉพาะข้อมูลที่จำเป็นเพื่อทำหน้าที่ช่วยวิเคราะห์สุขภาพทั่วไปของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2 pr-2 font-medium w-1/4">ข้อมูล</th>
                  <th className="py-2 pr-2 font-medium w-1/4">จัดเป็น</th>
                  <th className="py-2 font-medium w-2/4">เก็บเพื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-foreground/80">
                <tr className="align-top">
                  <td className="py-2.5 pr-2 font-medium font-mono text-[11px] text-foreground">email</td>
                  <td className="py-2.5 pr-2">ข้อมูลส่วนบุคคล</td>
                  <td className="py-2.5">login เท่านั้น</td>
                </tr>
                <tr className="align-top">
                  <td className="py-2.5 pr-2 font-medium text-foreground">
                    display_name, สถานะ, วันเรียนเช้า, ข้อจำกัด
                  </td>
                  <td className="py-2.5 pr-2">ข้อมูลส่วนบุคคล/บริบท</td>
                  <td className="py-2.5">personalize คำแนะนำ</td>
                </tr>
                <tr className="align-top">
                  <td className="py-2.5 pr-2 font-medium text-foreground">
                    check-in (กิน นอน เคลื่อนไหว พลังงาน disruptor)
                  </td>
                  <td className="py-2.5 pr-2">ข้อมูลสุขภาพ</td>
                  <td className="py-2.5">pattern analysis, dashboard, reflection</td>
                </tr>
                <tr className="align-top">
                  <td className="py-2.5 pr-2 font-medium text-foreground">ประวัติแชทกับ coach</td>
                  <td className="py-2.5 pr-2">ข้อมูลสุขภาพ</td>
                  <td className="py-2.5">ความต่อเนื่องของบทสนทนา</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Minimization Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Eye className="size-4 text-primary shrink-0" />
            ข้อมูลที่ไม่มีการจัดเก็บ (Data Minimization)
          </CardTitle>
          <CardDescription className="text-xs">
            เพื่อลดความกดดันด้านรูปร่างและโฟกัสที่พฤติกรรมทั่วไป ระบบจึงจงใจไม่จัดเก็บ:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-2 gap-2 text-xs text-muted-foreground list-disc pl-4">
            <li>น้ำหนัก</li>
            <li>ส่วนสูง</li>
            <li>ดัชนีมวลกาย (BMI)</li>
            <li>ปริมาณแคลอรี</li>
            <li>รูปถ่ายร่างกาย/อาหาร</li>
            <li>ตำแหน่งที่อยู่</li>
          </ul>
        </CardContent>
      </Card>

      {/* Technical Protections */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Lock className="size-4 text-primary shrink-0" />
            การป้องกันทางเทคนิค
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">แยกแยะสิทธิ์อย่างเข้มงวด (RLS):</strong> ข้อมูลทั้งหมดควบคุมผ่านนโยบาย Supabase Row Level Security (RLS) แยกสิทธิ์ผู้ใช้ของแต่ละรายอย่างสมบูรณ์แบบ แม้ระบบมีบั๊กก็ไม่สามารถข้ามไปดูข้อมูลผู้อื่นได้
          </p>
          <p>
            <strong className="text-foreground">สิทธิ์การเข้าถึงของ AI:</strong> Gemini ได้รับส่งเฉพาะข้อมูลบันทึกพฤติกรรมรายวันของคุณในการประมวลผลเท่านั้น โดยไม่มีการส่งชื่อจริงหรืออีเมลของคุณไปประมวลผลร่วมด้วย และระบบจะไม่มีการใช้ข้อมูลบันทึกของคุณในโปรเจกต์นี้เพื่อการเทรนโมเดลเพิ่มเติม
          </p>
          <p>
            <strong className="text-foreground">ความปลอดภัยระดับสากล:</strong> Secrets และ Key ต่างๆ จะจัดเก็บอยู่บนฝั่ง Server ทั้งหมด พร้อมการเข้ารหัสความปลอดภัยของการส่งข้อมูลผ่าน HTTPS
          </p>
        </CardContent>
      </Card>

      {/* Anonymization & Aggregation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Fingerprint className="size-4 text-primary shrink-0" />
            การระบุตัวตนและการรวมข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">ข้อมูลผูกกับบัญชีของคุณ ไม่ได้ anonymize:</strong> เพราะระบบต้องดึงบันทึกของคุณกลับมาแสดง pattern ให้คุณเห็น ถ้าตัดตัวตนออกจากฐานข้อมูล ระบบจะไม่รู้ว่าบันทึกไหนเป็นของใคร — และไม่มีจุดใดในต้นแบบนี้ที่นำข้อมูลของผู้ใช้หลายคนมารวมกัน (aggregate)
          </p>
          <p>
            <strong className="text-foreground">ไม่มี dashboard สำหรับองค์กรหรือมหาวิทยาลัย:</strong> ต้นแบบนี้ไม่มีมุมมองภาพรวมให้บุคคลที่สามดูข้อมูลของคุณ หากมีในอนาคต ต้องเป็นค่าเฉลี่ยของกลุ่มขนาดใหญ่ (อย่างน้อย 20 คน) เท่านั้น และห้ามเจาะดูรายบุคคลไม่ว่ากรณีใด
          </p>
        </CardContent>
      </Card>

      {/* User Rights & Actions */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="size-4 text-primary shrink-0" />
            สิทธิ์การจัดการข้อมูล
          </CardTitle>
          <CardDescription className="text-xs">
            คุณเป็นเจ้าของข้อมูลและมีสิทธิ์ตรวจสอบ แก้ไข หรือลบข้อมูลตัวเองได้ทุกเมื่อ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pb-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            สามารถเข้าไปที่หน้าประวัติบันทึกรายวัน เพื่อดูรายการบันทึกของตัวเอง แก้ไข หรือลบข้อมูลการเช็กอินของแต่ละวันย้อนหลังได้ด้วยตนเอง
          </p>
          <div className="pt-1.5">
            <Link
              href="/checkin/history"
              className={buttonVariants({ variant: "outline", className: "w-full flex items-center justify-center gap-2" })}
            >
              <History className="size-4" />
              ดู แก้ไข หรือลบบันทึกของฉัน
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
