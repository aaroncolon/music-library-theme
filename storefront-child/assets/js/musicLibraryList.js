'use strict';

(function() {

  const musicLibrary = (function() {

    const CLASS_BTN_FAVORITE    = 'btn--favorite';
    const CLASS_BTN_IS_FAVORITE = 'btn--is-favorite';
    const CLASS_BTN_LICENSE     = 'btn--license';
    const CLASS_BTN_PLAY_PAUSE  = 'music-list__btn-play-pause';
    const CLASS_PLAYING         = 'music-list__btn-play-pause--playing';

    let $songList = null;

    function init() {
      cacheDom();
      bindEvents();
      render();
    }

    function cacheDom() {
      $songList = jQuery('#music-list__table');
    }

    function bindEvents() {
      $songList.on('click', '.' + CLASS_BTN_PLAY_PAUSE, handleClickPlayPause);
      $songList.on('click', '.' + CLASS_BTN_FAVORITE, handleClickFavorite);
      $songList.on('click', '.' + CLASS_BTN_LICENSE, handleClickLicense);

      events.on('songStateChange', handleSongStateChange, this);
      events.on('createFavoriteSuccess', handleCreateFavoriteSuccess, this);
      events.on('deleteFavoriteSuccess', handleDeleteFavoriteSuccess, this);
      events.on('closeLicenseDialog', handleCloseLicenseDialog, this);
    }

    function render() {
      favorites.getFavorites();
    }

    function handleClickPlayPause(e) {
      e.preventDefault();
      events.trigger('clickPlayPauseList', e);
    }

    function handleClickFavorite(e) {
      // Redirect to login
      if (e.currentTarget.dataset.redirectUrl) {
        window.location.href = e.currentTarget.dataset.redirectUrl;
        return;
      }

      const id = e.currentTarget.dataset.songId;
      const isFavorite = Number(e.currentTarget.dataset.isFavorite);

      if (isFavorite) {
        favorites.deleteFavorite(id);
      } else {
        favorites.createFavorite(id);
      }
    }

    function handleClickLicense(e) {
      // Redirect to login
      if (e.currentTarget.dataset.redirectUrl) {
        window.location.href = e.currentTarget.dataset.redirectUrl;
        return;
      }

      // disable button
      this.disabled = true;

      // get product data for license dialog
      const data = {
        'artist' : this.dataset.songArtist,
        'id'     : this.dataset.songId,
        'image'  : this.dataset.songImage,
        'title'  : this.dataset.songTitle,
        'url'    : this.dataset.songUrl
      }
      // set product data for license dialog
      events.trigger('clickLicense', data);

      // init Magnific Popup
      jQuery(this).magnificPopup({
        // alignTop: true,
        type: 'inline',
        mainClass: 'mfp-license-popup mfp-fade',
        closeOnBgClick: true,
        removalDelay: 300,
        closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',
        callbacks: {
          open: function() {
            events.trigger('mfpOpenLicenseDialog');
          },
          close: function() {
            events.trigger('mfpCloseLicenseDialog');
          }
        }
      }).magnificPopup('open');
    }

    function handleSongStateChange(id) {
      let $songItem = $songList.find('button[data-song-id='+ id +'].music-list__btn-play-pause');

      if (! $songItem.length) { 
        console.log('musicList no match found', id);
        return;
      }

      if ($songItem.hasClass(CLASS_PLAYING)) {
        $songItem
          .removeClass(CLASS_PLAYING)
          .find('span')
          .text('Play');
      } else {
        $songItem
          .addClass(CLASS_PLAYING)
          .find('span')
          .text('Pause');
      }
    }

    function handleCreateFavoriteSuccess(id) {
      $songList
        .find('button[data-song-id="'+ id +'"].' + CLASS_BTN_FAVORITE)
        .attr('data-is-favorite', 1)
        .addClass(CLASS_BTN_IS_FAVORITE);
    }

    function handleDeleteFavoriteSuccess(id) {
      $songList
        .find('button[data-song-id="'+ id +'"].' + CLASS_BTN_FAVORITE)
        .attr('data-is-favorite', 0)
        .removeClass(CLASS_BTN_IS_FAVORITE);
    }

    function handleCloseLicenseDialog(id) {
      // close Magnific Popup via API if open
      utils.closeMagnificPopup();

      let $btnLicense = $songList.find('button[data-song-id='+ id +'].btn--license');

      if (! $btnLicense.length) {
        return;
      }

      // enable license button
      $btnLicense.removeAttr('disabled');
    }

    return {
      init: init
    }

  })();

  musicLibrary.init();

})()
