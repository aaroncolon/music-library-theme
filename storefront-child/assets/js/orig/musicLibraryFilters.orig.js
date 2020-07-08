"use strict";

(function() {

  const musicLibraryFilters = (function() {

    const FORM_FILTERS_ID         = 'music-library-filters';
    const MUSIC_LIBRARY_LIST_ID   = 'music-library-list';
    const MUSIC_LIBRARY_LIST_BODY = MUSIC_LIBRARY_LIST_ID + '__body';
    const MUSIC_LIBRARY_LIST_ROW  = MUSIC_LIBRARY_LIST_ID + '__row';
    const MUSIC_LIBRARY_LIST_CELL = MUSIC_LIBRARY_LIST_ID + '__cell';
    const MUSIC_LIBRARY_LIST_ROW_INNER  = MUSIC_LIBRARY_LIST_ID + '__row-inner';
    const MUSIC_LIBRARY_LIST_CELL_INNER = MUSIC_LIBRARY_LIST_ID + '__cell-inner';
    const MFP_POPUP_ID            = 'license-dialog'; // Magnific Popup
    const CLASS_PLAYING           = 'music-list__btn-play-pause--playing';
    const BTN_LOAD_MORE           = 'btn--load-more';
    const NONCE_GET_POSTS_ID      = 'nonce-get-posts';

    let $formFilters,       
        $musicLibraryList,  
        $musicLibraryTable, 
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
      getPosts(state.queryArgs);
    }

    function cacheDom() {
      $formFilters       = jQuery('#' + FORM_FILTERS_ID);
      $musicLibraryList  = jQuery('#' + MUSIC_LIBRARY_LIST_ID);
      $musicLibraryTable = $musicLibraryList.find('.' + MUSIC_LIBRARY_LIST_BODY);
      $btnLoadMore       = $musicLibraryList.find('.' + BTN_LOAD_MORE);
      $nonceGetPosts     = jQuery('#' + NONCE_GET_POSTS_ID);

      // js templates
      fnMusicListRow_ = wp.template('music-list-row');
      fnMusicListRowError_ = wp.template('music-list-row-error');
    }

    function bindEvents() {
      $formFilters.on('submit', handleSubmit);
      $btnLoadMore.on('click', handleLoadMore);
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
      getPosts(state.queryArgs);
    }

    function handleLoadMore() {
      getPosts(state.queryArgs, ++state.page, true);
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

    /**
     * Get Posts
     *
     * @param {array}   _args  Filter arguments
     * @param {number}  _page  The page to retrieve 
     * @param {boolean} append True to append data to list. False to empty list.
     */
    function getPosts(_args, _page, append) {
      let page = _page || 1;

      jQuery.ajax({
        // contentType: 'application/json',
        // processData: false,
        url      :   ml_js_data.ajax_url,
        method   : 'POST',
        dataType : 'json',
        data: {
          'action'  : 'ml_get_posts',
          'nonce'   : $nonceGetPosts.val(),
          'page'    : page,
          'filters' : JSON.stringify(_args)
        }
      })
      .done(function(data, textStatus, jqXHR) {
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

        renderTemplate(data.data.products, append);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        console.log('fail', errorThrown);
      });
    }

    function showLoadMore() {
      $btnLoadMore.css('display', 'inline-block');
    }

    function hideLoadMore() {
      $btnLoadMore.css('display', 'none');
    }

    function renderTemplate(data, append = false) {
      if (! append) {
        resetList();
      }

      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          // check if item is current_song_id and is playing
          data[i].isCurrentSongPlaying = (utils.isCurrentSong(data[i].id) && utils.isCurrentSongPlaying()) ? true : false;

          // check if item is in the user's favorites
          data[i].isFavorite = (favorites.isFavorite(data[i].id)) ? true : false;

          // check if user is logged in
          data[i].isUserLoggedIn = (utils.isUserLoggedIn()) ? true : false;

          // pass the data to the template function
          $musicLibraryTable.append( fnMusicListRow_(data[i]) );
        }
      } else {
        let data = {
          message: 'No Products Found'
        }
        $musicLibraryTable.append( fnMusicListRowError_(data) );
      }
    }

    function render(data, append = false) {
      if (! append) {
        resetList();
      }
      
      if (data.length) {
        for (let i = 0; i < data.length; i++) {
          // Row
          let row = document.createElement('div');
          row.className = MUSIC_LIBRARY_LIST_ROW;
          row.setAttribute('data-song-id', data[i].id);
          
          // Play Button / Image / Title / Artist
          let row1 = document.createElement('div');
          let cell1 = document.createElement('div');
          let cell1a = document.createElement('div'); // Image / Button container
          let cell1b = document.createElement('div'); // Title / Artist container
          let btn1  = document.createElement('button'); // Play / Pause
          let span1 = document.createElement('span'); // Screen Reader text
          let p1 = document.createElement('p'); // Title
          let a1 = document.createElement('a'); // Title Link
          let p2 = document.createElement('p'); // Artist

          // Set classes and data attributes
          cell1.className = MUSIC_LIBRARY_LIST_CELL;
          row1.className = MUSIC_LIBRARY_LIST_ROW_INNER;
          cell1a.className = MUSIC_LIBRARY_LIST_CELL_INNER;
          cell1b.className = MUSIC_LIBRARY_LIST_CELL_INNER;
          btn1.setAttribute('data-song-id', data[i].id);
          btn1.setAttribute('data-song-url', data[i].preview_song_url);
          btn1.setAttribute('data-song-title', data[i].title);
          btn1.setAttribute('data-song-artist', data[i].artist);
          btn1.setAttribute('data-song-image', data[i].song_image);
          btn1.className = 'btn music-list__btn-play-pause';
          // check if item is current_song_id and is playing
          if (utils.isCurrentSong(data[i].id) && utils.isCurrentSongPlaying()) {
            btn1.className += ' ' + CLASS_PLAYING;
          }
          span1.className = 'visuallyhidden';
          a1.href = '#';

          // Append child elements
          span1.appendChild(document.createTextNode('Play'));
          btn1.appendChild(span1);
          // Title
          a1.appendChild(document.createTextNode(data[i].title));
          p1.appendChild(a1);
          // Artist
          p2.appendChild(document.createTextNode(data[i].artist));

          cell1a.appendChild(btn1);
          cell1b.appendChild(p1);
          cell1b.appendChild(p2);
          row1.appendChild(cell1a);
          row1.appendChild(cell1b);
          cell1.appendChild(row1);

          // Artist
          // let cell2 = document.createElement('div');
          // cell2.className = MUSIC_LIBRARY_LIST_CELL;
          // let p2 = document.createElement('p');
          // p2.appendChild(document.createTextNode(data[i].artist));
          // cell2.appendChild(p2);

          // Length
          let cell3 = document.createElement('div');
          cell3.className = MUSIC_LIBRARY_LIST_CELL;
          let p3 = document.createElement('p');
          p3.appendChild(document.createTextNode(data[i].length));
          cell3.appendChild(p3);

          // Genre
          let cell4 = document.createElement('div');
          cell4.className = MUSIC_LIBRARY_LIST_CELL;
          let p4 = document.createElement('p');
          p4.appendChild(document.createTextNode(data[i].genre));
          cell4.appendChild(p4);

          // Mood
          let cell5 = document.createElement('div');
          cell5.className = MUSIC_LIBRARY_LIST_CELL;
          let p5 = document.createElement('p');
          p5.appendChild(document.createTextNode(data[i].mood));
          cell5.appendChild(p5);

          // Actions
          let cell6 = document.createElement('div');
          cell6.className = MUSIC_LIBRARY_LIST_CELL;

          let btn2 = document.createElement('button');
          let span2 = document.createElement('span');
          span2.className = 'visuallyhidden';
          span2.appendChild(document.createTextNode('Favorite'));
          btn2.appendChild(span2);
          btn2.type = 'button';
          btn2.className = 'btn btn--favorite';
          btn2.setAttribute('data-song-id', data[i].id);
          btn2.setAttribute('data-song-title', data[i].title);
          btn2.setAttribute('data-song-artist', data[i].artist);
          btn2.setAttribute('data-song-image', data[i].song_image);
          if (favorites.isFavorite(data[i].id)) {
            btn2.setAttribute('data-is-favorite', '1');
            btn2.className += ' btn--is-favorite';
          } else {
            btn2.setAttribute('data-is-favorite', '0');
          }
          if (! utils.isUserLoggedIn()) {
            btn2.setAttribute('disabled', '');
          }

          let btn3 = document.createElement('button');
          btn3.appendChild(document.createTextNode('License'));
          btn3.type = 'button';
          btn3.className = 'btn btn--license';
          btn3.setAttribute('data-song-id', data[i].id);
          btn3.setAttribute('data-song-title', data[i].title);
          btn3.setAttribute('data-song-artist', data[i].artist);
          btn3.setAttribute('data-song-url', data[i].preview_song_url);
          btn3.setAttribute('data-song-image', data[i].song_image);
          btn3.setAttribute('data-mfp-src', '#' + MFP_POPUP_ID);

          cell6.appendChild(btn2);
          cell6.appendChild(btn3);

          // Append to row
          let cells = [cell1, cell3, cell4, cell5, cell6];
          cells.forEach((el) => row.appendChild(el));
          $musicLibraryTable.get(0).appendChild(row);
        }
      } else {
        let row = document.createElement('div');
        row.className = MUSIC_LIBRARY_LIST_ROW;

        let cell = document.createElement('div');
        cell.className = MUSIC_LIBRARY_LIST_CELL;
        cell.appendChild(document.createTextNode('No Products Found'));

        row.appendChild(cell);

        $musicLibraryTable.get(0).appendChild(row);
      }
    }

    function resetList() {
      $musicLibraryTable.empty(); // removes elements and listeners
    }

    return {
      init: init
    }

  })();

  musicLibraryFilters.init();

})()
