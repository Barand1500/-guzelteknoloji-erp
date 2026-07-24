/** Sağ tık menü dikdörtgeninden panelleri yana açmak için sabit snapshot */
export type DgSagTikMenuRect = {
  top: number;
  left: number;
  right: number;
  bottom: number;
  /** true: panel sağ tık menüsünün sağında açılır */
  yaninda?: boolean;
};

export type DgMenuAnchor = HTMLElement | DgSagTikMenuRect;

export function dgMenuAnchorRect(anchor: DgMenuAnchor | null | undefined): DOMRect | undefined {
  if (!anchor) return undefined;
  if (anchor instanceof HTMLElement) return anchor.getBoundingClientRect();
  return {
    top: anchor.top,
    left: anchor.left,
    right: anchor.right,
    bottom: anchor.bottom,
    width: Math.max(0, anchor.right - anchor.left),
    height: Math.max(0, anchor.bottom - anchor.top),
    x: anchor.left,
    y: anchor.top,
    toJSON: () => ({}),
  } as DOMRect;
}

export function dgSagTikMenuRectAl(el: HTMLElement | null): DgSagTikMenuRect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: r.top,
    left: r.left,
    right: r.right,
    bottom: r.bottom,
    yaninda: true,
  };
}
