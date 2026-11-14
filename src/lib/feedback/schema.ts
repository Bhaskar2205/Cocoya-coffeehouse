import { z } from "zod";

/**
 * Shared validation for the guest feedback form.
 * The exact same schema runs in the browser (instant feedback) and on the
 * server (the source of truth) — the server never trusts the client.
 */

export const RATING_LABELS = ["Poor", "Average", "Good", "Very Good", "Excellent"] as const;

export const EXPERIENCE_OPTIONS = [
  { value: "coffee", label: "Coffee" },
  { value: "food", label: "Food" },
  { value: "ambience", label: "Ambience" },
  { value: "service", label: "Service" },
  { value: "staff", label: "Staff" },
  { value: "overall", label: "Overall experience" },
] as const;

export const RECOMMENDATION_OPTIONS = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
] as const;

export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
] as const;

export const FEEDBACK_MAX_LENGTH = 1000;
/** Bots submit instantly; humans take a few seconds to fill the form. */
export const MIN_FILL_TIME_MS = 2500;

type ExperienceValue = (typeof EXPERIENCE_OPTIONS)[number]["value"];
type RecommendationValue = (typeof RECOMMENDATION_OPTIONS)[number]["value"];
type CountryCode = (typeof COUNTRY_CODES)[number]["code"];

const experienceValues = EXPERIENCE_OPTIONS.map((o) => o.value) as [ExperienceValue, ...ExperienceValue[]];
const recommendationValues = RECOMMENDATION_OPTIONS.map((o) => o.value) as [RecommendationValue, ...RecommendationValue[]];
const countryCodeValues = COUNTRY_CODES.map((c) => c.code) as [CountryCode, ...CountryCode[]];

/** Strip spaces, dashes, brackets and a leading 0 / country prefix typed into the number field. */
export function normalizeMobile(raw: string, countryCode: string): string {
  let digits = raw.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+")) {
    const cc = countryCode.replace("+", "");
    digits = digits.slice(1);
    if (digits.startsWith(cc)) digits = digits.slice(cc.length);
  }
  if (countryCode === "+91") {
    if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  }
  return digits;
}

/** Indian mobile numbers: 10 digits beginning with 6, 7, 8 or 9. */
export const INDIAN_MOBILE = /^[6-9]\d{9}$/;
const INTERNATIONAL_MOBILE = /^\d{6,14}$/;

export function isValidMobile(digits: string, countryCode: string): boolean {
  return countryCode === "+91" ? INDIAN_MOBILE.test(digits) : INTERNATIONAL_MOBILE.test(digits);
}

export const feedbackSchema = z
  .object({
    customerName: z
      .string({ error: "Please tell us your name." })
      .trim()
      .min(2, { error: "Please enter your full name." })
      .max(80, { error: "Name is too long (80 characters max)." })
      .regex(/^[\p{L}\p{M}][\p{L}\p{M}' .-]*$/u, { error: "Please use letters only in your name." }),
    countryCode: z.enum(countryCodeValues, { error: "Please choose a country code." }),
    mobileNumber: z.string({ error: "Please enter your mobile number." }).trim().min(1, { error: "Please enter your mobile number." }),
    rating: z
      .number({ error: "Please choose a star rating." })
      .int()
      .min(1, { error: "Please choose a star rating." })
      .max(5, { error: "Please choose a star rating." }),
    experienceCategories: z.array(z.enum(experienceValues)).max(experienceValues.length).default([]),
    additionalFeedback: z
      .string()
      .trim()
      .max(FEEDBACK_MAX_LENGTH, { error: `Please keep feedback under ${FEEDBACK_MAX_LENGTH} characters.` })
      .optional()
      .transform((v) => (v ? v : undefined)),
    recommendation: z.enum(recommendationValues, { error: "Please let us know if you'd recommend Cocoya." }),
    privacyConsent: z.literal(true, { error: "Please confirm you agree to how we use your details." }),
    displayConsent: z.boolean().default(false),
  })
  // `when: () => true` runs this even if other fields are invalid, so the guest
  // sees every problem (including the phone number) on the first attempt.
  .refine(
    (d) => {
      const cc = typeof d.countryCode === "string" ? d.countryCode : "+91";
      const raw = typeof d.mobileNumber === "string" ? d.mobileNumber.trim() : "";
      return raw === "" || isValidMobile(normalizeMobile(raw, cc), cc);
    },
    {
      path: ["mobileNumber"],
      when: () => true,
      error: (iss) => {
        const cc = (iss.input as { countryCode?: unknown } | undefined)?.countryCode;
        return cc === undefined || cc === "+91"
          ? "Enter a valid 10-digit Indian mobile number (starting with 6, 7, 8 or 9)."
          : "Enter a valid mobile number (6–14 digits).";
      },
    },
  )
  .transform((data) => ({ ...data, mobileNumber: normalizeMobile(data.mobileNumber, data.countryCode) }));

export type FeedbackInput = z.input<typeof feedbackSchema>;
export type FeedbackData = z.output<typeof feedbackSchema>;

/** Anti-spam envelope sent alongside the form data (validated server-side only). */
export const submissionEnvelopeSchema = z.object({
  submissionKey: z.uuid(),
  startedAt: z.number().int().positive(),
  /** Honeypot — real visitors never see or fill this field. */
  website: z.string().max(200).optional(),
});

export type FieldErrors = Partial<Record<keyof FeedbackData | "form", string>>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = (issue.path[0] as keyof FeedbackData | undefined) ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
