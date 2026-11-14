import { Reveal, RevealText } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  id?: string;
  eyebrow: string;
  title: string;
  accent?: string[];
  accentClassName?: string;
  supporting?: string;
  align?: "left" | "center";
  className?: string;
  titleClassName?: string;
  eyebrowClassName?: string;
  supportingClassName?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  accent,
  accentClassName,
  supporting,
  align = "left",
  className,
  titleClassName,
  eyebrowClassName,
  supportingClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <Reveal y={12}>
        <p className={cn("eyebrow text-caramel-deep", align === "center" && "justify-center", eyebrowClassName)}>{eyebrow}</p>
      </Reveal>
      <RevealText
        as="h2"
        id={id}
        text={title}
        accent={accent}
        accentClassName={accentClassName}
        className={cn("font-display mt-5 text-headline font-light tracking-[-0.02em] text-balance", titleClassName)}
      />
      {supporting && (
        <Reveal delay={0.15} y={16}>
          <p
            className={cn(
              "mt-6 max-w-xl text-base leading-relaxed text-pretty opacity-75 md:text-lg",
              align === "center" && "mx-auto",
              supportingClassName,
            )}
          >
            {supporting}
          </p>
        </Reveal>
      )}
    </div>
  );
}
