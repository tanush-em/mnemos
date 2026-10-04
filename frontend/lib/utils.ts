import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatMonth(value: string): string {
  const d = new Date(value);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" }).toUpperCase();
}

export function confidencePct(value: number): string {
  return `${Math.round(value * 100)}%`;
}
