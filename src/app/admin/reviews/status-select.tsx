"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateReviewStatus } from "../actions";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  new: "border-gold/40 bg-gold/10 text-gold",
  reviewed: "border-sky-300/30 bg-sky-300/10 text-sky-200",
  resolved: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
};

export function StatusSelect({ id, status }: { id: string; status: string }) {
  const [optimistic, setOptimistic] = useOptimistic(status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <div className="relative inline-flex items-center">
        <label htmlFor={`status-${id}`} className="sr-only">
          Review status
        </label>
        <select
          id={`status-${id}`}
          value={optimistic}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.value;
            setError(null);
            startTransition(async () => {
              setOptimistic(next);
              const res = await updateReviewStatus(id, next);
              if (!res.ok) setError(res.error);
            });
          }}
          className={cn(
            "h-9 cursor-pointer appearance-none rounded-full border px-3.5 pr-8 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait",
            STYLES[optimistic],
          )}
        >
          <option value="new">New</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
        {pending ? (
          <Loader2 className="pointer-events-none absolute right-2.5 size-3.5 animate-spin" />
        ) : (
          <span className="pointer-events-none absolute right-3 text-[0.6rem] opacity-70">▼</span>
        )}
      </div>
      {error && (
        <p role="alert" className="max-w-[12rem] text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
