import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/ui/photo";
import { galleryImages, galleryMeta } from "@/content/gallery";
import { experienceCopy } from "@/content/copy";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="cv-auto relative bg-sand text-roast [--cv-size:5600px] md:[--cv-size:3400px] lg:[--cv-size:2800px]">
      <div className="mx-auto max-w-[90rem] px-5 py-28 sm:px-6 md:py-36 lg:px-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="experience-title"
            eyebrow={experienceCopy.eyebrow}
            title={experienceCopy.headline}
            accent={["slowing", "down."]}
            supporting={experienceCopy.supporting}
          />
          <Reveal delay={0.2}>
            <a
              href={site.googleProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-roast/20 px-5 py-3 text-sm font-semibold text-roast transition-all duration-500 ease-cinematic hover:border-roast hover:bg-roast hover:text-foam"
            >
              See Cocoya on Google
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </a>
          </Reveal>
        </div>

        <ul className="mt-14 columns-1 gap-4 sm:columns-2 md:mt-20 md:gap-5 lg:columns-3">
          {galleryImages.map((image, i) => (
            <li key={image.src} className="mb-4 break-inside-avoid md:mb-5">
              <figure className="group relative">
                <ImageReveal
                  delay={(i % 3) * 0.12}
                  className={cn(
                    "rounded-[1.5rem]",
                    image.orientation === "portrait" ? "aspect-[3/4]" : i % 4 === 0 ? "aspect-[4/3]" : "aspect-[3/2]",
                  )}
                >
                  <Photo
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                    className="object-cover transition-transform duration-[1600ms] ease-cinematic group-hover:scale-[1.06]"
                  />
                </ImageReveal>
                <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-t from-espresso/70 via-espresso/0 to-transparent opacity-80 transition-opacity duration-700 md:opacity-0 md:group-hover:opacity-100" />
                <figcaption className="pointer-events-none absolute bottom-4 left-5 flex items-center gap-3 text-foam transition-all duration-700 ease-cinematic md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
                  <span className="font-display text-sm text-gold italic">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-xl font-light">{image.caption}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        {galleryMeta.illustrative && (
          <p className="mt-8 text-center text-xs text-cocoa/75">
            Illustrative photography — Cocoya&apos;s own café photos are coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
