"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Markdown } from "@/components/markdown";
import { EmptyState } from "@/components/empty-state";
import {
  cn,
  daysSince,
  MASTERY_CLASSES,
  masteryTone,
} from "@/lib/utils";

export interface ConceptItem {
  slug: string;
  name: string;
  mastery: number | null;
  lastTested: string | null;
  area?: string;
  hasNote: boolean;
  note: string | null;
}

type Sort = "score" | "name" | "tested";

export function ConceptsClient({ concepts }: { concepts: ConceptItem[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("score");

  // Deep-link support: /concepts#<slug> selects that concept on load.
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (hash && concepts.some((c) => c.slug === hash)) {
      setSelected(hash);
    } else if (concepts.length > 0) {
      setSelected(concepts[0].slug);
    }
  }, [concepts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = concepts.filter(
      (c) =>
        !q ||
        c.slug.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q),
    );

    const sorted = [...list];
    if (sort === "score") {
      // weakest first; unscored sink to the bottom
      sorted.sort(
        (a, b) => (a.mastery ?? 99) - (b.mastery ?? 99) || a.slug.localeCompare(b.slug),
      );
    } else if (sort === "name") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      sorted.sort((a, b) => {
        const da = a.lastTested ? Date.parse(a.lastTested) : -Infinity;
        const db = b.lastTested ? Date.parse(b.lastTested) : -Infinity;
        return db - da;
      });
    }
    return sorted;
  }, [concepts, query, sort]);

  const active = concepts.find((c) => c.slug === selected) ?? null;

  if (concepts.length === 0) {
    return (
      <EmptyState
        title="No concepts to track yet"
        hint="Concepts appear once the planner sets a task or the scribe scores one."
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
      {/* Left: list */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter concepts…"
            className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-sm text-zinc-300 focus:outline-none"
          >
            <option value="score">Weakest first</option>
            <option value="name">Name</option>
            <option value="tested">Last tested</option>
          </select>
        </div>

        <div className="space-y-2">
          {filtered.map((c) => (
            <ConceptRow
              key={c.slug}
              concept={c}
              active={c.slug === selected}
              onClick={() => setSelected(c.slug)}
            />
          ))}
          {filtered.length === 0 ? (
            <p className="px-1 py-4 text-sm text-zinc-500">
              No concepts match “{query}”.
            </p>
          ) : null}
        </div>
      </div>

      {/* Right: note */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <Card>
          <CardContent className="p-5">
            {active ? (
              active.note ? (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-500">
                      {active.slug}
                    </span>
                    {active.mastery != null ? (
                      <Badge variant="outline">mastery {active.mastery}/5</Badge>
                    ) : null}
                  </div>
                  <Markdown>{`## ${active.name}\n\n${active.note}`}</Markdown>
                </>
              ) : (
                <EmptyState
                  title="No notes yet"
                  hint={`The scribe hasn't written a note for "${active.slug}".`}
                />
              )
            ) : (
              <EmptyState title="Select a concept" hint="Pick one from the list." />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConceptRow({
  concept,
  active,
  onClick,
}: {
  concept: ConceptItem;
  active: boolean;
  onClick: () => void;
}) {
  const tone = masteryTone(concept.mastery ?? undefined);
  const classes = MASTERY_CLASSES[tone];
  const since = daysSince(concept.lastTested);
  const needsReview = concept.mastery != null && concept.mastery <= 2;

  return (
    <button
      id={concept.slug}
      onClick={onClick}
      className={cn(
        "w-full scroll-mt-20 rounded-lg border px-3 py-2.5 text-left transition-colors",
        active
          ? "border-zinc-500 bg-zinc-800"
          : "border-zinc-800 bg-zinc-800/40 hover:bg-zinc-800/70",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-sm text-zinc-200">
          {concept.slug}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {needsReview ? <Badge variant="danger">⚠ needs review</Badge> : null}
          {!concept.hasNote ? (
            <span className="text-[10px] text-zinc-600">no note</span>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3">
        <Progress
          value={concept.mastery != null ? (concept.mastery / 5) * 100 : 0}
          indicatorClassName={classes.bar}
          className="h-1.5"
        />
        <span className={cn("w-8 shrink-0 text-right text-xs font-medium", classes.text)}>
          {concept.mastery != null ? `${concept.mastery}/5` : "–"}
        </span>
      </div>

      <p className="mt-1 text-[11px] text-zinc-500">
        {concept.lastTested
          ? `tested ${concept.lastTested}${since != null ? ` · ${since}d ago` : ""}`
          : "never tested"}
      </p>
    </button>
  );
}
