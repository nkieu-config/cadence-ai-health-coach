export type AiFailure = "quota_exhausted" | "busy" | "unavailable";

export class AiError extends Error {
  constructor(
    readonly failure: AiFailure,
    readonly detail: string
  ) {
    super(detail);
    this.name = "AiError";
  }
}

const MESSAGES: Record<AiFailure, string> = {
  quota_exhausted:
    "โควตา AI ของวันนี้หมดแล้ว — โค้ชกลับมาคุยได้พรุ่งนี้ ระหว่างนี้ยังเช็คอิน ดูกราฟ และอ่านผลวิเคราะห์เดิมได้ตามปกติ",
  busy: "โค้ชกำลังคุยกับหลายคนพร้อมกัน — รอสัก 1 นาทีแล้วกด “ลองใหม่” ได้เลย",
  unavailable: "โค้ชตอบไม่ได้ตอนนี้ — ข้อความของคุณถูกเก็บไว้แล้ว กด “ลองใหม่” ได้เลย",
};

export function classifyAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;

  const detail = error instanceof Error ? error.message : String(error);

  if (/PerDay/i.test(detail)) {
    return new AiError("quota_exhausted", detail);
  }
  if (/PerMinute/i.test(detail) || /\b429\b|RESOURCE_EXHAUSTED/.test(detail)) {
    return new AiError("busy", detail);
  }
  if (/\b(503|500)\b|UNAVAILABLE|deadline|timeout|ECONNRESET|fetch failed/i.test(detail)) {
    return new AiError("busy", detail);
  }
  return new AiError("unavailable", detail);
}

export function aiErrorMessage(error: unknown): string {
  return MESSAGES[classifyAiError(error).failure];
}

export function isRetryable(error: unknown): boolean {
  return classifyAiError(error).failure === "busy";
}

export function isQuotaExhausted(error: unknown): boolean {
  return classifyAiError(error).failure === "quota_exhausted";
}
