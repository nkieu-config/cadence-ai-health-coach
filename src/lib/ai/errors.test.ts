import { describe, expect, it } from "vitest";
import { aiErrorMessage, classifyAiError, isQuotaExhausted, isRetryable } from "./errors";

const QUOTA_PER_DAY = new Error(
  JSON.stringify({
    error: {
      code: 429,
      message: "You exceeded your current quota. Please retry in 44.78s.",
      status: "RESOURCE_EXHAUSTED",
      details: [
        {
          violations: [
            { quotaId: "GenerateRequestsPerDayPerProjectPerModel-FreeTier", quotaValue: "20" },
          ],
        },
      ],
    },
  })
);

const QUOTA_PER_MINUTE = new Error(
  JSON.stringify({
    error: {
      code: 429,
      status: "RESOURCE_EXHAUSTED",
      details: [
        { violations: [{ quotaId: "GenerateRequestsPerMinutePerProjectPerModel-FreeTier" }] },
      ],
    },
  })
);

describe("classifyAiError", () => {
  it("โควตารายวันหมด → บอกให้กลับมาพรุ่งนี้ ไม่ใช่ให้กดลองใหม่", () => {
    expect(classifyAiError(QUOTA_PER_DAY).failure).toBe("quota_exhausted");
    expect(isQuotaExhausted(QUOTA_PER_DAY)).toBe(true);
    expect(isRetryable(QUOTA_PER_DAY)).toBe(false);
    expect(aiErrorMessage(QUOTA_PER_DAY)).toContain("พรุ่งนี้");
  });

  it("ชนลิมิตต่อนาที → ลองใหม่ได้ ห้ามบอกว่าโควตาวันนี้หมด", () => {
    expect(classifyAiError(QUOTA_PER_MINUTE).failure).toBe("busy");
    expect(isRetryable(QUOTA_PER_MINUTE)).toBe(true);
    expect(aiErrorMessage(QUOTA_PER_MINUTE)).not.toContain("พรุ่งนี้");
  });

  it("แยกรายวันกับรายนาทีด้วย quotaId ไม่ใช่ retryDelay — Google คืน retryDelay สั้นทั้งสองแบบ", () => {
    expect(QUOTA_PER_DAY.message).toContain("44.78s");
    expect(classifyAiError(QUOTA_PER_DAY).failure).toBe("quota_exhausted");
  });

  it("เซิร์ฟเวอร์ล่มชั่วคราว → ลองใหม่ได้", () => {
    expect(classifyAiError(new Error("503 UNAVAILABLE")).failure).toBe("busy");
    expect(classifyAiError(new Error("fetch failed")).failure).toBe("busy");
  });

  it("error ที่ไม่รู้จัก → ไม่ retry อัตโนมัติ แต่ผู้ใช้กดเองได้", () => {
    const unknown = classifyAiError(new Error("AI returned an empty response"));
    expect(unknown.failure).toBe("unavailable");
    expect(isRetryable(unknown)).toBe(false);
    expect(aiErrorMessage(unknown)).toContain("ลองใหม่");
  });

  it("ทุกข้อความที่ผู้ใช้เห็น เป็นภาษาไทยและไม่มี stack trace หลุด", () => {
    for (const error of [QUOTA_PER_DAY, QUOTA_PER_MINUTE, new Error("503")]) {
      const message = aiErrorMessage(error);
      expect(message).not.toContain("Error");
      expect(message).not.toContain("quota_exhausted");
      expect(message).not.toContain("429");
      expect(message.length).toBeGreaterThan(20);
    }
  });
});
