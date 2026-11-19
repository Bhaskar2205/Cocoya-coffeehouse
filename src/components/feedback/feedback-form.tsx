"use client";

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowUpRight, Check, ChevronDown, Copy, Loader2, RotateCcw } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/feedback/star-rating";
import {
  COUNTRY_CODES,
  EXPERIENCE_OPTIONS,
  FEEDBACK_MAX_LENGTH,
  RECOMMENDATION_OPTIONS,
  feedbackSchema,
  flattenErrors,
  type FieldErrors,
} from "@/lib/feedback/schema";
import { googleReviewUrl, site } from "@/content/site";
import { cn } from "@/lib/utils";

type Values = {
  customerName: string;
  countryCode: string;
  mobileNumber: string;
  rating: number;
  experienceCategories: string[];
  additionalFeedback: string;
  recommendation: "" | "yes" | "maybe" | "no";
  privacyConsent: boolean;
  displayConsent: boolean;
};

const INITIAL: Values = {
  customerName: "",
  countryCode: "+91",
  mobileNumber: "",
  rating: 0,
  experienceCategories: [],
  additionalFeedback: "",
  recommendation: "",
  privacyConsent: false,
  displayConsent: false,
};

const FIELD_ORDER: Array<keyof FieldErrors> = [
  "customerName",
  "countryCode",
  "mobileNumber",
  "rating",
  "experienceCategories",
  "additionalFeedback",
  "recommendation",
  "privacyConsent",
];

const toPayload = (v: Values) => ({
  ...v,
  rating: v.rating || undefined,
  recommendation: v.recommendation || undefined,
});

/**
 * Turns the guest's answers into a ready-to-paste Google review, so they never
 * have to type the same thing twice. Google only accepts reviews posted by the
 * guest from their own account, so we hand them the words rather than post.
 */
function composeReview(v: Values): string {
  const labels = EXPERIENCE_OPTIONS.filter((o) => v.experienceCategories.includes(o.value)).map((o) =>
    o.value === "overall" ? "the overall experience" : o.label.toLowerCase(),
  );
  const liked =
    labels.length === 0
      ? ""
      : labels.length === 1
        ? labels[0]!
        : `${labels.slice(0, -1).join(", ")} and ${labels.at(-1)}`;

  const parts: string[] = [];
  const written = v.additionalFeedback.trim();
  if (written) parts.push(written);
  if (liked) parts.push(`I enjoyed the ${liked}.`);
  if (!written && !liked) {
    parts.push(v.rating >= 4 ? `Lovely visit to ${site.name}.` : `My visit to ${site.name}.`);
  }
  if (v.recommendation === "yes") parts.push(`Would definitely recommend ${site.shortName}!`);
  return parts.join(" ");
}

