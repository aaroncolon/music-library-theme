<script type="text/template" id="tmpl-music-list-row">
  <div class="music-list__row" data-song-id="{{ data.id }}">
    <div class="music-list__cell">
      <div class="music-list__row-inner">
        <div class="music-list__cell-inner">
          <button 
            <# if ( data.isCurrentSongPlaying ) { #>
              class="btn music-list__btn-play-pause music-list__btn-play-pause--playing"
            <# } else { #>
              class="btn music-list__btn-play-pause"
            <# } #>
            data-song-id="{{ data.id }}" 
            data-song-url="{{{ data.preview_song_url }}}" 
            data-song-title="{{ data.title }}" 
            data-song-artist="{{ data.artist }}" 
            data-song-image="{{{ data.song_image }}}" 
          >
              <span class="visuallyhidden">Play</span>
          </button>
        </div>
        <div class="music-list__cell-inner">
          <div class="music-list__title">
            <a href="#">{{ data.title }}</a>
          </div>
          <div class="music-list__artist">
            {{ data.artist }}
          </div>
        </div>
      </div>
    </div>
    <div class="music-list__cell">
      <p>{{ data.length }}</p>
    </div>
    <div class="music-list__cell">
      <p>{{ data.genre }}</p>
    </div>
    <div class="music-list__cell">
      <p>{{ data.mood }}</p>
    </div>
    <div class="music-list__cell">
      <button 
        type="button" 
        <# if ( data.isFavorite ) { #>
          data-is-favorite="1"
          class="btn btn--favorite btn--is-favorite" 
        <# } else { #>
          data-is-favorite="0" 
          class="btn btn--favorite" 
        <# } #>
        data-song-id="{{ data.id }}" 
        data-song-title="{{ data.title }}" 
        data-song-artist="{{ data.artist }}" 
        data-song-image="{{{ data.song_image }}}" 
        <# if ( ! data.isUserLoggedIn ) { #>
          data-redirect-url="<?php esc_attr_e( add_query_arg('redirect', rawurlencode(get_the_permalink()), wc_get_page_permalink('myaccount')) ) ?>" 
        <# } #>
      >
        <span class="visuallyhidden">Favorite</span>
      </button>
      <button 
        type="button" 
        class="btn btn--license" 
        data-song-id="{{ data.id }}" 
        data-song-title="{{ data.title }}" 
        data-song-artist="{{ data.artist }}" 
        data-song-image="{{{ data.song_image }}}" 
        data-song-url="{{{ data.preview_song_url }}}" 
        data-mfp-src="#license-dialog" 
        <# if ( ! data.isUserLoggedIn ) { #>
          data-redirect-url="<?php esc_attr_e( add_query_arg('redirect', rawurlencode(get_the_permalink()), wc_get_page_permalink('myaccount')) ) ?>" 
        <# } #>
      >
        License
      </button>
    </div>
  </div>
</script>

<script type="text/template" id="tmpl-music-list-row-error">
  <div class="music-list__error">
    {{ data.message }}
  </div>
</script>
