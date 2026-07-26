import { expect, test } from "@playwright/test";

// หน้าโค้ชเป็นหน้าเดียวที่คำนวณความสูงเอง (`calc(100dvh - chrome)`) แทนการปล่อยให้หน้ายาวตามเนื้อหา
// ถ้าค่าที่หักไว้ไม่ตรงกับ chrome จริง อาการจะไม่ใช่ layout เพี้ยน แต่เป็น "เมนูล่างทับช่องพิมพ์"
// ด่านแนวนอนใน checks.ts จับไม่ได้ และ isVisible() ของ Playwright ตอบ true ให้ของที่ถูก overflow ตัดหาย
test.describe("หน้าโค้ชต้องพอดีจอ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/coach");
    await expect(page.getByRole("log")).toBeVisible();
  });

  test("ไม่มี scroll แนวตั้ง — แถบ safety notice กับเมนูล่างจึงไม่ถูกดันตกจอ", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollHeight - document.documentElement.clientHeight
    );
    expect(overflow, "หักความสูง chrome ไม่ครบ หน้าจึงยาวเกินจอ").toBeLessThanOrEqual(1);
  });

  test("ช่องพิมพ์แตะโดนจริง ไม่ถูกเมนูล่างทับ", async ({ page }) => {
    const covered = await page.evaluate(() => {
      const input = document.querySelector("textarea");
      if (!input) return "ไม่พบช่องพิมพ์";
      const box = input.getBoundingClientRect();
      if (box.bottom > window.innerHeight) return "ช่องพิมพ์ตกขอบล่างของจอ";
      const onTop = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
      if (!onTop || onTop === input || input.contains(onTop)) return null;
      const overlay = onTop.closest("nav, header");
      return `ถูก ${overlay?.getAttribute("aria-label") ?? onTop.tagName.toLowerCase()} ทับ`;
    });
    expect(covered, "ช่องพิมพ์ต้องกดได้โดยไม่ต้องเลื่อนหน้าก่อน").toBeNull();
  });

  test("แผงตั้งเป้าหมายที่ยาวเกินการ์ดต้องเลื่อนเองได้ ไม่ใช่ถูกตัดหาย", async ({ page }) => {
    await page
      .getByRole("button", { name: /ตั้งเป้าสัปดาห์หน้า/ })
      .first()
      .click();
    await page.getByRole("button", { name: /^การกิน/ }).click();
    await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
    await expect(page.getByText("เลือกข้อจำกัดของคุณ")).toBeVisible();

    // ขั้น "ข้อจำกัด" คือแผงที่ยาวที่สุดของ guided flow — 5 ตัวเลือก + ปุ่มท้าย 2 แถว
    const reach = await page
      .getByRole("button", { name: "ถัดไป", exact: true })
      .evaluate((button) => {
        const panel = button.closest('[data-slot="chat-panel"]');
        const card = button.closest('[data-slot="chat-card"]');
        if (!panel || !card) return null;
        panel.scrollTop = panel.scrollHeight;
        const box = button.getBoundingClientRect();
        const onTop = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
        return {
          overflowY: getComputedStyle(panel).overflowY,
          clippedByCard: Math.round(box.bottom - card.getBoundingClientRect().bottom),
          reachable: Boolean(onTop && (onTop === button || button.contains(onTop))),
        };
      });

    expect(reach, "ไม่พบแผงล่างหรือการ์ดแชท").not.toBeNull();
    expect(reach!.overflowY, "แผงล่างต้องเลื่อนเองได้เมื่อเนื้อหายาวเกิน").toMatch(/auto|scroll/);
    expect(reach!.clippedByCard, "ปุ่มถัดไปถูกกรอบการ์ดตัดหาย").toBeLessThanOrEqual(0);
    expect(reach!.reachable, "ปุ่มถัดไปต้องแตะโดนจริงหลังเลื่อนแผง").toBe(true);
  });
});
