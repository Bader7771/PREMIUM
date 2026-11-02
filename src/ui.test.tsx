import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Configurator } from "./Configurator";
import { catalog, emptyConfig, cheeses, meats, sizes } from "./catalog";
const board = catalog.find((p) => p.id === "board")!;
const ids = [...cheeses, ...meats].map((x) => x.id);
const render = (n: number, size = "small") =>
  renderToStaticMarkup(
    <Configurator
      product={board}
      initial={{ ...emptyConfig(), size, ingredients: ids.slice(0, n) }}
      onSave={() => {}}
      onCancel={() => {}}
    />,
  );
function ingredientInputs(html: string) {
  return (html.match(/<input[^>]+type="checkbox"[^>]*>/g) || []).slice(0, 10);
}
describe("board control semantics", () => {
  for (const size of sizes)
    it(`${size.name} keeps selected controls enabled at limit`, () => {
      const html = render(size.count, size.id);
      const inputs = ingredientInputs(html);
      expect(inputs).toHaveLength(10);
      expect(inputs.filter((i) => i.includes('checked=""'))).toHaveLength(
        size.count,
      );
      expect(inputs.filter((i) => i.includes('disabled=""'))).toHaveLength(
        10 - size.count,
      );
      expect(
        inputs
          .filter((i) => i.includes('checked=""'))
          .every((i) => !i.includes('disabled=""')),
      ).toBe(true);
      expect(html).not.toMatch(
        /<button[^>]*disabled=""[^>]*>Ajouter au panier/,
      );
    });
  it("allows replacement after deselection", () => {
    expect(
      ingredientInputs(render(3)).some((i) => i.includes('disabled=""')),
    ).toBe(false);
    expect(render(3)).toMatch(/<button[^>]*disabled=""[^>]*>Ajouter au panier/);
  });
  it("downsizing preserves all checks and explains removal", () => {
    const html = render(8, "small");
    expect(
      ingredientInputs(html).filter((i) => i.includes('checked=""')),
    ).toHaveLength(8);
    expect(html).toContain("Retirez 4 sélection(s)");
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Ajouter au panier/);
  });
});
