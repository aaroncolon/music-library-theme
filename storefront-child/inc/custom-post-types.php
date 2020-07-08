<?php 
function ml_register_cpt() {
    $ml_projects_labels = array(
      'name'               => _x( 'Projects', 'post type general name', '_s-textdomain' ),
      'singular_name'      => _x( 'Project', 'post type singular name', '_s-textdomain' ),
      'menu_name'          => _x( 'Projects', 'admin menu', '_s-textdomain' ),
      'name_admin_bar'     => _x( 'Project', 'add new on admin bar', '_s-textdomain' ),
      'add_new'            => _x( 'Add New', 'Project', '_s-textdomain' ),
      'add_new_item'       => __( 'Add New Project', '_s-textdomain' ),
      'new_item'           => __( 'New Project', '_s-textdomain' ),
      'edit_item'          => __( 'Edit Project', '_s-textdomain' ),
      'view_item'          => __( 'View Project', '_s-textdomain' ),
      'all_items'          => __( 'All Projects', '_s-textdomain' ),
      'search_items'       => __( 'Search Projects', '_s-textdomain' ),
      'parent_item_colon'  => __( 'Parent Projects:', '_s-textdomain' ),
      'not_found'          => __( 'No Projects found.', '_s-textdomain' ),
      'not_found_in_trash' => __( 'No Projects found in Trash.', '_s-textdomain' )
    );

    register_post_type('ml_projects', array(
      'labels'              => $ml_projects_labels,
      'description'         => '',
      'has_archive'         => false,
      'exclude_from_search' => true,
      'publicly_queryable'  => false,
      'show_ui'             => true,
      'show_in_menu'        => true,
      'menu_position'       => 7,
      'capability_type'     => 'post',
      'map_meta_cap'        => true,
      'hierarchical'        => false,
      'rewrite'             => array('slug' => 'projects', 'with_front' => false),
      'query_var'           => true,
      'supports'            => array('title','editor','thumbnail')
    ));
}
add_action( 'init', 'ml_register_cpt' );
