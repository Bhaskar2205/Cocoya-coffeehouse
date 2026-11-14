import { NextResponse, type NextRequest } from "next/server";
import { getAdminUser } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";
import { parseFilters, reviewsQuery, STATUS_LABEL, type ReviewRow } from "@/lib/admin/reviews";
import { EXPERIENCE_OPTIONS, RATING_LABELS } from "@/lib/feedback/schema";
import { formatDateTimeIST } from "@/lib/format";

const experienceLabel = new Map<string, string>(EXPERIENCE_OPTIONS.map((o) => [o.value, o.label]));

/** Quote a CSV cell and neutralise spreadsheet formula injection (=, +, -, @). */
function cell(value: unknown): string {
  let s = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const supabase = await createSessionClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const filters = parseFilters(request.nextUrl.searchParams);
  const { data, error } = await reviewsQuery(supabase, filters, { paginate: false });
  if (error) {
    console.error("[export]", error.message);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }

  const header = [
    "Received (IST)",
    "Customer name",
    "Country code",
    "Mobile number",
    "Rating",
    "Rating label",
    "Enjoyed",
    "Would recommend",
    "Feedback",
    "Status",
    "May feature",
    "Featured",
    "ID",
  ];

  const lines = ((data ?? []) as ReviewRow[]).map((r) =>
    [
      formatDateTimeIST(r.created_at),
      r.customer_name,
      r.country_code,
      r.mobile_number,
      r.rating,
      RATING_LABELS[r.rating - 1],
      r.experience_categories.map((c) => experienceLabel.get(c) ?? c).join("; "),
      r.recommendation,
      r.additional_feedback ?? "",
      STATUS_LABEL[r.review_status],
      r.display_consent ? "Yes" : "No",
      r.is_featured ? "Yes" : "No",
      r.id,
    ]
      .map(cell)
      .join(","),
  );

  // UTF-8 BOM so Excel opens names in any script correctly.
  const csv = "﻿" + [header.map(cell).join(","), ...lines].join("\r\n");
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="cocoya-feedback-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
