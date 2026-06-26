import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  hint,
  className,
}: {
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-800/30 px-6 py-10 text-center",
        className,
      )}
    >
      <p className="text-sm font-medium text-zinc-300">{title}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
