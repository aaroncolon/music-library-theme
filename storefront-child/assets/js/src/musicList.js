import events from './Events.js';
import utils from './Utilities.js';
import favorites from './Favorites.js';

const musicList = (function() {

  const ID_LICENSE_DIALOG            = 'license-dialog',
        ID_MUSIC_LIST_TABLE          = 'music-list__table',
        CLASS_BTN_FAVORITE           = 'btn--favorite',
        CLASS_BTN_IS_FAVORITE        = 'btn--is-favorite',
        CLASS_BTN_LICENSE            = 'btn--license',
        CLASS_BTN_PLAY_PAUSE         = 'music-list__btn-play-pause',
        CLASS_BTN_PLAY_PAUSE_LOADING = 'music-list__btn-play-pause--loading',
        CLASS_BTN_PLAY_PAUSE_PLAYING = 'music-list__btn-play-pause--playing';

  let $songList;

  function init() {
    if (cacheDom()) {
      bindEvents();
    }
  }

  function cacheDom() {
    $songList = jQuery('#' + ID_MUSIC_LIST_TABLE);

    return ($songList.length) ? true : false;
  }

  function bindEvents() {
    // Music List Table
    $songList.on('click', '.' + CLASS_BTN_PLAY_PAUSE, handleClickPlayPause);
    $songList.on('click', '.' + CLASS_BTN_FAVORITE, handleClickFavorite);
    $songList.on('click', '.' + CLASS_BTN_LICENSE, handleClickLicense);

    events.on('songStateChange', handleSongStateChange, this);
    events.on('createFavoriteSuccess', handleCreateFavoriteSuccess, this);
    events.on('deleteFavoriteSuccess', handleDeleteFavoriteSuccess, this);
    events.on('closeLicenseDialog', handleCloseLicenseDialog, this);
  }

  function handleClickPlayPause(e) {
    e.preventDefault();
    events.trigger('clickPlayPauseList', e);
  }

  function handleClickFavorite(e) {
    e.preventDefault();

    if (e.currentTarget.dataset.redirectUrl) {
      events.trigger('openConfirmDialog', e);
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
    e.preventDefault();

    if (e.currentTarget.dataset.redirectUrl) {
      events.trigger('openConfirmDialog', e);
      return;
    }

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

  function handleSongStateChange(id, isLoading = false) {
    let $songItem = $songList.find('button[data-song-id='+ id +'].music-list__btn-play-pause');

    if (! $songItem.length) {
      console.log('musicList no match found for Product ID: ', id);
      return;
    }

    if (isLoading) {
      $songItem.removeClass(CLASS_BTN_PLAY_PAUSE_PLAYING)
        .addClass(CLASS_BTN_PLAY_PAUSE_LOADING)
        .find('span')
        .text('Loading');
    } else if ($songItem.hasClass(CLASS_BTN_PLAY_PAUSE_PLAYING)) {
      $songItem
        .removeClass(CLASS_BTN_PLAY_PAUSE_LOADING)
        .removeClass(CLASS_BTN_PLAY_PAUSE_PLAYING)
        .find('span')
        .text('Play');
    } else {
      $songItem
        .removeClass(CLASS_BTN_PLAY_PAUSE_LOADING)
        .addClass(CLASS_BTN_PLAY_PAUSE_PLAYING)
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
    utils.closeMagnificPopup();

    let $btnLicense = $songList.find('button[data-song-id='+ id +'].btn--license');

    if (! $btnLicense.length) {
      return;
    }

    $btnLicense.removeAttr('disabled');
  }

  return {
    init
  };

})();

export default musicList;
