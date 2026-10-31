// The carousel's fractional scroll position, shared outside React state: the carousel writes it
// on every scroll frame and the light, per-frame visuals (colors, backdrop, title strip, card tilt)
// read it directly, so a swipe never re-renders the page. Heavier sections follow `landed` instead.

export type PositionStore = {
  get: () => number;
  set: (value: number) => void;
  subscribe: (listener: (value: number) => void) => () => void;
};

export function createPositionStore(initial = 0): PositionStore {
  let value = initial;
  const listeners = new Set<(value: number) => void>();
  return {
    get: () => value,
    set: (next) => {
      value = next;
      listeners.forEach((listener) => listener(next));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      listener(value);
      return () => listeners.delete(listener);
    },
  };
}
