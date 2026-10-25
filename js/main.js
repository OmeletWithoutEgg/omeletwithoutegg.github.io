import { initHeaderNavigation } from "./navigation/header.js";
import { initDesktopNavigation } from "./navigation/desktop.js";
import { initMobileNavigation } from "./navigation/mobile.js";
import { initNavigationActions } from "./navigation/actions.js";

function initNavigation() {
  initHeaderNavigation();
  if (!document.querySelector(".post")) return;

  initNavigationActions();
  const updateDesktopNavigation = initDesktopNavigation();
  const updateMobileNavigation = initMobileNavigation();

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    updateDesktopNavigation(scrollTop);
    updateMobileNavigation(scrollTop);
  }, { passive: true });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNavigation, { once: true });
} else {
  initNavigation();
}
