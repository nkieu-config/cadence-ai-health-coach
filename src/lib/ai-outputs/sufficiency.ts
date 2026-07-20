import { MIN_DAYS_FOR_ANALYSIS } from "@/lib/patterns";

export type DataSufficiency =
  { enough: true } | { enough: false; daysRecorded: number; daysNeeded: number; message: string };

function inviteMessage(daysRecorded: number, daysNeeded: number): string {
  if (daysRecorded === 0) {
    return `เริ่มเช็คอินวันแรกได้เลย · พอบันทึกครบ ${MIN_DAYS_FOR_ANALYSIS} วัน ระบบจะเริ่มมองหารูปแบบให้`;
  }
  return `บันทึกแล้ว ${daysRecorded} วัน · อีก ${daysNeeded} วันก็เริ่มดูรูปแบบได้แล้ว บันทึกต่ออีกนิดนะ`;
}

export function checkDataSufficiency(daysRecorded: number): DataSufficiency {
  if (daysRecorded >= MIN_DAYS_FOR_ANALYSIS) {
    return { enough: true };
  }

  const daysNeeded = MIN_DAYS_FOR_ANALYSIS - daysRecorded;
  return {
    enough: false,
    daysRecorded,
    daysNeeded,
    message: inviteMessage(daysRecorded, daysNeeded),
  };
}
