import { ConceptPill } from "@/components/concept-pill";
import { EmptyState } from "@/components/empty-state";
import type { LearningState } from "@/lib/types";

// Compact grid of every concept in state.json, plus any concept named by the
// current task that has no score yet (so the plan and the data stay in sync).
export function MasteryGrid({ state }: { state: LearningState }) {
  const scored = Object.entries(state.concepts);
  const scoredSlugs = new Set(scored.map(([slug]) => slug));

  const pending = (state.current_task?.concepts ?? []).filter(
    (slug) => !scoredSlugs.has(slug),
  );

  if (scored.length === 0 && pending.length === 0) {
    return (
      <EmptyState
        title="No concepts tracked yet"
        hint="Mastery scores appear here once the scribe records your first task."
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {scored
        .sort((a, b) => a[1].mastery - b[1].mastery)
        .map(([slug, m]) => (
          <ConceptPill
            key={slug}
            slug={slug}
            score={m.mastery}
            href={`/concepts#${slug}`}
          />
        ))}
      {pending.map((slug) => (
        <ConceptPill key={slug} slug={slug} href={`/concepts#${slug}`} />
      ))}
    </div>
  );
}
