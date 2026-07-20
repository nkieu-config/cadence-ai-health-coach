import { expect, test } from "@playwright/test";

// เส้นทางเขียนข้อมูล — ถ้าพังคือแอปใช้ไม่ได้ทั้งใบ
// ใช้บัญชี demo และเป็น upsert ของ "วันนี้" → รันซ้ำได้ ไม่สร้างแถวใหม่
// (ถ้าอยากคืนค่าเดิมของปาล์ม รัน `npm run seed`)
test("เช็คอินวันนี้ — กรอกครบ 4 ขั้น แล้วบันทึกได้จริง", async ({ page }) => {
  await page.goto("/checkin");
  await page.waitForLoadState("networkidle");

  const chip = (name: string) => page.getByRole("button", { name, exact: true });

  // ฟอร์มเติมค่าเดิมจากบันทึกที่มีอยู่ → กดชิปที่ "เลือกอยู่แล้ว" = ปิดมันทิ้ง
  // เทสต์ต้องไม่ขึ้นกับสถานะเดิม ไม่งั้นผลจะเปลี่ยนไปตามว่าใครเช็คอินอะไรไว้
  const ensure = async (name: string) => {
    const target = chip(name);
    await expect(target).toBeVisible();
    if ((await target.getAttribute("aria-pressed")) !== "true") {
      await target.click();
    }
    await expect(target).toHaveAttribute("aria-pressed", "true");
  };
  const next = () => page.getByRole("button", { name: "ถัดไป" }).click();

  await ensure("2 มื้อ");

  // คำถามเสริมต้องโผล่เฉพาะเมื่อเกี่ยว — ข้ามมื้อ + เวลามื้อแรก
  await ensure("เช้า");
  await ensure("หลัง 12:00");
  await ensure("ผัก / ผลไม้");
  await ensure("3 แก้ว");
  await next();

  await ensure("5 ชม.");
  await ensure("หลัง 02:00");
  await expect(chip("อ่านสอบ"), "นอนดึก → ต้องถามเหตุผล").toBeVisible();
  await ensure("อ่านสอบ");
  await ensure("2 · ไม่ค่อยดี");
  await next();

  await ensure("เดิน");
  await ensure("20 นาที");
  await expect(chip("สดชื่นขึ้น"), "ได้ขยับ → ต้องถามความรู้สึกหลังขยับ").toBeVisible();
  await ensure("สดชื่นขึ้น");
  await next();

  await ensure("ต่ำ");
  await ensure("เดดไลน์");
  await page.getByRole("button", { name: "บันทึก" }).click();

  await expect(page.getByText("บันทึกแล้ว")).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("ขอบคุณ")).toBeVisible();

  // สรุปต้องสะท้อนสิ่งที่กรอกจริง รวมเวลาตื่นที่คำนวณให้ (FR-1.5)
  const summary = page.locator("body");
  await expect(summary).toContainText("กิน 2 มื้อ");
  await expect(summary).toContainText("มื้อแรก หลัง 12:00");
  await expect(summary).toContainText("ข้ามเช้า");
  await expect(summary).toContainText("นอน 5 ชม.");
  await expect(summary).toContainText("ตื่นราว");
  await expect(summary).toContainText("หลังขยับรู้สึกสดชื่นขึ้น");

  // วันที่มีเดดไลน์ ต้องให้กำลังใจ ไม่ตำหนิ (CONTEXT.md)
  await expect(summary).toContainText("เดดไลน์");
  await expect(summary).not.toContainText("ล้มเหลว");
  await expect(summary).not.toContainText("น้ำหนัก");
});

test("เช็คอินที่บันทึกแล้ว โผล่ในหน้าประวัติ", async ({ page }) => {
  await page.goto("/checkin/history");
  await page.waitForLoadState("networkidle");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("บันทึกย้อนหลัง");
  await expect(page.getByRole("link", { name: /แก้ไข/ }).first()).toBeVisible();
});
