import { afterEach, describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FoodPhoto, PhotoCredits } from "./FoodPhoto";
import { photos, photoUrl, productPhotos, formatPhotos } from "./photography";
import { catalog } from "./catalog";
import { ProductCard } from "./ProductCard";
import { animateSafely } from "./motion";
afterEach(() => vi.unstubAllGlobals());
describe("photography delivery and provenance", () => {
  it("prioritizes the hero and reserves explicit dimensions", () => {
    const html = renderToStaticMarkup(
      <FoodPhoto photoKey="pancakes" priority />,
    );
    expect(html).toContain('loading="eager"');
    expect(html).toContain('fetchPriority="high"');
    expect(html).toContain('width="960"');
    expect(html).toContain('height="720"');
    expect(html).toContain("240w");
    expect(html).toContain("1280w");
    expect(html).toContain("Pancakes dorés");
  });
  it("lazy loads secondary photography", () => {
    const html = renderToStaticMarkup(<FoodPhoto photoKey="board" />);
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
  });
  it("has a readable fallback rather than a broken-image icon", () => {
    expect(renderToStaticMarkup(<FoodPhoto photoKey="missing" />)).toContain(
      "Photo momentanément indisponible",
    );
  });
  it("keeps attribution and license links, including the CC adaptation notice", () => {
    const html = renderToStaticMarkup(<PhotoCredits />);
    expect(html).toContain("Ekaterina Kvelidze");
    expect(html).toContain("https://creativecommons.org/licenses/by-sa/4.0/");
    expect(html).toContain("sous la même licence");
    for (const p of Object.values(photos)) {
      expect(p.alt.length).toBeGreaterThan(15);
      expect(p.author).toBeTruthy();
      expect(p.source).toMatch(
        /^https:\/\/(www.pexels.com|commons.wikimedia.org)/,
      );
      expect(p.licenseUrl).toMatch(/^https:/);
    }
  });
  it("uses the correct source for each Wikimedia thumbnail", () => {
    expect(photoUrl(photos.moroccan, 640)).toContain(
      "Traditional_Moroccan_breakfast.jpg/960px-",
    );
    expect(photoUrl(photos.milk, 960)).toContain(
      "New_chocolate_milk.JPG/960px-",
    );
  });
  it("maps all known preparations to real photos and leaves unknown recipes unspecified", () => {
    for (const key of Object.values({ ...productPhotos, ...formatPhotos }))
      expect(photos[key]).toBeDefined();
    expect(productPhotos.composed).toBeUndefined();
    expect(productPhotos["drink-5"]).toBeUndefined();
    expect(productPhotos["drink-6"]).toBeUndefined();
  });
  it("keeps unknown brunch composition unorderable without an unrelated photo", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={catalog.find((p) => p.id === "composed")!}
        index={3}
        expanded={false}
        onToggle={() => {}}
        onSave={() => {}}
      />,
    );
    expect(html).toContain("Composition à confirmer");
    expect(html).not.toContain("<button");
    expect(html).not.toContain("<img");
  });
});
describe("motion progressively enhances controls", () => {
  const frames = [{ opacity: 0 }, { opacity: 1 }];
  const options = { duration: 200 };
  it("does not call animation APIs for reduced motion", () => {
    const animate = vi.fn();
    vi.stubGlobal("window", { matchMedia: () => ({ matches: true }) });
    expect(
      animateSafely({ animate } as unknown as HTMLElement, frames, options),
    ).toBeNull();
    expect(animate).not.toHaveBeenCalled();
  });
  it("leaves usable controls when an animation API fails", () => {
    vi.stubGlobal("window", { matchMedia: () => ({ matches: false }) });
    expect(
      animateSafely(
        {
          animate: () => {
            throw new Error("unsupported");
          },
        } as unknown as HTMLElement,
        frames,
        options,
      ),
    ).toBeNull();
  });
});
