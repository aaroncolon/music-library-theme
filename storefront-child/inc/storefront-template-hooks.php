<?php
/**
 * Storefront hooks
 *
 * @package storefront
 */

/**
 * Header
 *
 * @see  storefront_primary_navigation()
 */
add_action( 'storefront_header', 'storefront_primary_navigation', 30 );

// add_action( 'storefront_before_content', 'storefront_homepage_hero', 5 );

/**
 * Music Library
 *
 * @see  storefront_music_library_content()
 */
add_action( 'music_library', 'storefront_music_library_content', 10 );

/**
 * Music Library Page Template (default page content)
 *
 * @see  storefront_page_header()
 * @see  storefront_page_content()
 */
add_action( 'storefront_music_library', 'storefront_page_header', 10 );
add_action( 'storefront_music_library', 'storefront_page_content', 20 );

/**
 * Favorites
 *
 * @see  storefront_favorites_content()
 */
add_action( 'favorites', 'storefront_favorites_content', 10 );

/**
 * Favorites Page Template (default page content)
 *
 * @see  storefront_page_header()
 * @see  storefront_page_content()
 */
add_action( 'storefront_favorites', 'storefront_page_header', 10 );
add_action( 'storefront_favorites', 'storefront_page_content', 20 );

/**
 * Projects
 *
 * @see  storefront_projects_content()
 */
add_action( 'projects', 'storefront_projects_content', 10 );

/**
 * Projects Page Template (default page content)
 *
 * @see  storefront_page_header()
 * @see  storefront_page_content()
 */
add_action( 'storefront_projects', 'storefront_page_header', 10 );
add_action( 'storefront_projects', 'storefront_page_content', 20 );
