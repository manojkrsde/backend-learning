import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptPill } from "@/components/concept-pill";
import { EmptyState } from "@/components/empty-state";
import { getCurriculum, getState } from "@/lib/data";
import { crossReference, type TopicStatus } from "@/lib/curriculum-match";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const STATUS_META: Record<
  TopicStatus,
  { icon: string; label: string; variant: "success" | "warning" | "default" }
> = {
  mastered: { icon: "✅", label: "mastered", variant: "success" },
  "in-progress": { icon: "🟡", label: "in progress", variant: "warning" },
  "not-started": { icon: "○", label: "not started", variant: "default" },
};

export default function CurriculumPage() {
  const state = getState();
  const files = getCurriculum();
  const refs = crossReference(files, state);

  const phases = Array.from(new Set(refs.map((r) => r.file.phase))).sort();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Curriculum map</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Topics grouped by phase and priority, cross-referenced against your
          mastery scores.
        </p>
      </div>

      {refs.length === 0 ? (
        <EmptyState
          title="Couldn't read the curriculum"
          hint="Expected a topic table in ai/curriculum/INDEX.md."
        />
      ) : (
        phases.map((phase) => {
          const inPhase = refs.filter((r) => r.file.phase === phase);
          const priorities = Array.from(
            new Set(inPhase.map((r) => r.file.priority)),
          );
          return (
            <section key={phase} className="space-y-4">
              <h2 className="text-lg font-semibold text-zinc-200">
                Phase {phase}
              </h2>
              {priorities.map((priority) => (
                <div key={priority} className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                    {priority}
                  </p>
                  <div className="grid gap-2">
                    {inPhase
                      .filter((r) => r.file.priority === priority)
                      .map((topic) => (
                        <TopicRow key={topic.file.file} topic={topic} />
                      ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}

function TopicRow({
  topic,
}: {
  topic: ReturnType<typeof crossReference>[number];
}) {
  const meta = STATUS_META[topic.status];
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base">{meta.icon}</span>
            <span className="font-mono text-sm text-zinc-200">
              {topic.file.slug}
            </span>
            <Badge variant={meta.variant}>{meta.label}</Badge>
          </div>
        </div>
        <p className="mt-1.5 text-sm text-zinc-400">{topic.file.pullsIn}</p>
        {topic.concepts.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {topic.concepts.map((c) => (
              <ConceptPill
                key={c.slug}
                slug={c.slug}
                score={c.mastery ?? undefined}
                href={`/concepts#${c.slug}`}
              />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
