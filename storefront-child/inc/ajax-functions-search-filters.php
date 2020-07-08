<?php

function ml_get_posts_handler() {
  // contentType application/json can only be read from php://input

  // Verify nonce
  check_ajax_referer('ml_nonce_get_posts', 'nonce');

  $result             = array();
  $result['products'] = array();
  $page               = (! empty($_POST['page'])) ? intval(sanitize_text_field($_POST['page'])) : 1;
  $page_template       = sanitize_text_field($_POST['pageTemplate']);
  $filters            = json_decode(stripslashes($_POST['filters']), true); // quotes are escaped during POST
  $filter_args        = array();
  $tax_query          = array();
  $tax_query_merged   = array();

  $tax_query = array( 
    'relation' => 'AND',
    array(
      'field'    => 'name',
      'operator' => 'NOT IN',
      'taxonomy' => 'product_visibility',
      'terms'    => array( 'exclude-from-catalog' ),
    )
  );

  if (!empty($filters)) :
    // Verify filters
    foreach ($filters as $v) :
      if (! isset($v['taxName']) || ! isset($v['termValue'])) {
        wp_send_json_error();
        break;
      }
      sanitize_text_field($v['taxName']);
      sanitize_text_field($v['termValue']);
    endforeach;

    // Build Taxonomy Query
    foreach ($filters as $v) :
      $filter_args[] = array(
        'taxonomy' => $v['taxName'],
        'terms'    => array( $v['termValue'] ),
        'field'    => 'slug',
        'operator' => 'IN',
      );
    endforeach;

    $tax_query_merged = array_merge($tax_query, $filter_args);
  endif;

  // Build Query
  $args = array(
    'paginate' => true,
    'posts_per_page' => 2,
    'page' => $page,
    'return' => 'ids',
    'tax_query' => $tax_query_merged,
  );

  // User's Favorites
  if ($page_template === 'template-favorites.php') {
    $user      = wp_get_current_user();
    $user_id   = $user->ID; 
    $favorites = get_user_meta($user_id, 'ml_favorites', true);
    $fav_ids   = array();
    if ( count($favorites) ) {
      foreach ($favorites as $k => $v) {
        $fav_ids[] = $k;
      }
    }
    $args['include'] = $fav_ids;
  }

  // Query
  $q = new WC_Product_Query($args);
  $q_res = $q->get_products();
  $products = $q_res->products;

  // Get Product Data
  if (count($products)) :
    foreach($products as $id) :
      $result['products'][] = array(
        'id'               => $id,
        'title'            => get_the_title($id),
        'song_image'       => wp_get_attachment_image_src(get_post_thumbnail_id($id), 'full')[0],
        'artist'           => wc_get_product_terms($id, 'pa_artist', array('fields' => 'names'))[0],
        'length'           => wc_get_product_terms($id, 'pa_duration', array('fields' => 'names'))[0],
        'genre'            => wc_get_product_terms($id, 'pa_genre', array('fields' => 'names'))[0],
        'inst'             => wc_get_product_terms($id, 'pa_instrument', array('fields' => 'names'))[0],
        'mood'             => wc_get_product_terms($id, 'pa_mood', array('fields' => 'names'))[0],
        'tempo'            => wc_get_product_terms($id, 'pa_tempo', array('fields' => 'names'))[0],
        'preview_song_url' => get_field('preview_song_file', $id),
      );
    endforeach;

    $result['total']         = $q_res->total;
    $result['max_num_pages'] = $q_res->max_num_pages;
    $result['page']          = $page;

    // $result['filters_raw'] = $_POST['filters'];
    // $result['filters'] = $filters;
    // $result['filter_args'] = $filter_args;
    // $result['tax_query'] = $tax_query;
    // $result['tax_query_merged'] = $tax_query_merged;
  endif;

  // $result['page']        = $page;
  // $result['filters_raw'] = $_POST['filters'];
  // $result['filters']     = $filters;

  wp_send_json_success($result);
}
add_action('wp_ajax_ml_get_posts', 'ml_get_posts_handler');
add_action('wp_ajax_nopriv_ml_get_posts', 'ml_get_posts_handler');
