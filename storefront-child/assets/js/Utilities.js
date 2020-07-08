"use strict";

(function(exports) {

  const Utilities = function() {

    /**
     * Set a module's state
     *
     * @param {Object} obj the state object to set
     * @param {Object} state the local state object
     */
    this.setState = function(obj, state) {
      let updated = false;
      for (const prop in obj) {
        if (obj.hasOwnProperty(prop)) {
          state[prop] = obj[prop];
          updated = true;
        }
      }
      if (updated) {
        events.trigger('stateUpdate', state);
      }
    }

    /**
     * Get Posts
     *
     * @param {array}   _args  Filter arguments
     * @param {number}  _page  The page to retrieve 
     * @param {String}  nonce the nonce
     * @param {boolean} append True to append data to list. False to empty list.
     */
    this.getPosts = function(_args, _page, nonce, append) {
      let page = _page || 1;

      jQuery.ajax({
        // contentType: 'application/json',
        // processData: false,
        url      :  ml_js_data.ajax_url,
        method   : 'POST',
        dataType : 'json',
        data: {
          'action'       : 'ml_get_posts',
          'nonce'        : nonce,
          'page'         : page,
          'pageTemplate' : ml_js_data.page_template_slug,
          'filters'      : JSON.stringify(_args)
        }
      })
      .done(function(data, textStatus, jqXHR) {
        events.trigger('getPostsDone', data, _page, append);
      })
      .fail(function(jqXHR, textStatus, errorThrown) {
        events.trigger('getPostsFail', errorThrown, _args, _page, nonce, append);
      });
    }

    /**
     * Determines if user is logged in
     * 
     * @return {Boolean} true if user is logged in. false if user is logged out.
     */
    this.isUserLoggedIn = function() {
      return (ml_js_data.user_logged_in) ? true : false;
    }

    /**
     * Check if a Product is the currently loaded Product
     *
     * @param {Number} id the Product ID
     * @return {Boolean}
     */
    this.isCurrentSong = function(id) {
      return (id === this.getCurrentSongId()) ? true : false;
    }

    /**
     * Gets the current Product ID
     *
     * @return {Number} the current Product ID
     */
    this.getCurrentSongId = function() {
      return ml_js_data.current_song.id;
    }

    /**
     * Set the current Product ID
     *
     * @return {Number} the current Product ID
     */
    this.setCurrentSongId = function(id) {
      ml_js_data.current_song.id = Number(id);
      return (ml_js_data.current_song.id);
    }

    /**
     * Reset current Product ID
     */
    this.resetCurrentSongId = function() {
      ml_js_data.current_song.id = 0;
    }

    this.isCurrentSongPlaying = function() {
      return ml_js_data.current_song.isPlaying;
    }

    /**
     * Set the current Product playing state
     *
     * @param {Boolean} isPlaying true if the song is playing
     */
    this.setCurrentSongPlayingState = function(isPlaying) {
      ml_js_data.current_song.isPlaying = isPlaying;
    }

    this.resetCurrentSongPlayingState = function() {
      this.setCurrentSongPlayingState(false);
    }

    /**
     * Close Magnific Popup via API
     */
    this.closeMagnificPopup = function() {
      jQuery.magnificPopup.close();
    }

  };

  exports.Utilities = Utilities;

})(window)
