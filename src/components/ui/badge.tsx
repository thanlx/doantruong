import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "muted" | "accent";
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-primary text-primary-foreground border-transparent shadow-2xs",
    secondary: "border-secondary/40 bg-secondary/30 text-secondary-foreground",
    destructive: "bg-destructive/15 text-destructive border-destructive/25",
    muted: "bg-muted text-muted-foreground border-border opacity-80",
    accent: "bg-accent text-accent-foreground border-accent/40",
    outline: "border-border text-foreground bg-card",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none select-none",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
