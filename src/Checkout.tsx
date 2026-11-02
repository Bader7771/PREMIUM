import { Icon } from "./Icons";
import { useEffect, useRef, useState } from "react";
import { catalog, price, money, summary, type CartLine } from "./catalog";
import {
  deliveryRules,
  dates,
  scheduleError,
  customerErrors,
  type Customer,
} from "./scheduling";
import { demoOrderService, type Order } from "./services";
export function Checkout({
  lines,
  onBack,
  onComplete,
}: {
  lines: CartLine[];
  onBack: () => void;
  onComplete: (o: Order) => void;
}) {
  const [step, setStep] = useState(0);
  const [c, setC] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
    area: "",
    date: "",
    slot: "",
    instructions: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    root.current?.closest("dialog")?.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
  useEffect(() => {
    if (Object.keys(errors).length)
      root.current
        ?.querySelector<HTMLElement>('[aria-invalid="true"]:not(:disabled)')
        ?.focus();
  }, [errors]);
  const key = useRef(crypto.randomUUID());
  const lock = useRef(false);
  const total = lines.reduce(
    (s, l) =>
      s +
      price(catalog.find((p) => p.id === l.productId)!, l.config) * l.quantity,
    0,
  );
  const fee = deliveryRules.serviceAreas.find((a) => a.id === c.area)?.fee;
  const field = (
    id: keyof Customer,
    label: string,
    autoComplete?: string,
    type = "text",
  ) => (
    <label className="field">
      {label}
      <input
        type={type}
        aria-label={label}
        autoComplete={autoComplete}
        required={!["instructions", "notes"].includes(id)}
        value={c[id]}
        onChange={(e) => setC({ ...c, [id]: e.target.value })}
        aria-invalid={!!errors[id]}
        aria-describedby={errors[id] ? `error-${id}` : undefined}
      />
      {errors[id] && (
        <small className="error" id={`error-${id}`}>
          {errors[id]}
        </small>
      )}
    </label>
  );
  const advance = () => {
    const e = customerErrors(c, lines);
    setErrors(e);
    if (Object.keys(e).length) {
      setStep(0);
      return;
    }
    setStep(step + 1);
    setFailure("");
  };
  async function submit() {
    if (lock.current) return;
    const e = customerErrors(c, lines);
    setErrors(e);
    if (Object.keys(e).length) {
      setStep(0);
      return;
    }
    lock.current = true;
    setBusy(true);
    try {
      onComplete(await demoOrderService.submit(lines, c, key.current));
    } catch (e) {
      setFailure((e as Error).message);
    } finally {
      setBusy(false);
      lock.current = false;
    }
  }
  return (
    <div className="checkout" ref={root}>
      <button
        className="text-button"
        onClick={step ? () => setStep(step - 1) : onBack}
      >
        <Icon name="back" /> {step ? "Étape précédente" : "Retour au panier"}
      </button>
      <div
        className="checkout-steps"
        role="list"
        aria-label="Étapes de la commande"
      >
        {["Livraison", "Vérification", "Paiement démo"].map((s, i) => (
          <span
            className={i === step ? "active" : i < step ? "complete" : ""}
            key={s}
            role="listitem"
            aria-current={i === step ? "step" : undefined}
          >
            <b>{i < step ? <Icon name="check" /> : i + 1}</b>
            {s}
          </span>
        ))}
      </div>
      <h2 ref={heading} tabIndex={-1}>
        {
          [
            "Un brunch, au bon moment.",
            "Tout est à votre goût ?",
            "Essayez le parcours.",
          ][step]
        }
      </h2>
      <p className="notice">
        Démonstration : aucune commande réelle ne sera envoyée et aucun paiement
        ne sera prélevé. Utilisez des coordonnées fictives.
      </p>
      {step === 0 && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            advance();
          }}
          noValidate
        >
          <h3>Vos coordonnées</h3>
          <p className="helper">
            Les champs sont requis, sauf mention « facultatif ».
          </p>
          <div className="form-grid">
            {field("name", "Nom complet", "name")}
            {field("phone", "Téléphone", "tel", "tel")}
          </div>
          {field("address", "Adresse de livraison", "street-address")}
          <label className="field">
            Ville / zone de livraison
            <select
              required
              value={c.area}
              onChange={(e) => setC({ ...c, area: e.target.value })}
              aria-invalid={!!errors.area}
              aria-describedby="error-area"
            >
              <option value="">Choisir une zone</option>
              {deliveryRules.serviceAreas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
            <small id="error-area" className="error">
              {errors.area}
            </small>
          </label>
          <h3>Planifier la livraison</h3>
          <p className="helper">
            Précommande {deliveryRules.minLeadHours} h à l’avance, règle
            provisoire. Horaires et zones de démonstration. Heure locale :{" "}
            {deliveryRules.timezone}.
          </p>
          <div className="form-grid">
            <label className="field">
              Date de livraison
              <select
                required
                aria-invalid={!!errors.slot && !c.date}
                aria-describedby={
                  errors.slot && !c.date ? "error-slot" : undefined
                }
                value={c.date}
                onChange={(e) => setC({ ...c, date: e.target.value, slot: "" })}
              >
                <option value="">Choisir une date</option>
                {dates(lines).map((d) => (
                  <option key={d} value={d}>
                    {new Intl.DateTimeFormat("fr-MA", {
                      dateStyle: "full",
                      timeZone: "UTC",
                    }).format(new Date(`${d}T12:00:00Z`))}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Créneau de livraison
              <select
                required
                value={c.slot}
                disabled={!c.date}
                onChange={(e) => setC({ ...c, slot: e.target.value })}
                aria-invalid={!!errors.slot}
                aria-describedby="error-slot"
              >
                <option value="">Choisir un créneau</option>
                {deliveryRules.slots
                  .filter((s) => !scheduleError(c.date, s.id, lines))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.start} – {s.end}
                    </option>
                  ))}
              </select>
            </label>
          </div>
          {errors.slot && (
            <p id="error-slot" className="error" role="alert">
              {errors.slot}
            </p>
          )}
          {field("instructions", "Instructions de livraison (facultatif)")}
          {field("notes", "Notes ou demandes spéciales (facultatif)")}
          <button className="button blue full">
            Vérifier ma commande <Icon name="arrow" />
          </button>
        </form>
      )}
      {step > 0 && (
        <>
          <div className="review">
            <h3>Votre sélection</h3>
            {lines.map((l) => {
              const p = catalog.find((p) => p.id === l.productId)!;
              return (
                <div className="review-line" key={l.id}>
                  <div>
                    <strong>
                      {l.quantity} × {p.name}
                    </strong>
                    <p>{summary(p, l.config)}</p>
                  </div>
                  <b>{money(price(p, l.config) * l.quantity)}</b>
                </div>
              );
            })}
            <div className="review-line">
              <span>Sous-total produits</span>
              <strong>{money(total)}</strong>
            </div>
            <div className="review-line">
              <span>Livraison</span>
              <span>{fee == null ? "Tarif à confirmer" : money(fee)}</span>
            </div>
            {fee != null && (
              <div className="review-line">
                <strong>Total de démonstration</strong>
                <strong>{money(total + fee)}</strong>
              </div>
            )}
            <p className="helper">
              Le montant final avec livraison sera défini après confirmation des
              frais.
            </p>
            <h3>Livraison programmée</h3>
            <p>
              {c.name} · {c.phone}
              <br />
              {c.address}
              <br />
              {deliveryRules.serviceAreas.find((a) => a.id === c.area)?.label}
              <br />
              {c.date} ·{" "}
              {deliveryRules.slots.find((s) => s.id === c.slot)?.start} –{" "}
              {deliveryRules.slots.find((s) => s.id === c.slot)?.end} (
              {deliveryRules.timezone})
            </p>
            {c.instructions && <p>Livraison : {c.instructions}</p>}
            {c.notes && <p>Demandes spéciales : {c.notes}</p>}
          </div>
          {step === 1 ? (
            <button className="button blue full" onClick={advance}>
              Continuer vers le paiement démo <Icon name="arrow" />
            </button>
          ) : (
            <>
              <div className="payment-demo">
                <Icon name="payment" />
                <h3>Paiement de démonstration</h3>
                <p>
                  Aucune carte bancaire requise. Cette simulation ne réserve pas
                  de livraison et ne transmet rien au commerçant.
                </p>
              </div>
              {failure && (
                <p className="error" role="alert">
                  {failure}
                </p>
              )}
              <button
                className="button blue full"
                disabled={busy}
                onClick={submit}
              >
                {busy ? "Simulation en cours…" : "Simuler la confirmation"}{" "}
                <Icon name="arrow" />
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
