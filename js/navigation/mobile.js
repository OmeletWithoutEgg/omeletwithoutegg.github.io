export function initMobileNavigation() {
  const footer = $("#footer-post");
  const footerSubmenus = $("#nav-footer, #toc-footer, #share-footer");
  const footerTopIcon = $("#actions-footer > #top");
  let lastScrollTop = 0;

  return function updateMobileNavigation(scrollTop) {
    if (!footer.length) return;

    // Hide while scrolling down; show while scrolling up.
    footer.toggle(scrollTop <= lastScrollTop);
    lastScrollTop = scrollTop;
    footerSubmenus.hide();

    if (scrollTop < 60) {
      footerTopIcon.hide();
    } else if (scrollTop > 100) {
      footerTopIcon.show();
    }
  };
}
