/**
 * Verified Google reviews.
 *
 * ⚠️  Only add reviews copied word-for-word from Cocoya's real Google Business
 * profile, with the reviewer's public display name, star rating and date.
 * Never paraphrase, invent or "improve" a review.
 *
 * The supplied Google reference could not be read automatically, so this list
 * starts empty. While it is empty, the Reviews section shows a tasteful link to
 * the Google profile plus any guest feedback that the café has approved and the
 * guest consented to display (moderated in /admin/reviews).
 */

export type GoogleReview = {
  author: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  /** ISO date (YYYY-MM-DD) or relative text exactly as shown on Google, e.g. "2 months ago". */
  date: string;
};

/**
 * Overall Google rating — as displayed by Google's own Maps listing for
 * "Cocoya Coffee House" on 14 Nov 2026. Update both values from the live
 * profile from time to time (or set to null to hide).
 */
export const googleRating = { rating: 4.9, count: 149 } as { rating: number; count: number } | null;

export const googleReviews: GoogleReview[] = [];
