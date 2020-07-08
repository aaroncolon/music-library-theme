"use strict";

jQuery(function(){

  (function() {

    const popupPlayer = (function() {

      const CLASS_PROJECT_POSTS_WRAP = 'project-posts';
      const CLASS_POPUP        = 'open-popup-player';
      const CLASS_PRODUCT_LINK = 'popup-player__product-link';
      const CLASS_LOCK         = 'popup-player__product-link--lock';
      const CLASS_PLAY         = 'popup-player__product-link--play';
      const CLASS_PLAYING      = 'popup-player__product-link--playing';
      const CLASS_PLAYING_TR   = 'popup-player__table-tr--playing';

      let $projectsWrap,
          $popupPlayer;

      function init() {
        cacheDom();
        bindEvents();
        initMagnificPopup();
        initMatchHeight();
      }

      function cacheDom() {
        $projectsWrap = jQuery('.' + CLASS_PROJECT_POSTS_WRAP);
        $popupPlayer = jQuery('.popup-player'); // delegation
      }

      function bindEvents() {
        $popupPlayer.on('click', '.popup-player__product-link', handleClickSongLink);

        events.on('songStateChange', handleSongStateChange, this);
      }

      function initMatchHeight() {
        jQuery('.matchHeight--byRow').matchHeight({
          byRow: true
        });
      }

      function initMagnificPopup() {
        $projectsWrap.magnificPopup({
          delegate: '.' + CLASS_POPUP,
          // alignTop: true,
          type: 'inline',
          mainClass: 'mfp-player-popup mfp-fade',
          closeOnBgClick: true,
          removalDelay: 300,
          closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>'
        });
      }

      function handleClickSongLink(e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        if (itemIsLocked(e)) {
          handleSongLinkLock(e);
        } else {
          events.trigger('clickPlayPauseList', e);
        }
      }

      function handleSongLinkLock(e) {
        events.trigger('clickItemLocked', e);
        window.location.href = e.currentTarget.href;
        return;
      }

      /**
       * Update popup player UI
       * 
       * @param {Number} id the product id
       */
      function handleSongStateChange(id) {
        let $songItem = $popupPlayer.find('a[data-song-id="'+ id +'"].'+ CLASS_PRODUCT_LINK);

        if (! $songItem.length) {
          return;
        }

        if ($songItem.hasClass(CLASS_PLAY)) {
          handleSongLinkPlay($songItem);
        } else {
          handleSongLinkPause($songItem);
        }
      }

      function handleSongLinkPlay($songItem) {
        playSong($songItem);
      }

      function handleSongLinkPause($songItem) {
        pauseSong($songItem);
      }

      function playSong($songItem) {
        // Remove `play` class
        $songItem.removeClass(CLASS_PLAY);

        // Add `playing` class
        $songItem.addClass(CLASS_PLAYING);
        $songItem.closest('tr').addClass(CLASS_PLAYING_TR);
      }

      function pauseSong($songItem) {
        // Remove `playing` class
        $songItem.removeClass(CLASS_PLAYING);
        $songItem.closest('tr').removeClass(CLASS_PLAYING_TR);

        // Add `play` class
        $songItem.addClass(CLASS_PLAY);
      }

      function closePopup() {
        jQuery.magnificPopup.close();
      }

      function itemIsLocked(e) {
        return (jQuery(e.target).hasClass(CLASS_LOCK)) ? true : false;
      }

      return {
        init: init
      }

    })();

    popupPlayer.init();

  })()

}); // ready

