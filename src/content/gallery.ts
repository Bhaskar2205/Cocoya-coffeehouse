/**
 * The Café Experience — gallery images.
 *
 * These are Cocoya's own photographs (supplied by the café, enhanced with
 * `node scripts/cocoya-photos.mjs`). To add more: drop originals into
 * photos/cocoya-originals, add them to that script, run it, then list them here.
 */

export type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  /** Visual weight in the masonry grid. */
  orientation: "portrait" | "landscape";
};

export const galleryMeta = {
  /** true = stock/illustrative photos (shows a small honest note). */
  illustrative: false,
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/cocoya/interior/dining-hall.jpg",
    alt: "Cocoya's dining hall with cane chairs, white tables and glowing paper lanterns",
    caption: "The lantern hall",
    orientation: "landscape",
  },
  {
    src: "/images/cocoya/interior/bar-lanterns.jpg",
    alt: "The textured Cocoya bar with its illuminated sign, planters and lanterns",
    caption: "The bar, after dark",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/drinks/strawberry-matcha-alt.jpg",
    alt: "A layered strawberry matcha drink on a white table at Cocoya",
    caption: "Strawberry matcha",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/interior/lounge-wide.jpg",
    alt: "A lounge corner with a curved white sofa, a carved wooden wall installation and a lantern",
    caption: "The lounge",
    orientation: "landscape",
  },
  {
    src: "/images/cocoya/food/basil-chilli-plate.jpg",
    alt: "Crispy chilli bites with fried basil served on a dark-rimmed plate",
    caption: "From the kitchen",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/interior/bar-counter.jpg",
    alt: "The Cocoya counter with its glowing sign, green relief wall and fresh planters",
    caption: "Golden light at the bar",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/drinks/orange-espresso-window.jpg",
    alt: "An orange espresso in a stemmed glass by the window with cane chairs behind",
    caption: "Orange espresso",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/interior/dining-curtains.jpg",
    alt: "A quiet dining corner with cane chairs, soft curtains and lanterns",
    caption: "Quiet corners",
    orientation: "landscape",
  },
  {
    src: "/images/cocoya/drinks/iced-latte-alt.jpg",
    alt: "An iced latte in a ribbed glass catching the light",
    caption: "Iced latte",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/interior/lounge.jpg",
    alt: "The lounge sofa beneath a striped paper lantern and carved wall roundels",
    caption: "Sink-in seating",
    orientation: "portrait",
  },
  {
    src: "/images/cocoya/food/basil-chilli-top.jpg",
    alt: "A plate of crispy chilli basil seen from above with an iced matcha beside it",
    caption: "Plates to share",
    orientation: "landscape",
  },
  {
    src: "/images/cocoya/drinks/vietnamese-drip-alt.jpg",
    alt: "A Vietnamese phin filter dripping coffee at the Cocoya bar",
    caption: "Slow drip",
    orientation: "portrait",
  },
];
