import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** true after hydration on the client, false during server prerender. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
