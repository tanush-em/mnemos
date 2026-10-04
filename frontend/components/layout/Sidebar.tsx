"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Box,
  Clock3,
  GitBranch,
  LayoutDashboard,
  Network,
  Settings,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/memories", label: "Memories", icon: Box },
  { href: "/timeline", label: "Timeline", icon: Clock3 },
  { href: "/graph", label: "Knowledge Graph", icon: Network },
  { href: "/agent", label: "Agent Interface", icon: Terminal },
];

const system = [
  { href: "/health", label: "Memory Health", icon: Activity },
  { href: "/configuration", label: "Configuration", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800/80 px-4 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
          <GitBranch className="h-3.5 w-3.5 text-zinc-200" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-[0.18em] text-zinc-100">
            MNEMOS
          </div>
          <div className="font-mono text-[10px] text-zinc-500">memory engine</div>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div>
          <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            Navigate
          </div>
          <div className="space-y-0.5">
            {primary.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-zinc-900 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-2 px-2 font-mono text-[10px] uppercase tracking-widest text-zinc-600">
            System
          </div>
          <div className="space-y-0.5">
            {system.map((item) => {
              const active = pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-zinc-900 text-zinc-100"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="border-t border-zinc-800/80 px-4 py-3">
        <div className="font-mono text-[10px] text-zinc-600">POC v0.1.0</div>
      </div>
    </aside>
  );
}
