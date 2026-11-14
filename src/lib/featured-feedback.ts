import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { createServiceClient } from "@/lib/supabase/admin";
import { publicDisplayName } from "@/lib/format";

export const FEATURED_FEEDBACK_TAG = "featured-feedback";

export type PublicFeedback = {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
};

/**
 * Guest feedback that is safe to show publicly:
 *   • the guest ticked "you may feature my comments" (display_consent), AND
 *   • an administrator explicitly featured it in /admin/reviews.
 * Only first name + last initial, rating, comment and date leave the database —
 * never phone numbers.
 */
export async function getFeaturedFeedback(): Promise<PublicFeedback[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(FEATURED_FEEDBACK_TAG);

  const supabase = createServiceClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("customer_reviews")
    .select("id, customer_name, rating, additional_feedback, created_at")
    .eq("is_featured", true)
    .eq("display_consent", true)
    .not("additional_feedback", "is", null)
    .order("created_at", { ascending: false })
    .limit(9);

  if (error || !data) {
    if (error) console.error("[featured-feedback]", error.message);
    return [];
  }

  return data.map((row) => ({
    id: row.id as string,
    name: publicDisplayName(row.customer_name as string),
    rating: row.rating as number,
    text: row.additional_feedback as string,
    date: row.created_at as string,
  }));
}
