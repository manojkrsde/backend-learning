import { StatRow, type Stat } from "@/components/stat-row";
import { Timeline } from "@/components/timeline";
import { EmptyState } from "@/components/empty-state";
import { getProgress, getState } from "@/lib/data";
import type { ProgressEntry } from "@/lib/types";

export const revalidate = 0;
export const dynamic = "force-dynamic";

// Longest run of consecutive calendar days (ending at the most recent entry)
// that each have at least one log entry.
function currentStreak(entries: ProgressEntry[]): number {
  const days = new Set(
    entries.map((e) => e.date).filter((d): d is string => Boolean(d)),
  );
  if (days.size === 0) return 0;

  const sorted = [...days].sort(); // ISO dates sort chronologically
  const latest = sorted[sorted.length - 1];

  let streak = 0;
  const cursor = new Date(latest);
  while (!Number.isNaN(cursor.getTime())) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export default function ProgressPage() {
  const state = getState();
  const entries = getProgress();
  const newestFirst = [...entries].reverse();

  const masteryValues = Object.values(state.concepts).map((c) => c.mastery);
  const avgMastery =
    masteryValues.length > 0
      ? (
          masteryValues.reduce((a, b) => a + b, 0) / masteryValues.length
        ).toFixed(1)
      : "–";

  const doneCount =
    entries.filter((e) => e.status === "done").length ||
    state.completed_task_ids.length;

  const stats: Stat[] = [
    { label: "Tasks done", value: doneCount },
    {
      label: "Current streak",
      value: currentStreak(entries),
      hint: "consecutive logged days",
    },
    {
      label: "Concepts learned",
      value: Object.keys(state.concepts).length,
    },
    { label: "Avg mastery", value: avgMastery, hint: "out of 5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Progress log</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Every finished task, newest first.
        </p>
      </div>

      <StatRow stats={stats} />

      {newestFirst.length > 0 ? (
        <Timeline entries={newestFirst} state={state} />
      ) : (
        <EmptyState
          title="The log is empty"
          hint="The scribe writes the first entry after task t-001 passes review."
        />
      )}
    </div>
  );
}
