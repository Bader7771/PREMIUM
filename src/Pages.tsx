import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  catalog,
  categories,
  money,
  sizes,
  type Configuration,
  type Product,
} from "./catalog";
import { ProductCard } from "./ProductCard";
import { FoodPhoto } from "./FoodPhoto";
import { Icon } from "./Icons";
import { business, contactErrors, type ContactFields } from "./business";
import { useScrollReveal } from "./motion";
export type AddProduct = (
  p: Product,
  config: Configuration,
  quantity: number,
) => void;
export function RouteEffects() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    document.title = `${pathname === "/" ? "Accueil" : pathname === "/menu" ? "Notre menu" : pathname === "/contact" ? "Contact" : "Page introuvable"} | PREMIUM`;
    {
      if (hash)
        document
          .getElementById(decodeURIComponent(hash.slice(1)))
          ?.scrollIntoView({ behavior: "instant" });
      else window.scrollTo({ top: 0, behavior: "instant" });
      document
        .querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
    }
  }, [pathname, hash]);
  return null;
}
const categoryPhotos: Record<string, string> = {
  brunch: "moroccan",
  boards: "board",
  savory: "bagel",
  sweet: "pancakes",
  extras: "fruit",
  drinks: "orange",
};
export function HomeSections({ onAdd }: { onAdd: AddProduct }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <>
      <section className="page-section visual-categories" id="categories">
        <div className="section-heading" data-reveal>
          <div>
            <span className="eyebrow">À CHAQUE ENVIE SON MOMENT</span>
            <h2>Qu’est-ce qui vous fait envie ?</h2>
          </div>
          <Link className="inline-link" to="/menu">
            Tout le menu <Icon name="arrow" />
          </Link>
        </div>
        <div className="category-gallery">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              to={`/menu?category=${c.id}`}
              data-reveal
              data-reveal-delay={(i % 3) * 55}
              className="category-tile"
            >
              <div>
                <FoodPhoto
                  photoKey={categoryPhotos[c.id]}
                  sizes="(max-width: 600px) 44vw, 28vw"
                />
              </div>
              <span>
                <Icon name={c.id} />
                {c.name}
                <Icon name="diagonal" />
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="page-section featured-section" id="favoris">
        <div className="section-heading" data-reveal>
          <div>
            <span className="eyebrow">POUR COMMENCER</span>
            <h2>Trois envies à explorer.</h2>
          </div>
          <p>
            Un brunch, du salé, une touche de douceur.
            <br />À vous de composer la suite.
          </p>
        </div>
        <div className="product-grid">
          {["american", "savory", "sweet-3"].map((id, i) => {
            const p = catalog.find((p) => p.id === id)!;
            return (
              <ProductCard
                key={id}
                product={p}
                index={i}
                expanded={expanded === id}
                onToggle={() => setExpanded(expanded === id ? null : id)}
                onSave={(c, q) => {
                  onAdd(p, c, q);
                  setExpanded(null);
                }}
              />
            );
          })}
        </div>
        <p className="illustration-note">
          Photos de présentation · les compositions et les choix sont détaillés
          dans le menu.
        </p>
      </section>
      <section className="customize-story page-section" data-reveal>
        <div className="story-image" data-reveal="image">
          <FoodPhoto photoKey="bagel" />
        </div>
        <div>
          <span className="eyebrow">UNE COMPOSITION QUI VOUS RESSEMBLE</span>
          <h2>
            Votre brunch.
            <br />
            Vos envies.
          </h2>
          <p>
            Partez d’un pack du menu ou assemblez vos produits préférés. Pour le
            salé, choisissez votre format — toast, bagel ou croissant — puis
            votre garniture.
          </p>
          <p>
            Une précision ? Ajoutez une note à votre sélection. Les demandes
            spéciales restent à confirmer.
          </p>
          <Link className="inline-link" to="/menu?category=savory">
            Découvrir les options <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </>
  );
}
export function PacksAndFaq() {
  return (
    <>
      <section className="page-section packs-section" id="packs">
        <div className="section-heading" data-reveal>
          <div>
            <span className="eyebrow">LE BRUNCH, TOUT SIMPLEMENT</span>
            <h2>À chacun son pack.</h2>
          </div>
          <Link className="inline-link" to="/menu?category=brunch">
            Choisir mon brunch <Icon name="arrow" />
          </Link>
        </div>
        <div className="pack-list">
          {catalog
            .filter((p) => p.category === "brunch")
            .map((p, i) => (
              <div
                className="pack-row"
                key={p.id}
                data-reveal
                data-reveal-delay={i * 45}
              >
                <span className="pack-number">0{i + 1}</span>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                  {p.blocked && (
                    <small>Indisponible · composition à confirmer</small>
                  )}
                </div>
                <strong>{money(p.price)}</strong>
                {!p.blocked && (
                  <Link
                    to="/menu?category=brunch"
                    aria-label={`Découvrir ${p.name}`}
                  >
                    <Icon name="diagonal" />
                  </Link>
                )}
              </div>
            ))}
        </div>
      </section>
      <section className="page-section faq-section" data-reveal>
        <div>
          <span className="eyebrow">LES PETITES QUESTIONS</span>
          <h2>
            Avant de passer
            <br />à table.
          </h2>
          <Link className="inline-link" to="/contact">
            Nous contacter <Icon name="arrow" />
          </Link>
        </div>
        <div className="faq-list">
          {[
            [
              "Comment composer mon cheese board ?",
              `Choisissez un plateau ${sizes.map((s) => `${s.name.toLowerCase()} à ${money(s.price)} (${s.count} produits)`).join(", ")}. Sélectionnez exactement ce nombre de fromages et charcuteries au total. Les sauces et accompagnements sont facultatifs dans cette démonstration ; leurs modalités restent à confirmer.`,
            ],
            [
              "Puis-je modifier mon panier ?",
              "Oui. Modifiez la composition et les quantités ou retirez un produit depuis le panier, accessible sur chaque page. Votre sélection est conservée dans ce navigateur si le stockage local est disponible.",
            ],
            [
              "Quels sont les délais et les frais de livraison ?",
              "Les zones, créneaux, frais et délais définitifs restent à confirmer. Les paramètres actuels servent à essayer la planification et ne constituent pas une réservation de livraison.",
            ],
            [
              "Le paiement est-il réel ?",
              "Non. Le parcours actuel est une démonstration : aucune commande n’est transmise et aucun paiement n’est prélevé. Aucune carte bancaire n’est demandée.",
            ],
          ].map(([q, a]) => (
            <details key={q}>
              <summary>
                {q}
                <Icon name="plus" />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-cta" data-reveal>
        <Icon name="sun" />
        <span className="eyebrow">ON SE RETROUVE AUTOUR D’UN BRUNCH ?</span>
        <h2>
          Le prochain bon moment
          <br />
          commence ici.
        </h2>
        <Link className="button yellow" to="/menu">
          Explorer le menu <Icon name="arrow" />
        </Link>
      </section>
    </>
  );
}
export function MenuPage({ onAdd }: { onAdd: AddProduct }) {
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "all";
  const query = params.get("q") || "";
  const [searchText, setSearchText] = useState(query);
  useEffect(() => setSearchText(query), [query]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  useScrollReveal(root, `${category}/${query}`);
  const products = catalog.filter(
    (p) =>
      (category === "all" || p.category === category) &&
      `${p.name} ${p.description}`
        .toLocaleLowerCase("fr")
        .includes(searchText.trim().toLocaleLowerCase("fr")),
  );
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: key === "q", preventScrollReset: true });
    setExpanded(null);
  };
  return (
    <section className="menu-section catalog-page" id="menu" ref={root}>
      <div className="page-intro">
        <span className="eyebrow">DU SUCRÉ, DU SALÉ, VOS ENVIES</span>
        <h1 tabIndex={-1}>
          Notre menu<span className="orange-dot">.</span>
        </h1>
        <p>
          Tous nos produits, leurs prix et vos choix de composition, au même
          endroit.
        </p>
      </div>
      <label className="search-field">
        <Icon name="search" />
        <span className="sr-only">Rechercher un produit</span>
        <input
          type="search"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            update("q", e.target.value);
          }}
          placeholder="Un brunch, un bagel, un café…"
        />
      </label>
      <nav className="category-nav" aria-label="Catégories du menu">
        <button
          aria-pressed={category === "all"}
          className={category === "all" ? "active" : ""}
          onClick={() => update("category", "all")}
        >
          <Icon name="menu" />
          Tout le menu
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            className={category === c.id ? "active" : ""}
            aria-pressed={category === c.id}
            onClick={() => update("category", c.id)}
          >
            <Icon name={c.id} />
            {c.name}
          </button>
        ))}
      </nav>
      <div className="category-heading">
        <h2>
          {category === "all"
            ? "Toutes vos envies"
            : categories.find((c) => c.id === category)?.name ||
              "Catégorie inconnue"}
        </h2>
        <span role="status">
          {products.length} produit{products.length !== 1 ? "s" : ""}
        </span>
      </div>
      {products.length ? (
        <div
          className={`product-grid ${category === "boards" ? "board-grid" : ""}`}
        >
          {products.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              index={i}
              expanded={expanded === p.id}
              onToggle={() => setExpanded(expanded === p.id ? null : p.id)}
              onSave={(c, q) => {
                onAdd(p, c, q);
                setExpanded(null);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="search-empty">
          <Icon name="search" />
          <h2>Aucun produit pour cette envie.</h2>
          <p>Essayez un autre mot ou découvrez toutes les catégories.</p>
          <button className="button blue" onClick={() => setParams({})}>
            Réinitialiser les filtres <Icon name="arrow" />
          </button>
        </div>
      )}
      <p className="illustration-note">
        Photos de présentation · les compositions et les choix sont détaillés
        dans le menu.
      </p>
    </section>
  );
}
export function ContactDetails() {
  return (
    <div className="contact-details">
      {business.phone && (
        <a href={`tel:${business.phone}`}>
          <Icon name="phone" />
          {business.phone}
        </a>
      )}
      {business.email && (
        <a href={`mailto:${business.email}`}>
          <Icon name="mail" />
          {business.email}
        </a>
      )}
      {business.address && (
        <p>
          <Icon name="pin" />
          {business.address}
        </p>
      )}
      {business.hours && (
        <p>
          <Icon name="clock" />
          {business.hours}
        </p>
      )}
      {business.socials.map((s) => (
        <a key={s.url} href={s.url} rel="noreferrer" target="_blank">
          {s.label}
          <Icon name="diagonal" />
        </a>
      ))}
      {business.mapUrl && (
        <a href={business.mapUrl} rel="noreferrer" target="_blank">
          Voir la carte <Icon name="pin" />
        </a>
      )}
    </div>
  );
}
export function ContactPage() {
  const [fields, setFields] = useState<ContactFields>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<ReturnType<typeof contactErrors>>({});
  const [reviewed, setReviewed] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  return (
    <section className="page-section contact-page">
      <div className="page-intro">
        <span className="eyebrow">PARLONS DE VOS ENVIES</span>
        <h1 tabIndex={-1}>Un mot, une question ?</h1>
        <p>
          Une précision sur le menu ou une demande particulière ? Préparez votre
          message ici.
        </p>
      </div>
      <div className="contact-layout">
        <div>
          <h2>Gardons le contact.</h2>
          <ContactDetails />
          {!business.phone && !business.email && (
            <p>
              Les coordonnées de l’établissement seront affichées dès leur
              confirmation.
            </p>
          )}
          <div className="contact-photo">
            <FoodPhoto photoKey="coffee" />
          </div>
          <Link className="inline-link" to="/menu">
            Revenir aux bonnes choses <Icon name="arrow" />
          </Link>
        </div>
        <form
          ref={form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const next = contactErrors(fields);
            setErrors(next);
            setReviewed(Object.keys(next).length === 0);
            requestAnimationFrame(() =>
              form.current
                ?.querySelector<HTMLElement>('[aria-invalid="true"]')
                ?.focus(),
            );
          }}
        >
          <p className="notice">
            <Icon name="mail" /> Formulaire de démonstration. Aucun message
            n’est envoyé. Utilisez des informations fictives.
          </p>
          {(["name", "email", "message"] as const).map((key) => (
            <label className="field" key={key}>
              <span>
                {key === "name"
                  ? "Votre nom"
                  : key === "email"
                    ? "Votre e-mail"
                    : "Votre message"}{" "}
                <small>(requis)</small>
              </span>
              {key === "message" ? (
                <textarea
                  required
                  minLength={10}
                  maxLength={3000}
                  rows={6}
                  value={fields[key]}
                  onChange={(e) => {
                    setFields({ ...fields, [key]: e.target.value });
                    setReviewed(false);
                  }}
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `contact-${key}` : undefined}
                />
              ) : (
                <input
                  required
                  type={key === "email" ? "email" : "text"}
                  autoComplete={key}
                  maxLength={key === "name" ? 100 : 254}
                  value={fields[key]}
                  onChange={(e) => {
                    setFields({ ...fields, [key]: e.target.value });
                    setReviewed(false);
                  }}
                  aria-invalid={!!errors[key]}
                  aria-describedby={errors[key] ? `contact-${key}` : undefined}
                />
              )}
              {errors[key] && (
                <small id={`contact-${key}`} className="error">
                  {errors[key]}
                </small>
              )}
            </label>
          ))}
          <button className="button blue full">
            Vérifier mon message (démo) <Icon name="check" />
          </button>
          <div role="status">
            {reviewed && (
              <p className="notice">
                Votre message est valide. Il reste dans ce formulaire : aucun
                envoi n’a été effectué, le service de contact n’est pas encore
                connecté.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
export function NotFound() {
  return (
    <section className="page-section not-found">
      <span className="eyebrow">404 · PAGE INTROUVABLE</span>
      <h1 tabIndex={-1}>Une petite erreur de parcours.</h1>
      <p>Cette page n’existe pas. Retrouvez toutes vos envies dans le menu.</p>
      <Link className="button blue" to="/menu">
        Découvrir le menu <Icon name="arrow" />
      </Link>
      <Link className="inline-link" to="/">
        Retour à l’accueil
      </Link>
    </section>
  );
}
