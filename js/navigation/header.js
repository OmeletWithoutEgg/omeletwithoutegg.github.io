export function initHeaderNavigation() {
  const nav = document.querySelector("#header > #nav > ul");
  const toggle = nav?.querySelector(".icon a");
  toggle?.addEventListener("click", event => {
    event.preventDefault();
    const expanded = nav.classList.toggle("responsive");
    toggle.setAttribute("aria-expanded", String(expanded));
  });
  toggle?.setAttribute("aria-expanded", "false");
}
