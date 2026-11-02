import { useEffect, useRef, useState } from "react";
import {
  brand,
  catalog,
  categories,
  money,
  price,
  summary,
  type Category,
  type CartLine,
} from "./catalog";
import { readCart, saveCart, makeLine } from "./cart";
import { deliveryRules } from "./scheduling";
import { Configurator, Quantity } from "./Configurator";
import { Checkout } from "./Checkout";
import { FoodPhoto, PhotoCredits } from "./FoodPhoto";
import { ProductCard } from "./ProductCard";
import {
  AnimatedPanel,
  animateSafely,
  reducedMotion,
  useScrollReveal,
} from "./motion";
import { Icon, Smile } from "./Icons";
import type { Order } from "./services";
export default function App() {
  const [category, setCategory] = useState<Category>("brunch");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>(readCart);
  const [editing, setEditing] = useState<string | null>(null);
  const [mode, setMode] = useState<"cart" | "checkout" | "confirmed">("cart");
  const [order, setOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState("");
  const [persistError, setPersistError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const trigger = useRef<HTMLElement | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const cartAnimation = useRef<Animation | null>(null);
  const categoryNav = useRef<HTMLElement>(null);
  useScrollReveal(mainRef, category);
  useEffect(() => {
    const nav = categoryNav.current;
    const active = nav?.querySelector<HTMLElement>(`[aria-pressed="true"]`);
    if (nav && active)
      nav.scrollTo({
        left:
          nav.scrollLeft +
          active.getBoundingClientRect().left -
          nav.getBoundingClientRect().left -
          12,
        behavior: reducedMotion() ? "instant" : "smooth",
      });
  }, [category]);
  useEffect(() => {
    setPersistError(!saveCart(cart));
  }, [cart]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  const count = cart.reduce((n, l) => n + l.quantity, 0);
  const subtotal = cart.reduce(
    (n, l) =>
      n +
      price(catalog.find((p) => p.id === l.productId)!, l.config) * l.quantity,
    0,
  );
  function openCart() {
    trigger.current = document.activeElement as HTMLElement;
    setMode("cart");
    cartAnimation.current?.cancel();
    dialog.current?.showModal();
    if (!reducedMotion() && dialog.current?.animate)
      cartAnimation.current = animateSafely(
        dialog.current,
        [
          { opacity: 0.4, transform: "translateX(32px)" },
          { opacity: 1, transform: "translateX(0)" },
        ],
        { duration: 260, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    setIsOpen(true);
    document.body.style.overflow = "hidden";
  }
  function close() {
    cartAnimation.current?.cancel();
    const finish = () => {
      dialog.current?.close();
      setIsOpen(false);
      setEditing(null);
      document.body.style.overflow = "";
      trigger.current?.focus();
    };
    if (!reducedMotion() && dialog.current?.animate) {
      const animation = animateSafely(
        dialog.current,
        [
          { opacity: 1, transform: "translateX(0)" },
          { opacity: 0, transform: "translateX(24px)" },
        ],
        { duration: 150, easing: "ease-in" },
      );
      cartAnimation.current = animation;
      if (animation) animation.finished.then(finish).catch(() => {});
      else finish();
    } else finish();
  }
  function browse(id: Category) {
    setCategory(id);
    setExpanded(null);
  }
  return (
    <>
      <a className="skip-link" href="#menu">
        Aller au menu
      </a>
      <div className="announcement">
        <span>✳</span> LES BONS MOMENTS SE PRÉPARENT.{" "}
        <span>
          Précommande {deliveryRules.minLeadHours} h à l’avance · délai
          provisoire
        </span>
        <span>✳</span>
      </div>
      <header className="header entrance-header">
        <a href="#" className="brand" aria-label={`${brand.name}, accueil`}>
          {brand.name}
          <span>{brand.tagline}</span>
        </a>
        <nav aria-label="Navigation principale">
          <a href="#menu">Le menu</a>
          <a href="#comment">Comment ça marche</a>
        </nav>
        <button className="cart-button" onClick={openCart}>
          <Icon name="bag" /> Mon panier <b>{count}</b>
        </button>
      </header>
      <main ref={mainRef}>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-sun">✳</span> DU BRUNCH. DU BONHEUR.
            </div>
            <h1 className="entrance-title">
              Le bonheur
              <br />
              se partage.
              <span className="smile" aria-hidden="true">
                ◡
              </span>
            </h1>
            <p>
              Du sucré, du salé, et surtout vos envies.
              <br />
              Composez votre prochain bon moment.
            </p>
            <a className="button yellow entrance-cta" href="#menu">
              Composer mon brunch <span>↗</span>
            </a>
            <div className="hero-footnote">
              <Icon name="clock" /> Vous choisissez. Vous planifiez. Vous
              savourez.
            </div>
          </div>
          <div className="hero-picture entrance-photo">
            <FoodPhoto
              photoKey="pancakes"
              priority
              sizes="(max-width: 640px) 90vw, 46vw"
            />
            <div className="round-stamp">
              GOOD FOOD
              <br />
              <Smile className="stamp-smile" />
              <br />
              GOOD MOOD
            </div>
            <span className="hero-caption">Le goût des bons moments.</span>
          </div>
        </section>
        <div className="marquee" aria-hidden="true">
          <span>UN PEU DE SUCRÉ</span> ✳ <span>UN PEU DE SALÉ</span> ✳{" "}
          <span>BEAUCOUP DE GOOD MOOD</span> ✳ <span>À PARTAGER</span> ✳
        </div>
        <section className="menu-section" id="menu">
          <div className="section-heading" data-reveal>
            <div>
              <span className="eyebrow">FAITES-VOUS PLAISIR</span>
              <h2>
                À chaque envie,
                <br className="mobile-break" /> son brunch
                <span className="orange-dot">.</span>
              </h2>
            </div>
            <p>
              Les bons choix commencent ici.
              <br />À composer, à savourer, à partager.
            </p>
          </div>
          <nav
            ref={categoryNav}
            className="category-nav"
            aria-label="Catégories du menu"
          >
            {categories.map((c) => (
              <button
                key={c.id}
                className={category === c.id ? "active" : ""}
                aria-pressed={category === c.id}
                onClick={() => browse(c.id)}
              >
                <span aria-hidden="true">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </nav>
          <div className="category-heading">
            <h3>{categories.find((c) => c.id === category)?.name}</h3>
            <span>
              {catalog.filter((p) => p.category === category).length}{" "}
              {category === "brunch"
                ? "brunchs à découvrir"
                : "créations à découvrir"}
            </span>
          </div>
          <div
            className={`product-grid ${category === "boards" ? "board-grid" : ""}`}
          >
            {catalog
              .filter((p) => p.category === category)
              .map((p, index) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={index}
                  expanded={expanded === p.id}
                  onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
                  onSave={(config, q) => {
                    setCart((old) => [...old, makeLine(p.id, config, q)]);
                    setToast(`${p.name} ajouté au panier`);
                    setExpanded(null);
                  }}
                />
              ))}
          </div>
          <p className="illustration-note">
            Photos de présentation · les compositions et les choix sont
            détaillés dans le menu.
          </p>
        </section>
        <section className="board-banner" data-reveal>
          <div className="banner-art">
            <FoodPhoto photoKey="board" sizes="(max-width: 640px) 80vw, 38vw" />
          </div>
          <div>
            <span className="eyebrow">VOTRE PLATEAU, VOS RÈGLES</span>
            <h2>
              Les bons moments
              <br />
              se composent à plusieurs.
            </h2>
            <p>
              Petit, moyen ou grand : réunissez vos fromages et charcuteries
              préférés sur un même plateau.
            </p>
            <a
              className="button yellow"
              href="#menu"
              onClick={() => {
                browse("boards");
                setExpanded("board");
              }}
            >
              Composer mon plateau <span>↗</span>
            </a>
          </div>
          <span className="banner-star" aria-hidden="true">
            ✳
          </span>
        </section>
        <section id="comment" className="how-section" data-reveal>
          <span className="eyebrow">ET LE TOUR EST JOUÉ</span>
          <h2>Du menu à votre table.</h2>
          <div className="how-grid">
            {[
              [
                "01",
                "Faites votre sélection",
                "Un brunch complet ou un peu de tout ? Suivez vos envies.",
              ],
              [
                "02",
                "Choisissez votre moment",
                "Programmez votre date et votre créneau de livraison.",
              ],
              [
                "03",
                "Vérifiez & confirmez",
                "Relisez votre sélection puis découvrez le paiement de démonstration.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer>
        <div>
          <a className="brand" href="#">
            {brand.name}
            <span>{brand.tagline}</span>
          </a>
          <p>
            Des envies à partager.
            <br />
            Des moments à savourer.
          </p>
        </div>
        <Smile className="footer-smile" />
        <div className="footer-meta">
          <a href="#menu">Explorer le menu ↗</a>
          <p>
            Prototype de précommande
            <br />
            Nom de marque provisoire · Paiement simulé
          </p>
          <PhotoCredits />
        </div>
      </footer>
      <div className="toast" role="status">
        {toast}
        {persistError &&
          " Le stockage local est indisponible : le panier ne sera pas conservé après actualisation."}
      </div>
      {count > 0 && !isOpen && (
        <button className="mobile-cart button yellow" onClick={openCart}>
          Mon panier · {count} <b>{money(subtotal)} →</b>
        </button>
      )}
      <dialog
        ref={dialog}
        className="cart-dialog"
        aria-labelledby="drawer-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const bounds = e.currentTarget.getBoundingClientRect();
            if (
              e.clientX < bounds.left ||
              e.clientX > bounds.right ||
              e.clientY < bounds.top ||
              e.clientY > bounds.bottom
            )
              close();
          }
        }}
      >
        <div className="drawer-header">
          <span className="eyebrow">{brand.name} / VOTRE SÉLECTION</span>
          <button
            className="icon-button"
            aria-label="Fermer le panier"
            onClick={close}
          >
            <Icon name="close" />
          </button>
        </div>
        <h2
          id="drawer-title"
          className={`drawer-title ${mode === "checkout" ? "sr-only" : ""}`}
        >
          {mode === "confirmed"
            ? "Good mood en vue."
            : mode === "checkout"
              ? "Votre brunch vous attend."
              : "Votre panier"}
          {mode === "cart" && <span> ({count})</span>}
        </h2>
        {mode === "cart" &&
          (!cart.length ? (
            <div className="empty-cart">
              <span>◡</span>
              <h3>Une petite faim ?</h3>
              <p>Votre prochain bon moment commence dans le menu.</p>
              <button className="button blue" onClick={close}>
                Découvrir le menu ↗
              </button>
            </div>
          ) : (
            <>
              <p className="cart-next-step">
                <Icon name="clock" /> Prochaine étape : choisir votre livraison
              </p>
              <div className="cart-lines">
                {cart.map((l) => {
                  const p = catalog.find((p) => p.id === l.productId)!;
                  return (
                    <div className="cart-line" key={l.id}>
                      <span className="cart-category">
                        {categories.find((c) => c.id === p.category)?.name}
                      </span>
                      <div className="row">
                        <h3>{p.name}</h3>
                        <button
                          className="text-button"
                          onClick={() =>
                            setCart(cart.filter((x) => x.id !== l.id))
                          }
                          aria-label={`Retirer ${p.name}`}
                        >
                          ×
                        </button>
                      </div>
                      <p>{summary(p, l.config) || p.description}</p>
                      <div className="row">
                        <Quantity
                          value={l.quantity}
                          onChange={(q) =>
                            setCart(
                              cart.map((x) =>
                                x.id === l.id ? { ...x, quantity: q } : x,
                              ),
                            )
                          }
                        />
                        <strong>
                          {money(price(p, l.config) * l.quantity)}
                        </strong>
                      </div>
                      <button
                        className="text-button edit-link"
                        aria-expanded={editing === l.id}
                        onClick={() =>
                          setEditing(editing === l.id ? null : l.id)
                        }
                      >
                        Modifier ma sélection ↗
                      </button>
                      <AnimatedPanel open={editing === l.id}>
                        <Configurator
                          product={p}
                          initial={l.config}
                          initialQuantity={l.quantity}
                          editing
                          onCancel={() => setEditing(null)}
                          onSave={(config, q) => {
                            setCart(
                              cart.map((x) =>
                                x.id === l.id
                                  ? { ...x, config, quantity: q }
                                  : x,
                              ),
                            );
                            setEditing(null);
                          }}
                        />
                      </AnimatedPanel>
                    </div>
                  );
                })}
              </div>
              <div className="cart-total">
                <div className="row">
                  <strong>Sous-total</strong>
                  <strong>{money(subtotal)}</strong>
                </div>
                <p>
                  Frais de livraison à confirmer. Aucun montant final n’est
                  encore défini.
                </p>
                <button
                  className="button yellow full"
                  onClick={() => {
                    setMode("checkout");
                    dialog.current?.scrollTo(0, 0);
                  }}
                >
                  Planifier ma livraison <span>→</span>
                </button>
                <small>
                  Parcours de démonstration · aucune commande réelle
                </small>
              </div>
            </>
          ))}
        {mode === "checkout" && (
          <Checkout
            lines={cart}
            onBack={() => setMode("cart")}
            onComplete={(o) => {
              setOrder(o);
              setMode("confirmed");
              setCart([]);
              dialog.current?.scrollTo(0, 0);
            }}
          />
        )}
        {mode === "confirmed" && order && (
          <div className="confirmation">
            <span className="confirmation-icon">☺</span>
            <span className="eyebrow">CONFIRMATION DE DÉMONSTRATION</span>
            <h3>Le parcours est terminé !</h3>
            <p>
              Aucune commande n’a été envoyée. Aucun paiement n’a été effectué
              et aucune livraison n’est réservée.
            </p>
            <div className="notice">
              <strong>{order.id}</strong>
              <p>
                {order.customer.date} ·{" "}
                {
                  deliveryRules.slots.find((s) => s.id === order.customer.slot)
                    ?.start
                }{" "}
                ({deliveryRules.timezone})
              </p>
              {order.lines.map((l) => {
                const p = catalog.find((p) => p.id === l.productId)!;
                return (
                  <p key={l.id}>
                    <b>
                      {l.quantity} × {p.name}
                    </b>
                    <br />
                    {summary(p, l.config)}
                  </p>
                );
              })}
              <strong>Sous-total : {money(order.subtotal)}</strong>
              {order.customer.notes && <p>Notes : {order.customer.notes}</p>}
              {order.customer.instructions && (
                <p>Livraison : {order.customer.instructions}</p>
              )}
            </div>
            <button className="button blue full" onClick={close}>
              Retour au menu ↗
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
