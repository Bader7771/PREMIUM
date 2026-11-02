/** Run after npm run build; requires `npx playwright install chromium` once.
 * Screenshots + full order-path regression, including live image checks.
 */
import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
const root = resolve("dist");
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    const path = resolve(
      root,
      "." +
        decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname),
    );
    if (!path.startsWith(root + "/")) {
      res.writeHead(403).end();
      return;
    }
    const bytes = await readFile(path).catch((error) => {
      if (!extname(path)) return readFile(resolve(root, "index.html"));
      throw error;
    });
    const mime = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".svg": "image/svg+xml",
      ".jpg": "image/jpeg",
      ".webp": "image/webp",
    };
    res
      .writeHead(200, {
        "content-type":
          mime[extname(path)] ||
          (!extname(path) ? "text/html" : "application/octet-stream"),
      })
      .end(bytes);
  } catch {
    res.writeHead(404).end();
  }
});
let browser;
try {
  await new Promise((ok, no) => {
    server.once("error", no);
    server.listen(0, "127.0.0.1", ok);
  });
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {}),
  });
  await mkdir("qa-screenshots", { recursive: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    timezoneId: "Africa/Casablanca",
  });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (e) => runtimeErrors.push(e.message));
  const url = `http://127.0.0.1:${server.address().port}`;
  await page.goto(url);
  await page.locator(".hero img").waitFor();
  await page.waitForFunction(
    () => document.querySelector(".hero img")?.naturalWidth > 0,
  );
  const noOverflow = async () =>
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      "Horizontal viewport overflow",
    );
  await page.goto(`${url}/menu`);
  const category = async (name) => {
    await page
      .getByRole("navigation", { name: "Catégories du menu" })
      .getByRole("button", { name, exact: true })
      .click();
    await page.locator(".category-heading").scrollIntoViewIfNeeded();
  };
  if (!process.env.STOREFRONT_INTERACTIONS_ONLY) {
    for (const width of [1440, 1024, 834, 768, 600, 390, 360, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow();
      for (const name of [
        "Packs brunch",
        "Cheese boards",
        "Salé",
        "Sucré",
        "Suppléments",
        "Boissons",
      ]) {
        await category(name);
        await noOverflow();
        // Trigger lazy photos deliberately and fail on broken image delivery.
        for (const img of await page
          .locator(".product-grid img.food-photo")
          .all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate(
            (el) =>
              new Promise((ok, no) => {
                const done = () =>
                  el.naturalWidth > 0
                    ? ok(true)
                    : no(new Error(`Image failed: ${el.currentSrc}`));
                if (el.complete) done();
                else {
                  el.addEventListener("load", done, { once: true });
                  el.addEventListener(
                    "error",
                    () => no(new Error(`Image failed: ${el.currentSrc}`)),
                    { once: true },
                  );
                }
              }),
          );
        }
        assert.equal(
          await page.locator(".product-grid .photo-fallback").count(),
          0,
          "Image fallback rendered",
        );
        await page.locator(".product-grid").screenshot({
          path: `qa-screenshots/menu-${name.replaceAll(" ", "-")}-${width}.png`,
        });
      }
    }
    // Routed pages, direct category links, search, and accessible mobile navigation.
    for (const width of [360, 390, 600, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ["/", "/menu", "/contact", "/missing-page"]) {
        await page.goto(`${url}${path}`);
        await noOverflow();
        await page.waitForFunction(
          () =>
            !document.getAnimations().some((a) => a.playState === "running"),
        );
        await page.screenshot({
          path: `qa-screenshots/page-${path.replaceAll("/", "") || "home"}-${width}.png`,
          fullPage: true,
        });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${url}/`);
  const mobileToggle = page.locator(".mobile-menu-toggle");
  await mobileToggle.click();
  assert.equal(await mobileToggle.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  assert.equal(await mobileToggle.getAttribute("aria-expanded"), "false");
  await mobileToggle.click();
  await page
    .getByRole("navigation", { name: "Navigation principale", exact: true })
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  assert.equal(new URL(page.url()).pathname, "/contact");
  assert.equal(
    await page
      .getByRole("button", { name: "Ouvrir le menu", exact: true })
      .getAttribute("aria-expanded"),
    "false",
  );
  await page
    .getByRole("button", { name: "Vérifier mon message (démo)" })
    .click();
  assert(
    await page.getByText("Indiquez une adresse e-mail valide.").isVisible(),
  );
  await page.getByRole("textbox", { name: "Votre nom" }).fill("Test contact");
  await page
    .getByRole("textbox", { name: "Votre e-mail" })
    .fill("demo@example.com");
  await page
    .getByRole("textbox", { name: "Votre message" })
    .fill("Ceci est un message de démonstration.");
  await page
    .getByRole("button", { name: "Vérifier mon message (démo)" })
    .click();
  await page
    .getByRole("status")
    .getByText(/aucun envoi n’a été effectué/)
    .waitFor();
  await page.goto(`${url}/menu?category=sweet`);
  await page.reload();
  assert.equal(await page.locator(".product-card").count(), 4);
  assert(
    (await page
      .locator('#primary-navigation a[href="/menu"]')
      .getAttribute("aria-current")) === "page",
  );
  const search = page.getByRole("searchbox", { name: "Rechercher un produit" });
  await search.click();
  await search.pressSequentially("introuvable");
  assert.equal(await search.inputValue(), "introuvable");
  assert(
    await page
      .getByRole("heading", { name: "Aucun produit pour cette envie." })
      .isVisible(),
  );
  await page.getByRole("button", { name: "Réinitialiser les filtres" }).click();
  await page.waitForFunction(
    () => document.querySelectorAll(".product-card").length === 21,
  );
  // Salty preparation keeps original price and quantity rules.
  await category("Salé");
  const savory = page.locator(".product-card");
  await savory.getByRole("button", { name: "Composer à mon goût" }).click();
  await savory.getByRole("radio", { name: "Croissant", exact: true }).check();
  await savory.getByRole("radio", { name: /Saumon & fromage/ }).check();
  await savory.getByRole("button", { name: "Ajouter au panier" }).click();
  await mobileToggle.click();
  await page
    .getByRole("navigation", { name: "Navigation principale", exact: true })
    .getByRole("link", { name: "Contact", exact: true })
    .click();
  await page.locator(".cart-button").click();
  assert(
    await page
      .getByRole("dialog")
      .getByText("45 DH", { exact: true })
      .first()
      .isVisible(),
  );
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Retirer À chacun son salé" })
    .click();
  await page.keyboard.press("Escape");
  await page.goto(`${url}/menu`);

  await category("Cheese boards");
  const board = page
    .locator(".product-card")
    .filter({ has: page.getByRole("heading", { name: "Votre cheese board" }) });
  await board.getByRole("button", { name: "Composer à mon goût" }).click();
  const selected = ["Brie", "Gouda", "Cheddar", "Dinde fumée"];
  for (const name of selected)
    await board.getByRole("checkbox", { name, exact: true }).check();
  assert(
    await board
      .getByRole("checkbox", { name: "Edam", exact: true })
      .isDisabled(),
  );
  assert(
    await board
      .getByRole("checkbox", { name: "Brie", exact: true })
      .isEnabled(),
  );
  await board.getByRole("checkbox", { name: "Brie", exact: true }).uncheck();
  await board.getByRole("checkbox", { name: "Edam", exact: true }).check();
  await board.getByRole("radio", { name: /Grand/ }).check();
  for (const name of [
    "Brie",
    "Fromage bleu",
    "Fromage de chèvre",
    "Salami au poivre",
  ])
    await board.getByRole("checkbox", { name, exact: true }).check();
  await board.getByRole("radio", { name: /Petit/ }).check();
  assert(
    await board.getByRole("button", { name: "Ajouter au panier" }).isDisabled(),
  );
  for (const name of [
    "Brie",
    "Fromage bleu",
    "Fromage de chèvre",
    "Salami au poivre",
  ])
    await board.getByRole("checkbox", { name, exact: true }).uncheck();
  await board
    .getByRole("textbox", { name: /Notes ou demandes spéciales/ })
    .fill("Note de vérification");
  await board.getByRole("button", { name: "Ajouter au panier" }).click();
  await page.reload();
  await page.locator(".cart-button").click();
  const drawer = page.getByRole("dialog");
  assert((await drawer.getByText(/Note de vérification/).count()) > 0);
  await drawer.getByRole("button", { name: "Modifier ma sélection" }).click();
  await drawer
    .getByRole("checkbox", { name: "Sauce sucrée", exact: true })
    .check();
  await drawer
    .getByRole("button", { name: "Enregistrer les modifications" })
    .click();
  await drawer.getByRole("button", { name: "Augmenter la quantité" }).click();
  assert((await drawer.getByText("260 DH", { exact: true }).count()) > 0);
  await drawer.getByRole("button", { name: "Planifier ma livraison" }).click();
  await drawer.getByRole("button", { name: "Vérifier ma commande" }).click();
  assert(await drawer.getByText("Indiquez votre nom complet.").isVisible());
  await page.setViewportSize({ width: 390, height: 430 });
  await noOverflow();
  assert(await drawer.evaluate((el) => el.clientHeight <= window.innerHeight));
  await drawer
    .getByRole("textbox", { name: "Nom complet", exact: true })
    .fill("Test Démonstration");
  await drawer
    .getByRole("textbox", { name: "Téléphone", exact: true })
    .fill("0600000000");
  await drawer
    .getByRole("textbox", { name: "Adresse de livraison", exact: true })
    .fill("Adresse fictive pour la démonstration");
  await drawer
    .getByRole("combobox", { name: "Ville / zone de livraison" })
    .selectOption("demo");
  const date = drawer.getByRole("combobox", { name: "Date de livraison" });
  await date.selectOption({ index: 1 });
  await drawer
    .getByRole("combobox", { name: "Créneau de livraison" })
    .selectOption({ index: 1 });
  await drawer.getByRole("button", { name: "Vérifier ma commande" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await drawer
    .getByRole("button", { name: "Continuer vers le paiement démo" })
    .click();
  assert(
    (await drawer.locator("input").count()) === 0,
    "Payment must not collect card details",
  );
  await drawer.getByRole("button", { name: "Simuler la confirmation" }).click();
  await drawer
    .getByText("CONFIRMATION DE DÉMONSTRATION", { exact: true })
    .waitFor();
  assert(await drawer.getByText(/Aucune commande n’a été envoyée/).isVisible());
  await drawer.screenshot({ path: "qa-screenshots/demo-confirmation.png" });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => !document.querySelector("dialog").open);
  assert(await page.evaluate(() => !document.querySelector("dialog").open));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${url}/#comment`);
  await page.waitForFunction(() => {
    const top = document.getElementById("comment").getBoundingClientRect().top;
    return top >= 0 && top < window.innerHeight;
  });
  assert(
    await page.evaluate(
      () => !document.getAnimations().some((a) => a.playState === "running"),
    ),
  );
  assert.deepEqual(runtimeErrors, [], "Browser errors");
  console.log(
    `${process.env.STOREFRONT_INTERACTIONS_ONLY ? "Interaction checks" : "Responsive layouts, live photography and interaction checks"} passed: routed pages, nested refresh, mobile navigation, contact validation, search, savory customization, board limits, persistence/editing, short-viewport checkout, modal Escape, anchors and reduced motion.`,
  );
  await context.close();
} finally {
  await browser?.close();
  server.close();
}
