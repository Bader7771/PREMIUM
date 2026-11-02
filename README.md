# PREMIUM — storefront prototype

React + TypeScript + Vite. French storefront, integer centime prices, inline customization, persistent editable cart, delivery scheduling and an explicitly simulated checkout. No account is required.

## Run

Node 20.19+ (Node 22.12+ or 24 recommended).

```sh
npm ci
npm run dev
npm test
npm run build
```

Vite prints the local URL. `dist/` is the production static output. On this restricted build host, dependencies were installed from the existing npm cache; normal setup uses `npm ci`. No secrets or environment variables are required.

## Sources and assumptions

**The workspace contained no attachments.** The PDF, moodboard and WhatsApp screenshot were not accessible for direct reading. This implementation uses the user's detailed transcription, menu and palette. Compare with the originals before approval. The storefront now uses real food photography from Pexels and Wikimedia Commons, with descriptive alt text, responsive CDN crops and visible source/license credits. Photos show preparations or components of the listed menu, rather than asserting a final serving size or unconfirmed recipe. No burger products have been added. See [PHOTOGRAPHY.md](PHOTOGRAPHY.md) for provenance, licenses and image-delivery details.

- Brand: PREMIUM is provisional.
- Boards: exactly 4 / 6 / 8 distinct items **combined** across cheeses and charcuterie. Optional sauces/accompaniments have no surcharge or maximum in the prototype. Their allowance is unconfirmed.
- Savory: every listed filling provisionally available with toast, bagel and croissant.
- Sweet and extras: each is 20 DH, based on section prices.
- Chia pudding / Balboula: one 20 DH extra requiring a choice between the two. Unconfirmed interpretation.
- American brunch: included drink is described, but no drink is automatically selected. `packDrinkOptions` is empty until confirmed; adding options activates required selection.
- Brunch composé is visible and cannot be added until its contents are confirmed and the block is explicitly removed.
- Delivery: provisional **24 elapsed hours**, no 2 PM cutoff. Daily demo slots 10–12, 12–14, 14–16 and a single **demo zone**, with a 30-day booking horizon. These are interface demonstration values, not operating promises. Delivery fee is `null` (unknown), never silently zero/free.

## Configuration and code map

