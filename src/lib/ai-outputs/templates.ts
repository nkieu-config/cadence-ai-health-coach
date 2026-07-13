import type { PatternCandidate } from "@/lib/patterns/types";
import { formatMetric, METRIC_LABELS } from "./format";
import type { InsightPattern } from "./types";

type Template = {
  observation: (a: string, b: string) => string;
  meaning: string;
  nextStep: string;
};

const TEMPLATES: Record<string, Template> = {
  "sleep-eating-skip-breakfast": {
    observation: (a, b) => `วันที่นอนน้อยกว่า 6 ชม. คุณข้ามมื้อเช้า ${a} เทียบกับ ${b} ในวันที่นอนพอ`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "เตรียมมื้อเช้าง่าย ๆ ไว้ล่วงหน้าสัก 2 วันในสัปดาห์หน้า",
  },
  "sleep-eating-sweet-drinks": {
    observation: (a, b) => `วันที่นอนน้อยกว่า 6 ชม. คุณดื่มเครื่องดื่มหวาน ${a} เทียบกับ ${b} ในวันที่นอนพอ`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "ลองเตรียมน้ำเปล่าไว้ข้างโต๊ะในวันที่รู้ว่าจะง่วง",
  },
  "deadline-sleep-bedtime": {
    observation: (a, b) => `วันที่มีเดดไลน์หรือสอบ คุณเข้านอนราว ${a} เทียบกับราว ${b} ในวันปกติ`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "ตั้งเวลาหยุดงานก่อนนอน 20 นาที เฉพาะคืนก่อนเดดไลน์",
  },
  "deadline-movement-minutes": {
    observation: (a, b) => `วันที่มีเดดไลน์หรือสอบ คุณขยับ ${a} เทียบกับ ${b} ในวันปกติ`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "ตั้งเวลาลุกยืดเส้น 5 นาทีทุก 90 นาทีในวันที่งานแน่น",
  },
  "movement-next-day-sleep": {
    observation: (a, b) => `คืนหลังวันที่ได้ขยับ คุณให้คะแนนการนอน ${a} เทียบกับ ${b} หลังวันที่ขยับน้อย`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "เดินสั้น ๆ 10 นาทีหลังเลิกเรียนหรือเลิกงาน",
  },
  "movement-next-day-energy": {
    observation: (a, b) => `วันถัดจากวันที่ได้ขยับ คุณรู้สึกพลังงานสูง ${a} เทียบกับ ${b} หลังวันที่ขยับน้อย`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "เดินขึ้นบันไดแทนลิฟต์ในวันที่ตารางแน่น",
  },
  "eating-energy": {
    observation: (a, b) => `วันที่กินครบทุกมื้อ คุณรู้สึกพลังงานสูง ${a} เทียบกับ ${b} ในวันที่ข้ามมื้อ`,
    meaning: "เป็นสัญญาณที่น่าติดตาม ยังสรุปเป็นเหตุและผลไม่ได้จากข้อมูลเท่านี้",
    nextStep: "เตรียมของว่างที่กินง่ายไว้ในกระเป๋าสำหรับวันที่ตารางแน่น",
  },
};

export function toInsightPattern(candidate: PatternCandidate): InsightPattern | null {
  const template = TEMPLATES[candidate.id];
  if (!template) return null;

  const valueA = formatMetric(candidate.metric, candidate.groupA.value);
  const valueB = formatMetric(candidate.metric, candidate.groupB.value);

  return {
    pillars: candidate.pillars,
    observation: template.observation(valueA, valueB),
    meaning: template.meaning,
    nextStep: template.nextStep,
    evidence: {
      metric: METRIC_LABELS[candidate.metric] ?? candidate.metric,
      groupA: candidate.groupA,
      groupB: candidate.groupB,
    },
  };
}
