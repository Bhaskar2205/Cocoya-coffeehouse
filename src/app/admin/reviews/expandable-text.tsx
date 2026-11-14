"use client";

import { useState } from "react";

export function ExpandableText({ text, limit = 160 }: { text: string; limit?: number }) {
  const [open, setOpen] = useState(false);
  const long = text.length > limit;
  return (
    <p className="leading-relaxed whitespace-pre-line text-foreground/90">
      {open || !long ? text : `${text.slice(0, limit).trimEnd()}…`}
      {long && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="ml-1.5 text-xs font-semibold text-primary hover:underline"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
    </p>
  );
}
