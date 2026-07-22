"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleTheme } from "@/lib/theme";

function ThemeIcons() {
  return (
    <>
      <Moon className="size-5 shrink-0 dark:hidden" />
      <Sun className="hidden size-5 shrink-0 dark:block" />
    </>
  );
}

export function ThemeToggleIconButton() {
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <ThemeIcons />
      <span className="sr-only dark:hidden">เปลี่ยนเป็นโหมดมืด</span>
      <span className="sr-only hidden dark:inline">เปลี่ยนเป็นโหมดสว่าง</span>
    </Button>
  );
}

export function ThemeToggleMenuItem() {
  return (
    <Button
      variant="ghost"
      className="w-full justify-start gap-3 px-4 text-muted-foreground"
      onClick={toggleTheme}
    >
      <ThemeIcons />
      <span className="dark:hidden">โหมดมืด</span>
      <span className="hidden dark:inline">โหมดสว่าง</span>
    </Button>
  );
}
