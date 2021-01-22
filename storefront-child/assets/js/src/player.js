import events from './Events.js';
import utils from './Utilities.js';

const player = (function() {

  const ID_PLAYER         = 'player',
        ID_WAVEFORM       = 'player__waveform',
        CLASS_PLAY_PAUSE  = 'player__btn-play-pause',
        CLASS_SONG_IMAGE  = 'player__song-image',
        CLASS_SONG_TITLE  = 'player__song-title',
        CLASS_SONG_ARTIST = 'player__song-artist',
        CLASS_LOADING     = 'player__btn-play-pause--loading',
        CLASS_PLAYING     = 'player__btn-play-pause--playing';

  let $player,
      $wavesurfer,
      $waveform,
      $playPause,
      $songTitle,
      $songArtist,
      $songImage;

  let state = {
    isDefaultSong : false, // true when default song is initialized
    isLoading     : false,
    isPlaying     : false,
    currSongId    : null,
    prevSongId    : null,
    songTitle     : null,
    songArtist    : null,
    songImage     : null
  };

  function init() {
    if (cacheDom()) {
      bindEvents();
      initWaveSurfer();
      initDefaultSong();
    }
  }

  function cacheDom() {
    $player     = jQuery('#' + ID_PLAYER);
    $waveform   = $player.find('#' + ID_WAVEFORM);
    $playPause  = $player.find('.' + CLASS_PLAY_PAUSE);
    $songTitle  = $player.find('.' + CLASS_SONG_TITLE);
    $songArtist = $player.find('.' + CLASS_SONG_ARTIST);
    $songImage  = $player.find('.' + CLASS_SONG_IMAGE + ' img');

    return ($player.length) ? true : false;
  }

  function bindEvents() {
    $playPause.on('click', handleClickPlayerPlayPause);

    events.on('clickPlayPauseList', handleClickPlayPauseList, this);
  }

  function handleClickPlayerPlayPause() {
    if (isPlaying()) {
      pauseSong();
    } else {
      playSong();
    }
    updatePlayerButton();
    events.trigger('songStateChange', state.currSongId);
  }

  function handleClickPlayPauseList(e) {
    const id         = e.currentTarget.dataset.songId;
    const url        = e.currentTarget.dataset.songUrl;
    const songTitle  = e.currentTarget.dataset.songTitle;
    const songArtist = e.currentTarget.dataset.songArtist;
    const songImage  = e.currentTarget.dataset.songImage;

    // Load song if different than current
    if (id !== state.currSongId) {
      // set the prevSongId locally
      utils.setState({
        'prevSongId' : state.currSongId
      }, state);

      // set the currSongId locally
      utils.setState({
        'isDefaultSong' : false,
        'currSongId'    : id,
        'songArtist'    : songArtist,
        'songImage'     : songImage,
        'songTitle'     : songTitle
      }, state);

      // set the currSongId globally (in play())
      // utils.setCurrentSongId(id);

      // pause prev song
      if (isPlaying()) {
        pauseSong();
        updatePlayerButton();
        utils.setCurrentSongPlayingState(false);
        // trigger songStateChange for subscribed modules (UI updates, etc)
        events.trigger('songStateChange', state.prevSongId);
      }

      // load the new song
      loadSong(url); // @NOTE async
    } else {
      if (isPlaying()) {
        pauseSong();
      } else {
        playSong();
      }
      updatePlayerButton();
      events.trigger('songStateChange', state.currSongId);
    }
  }

  function isPlaying() {
    return state.isPlaying;
  }

  function initDefaultSong() {
    const songId     = ml_js_data.default_song.id;
    const songUrl    = ml_js_data.default_song.preview_song_url;
    const songTitle  = ml_js_data.default_song.title;
    const songArtist = ml_js_data.default_song.artist;
    const songImage  = ml_js_data.default_song.song_image;

    utils.setState({
      'isDefaultSong' : true,
      'currSongId'    : songId,
      'songArtist'    : songArtist,
      'songImage'     : songImage,
      'songTitle'     : songTitle
    }, state);

    updatePlayerDetails();
    loadSong(songUrl); // @async
  }

  function initWaveSurfer() {
    $wavesurfer = WaveSurfer.create({
      container: $waveform.get(0),
      barGap: 2,
      barWidth: 1,
      height: 70,
      responsive: 200,
      pixelRatio: 1,
      scrollParent: false
    });

    $wavesurfer.on('ready', handleWaveSurferReady);
    $wavesurfer.on('finish', handleWaveSurferFinish);
  }

  function handleWaveSurferReady() {
    if (state.isDefaultSong) {
      utils.setState({
        'isLoading': false,
        'isPlaying': false
      }, state);
      updatePlayerButtonDefault();
      return;
    }

    playSong();
    updatePlayerDetails();
    updatePlayerButton();
    events.trigger('songStateChange', state.currSongId, state.isLoading);
  }

  function handleWaveSurferFinish() {
    updatePlayerButton();
    // set global state here for other modules to re-render proper UI state (e.g. AJAX)
    utils.setCurrentSongPlayingState(false);
    utils.setState({
      'isLoading': false,
      'isPlaying': false
    }, state);
    events.trigger('songStateChange', state.currSongId);
  }

  function loadSong(url) {
    $wavesurfer.load(url);
    utils.setState({
      'isLoading': true
    }, state);
    updatePlayerButton();
    events.trigger('songStateChange', state.currSongId, state.isLoading);
  }

  function playSong() {
    $wavesurfer.play();
    utils.setState({
      'isLoading': false,
      'isPlaying': true
    }, state);
    utils.setCurrentSongId(state.currSongId, state.isLoading);
    utils.setCurrentSongPlayingState(true);
  }

  function pauseSong() {
    $wavesurfer.pause();
    utils.setState({
      'isLoading': false,
      'isPlaying': false
    }, state);
    utils.setCurrentSongPlayingState(false);
  }

  function stopSong() {
    $wavesurfer.stop();
    utils.setState({
      'isLoading': false,
      'isPlaying': false
    }, state);
    utils.setCurrentSongPlayingState(false);
  }

  function updatePlayerButton() {
    if (state.isLoading) {
      $playPause
        .removeClass(CLASS_PLAYING)
        .addClass(CLASS_LOADING)
        .find('span')
        .text('Loading');
    } else if ($playPause.hasClass(CLASS_PLAYING)) {
      $playPause
        .removeClass(CLASS_PLAYING)
        .removeClass(CLASS_LOADING)
        .find('span')
        .text('Play');
    } else {
      $playPause
        .removeClass(CLASS_LOADING)
        .addClass(CLASS_PLAYING)
        .find('span')
        .text('Pause');
    }
  }

  function updatePlayerButtonDefault() {
    $playPause.removeClass(CLASS_LOADING)
      .find('span')
      .text('Play');
  }

  /**
   * Update player with selected song data
   */
  function updatePlayerDetails() {
    $songImage.attr('src', state.songImage);
    $songImage.attr('alt', state.songTitle);
    $songTitle.text(state.songTitle);
    $songArtist.text(state.songArtist);
  }

  return {
    init
  };

})();

export default player;
