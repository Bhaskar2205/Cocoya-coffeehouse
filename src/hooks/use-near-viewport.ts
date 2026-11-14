import { useEffect, useState, type RefObject } from "react";

/**
 * Becomes true (once) when the element comes within `rootMargin` of the
 * viewport. Used to defer heavy animation setup until it's actually needed.
 */
export function useNearViewport(ref: RefObject<Element | null>, rootMargin = "100% 0px"): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, near]);

  return near;
}
