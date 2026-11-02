import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  catalog,
  sizes,
  cheeses,
  meats,
  emptyConfig,
  configError,
  price,
  fillings,
  type CartLine,
} from "./catalog";
import {
  deliveryRules,
  scheduleError,
  zonedInstant,
  strictestLead,
  customerErrors,
  dates,
} from "./scheduling";
import { makeLine, readCart, saveCart } from "./cart";
import { demoOrderService } from "./services";
const board = catalog.find((p) => p.id === "board")!;
const ids = [...cheeses, ...meats].map((x) => x.id);
const configured = (n: number) => ({
  ...emptyConfig(),
  ingredients: ids.slice(0, n),
});
beforeEach(() => {
  const data = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => data.set(k, v),
  });
  vi.useRealTimers();
});
describe("menu integrity", () => {
  for (const size of sizes)
    it(`${size.name}: exactly ${size.count} combined selections`, () => {
      const c = { ...configured(size.count), size: size.id };
      expect(configError(board, c)).toBeUndefined();
      expect(price(board, c)).toBe(size.price);
      expect(
        configError(board, { ...c, ingredients: ids.slice(0, size.count - 1) }),
      ).toBeTruthy();
      expect(
        configError(board, { ...c, ingredients: ids.slice(0, size.count + 1) }),
      ).toBeTruthy();
    });
  it("rejects downsizing without deleting choices", () => {
    const c = { ...configured(8), size: "small" };
    expect(configError(board, c)).toBeTruthy();
    expect(c.ingredients).toHaveLength(8);
  });
  it("rejects repeated ingredient IDs", () =>
    expect(
      configError(board, {
        ...emptyConfig(),
        ingredients: [ids[0], ids[0], ids[1], ids[2]],
      }),
    ).toBeTruthy());
  it("prices savory products by filling", () => {
    for (const f of fillings)
      expect(
        price(catalog.find((p) => p.id === "savory")!, {
          ...emptyConfig(),
          filling: f.id,
        }),
      ).toBe(f.price);
  });
  it("blocks unknown composition and requires extra alternative", () => {
    expect(
      configError(catalog.find((p) => p.id === "composed")!, emptyConfig()),
    ).toBeTruthy();
    const extra = catalog.find((p) => p.id === "extra-2")!;
    expect(configError(extra, emptyConfig())).toBeTruthy();
    expect(
      configError(extra, { ...emptyConfig(), alternative: "Balboula" }),
    ).toBeUndefined();
  });
  it("preserves distinct configurations, notes, edits and persistence", () => {
    const a = makeLine("board", configured(4), 1);
    const b = makeLine(
      "board",
      { ...configured(4), notes: "Une demande distincte" },
      2,
    );
    expect(a.id).not.toBe(b.id);
    saveCart([a, b]);
    let lines = readCart();
    expect(lines).toHaveLength(2);
    expect(lines[1].config.notes).toBe("Une demande distincte");
    lines = lines.map((l) =>
      l.id === a.id
        ? { ...l, quantity: 3, config: { ...l.config, sauces: ["sauce-0"] } }
        : l,
    );
    saveCart(lines);
    expect(readCart()[0].quantity).toBe(3);
    expect(readCart()[0].config.sauces).toEqual(["sauce-0"]);
    saveCart(lines.filter((l) => l.id !== a.id));
    expect(readCart()).toHaveLength(1);
  });
  it("rejects stale/invalid persisted products", () => {
    saveCart([makeLine("composed", emptyConfig(), 1)]);
    expect(readCart()).toEqual([]);
  });
});
describe("Casablanca delivery", () => {
  const now = new Date("2026-11-02T10:30:00Z");
  it("rejects slots before earliest eligible start", () => {
    expect(scheduleError("2026-11-03", "morning", [], now)).toBeTruthy();
    expect(scheduleError("2026-11-03", "noon", [], now)).toBeUndefined();
  });
  it("respects exact 24h boundary", () => {
    expect(
      scheduleError(
        "2026-11-03",
        "morning",
        [],
        new Date("2026-11-02T09:00:00Z"),
      ),
    ).toBeUndefined();
    expect(
      scheduleError(
        "2026-11-03",
        "morning",
        [],
        new Date("2026-11-02T09:00:01Z"),
      ),
    ).toBeTruthy();
  });
  it("uses IANA offsets during and outside Ramadan", () => {
    expect(new Date(zonedInstant("2026-03-01", "10:00")).toISOString()).toBe(
      "2026-03-01T10:00:00.000Z",
    );
    expect(new Date(zonedInstant("2026-11-03", "10:00")).toISOString()).toBe(
      "2026-11-03T09:00:00.000Z",
    );
  });
  it("uses strictest preparation time", () => {
    catalog[0].leadHours = 72;
    expect(strictestLead([makeLine(catalog[0].id, emptyConfig(), 1)])).toBe(72);
    delete catalog[0].leadHours;
  });
  it("honors closed days, disabled dates and service area validation", () => {
    deliveryRules.disabledDates.push("2026-11-03");
    expect(scheduleError("2026-11-03", "noon", [], now)).toBeTruthy();
    deliveryRules.disabledDates.pop();
    expect(scheduleError("2026-02-31", "noon", [], now)).toBeTruthy();
    expect(
      dates([], now).every((d) =>
        deliveryRules.slots.some((s) => !scheduleError(d, s.id, [], now)),
      ),
    ).toBe(true);
    expect(
      Object.keys(
        customerErrors(
          {
            name: "",
            phone: "",
            address: "",
            area: "",
            date: "",
            slot: "",
            notes: "",
            instructions: "",
          },
          [],
        ),
      ),
    ).toEqual(
      expect.arrayContaining(["name", "phone", "address", "area", "slot"]),
    );
  });
  it("revalidates expired schedules and preserves customer data", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const customer = {
      name: "Test Démo",
      phone: "0600000000",
      address: "Adresse de démonstration",
      area: "demo",
      date: "2026-11-03",
      slot: "noon",
      notes: "À conserver",
      instructions: "Test",
    };
    const lines: CartLine[] = [makeLine("board", configured(4), 1)];
    vi.setSystemTime(new Date("2026-11-03T10:00:00Z"));
    await expect(
      demoOrderService.submit(lines, customer, "expired"),
    ).rejects.toThrow();
    expect(customer.notes).toBe("À conserver");
  });
  it("produces only demo status and deduplicates submits", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const customer = {
      name: "Test Démo",
      phone: "0600000000",
      address: "Adresse de démonstration",
      area: "demo",
      date: "2026-11-03",
      slot: "noon",
      notes: "À conserver",
      instructions: "Test",
    };
    const lines = [makeLine("board", configured(4), 1)];
    const a = await demoOrderService.submit(lines, customer, "same-key");
    const b = await demoOrderService.submit(lines, customer, "same-key");
    expect(a).toEqual(b);
    expect(a.mode).toBe("demo");
    expect(a.status).toBe("simulated");
    expect(a.id).toMatch(/^DEMO-/);
    expect(a.subtotal).toBe(13000);
    expect(a.customer.notes).toBe("À conserver");
  });
});
