export function formatMetric(metric: string, value: number): string {
  switch (metric) {
    case "skip_breakfast_rate":
    case "high_energy_rate":
    case "high_energy_rate_next_day":
      return `${Math.round(value * 100)}%`;
    case "sweet_drinks_avg":
      return `${value} แก้ว/วัน`;
    case "movement_minutes_avg":
      return `${Math.round(value)} นาที/วัน`;
    case "sleep_quality_next_day":
      return `${value}/5`;
    case "bed_time_hours_after_20":
      return formatBedTime(value);
    default:
      return String(value);
  }
}

export function formatBedTime(hoursAfter8pm: number): string {
  const total = (20 + hoursAfter8pm) % 24;
  const hour = Math.floor(total);
  const minute = Math.round((total - hour) * 60);
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export const METRIC_LABELS: Record<string, string> = {
  skip_breakfast_rate: "อัตราการข้ามมื้อเช้า",
  sweet_drinks_avg: "เครื่องดื่มหวานเฉลี่ย",
  bed_time_hours_after_20: "เวลาเข้านอนเฉลี่ย",
  movement_minutes_avg: "นาทีเคลื่อนไหวเฉลี่ย",
  sleep_quality_next_day: "คุณภาพการนอนคืนถัดไป",
  high_energy_rate_next_day: "อัตราวันพลังงานสูงในวันถัดไป",
  high_energy_rate: "อัตราวันพลังงานสูง",
};
