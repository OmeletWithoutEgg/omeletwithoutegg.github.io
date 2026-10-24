import { initHeaderNavigation } from "./navigation/header.js";
import { initDesktopNavigation } from "./navigation/desktop.js";
import { initMobileNavigation } from "./navigation/mobile.js";

$(document).ready(function() {
  initHeaderNavigation();
  if (!$(".post").length) return;

  const updateDesktopNavigation = initDesktopNavigation();
  const updateMobileNavigation = initMobileNavigation();

  $(window).on("scroll", function() {
    const scrollTop = $(window).scrollTop();
    updateDesktopNavigation(scrollTop);
    updateMobileNavigation(scrollTop);
  });
});
