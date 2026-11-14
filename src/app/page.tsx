import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { ProductDialogProvider } from "@/components/menu/product-dialog";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { StructuredData } from "@/components/structured-data";
import { Preloader } from "@/components/magic/preloader";
import { MagicCursor } from "@/components/magic/cursor";
import { Hero } from "@/components/sections/hero";
import { Story } from "@/components/sections/story";
import { Journey } from "@/components/sections/journey";
import { RatioLab } from "@/components/sections/ratio-lab";
import { Signature } from "@/components/sections/signature";
import { MenuSection } from "@/components/menu/menu-section";
import { ColdCoffee } from "@/components/sections/cold-coffee";
import { Experience } from "@/components/sections/experience";
import { Reviews } from "@/components/sections/reviews";
import { Feedback } from "@/components/sections/feedback";
import { Visit } from "@/components/sections/visit";

export default function HomePage() {
  return (
    <SmoothScroll>
      <ProductDialogProvider>
        <StructuredData />
        <Preloader />
        <MagicCursor />
        <SiteHeader />
        <main id="main" tabIndex={-1} className="outline-none">
          <Hero />
          <Story />
          <Journey />
          <RatioLab />
          <Signature />
          <MenuSection />
          <ColdCoffee />
          <Experience />
          <Reviews />
          <Feedback />
          <Visit />
        </main>
        <SiteFooter />
        <BackToTop />
      </ProductDialogProvider>
    </SmoothScroll>
  );
}
