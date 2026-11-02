import {
  catalog,
  configError,
  type CartLine,
  type Configuration,
} from "./catalog";
export const CART_KEY = "premium-cart-v1";
export function saveCart(lines: CartLine[]) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(lines));
    return true;
  } catch {
    return false;
  }
}
export function readCart(): CartLine[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter((l: CartLine) => {
      const p = catalog.find((p) => p.id === l.productId);
      return (
        p &&
        Number.isInteger(l.quantity) &&
        l.quantity > 0 &&
        l.quantity <= 99 &&
        typeof l.id === "string" &&
        typeof l.config?.notes === "string" &&
        !configError(p, l.config)
      );
    });
  } catch {
    return [];
  }
}
export function makeLine(
  productId: string,
  config: Configuration,
  quantity: number,
): CartLine {
  return {
    id: crypto.randomUUID(),
    productId,
    config: structuredClone(config),
    quantity,
  };
}
