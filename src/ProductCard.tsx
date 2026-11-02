import { money, type Product, type Configuration } from "./catalog";
import { FoodPhoto } from "./FoodPhoto";
import { productPhotos } from "./photography";
import { Configurator } from "./Configurator";
import { AnimatedPanel } from "./motion";
import { Icon } from "./Icons";
export function ProductCard({
  product: p,
  index,
  expanded,
  onToggle,
  onSave,
}: {
  product: Product;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onSave: (c: Configuration, q: number) => void;
}) {
  const photo = productPhotos[p.id];
  return (
    <article
      className={`product-card ${expanded ? "expanded" : ""} ${p.blocked ? "unavailable" : ""} ${p.kind === "board" || p.kind === "savory" ? "feature-product" : ""}`}
      data-reveal
      data-reveal-delay={(index % 3) * 65}
    >
      {!p.blocked && (
        <div className={`product-visual visual-${p.category}`}>
          {photo ? (
            <FoodPhoto photoKey={photo} />
          ) : (
            <div className="recipe-pending">
              <Icon name="drinks" />
              <small>{p.name}</small>
              <p>
                {p.id === "drink-2"
                  ? "Un peu de douceur à boire."
                  : "Recette à découvrir."}
              </p>
            </div>
          )}
          {p.kind && (
            <span className="custom-badge">
              À composer <Icon name="arrow" />
            </span>
          )}
          {p.id === "extra-2" && (
            <span className="photo-caption">En photo : chia pudding</span>
          )}
        </div>
      )}
      <div className="product-body">
        {p.blocked && (
          <span className="pending-icon">
            <Icon name="lock" />
          </span>
        )}
        <div className="row product-title">
          <h3>{p.name}</h3>
          <strong className="price-tag">
            {p.kind && <small>DÈS </small>}
            {money(p.price)}
          </strong>
        </div>
        <p>{p.description}</p>
        {p.blocked ? (
          <span className="unavailable-label">
            Disponible après confirmation de la composition
          </span>
        ) : (
          <button
            className="product-action"
            aria-expanded={expanded}
            aria-controls={`config-${p.id}`}
            onClick={onToggle}
          >
            <span>
              {expanded
                ? "Fermer les options"
                : p.kind
                  ? "Composer à mon goût"
                  : p.category === "brunch"
                    ? "Choisir ce brunch"
                    : "Choisir ce produit"}
            </span>
            <span className="action-symbol" aria-hidden="true">
              <Icon name={expanded ? "minus" : "plus"} />
            </span>
          </button>
        )}
      </div>
      <AnimatedPanel id={`config-${p.id}`} open={expanded}>
        <Configurator product={p} onCancel={onToggle} onSave={onSave} />
      </AnimatedPanel>
    </article>
  );
}
