"use strict";

(function() {

  const musicListFilters = (function() {

    const FORM_FILTERS_ID    = 'music-list-filters';
    const MUSIC_LIST_ID      = 'music-list';
    const MUSIC_LIST_BODY    = MUSIC_LIST_ID + '__body';
    const MFP_POPUP_ID       = 'license-dialog'; // Magnific Popup
    const CLASS_PLAYING      = 'music-list__btn-play-pause--playing';
    const BTN_LOAD_MORE      = 'btn--load-more';
    const NONCE_GET_POSTS_ID = 'nonce-get-posts';

    let $formFilters,       
        $musicList,  
        $musicListTable, 
        $btnLoadMore,       
        $nonceGetPosts,     
        fnMusicListRow_,
        fnMusicListRowError_;

    let state = {
      btnLoadMore : false,
      maxNumPages : 1,
      page        : 1,
      queryArgs   : []
    };

    function init() {
      cacheDom();
      bindEvents();
    }

    function cacheDom() {
      $formFilters    = jQuery('#' + FORM_FILTERS_ID);
      $musicList      = jQuery('#' + MUSIC_LIST_ID);
      $musicListTable = $musicList.find('.' + MUSIC_LIST_BODY);
      $btnLoadMore    = $musicList.find('.' + BTN_LOAD_MORE);
      $nonceGetPosts  = jQuery('#' + NONCE_GET_POSTS_ID);

      // js templates
      fnMusicListRow_ = wp.template('music-list-row');
      fnMusicListRowError_ = wp.template('music-list-row-error');
    }

    function bindEvents() {
      $formFilters.on('submit', handleSubmit);
      $btnLoadMore.on('click', handleLoadMore);

      events.on('getFavoritesDone', handleGetFavorites, this);
      events.on('getFavoritesFail', handleGetFavorites, this);
      events.on('getPostsDone', handleGetPostsDone, this);
      events.on('getPostsFail', handleGetPostsFail, this);
    }

    function handleGetFavorites() {
      utils.getPosts(state.queryArgs, 1, $nonceGetPosts.val());
    }

    function handleGetPostsDone(data, page, append) {
      // set Pagination data
      utils.setState({
        'maxNumPages': data.data.max_num_pages,
        'page': data.data.page
      }, state);

      if (page < data.data.max_num_pages) {
        utils.setState({ 
          'btnLoadMore': true 
        }, state);
        showLoadMore();
      } else {
        utils.setState({ 
          'btnLoadMore': false 
        }, state);
        hideLoadMore();
      }

      render(data.data.products, append);
    }

    function handleGetPostsFail(errorThrown) {
      console.log('getPostsFail: ', errorThrown);
    }

    function handleSubmit(e) {
      e.preventDefault();
      // reset state pagination data
      resetPaginationState();
      // process form data
      let formData = processFormData(e);
      // set form data for "load more" requests
      saveQueryArgs(formData);
      // get the posts
      utils.getPosts(state.queryArgs, 1, $nonceGetPosts.val());
    }

    function handleLoadMore() {
      utils.getPosts(state.queryArgs, ++state.page, $nonceGetPosts.val(), true);
    }

    function processFormData(e) {
      let data = [];
      for (let i = 0; i < e.target.elements.length; i++) {
        if (e.target.elements[i].tagName === 'SELECT' && e.target.elements[i].value !== '') {
          data.push(
            {
              taxName   : e.target.elements[i].dataset.taxonomyName,
              termValue : e.target.elements[i].value
            }
          );
        }
      }
      return data;
    }

    function saveQueryArgs(data) {
      utils.setState({
        'queryArgs': data
      }, state);
    }

    function resetPaginationState() {
      utils.setState({
        'maxNumPages': 1,
        'page': 1 
      }, state);
    }

    function showLoadMore() {
      $btnLoadMore.css('display', 'inline-block');
    }

    function hideLoadMore() {
      $btnLoadMore.css('display', 'none');
    }

    function render(data, append = false) {
      if (! append) {
        resetList();
      }

      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          // check if item is current_song_id and is playing
          data[i].isCurrentSongPlaying = (utils.isCurrentSong(data[i].id) && utils.isCurrentSongPlaying()) ? true : false;

          // check if item is in the user's favorites
          data[i].isFavorite = favorites.isFavorite(data[i].id);

          // check if user is logged in
          data[i].isUserLoggedIn = utils.isUserLoggedIn();

          // pass the data to the template function
          $musicListTable.append( fnMusicListRow_(data[i]) );
        }
      } else {
        let data = {
          message: 'No Products Found'
        }
        $musicListTable.append( fnMusicListRowError_(data) );
      }
    }

    function resetList() {
      $musicListTable.empty(); // removes elements and listeners
    }

    return {
      init: init
    }

  })();

  musicListFilters.init();

})()
