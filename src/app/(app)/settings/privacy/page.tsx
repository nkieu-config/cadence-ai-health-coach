import Link from "next/link";
import { AlertCircle, Database, Eye, Fingerprint, History, Lock, Shield } from "lucide-react";
import { PageContainer } from "@/components/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <PageContainer width="content">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="flex items-center gap-2 text-xl font-semibold lg:text-2xl">
            <Shield className="size-6 shrink-0 text-primary" />
            ความเป็นส่วนตัว
          </h1>
          <p className="text-sm text-muted-foreground">
            นโยบายความเป็นส่วนตัวและสิทธิ์ในการควบคุมข้อมูลของท่าน
          </p>
        </div>

        <Card className="border-primary/10 bg-accent/20">
          <CardContent className="text-sm leading-relaxed text-foreground">
            HealthCoach เก็บบันทึกการกิน การนอน และการเคลื่อนไหวที่คุณกรอกเอง เพื่อแสดง pattern
            และให้คำแนะนำสำหรับคุณเท่านั้น ข้อมูลของคุณไม่ถูกแชร์ให้ผู้ใช้คนอื่นหรือบุคคลที่สาม
            คุณแก้ไขหรือลบข้อมูลทั้งหมดได้ทุกเมื่อจากหน้านี้ ระบบนี้เป็นผู้ช่วยดูแลสุขภาพทั่วไป
            ไม่ใช่บริการทางการแพทย์
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="size-5 shrink-0 text-primary" />
              ประเภทข้อมูลที่จัดเก็บ
            </CardTitle>
            <CardDescription>
              เราจัดเก็บเฉพาะข้อมูลที่จำเป็นเพื่อทำหน้าที่ช่วยวิเคราะห์สุขภาพทั่วไปของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border font-medium text-muted-foreground">
                    <th className="w-1/4 py-3 pr-3 font-medium">ข้อมูล</th>
                    <th className="w-1/4 py-3 pr-3 font-medium">จัดเป็น</th>
                    <th className="w-2/4 py-3 font-medium">เก็บเพื่อ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr className="align-top">
                    <td className="py-3 pr-3 font-mono text-xs font-medium text-foreground">
                      email
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">ข้อมูลส่วนบุคคล</td>
                    <td className="py-3 text-muted-foreground">login เท่านั้น</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-3 font-medium text-foreground">
                      display_name, สถานะ, วันเรียนเช้า, ข้อจำกัด
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">ข้อมูลส่วนบุคคล/บริบท</td>
                    <td className="py-3 text-muted-foreground">personalize คำแนะนำ</td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-3 font-medium text-foreground">
                      check-in (กิน นอน เคลื่อนไหว พลังงาน disruptor)
                    </td>
                    <td className="py-3 pr-3 text-muted-foreground">ข้อมูลสุขภาพ</td>
                    <td className="py-3 text-muted-foreground">
                      pattern analysis, dashboard, reflection
                    </td>
                  </tr>
                  <tr className="align-top">
                    <td className="py-3 pr-3 font-medium text-foreground">ประวัติแชทกับ coach</td>
                    <td className="py-3 pr-3 text-muted-foreground">ข้อมูลสุขภาพ</td>
                    <td className="py-3 text-muted-foreground">ความต่อเนื่องของบทสนทนา</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-5 shrink-0 text-primary" />
              ข้อมูลที่ไม่มีการจัดเก็บ (Data Minimization)
            </CardTitle>
            <CardDescription>
              เพื่อลดความกดดันด้านรูปร่างและโฟกัสที่พฤติกรรมทั่วไป ระบบจึงจงใจไม่จัดเก็บ:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid list-disc grid-cols-2 gap-2 pl-5 text-sm text-muted-foreground">
              <li>น้ำหนัก</li>
              <li>ส่วนสูง</li>
              <li>ดัชนีมวลกาย (BMI)</li>
              <li>ปริมาณแคลอรี</li>
              <li>รูปถ่ายร่างกาย/อาหาร</li>
              <li>ตำแหน่งที่อยู่</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="size-5 shrink-0 text-primary" />
              การป้องกันทางเทคนิค
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">แยกแยะสิทธิ์อย่างเข้มงวด (RLS):</strong>{" "}
              ข้อมูลทั้งหมดควบคุมผ่านนโยบาย Supabase Row Level Security (RLS)
              แยกสิทธิ์ผู้ใช้ของแต่ละรายอย่างสมบูรณ์แบบ
              แม้ระบบมีบั๊กก็ไม่สามารถข้ามไปดูข้อมูลผู้อื่นได้
            </p>
            <p>
              <strong className="text-foreground">สิทธิ์การเข้าถึงของ AI:</strong> Gemini
              ได้รับส่งเฉพาะข้อมูลบันทึกพฤติกรรมรายวันของคุณในการประมวลผลเท่านั้น
              โดยไม่มีการส่งชื่อจริงหรืออีเมลของคุณไปประมวลผลร่วมด้วย
              และระบบจะไม่มีการใช้ข้อมูลบันทึกของคุณในโปรเจกต์นี้เพื่อการเทรนโมเดลเพิ่มเติม
            </p>
            <p>
              <strong className="text-foreground">ความปลอดภัยระดับสากล:</strong> Secrets และ Key
              ต่างๆ จะจัดเก็บอยู่บนฝั่ง Server ทั้งหมด
              พร้อมการเข้ารหัสความปลอดภัยของการส่งข้อมูลผ่าน HTTPS
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="size-5 shrink-0 text-primary" />
              การระบุตัวตนและการรวมข้อมูล
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">ข้อมูลผูกกับบัญชีของคุณ ไม่ได้ anonymize:</strong>{" "}
              เพราะระบบต้องดึงบันทึกของคุณกลับมาแสดง pattern ให้คุณเห็น ถ้าตัดตัวตนออกจากฐานข้อมูล
              ระบบจะไม่รู้ว่าบันทึกไหนเป็นของใคร —
              และไม่มีจุดใดในต้นแบบนี้ที่นำข้อมูลของผู้ใช้หลายคนมารวมกัน (aggregate)
            </p>
            <p>
              <strong className="text-foreground">
                ไม่มี dashboard สำหรับองค์กรหรือมหาวิทยาลัย:
              </strong>{" "}
              ต้นแบบนี้ไม่มีมุมมองภาพรวมให้บุคคลที่สามดูข้อมูลของคุณ หากมีในอนาคต
              ต้องเป็นค่าเฉลี่ยของกลุ่มขนาดใหญ่ (อย่างน้อย 20 คน) เท่านั้น
              และห้ามเจาะดูรายบุคคลไม่ว่ากรณีใด
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="size-5 shrink-0 text-primary" />
              สิทธิ์การจัดการข้อมูล
            </CardTitle>
            <CardDescription>
              คุณเป็นเจ้าของข้อมูลและมีสิทธิ์ตรวจสอบ แก้ไข หรือลบข้อมูลตัวเองได้ทุกเมื่อ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed text-muted-foreground">
              สามารถเข้าไปที่หน้าประวัติบันทึกรายวัน เพื่อดูรายการบันทึกของตัวเอง แก้ไข
              หรือลบข้อมูลการเช็กอินของแต่ละวันย้อนหลังได้ด้วยตนเอง
            </p>
            <Link
              href="/checkin/history"
              className={buttonVariants({
                variant: "outline",
                className: "flex w-full items-center justify-center gap-2",
              })}
            >
              <History className="size-4" />
              ดู แก้ไข หรือลบบันทึกของฉัน
            </Link>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