| File                                                           | Responsibility                                                                                                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/catalog.ts`                                               | Brand name, menu, stable IDs, prices in centimes, board sizes, sauces/accompaniments (`required`/`max`), format availability, pack drinks, validation, price and option summaries |
| `src/scheduling.ts`                                            | IANA business timezone, minimum notice, opening days, slots, zones/fees, disabled dates, future cutoff support and validation                                                     |
| `src/cart.ts`                                                  | Validated localStorage loading, persistence and line creation                                                                                                                     |
| `src/Configurator.tsx`                                         | Shared inline customization and cart editing                                                                                                                                      |
| `src/Checkout.tsx`                                             | Customer details → scheduling → review → simulated payment                                                                                                                        |
| `src/services.ts`                                              | Replaceable `OrderPaymentService`, demo order validation and idempotency                                                                                                          |
| `src/photography.ts`, `src/FoodPhoto.tsx`                      | Photo selection, original sources/licenses, responsive image loading, fallback and visible credits                                                                                |
| `src/ProductCard.tsx`, `src/refinements.css`, `src/styles.css` | Product presentation, approved palette, responsive layouts and visual refinements                                                                                                 |
| `src/motion.tsx`                                               | Progressive, once-per-element scroll reveals and measured option-panel transitions, with reduced-motion support                                                                   |
| `index.html`                                                   | Page title and metadata (update along with the approved brand)                                                                                                                    |

`Product.leadHours` supports stricter future preparation times; the longest lead time in the cart wins. Scheduling uses `Intl.DateTimeFormat` and IANA `Africa/Casablanca`, including Ramadan clock changes, rather than a fixed UTC offset. Slot **start** must be at or after the earliest eligible instant. Schedule is checked when progressing and immediately before submission; invalid data stays in the form.

Each cart addition has a unique line ID; configurations and notes remain separate, including identical repeated additions. Editing replaces that exact line. Cart contents persist in the current browser; checkout personal details remain only in React memory. Native modal `<dialog>` supplies focus containment, Escape support and background inertness; the opener receives focus when closed.

## Integration status

All catalog/cart/configuration/scheduling interactions run locally. **No backend, merchant credentials, live orders or real payments exist.** The payment step has no card fields. It creates a `DEMO-…` reference with `mode: demo` / `status: simulated`, explicitly states that nothing was sent or charged, and clears the demo cart only after simulated confirmation. Unknown delivery fees keep the final total unknown. The adapter has in-memory idempotency, and the UI also locks repeated submissions.

To enable real ordering, implement `OrderPaymentService` through an authenticated server API and the chosen payment provider. The server must independently load the authoritative catalog, recalculate prices, validate all options and delivery eligibility, issue order IDs and enforce durable idempotency. Derive payment state from verified provider/server responses (including webhooks), not browser flags. Configure order receiving, fees and operating rules; replace demo notices only once the integration works. Keep merchant secrets on the server.

## Client decisions still needed

1. Final brand name and approved logo.
2. Exact advance-order rule and whether “9bl 2” means a separate cutoff.
3. Sauce and accompaniment allowances.
4. Availability of fillings across toast, bagel and croissant.
5. Whether chia pudding and balboula are separate extras or alternatives.
6. Contents and customization rules for Brunch composé.
7. Included drink choices in Brunch américain.
8. Delivery city, service zones, operating hours, slots and fees.
9. Payment provider and order-receiving backend.

## Verification

`npm test` covers combined 4/6/8 board limits, invalid downsizing and duplicate ingredients, ingredient control disabled states, filling prices, blocked composition, extra alternatives, cart persistence/edit/removal and distinct notes, required customer fields, elapsed lead-time boundaries, Casablanca Ramadan/non-Ramadan offsets, disabled dates, stricter product lead times, stale-slot rejection and demo submission idempotency. `npm run build` performs TypeScript checks and a production build.

The local production build is available in `dist/`. A private Sites project was registered, but source synchronization/publication could not complete because this environment restricts repository writes and network access; no live URL is claimed.

The UI refinement adds tests for photographic attribution, responsive image markup, lazy/eager loading, source mapping, blocked products and reduced-motion/failed-animation behavior. All **30 unit/component checks** pass, and the production build passes.

A repeatable browser check is provided:

```sh
npx playwright install chromium
npm run build
npm run test:e2e
```

It checks the catalog at 320, 390, 834 and 1440 pixels, captures screenshots in the ignored `qa-screenshots/` folder, checks photo loading, exercises board limits, cart persistence/editing and the entire demo checkout, then checks Escape and reduced motion. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can point to an existing Chromium executable.

**Browser verification remains incomplete on this host:** the sandbox rejects the local HTTP server (`listen EPERM`) and Chromium launch. Image CDNs are also inaccessible to shell downloads here. Photos are therefore served directly from the original image CDNs with responsive size/compression parameters; image loading, real viewport overflow, animations and the browser checkout have not been claimed as verified. The scripted browser suite must run in an environment that allows a local server and browser.

## UI and motion

The original blue/cream/yellow identity is retained. Product cards use consistent 4:3 crops, larger text and clearer prices. Cheese board choices have a combined progress meter, a completion message and separate optional groups. Format choices use food photographs. Cart editing retains its exact line; the checkout steps show progress and move focus to headings/errors.

Opening animations last 0.5–0.7 seconds with small overlapping staggers. Scroll reveals run once per mounted element using IntersectionObserver and Web Animations; content is visible without observation or animation support. Explicit expand/collapse uses short measured-height transitions and immediately makes closing controls inert. The cart uses a 260 ms entrance and 150 ms exit. Reduced motion disables opening/scroll/interaction motion; image space stays reserved and fonts use local system stacks. No animation runtime library was added.

## Storefront pages and configuration

React Router provides `/` (Accueil), `/menu` (complete catalog), `/contact`,
and a useful catch-all page. Category deep links use `/menu?category=boards`
(or `brunch`, `savory`, `sweet`, `extras`, `drinks`). Search uses `q` and works
with category filters. The global cart stays mounted during navigation and
continues to use the existing validated browser storage.

`src/business.ts` holds optional verified phone, email, address, opening hours,
social links and a map URL. Blank details are hidden. The contact form validates
a draft locally; no request is sent, and the interface explicitly says so.
Connect a real contact service before offering message submission.

Products, prices, pack contents and customization constraints remain in
`src/catalog.ts`; delivery settings remain in `src/scheduling.ts`. Existing
unconfirmed rules and the composed brunch remain explicitly provisional.
The ordering/payment adapter in `src/services.ts` is still a demonstration.
Real order submission, payment, delivery rules/fees, and business details need
confirmation/integration before launch. Photography provenance is in
`PHOTOGRAPHY.md`; unknown drink recipes deliberately have no misleading photo.
All interface icons come from Lucide React.

### Nested URL hosting

Vite development and preview servers provide SPA fallback. `public/_redirects`
is copied to the production build for hosts supporting this format (including
Cloudflare Pages and Netlify). Any other production host must rewrite unknown
non-asset routes to `/index.html` with status 200, e.g. Nginx
`try_files $uri $uri/ /index.html;`. Do not rewrite missing assets to HTML.
The end-to-end verification server also applies this fallback and tests refresh
on a direct category URL.

Run `npm run build`, `npm test`, and `npm run test:e2e`. The browser regression
checks representative widths from 320 to 1440 pixels, navigation, search,
contact validation, food photos, customization limits, cross-page cart state,
refresh persistence, checkout, Escape handling, and reduced motion. Screenshots
are written to `qa-screenshots/` (ignored by git).
