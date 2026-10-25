import { isVisible, setVisible } from "./visibility.js";

export function initDesktopNavigation() {
  const menu = document.getElementById("menu");
  if (!menu) return () => {};

  const nav = menu.querySelector("#nav");
  const desktopMenuIcon = document.getElementById("menu-icon");
  const tabletMenuIcon = document.getElementById("menu-icon-tablet");
  const tabletTopIcon = document.getElementById("top-icon-tablet");
  const menuIcons = [desktopMenuIcon, tabletMenuIcon].filter(Boolean);

  function setMenuExpanded(expanded) {
    menu.style.visibility = expanded ? "visible" : "hidden";
    menuIcons.forEach(icon => {
      icon.classList.toggle("active", expanded);
      icon.setAttribute("aria-expanded", String(expanded));
    });
  }

  // Keep the existing default: expand the menu on wide screens.
  setMenuExpanded(document.documentElement.clientWidth >= 1440);
  menuIcons.forEach(icon => {
    icon.setAttribute("aria-controls", "menu");
    icon.addEventListener("click", event => {
      event.preventDefault();
      setMenuExpanded(getComputedStyle(menu).visibility === "hidden");
    });
  });

  return function updateDesktopNavigation(scrollTop) {
    const topDistance = menu.getClientRects().length
      ? menu.getBoundingClientRect().top + scrollTop
      : 0;
    // Preserve the gap between thresholds to avoid flickering at the boundary.
    const nearTop = topDistance < 60 || scrollTop === 0;
    const farFromTop = topDistance > 100;
    if (!nearTop && !farFromTop) return;

    setVisible(nav, nearTop);
    if (!isVisible(desktopMenuIcon)) {
      setVisible(tabletMenuIcon, nearTop);
      setVisible(tabletTopIcon, !nearTop);
    }
  };
}
