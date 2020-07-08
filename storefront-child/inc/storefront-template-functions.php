<?php

/**
 * Display Music Library content
 * Hooked into the `music_library` action in the Music Library template
 *
 * @since  1.0.0
 * @return  void
 */
function storefront_music_library_content() {
  while ( have_posts() ) {
    the_post();

    get_template_part( 'content', 'music-library' );

  } // end of the loop.
}

/**
 * Display Favorites content
 * Hooked into the `favorites` action in the Favorites template
 *
 * @since  1.0.0
 * @return  void
 */
function storefront_favorites_content() {
  while ( have_posts() ) {
    the_post();

    get_template_part( 'content', 'favorites' );

  } // end of the loop.
}

/**
 * Display Projects content
 * Hooked into the `projects` action in the Projects template
 *
 * @since  1.0.0
 * @return  void
 */
function storefront_projects_content() {
  while ( have_posts() ) {
    the_post();

    get_template_part( 'content', 'projects' );

  } // end of the loop.
}
