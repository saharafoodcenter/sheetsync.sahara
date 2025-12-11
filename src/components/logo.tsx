import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <span className="text-xl font-bold tracking-tight text-foreground">
        SheetSync
      </span>
    </div>
  );
}
