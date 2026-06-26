import { NotesView } from "@/components/notes-view";
import { getConceptNotesRaw } from "@/lib/data";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default function NotesPage() {
  const markdown = getConceptNotesRaw();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Notes</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Your full concept reference, straight from learned-concepts.md.
        </p>
      </div>
      <NotesView markdown={markdown} />
    </div>
  );
}
