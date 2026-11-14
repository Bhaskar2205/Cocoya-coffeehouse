import { ArrowUpRight, Clock, MapPin, Navigation, Phone } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/ui/photo";
import { InstagramIcon } from "@/components/icons";
import { OpenStatus } from "@/components/open-status";
import { directionsUrl, formattedAddress, mapEmbedUrl, site } from "@/content/site";
import { visitCopy } from "@/content/copy";
import { formatTime12h } from "@/lib/format";

export function Visit() {
  const address = formattedAddress();
  const embed = mapEmbedUrl();
  const { phone, phoneDisplay } = site.contact;
  const instagram = site.social.instagram;

  return (
    <section id="visit" aria-labelledby="visit-title" className="cv-auto grain relative overflow-hidden bg-roast text-foam [--cv-size:1700px] lg:[--cv-size:1100px]">
      <div className="relative mx-auto grid max-w-[90rem] gap-14 px-5 py-28 sm:px-6 md:py-36 lg:grid-cols-12 lg:gap-16 lg:px-10">
        <div className="lg:col-span-5">
          <SectionHeading
            id="visit-title"
            eyebrow={visitCopy.eyebrow}
            title={visitCopy.headline}
            accent={["Slow", "down."]}
            accentClassName="italic text-gold"
            supporting={visitCopy.supporting}
            eyebrowClassName="text-gold"
          />

          <dl className="mt-12 flex flex-col divide-y divide-foam/10 border-y border-foam/10">
            <Reveal className="flex gap-5 py-6">
              <dt className="mt-0.5">
                <MapPin className="size-5 text-gold" aria-hidden />
                <span className="sr-only">Address</span>
              </dt>
              <dd className="flex-1">
                {address ? (
                  <address className="text-lg leading-relaxed not-italic">
                    {site.name}
                    <br />
                    {address}
                    {site.location.landmark && <span className="mt-1 block text-sm text-foam/60">{site.location.landmark}</span>}
                  </address>
                ) : (
                  <p className="leading-relaxed text-foam/80">
                    Find {site.name} on Google Maps for our exact location and directions.
                  </p>
                )}
              </dd>
            </Reveal>

            <Reveal delay={0.05} className="flex gap-5 py-6">
              <dt className="mt-0.5">
                <Clock className="size-5 text-gold" aria-hidden />
                <span className="sr-only">Opening hours</span>
              </dt>
              <dd className="flex-1">
                {site.hours.length > 0 ? (
                  <>
                  <OpenStatus className="mb-3" />
                  <ul className="flex flex-col gap-2">
                    {site.hours.map((h) => (
                      <li key={h.label} className="flex items-baseline justify-between gap-4">
                        <span className="text-foam/80">{h.label}</span>
                        <span className="font-medium tabular-nums">
                          {formatTime12h(h.opens)} – {formatTime12h(h.closes)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  </>
                ) : (
                  <p className="leading-relaxed text-foam/80">
                    Today&apos;s opening hours are listed on our{" "}
                    <a
                      href={site.googleProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold underline decoration-gold/40 underline-offset-4 hover:decoration-gold"
                    >
                      Google profile
                    </a>
                    .
                  </p>
                )}
              </dd>
            </Reveal>

            {(phone || instagram) && (
              <Reveal delay={0.1} className="flex gap-5 py-6">
                <dt className="mt-0.5">
                  <Phone className="size-5 text-gold" aria-hidden />
                  <span className="sr-only">Contact</span>
                </dt>
                <dd className="flex flex-1 flex-col gap-2">
                  {phone && (
                    <a href={`tel:${phone}`} className="text-lg hover:text-gold">
                      {phoneDisplay ?? phone}
                    </a>
                  )}
                  {instagram && (
                    <a
                      href={instagram.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-foam/80 hover:text-gold"
                    >
                      <InstagramIcon className="size-4" /> {instagram.handle}
                    </a>
                  )}
                </dd>
              </Reveal>
            )}
          </dl>

          <Reveal delay={0.15} className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={directionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-gold px-8 font-semibold text-espresso transition-all duration-500 ease-cinematic hover:bg-cream"
            >
              <Navigation className="size-4" aria-hidden /> Get Directions
            </a>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-foam/20 px-7 font-semibold text-foam transition hover:border-foam/60"
              >
                <Phone className="size-4" aria-hidden /> Call Us
              </a>
            )}
            {instagram && (
              <a
                href={instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-14 items-center justify-center gap-3 rounded-full border border-foam/20 px-7 font-semibold text-foam transition hover:border-foam/60"
              >
                <InstagramIcon className="size-4" /> Instagram
              </a>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.1} y={40} className="lg:col-span-7">
          {embed ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-mocha ring-1 ring-gold/20 sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[36rem]">
              {/* Warm "night" styling so Google's map matches the café's palette */}
              <iframe
                src={embed}
                title={`Map showing the location of ${site.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="absolute inset-0 size-full border-0 [filter:invert(0.9)_hue-rotate(180deg)_saturate(0.6)_sepia(0.3)_brightness(0.92)]"
              />
              <div className="pointer-events-none absolute inset-0 rounded-[2rem] shadow-[inset_0_0_80px_rgb(13_8_6/0.55)]" />
            </div>
          ) : (
            <a
              href={directionsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-[2rem] p-8 ring-1 ring-foam/10 sm:aspect-[4/3] sm:p-10 lg:aspect-auto lg:h-full lg:min-h-[36rem]"
            >
              <Photo
                src="/images/cocoya/interior/bar-lanterns.jpg"
                alt=""
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover object-[50%_55%] transition-transform duration-[2000ms] ease-cinematic group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/60 to-espresso/20" />
              <div className="absolute top-8 left-8 grid size-16 place-items-center rounded-full bg-gold text-espresso shadow-[0_0_0_12px_rgb(214_178_122/0.15)] sm:top-10 sm:left-10">
                <MapPin className="size-7" aria-hidden />
                <span className="absolute inset-0 animate-ping rounded-full bg-gold/30" />
              </div>
              <div className="relative">
                <p className="eyebrow text-gold">Find us</p>
                <p className="font-display mt-4 max-w-md text-4xl leading-[1.05] font-light text-foam sm:text-5xl">
                  Open {site.shortName} in Google Maps
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foam/85">
                  Location, live hours &amp; directions
                  <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </div>
            </a>
          )}
        </Reveal>
      </div>
    </section>
  );
}
