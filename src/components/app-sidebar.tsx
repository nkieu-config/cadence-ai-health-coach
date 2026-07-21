"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavIcon } from "./nav-pending";
import { NAV_ITEMS, isActivePath } from "./nav-items";
import { SignOutButton } from "./sign-out-button";

export function AppSidebar({ name }: { name?: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-muted/30 lg:block">
      <div className="sticky top-0 flex h-dvh flex-col gap-8 p-5">
        <div className="space-y-0.5 px-3 pt-2">
          <span className="block text-lg font-semibold">HealthCoach</span>
          {name && <span className="block text-sm text-muted-foreground">สวัสดี {name} 👋</span>}
        </div>

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
                    <NavIcon icon={Icon} className="size-5 shrink-0" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="mt-auto">
          <SignOutButton />
        </div>
      </div>
    </aside>
  );
}
