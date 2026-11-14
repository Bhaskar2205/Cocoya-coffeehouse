"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { formatTime12h } from "@/lib/format";
import { cn } from "@/lib/utils";

const ist = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  weekday: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

/** "open|23:30" / "closed|11:30" / "" — a primitive so React can compare snapshots. */
function computeStatus(): string {
  if (!site.hours.length) return "";
  const parts = Object.fromEntries(ist.formatToParts(new Date()).map((p) => [p.type, p.value]));
  const day = parts.weekday as (typeof site.hours)[number]["days"][number];
  const now = Number(parts.hour) * 60 + Number(parts.minute);
  const today = site.hours.find((h) => h.days.includes(day));
  if (today && now >= toMinutes(today.opens) && now < toMinutes(today.closes)) return `open|${today.closes}`;
  if (today && now < toMinutes(today.opens)) return `closed|${today.opens}|today`;
  return `closed|${site.hours[0]!.opens}|tomorrow`;
}

function subscribe(onChange: () => void) {
  const id = window.setInterval(onChange, 60_000);
  return () => window.clearInterval(id);
}

/** Live open/closed badge in café time (IST). Renders nothing on the server. */
export function OpenStatus({ className }: { className?: string }) {
  const status = useSyncExternalStore(subscribe, computeStatus, () => "");
  if (!status) return null;
  const [state, time, when] = status.split("|");
  const open = state === "open";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
        open ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-foam/15 bg-foam/5 text-foam/75",
        className,
      )}
    >
      <span className="relative flex size-2">
        {open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />}
        <span className={cn("relative inline-flex size-2 rounded-full", open ? "bg-emerald-400" : "bg-foam/40")} />
      </span>
      {open ? `Open now · until ${formatTime12h(time!)}` : `Closed · opens ${when === "today" ? "" : "tomorrow "}${formatTime12h(time!)}`}
    </span>
  );
}
