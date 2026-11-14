"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useNearViewport } from "@/hooks/use-near-viewport";

function FormSkeleton() {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_40px_120px_-50px_rgb(61_42_31/0.45)] ring-1 ring-roast/[0.06] sm:p-10" role="status" aria-busy="true" aria-label="Loading feedback form">
      <div className="flex animate-pulse flex-col gap-8">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i}>
            <div className="h-4 w-40 rounded bg-sand" />
            <div className="mt-3 h-14 rounded-2xl bg-foam" />
          </div>
        ))}
        <div className="h-16 rounded-full bg-sand" />
      </div>
    </div>
  );
}

// The form + its validation library load only as the visitor approaches it.
const FeedbackForm = dynamic(() => import("./feedback-form").then((m) => m.FeedbackForm), {
  ssr: false,
  loading: () => <FormSkeleton />,
});

export function LazyFeedbackForm() {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNearViewport(ref, "120% 0px");
  return <div ref={ref}>{near ? <FeedbackForm /> : <FormSkeleton />}</div>;
}
