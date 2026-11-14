import { BeanMark } from "@/components/brand";
import { ImageReveal, Reveal, RevealText } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { Photo } from "@/components/ui/photo";
import { storyCopy } from "@/content/copy";

export function Story() {
  return (
    <section id="story" aria-labelledby="story-title" className="relative overflow-hidden bg-foam text-roast">
      <div className="mx-auto max-w-[90rem] px-5 pt-28 pb-24 sm:px-6 md:pt-36 md:pb-32 lg:px-10">
        {/* Statement */}
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal y={12}>
              <p className="eyebrow text-caramel-deep">{storyCopy.eyebrow}</p>
            </Reveal>
            <RevealText
              as="h2"
              id="story-title"
              text={storyCopy.headline}
              accent={["Feeling."]}
              className="font-display mt-6 text-headline font-light tracking-[-0.025em] text-balance"
            />
          </div>
          <Reveal delay={0.2} className="self-end lg:col-span-4 lg:col-start-9">
            <p className="font-display text-xl leading-snug font-light text-pretty text-cocoa md:text-2xl">{storyCopy.lead}</p>
          </Reveal>
        </div>

        {/* Editorial collage */}
        <div className="mt-16 grid grid-cols-6 gap-3 sm:gap-4 md:mt-24 md:grid-cols-12 md:gap-6">
          <div className="col-span-4 md:col-span-5 md:row-span-2">
            <Parallax speed={-8}>
              <ImageReveal className="aspect-[4/5] rounded-[1.75rem]">
                <Photo
                  src="/images/cocoya/interior/bar-angle.jpg"
                  alt="The Cocoya bar with its glowing sign, green relief wall and paper lanterns"
                  fill
                  sizes="(min-width: 768px) 40vw, 66vw"
                  className="object-cover"
                />
              </ImageReveal>
            </Parallax>
          </div>

          <div className="col-span-2 self-end md:col-span-3 md:self-start md:pt-24">
            <Parallax speed={-18}>
              <ImageReveal delay={0.15} className="aspect-[3/4] rounded-[1.25rem] md:rounded-[1.5rem]">
                <Photo
                  src="/images/cocoya/drinks/strawberry-matcha-top.jpg"
                  alt="A strawberry matcha at the edge of a white table at Cocoya"
                  fill
                  sizes="(min-width: 768px) 24vw, 33vw"
                  className="object-cover"
                />
              </ImageReveal>
            </Parallax>
          </div>

          <Reveal delay={0.1} className="col-span-6 flex flex-col justify-between gap-8 py-2 md:col-span-4 md:pl-4">
            <BeanMark className="hidden size-10 text-caramel-deep md:block" />
            <p className="max-w-sm text-[1.02rem] leading-relaxed text-pretty text-cocoa/85">{storyCopy.body}</p>
          </Reveal>

          <div className="col-span-6 md:col-span-7 md:col-start-6">
            <Parallax speed={-6}>
              <ImageReveal delay={0.1} className="aspect-[16/10] rounded-[1.75rem]">
                <Photo
                  src="/images/cocoya/interior/lounge-wide.jpg"
                  alt="Cocoya's lounge with a curved white sofa beneath a striped paper lantern"
                  fill
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="object-cover"
                />
              </ImageReveal>
            </Parallax>
          </div>
        </div>

        {/* Pillars */}
        <ol className="mt-20 grid gap-x-8 gap-y-12 sm:grid-cols-2 md:mt-28 lg:grid-cols-4">
          {storyCopy.pillars.map((pillar, i) => (
            <li key={pillar.title} className="border-t border-roast/15 pt-6">
              <Reveal delay={i * 0.08} y={20}>
                <span className="font-display text-sm text-caramel-deep italic">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display mt-3 text-[1.75rem] font-light tracking-tight">{pillar.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-pretty text-cocoa/80">{pillar.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>

      {/* Marquee band */}
      <div aria-hidden className="relative overflow-hidden border-y border-foam/5 bg-espresso py-6 text-cream md:py-8">
        <div className="flex w-max animate-marquee items-center">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center">
              {storyCopy.marquee.map((word) => (
                <span key={`${dup}-${word}`} className="flex items-center">
                  <span className="font-display px-6 text-3xl font-light whitespace-nowrap italic md:px-10 md:text-5xl">{word}</span>
                  <BeanMark className="size-5 text-gold/70 md:size-6" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
