'use strict';

(function() {

  const player = (function() {

    const ID_PLAYER         = 'player';
    const CLASS_PLAY_PAUSE  = 'player__btn-play-pause';
    const CLASS_SONG_IMAGE  = 'player__song-image';
    const CLASS_SONG_TITLE  = 'player__song-title';
    const CLASS_SONG_ARTIST = 'player__song-artist';
    const CLASS_PLAYING     = 'player__btn-play-pause--playing';

    let $wavesurfer = null;
    let $player     = null;
    let $playPause  = null;
    let $songTitle  = null;
    let $songArtist = null;
    let $songImage  = null;

    let state = {
      isDefaultSong : false, // true when default song is initialized
      isPlaying     : false,
      currSongId    : null,
      prevSongId    : null,
      songTitle     : null,
      songArtist    : null,
      songImage     : null
    };

    function init() {
      cacheDom();
      bindEvents();
      initWaveSurfer();
      initDefaultSong();
    }

    function cacheDom() {
      $player     = jQuery('#' + ID_PLAYER);
      $playPause  = $player.find('.' + CLASS_PLAY_PAUSE);
      $songTitle  = $player.find('.' + CLASS_SONG_TITLE);
      $songArtist = $player.find('.' + CLASS_SONG_ARTIST);
      $songImage  = $player.find('.' + CLASS_SONG_IMAGE + ' img');
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
        container: '#player__waveform',
        barGap: 2,
        barWidth: 1,
        height: 80,
        responsive: 200,
        pixelRatio: 1,
        scrollParent: false
      });

      $wavesurfer.on('ready', handleWaveSurferReady);
      $wavesurfer.on('finish', handleWaveSurferFinish);
    }

    function handleWaveSurferReady() {
      if (state.isDefaultSong) {
        return;
      }

      playSong();
      updatePlayerDetails();
      updatePlayerButton();
      events.trigger('songStateChange', state.currSongId);
    }

    function handleWaveSurferFinish() {
      updatePlayerButton();
      // set global state here for other modules to re-render proper UI state (e.g. AJAX)
      utils.setCurrentSongPlayingState(false);
      utils.setState({
        'isPlaying': false
      }, state);
      events.trigger('songStateChange', state.currSongId);
    }

    function loadSong(url) {
      $wavesurfer.load(url);
    }

    function playSong() {
      $wavesurfer.play();
      utils.setState({
        'isPlaying': true
      }, state);
      utils.setCurrentSongId(state.currSongId);
      utils.setCurrentSongPlayingState(true);
    }

    function pauseSong() {
      $wavesurfer.pause();
      utils.setState({
        'isPlaying': false
      }, state);
      utils.setCurrentSongPlayingState(false);
    }

    function stopSong() {
      $wavesurfer.stop();
      utils.setState({
        'isPlaying': false
      }, state);
      utils.setCurrentSongPlayingState(false);
    }

    function updatePlayerButton() {
      if ($playPause.hasClass(CLASS_PLAYING)) {
        $playPause.removeClass(CLASS_PLAYING).find('span').text('Play');
      } else {
        $playPause.addClass(CLASS_PLAYING).find('span').text('Pause');
      }
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
      init: init
    }

  })();

  player.init();

})()
