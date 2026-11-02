import { useState } from "react";
import { photos, photoUrl } from "./photography";
export function FoodPhoto({
  photoKey,
  priority = false,
  className = "",
  sizes = "(max-width: 640px) 90vw, (max-width: 1000px) 44vw, 30vw",
}: {
  photoKey: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const photo = photos[photoKey];
  const widths =
    photo?.provider === "commons" ? [960, 1280] : [240, 480, 640, 960, 1280];
  const [failed, setFailed] = useState(false);
  const [retryOriginal, setRetryOriginal] = useState(false);
  if (!photo || failed)
    return (
      <div
        className={`photo-fallback ${className}`}
        role="img"
        aria-label={photo?.alt || "Photographie indisponible"}
      >
        <span aria-hidden="true">✳</span>
        <span>Le goût des bons moments.</span>
        <small>Photo momentanément indisponible</small>
      </div>
    );
  return (
    <img
      className={`food-photo ${className}`}
      src={retryOriginal ? photo.url : photoUrl(photo, 960)}
      srcSet={
        retryOriginal
          ? undefined
          : widths.map((w) => `${photoUrl(photo, w)} ${w}w`).join(", ")
      }
      sizes={sizes}
      alt={photo.alt}
      width={960}
      height={720}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ objectPosition: photo.position }}
      onError={() => (retryOriginal ? setFailed(true) : setRetryOriginal(true))}
    />
  );
}
export function PhotoCredits() {
  return (
    <details className="photo-credits" id="credits">
      <summary>Crédits photographiques ↗</summary>
      <p>
        Photos de présentation. Les ingrédients, quantités et choix proposés
        sont ceux du menu.
      </p>
      <ul>
        {Object.entries(photos).map(([key, p]) => (
          <li key={key}>
            <a href={p.source} target="_blank" rel="noreferrer">
              {p.author}
            </a>{" "}
            ·{" "}
            <a href={p.licenseUrl} target="_blank" rel="noreferrer">
              {p.license}
            </a>
            {p.license === "CC BY-SA 4.0" &&
              " · recadrage de présentation, sous la même licence"}
          </li>
        ))}
      </ul>
    </details>
  );
}
