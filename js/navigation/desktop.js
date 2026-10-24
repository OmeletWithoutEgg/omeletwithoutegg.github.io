export function initDesktopNavigation() {
  const menu = $("#menu");
  const nav = $("#menu > #nav");
  const desktopMenuIcon = $("#menu-icon");
  const tabletMenuIcon = $("#menu-icon-tablet");
  const tabletTopIcon = $("#top-icon-tablet");
  const menuIcons = desktopMenuIcon.add(tabletMenuIcon);

  function setMenuExpanded(expanded) {
    menu.css("visibility", expanded ? "visible" : "hidden");
    menuIcons.toggleClass("active", expanded);
    menuIcons.attr("aria-expanded", String(expanded));
  }

  // Keep the existing default: expand the menu on wide screens.
  setMenuExpanded($(document).width() >= 1440);
  menuIcons.attr("aria-controls", "menu");
  menuIcons.on("click", function(event) {
    event.preventDefault();
    setMenuExpanded(menu.css("visibility") === "hidden");
  });

  return function updateDesktopNavigation(scrollTop) {
    if (!menu.length) return;

    const topDistance = menu.offset().top;
    // Preserve the gap between thresholds to avoid flickering at the boundary.
    const nearTop = topDistance < 60 || scrollTop === 0;
    const farFromTop = topDistance > 100;
    if (!nearTop && !farFromTop) return;

    nav.toggle(nearTop);
    if (!desktopMenuIcon.is(":visible")) {
      tabletMenuIcon.toggle(nearTop);
      tabletTopIcon.toggle(!nearTop);
    }
  };
}
