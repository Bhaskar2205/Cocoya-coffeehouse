import { BellOff, Lock, MessageCircleHeart } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { ImageReveal, Reveal } from "@/components/motion/reveal";
import { Photo } from "@/components/ui/photo";
import { LazyFeedbackForm } from "@/components/feedback/lazy-feedback-form";
import { RecentFeedback } from "@/components/feedback/recent-feedback";
import { feedbackCopy } from "@/content/copy";

const promises = [
  { icon: MessageCircleHeart, title: "Read by our team", text: "Every response reaches the people who make your coffee." },
  { icon: Lock, title: "Kept private", text: "Your number is only visible to authorised café staff." },
  { icon: BellOff, title: "No spam, ever", text: "We never send promotional messages from this form." },
];

export function Feedback() {
  return (
    <section id="feedback" aria-labelledby="feedback-title" className="cv-auto relative scroll-mt-0 bg-foam text-roast [--cv-size:2400px] lg:[--cv-size:1700px]">
      <div className="mx-auto grid max-w-[90rem] gap-14 px-5 py-28 sm:px-6 md:py-36 lg:grid-cols-12 lg:gap-12 lg:px-10">
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <SectionHeading
            id="feedback-title"
            eyebrow={feedbackCopy.eyebrow}
            title={feedbackCopy.headline}
            accent={["Cocoya"]}
            supporting={feedbackCopy.supporting}
            titleClassName="text-[clamp(2.25rem,1.5rem+2.8vw,4.25rem)]"
          />
          <ImageReveal className="mt-10 hidden aspect-[16/11] rounded-[1.75rem] lg:block">
            <Photo
              src="/images/cocoya/food/basil-chilli-top.jpg"
              alt="Crispy chilli basil and an iced matcha on a table at Cocoya"
              fill
              sizes="(min-width: 1024px) 38vw, 1px"
              className="object-cover"
            />
          </ImageReveal>
          <ul className="mt-10 grid gap-5 sm:grid-cols-3 lg:grid-cols-1">
            {promises.map(({ icon: Icon, title, text }, i) => (
              <li key={title}>
                <Reveal delay={i * 0.08} className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sand text-caramel-deep">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-semibold text-roast">{title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-cocoa/70">{text}</span>
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <Reveal delay={0.1} y={40} className="lg:col-span-7">
          <RecentFeedback />
          <LazyFeedbackForm />
        </Reveal>
      </div>
    </section>
  );
}
