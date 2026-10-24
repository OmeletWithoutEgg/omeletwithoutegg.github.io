export function initHeaderNavigation() {
  const headerNav = $("#header > #nav > ul");
  headerNav.find(".icon").on("click", function() {
    headerNav.toggleClass("responsive");
  });
}
