import { expect, type Page } from "@playwright/test";

export function watchConsole(page: Page) {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  return errors;
}

// ให้เบราว์เซอร์แปลงสีเอง — Tailwind v4 คืน oklab()/color-mix() ไม่ใช่ rgb()
// ถ้า parse สตริงเอง ค่า oklab จะถูกอ่านเป็น RGB แล้วรายงาน contrast ผิดหมด
export async function unreadableText(page: Page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

    const toRgba = (color: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };

    const channel = (c: number) => {
      const v = c / 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    const luminance = ([r, g, b]: number[]) =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

    const backdropOf = (element: Element): [number, number, number] => {
      let node: Element | null = element;
      while (node) {
        const [r, g, b, a] = toRgba(getComputedStyle(node).backgroundColor);
        if (a > 0.5) return [r, g, b];
        node = node.parentElement;
      }
      return toRgba(getComputedStyle(document.body).backgroundColor).slice(0, 3) as [
        number,
        number,
        number,
      ];
    };

    const failures: { text: string; ratio: number }[] = [];
    const nodes = document.querySelectorAll("p, span, li, h1, h2, h3, td, th, label, button, a");

    for (const node of nodes) {
      const text = node.textContent?.trim() ?? "";
      if (!text || text.length > 120) continue;
      if (node.querySelector("p, span, li, td, button, a")) continue;

      const style = getComputedStyle(node);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const box = node.getBoundingClientRect();
      if (box.width < 2 || box.height < 2) continue;

      const backdrop = backdropOf(node);
      const [r, g, b, alpha] = toRgba(style.color);
      // ข้อความโปร่งแสงต้องผสมกับพื้นหลังก่อน ไม่งั้นจะดูเข้มกว่าที่ตาเห็นจริง
      const blended = [r, g, b].map((c, i) => c * alpha + backdrop[i] * (1 - alpha));

      const fg = luminance(blended);
      const bg = luminance(backdrop);
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);

      if (ratio < 4.5) {
        failures.push({ text: text.slice(0, 40), ratio: Math.round(ratio * 100) / 100 });
      }
    }

    return failures.sort((a, b) => a.ratio - b.ratio).slice(0, 5);
  });
}

export async function expectUsablePage(page: Page, heading: string, errors: string[]) {
  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1, "ทุกหน้าต้องมี <h1> อันเดียว").toHaveCount(1);
  await expect(h1).toContainText(heading);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow, "ห้ามมี horizontal scroll").toBeLessThanOrEqual(1);

  const tooSmall = await page.evaluate(() =>
    [...document.querySelectorAll("button, a[href], input, [role=button]")]
      .filter((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && box.height < 44;
      })
      .map((element) => `${element.tagName}: ${element.textContent?.trim().slice(0, 24)}`)
      .slice(0, 3)
  );
  expect(tooSmall, "ทุกอย่างที่กดได้ต้องสูง ≥ 44px").toEqual([]);

  const tinyThai = await page.evaluate(() =>
    [...document.querySelectorAll("body *")]
      .filter((element) => {
        if (element.children.length > 0) return false;
        const text = element.textContent ?? "";
        if (!/[฀-๿]/.test(text)) return false;
        const box = element.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) return false;
        return parseFloat(getComputedStyle(element).fontSize) < 11.9;
      })
      .map(
        (element) =>
          `${Math.round(parseFloat(getComputedStyle(element).fontSize))}px: ${element.textContent?.trim().slice(0, 24)}`
      )
      .slice(0, 3)
  );
  expect(tinyThai, "ข้อความไทยที่มองเห็นต้อง ≥ 12px (สระ/วรรณยุกต์ซ้อนกัน)").toEqual([]);

  expect(await unreadableText(page), "ข้อความต้องอ่านออก (contrast ≥ 4.5:1)").toEqual([]);
  expect(errors, "ห้ามมี console error").toEqual([]);
}
