import { formattedAddress, site } from "@/content/site";
import { menuCategories, menuItems, menuMeta } from "@/content/menu";

/**
 * schema.org CafeOrCoffeeShop (a LocalBusiness / FoodEstablishment subtype).
 * Only fields that are actually filled in `src/content/site.ts` are emitted —
 * unverified data is never published to search engines.
 */
export function StructuredData() {
  const l = site.location;
  const address = formattedAddress();

  const business: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    "@id": `${site.url}/#cafe`,
    name: site.name,
    url: site.url,
    description: site.description,
    image: [`${site.url}/images/cocoya/drinks/mango-matcha.jpg`, `${site.url}/images/cocoya/interior/dining-hall.jpg`, `${site.url}/images/cocoya/interior/bar-counter.jpg`],
    servesCuisine: ["Coffee", "Café"],
    hasMenu: `${site.url}/#menu`,
    currenciesAccepted: "INR",
  };

  if (address) {
    business.address = {
      "@type": "PostalAddress",
      streetAddress: l.streetAddress ?? undefined,
      addressLocality: l.city ?? l.locality ?? undefined,
      addressRegion: l.region ?? undefined,
      postalCode: l.postalCode ?? undefined,
      addressCountry: l.countryCode,
    };
  }
  if (l.geo) business.geo = { "@type": "GeoCoordinates", latitude: l.geo.lat, longitude: l.geo.lng };
  if (site.contact.phone) business.telephone = site.contact.phone;
  if (site.priceRange) business.priceRange = site.priceRange;
  if (site.hours.length) {
    business.openingHoursSpecification = site.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days.map((d) => `https://schema.org/${d}`),
      opens: h.opens,
      closes: h.closes,
    }));
  }
  const sameAs = [site.social.instagram?.url].filter(Boolean);
  if (sameAs.length) business.sameAs = sameAs;

  const graphs: Record<string, unknown>[] = [
    business,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "en-IN",
    },
  ];

  // Publish the menu to search engines only once it is the café's verified menu.
  if (menuMeta.status === "verified") {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "Menu",
      "@id": `${site.url}/#menu`,
      name: `${site.name} Menu`,
      inLanguage: "en-IN",
      hasMenuSection: menuCategories
        .map((c) => ({
          "@type": "MenuSection",
          name: c.name,
          hasMenuItem: menuItems
            .filter((i) => i.category === c.id)
            .map((i) => ({
              "@type": "MenuItem",
              name: i.name,
              description: i.description,
              image: `${site.url}${i.image}`,
              ...(menuMeta.showPrices && i.price !== null && {
                offers: { "@type": "Offer", price: i.price, priceCurrency: "INR" },
              }),
              ...(i.diet === "veg" && { suitableForDiet: "https://schema.org/VegetarianDiet" }),
            })),
        }))
        .filter((s) => s.hasMenuItem.length > 0),
    });
  }

  return (
    <script
      type="application/ld+json"
      // JSON.stringify output with "<" escaped cannot break out of the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graphs).replace(/</g, "\\u003c") }}
    />
  );
}
