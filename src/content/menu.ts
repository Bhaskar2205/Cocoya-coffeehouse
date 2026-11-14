/**
 * ============================================================================
 *  COCOYA — DIGITAL MENU DATA
 * ============================================================================
 *
 *  The whole menu section, the signature carousel and the cold-coffee chapter
 *  are generated from this file. To update the menu:
 *
 *    • Change a price      → edit `price` (a number in rupees, e.g. 220)
 *    • Add an item         → copy an entry, give it a unique `id`
 *    • Remove an item      → delete the entry
 *    • Add a category      → add it to `menuCategories`; empty categories hide
 *    • Change a photo      → put the file in /public/images/menu and update `image`
 *                            (run `npm run images:process` to grade + blur it)
 *    • Mark a bestseller   → `bestseller: true` (only when genuinely verified)
 *
 *  📸  "COCOYA SPECIALS" — real drinks & dishes from photos supplied by the café.
 *  Their NAMES are descriptive (what the photo shows) until the café confirms
 *  the official menu names. Prices are intentionally not shown.
 *
 *  ⚠️  STATUS: SAMPLE MENU (other categories)
 *  Cocoya's real menu could not be retrieved from the supplied reference. The
 *  items below are common coffee-house drinks used as an editable starting
 *  point. They are NOT presented as Cocoya's confirmed offering:
 *    • `menuMeta.status` is "sample", which shows a clear notice on the site.
 *    • Prices are not shown on the website at all (`menuMeta.showPrices = false`).
 *    • No item is marked as a bestseller.
 *  Replace these with the café's real menu, then set `status` to "verified".
 * ============================================================================
 */

export type Diet = "veg" | "non-veg" | "egg";

export type MenuCategoryId =
  | "specials"
  | "hot-coffee"
  | "iced-coffee"
  | "frappes"
  | "shakes"
  | "tea-chocolate"
  | "coolers"
  | "desserts"
  | "food";

export type MenuCategory = {
  id: MenuCategoryId;
  name: string;
  /** Short line shown under the category title. */
  tagline: string;
};

export type MenuItem = {
  id: string;
  name: string;
  category: MenuCategoryId;
  /** One or two sentences shown on the card. */
  description: string;
  /** Longer text for the detail modal (optional). */
  details?: string;
  /** Price in INR (only displayed if `menuMeta.showPrices` is true). */
  price: number | null;
  /** Optional size / serving note, e.g. "300 ml" or "Regular". */
  serving?: string;
  /** Path under /public. Each item must use a photo of that actual drink/dish. */
  image: string;
  imageAlt: string;
  /** Vegetarian marker. `null`/undefined = unknown → no marker shown. */
  diet?: Diet | null;
  /** Show the Bestseller badge. Only set when verified by the café. */
  bestseller?: boolean;
  /** Featured in the Signature Collection carousel. */
  signature?: boolean;
  /** Featured in "The Art of Cold Coffee" chapter. */
  coldFeature?: boolean;
  /** Small descriptors, e.g. ["Hot"], ["Iced", "Creamy"]. */
  tags?: string[];
};

export const menuMeta = {
  status: "sample" as "sample" | "verified",
  /** The café prefers not to show prices online. Keep false to hide every price. */
  showPrices: false,
  currency: "INR",
  /** ISO date of the last menu update, shown on the site when set. */
  lastUpdated: null as string | null,
  /** Small print under the menu (taxes, allergens, etc.). */
  footnote: "Please let our team know about any allergies or dietary requirements.",
};

export const menuCategories: MenuCategory[] = [
  { id: "specials", name: "Cocoya Specials", tagline: "Photographed at our café" },
  { id: "hot-coffee", name: "Hot Coffee", tagline: "Espresso-based classics and slow brews" },
  { id: "iced-coffee", name: "Iced & Cold Brew", tagline: "Poured over ice, steeped slow" },
  { id: "frappes", name: "Frappes & Cold Coffee", tagline: "Blended thick, finished indulgent" },
  { id: "shakes", name: "Shakes & Smoothies", tagline: "Creamy, fruity, made to order" },
  { id: "tea-chocolate", name: "Tea & Chocolate", tagline: "For the non-coffee moments" },
  { id: "coolers", name: "Coolers", tagline: "Bright, iced and refreshing" },
  { id: "desserts", name: "Desserts", tagline: "Something sweet on the side" },
  { id: "food", name: "Food & Small Bites", tagline: "Bakes, plates and bites" },
];

