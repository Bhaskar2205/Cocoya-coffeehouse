import { cacheLife } from "next/cache";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { InstagramIcon } from "@/components/icons";
import { directionsUrl, navigation, site } from "@/content/site";

/** Cached so the static shell can prerender (Cache Components guards Date). */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

export function SiteFooter() {
  const instagram = site.social.instagram;
  return (
    <footer className="cv-auto relative overflow-hidden bg-espresso text-foam [--cv-size:700px]">
      <div className="mx-auto max-w-[90rem] px-5 pt-20 pb-10 sm:px-6 lg:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Wordmark />
            <p className="font-display mt-6 max-w-sm text-2xl leading-snug font-light text-foam/80">{site.tagline}</p>
          </div>
          <nav aria-label="Footer" className="md:col-span-3">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">Explore</p>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-foam/70 md:grid-cols-1">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="transition-colors hover:text-gold">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#feedback" className="transition-colors hover:text-gold">
                  Feedback
                </a>
              </li>
            </ul>
          </nav>
          <div className="md:col-span-4">
            <p className="text-xs font-semibold tracking-[0.3em] text-gold/80 uppercase">Connect</p>
            <ul className="mt-5 flex flex-col gap-3 text-sm text-foam/70">
              <li>
                <a href={directionsUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-gold">
                  Directions <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              <li>
                <a href={site.googleProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-gold">
                  Google reviews <ArrowUpRight className="size-3.5" />
                </a>
              </li>
              {site.contact.phone && (
                <li>
                  <a href={`tel:${site.contact.phone}`} className="hover:text-gold">
                    {site.contact.phoneDisplay ?? site.contact.phone}
                  </a>
                </li>
              )}
              {instagram && (
                <li>
                  <a href={instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-gold">
                    <InstagramIcon className="size-4" /> {instagram.handle}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <svg aria-hidden viewBox="0 0 1000 200" className="pointer-events-none mt-16 block w-full select-none">
          <text x="500" y="170" textAnchor="middle" fontSize="235" letterSpacing="-9" fill="rgb(242 233 220 / 0.05)" style={{ fontFamily: "var(--font-fraunces)", fontWeight: 300 }}>
            COCOYA
          </text>
        </svg>

        <div className="mt-8 flex flex-col gap-3 border-t border-foam/10 pt-6 text-xs text-foam/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {site.name}. All rights reserved.
          </p>
          <p>Brewed with care · Made for slow moments</p>
        </div>
      </div>
    </footer>
  );
}
