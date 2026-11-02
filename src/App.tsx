import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  HomeSections,
  PacksAndFaq,
  MenuPage,
  ContactPage,
  ContactDetails,
  NotFound,
  RouteEffects,
  type AddProduct,
} from "./Pages";
import { useEffect, useRef, useState } from "react";
import {
  brand,
  catalog,
  categories,
  money,
  sizes,
  price,
  summary,
  type CartLine,
} from "./catalog";
import { readCart, saveCart, makeLine } from "./cart";
import { deliveryRules } from "./scheduling";
import { Configurator, Quantity } from "./Configurator";
import { Checkout } from "./Checkout";
import { FoodPhoto, PhotoCredits } from "./FoodPhoto";
import {
  AnimatedPanel,
  animateSafely,
  reducedMotion,
  useScrollReveal,
} from "./motion";
import { Icon, Smile } from "./Icons";
import type { Order } from "./services";
export default function App() {
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
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);
  const mobileTrigger = useRef<HTMLButtonElement>(null);
  useScrollReveal(mainRef, location.pathname);
  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (!mobileMenu) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenu(false);
        mobileTrigger.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mobileMenu]);
  const addProduct: AddProduct = (product, config, quantity) => {
    setCart((old) => [...old, makeLine(product.id, config, quantity)]);
    setToast(`${product.name} ajouté au panier`);
  };
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
  return (
    <>
      <RouteEffects />
      <a className="skip-link" href="#main-content">
        Aller au contenu
      </a>
      <div className="announcement">
        <Icon name="sun" /> LES BONS MOMENTS SE PRÉPARENT.{" "}
        <span>
          Précommande {deliveryRules.minLeadHours} h à l’avance · délai
          provisoire
        </span>
        <Icon name="sun" />
      </div>
      <header className="header">
        <Link to="/" className="brand" aria-label={`${brand.name}, accueil`}>
          {brand.name}
          <span>{brand.tagline}</span>
        </Link>
        <nav
          id="primary-navigation"
          className={mobileMenu ? "primary-nav is-open" : "primary-nav"}
          aria-label="Navigation principale"
        >
          <NavLink to="/" end>
            Accueil
          </NavLink>
          <NavLink to="/menu">Notre menu</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <button
          ref={mobileTrigger}
          className="icon-button mobile-menu-toggle"
          aria-label={mobileMenu ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileMenu}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          <Icon name={mobileMenu ? "close" : "menu"} />
        </button>
        <button
          className="cart-button"
          aria-label={`Mon panier, ${count} produit${count !== 1 ? "s" : ""}`}
          onClick={openCart}
        >
          <Icon name="bag" /> Mon panier <b>{count}</b>
        </button>
      </header>
      <main ref={mainRef} id="main-content" tabIndex={-1}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section className="hero">
                  <div className="hero-copy">
                    <div className="eyebrow">
                      <Icon name="sun" /> DU BRUNCH. DU BONHEUR.
                    </div>
                    <h1 className="entrance-title" tabIndex={-1}>
                      Le bonheur
                      <br />
                      se partage.
                      <span className="smile" aria-hidden="true">
                        <Smile />
                      </span>
                    </h1>
                    <p className="entrance-description">
                      Du sucré, du salé, et surtout vos envies.
                      <br />
                      Composez votre prochain bon moment.
                    </p>
                    <div className="hero-actions entrance-cta">
                      <Link
                        className="button yellow"
                        to="/menu?category=brunch"
                      >
                        Composer mon brunch <Icon name="diagonal" />
                      </Link>
                      <Link className="inline-link" to="/menu">
                        Voir le menu <Icon name="arrow" />
                      </Link>
                    </div>
                    <div className="hero-footnote">
                      <Icon name="clock" /> Vous choisissez. Vous planifiez.
                      Vous savourez.
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
                    <span className="hero-caption">
                      Le goût des bons moments.
                    </span>
                  </div>
                </section>
                <div className="marquee" aria-hidden="true">
                  <span>UN PEU DE SUCRÉ</span> <Icon name="sun" />{" "}
                  <span>UN PEU DE SALÉ</span> <Icon name="sun" />{" "}
                  <span>BEAUCOUP DE GOOD MOOD</span> <Icon name="sun" />{" "}
                  <span>À PARTAGER</span> <Icon name="sun" />
                </div>
                <HomeSections onAdd={addProduct} />
                <section className="board-banner" data-reveal>
                  <div className="banner-art">
                    <FoodPhoto
                      photoKey="board"
                      sizes="(max-width: 640px) 80vw, 38vw"
                    />
                  </div>
                  <div>
                    <span className="eyebrow">VOTRE PLATEAU, VOS RÈGLES</span>
                    <h2>
                      Les bons moments
                      <br />
                      se composent à plusieurs.
                    </h2>
                    <p>
                      Petit, moyen ou grand : réunissez vos fromages et
                      charcuteries préférés sur un même plateau.
                    </p>
                    <p className="board-size-guide">
                      {sizes
                        .map(
                          (s) =>
                            `${s.name} · ${s.count} produits · ${money(s.price)}`,
                        )
                        .join(" / ")}
                    </p>
                    <Link className="button yellow" to="/menu?category=boards">
                      Composer mon plateau <Icon name="diagonal" />
                    </Link>
                  </div>
                  <span className="banner-star" aria-hidden="true">
                    <Icon name="sun" />
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
                        "Personnalisez",
                        "Choisissez vos formats, garnitures ou ingrédients selon le produit.",
                      ],
                      [
                        "03",
                        "Planifiez la livraison",
                        "Choisissez une date et un créneau parmi les paramètres de démonstration.",
                      ],
                      [
                        "04",
                        "Vérifiez puis payez",
                        "Relisez votre commande et essayez le paiement de démonstration.",
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
                <PacksAndFaq />
              </>
            }
          />
          <Route path="/menu" element={<MenuPage onAdd={addProduct} />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer>
        <div>
          <Link className="brand" to="/">
            {brand.name}
            <span>{brand.tagline}</span>
          </Link>
          <p>
            Des envies à partager.
            <br />
            Des moments à savourer.
          </p>
        </div>
        <Smile className="footer-smile" />
        <div className="footer-meta">
          <nav aria-label="Navigation de pied de page">
            <Link to="/">Accueil</Link>
            <Link to="/menu">
              Notre menu <Icon name="diagonal" />
            </Link>
            <Link to="/contact">Contact</Link>
            <Link to="/#comment">Comment commander</Link>
          </nav>
          <ContactDetails />
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
          Mon panier · {count}{" "}
          <b>
            {money(subtotal)} <Icon name="arrow" />
          </b>
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
              <Smile className="empty-smile" />
              <h3>Une petite faim ?</h3>
              <p>Votre prochain bon moment commence dans le menu.</p>
              <button
                className="button blue"
                onClick={() => {
                  close();
                  navigate("/menu");
                }}
              >
                Découvrir le menu <Icon name="diagonal" />
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
                          <Icon name="trash" />
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
                        Modifier ma sélection <Icon name="diagonal" />
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
                  Planifier ma livraison <Icon name="arrow" />
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
            <Smile className="confirmation-icon" />
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
              Retour au menu <Icon name="diagonal" />
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
