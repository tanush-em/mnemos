import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider font-mono",
  {
    variants: {
      variant: {
        default: "border-zinc-700 bg-zinc-900 text-zinc-300",
        semantic: "border-sky-800/60 bg-sky-950/50 text-sky-300",
        episodic: "border-amber-800/60 bg-amber-950/50 text-amber-300",
        procedural: "border-emerald-800/60 bg-emerald-950/50 text-emerald-300",
        current: "border-emerald-700/50 bg-emerald-950/40 text-emerald-300",
        superseded: "border-zinc-600 bg-zinc-900 text-zinc-400",
        archived: "border-zinc-700 bg-zinc-950 text-zinc-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
