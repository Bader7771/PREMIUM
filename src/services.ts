import { catalog, configError, price, type CartLine } from "./catalog";
import { customerErrors, deliveryRules, type Customer } from "./scheduling";
export interface Order {
  id: string;
  mode: "demo";
  status: "simulated";
  lines: CartLine[];
  customer: Customer;
  subtotal: number;
  deliveryFee: number | null;
  total: number | null;
  createdAt: string;
}
export interface OrderPaymentService {
  submit(
    lines: CartLine[],
    customer: Customer,
    idempotencyKey: string,
  ): Promise<Order>;
}
// Replace with a server API. This adapter never submits an order or processes money.
const completed = new Map<string, Order>();
export const demoOrderService: OrderPaymentService = {
  async submit(lines, customer, key) {
    if (completed.has(key)) return completed.get(key)!;
    const errors = customerErrors(customer, lines);
    if (Object.keys(errors).length) throw new Error(Object.values(errors)[0]);
    if (!lines.length) throw new Error("Votre panier est vide.");
    let subtotal = 0;
    for (const l of lines) {
      const p = catalog.find((p) => p.id === l.productId);
      if (
        !p ||
        !Number.isInteger(l.quantity) ||
        l.quantity < 1 ||
        l.quantity > 99
      )
        throw new Error("Panier invalide.");
      const error = configError(p, l.config);
      if (error) throw new Error(error);
      subtotal += price(p, l.config) * l.quantity;
    }
    const deliveryFee = deliveryRules.serviceAreas.find(
      (a) => a.id === customer.area,
    )!.fee;
    const order: Order = {
      id: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      mode: "demo",
      status: "simulated",
      lines: structuredClone(lines),
      customer: { ...customer },
      subtotal,
      deliveryFee,
      total: deliveryFee === null ? null : subtotal + deliveryFee,
      createdAt: new Date().toISOString(),
    };
    completed.set(key, order);
    return order;
  },
};
