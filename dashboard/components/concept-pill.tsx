import Link from "next/link";
import { cn, MASTERY_CLASSES, masteryTone } from "@/lib/utils";

export function ConceptPill({
  slug,
  score,
  href,
}: {
  slug: string;
  score?: number;
  href?: string;
}) {
  const tone = masteryTone(score);
  const classes = MASTERY_CLASSES[tone];

  const body = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
        classes.pill,
        href && "hover:brightness-125",
      )}
      title={`${slug}${score != null ? ` · mastery ${score}/5` : " · not yet scored"}`}
    >
      <span className="font-mono">{slug}</span>
      <span
        className={cn(
          "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold",
          score != null ? classes.dot + " text-zinc-950" : "bg-zinc-700 text-zinc-300",
        )}
      >
        {score != null ? score : "–"}
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} scroll>
        {body}
      </Link>
    );
  }
  return body;
}
