export type UserStatus = "student" | "first_jobber";

export type EarlyDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type Constraint = "no_time" | "no_place" | "limited_budget" | "poor_rest" | "long_commute";

export type BusyPeriod = "exam" | "project_deadline" | "month_end" | "weekly" | "unpredictable";

export const STATUS_LABELS: Record<UserStatus, string> = {
  student: "นักศึกษา",
  first_jobber: "First jobber (เพิ่งเริ่มทำงาน)",
};

export const EARLY_DAY_LABELS: Record<EarlyDay, string> = {
  mon: "จ",
  tue: "อ",
  wed: "พ",
  thu: "พฤ",
  fri: "ศ",
  sat: "ส",
  sun: "อา",
};

export const CONSTRAINT_LABELS: Record<Constraint, string> = {
  no_time: "ไม่ค่อยมีเวลา",
  no_place: "ไม่มีสถานที่ออกกำลังกาย",
  limited_budget: "งบจำกัด",
  poor_rest: "พักผ่อนไม่ค่อยพอ",
  long_commute: "เดินทางไป-กลับนาน",
};

export const BUSY_PERIOD_LABELS: Record<BusyPeriod, string> = {
  exam: "ช่วงสอบ",
  project_deadline: "ช่วงส่งโปรเจกต์หรือส่งงาน",
  month_end: "ช่วงสิ้นเดือน / ปิดงาน",
  weekly: "มีประจำทุกสัปดาห์",
  unpredictable: "ไม่แน่นอน บอกล่วงหน้าไม่ได้",
};

export const PROFILE_COLUMNS = [
  "display_name",
  "status",
  "early_days",
  "typical_constraints",
  "busy_periods",
].join(", ");

export const DISPLAY_NAME_MAX_LENGTH = 30;

function allowed(labels: Record<string, string>) {
  return new Set(Object.keys(labels));
}

const STATUSES = allowed(STATUS_LABELS);
const EARLY_DAYS = allowed(EARLY_DAY_LABELS);
const CONSTRAINTS = allowed(CONSTRAINT_LABELS);
const BUSY_PERIODS = allowed(BUSY_PERIOD_LABELS);

export type OnboardingInput = {
  displayName: string;
  status: UserStatus;
  earlyDays: EarlyDay[];
  constraints: Constraint[];
  busyPeriods: BusyPeriod[];
};

function isKnownList(values: unknown, known: Set<string>) {
  return (
    Array.isArray(values) &&
    values.every((value) => typeof value === "string" && known.has(value)) &&
    new Set(values).size === values.length
  );
}

export function validateOnboarding(input: OnboardingInput): string | null {
  const displayName = input.displayName?.trim() ?? "";
  if (!displayName) {
    return "กรอกชื่อเล่นก่อน";
  }
  if (displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return `ชื่อเล่นยาวเกิน ${DISPLAY_NAME_MAX_LENGTH} ตัวอักษร`;
  }
  if (!STATUSES.has(input.status)) {
    return "เลือกสถานะก่อน";
  }
  if (!isKnownList(input.earlyDays, EARLY_DAYS)) {
    return "วันที่ต้องตื่นเช้าไม่ถูกต้อง";
  }
  if (!isKnownList(input.constraints, CONSTRAINTS)) {
    return "ข้อจำกัดไม่ถูกต้อง";
  }
  if (!isKnownList(input.busyPeriods, BUSY_PERIODS)) {
    return "ช่วงที่งานหนักไม่ถูกต้อง";
  }
  return null;
}
