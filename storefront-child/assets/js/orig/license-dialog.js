(function(){
  "use strict";

  var license = {
    
    budget       : null,
    campusSize   : null,
    customerType : null,
    distribution : null,
    filmType     : null,
    price        : null,
    song         : {
      artist : null,
      bg     : null,
      id     : null,
      img    : null,
      prog   : null,
      stitle : null,
      title  : null,
      src    : null
    },

    init: function() {
      this.cacheDom();
      this.bindEvents();
    },

    cacheDom: function() {
      this.$ajaxContent        = jQuery('#ajax-content'); // for .btn--show-license delegation
      
      // Notifications
      this.$msgCartAdd         = this.$ajaxContent.find('.cart_item_add_message');
      this.$msgCartRemove      = this.$ajaxContent.find('.cart_item_remove_message');

      // Mini Cart
      this.$accountIcons       = jQuery('.account-icons');
      this.$miniCartCount      = this.$accountIcons.find('.add-to-cart .count');
      this.$miniCartCount2     = this.$accountIcons.find('.cart-hover-box .count2');

      // Player
      // this.$player             = jQuery('#player_id');
      // this.$playerArtist       = this.$player.find('.the-artist');
      // this.$playerTitle        = this.$player.find('.the-name');
      // this.$playerBgImg        = this.$player.find('.scrub-bg-img');
      // this.$playerProgImg      = this.$player.find('.scrub-prog-img');
      // this.$playerThumb        = this.$player.find('.the-thumb');

      // License Dialog
      this.$licenseDialogWrap  = jQuery('#license-dialog-wrap');
      this.$licenseDialog      = this.$licenseDialogWrap.find('.license-dialog');
      this.$ld                 = this.$licenseDialog; // @ALIAS

      // Close Quote Button
      this.$btnCloseModal      = null;
      this.$btnCloseQuote      = this.$licenseDialogWrap.find('.modal-close--quote');

      // License Song
      this.$songWrap           = this.$ld.find('.license-song-wrap');
      this.$songLink           = this.$songWrap.find('.license-song-link');
      this.$songImage          = this.$songWrap.find('.license-song-image');
      this.$songTitle          = this.$songWrap.find('.title--license-song');

      // License Form
      this.$customerWrap       = this.$ld.find('.form-group--customer-type');
      this.$customerSelect     = this.$customerWrap.find('#customer-type');
      this.$filmWrap           = this.$ld.find('.form-group--film-type');
      this.$filmSelect         = this.$filmWrap.find('#film-type');
      this.$distributionWrap   = this.$ld.find('.form-group--distribution-type');
      this.$distributionSelect = this.$distributionWrap.find('#distribution-type');
      this.$budgetWrap         = this.$ld.find('.form-group--production-budget');
      this.$budgetSelect       = this.$budgetWrap.find('#production-budget');
      this.$campusWrap         = this.$ld.find('.form-group--campus-size');
      this.$campusSelect       = this.$campusWrap.find('#campus-size');
      this.$priceWrap          = this.$ld.find('.form-group--price');
      this.$price              = this.$priceWrap.find('.license-price');
      this.$btnCart            = this.$ld.find('#add-to-cart');
      this.$btnQuote           = this.$ld.find('#get-quote');
      this.$nonceGetPrice      = this.$ld.find('#nonce-get-price');
      this.$nonceAddToCart     = this.$ld.find('#nonce-add-to-cart');

      // Quote Form 
      this.$quoteWrap          = this.$licenseDialogWrap.find('.license-quote-wrap');
      // this.$quoteForm         = this.$quoteWrap.find('.license-quote-form-wrap form.wpcf7-form');
      this.$quoteHiddenFields  = this.$quoteWrap.find('input[id^="quote-"][type="hidden"]');
      this.$quoteSongId        = this.$quoteWrap.find('#quote-song-id');
      this.$quoteSongTitle     = this.$quoteWrap.find('#quote-song-title');
      this.$quoteCampus        = this.$quoteWrap.find('#quote-campus-size');
      this.$quoteCustomer      = this.$quoteWrap.find('#quote-customer-type');
      this.$quoteDistribution  = this.$quoteWrap.find('#quote-distribution');
      this.$quoteFilmType      = this.$quoteWrap.find('#quote-film-type');
      this.$quoteProductionBudget = this.$quoteWrap.find('#quote-production-budget');
    },

    bindEvents: function() {
      var _this = this;

      // Show License Button (delegated)
      // @NOTE @TODO may have to implement .not('.footer-button');
      this.$ajaxContent.on('click', '.btn--show-license', {_this: _this}, this.handleBtnShowLicense);

      this.$customerSelect.on('change', this.handleCustomerSelect.bind(this));
      this.$filmSelect.on('change', this.handleFilmSelect.bind(this));
      this.$distributionSelect.on('change', this.handleDistributionSelect.bind(this));
      this.$budgetSelect.on('change', this.handleBudgetSelect.bind(this));
      this.$campusSelect.on('change', this.handleCampusSelect.bind(this));

      this.$btnCart.on('click', this.handleBtnCart.bind(this));
      this.$btnQuote.on('click', this.handleBtnQuote.bind(this));

      this.$btnCloseQuote.on('click', this.handleBtnCloseQuote.bind(this));

      this.$songLink.on('click', null, {_this: _this}, this.handlePlayerLink.bind(this));
    },




    /**
     * Event Handlers
     */
    handleBtnShowLicense: function(e) {
      console.log('handleBtnShowLicense');
      e.stopImmediatePropagation();
      e.preventDefault();

      var $this = jQuery(this);

      /**
       * Original logic removes item from cart if already added
       * Replicating original logic here...
       */
      // if already added
      if ($this.hasClass('added')) {
        // remove item from cart
        e.data._this.itemRemoveFromCart($this);
      }
      // init license
      else {
        // set the song data for the license...
        e.data._this.setLicenseSong(this);
        e.data._this.renderLicenseSong();
        e.data._this.showLicenseModal(this);
      }
    },

    itemRemoveFromCart: function($item) {
      console.log('itemRemoveFromCart');

      jQuery.ajax({
        type     : 'POST',
        dataType : 'json',
        url      : MyAjax.ajaxurl,
        context  : this,
        data     : {
          action     : 'teo_removefromcart',
          product_id : $item.data('id')
        },
        success: function(res) {
          this._itemRemoveFromCartSuccess(res, $item);
        },
        error: this._itemRemoveFromCartError
      });
    },
    _itemRemoveFromCartSuccess: function(res, $item) {
      console.log('removeFromCart success', res);

      // show remove message
      this.showMsgCartItemRemove();

      // remove added classes
      $item.removeClass('added');
      $item.parents('tr').find('.music_catalog_block .add-to-cart-button').removeClass('added');

      // @GLOBAL update the mini cart
      this.updateMiniCartRemove(1, $item.data('id'));
    },
    _itemRemoveFromCartError: function() {
      console.log('removeFromCart error', arguments);
      // @TODO
    },
    updateMiniCartRemove: function(cartOrWish, id) {
      // @NOTE @GLOBAL
      removeHeaderIconsHover(cartOrWish, id);

      // update count
      var count = parseInt(this.$miniCartCount.text(), 10) - 1;
      this.$miniCartCount.text(count);
      this.$miniCartCount2.text(count);

      // @REFACTOR
      // update plurals...
      if (count === 1) {
        jQuery(".cart-hover-box .singular").removeClass("hidden");
        jQuery(".cart-hover-box .plural").addClass("hidden");
      }
      else if (count === 0) {
        jQuery(".cart-hover-box .singular").addClass("hidden");
        jQuery(".cart-hover-box .plural").removeClass("hidden");
      }

      var i = jQuery(".audio-player .add-to-cart-button");

      if (i.data("id") == id) {
        undoCartEffect(i);
      }
      
      jQuery(".play-song-individual[data-id=" + id + "]").data("cart_added", 0);  
    },
    updateMiniCartAdd: function(cartOrWish, id, priceCustom) {
      console.log('updateMiniCartAdd');

      // @NOTE @GLOBAL
      addHeaderIconsHover(cartOrWish, id, priceCustom);

      // update count
      var count = parseInt(this.$miniCartCount.text(), 10) + 1;
      this.$miniCartCount.text(count);
      this.$miniCartCount2.text(count);

      // @REFACTOR
      // update plurals...
      if (count === 1) {
        jQuery(".cart-hover-box .singular").removeClass("hidden");
        jQuery(".cart-hover-box .plural").addClass("hidden");
      }
      else if (count === 2) {
        jQuery(".cart-hover-box .singular").addClass("hidden");
        jQuery(".cart-hover-box .plural").removeClass("hidden");
      }

      var i = jQuery(".audio-player .add-to-cart-button");

      if (i.data("id") == id) {
        doCartEffect(i);
      }
      
      jQuery(".play-song-individual[data-id=" + id + "]").data("cart_added", 1);
    },

    showMsgCartItemRemove: function() {
      this.$msgCartAdd.hide();
      this.$msgCartRemove.show();
    },
    showMsgCartItemAdd: function() {
      this.$msgCartRemove.hide();
      this.$msgCartAdd.show();
    },


    handlePlayerLink: function(e) {
      console.log('handlePlayerLink', this);

      e.preventDefault();

      // if already playing
      if (e.data._this.$songLink.hasClass('playing')) {
        // pause
        e.data._this.playerPauseProxy();
        // remove class
        e.data._this.$songLink.removeClass('playing');
      }
      else {
        // proxy play
        e.data._this.playerPlayProxy();
        // add class
        e.data._this.$songLink.addClass('playing');
      }
    },

    handleCustomerSelect: function() {
      console.log('handleCustomerSelect');

      // Save customerType value
      this.customerType = this.$customerSelect.val();

      console.log('customerType', this.$customerSelect.val());

      // Reset Price
      this.resetPrice();

      // Film Producer / Filmmaker
      if (this.customerType === 'film-producer-filmmaker') {
        // Adds additional Film Type <select>
        this.renderFilmFields();
        
        // update distribution options happens in handleFilmSelect
      }
      else if (this.customerType === 'college-student-film-student') {
        // update distribution options
        this.setDistributionOpts();

        this.enableEl(this.$distributionSelect);

        this.renderStudentFields();
      }
      else if (this.customerType) {
        // load common set

        // update distribution options
        this.setDistributionOpts();

        this.enableEl(this.$distributionSelect);

        this.renderCommonFields();
      }
      else {
        // placeholder selected, load the default set
        this.renderDefaultFields();
      }
    },

    handleFilmSelect: function() {
      console.log('handleFilmSelect');

      // @NOTE $el already rendered server-side

      // save chosen film type
      this.filmType = this.$filmSelect.val();

      // Reset Price
      this.resetPrice();

      // hide quote button
      this.hideQuoteButton();

      // show cart button
      this.showCartButton();

      // Disable Buttons
      this.disableEl(this.$btnCart);
      this.disableEl(this.$btnQuote);

      if (this.filmType === '') {
        // reset distribution options
        this.resetSelect(this.$distributionSelect);

        // disable distribution select
        this.disableEl(this.$distributionSelect);

        this.resetSelect(this.$budgetSelect);
        this.disableEl(this.$budgetSelect);
      }
      else {
        // update distribution options
        this.setDistributionOpts();

        // enable distribution select
        this.enableEl(this.$distributionSelect);

        this.resetSelect(this.$budgetSelect);
        this.disableEl(this.$budgetSelect);
      }
    },

    handleDistributionSelect: function() {
      console.log('handleDistributionSelect');

      // save chosen distribution
      this.distribution = this.$distributionSelect.val();

      // Reset Price
      this.resetPrice();

      // Disable Buttons
      this.disableEl(this.$btnCart);
      this.disableEl(this.$btnQuote);

      if (this.distribution === 'video-on-demand') {
        // hide, disable, reset Budget <select>
        this.hideEl(this.$budgetWrap);

        // manually set quote
        this.setPrice('quote');

        // hide price
        this.hideEl(this.$priceWrap);

        // hide cart btn
        this.hideCartButton();

        // show quote btn
        this.showQuoteButton();

        // enable quote btn
        this.enableEl(this.$btnQuote);
      }
      else if (this.distribution === '') {
        // reset Budget <select>
        this.resetSelect(this.$budgetSelect);
        // disable Budget <select>
        this.disableEl(this.$budgetSelect);

        // reset Campus <select>
        this.resetSelect(this.$campusSelect);
        // disable Campus <select>
        this.disableEl(this.$campusSelect);

        // hide quote button
        this.hideQuoteButton();

        // show cart button
        this.showCartButton();
      }
      else {
        if (this.customerType === 'college-student-film-student') {
          // reset Campus <select>
          this.resetSelect(this.$campusSelect);
          
          // @NOTE $campusSize already rendered
          this.enableEl(this.$campusSelect);
        }
        else {
          // set budget options
          this.setBudgetOptions();

          // show budget select
          this.showEl(this.$budgetWrap);

          // Enable budget select
          this.enableEl(this.$budgetSelect);

          this.hideQuoteButton();

          this.showCartButton();
        }
      }
    },

    handleBudgetSelect: function() {
      console.log('handleBudgetSelect');

      // save selected budget
      this.budget = this.$budgetSelect.val();

      // reset price
      this.resetPrice();

      if (this.budget === '') {
        // hide price
        this.hideEl(this.$priceWrap);

        // hide / disable quote btn
        this.hideQuoteButton();

        // show cart btn
        this.showCartButton();

        // disable cart btn
        this.disableEl(this.$btnCart);
      }
      else {
        // disable cart / quote btn
        this.disableEl(this.$btnCart);
        this.disableEl(this.$btnQuote);

        // get the price from the server
        this.getPrice(this.budget);
      }
    },

    handleCampusSelect: function() {
      console.log('handleCampusSelect');

      // save selected campus size
      this.campusSize = this.$campusSelect.val();

      // reset price
      this.resetPrice();

      if (this.campusSize) {
        this.getPrice();
      }
      else {
        this.resetPrice();
      }
    },

    handleBtnCart: function(e) {
      e.preventDefault();

      this.itemAddToCart();      
    },

    itemAddToCart: function() {
      console.log('itemAddToCart', this);

      // AJAX
      jQuery.ajax({
        type:     'POST',
        dataType: 'json',
        url:      MyAjax.ajaxurl,
        context:  this,
        data:     { 
          'action'        : 'teo_addtocart',
          'nonce'         : this.$nonceAddToCart.val(),
          'product_id'    : this.song.id,
          'budget'        : this.budget,
          'campus_size'   : this.campusSize,
          'customer_type' : this.customerType,
          'distribution'  : this.distribution,
          'film_type'     : this.filmType
        },
        success : this._addToCartSuccess,
        error   : this._addToCartError
      });
    },
    _addToCartSuccess: function(res) {
      console.log('addToCart success', res);

      if (res.code === 200) {
        // find the cart icon / button in the song table and add the `added` class
        // @REFACTOR
        this.$ajaxContent.find('.btn--show-license[data-id="'+this.song.id+'"]').addClass('added');
        // @NOTE redundant?
        // this.$ajaxContent.find('.btn--show-license[data-id="'+this.song.id+'"]').parents('tr').find('.music_catalog_block .add-to-cart-button').addClass('added');

        this.updateMiniCartAdd(1, this.song.id, res.price_custom);

        // close license popup
        jQuery.magnificPopup.close();

        // show add to cart message
        this.showMsgCartItemAdd();
      }
      else {
        // @TODO handle error
      }
    },
    _addToCartError: function() {
      console.log('addToCart error', arguments);
    },

    

    handleBtnQuote: function(e) {
      e.preventDefault();

      // Hide license select
      this.$licenseDialog.css('display', 'none');

      // Show modal
      this.showQuoteModal();

      // Populate hidden fields of form with license and song data
      this.setQuoteHiddenFields();

      // Email sent after user clicks send email
    },

    // handleBtnCloseModal: function() {
    //   this.hideQuoteModal();
    //   this.resetLicenseSong();
    //   this.renderDefaultFields();
    // },

    handleBtnCloseQuote: function() {
      this.hideQuoteModal();
      this.showEl(this.$licenseDialog);
      this.showEl(this.$btnCloseModal);
    },
    // event handlers














    /**
     * License Song Methods
     */
    setLicenseSong: function(el) {
      console.log('setLicenseSong');
      
      var $el = jQuery(el);

      // Save the data
      this.song.artist = $el.data('artist');
      this.song.bg     = $el.data('bg');
      this.song.id     = $el.data('id');
      this.song.img    = $el.data('img');
      this.song.prog   = $el.data('prog');
      this.song.stitle = $el.data('stitle');
      this.song.title  = $el.data('stitle');
      this.song.src    = $el.data('src');
    },

    resetLicenseSong: function() {
      console.log('resetLicenseSong');

      for (var prop in this.song) {
        this.song[prop] = null;  
      }

      this.$songLink.removeClass('playing');
      this.$songTitle.text('');
      this.$songImage.attr('src', '');
      this.$songImage.attr('alt', '');
    },

    renderLicenseSong: function() {
      this.$songTitle.text(this.song.stitle);
      this.$songImage.attr('src', this.song.img);
      this.$songImage.attr('alt', this.song.stitle); 
    },
    // License Song Methods





    /**
     * Player
     */
    playerUpdate: function() {
      // @NOTE using this.playerPlayProxy()
      // this.$playerArtist.text(this.song.artist);
      // this.$playerTitle.text(this.song.stitle);
      // this.$playerBgImg.attr('src', this.song.bg);
      // this.$playerProgImg.attr('src', this.song.prog);
      // this.$playerThumb.css('background-image', 'url('+this.song.img+')');
    },
    playerPlay: function() {
      // this.$player[0].api_play();
    },
    playerPause: function() {
      // this.$player[0].api_pause_media();
    },
    playerPauseProxy: function() {
      // find table element by song ID and trigger `click` event
      this.$ajaxContent.find('.pause-song[data-id="'+this.song.id+'"]').trigger('click');
    },
    playerPlayProxy: function() {
      // find table element by song ID and trigger `click` event
      this.$ajaxContent.find('.sng_play[data-id="'+this.song.id+'"]').trigger('click');
    },
    // Player





    /**
     * Quote Methods
     */
    setQuoteHiddenFields: function() {
      console.log("setQuoteHiddenFields");

      // Song data
      this.$quoteSongId.val(this.song.id);
      this.$quoteSongTitle.val(this.song.stitle);

      // License data
      this.$quoteCampus.val(this.campusSize);
      this.$quoteCustomer.val(this.customerType);
      this.$quoteDistribution.val(this.distribution);
      this.$quoteFilmType.val(this.filmType);
      this.$quoteProductionBudget.val(this.budget);
    },

    resetQuoteHiddenFields: function() {
      console.log('resetQuoteFields');

      this.$quoteHiddenFields.each(function(i, el) {
        this.value = '';
      });
    },

    showQuoteModal: function() {
      this.$btnCloseModal.css('display', 'none');
      this.showEl(this.$quoteWrap);
      this.showEl(this.$btnCloseQuote);
    },

    hideQuoteModal: function() {
      this.$quoteWrap.css('display', 'none');
      this.$btnCloseQuote.css('display', 'none');
      this.resetQuoteHiddenFields();
    },

    showQuoteButton: function() {
      this.hideCartButton();
      this.showEl(this.$btnQuote);
    },

    hideQuoteButton: function() {
      this.$btnQuote.css('display', 'none');
      this.disableEl(this.$btnQuote);
    },
    // Quote Methods







    /**
     * License Song Methods
     */
    renderFilmFields: function() {
      console.log('renderFilmFields');

      this.showEl(this.$filmWrap);
      this.enableEl(this.$filmSelect);
      this.resetSelect(this.$filmSelect);

      this.showEl(this.$distributionWrap);
      this.disableEl(this.$distributionSelect);
      this.resetSelect(this.$distributionSelect);

      this.showEl(this.$budgetWrap);
      this.disableEl(this.$budgetSelect);
      this.resetSelect(this.$budgetSelect);

      this.hideEl(this.$campusWrap);

      this.hideQuoteButton();
      this.showCartButton();
      this.disableEl(this.$btnCart);
    },

    renderStudentFields: function() {
      console.log('renderStudentFields');

      this.showEl(this.$campusWrap);
      this.disableEl(this.$campusSelect);
      this.resetSelect(this.$campusSelect);

      this.hideEl(this.$filmWrap);

      this.hideEl(this.$budgetWrap);

      this.hideQuoteButton();
      this.showCartButton();
      this.disableEl(this.$btnCart);
    },

    renderCommonFields: function() {
      console.log('renderCommonFields');

      this.showEl(this.$budgetWrap);
      this.disableEl(this.$budgetSelect);
      this.resetSelect(this.$budgetSelect);

      this.hideEl(this.$filmWrap);

      this.hideEl(this.$campusWrap);

      this.hideQuoteButton();
      this.showCartButton();
      this.disableEl(this.$btnCart);
    },

    renderDefaultFields: function() {
      console.log('renderDefaultFields');

      this.showEl(this.$distributionWrap);
      this.disableEl(this.$distributionSelect);
      this.resetSelect(this.$distributionSelect);

      this.showEl(this.$budgetWrap);
      this.disableEl(this.$budgetSelect);
      this.resetSelect(this.$budgetSelect);

      this.hideEl(this.$filmWrap);
      this.resetSelect(this.$filmSelect);

      this.hideEl(this.$campusWrap);
      this.resetSelect(this.$campusSelect);

      this.resetPrice();

      this.hideQuoteButton();
      this.showCartButton();
      this.disableEl(this.$btnCart);
    },

    /**
     * Render <select> <options>
     * 
     * @param {$Object} $el         jquery object to append to
     * @param {Array}   options     the options data to render
     * @param {String}  placeholder the option placeholder text
     */
    renderOptions: function($el, options, placeholder) {
      console.log('renderOpts');

      // empty existing $select
      $el.empty();

      // create placeholder option
      var option   = document.createElement('option');
      option.value = '';
      option.text  = placeholder;
      $el.append(option);

      // create new options
      for (var i = 0; i < options.length; i++) {
        var option   = document.createElement('option');
        option.value = options[i].slug;
        option.text  = options[i].name;

        $el.append(option);
      }
    },

    setDistributionOpts: function() {
      console.log('setDistributionOpts');

      // Get the options
      var options = this.getDistributionOpts(this.customerType);

      // Render the options
      this.renderOptions(this.$distributionSelect, options, 'Distribution');
    },

    getDistributionOpts: function(customerType) {
      console.log('getDistributionOpts');
      var options = [];

      // get distro options from php-defined variable
      options = teoLicenseData['customerType'][this.customerType]['distribution'];

      return options;
    },

    setBudgetOptions: function() {
      // Get the options
      var options = this.getBudgetOptions(this.customerType);

      // Render the options
      this.renderOptions(this.$budgetSelect, options, 'Production Budget');
    },

    getBudgetOptions: function() {
      console.log('getBudgetOpts');

      var options = [];

      // maybe set budget_high data
      if (this.customerType === 'film-producer-filmmaker' && (this.filmType === 'feature-film' || this.filmType === 'trailer')) {
        options = teoLicenseData['budget']['high'];
      }
      else {
        options = teoLicenseData['budget']['low'];
      }

      return options;
    },

    /**
     * Retrieve license price based on selected options
     */
    getPrice: function() {
      console.log('getPrice');

      console.log(this.budget, this.campusSize, this.customerType, this.distribution, this.filmType);

      // AJAX
      jQuery.ajax({
        type:     'POST',
        dataType: 'json',
        url:      MyAjax.ajaxurl,
        context:  this,
        data:     { 
          'action'        : 'teo_get_license_price',
          'nonce'         : this.$nonceGetPrice.val(),
          'budget'        : this.budget,
          'campus_size'   : this.campusSize,
          'customer_type' : this.customerType,
          'distribution'  : this.distribution,
          'film_type'     : this.filmType
        },
        success: this._getPriceSuccess,
        error: this._getPriceError
      });
    },

    _getPriceSuccess: function(res) {
      console.log('getPrice success: ', res);

      if (res.code === 200 && res.license_price) {
        // save price value
        this.setPrice(res.license_price);

        if (res.license_price === 'quote') {
          // hide price
          this.hideEl(this.$priceWrap);

          // hide cart button
          this.hideCartButton();

          // show quote button
          this.showQuoteButton();

          // enable quote button
          this.enableEl(this.$btnQuote);
        }
        else {
          // set price
          this.renderPrice(res.currency, res.license_price);

          // hide quote button
          this.hideQuoteButton();

          // show cart button
          this.showCartButton();

          // enabled cart button
          this.enableEl(this.$btnCart);
        }
      }
      else {
        // @TODO handle errors
      }
    },

    _getPriceError: function() {
      console.log('getPrice error: ', arguments);
    },

    showLicenseModal: function(el) {
      console.log('showLicenseModal');
      var _this = this;
      
      // init magnificent popup
      jQuery(el).magnificPopup({
        type: 'inline',
        mainClass: 'license-popup mfp-fade',
        closeOnBgClick: true,
        removalDelay: 300,
        closeMarkup: '<button title="%title%" type="button" class="mfp-close">&times;</button>',
        callbacks: {
          open: function() {
            console.log('mfp-open callback');
            // cache close button
            _this.$btnCloseModal = this.currTemplate.closeBtn;
          },
          close: function() {
            console.log('mfp-close callback');
            _this.hideLicenseModal();
          }
        }
      }).magnificPopup('open');
    },

    hideLicenseModal: function() {
      // reset $btnCloseModal
      this.$btnCloseModal = null;

      // reset entire modal

      // hide quote modal and button
      this.hideQuoteModal();

      // reset license song data
      this.resetLicenseSong();

      // reset customer type select
      this.resetCustomerType();

      // render the default fields
      this.renderDefaultFields();

      // show the license dialog
      this.$licenseDialog.css('display', 'block');
    },

    resetCustomerType: function() {
      this.$customerSelect.val('');
    },

    showCartButton: function() {
      this.hideQuoteButton();
      this.showEl(this.$btnCart);
    },

    hideCartButton: function() {
      this.$btnCart.css('display', 'none');
      this.disableEl(this.$btnCart);
    },

    setPrice: function(price) {
      this.price = price;
    },

    renderPrice: function(currency, price) {
      this.$price.text('Total: ' + currency + price);
      this.showEl(this.$priceWrap);
    },

    resetPrice: function() {
      this.price = null;
      this.$price.text('');
      this.$priceWrap.css('display', 'none');
    },


    /**
     * Helpers
     */
    showEl: function($el) {
      $el.css('display', 'block');
    },

    /**
     * Hide, disable, reset $element
     */
    hideEl: function($el) {
      $el.css('display', 'none');
      $el.find('select').prop('disabled', true).val('');
    },

    enableEl: function($el) {
      $el.prop('disabled', false);

      // using psuedo elements on parent for custom select dropdowns
      $el.parent('.select-wrap').removeClass('disabled');
    },

    disableEl: function($el) {
      $el.prop('disabled', true);

      // using psuedo elements on parent for custom select dropdowns
      $el.parent('.select-wrap').addClass('disabled');
    },

    resetSelect: function($el) {
      $el.val('');
    }

  }; // license

  // initialize license
  license.init();

})();
