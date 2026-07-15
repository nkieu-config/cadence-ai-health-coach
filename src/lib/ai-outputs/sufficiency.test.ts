import { describe, expect, it } from "vitest";
import { MIN_DAYS_FOR_ANALYSIS } from "@/lib/patterns";
import { findForbiddenTerms } from "@/lib/safety/language";
import { checkDataSufficiency } from "./sufficiency";

describe("checkDataSufficiency", () => {
  it("ครบ 7 วันขึ้นไป → พอวิเคราะห์", () => {
    expect(checkDataSufficiency(MIN_DAYS_FOR_ANALYSIS)).toEqual({ enough: true });
    expect(checkDataSufficiency(30)).toEqual({ enough: true });
  });

  it("น้อยกว่า 7 วัน → ไม่พอ พร้อมจำนวนวันที่เหลือ", () => {
    const result = checkDataSufficiency(3);
    expect(result.enough).toBe(false);
    if (result.enough) return;
    expect(result.daysRecorded).toBe(3);
    expect(result.daysNeeded).toBe(4);
    expect(result.message).toContain("3 วัน");
    expect(result.message).toContain("4 วัน");
  });

  it("ยังไม่มีบันทึกเลย → ชวนเริ่มวันแรก ไม่พูดว่า '0 วัน'", () => {
    const result = checkDataSufficiency(0);
    expect(result.enough).toBe(false);
    if (result.enough) return;
    expect(result.daysNeeded).toBe(MIN_DAYS_FOR_ANALYSIS);
    expect(result.message).not.toContain("0 วัน");
    expect(result.message).toContain("วันแรก");
  });

  it("ข้อความชวนบันทึกต้องไม่มีคำตัดสิน/ต้องห้าม (เกณฑ์ Safety)", () => {
    for (let days = 0; days < MIN_DAYS_FOR_ANALYSIS; days += 1) {
      const result = checkDataSufficiency(days);
      if (result.enough) continue;
      expect(findForbiddenTerms(result.message)).toEqual([]);
    }
  });
});
