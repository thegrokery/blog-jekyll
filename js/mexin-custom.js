/* ---------------------------------------------------------------------- */
/*  doubleTapToGo
/* ---------------------------------------------------------------------- */

jQuery(document).ready(function($){
  var deviceAgent = navigator.userAgent.toLowerCase();
  var agentID = deviceAgent.match(/(iphone|ipod|ipad)/);
  if (agentID) {
    var width = $(window).width();
    if (width > 768) {
      if(jQuery( '#nav li:has(ul)' ).length)
      {
        jQuery( '#nav li:has(ul)' ).doubleTapToGo();
      }
    }
  } else {
    jQuery( '#nav li:has(ul)' ).doubleTapToGo();
  }
});

/* ---------------------------------------------------------------------- */
/*  Scroll to top
/* ---------------------------------------------------------------------- */

jQuery(document).ready(function(){
  jQuery(window).scroll(function(){
    if (jQuery(this).scrollTop() > 100) {
      jQuery('.scrollup').fadeIn();
    } else {
      jQuery('.scrollup').fadeOut();
    }
  });

  jQuery('.scrollup').click(function(){
    jQuery("html, body").animate({ scrollTop: 0 }, 700);
    return false;
  });
});

/*********************/
/*
/*    Sticky Menu
/*
/*********************/

jQuery(document).ready(function(){
  var width = $(window).width();
  if (width > 768) {
    if(jQuery("#sticker").length)
    {
      jQuery("#sticker").sticky({ topSpacing: 0, getWidthFrom: jQuery('#boxed-wrap')});
    }
  }
});

jQuery(window).scroll(function(){
  var width = $(window).width();
  if (width < 768) {
    if(jQuery("#sticker").length)
    {
      jQuery("#sticker").css("position","relative");
    }
  }
});

/*
 * Create HTML5 elements for IE's sake
 */

document.createElement("article");
document.createElement("section");
