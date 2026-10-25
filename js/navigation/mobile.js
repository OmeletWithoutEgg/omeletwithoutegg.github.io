import { setVisible } from "./visibility.js";

export function initMobileNavigation() {
  const footer = document.getElementById("footer-post");
  if (!footer) return () => {};

  const submenus = document.querySelectorAll("#nav-footer, #toc-footer, #share-footer");
  const toggles = footer.querySelectorAll("[data-toggle]");
  const topIcon = document.querySelector("#actions-footer > #top");
  let lastScrollTop = 0;

  return function updateMobileNavigation(scrollTop) {
    // Hide while scrolling down; show while scrolling up.
    setVisible(footer, scrollTop <= lastScrollTop);
    lastScrollTop = scrollTop;
    submenus.forEach(submenu => setVisible(submenu, false));
    toggles.forEach(toggle => toggle.setAttribute("aria-expanded", "false"));

    if (scrollTop < 60) {
      setVisible(topIcon, false);
    } else if (scrollTop > 100) {
      setVisible(topIcon, true);
    }
  };
}
