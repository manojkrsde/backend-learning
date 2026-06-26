import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-zinc-700 bg-zinc-800 text-zinc-200",
        outline: "border-zinc-700 text-zinc-300",
        success: "border-emerald-800/60 bg-emerald-950/60 text-emerald-300",
        warning: "border-amber-800/60 bg-amber-950/60 text-amber-300",
        danger: "border-red-800/60 bg-red-950/60 text-red-300",
        info: "border-sky-800/60 bg-sky-950/60 text-sky-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
