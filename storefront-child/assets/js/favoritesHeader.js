"use strict";

(function() {

  const favoritesHeader = (function() {
    
    const CLASS_HEADER_FAVORITES_LINK = 'site-header-favorites__link';

    let $favoritesHeaderLink;

    function init() {
      cacheDom();
      bindEvents();
    }

    function cacheDom() {
      $favoritesHeaderLink = jQuery('.' + CLASS_HEADER_FAVORITES_LINK);
    }

    function bindEvents() {
      events.on('favoritesCountChanged', handleFavoritesCountChanged, this);
    }

    function handleFavoritesCountChanged(count) {
      $favoritesHeaderLink.attr('data-favorites', count);
    }

    return {
      init : init
    }

  })();

  favoritesHeader.init();

})()
