import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptPill } from "@/components/concept-pill";
import type { LearningState, ProgressEntry } from "@/lib/types";

function StatusBadge({ status }: { status: ProgressEntry["status"] }) {
  return status === "in-progress" ? (
    <Badge variant="warning">in progress</Badge>
  ) : (
    <Badge variant="success">done</Badge>
  );
}

export function Timeline({
  entries,
  state,
  compact = false,
}: {
  entries: ProgressEntry[];
  state: LearningState;
  compact?: boolean;
}) {
  return (
    <ol className="relative space-y-4 border-l border-zinc-800 pl-5">
      {entries.map((entry, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[1.55rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-emerald-500" />
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-500">
                    {entry.date ?? "—"}
                  </span>
                  <StatusBadge status={entry.status} />
                </div>
              </div>
              <h3 className="mt-1.5 font-medium text-zinc-100">{entry.title}</h3>

              {entry.built ? (
                <p className="mt-1 text-sm text-zinc-400">
                  <span className="text-zinc-500">Built: </span>
                  {entry.built}
                </p>
              ) : null}

              {!compact && entry.learned ? (
                <p className="mt-1 text-sm text-zinc-400">
                  <span className="text-zinc-500">Learned: </span>
                  {entry.learned}
                </p>
              ) : null}

              {!compact && entry.note ? (
                <p className="mt-1 text-sm italic text-zinc-500">{entry.note}</p>
              ) : null}

              {!compact && entry.conceptKeys.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {entry.conceptKeys.map((slug) => (
                    <ConceptPill
                      key={slug}
                      slug={slug}
                      score={state.concepts[slug]?.mastery}
                      href={`/concepts#${slug}`}
                    />
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ol>
  );
}
