"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CalendarCheck, MessageCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/checkin", label: "เช็คอิน", icon: CalendarCheck },
  { href: "/dashboard", label: "ภาพรวม", icon: BarChart3 },
  { href: "/coach", label: "โค้ช", icon: MessageCircle },
  { href: "/settings/privacy", label: "ตั้งค่า", icon: Settings },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t bg-background">
      <ul className="mx-auto flex w-full max-w-md">
        {ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
