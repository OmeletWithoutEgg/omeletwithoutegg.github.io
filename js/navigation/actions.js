import { isVisible, setVisible } from "./visibility.js";

export function initNavigationActions() {
  document.querySelectorAll("[data-toggle]").forEach(control => {
    const target = document.getElementById(control.dataset.toggle);
    if (!target) return;
    control.setAttribute("aria-controls", target.id);
    control.setAttribute("aria-expanded", String(isVisible(target)));
    control.addEventListener("click", event => {
      event.preventDefault();
      const expanded = !isVisible(target);
      setVisible(target, expanded);
      control.setAttribute("aria-expanded", String(expanded));
    });
  });

  document.querySelectorAll("[data-scroll-top]").forEach(control => {
    control.addEventListener("click", event => {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      });
    });
  });

  document.querySelectorAll("[data-tooltip]").forEach(control => {
    const label = document.getElementById(control.dataset.tooltip);
    ["mouseenter", "focus"].forEach(event => {
      control.addEventListener(event, () => setVisible(label, true));
    });
    ["mouseleave", "blur"].forEach(event => {
      control.addEventListener(event, () => setVisible(label, false));
    });
  });
}
