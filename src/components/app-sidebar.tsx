"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, isActivePath } from "./nav-items";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-8 p-5">
        <span className="px-3 pt-2 text-lg font-semibold">HealthCoach</span>

        <nav aria-label="เมนูหลัก">
          <ul className="space-y-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActivePath(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-11 items-center gap-3 rounded-full px-4 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <form action={signOut} className="mt-auto">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 px-4 text-muted-foreground"
          >
            <LogOut className="size-5 shrink-0" />
            ออกจากระบบ
          </Button>
        </form>
      </div>
    </aside>
  );
}
