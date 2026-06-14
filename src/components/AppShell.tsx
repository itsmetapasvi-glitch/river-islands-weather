"use client";

import { useEffect } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className={cn(
        "min-h-screen flex",
        theme === "dark" ? "dark bg-background text-foreground" : "light bg-slate-50 text-slate-900"
      )}
    >
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
