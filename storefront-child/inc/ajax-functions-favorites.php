<?php

function ml_get_favorites_handler() {
  check_ajax_referer('ml_get_favorites_nonce', 'nonce');

  $result = array();

  $user      = wp_get_current_user();
  $user_id   = $user->ID; 
  $favorites = get_user_meta($user_id, 'ml_favorites', true);

  if (! empty($favorites)) {
    $result = $favorites;
  }

  wp_send_json_success($result);
}
add_action('wp_ajax_ml_get_favorites', 'ml_get_favorites_handler');
add_action('wp_ajax_nopriv_ml_get_favorites', 'ml_get_favorites_handler');

function ml_create_favorite_handler() {
  check_ajax_referer('ml_create_favorite_nonce', 'nonce');

  $result = array();

  $user      = wp_get_current_user();
  $user_id   = $user->ID;
  $favorites = get_user_meta($user_id, 'ml_favorites', true); // @return empty string if doesn't exist
  $song_id   = sanitize_text_field($_POST['songId']);

  // initialize $favorites as array
  if (empty($favorites)) { 
    $favorites = array();
  }

  // add new favorite to $favorites array
  if (! isset($favorites[$song_id])) {
    $favorites[$song_id] = $song_id;
  }

  $meta_res = update_user_meta($user_id, 'ml_favorites', $favorites);

  $result['meta_res'] = $meta_res;
  wp_send_json_success($result);
}
add_action('wp_ajax_ml_create_favorite', 'ml_create_favorite_handler');
add_action('wp_ajax_nopriv_ml_create_favorite', 'ml_create_favorite_handler');

function ml_delete_favorite_handler() {
  check_ajax_referer('ml_delete_favorite_nonce', 'nonce');

  $result = array();

  $user      = wp_get_current_user();
  $user_id   = $user->ID;
  $favorites = get_user_meta($user_id, 'ml_favorites', true); // @return empty string if doesn't exist
  $song_id   = sanitize_text_field($_POST['songId']);

  if (! empty($favorites) && isset($favorites[$song_id])) {
    unset($favorites[$song_id]);
  }

  $meta_res = update_user_meta($user_id, 'ml_favorites', $favorites);

  $result['meta_res']  = $meta_res; // @return true|int / false
  $result['favorites'] = $favorites;

  wp_send_json_success($result);
}
add_action('wp_ajax_ml_delete_favorite', 'ml_delete_favorite_handler');
add_action('wp_ajax_nopriv_ml_delete_favorite', 'ml_delete_favorite_handler');