function uuid(): string {
  const c: Crypto = globalThis.crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  // Fallback for non-secure contexts (e.g. testing over a LAN IP).
  const b = c.getRandomValues(new Uint8Array(16));
  b[6] = (b[6]! & 0x0f) | 0x40;
  b[8] = (b[8]! & 0x3f) | 0x80;
  const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

const inputClass =
  "h-14 rounded-2xl border-roast/12 bg-foam/70 px-5 text-base text-roast shadow-none placeholder:text-cocoa/40 focus-visible:border-caramel focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-caramel/15 md:text-base aria-invalid:border-destructive/70 aria-invalid:ring-destructive/10";

export function FeedbackForm() {
  const uid = useId();
  const [values, setValues] = useState<Values>(INITIAL);
  const [attempted, setAttempted] = useState(false);
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [result, setResult] = useState<{ name: string; rating: number; review: string }>({
    name: "",
    rating: 0,
    review: "",
  });

  const startedAt = useRef(0);
  const submissionKey = useRef<string | null>(null);
  const inFlight = useRef(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const clientErrors = useMemo<FieldErrors>(() => {
    if (!attempted) return {};
    const parsed = feedbackSchema.safeParse(toPayload(values));
    return parsed.success ? {} : flattenErrors(parsed.error);
  }, [attempted, values]);

  const errors: FieldErrors = { ...serverErrors, ...clientErrors };
  const errorCount = Object.keys(errors).length;

  const ids = {
    name: `${uid}-name`,
    cc: `${uid}-cc`,
    mobile: `${uid}-mobile`,
    rating: `${uid}-rating`,
    enjoyed: `${uid}-enjoyed`,
    feedback: `${uid}-feedback`,
    rec: `${uid}-rec`,
    privacy: `${uid}-privacy`,
    display: `${uid}-display`,
  };
  const err = (key: keyof FieldErrors) => `${uid}-${key}-error`;

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (serverErrors[key as keyof FieldErrors]) {
      setServerErrors((prev) => {
        const next = { ...prev };
        delete next[key as keyof FieldErrors];
        return next;
      });
    }
  }

  function focusField(key: keyof FieldErrors) {
    const selector: Partial<Record<keyof FieldErrors, string>> = {
      customerName: `#${CSS.escape(ids.name)}`,
      countryCode: `#${CSS.escape(ids.cc)}`,
      mobileNumber: `#${CSS.escape(ids.mobile)}`,
      rating: `#${CSS.escape(ids.rating)} [role="radio"][tabindex="0"]`,
      experienceCategories: `#${CSS.escape(ids.enjoyed)} input`,
      additionalFeedback: `#${CSS.escape(ids.feedback)}`,
      recommendation: `#${CSS.escape(ids.rec)} input`,
      privacyConsent: `#${CSS.escape(ids.privacy)}`,
    };
    const el = selector[key] ? container.current?.querySelector<HTMLElement>(selector[key]!) : null;
    el?.focus({ preventScroll: false });
    el?.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return; // hard guard against double taps
    setAttempted(true);
    setFormError(null);

    const parsed = feedbackSchema.safeParse(toPayload(values));
    if (!parsed.success) {
      const found = flattenErrors(parsed.error);
      const first = FIELD_ORDER.find((k) => found[k]);
      if (first) requestAnimationFrame(() => focusField(first));
      return;
    }

    inFlight.current = true;
    setStatus("submitting");
    submissionKey.current ??= uuid();

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: toPayload(values),
          submissionKey: submissionKey.current,
          startedAt: startedAt.current,
          website: honeypot.current?.value || undefined,
        }),
      });
      const body = (await response.json().catch(() => null)) as
        | { ok: true }
        | { ok: false; error: string; fieldErrors?: FieldErrors }
        | null;

      if (response.ok && body?.ok) {
        setResult({
          name: parsed.data.customerName.split(" ")[0] ?? "",
          rating: parsed.data.rating,
          review: composeReview(values),
        });
        setStatus("success");
        submissionKey.current = null;
        requestAnimationFrame(() => container.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
        return;
      }

      const fieldErrors = body && !body.ok ? (body.fieldErrors ?? {}) : {};
      setServerErrors(fieldErrors);
      setFormError(body && !body.ok ? body.error : "Something went wrong. Please try again.");
      setStatus("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setFormError("We couldn't reach our server. Please check your connection and try again.");
      setStatus("idle");
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      inFlight.current = false;
    }
  }

  function reset() {
    setValues(INITIAL);
    setAttempted(false);
    setServerErrors({});
    setFormError(null);
    setStatus("idle");
    startedAt.current = Date.now();
  }

  const submitting = status === "submitting";
  const remaining = FEEDBACK_MAX_LENGTH - values.additionalFeedback.length;

  return (
    <div ref={container} className="scroll-mt-28 rounded-[2rem] bg-white p-6 shadow-[0_40px_120px_-50px_rgb(61_42_31/0.45)] ring-1 ring-roast/[0.06] sm:p-10">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <SuccessPanel key="success" name={result.name} rating={result.rating} review={result.review} onReset={reset} />
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            aria-describedby={`${uid}-required-note`}
            className="flex flex-col gap-8"
          >
            <p id={`${uid}-required-note`} className="text-xs text-cocoa/75">
              Fields marked <span className="text-caramel-deep">*</span> are required.
            </p>

            <AnimatePresence>
              {(formError || (attempted && errorCount > 0)) && (
                <motion.div
                  ref={summaryRef}
                  tabIndex={-1}
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-2xl outline-none"
                >
                  <div className="flex gap-3 rounded-2xl border border-destructive/20 bg-destructive/[0.06] p-4 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <p>
                      {formError ??
                        `Please check ${errorCount === 1 ? "the highlighted field" : `the ${errorCount} highlighted fields`} below.`}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Honeypot — hidden from people and assistive tech, irresistible to bots */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${uid}-website`}>Leave this field empty</label>
              <input ref={honeypot} id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            {/* 1 — Name */}
            <Field label="Full name" htmlFor={ids.name} required error={errors.customerName} errorId={err("customerName")}>
              <Input
                id={ids.name}
                name="name"
                autoComplete="name"
                autoCapitalize="words"
                maxLength={80}
                value={values.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                aria-invalid={!!errors.customerName || undefined}
                aria-describedby={errors.customerName ? err("customerName") : undefined}
                aria-required="true"
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>

            {/* 2 — Mobile */}
            <Field
              label="Mobile number"
              htmlFor={ids.mobile}
              required
              error={errors.mobileNumber ?? errors.countryCode}
              errorId={err("mobileNumber")}
              hint="We'll only use this to follow up on your feedback."
            >
              <div className="flex gap-2">
                <div className="relative">
                  <label htmlFor={ids.cc} className="sr-only">
                    Country code
                  </label>
                  <select
                    id={ids.cc}
                    name="countryCode"
                    value={values.countryCode}
                    onChange={(e) => update("countryCode", e.target.value)}
                    className={cn(
                      inputClass,
                      "w-[6.75rem] cursor-pointer appearance-none border pr-8 pl-4 font-medium outline-none sm:w-28",
                    )}
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-cocoa/75" />
                </div>
                <Input
                  id={ids.mobile}
                  name="mobile"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  maxLength={16}
                  value={values.mobileNumber}
                  onChange={(e) => update("mobileNumber", e.target.value.replace(/[^\d\s\-+()]/g, ""))}
                  aria-invalid={!!errors.mobileNumber || undefined}
                  aria-describedby={`${ids.mobile}-hint${errors.mobileNumber ? ` ${err("mobileNumber")}` : ""}`}
                  aria-required="true"
                  placeholder={values.countryCode === "+91" ? "98765 43210" : "Mobile number"}
                  className={cn(inputClass, "flex-1 tracking-wide")}
                />
              </div>
            </Field>

            {/* 3 — Rating */}
            <div id={ids.rating}>
              <p id={`${ids.rating}-label`} className="text-[0.95rem] font-semibold text-roast">
                How did you like Cocoya? <span className="text-caramel-deep">*</span>
              </p>
              <div className="mt-3">
                <StarRating
                  value={values.rating}
                  onChange={(n) => update("rating", n)}
                  labelledBy={`${ids.rating}-label`}
                  describedBy={errors.rating ? err("rating") : undefined}
                  invalid={!!errors.rating}
                />
              </div>
              <FieldError id={err("rating")} message={errors.rating} />
            </div>

            {/* 4 — Enjoyed */}
            <fieldset id={ids.enjoyed}>
              <legend className="text-[0.95rem] font-semibold text-roast">
                What did you enjoy? <span className="font-normal text-cocoa/75">(choose any)</span>
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {EXPERIENCE_OPTIONS.map((option) => {
                  const checked = values.experienceCategories.includes(option.value);
                  return (
                    <label key={option.value} className="relative cursor-pointer">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={checked}
                        onChange={() =>
                          update(
                            "experienceCategories",
                            checked
                              ? values.experienceCategories.filter((v) => v !== option.value)
                              : [...values.experienceCategories, option.value],
                          )
                        }
                      />
                      <motion.span
                        whileTap={{ scale: 0.94 }}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-caramel peer-focus-visible:ring-offset-2",
                          checked
                            ? "border-roast bg-roast text-foam"
                            : "border-roast/15 bg-foam/60 text-cocoa hover:border-roast/40",
                        )}
                      >
                        <AnimatePresence initial={false}>
                          {checked && (
                            <motion.span
                              initial={{ width: 0, opacity: 0 }}
                              animate={{ width: "auto", opacity: 1 }}
                              exit={{ width: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <Check className="size-3.5 text-gold" />
                            </motion.span>
                          )}
                        </AnimatePresence>
                        {option.label}
                      </motion.span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* 5 — Additional feedback */}
            <Field label="Additional feedback" htmlFor={ids.feedback} optional error={errors.additionalFeedback} errorId={err("additionalFeedback")}>
              <Textarea
                id={ids.feedback}
                name="feedback"
                rows={4}
                maxLength={FEEDBACK_MAX_LENGTH}
                value={values.additionalFeedback}
                onChange={(e) => update("additionalFeedback", e.target.value)}
                aria-invalid={!!errors.additionalFeedback || undefined}
                aria-describedby={`${ids.feedback}-count${errors.additionalFeedback ? ` ${err("additionalFeedback")}` : ""}`}
                placeholder="A favourite drink, a team member who made your day, something we could do better…"
                className="min-h-32 resize-y rounded-2xl border-roast/12 bg-foam/70 px-5 py-4 text-base leading-relaxed text-roast placeholder:text-cocoa/40 focus-visible:border-caramel focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-caramel/15 md:text-base"
              />
              <p
                id={`${ids.feedback}-count`}
                className={cn("mt-2 text-right text-xs tabular-nums", remaining < 80 ? "text-caramel-deep" : "text-cocoa/75")}
              >
                {remaining} characters left
              </p>
            </Field>

            {/* 6 — Recommend */}
            <fieldset id={ids.rec} aria-describedby={errors.recommendation ? err("recommendation") : undefined}>
              <legend className="text-[0.95rem] font-semibold text-roast">
                Would you recommend Cocoya? <span className="text-caramel-deep">*</span>
              </legend>
              <div className="mt-3 grid grid-cols-3 gap-2 rounded-full bg-foam/80 p-1.5 ring-1 ring-roast/10">
                {RECOMMENDATION_OPTIONS.map((option) => {
                  const checked = values.recommendation === option.value;
                  return (
                    <label key={option.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name={`${uid}-recommendation`}
                        value={option.value}
                        checked={checked}
                        onChange={() => update("recommendation", option.value)}
                        className="peer sr-only"
                      />
                      {checked && (
                        <motion.span
                          layoutId={`${uid}-rec-pill`}
                          className="absolute inset-0 rounded-full bg-roast shadow-md"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <span
                        className={cn(
                          "relative flex h-11 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-300 peer-focus-visible:ring-2 peer-focus-visible:ring-caramel",
                          checked ? "text-foam" : "text-cocoa hover:text-roast",
                        )}
                      >
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
              <FieldError id={err("recommendation")} message={errors.recommendation} />
            </fieldset>

            {/* 7 — Consent */}
            <div className="flex flex-col gap-4 rounded-2xl bg-foam/70 p-5 ring-1 ring-roast/[0.06]">
              <div className="flex items-start gap-3">
                <Checkbox
                  id={ids.privacy}
                  checked={values.privacyConsent}
                  onCheckedChange={(c) => update("privacyConsent", c === true)}
                  aria-invalid={!!errors.privacyConsent || undefined}
                  aria-describedby={errors.privacyConsent ? err("privacyConsent") : undefined}
                  aria-required="true"
                  className="mt-0.5 size-5 rounded-md border-roast/30 bg-white data-checked:border-roast data-checked:bg-roast data-checked:text-foam"
                />
                <label htmlFor={ids.privacy} className="cursor-pointer text-sm leading-relaxed text-cocoa">
                  I agree that {site.name} may use my name and mobile number to manage my feedback and to contact me
                  about it if needed. My details won&apos;t be shared or used for promotional messages.{" "}
                  <span className="text-caramel-deep">*</span>
                </label>
              </div>
              <FieldError id={err("privacyConsent")} message={errors.privacyConsent} className="mt-0 pl-8" />
              <div className="flex items-start gap-3 border-t border-roast/[0.06] pt-4">
                <Checkbox
                  id={ids.display}
                  checked={values.displayConsent}
                  onCheckedChange={(c) => update("displayConsent", c === true)}
                  className="mt-0.5 size-5 rounded-md border-roast/30 bg-white data-checked:border-roast data-checked:bg-roast data-checked:text-foam"
                />
                <label htmlFor={ids.display} className="cursor-pointer text-sm leading-relaxed text-cocoa/80">
                  <span className="font-medium text-cocoa">Optional:</span> you may feature my comments on the Cocoya
                  website (first name and last initial only, never my number).
                </label>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={submitting}
              aria-disabled={submitting}
              whileTap={submitting ? undefined : { scale: 0.98 }}
              className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-roast text-base font-semibold text-foam shadow-[0_20px_50px_-20px_rgb(23_16_11/0.8)] transition-colors duration-500 hover:bg-espresso disabled:cursor-wait disabled:opacity-90"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/25 to-transparent transition-transform duration-1000 ease-cinematic group-hover:translate-x-full" />
              {submitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" aria-hidden />
                  Sending your experience…
                </>
              ) : (
                <>
                  Submit My Experience
                  <ArrowUpRight className="size-5 text-gold transition-transform duration-500 group-hover:rotate-45" aria-hidden />
                </>
              )}
            </motion.button>
            <p className="sr-only" aria-live="polite">
              {submitting ? "Sending your feedback" : ""}
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  optional,
  hint,
  error,
  errorId,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  errorId: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2.5 block text-[0.95rem] font-semibold text-roast">
        {label} {required && <span className="text-caramel-deep">*</span>}
        {optional && <span className="font-normal text-cocoa/75">(optional)</span>}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="mt-2 text-xs text-cocoa/75">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

function FieldError({ id, message, className }: { id: string; message?: string; className?: string }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className={cn("mt-2 flex items-center gap-1.5 text-sm text-destructive", className)}
        >
          <AlertCircle className="size-3.5 shrink-0" aria-hidden />
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

function SuccessPanel({
  name,
  rating,
  review,
  onReset,
}: {
  name: string;
  rating: number;
  review: string;
  onReset: () => void;
}) {
  const delighted = rating >= 4;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center py-8 text-center sm:py-12"
      role="status"
      aria-live="polite"
    >
      <div className="relative grid size-32 place-items-center">
        {/* Bean burst */}
        {Array.from({ length: 10 }, (_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              aria-hidden
              className="absolute size-2.5 rounded-full bg-caramel"
              style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{ x: Math.cos(angle) * 78, y: Math.sin(angle) * 78, opacity: [0, 1, 0], scale: [0, 1, 0.6], rotate: 180 }}
              transition={{ duration: 1.2, delay: 0.75, ease: "easeOut" }}
            />
          );
        })}
        <svg viewBox="0 0 100 100" className="size-28 text-roast" aria-hidden>
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth="2.5"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
            style={{ originX: "50%", originY: "50%" }}
          />
          <motion.path
            d="M30 52 L44 66 L71 37"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
          />
        </svg>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6 }}>
        <h3 className="font-display mt-6 text-[2.4rem] leading-tight font-light tracking-tight text-roast">
          Thank you{name ? `, ${name}` : ""}!
        </h3>
        <p className="mx-auto mt-4 max-w-sm leading-relaxed text-pretty text-cocoa/80">
          {delighted
            ? "We're delighted you enjoyed your visit. Your words mean the world to our team — we can't wait to pour your next cup."
            : "Thank you for being honest with us. Our team will read your feedback carefully and use it to make your next visit better."}
        </p>
        <GoogleReviewShare rating={rating} initialText={review} />
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-roast/15 px-6 text-sm font-semibold text-roast transition hover:border-roast/40"
          >
            <RotateCcw className="size-4" /> Submit another response
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Copies text, falling back to a hidden textarea where the Clipboard API is unavailable (e.g. plain http on a LAN IP). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

/**
 * Shown to every guest regardless of rating — Google's policy forbids only
 * inviting happy customers to review ("review gating").
 */
function GoogleReviewShare({ rating, initialText }: { rating: number; initialText: string }) {
  const uid = useId();
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState(false);
  const href = googleReviewUrl();

  // The link opens Google in a new tab on its own; we just put the words on the clipboard first.
  function onShare() {
    void copyText(text).then(setCopied);
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-md rounded-2xl bg-foam/70 p-5 text-left ring-1 ring-roast/[0.06]">
      <label htmlFor={`${uid}-review`} className="block text-[0.95rem] font-semibold text-roast">
        {rating >= 4 ? "Post the same on Google in one tap" : "Want to share this on Google too?"}
      </label>
      <p id={`${uid}-review-hint`} className="mt-1 text-xs leading-relaxed text-cocoa/75">
        We&apos;ve written up your feedback below. You can edit it. Tap the button: we copy it and open Google. Pick
        your {rating} {rating === 1 ? "star" : "stars"}, paste, and post.
      </p>
      <Textarea
        id={`${uid}-review`}
        rows={4}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setCopied(false);
        }}
        aria-describedby={`${uid}-review-hint`}
        className="mt-3 min-h-28 resize-y rounded-2xl border-roast/12 bg-white px-4 py-3 text-sm leading-relaxed text-roast focus-visible:border-caramel focus-visible:ring-4 focus-visible:ring-caramel/15"
      />
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onShare}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-roast px-6 text-sm font-semibold text-foam transition hover:bg-espresso"
      >
        {copied ? <Check className="size-4 text-gold" aria-hidden /> : <Copy className="size-4 text-gold" aria-hidden />}
        {copied ? "Copied! Paste it on Google" : "Copy & post on Google"}
        <ArrowUpRight className="size-4 text-gold" aria-hidden />
      </a>
      <p className="sr-only" aria-live="polite">
        {copied ? "Review text copied to clipboard" : ""}
      </p>
    </div>
  );
}
