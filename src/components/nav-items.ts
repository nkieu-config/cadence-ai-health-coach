import { BarChart3, CalendarCheck, MessageCircle, Settings, Target } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/checkin", label: "เช็คอิน", icon: CalendarCheck },
  { href: "/dashboard", label: "ภาพรวม", icon: BarChart3 },
  { href: "/goals", label: "เป้าหมาย", icon: Target },
  { href: "/coach", label: "โค้ช", icon: MessageCircle },
  { href: "/settings/privacy", label: "ตั้งค่า", icon: Settings },
];

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
