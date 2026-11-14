/**
 * ============================================================================
 *  COCOYA — BUSINESS INFORMATION (single source of truth)
 * ============================================================================
 *
 *  Everything customers see about the café's identity, location and contact
 *  details comes from this file. Edit values here — no design changes needed.
 *
 *  ✅  Address, phone, opening hours and Instagram were confirmed by the owner
 *  (14 Nov 2026). Exact map coordinates (`geo`) are not set — the map and
 *  directions use the street address instead.
 *
 *  ⚠️  VERIFICATION HISTORY
 *  The Google Business reference supplied for this project
 *  (https://share.google/ESln9wFmyM6qYDGw9) could not be read automatically,
 *  and no other public source for the café was found. Every field below that
 *  is `null` is UNKNOWN and is deliberately hidden or replaced by a neutral
 *  message on the website. Nothing has been borrowed from other businesses.
 *
 *  When you fill a field in, the website starts displaying it automatically.
 *  Once all details are confirmed, set `verification.businessDetails` to
 *  "verified".
 * ============================================================================
 */

export type OpeningHours = {
  /** e.g. "Monday – Friday" */
  label: string;
  /** schema.org day names, used for structured data */
  days: Array<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday">;
  /** 24h "HH:MM" */
  opens: string;
  /** 24h "HH:MM" */
  closes: string;
};

export type SiteConfig = typeof site;

export const site = {
  name: "Cocoya Coffee House",
  shortName: "Cocoya",
  /** Public URL of the deployed site (set NEXT_PUBLIC_SITE_URL in production). */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_IN",
  tagline: "Every Cup Has a Story.",
  description:
    "Cocoya Coffee House in Malviya Nagar, Jaipur — handcrafted coffee, matcha, chilled signatures and a lantern-lit café to slow down in. Open daily 11:30 AM – 11:30 PM.",

  verification: {
    /** "unverified" until address, phone and hours are confirmed by the owner. */
    // Address, phone, hours and Instagram confirmed by the owner, 14 Nov 2026.
    businessDetails: "verified" as "unverified" | "verified",
  },

  /**
   * The Google Business link supplied by the owner. This is the one verified
   * reference we have, so "Find us on Google" and "Get directions" use it until
   * a street address / coordinates are added below.
   */
  googleProfileUrl: "https://share.google/ESln9wFmyM6qYDGw9",

  /** Path to a logo file in /public (SVG or PNG). `null` = typographic wordmark. */
  logo: null as string | null,

  contact: {
    /** E.164 format, e.g. "+919876543210". */
    phone: "+917742196527" as string | null,
    /** How the number should be displayed, e.g. "+91 98765 43210". */
    phoneDisplay: "+91 77421 96527" as string | null,
    email: null as string | null,
    /** WhatsApp number in E.164 format (optional). */
    whatsapp: null as string | null,
  },

  social: {
    /** e.g. { handle: "@cocoyacoffee", url: "https://www.instagram.com/cocoyacoffee/" } */
    instagram: { handle: "@cocoya_coffeehouse", url: "https://www.instagram.com/cocoya_coffeehouse/" } as { handle: string; url: string } | null,
  },

  location: {
    streetAddress: "4th Floor, 4/32, Pradhan Marg, Vidyut Abhiyanta Colony" as string | null,
    locality: "Sector 4, Malviya Nagar" as string | null,
    city: "Jaipur" as string | null,
    region: "Rajasthan" as string | null,
    postalCode: "302017" as string | null,
    /** The brief specifies an Indian café (INR pricing, +91 numbers). */
    countryCode: "IN",
    /** { lat: 0, lng: 0 } — enables the embedded map pin + structured data. */
    geo: null as { lat: number; lng: number } | null,
    /** Short landmark hint, e.g. "Opposite City Park". */
    landmark: null as string | null,
  },

  /** Leave empty until confirmed. Example entry:
   *  { label: "Every day", days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "08:00", closes: "23:00" }
   */
  hours: [
    // Confirmed by the owner (Google Business Profile), 14 Nov 2026.
    {
      label: "Every day",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "11:30",
      closes: "23:30",
    },
  ] as OpeningHours[],

  /** e.g. "₹₹" — shown in structured data only when set. */
  priceRange: null as string | null,
} as const;

/** Full single-line address, or null when not yet confirmed. */
export function formattedAddress(): string | null {
  const l = site.location;
  const parts = [l.streetAddress, l.locality, l.city, l.region, l.postalCode].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

/** Best available "get directions" link. */
export function directionsUrl(): string {
  const l = site.location;
  if (l.geo) return `https://www.google.com/maps/dir/?api=1&destination=${l.geo.lat},${l.geo.lng}`;
  const address = formattedAddress();
  if (address) return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${site.name}, ${address}`)}`;
  return site.googleProfileUrl;
}

/** Google Maps embed URL (no API key needed) — only when location is confirmed. */
export function mapEmbedUrl(): string | null {
  const l = site.location;
  if (l.geo) return `https://www.google.com/maps?q=${l.geo.lat},${l.geo.lng}&z=16&output=embed`;
  const address = formattedAddress();
  if (address) return `https://www.google.com/maps?q=${encodeURIComponent(`${site.name}, ${address}`)}&z=16&output=embed`;
  return null;
}

export const navigation = [
  { href: "#story", label: "Story" },
  { href: "#craft", label: "Craft" },
  { href: "#signature", label: "Signatures" },
  { href: "#menu", label: "Menu" },
  { href: "#cold", label: "Cold Coffee" },
  { href: "#experience", label: "The Café" },
  { href: "#reviews", label: "Reviews" },
  { href: "#visit", label: "Visit" },
] as const;
