import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
export const reducedMotion = () =>
  typeof window === "undefined" ||
  typeof window.matchMedia !== "function" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
/** Enhancement only: unsupported or failing animation APIs never break ordering. */
export function animateSafely(
  el: HTMLElement,
  frames: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  if (reducedMotion() || typeof el.animate !== "function") return null;
  try {
    return el.animate(frames, options);
  } catch {
    return null;
  }
}
/** No hidden baseline styles: content stays visible if observation/animation fails. */
export function useScrollReveal(
  scope: RefObject<HTMLElement | null>,
  revision: string,
) {
  const seen = useRef(new WeakSet<Element>());
  useEffect(() => {
    if (
      reducedMotion() ||
      !scope.current ||
      !("IntersectionObserver" in window)
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          if (seen.current.has(entry.target)) continue;
          seen.current.add(entry.target);
          const el = entry.target as HTMLElement;
          if (typeof el.animate === "function")
            animateSafely(
              el,
              [
                { opacity: 0.18, transform: "translateY(16px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 460,
                easing: "cubic-bezier(.2,.7,.2,1)",
                delay: Number(el.dataset.revealDelay || 0),
              },
            );
        }
      },
      { threshold: 0.09, rootMargin: "0px 0px -24px 0px" },
    );
    scope.current.querySelectorAll("[data-reveal]").forEach((el) => {
      if (!seen.current.has(el)) observer.observe(el);
    });
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      if (media.matches) {
        observer.disconnect();
        scope.current
          ?.getAnimations?.({ subtree: true })
          .forEach((a) => a.cancel());
      }
    };
    media.addEventListener?.("change", stop);
    return () => {
      observer.disconnect();
      media.removeEventListener?.("change", stop);
    };
  }, [scope, revision]);
}
/** Animate measured height only for explicit expand/collapse interactions. */
export function AnimatedPanel({
  open,
  id,
  children,
}: {
  open: boolean;
  id?: string;
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(open);
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (open && !mounted) {
      setMounted(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || typeof el.animate !== "function") {
      if (!open) setMounted(false);
      return;
    }
    const height = el.scrollHeight;
    const animation = animateSafely(
      el,
      open
        ? [
            { height: "0px", opacity: 0 },
            { height: `${height}px`, opacity: 1 },
          ]
        : [
            { height: `${height}px`, opacity: 1 },
            { height: "0px", opacity: 0 },
          ],
      { duration: open ? 260 : 160, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
    if (!animation) {
      if (!open) setMounted(false);
      return;
    }
    if (!open) animation.finished.then(() => setMounted(false)).catch(() => {});
    return () => animation.cancel();
  }, [open, mounted]);
  if (!mounted) return <div id={id} hidden />;
  return (
    <div
      ref={ref}
      id={id}
      className="animated-panel"
      aria-hidden={!open}
      inert={!open}
    >
      {children}
    </div>
  );
}
