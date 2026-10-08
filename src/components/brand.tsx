import mascot from "@/assets/mascot.png";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function Mascot({ className, float }: { className?: string; float?: boolean }) {
  return (
    <img
      src={mascot}
      alt="MatricEnhle star mascot holding a book"
      width={816}
      height={816}
      className={cn("select-none", float && "animate-float", className)}
    />
  );
}

export function Logo({ light, className }: { light?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Mascot className="h-10 w-10" />
      <span
        className={cn(
          "font-display text-xl font-bold tracking-tight",
          light ? "text-plum-foreground" : "text-foreground",
        )}
      >
        Matric<span className="text-star">Enhle</span>
      </span>
    </div>
  );
}

export function StarField({ className }: { className?: string }) {
  const stars = [
    "left-[8%] top-[12%] h-3 w-3",
    "left-[78%] top-[8%] h-4 w-4 [animation-delay:1s]",
    "left-[62%] top-[70%] h-2.5 w-2.5 [animation-delay:2s]",
    "left-[15%] top-[80%] h-3.5 w-3.5 [animation-delay:.5s]",
    "left-[90%] top-[45%] h-2 w-2 [animation-delay:1.5s]",
    "left-[40%] top-[20%] h-2 w-2 [animation-delay:2.5s]",
  ];
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0", className)}>
      {stars.map((s) => (
        <Star key={s} className={cn("absolute animate-twinkle fill-star text-star", s)} />
      ))}
    </div>
  );
}
