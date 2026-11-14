"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Info, Search, X } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MenuCard } from "@/components/menu/menu-card";
import { useProductDialog } from "@/components/menu/product-dialog";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { activeCategories, menuItems, menuMeta, type MenuCategoryId, type MenuItem } from "@/content/menu";
import { menuCopy } from "@/content/copy";
import { formatDateIST } from "@/lib/format";
import { cn } from "@/lib/utils";

type Filter = "all" | MenuCategoryId;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const categories = activeCategories();
const categoryName = new Map(categories.map((c) => [c.id, c.name]));
const searchIndex = new Map(
  menuItems.map((item) => [
    item.id,
    normalize([item.name, item.description, item.details ?? "", ...(item.tags ?? []), categoryName.get(item.category) ?? ""].join(" ")),
  ]),
);

export function MenuSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const { openProduct } = useProductDialog();
  const { scrollTo } = useSmoothScroll();
  const gridTop = useRef<HTMLDivElement>(null);
  const pillRefs = useRef(new Map<Filter, HTMLButtonElement>());
  const pillBar = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const terms = normalize(deferredQuery).split(/\s+/).filter(Boolean);
    return menuItems.filter(
      (item) =>
        (filter === "all" || item.category === filter) &&
        terms.every((t) => searchIndex.get(item.id)!.includes(t)),
    );
  }, [filter, deferredQuery]);

  const grouped = useMemo(
    () =>
      categories
        .map((c) => ({ category: c, items: results.filter((i) => i.category === c.id) }))
        .filter((g) => g.items.length > 0),
    [results],
  );

  const resultIds = useMemo(() => results.map((i) => i.id), [results]);
  const searching = deferredQuery.trim().length > 0;
  const viewKey = `${filter}|${searching ? "search" : "browse"}`;

  const selectFilter = (next: Filter) => {
    setFilter(next);
    // Bring the grid back into view if the visitor had scrolled deep into a long category.
    const top = gridTop.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) scrollTo(gridTop.current!);
  };

  // Keep the active pill centred in the horizontally scrolling bar (mobile) —
  // scrolls only the bar, never the page.
  useEffect(() => {
    const bar = pillBar.current;
    const pill = pillRefs.current.get(filter);
    if (!bar || !pill || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollTo({ left: pill.offsetLeft - bar.clientWidth / 2 + pill.clientWidth / 2, behavior: "smooth" });
  }, [filter]);

  const counts = useMemo(() => {
    const m = new Map<Filter, number>([["all", menuItems.length]]);
    for (const c of categories) m.set(c.id, menuItems.filter((i) => i.category === c.id).length);
    return m;
  }, []);

  const open = (item: MenuItem) => openProduct(item.id, resultIds);

  return (
    <section id="menu" aria-labelledby="menu-title" className="cv-auto relative bg-cream text-roast [--cv-size:6000px] lg:[--cv-size:5200px]">
      <div className="mx-auto max-w-[90rem] px-5 pt-28 sm:px-6 md:pt-36 lg:px-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="menu-title"
            eyebrow={menuCopy.eyebrow}
            title={menuCopy.headline}
            accent={["cup."]}
            supporting={menuCopy.supporting}
          />
          <div className="w-full lg:max-w-sm">
            <label htmlFor="menu-search" className="sr-only">
              Search the menu
            </label>
            <div className="group relative">
              <Search className="pointer-events-none absolute top-1/2 left-5 size-[1.1rem] -translate-y-1/2 text-cocoa/75 transition-colors group-focus-within:text-caramel" />
              <input
                id="menu-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lattes, cold brew, desserts…"
                autoComplete="off"
                enterKeyHint="search"
                className="h-14 w-full rounded-full border border-roast/10 bg-white/80 pr-12 pl-12 text-[0.95rem] text-roast shadow-[0_8px_30px_-18px_rgb(61_42_31/0.4)] transition outline-none placeholder:text-cocoa/45 focus:border-caramel/60 focus:bg-white focus:ring-4 focus:ring-caramel/15 [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-cocoa/75 transition hover:bg-sand hover:text-roast"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {menuMeta.status === "sample" && (
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-caramel/25 bg-white/60 p-4 text-sm leading-relaxed text-cocoa sm:items-center sm:px-5">
            <Info className="mt-0.5 size-4 shrink-0 text-caramel-deep sm:mt-0" />
            <p>
              <strong className="font-semibold text-roast">Preview menu.</strong> Our full menu is being finalised —
              please ask our team about today&apos;s offerings.
            </p>
          </div>
        )}
      </div>

      {/* Sticky category navigation */}
      <div
        ref={gridTop}
        className="sticky z-30 mt-8 border-y border-roast/[0.07] bg-cream/85 backdrop-blur-xl transition-[top] duration-500 ease-cinematic"
        style={{ top: "var(--header-offset, 0px)" }}
      >
        <div
          ref={pillBar}
          role="group"
          aria-label="Menu categories"
          className="no-scrollbar relative mx-auto flex max-w-[90rem] gap-1.5 overflow-x-auto px-5 py-3 sm:px-6 lg:px-10"
        >
          {(["all", ...categories.map((c) => c.id)] as Filter[]).map((id) => {
            const active = filter === id;
            const label = id === "all" ? "All" : categoryName.get(id);
            return (
              <button
                key={id}
                ref={(el) => {
                  if (el) pillRefs.current.set(id, el);
                }}
                type="button"
                aria-pressed={active}
                onClick={() => selectFilter(id)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2.5 text-[0.82rem] font-semibold whitespace-nowrap transition-colors duration-300",
                  active ? "text-foam" : "text-cocoa/75 hover:text-roast",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="menu-pill"
                    className="absolute inset-0 rounded-full bg-roast"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {label}
                  <sup className={cn("ml-1 text-[0.6rem] font-medium", active ? "text-gold" : "text-cocoa/75")}>{counts.get(id)}</sup>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto max-w-[90rem] px-5 pt-10 pb-24 sm:px-6 md:pb-32 lg:px-10">
        <p className="sr-only" aria-live="polite">
          {results.length} {results.length === 1 ? "item" : "items"} shown
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {results.length === 0 ? (
              <div className="mx-auto max-w-md py-16 text-center">
                <p className="font-display text-3xl font-light">Nothing matches “{deferredQuery}”.</p>
                <p className="mt-3 text-cocoa/70">Try another word, or browse all categories.</p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("all");
                  }}
                  className="mt-6 inline-flex h-12 items-center rounded-full bg-roast px-6 text-sm font-semibold text-foam transition hover:bg-cocoa"
                >
                  Show the full menu
                </button>
              </div>
            ) : searching ? (
              <>
                <p className="mb-6 text-sm text-cocoa/70">
                  {results.length} {results.length === 1 ? "result" : "results"} for “{deferredQuery.trim()}”
                </p>
                <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                  <AnimatePresence>
                    {results.map((item, i) => (
                      <MenuCard key={item.id} item={item} index={i} onOpen={() => open(item)} />
                    ))}
                  </AnimatePresence>
                </ul>
              </>
            ) : (
              <div className="flex flex-col gap-16 md:gap-20">
                {grouped.map(({ category, items }) => (
                  <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-roast/10 pb-4 md:mb-8">
                      <h3 id={`cat-${category.id}`} className="font-display text-title font-light tracking-tight">
                        {category.name}
                      </h3>
                      <p className="text-sm text-cocoa/75 italic">{category.tagline}</p>
                    </div>
                    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
                      {items.map((item, i) => (
                        <MenuCard key={item.id} item={item} index={i} onOpen={() => open(item)} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-16 flex flex-col gap-3 border-t border-roast/10 pt-6 text-xs text-cocoa/75 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-grid size-3.5 place-items-center rounded-[2px] border border-veg bg-white">
                <span className="size-1.5 rounded-full bg-veg" />
              </span>
              Vegetarian
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-grid size-3.5 place-items-center rounded-[2px] border border-nonveg bg-white">
                <span className="size-0 border-x-[3px] border-b-[5px] border-x-transparent border-b-nonveg" />
              </span>
              Non-vegetarian
            </span>
            <span>{menuMeta.footnote}</span>
          </p>
          {menuMeta.lastUpdated && <p>Menu updated {formatDateIST(menuMeta.lastUpdated)}</p>}
        </div>
      </div>
    </section>
  );
}
