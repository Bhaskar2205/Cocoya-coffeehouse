"use client";

import { useOptimistic, useState, useTransition } from "react";
import { setReviewFeatured } from "../actions";
import { cn } from "@/lib/utils";

/**
 * Feature a comment on the public website. Disabled unless the guest opted in
 * (display_consent) and actually left a written comment.
 */
export function FeatureToggle({ id, featured, allowed }: { id: string; featured: boolean; allowed: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(featured);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!allowed) {
    return <span className="text-xs text-muted-foreground" title="The guest did not agree to be featured, or left no comment.">Not shareable</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        aria-label={optimistic ? "Featured on website — click to remove" : "Feature on website"}
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            setOptimistic(!optimistic);
            const res = await setReviewFeatured(id, !optimistic);
            if (!res.ok) setError(res.error);
          });
        }}
        className="group inline-flex items-center gap-2 text-xs font-medium disabled:cursor-wait"
      >
        <span
          className={cn(
            "relative h-6 w-11 rounded-full border transition-colors duration-300",
            optimistic ? "border-primary bg-primary" : "border-border bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-[1.125rem] rounded-full bg-foam shadow transition-transform duration-300",
              optimistic && "translate-x-5 bg-espresso",
            )}
          />
        </span>
        <span className={optimistic ? "text-primary" : "text-muted-foreground"}>{optimistic ? "Featured" : "Hidden"}</span>
      </button>
      {error && (
        <p role="alert" className="max-w-[12rem] text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
