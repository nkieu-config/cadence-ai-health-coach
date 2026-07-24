import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { THEME_COLORS } from "./theme";

const css = readFileSync("src/app/globals.css", "utf8");

function backgroundOf(selector: string): string {
  const block = css.split(selector)[1]?.split("}")[0] ?? "";
  return block.match(/--background:\s*([^;]+);/)?.[1].trim() ?? "";
}

// THEME_COLORS ถูก inline ลง <script> ที่รันก่อน CSS จะถูก parse จึงอ่าน token ตอนนั้นไม่ได้
// ค่าซ้ำจึงจำเป็น — ด่านนี้กันไม่ให้มันเพี้ยนจาก globals.css เงียบ ๆ
describe("THEME_COLORS ต้องตรงกับ --background ใน globals.css", () => {
  it("light", () => {
    expect(THEME_COLORS.light).toBe(backgroundOf(":root {"));
  });

  it("dark", () => {
    expect(THEME_COLORS.dark).toBe(backgroundOf('[data-theme="dark"] {'));
  });
});
