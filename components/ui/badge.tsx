import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "coral" | "mint" | "amber" | "navy" | "outline";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-card-bg text-text-main",
  coral: "bg-coral/10 text-coral",
  mint: "bg-mint/10 text-[#3a9b7a]",
  amber: "bg-amber-brand/10 text-[#b8812e]",
  navy: "bg-navy/10 text-navy",
  outline: "border border-border text-muted bg-transparent",
};

export function Badge({ variant = "default", className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
