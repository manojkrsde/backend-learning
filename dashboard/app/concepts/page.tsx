import {
  ConceptsClient,
  type ConceptItem,
} from "@/components/concepts-client";
import { getConceptNotes, getState } from "@/lib/data";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function ConceptsPage() {
  const state = getState();
  const notes = getConceptNotes();
  const noteByKey = new Map(notes.map((n) => [n.key, n]));

  // Union of: scored concepts, concepts named by the current task, and any
  // concept that already has a written note.
  const slugs = new Set<string>([
    ...Object.keys(state.concepts),
    ...(state.current_task?.concepts ?? []),
    ...notes.map((n) => n.key),
  ]);

  const concepts: ConceptItem[] = [...slugs].map((slug) => {
    const note = noteByKey.get(slug);
    const m = state.concepts[slug];
    return {
      slug,
      name: note?.name ?? slug,
      mastery: m?.mastery ?? null,
      lastTested: m?.last_tested ?? null,
      area: note?.area,
      hasNote: Boolean(note),
      note: note?.body ?? null,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Concept tracker
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Mastery per concept. Weakest first — those at 2 or below are due for
          review.
        </p>
      </div>
      <ConceptsClient concepts={concepts} />
    </div>
  );
}
