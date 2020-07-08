<?php
/**
 * The template for displaying the Music Library.
 *
 * This page template will display any functions hooked into the `music-library` action.
 *
 * Template name: Music Library
 *
 * @package storefront
 */

get_header(); ?>

  <div id="primary" class="content-area">
    <main id="main" class="site-main" role="main">

      <?php
      /**
       * Functions hooked in to music_library action
       *
       * @hooked storefront_music_library_content - 10
       */
      do_action( 'music_library' );
      ?>

    </main><!-- #main -->
  </div><!-- #primary -->
<?php
get_footer();
