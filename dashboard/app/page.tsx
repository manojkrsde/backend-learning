import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConceptPill } from "@/components/concept-pill";
import { MasteryGrid } from "@/components/mastery-grid";
import { Timeline } from "@/components/timeline";
import { EmptyState } from "@/components/empty-state";
import { TaskBriefPanel } from "@/components/task-brief-panel";
import { getProgress, getState, getTaskBrief } from "@/lib/data";
import type { Task } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function taskStatusBadge(task: Task) {
  const status = task.status ?? "in-progress";
  const variant =
    status === "done"
      ? "success"
      : status === "blocked"
        ? "danger"
        : "info";
  return <Badge variant={variant as any}>{status}</Badge>;
}

export default function HomePage() {
  const state = getState();
  const recent = getProgress().slice(-5).reverse();
  const current = state.current_task;
  const next = state.next_task;
  const brief = current?.id ? getTaskBrief(current.id) : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm text-zinc-500">{todayLabel()}</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Phase {state.phase} · Backend Mastery
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
            {state.completed_task_ids.length} tasks done
          </span>
          <span className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1">
            {Object.keys(state.concepts).length} concepts scored
          </span>
        </div>
      </div>

      {/* Current + Next */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm uppercase tracking-wide text-zinc-400">
              Current task
            </CardTitle>
            {current ? taskStatusBadge(current) : null}
          </CardHeader>
          <CardContent>
            {current ? (
              <>
                <div className="flex items-center gap-2">
                  {current.id ? (
                    <span className="font-mono text-xs text-zinc-500">
                      {current.id}
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-1 text-lg font-medium text-zinc-100">
                  {current.title}
                </h2>
                {current.description ? (
                  <p className="mt-2 text-sm text-zinc-400">
                    {current.description}
                  </p>
                ) : null}
                {current.concepts && current.concepts.length > 0 ? (
                  <div className="mt-4">
                    <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                      Concepts in play
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {current.concepts.map((slug) => (
                        <ConceptPill
                          key={slug}
                          slug={slug}
                          score={state.concepts[slug]?.mastery}
                          href={`/concepts#${slug}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                {brief && brief.sections.length > 0 ? (
                  <TaskBriefPanel sections={brief.sections} />
                ) : null}
              </>
            ) : (
              <EmptyState
                title="No active task"
                hint="The planner hasn't set a current task. Run /next to pick one."
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wide text-zinc-400">
              Next up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {next ? (
              <>
                <h2 className="text-base font-medium text-zinc-100">
                  {next.title}
                </h2>
                {next.description ? (
                  <p className="mt-2 text-sm text-zinc-400">
                    {next.description}
                  </p>
                ) : null}
              </>
            ) : (
              <EmptyState
                title="Nothing queued"
                hint="The planner sets the next task after the current one is recorded."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mastery overview */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Mastery overview
          </h2>
          <LegendRow />
        </div>
        <MasteryGrid state={state} />
      </section>

      {/* Recent activity */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            Recent activity
          </h2>
          <a href="/progress" className="text-xs text-sky-400 hover:underline">
            View all →
          </a>
        </div>
        {recent.length > 0 ? (
          <Timeline entries={recent} state={state} compact />
        ) : (
          <EmptyState
            title="No activity logged yet"
            hint="Finished tasks appear here once the scribe writes the first log entry."
          />
        )}
      </section>
    </div>
  );
}

function LegendRow() {
  const items = [
    { label: "1–2", className: "bg-red-500" },
    { label: "3", className: "bg-amber-500" },
    { label: "4", className: "bg-teal-500" },
    { label: "5", className: "bg-emerald-500" },
  ];
  return (
    <div className="flex items-center gap-3 text-xs text-zinc-500">
      {items.map((it) => (
        <span key={it.label} className="flex items-center gap-1">
          <span className={`h-2.5 w-2.5 rounded-full ${it.className}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}
