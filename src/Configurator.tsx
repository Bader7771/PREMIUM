import { useState, useId } from "react";
import { FoodPhoto } from "./FoodPhoto";
import { formatPhotos } from "./photography";
import { Icon } from "./Icons";
import {
  packDrinkOptions,
  availability,
  boardGroups,
  cheeses,
  meats,
  sizes,
  formats,
  fillings,
  emptyConfig,
  price,
  money,
  configError,
  type Product,
  type Configuration,
  type Option,
} from "./catalog";
export function Configurator({
  product: p,
  initial,
  initialQuantity = 1,
  onSave,
  onCancel,
  editing = false,
}: {
  product: Product;
  initial?: Configuration;
  initialQuantity?: number;
  onSave: (c: Configuration, q: number) => void;
  onCancel: () => void;
  editing?: boolean;
}) {
  const instance = useId();
  const [c, setC] = useState(
    initial ? structuredClone(initial) : emptyConfig(),
  );
  const [quantity, setQuantity] = useState(initialQuantity);
  const set = (key: keyof Configuration, value: unknown) =>
    setC((old) => ({ ...old, [key]: value }));
  const size = sizes.find((s) => s.id === c.size)!;
  const error = configError(p, c);
  const choices = (
    options: Option[],
    key: "ingredients" | "sauces" | "sides",
    max?: number,
  ) => (
    <div className="option-grid">
      {options.map((o) => (
        <label
          key={o.id}
          className={`check-option ${c[key].includes(o.id) ? "selected" : ""}`}
        >
          <input
            type="checkbox"
            checked={c[key].includes(o.id)}
            disabled={
              !c[key].includes(o.id) &&
              max !== undefined &&
              c[key].length >= max
            }
            onChange={() =>
              set(
                key,
                c[key].includes(o.id)
                  ? c[key].filter((id) => id !== o.id)
                  : [...c[key], o.id],
              )
            }
          />
          {o.name}
        </label>
      ))}
    </div>
  );
  return (
    <div className={`configurator ${p.kind === "board" ? "board-config" : ""}`}>
      <div className="row">
        <div>
          <span className="eyebrow">À VOTRE GOÛT</span>
          <h4 className="config-title">
            {editing
              ? "Ajustez votre sélection"
              : "Un brunch qui vous ressemble."}
          </h4>
        </div>
        <button
          className="icon-button"
          onClick={onCancel}
          aria-label="Fermer les options"
        >
          <Icon name="close" />
        </button>
      </div>
      {p.kind === "board" && (
        <>
          <fieldset className="board-size-fieldset">
            <legend>1. Choisissez votre taille</legend>
            <div className="size-options">
              {sizes.map((s) => (
                <label key={s.id} className={c.size === s.id ? "selected" : ""}>
                  <input
                    type="radio"
                    name={`size-${instance}`}
                    checked={c.size === s.id}
                    onChange={() => set("size", s.id)}
                  />
                  <strong>{s.name}</strong>
                  <span>{money(s.price)}</span>
                  <small>{s.count} produits</small>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="row selection-heading">
            <h4>2. Composez votre sélection</h4>
            <span className="counter" aria-live="polite">
              {c.ingredients.length} / {size.count} sélectionnés
            </span>
          </div>
          <p className="helper">
            Choisissez {size.count} produits au total parmi les fromages et la
            charcuterie.
          </p>
          <div className="selection-meter" aria-hidden="true">
            {Array.from({ length: size.count }, (_, i) => (
              <span
                className={i < c.ingredients.length ? "filled" : ""}
                key={i}
              />
            ))}
          </div>
          {c.ingredients.length === size.count && (
            <p className="selection-complete">
              <Icon name="check" /> Sélection complète. Décochez un produit pour
              le remplacer.
            </p>
          )}
          {c.ingredients.length > size.count && (
            <p className="error" role="alert">
              Retirez {c.ingredients.length - size.count} sélection(s) pour
              cette taille. Vos choix ont été conservés.
            </p>
          )}
          <div className="board-picks-grid">
            <fieldset>
              <legend>Les fromages</legend>
              {choices(cheeses, "ingredients", size.count)}
            </fieldset>
            <fieldset>
              <legend>La charcuterie</legend>
              {choices(meats, "ingredients", size.count)}
            </fieldset>
          </div>
          <h4 className="config-step-heading">3. Les petits plus</h4>
          <div className="board-extras-grid">
            {boardGroups.map((g) => (
              <fieldset key={g.id}>
                <legend>{g.label}</legend>
                {choices(g.options, g.id as "sauces" | "sides", g.max)}
              </fieldset>
            ))}
          </div>
          <p className="helper allowance-note">
            Sauces et accompagnements : choix facultatifs sans supplément dans
            cette démo. Modalités à confirmer.
          </p>
        </>
      )}
      {p.kind === "savory" && (
        <>
          <fieldset>
            <legend>1. Votre format</legend>
            <div className="format-options">
              {formats.map((f) => (
                <label
                  key={f.id}
                  className={`format-option ${c.format === f.id ? "selected" : ""}`}
                >
                  <FoodPhoto
                    photoKey={formatPhotos[f.id]}
                    sizes="(max-width: 640px) 28vw, 160px"
                  />
                  <span className="format-label">
                    <input
                      type="radio"
                      name={`format-${instance}`}
                      checked={c.format === f.id}
                      onChange={() => set("format", f.id)}
                    />
                    {f.name}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>2. Votre garniture</legend>
            <div className="option-grid">
              {fillings.map((f) => (
                <label
                  key={f.id}
                  className={`check-option ${c.filling === f.id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={`filling-${instance}`}
                    checked={c.filling === f.id}
                    disabled={!availability[c.format]?.includes(f.id)}
                    onChange={() => set("filling", f.id)}
                  />
                  <span>
                    {f.name}
                    <small>{money(f.price!)}</small>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="helper">
            Disponibilité des garnitures par format à confirmer.
          </p>
        </>
      )}
      {p.kind === "alternative" && (
        <fieldset>
          <legend>Votre supplément</legend>
          {["Chia pudding", "Balboula"].map((a) => (
            <label className="check-option" key={a}>
              <input
                type="radio"
                name={`alternative-${instance}`}
                checked={c.alternative === a}
                onChange={() => set("alternative", a)}
              />
              {a}
            </label>
          ))}
          <p className="helper">
            Choix entre les deux préparations : interprétation provisoire du
            menu.
          </p>
        </fieldset>
      )}
      {p.id === "american" && packDrinkOptions.length > 0 && (
        <fieldset>
          <legend>Votre boisson incluse</legend>
          <div className="option-grid">
            {packDrinkOptions.map((o) => (
              <label key={o.id} className="check-option">
                <input
                  type="radio"
                  name={`pack-drink-${instance}`}
                  checked={c.packDrink === o.id}
                  onChange={() => set("packDrink", o.id)}
                />
                {o.name}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {p.id === "american" && !packDrinkOptions.length && (
        <p className="notice">
          Boisson froide/chaude incluse. Les choix précis restent à confirmer ;
          aucune boisson n’est sélectionnée automatiquement.
        </p>
      )}
      <div className="config-finish">
        <label className="field">
          <span>
            Notes ou demandes spéciales <small>(facultatif)</small>
          </span>
          <textarea
            value={c.notes}
            onChange={(e) => set("notes", e.target.value)}
            maxLength={1000}
            placeholder="Une précision pour votre commande ?"
            rows={2}
          />
        </label>
        <div className="config-bottom">
          <Quantity value={quantity} onChange={setQuantity} />
          <div className="config-price">
            <small>Total de votre sélection</small>
            <strong>{money(price(p, c) * quantity)}</strong>
          </div>
        </div>
        {error && (
          <p className="helper" aria-live="polite">
            {error}
          </p>
        )}
        <button
          className="button blue full"
          disabled={!!error}
          onClick={() => onSave(c, quantity)}
        >
          {editing ? "Enregistrer les modifications" : "Ajouter au panier"}{" "}
          <span>↗</span>
        </button>
      </div>
    </div>
  );
}
export function Quantity({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="quantity">
      <button
        aria-label="Diminuer la quantité"
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <output aria-label="Quantité">{value}</output>
      <button
        aria-label="Augmenter la quantité"
        disabled={value >= 99}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
