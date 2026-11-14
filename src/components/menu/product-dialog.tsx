"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useSmoothScroll } from "@/components/providers/smooth-scroll";
import { menuItems } from "@/content/menu";

type ProductDialogContextValue = {
  /** Open an item. `list` = ordered ids for previous/next navigation. */
  openProduct: (id: string, list?: string[]) => void;
};

const ProductDialogContext = createContext<ProductDialogContextValue>({ openProduct: () => {} });
export const useProductDialog = () => useContext(ProductDialogContext);

const byId = new Map(menuItems.map((item) => [item.id, item]));

// The dialog (Radix + its UI) is only downloaded the first time a product is opened.
const ProductDialogView = dynamic(() => import("./product-dialog-view").then((m) => m.ProductDialogView), { ssr: false });

export function ProductDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ id: string; list: string[] } | null>(null);
  const [direction, setDirection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const { setLocked } = useSmoothScroll();

  const openProduct = useCallback((id: string, list?: string[]) => {
    setLoaded(true);
    setDirection(0);
    setState({ id, list: list?.length ? list : [id] });
  }, []);

  const open = state !== null;
  useEffect(() => {
    setLocked(open);
  }, [open, setLocked]);

  const item = state ? byId.get(state.id) : undefined;
  const index = state ? state.list.indexOf(state.id) : -1;
  const total = state?.list.length ?? 0;

  const go = useCallback((delta: number) => {
    setState((s) => {
      if (!s || s.list.length < 2) return s;
      const i = s.list.indexOf(s.id);
      const next = s.list[(i + delta + s.list.length) % s.list.length]!;
      return { ...s, id: next };
    });
    setDirection(delta);
  }, []);

  const value = useMemo(() => ({ openProduct }), [openProduct]);

  return (
    <ProductDialogContext.Provider value={value}>
      {children}
      {loaded && (
        <ProductDialogView
          open={open}
          item={item}
          index={index}
          total={total}
          direction={direction}
          onClose={() => setState(null)}
          onPrev={() => go(-1)}
          onNext={() => go(1)}
        />
      )}
    </ProductDialogContext.Provider>
  );
}
