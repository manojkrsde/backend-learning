import { Card, CardContent } from "@/components/ui/card";

export interface Stat {
  label: string;
  value: string | number;
  hint?: string;
}

export function StatRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((s) => (
        <Card key={s.label}>
          <CardContent className="p-4">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {s.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-zinc-100">
              {s.value}
            </p>
            {s.hint ? (
              <p className="mt-0.5 text-xs text-zinc-500">{s.hint}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