export const menuItems: MenuItem[] = [
  // ── Cocoya Specials (real photos from the café) ───────────────────────────
  {
    id: "mango-matcha",
    name: "Mango Matcha",
    category: "specials",
    description: "Vivid green matcha poured over cold milk and a golden fruit layer — three tiers, served over ice.",
    details: "Stir to blend the layers, or sip them one by one.",
    price: null,
    image: "/images/cocoya/drinks/mango-matcha.jpg",
    imageAlt: "A layered iced matcha drink with milk and a golden fruit layer on the counter beneath the glowing cocoya sign",
    diet: null,
    signature: true,
    tags: ["Iced", "Matcha", "Layered"],
  },
  {
    id: "strawberry-matcha",
    name: "Strawberry Matcha",
    category: "specials",
    description: "Matcha floated over chilled milk and a ruby strawberry base — bright, creamy and beautifully layered.",
    price: null,
    image: "/images/cocoya/drinks/strawberry-matcha.jpg",
    imageAlt: "An iced matcha drink layered over milk and a red strawberry base in a small ribbed glass",
    diet: null,
    signature: true,
    tags: ["Iced", "Matcha", "Fruity"],
  },
  {
    id: "orange-espresso",
    name: "Orange Espresso",
    category: "specials",
    description: "Dark espresso floating over sunny orange over ice — bittersweet, citrusy and served in a stemmed glass.",
    price: null,
    image: "/images/cocoya/drinks/orange-espresso-glow.jpg",
    imageAlt: "Espresso layered over orange in a stemmed wine glass with ice",
    diet: null,
    signature: true,
    coldFeature: true,
    tags: ["Iced", "Coffee", "Citrus"],
  },
  {
    id: "vietnamese-drip",
    name: "Vietnamese Phin Coffee",
    category: "specials",
    description: "Coffee slow-dripped through a traditional Vietnamese phin filter, drop by drop, into a ribbed glass.",
    details: "A slow ritual — worth the wait.",
    price: null,
    image: "/images/cocoya/drinks/vietnamese-drip.jpg",
    imageAlt: "A Vietnamese phin coffee filter dripping coffee into a ribbed glass in front of the cocoya sign",
    diet: null,
    signature: true,
    coldFeature: true,
    tags: ["Slow drip", "Strong"],
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    category: "specials",
    description: "Espresso settling over cold milk and ice in a ribbed glass — smooth, mellow, made for warm days.",
    price: null,
    image: "/images/cocoya/drinks/iced-latte.jpg",
    imageAlt: "An iced latte with espresso over milk and ice in a ribbed glass",
    diet: null,
    signature: true,
    coldFeature: true,
    tags: ["Iced", "Milky"],
  },
  {
    id: "crispy-chilli-basil",
    name: "Crispy Chilli Basil",
    category: "specials",
    description: "Crisp, glossy bites tossed with chilli and spring onion, crowned with fried basil leaves.",
    price: null,
    image: "/images/cocoya/food/basil-chilli.jpg",
    imageAlt: "A plate of crispy chilli bites topped with fried basil leaves and spring onions",
    diet: null,
    tags: ["Kitchen", "Spicy"],
  },
  // ── Hot Coffee ────────────────────────────────────────────────────────────
  {
    id: "espresso",
    name: "Espresso",
    category: "hot-coffee",
    description: "A short, concentrated shot with a golden crema — coffee at its most essential.",
    details: "Served as a single shot in a warmed glass. Ask for a double if you need the extra lift.",
    price: null,
    image: "/images/menu/espresso.jpg",
    imageAlt: "A shot of espresso with golden crema in a small glass on a blue saucer",
    diet: "veg",
    tags: ["Hot", "Bold"],
  },
  {
    id: "americano",
    name: "Americano",
    category: "hot-coffee",
    description: "Espresso lengthened with hot water for a smooth, full-bodied black coffee.",
    price: null,
    image: "/images/menu/americano.jpg",
    imageAlt: "A cup of black Americano coffee in a white cup casting a long shadow",
    diet: "veg",
    tags: ["Hot", "Black"],
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    category: "hot-coffee",
    description: "Espresso crowned with velvety foamed milk and a dusting of cocoa.",
    details: "A balanced classic: equal parts espresso, steamed milk and airy foam.",
    price: null,
    image: "/images/menu/cappuccino.jpg",
    imageAlt: "A cappuccino with thick milk foam dusted with cocoa in a dark blue cup",
    diet: "veg",
    tags: ["Hot", "Milky"],
  },
  {
    id: "cafe-latte",
    name: "Café Latte",
    category: "hot-coffee",
    description: "Silky steamed milk poured over espresso and finished with latte art.",
    price: null,
    image: "/images/menu/cafe-latte.jpg",
    imageAlt: "A café latte with rosetta latte art in a glass cup on a wooden table",
    diet: "veg",
    tags: ["Hot", "Milky"],
  },
  {
    id: "flat-white",
    name: "Flat White",
    category: "hot-coffee",
    description: "A smaller, stronger milk coffee with a thin layer of glossy microfoam.",
    price: null,
    image: "/images/menu/flat-white.jpg",
    imageAlt: "A flat white with a heart of latte art in a white cup on a pale blue saucer",
    diet: "veg",
    tags: ["Hot", "Strong"],
  },
  {
    id: "cortado",
    name: "Cortado",
    category: "hot-coffee",
    description: "Espresso cut with an equal measure of warm milk — short, smooth and balanced.",
    price: null,
    image: "/images/menu/cortado.jpg",
    imageAlt: "A cortado in a small glass in soft window light",
    diet: "veg",
    tags: ["Hot", "Short"],
  },
  {
    id: "hot-mocha",
    name: "Café Mocha",
    category: "hot-coffee",
    description: "Espresso, rich chocolate and steamed milk — dessert and coffee in one cup.",
    price: null,
    image: "/images/menu/hot-mocha.jpg",
    imageAlt: "A rich chocolate mocha in a cup with chocolate dripping down the side",
    diet: "veg",
    tags: ["Hot", "Chocolate"],
  },
  {
    id: "pour-over",
    name: "Pour-Over",
    category: "hot-coffee",
    description: "Hand-poured filter coffee, brewed slowly for a clean and aromatic cup.",
    details: "Brewed to order — allow a few extra minutes. Lighter in body, brighter in flavour.",
    price: null,
    image: "/images/menu/pour-over.jpg",
    imageAlt: "Hot water being poured over a pour-over coffee dripper into a glass carafe",
    diet: "veg",
    tags: ["Hot", "Filter"],
  },

  // ── Iced & Cold Brew ──────────────────────────────────────────────────────
  {
    id: "iced-vanilla-latte",
    name: "Iced Vanilla Latte",
    category: "iced-coffee",
    description: "Cold milk poured over espresso and ice with a gentle note of vanilla.",
    price: null,
    image: "/images/menu/iced-vanilla-latte.jpg",
    imageAlt: "Milk being poured into a glass of iced coffee beside a finished iced latte",
    diet: "veg",
    tags: ["Iced", "Sweet"],
  },
  {
    id: "iced-mocha",
    name: "Iced Mocha",
    category: "iced-coffee",
    description: "Chilled espresso, chocolate and milk over ice — cool, rich and indulgent.",
    price: null,
    image: "/images/menu/iced-mocha.jpg",
    imageAlt: "An iced mocha in a clear glass with chocolate and milk layers on a wooden table",
    diet: "veg",
    tags: ["Iced", "Chocolate"],
  },
  {
    id: "iced-americano",
    name: "Iced Americano",
    category: "iced-coffee",
    description: "Espresso and cold water poured over ice for a crisp, clean black coffee.",
    price: null,
    image: "/images/menu/iced-americano.jpg",
    imageAlt: "A short glass of iced black coffee on a rustic wooden table",
    diet: "veg",
    tags: ["Iced", "Black"],
  },
  {
    id: "cold-brew",
    name: "Cold Brew",
    category: "iced-coffee",
    description: "Coffee steeped slowly in cold water for a naturally smooth, low-acid cup over ice.",
    details: "Cold brewing draws out chocolatey, mellow notes and leaves bitterness behind.",
    price: null,
    image: "/images/menu/cold-brew.jpg",
    imageAlt: "Dark cold brew coffee over large ice cubes, seen from above",
    diet: "veg",
    coldFeature: true,
    tags: ["Iced", "Slow-steeped"],
  },
  {
    id: "condensed-milk-iced-coffee",
    name: "Condensed Milk Iced Coffee",
    category: "iced-coffee",
    description: "Strong coffee layered over sweet condensed milk — stir, sip, repeat.",
    price: null,
    image: "/images/menu/condensed-milk-iced-coffee.jpg",
    imageAlt: "A layered iced coffee with condensed milk in a glass mug against a dark background",
    diet: "veg",
    tags: ["Iced", "Sweet"],
  },

  // ── Frappes & Cold Coffee ─────────────────────────────────────────────────
  {
    id: "classic-cold-coffee",
    name: "Classic Cold Coffee",
    category: "frappes",
    description: "Coffee blended with chilled milk until frothy, finished with a chocolate drizzle.",
    price: null,
    image: "/images/menu/classic-cold-coffee.jpg",
    imageAlt: "A tall glass of frothy blended cold coffee with chocolate drizzle",
    diet: "veg",
    tags: ["Blended", "Creamy"],
  },
  {
    id: "frappe-cookie-crumble",
    name: "Cookie Crumble Frappe",
    category: "frappes",
    description: "A thick coffee frappe blended with chocolate cookies and crowned with cream.",
    price: null,
    image: "/images/menu/frappe-cookie-crumble.jpg",
    imageAlt: "A cookie frappe topped with whipped cream, chocolate sauce and a cookie",
    diet: "veg",
    tags: ["Blended", "Indulgent"],
  },
  {
    id: "frappe-caramel",
    name: "Caramel Frappe",
    category: "frappes",
    description: "Iced coffee blended with caramel, topped with a cloud of whipped cream.",
    price: null,
    image: "/images/menu/frappe-caramel.jpg",
    imageAlt: "A caramel coffee frappe topped with whipped cream and a cinnamon stick",
    diet: "veg",
    tags: ["Blended", "Sweet"],
  },
  {
    id: "frappe-mocha",
    name: "Mocha Frappe",
    category: "frappes",
    description: "Chocolate and coffee blended with ice, finished with cream and cocoa.",
    price: null,
    image: "/images/menu/frappe-mocha.jpg",
    imageAlt: "A mocha frappe with whipped cream dusted with chocolate powder and a straw",
    diet: "veg",
    tags: ["Blended", "Chocolate"],
  },

  // ── Shakes & Smoothies ────────────────────────────────────────────────────
  {
    id: "shake-chocolate",
    name: "Chocolate Shake",
    category: "shakes",
    description: "A rich, thick chocolate milkshake topped with cream and chocolate shavings.",
    price: null,
    image: "/images/menu/shake-chocolate.jpg",
    imageAlt: "A chocolate milkshake in a mason jar topped with whipped cream and chocolate",
    diet: "veg",
    tags: ["Thick", "Chocolate"],
  },
  {
    id: "shake-cookies-cream",
    name: "Cookies & Cream Shake",
    category: "shakes",
    description: "Vanilla shake blended with crushed chocolate cookies and a chocolate swirl.",
    price: null,
    image: "/images/menu/shake-cookies-cream.jpg",
    imageAlt: "A cookies and cream milkshake with chocolate sauce and a striped straw",
    diet: "veg",
    tags: ["Thick", "Cookies"],
  },
  {
    id: "shake-strawberry",
    name: "Strawberry Shake",
    category: "shakes",
    description: "Creamy strawberry milkshake — pink, sweet and summery.",
    price: null,
    image: "/images/menu/shake-strawberry.jpg",
    imageAlt: "A strawberry milkshake garnished with fresh strawberries",
    diet: "veg",
    tags: ["Fruity", "Creamy"],
  },
  {
    id: "smoothie-berry",
    name: "Mixed Berry Smoothie",
    category: "shakes",
    description: "A vibrant blend of berries, finished with fresh fruit on top.",
    price: null,
    image: "/images/menu/smoothie-berry.jpg",
    imageAlt: "Two glasses of mixed berry smoothie topped with blueberries and strawberries",
    diet: "veg",
    tags: ["Fruity", "Fresh"],
  },

  // ── Tea & Chocolate ───────────────────────────────────────────────────────
  {
    id: "masala-chai",
    name: "Masala Chai",
    category: "tea-chocolate",
    description: "Black tea simmered with milk and warming spices — comfort in a cup.",
    price: null,
    image: "/images/menu/masala-chai.jpg",
    imageAlt: "A cup of milky masala chai with two cookies on the side",
    diet: "veg",
    tags: ["Hot", "Spiced"],
  },
  {
    id: "matcha-latte",
    name: "Matcha Latte",
    category: "tea-chocolate",
    description: "Stone-ground green tea whisked with steamed milk and finished with latte art.",
    price: null,
    image: "/images/menu/matcha-latte.jpg",
    imageAlt: "A bright green matcha latte with leaf latte art in a white cup",
    diet: "veg",
    tags: ["Hot", "Green tea"],
  },
  {
    id: "hot-chocolate",
    name: "Hot Chocolate",
    category: "tea-chocolate",
    description: "Velvety melted chocolate and steamed milk — rich, warming and comforting.",
    price: null,
    image: "/images/menu/hot-chocolate.jpg",
    imageAlt: "Hot chocolate being poured into a ceramic mug",
    diet: "veg",
    tags: ["Hot", "Chocolate"],
  },

  // ── Coolers ───────────────────────────────────────────────────────────────
  {
    id: "iced-tea-lemon",
    name: "Lemon Iced Tea",
    category: "coolers",
    description: "Brewed tea chilled over ice with a squeeze of citrus.",
    price: null,
    image: "/images/menu/iced-tea-lemon.jpg",
    imageAlt: "A glass of iced tea with lime slices and mint on a wooden board",
    diet: "veg",
    tags: ["Iced", "Citrus"],
  },
  {
    id: "iced-tea-hibiscus",
    name: "Hibiscus Iced Tea",
    category: "coolers",
    description: "Ruby-red, floral and tart — a bright iced tea for hot afternoons.",
    price: null,
    image: "/images/menu/iced-tea-hibiscus.jpg",
    imageAlt: "A tall glass of deep red hibiscus iced tea",
    diet: "veg",
    tags: ["Iced", "Floral"],
  },
  {
    id: "mint-lemonade",
    name: "Mint Lemonade",
    category: "coolers",
    description: "Fresh lemon, mint and ice — the original thirst-quencher.",
    price: null,
    image: "/images/menu/mint-lemonade.jpg",
    imageAlt: "A glass of mint lemonade with lemon slices, lime and fresh mint",
    diet: "veg",
    tags: ["Iced", "Fresh"],
  },

  // ── Desserts ──────────────────────────────────────────────────────────────
  {
    id: "tiramisu",
    name: "Tiramisu",
    category: "desserts",
    description: "Coffee-soaked layers and mascarpone cream under a blanket of cocoa.",
    price: null,
    image: "/images/menu/tiramisu.jpg",
    imageAlt: "A slice of tiramisu dusted with cocoa on a plate",
    diet: null,
    tags: ["Coffee", "Creamy"],
  },
  {
    id: "affogato",
    name: "Affogato",
    category: "desserts",
    description: "A scoop of vanilla ice cream 'drowned' in a hot shot of espresso.",
    price: null,
    image: "/images/menu/affogato.jpg",
    imageAlt: "Vanilla ice cream melting into espresso in a dark cup",
    diet: null,
    tags: ["Coffee", "Ice cream"],
  },
  {
    id: "brownie",
    name: "Chocolate Brownie",
    category: "desserts",
    description: "Dense, fudgy and deeply chocolatey — the perfect partner to a coffee.",
    price: null,
    image: "/images/menu/brownie.jpg",
    imageAlt: "Stacked fudgy chocolate brownies with chocolate sauce dripping",
    diet: null,
    tags: ["Chocolate"],
  },
  {
    id: "chocolate-cake",
    name: "Chocolate Truffle Cake",
    category: "desserts",
    description: "Layers of moist chocolate sponge and glossy chocolate ganache.",
    price: null,
    image: "/images/menu/chocolate-cake.jpg",
    imageAlt: "A chocolate cake with ganache drip and piped chocolate rosettes",
    diet: null,
    tags: ["Chocolate", "Cake"],
  },
  {
    id: "berry-cake",
    name: "Berry Cream Cake",
    category: "desserts",
    description: "Soft sponge layered with cream and berries, topped with fresh raspberries.",
    price: null,
    image: "/images/menu/berry-cake.jpg",
    imageAlt: "A slice of layered cream cake topped with fresh raspberries",
    diet: null,
    tags: ["Fruity", "Cake"],
  },
  {
    id: "cupcake-cookies-cream",
    name: "Cookies & Cream Cupcake",
    category: "desserts",
    description: "Chocolate cupcake with a swirl of cookies-and-cream frosting.",
    price: null,
    image: "/images/menu/cupcake-cookies-cream.jpg",
    imageAlt: "Chocolate cupcakes topped with white frosting and chocolate cookies",
    diet: null,
    tags: ["Chocolate"],
  },

  // ── Food & Small Bites ────────────────────────────────────────────────────
  {
    id: "croissant",
    name: "Butter Croissant",
    category: "food",
    description: "Flaky, golden and buttery — best enjoyed warm alongside your coffee.",
    price: null,
    image: "/images/menu/croissant.jpg",
    imageAlt: "Golden butter croissants dusted with flour on a dark surface",
    diet: null,
    tags: ["Bakery"],
  },
  {
    id: "grilled-sandwich",
    name: "Grilled Vegetable Sandwich",
    category: "food",
    description: "Toasted bread with a savoury vegetable filling, served with dips.",
    price: null,
    image: "/images/menu/grilled-sandwich.jpg",
    imageAlt: "A grilled sandwich cut into triangles with dips on the side",
    diet: "veg",
    tags: ["Toasted"],
  },
  {
    id: "club-sandwich",
    name: "Club Sandwich",
    category: "food",
    description: "A generously stacked sandwich with fresh greens, tomato and cheese.",
    price: null,
    image: "/images/menu/club-sandwich.jpg",
    imageAlt: "A stacked club sandwich with ham, cheese, lettuce and tomato",
    diet: "non-veg",
    tags: ["Hearty"],
  },
  {
    id: "wrap",
    name: "Grilled Chicken Wrap",
    category: "food",
    description: "Soft tortilla wraps filled with grilled chicken, vegetables and sauce.",
    price: null,
    image: "/images/menu/wrap.jpg",
    imageAlt: "Tortilla wraps filled with grilled chicken and vegetables with dipping sauces",
    diet: "non-veg",
    tags: ["Grilled"],
  },
  {
    id: "garden-bowl",
    name: "Garden Bowl",
    category: "food",
    description: "A colourful bowl of fresh greens, roasted vegetables, chickpeas and avocado.",
    price: null,
    image: "/images/menu/garden-bowl.jpg",
    imageAlt: "A colourful salad bowl with greens, tomatoes, chickpeas, sweet potato and avocado",
    diet: "veg",
    tags: ["Fresh", "Light"],
  },
  {
    id: "pancakes",
    name: "Stacked Pancakes",
    category: "food",
    description: "Fluffy pancakes stacked high, finished with fruit and a golden syrup pour.",
    price: null,
    image: "/images/menu/pancakes.jpg",
    imageAlt: "A tall stack of pancakes with banana and syrup being poured on top",
    diet: null,
    tags: ["Sweet", "Brunch"],
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

export function getCategory(id: MenuCategoryId) {
  return menuCategories.find((c) => c.id === id);
}

/** Categories that actually contain items, in display order. */
export function activeCategories() {
  return menuCategories.filter((c) => menuItems.some((i) => i.category === c.id));
}

export const signatureItems = menuItems.filter((i) => i.signature);
export const coldFeatureItems = menuItems.filter((i) => i.coldFeature);
