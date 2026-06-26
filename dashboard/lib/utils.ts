import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Turn an arbitrary heading or name into a URL-safe slug used for anchors.
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Mastery is 1..5. Map it to the dashboard's colour buckets.
//   1-2 = red, 3 = amber, 4 = blue-green (teal), 5 = emerald
export type MasteryTone = "red" | "amber" | "teal" | "emerald" | "neutral";

export function masteryTone(score: number | undefined | null): MasteryTone {
  if (score == null || Number.isNaN(score)) return "neutral";
  if (score <= 2) return "red";
  if (score === 3) return "amber";
  if (score === 4) return "teal";
  return "emerald";
}

export const MASTERY_CLASSES: Record<
  MasteryTone,
  { pill: string; bar: string; text: string; dot: string }
> = {
  red: {
    pill: "bg-red-950/60 text-red-300 border-red-800/60",
    bar: "bg-red-500",
    text: "text-red-400",
    dot: "bg-red-500",
  },
  amber: {
    pill: "bg-amber-950/60 text-amber-300 border-amber-800/60",
    bar: "bg-amber-500",
    text: "text-amber-400",
    dot: "bg-amber-500",
  },
  teal: {
    pill: "bg-teal-950/60 text-teal-300 border-teal-800/60",
    bar: "bg-teal-500",
    text: "text-teal-400",
    dot: "bg-teal-500",
  },
  emerald: {
    pill: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
    bar: "bg-emerald-500",
    text: "text-emerald-400",
    dot: "bg-emerald-500",
  },
  neutral: {
    pill: "bg-zinc-800 text-zinc-400 border-zinc-700",
    bar: "bg-zinc-600",
    text: "text-zinc-400",
    dot: "bg-zinc-600",
  },
};

export function daysSince(dateStr: string | undefined | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  if (Number.isNaN(then)) return null;
  const diff = Date.now() - then;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
