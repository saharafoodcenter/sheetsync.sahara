import { cn } from "@/lib/utils";
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-primary", className)}>
      <Image 
        src="/logo.png" 
        alt="SheetSync Logo" 
        width={32} 
        height={32}
        className="group-data-[state=expanded]:hidden"
      />
      <span className="text-xl font-bold tracking-tight text-foreground group-data-[collapsible=icon]:group-data-[state=collapsed]:hidden">
        SheetSync
      </span>
    </div>
  );
}
