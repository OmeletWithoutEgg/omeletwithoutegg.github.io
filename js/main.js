$(document).ready(function() {

  /**
   * Shows the responsive navigation menu on mobile.
   */
  $("#header > #nav > ul > .icon").click(function() {
    $("#header > #nav > ul").toggleClass("responsive");
  });


  /**
   * Controls the different versions of  the menu in blog post articles 
   * for Desktop, tablet and mobile.
   */
  if ($(".post").length) {
    const menu = $("#menu");
    const nav = $("#menu > #nav");
    const menuIcon = $("#menu-icon, #menu-icon-tablet");

    /**
     * Display the menu on hi-res laptops and desktops.
     */
    if ($(document).width() >= 1440) {
      menu.css("visibility", "visible");
      menuIcon.addClass("active");
    }

    /**
     * Display the menu if the menu icon is clicked.
     */
    menuIcon.click(function() {
      if (menu.css("visibility") === "hidden") {
        menu.css("visibility", "visible");
        menuIcon.addClass("active");
      } else {
        menu.css("visibility", "hidden");
        menuIcon.removeClass("active");
      }
      return false;
    });

    /**
     * Add a scroll listener to the menu to hide/show the navigation links.
     */
    if (menu.length) {
      $(window).on("scroll", function() {
        const topDistance = menu.offset().top;
        const scrolledTop = topDistance < 60 || window.scrollY == 0;
        const scrolledDown = topDistance > 100;

        // hide only the navigation links on desktop
        if (scrolledTop) {
          nav.show();
        } else if (scrolledDown) {
          nav.hide();
        }

        // on tablet, hide the navigation icon as well and show a "scroll to top
        // icon" instead
        if ($("#menu-icon").not(":visible")) {
          if (scrolledTop) {
            $("#menu-icon-tablet").show();
            $("#top-icon-tablet").hide();
          } else if (scrolledDown) {
            $("#menu-icon-tablet").hide();
            $("#top-icon-tablet").show();
          }
        }
      });
    }

    /**
     * Show mobile navigation menu after scrolling upwards,
     * hide it again after scrolling downwards.
     */
    if ($("#footer-post").length) {
      let lastScrollTop = 0;
      $(window).on("scroll", function() {
        const topDistance = $(window).scrollTop();

        if (topDistance > lastScrollTop){
          // downscroll -> show menu
          $("#footer-post").hide();
        } else {
          // upscroll -> hide menu
          $("#footer-post").show();
        }
        lastScrollTop = topDistance;


        // close all submenu"s on scroll
        $("#nav-footer").hide();
        $("#toc-footer").hide();
        $("#share-footer").hide();

        const scrolledTop = topDistance < 60 || window.scrollY == 0;
        const scrolledDown = topDistance > 100;

        // show a "navigation" icon when close to the top of the page, 
        // otherwise show a "scroll to the top" icon
        if (scrolledTop) {
          $("#actions-footer > #top").hide();
        } else if (scrolledDown) {
          $("#actions-footer > #top").show();
        }
      });
    }
  }
});
