<?php
/**
 * Storefront WooCommerce hooks
 *
 * @package storefront
 */

/**
 * Header
 *
 * @see storefront_header_cart()
 * @see storfront_header_favorites()
 */
add_action( 'storefront_header', 'storefront_header_cart', 29 );
add_action( 'storefront_header', 'storefront_header_favorites', 29);

/**
 * Music Library
 *
 * @see  storefront_music_library_filters()
 * @see  storefront_music_library_list()
 */
add_action( 'music_library', 'storefront_music_library_filters', 20 );
add_action( 'music_library', 'storefront_music_library_list', 30 );

/**
 * Favorites
 *
 * @see  storefront_favorites_filters()
 * @see  storefront_favorites_list()
 */
add_action( 'favorites', 'storefront_favorites_filters', 20 );
add_action( 'favorites', 'storefront_favorites_list', 30 );

/**
 * Projects
 *
 * @see  storefront_projects()
 */
add_action( 'projects', 'storefront_projects', 20 );

/**
 * Footer
 *
 * @see ml_player()
 * @see storefront_confirm_dialog()
 */
add_action( 'storefront_before_footer', 'ml_player', 10 );
add_action( 'storefront_after_footer', 'storefront_confirm_dialog', 10);
