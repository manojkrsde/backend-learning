"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

interface Section {
  heading: string;
  body: string;
}

// Only show these sections by default to keep the home page scannable.
// Others are collapsed behind "Show more".
const PRIORITY_HEADINGS = [
  "What you're building",
  "Steps",
  "Definition of done",
  "Why this task, why now",
];

function isPriority(heading: string): boolean {
  return PRIORITY_HEADINGS.some(
    (h) => heading.toLowerCase() === h.toLowerCase(),
  );
}

export function TaskBriefPanel({ sections }: { sections: Section[] }) {
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => {
    // Auto-expand priority sections
    const initial = new Set<number>();
    sections.forEach((s, i) => {
      if (isPriority(s.heading)) initial.add(i);
    });
    return initial;
  });

  const [showAll, setShowAll] = useState(false);

  if (sections.length === 0) return null;

  const prioritySections = sections.filter((s) => isPriority(s.heading));
  const otherSections = sections.filter((s) => !isPriority(s.heading));
  const visible = showAll ? sections : prioritySections;

  const toggle = (idx: number) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Map visible sections back to their original index for consistent toggle state
  const getOriginalIndex = (section: Section) => sections.indexOf(section);

  return (
    <div className="mt-5 space-y-1.5 border-t border-zinc-800 pt-4">
      <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
        Task brief
      </p>

      {visible.map((section) => {
        const idx = getOriginalIndex(section);
        const open = expandedSet.has(idx);
        return (
          <div
            key={idx}
            className="rounded-md border border-zinc-800 bg-zinc-800/30"
          >
            <button
              onClick={() => toggle(idx)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800/60"
            >
              {open ? (
                <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
              )}
              {section.heading}
            </button>
            {open ? (
              <div className="border-t border-zinc-800 px-3 py-3">
                <Markdown className="text-sm">{section.body}</Markdown>
              </div>
            ) : null}
          </div>
        );
      })}

      {otherSections.length > 0 ? (
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="mt-1 text-xs text-sky-400 hover:underline"
        >
          {showAll
            ? "Show less"
            : `Show ${otherSections.length} more section${otherSections.length > 1 ? "s" : ""}`}
        </button>
      ) : null}
    </div>
  );
}
