// Запуск видео
  $(document).on('click', '.js-product-video-play', function (event) {
    event.preventDefault()
    videoEl = document.getElementsByTagName('video')[0];
    if( $(this).parent().hasClass('active')) {
      videoEl.pause();
      $(this).parent().removeClass('active');
    }else{
      videoEl.play();
      $(this).parent().addClass('active');
    }
  });

/* Характеристики */
    $(".js-properties-block").each(function( index ) {
        if($(this).find('.properties-table').html() == ''){
            $(this).hide();
        }
    });

/* Табы */
    if($('[role="presentation"].active').find('[aria-controls]') == 'tab-reviews') {
      $('.js-tab-products').hide();
    }else{
      $('.js-tab-products').show();
    }
    $('[data-toggle="tab"]').on('click', function(){
      if($(this).attr('aria-controls') == 'tab-reviews') {
        $('.js-tab-products').hide();
      }else{
        $('.js-tab-products').show();
      }
    })

/* Цена доставки */
  function setDeliveryInfo(city, region){
    if($('.js-delivery-product').length){
        if(!city) {
          var city = 'Москва';
        }
        $('.js-delivery-product .delivery__title').find('.warning').hide();
        $('.js-delivery-product .info__delivery__item__warning').hide();
        if(city == 'Москва') {
          if($('.js-delivery-product').closest('[data-main-form]').find('.js-product-price').attr('data-price-summ')*1 < 5000){
            var courier_price = 'от 350 <i class="fa fa-rub priceCurrency"></i>';
            var pickup_price = 'от 250 <i class="fa fa-rub priceCurrency"></i>';
          }else{
            var courier_price = 'бесплатно';
            var pickup_price = 'бесплатно';
          }
        }else if(city == 'Санкт-Петербург'){
          if($('.js-delivery-product').closest('[data-main-form]').find('.js-product-price').attr('data-price-summ')*1 < 5000){
            var courier_price = 'от 500 <i class="fa fa-rub priceCurrency"></i>';
            var pickup_price = 'от 250 <i class="fa fa-rub priceCurrency"></i>';
          }else{
            var courier_price = 'бесплатно';
            var pickup_price = 'бесплатно';
          }
        }else{
          if($('.js-delivery-product').closest('[data-main-form]').find('.js-product-price').attr('data-price-summ')*1 < 5000){
            var courier_price = 'от 500 <i class="fa fa-rub priceCurrency"></i>';
            var pickup_price = 'от 250 <i class="fa fa-rub priceCurrency"></i>';
          }else{
            var courier_price = 'бесплатно';
            var pickup_price = 'бесплатно';
          }
          /*$('.js-delivery-product .delivery__title').find('.warning').show();
          $('.js-delivery-product .info__delivery__item__warning').show();*/
        }
        $('.js-delivery-product .info__delivery__item__courier').find('.delivery__price').html(courier_price)
        $('.js-delivery-product .info__delivery__item__pickup').find('.delivery__price').html(pickup_price)
      	$('.pickup_mapLink').html('<a href="#" class="pickup_mapLink_item_link button is-primary" onclick="boxberry.open(\'\', \'1$9e87972f2ec0897780e8b4ae28b047f9\', \'' + city + ', ' + region + '\');  return false;"><span class="icon"><img src="https://static-sl.insales.ru/files/1/7101/16997309/original/logo-boxberry.png" /></span><span class="title">Пункты выдачи boxberry</span></a>');
    }
  }

  // Пункты выдачи nivona
    var myMap;
    function init () {
          myMap = new ymaps.Map('map', {
              center: [55.8218067,37.595461,17],
              zoom: 15
          }, {
              searchControlProvider: 'yandex#search'
          });

          myMap.geoObjects
            .add(new ymaps.Placemark([55.649916,37.913882], {
                balloonContent: 'Московская обл. Люберцы, г. Томилино, рп, Птицефабрика мрк. литера №/Этаж 5Т,Т, Т2,Т3,Т4/2, помещение 4'
            }, {
                preset: 'islands#icon',
                iconColor: '#b00917'
            })).add(new ymaps.Placemark([55.649916,37.913882], {
                balloonContent: 'Московская обл. Люберцы, г. Томилино, рп, Птицефабрика мрк. литера №/Этаж 5Т,Т, Т2,Т3,Т4/2, помещение 4'
            }, {
                preset: 'islands#icon',
                iconColor: '#b00917'
            }));
    }

    function setCity(city) {
      if(city == 'Москва') {
        $('.js-productMap').show();
        myMap.panTo([55.649916,37.913882], {
            delay: 1500
        });
      }else if(city == 'Санкт-Петербург'){
        $('.js-productMap').show();
        myMap.panTo([59.865076,30.4241173], {
            delay: 1500
        });     
      }else{
        //$('.js-productMap').hide();
      }
    }

    $('.js-pickup_mapLink_nivona').on('click', function(e){
      e.preventDefault()
      var el = $('#pickup_mapLink_nivona');
      $.magnificPopup.open({
          items: {
              src: el
          },
          type: 'inline'
      });

      $('#map').html('');
      ymaps.ready(init);
      if($('#map').length){
        ymaps.ready(function(){
            setCity($.cookie('geoData').split('|')[1]);
        });
      }
    });


/* Галерея */
function product_gallery(){
  var $product = $('.js-product-wrapper');

  var $galleryThumbs = $('.js-gallery-thumbs');
  var $galleryMain = $('.js-product-gallery-main');
  var $galleryTriggers = $galleryThumbs.find('.js-gallery-trigger');

  if ($galleryThumbs.length) {
    var ThumbsSwiper = new Swiper($galleryThumbs, {
      slidesPerView: 5,
      breakpoints: {
        0:    { slidesPerView: 2},
        480:  { slidesPerView: 3},
        768:  { slidesPerView: 4},
        1980:  { slidesPerView: 5}
      },
      spaceBetween: 10,
      initialSlide: 0,
      centeredSlides: false,
      nextButton: '.js-gallery-thumbs-next',
      prevButton: '.js-gallery-thumbs-prev',

      touchRatio: 0.2,
      slideToClickedSlide: true,
      loop: false
    });

    var MainSwiper = new Swiper($galleryMain, {
      spaceBetween: 0,
      effect: 'slide',
      loop: false,
      centeredSlides: true,
      initialSlide: 0,
      touchRatio: 0.2,
      paginationClickable: false,
      nextButton: '.js-gallery-next',
      prevButton: '.js-gallery-prev',
      autoHeight: true,
      pagination: {
        el: '.swiper-pagination',
        dynamicBullets: true
      },
      breakpoints: {
        768: { paginationClickable: true},
      },
      onSlideChangeEnd: function (e) {
        $galleryTriggers.not(':eq(' + e.activeIndex + ')').removeClass('active');
        $galleryTriggers.eq(e.activeIndex).addClass('active');
        $galleryThumbs[0].swiper.slideTo(e.activeIndex);
      }
    });

    $galleryTriggers.on('click', function (e) {
      e.preventDefault();
      var index = $(this).index();
      if (!$(this).hasClass('active')) {
        $(this).addClass('active');
      }
      $(this).parent('.swiper-wrapper').find('.swiper-slide').not($(this)).removeClass('active');
      $galleryMain[0].swiper.slideTo(index);
    });
  }
}
product_gallery();


function copySrc (self) {
  var src = $(self).attr('data-image-large');
  var href = $(self).attr('href');
  var title = $(self).attr('title');
  var count = $(self).attr('data-gallery-count');

  $(self).parent()
    .siblings()
    .find('a')
    .removeClass('is-checked');
  $(self).addClass('is-checked');

  $('#gallery').attr({
    href: href,
    title: title,
    'data-gallery-count': count
  })
    .find('img')
    .attr({
      src: src,
      alt: title
    });
}

// Добавляет в сессию id товаров, в которые мы заходили
(function () {
  if (Site.template !== 'product') {
    return;
  }
  var find_it = true;
  var product_id = $('.product-control').attr('data-compare');

  localforage.getItem('view_array')
    .then(function (temp_view) {
      if (temp_view == null) {
        temp_view = [];

        temp_view.push(product_id);
        localforage.setItem('view_array', temp_view);
      }

      if (!_.includes(temp_view, product_id)) {
        temp_view.push(product_id);
        localforage.setItem('view_array', temp_view);
      }
    });
})();

(function () {
  if (Site.template !== 'product') {
    return;
  }

  var _galleryThumbs = {
    slidesPerView: 3,
    spaceBetween: 16,
    autoHeight: true,
    breakpoints: {
      768: { slidesPerView: 1 },
      1024: { slidesPerView: 3 }
    }
  };

  var _productSliderOptions = {
    slidesPerView: 3,
    spaceBetween: 0,
    nextButton: '[data-slider-next]',
    prevButton: '[data-slider-prev]',
    breakpoints: {
      380: { slidesPerView: 2 },
      480: { slidesPerView: 2 },
      768: { slidesPerView: 2 },
      1100: { slidesPerView: 2 }
    },
    onSlideChangeEnd: function () {
      $('.product-slider img.lazy').each(function(index) {
        $(this).lazyload();
      });
    }
  };

  var SimillarSwiper = new Swiper('[data-slider="similar-products"]', _productSliderOptions);
  var RelatedSwiper = new Swiper('[data-slider="related-products"]', _productSliderOptions);
  var Related2Swiper = new Swiper('[data-slider="related-products-2"]', _productSliderOptions);
  var BundleSwiper = new Swiper('[data-slider="bundle-products"]', _productSliderOptions);

  if ($('[data-slider="gallery-thumbs"]').length) {
    var MainSwiper = new Swiper('[data-slider="gallery-thumbs"]', _galleryThumbs);
  }

  var MobileSwiper = new Swiper('[data-slider="gallery-thumbs-mobile"]', _galleryThumbs);

  EventBus.subscribe('update_variant:insales:product', function (variant) {
    $('.product-prices.on-page').show();

    if (!variant.first_image.from_variant) {
      return;
    }

    if (variant.action.quantityState.change) {
      return;
    }

    var currentSlideNumber = $('[data-slider="gallery-thumbs-mobile"]')
      .find('[href="' + variant.first_image.original_url + '"]')
      .attr('data-slide-number');

    var currentSlide = $('[data-slider="gallery-thumbs"]')
      .find('[href="' + variant.first_image.original_url + '"]');

    if (MainSwiper) {
      MainSwiper.slideTo(currentSlideNumber - 1);
      MobileSwiper.slideTo(currentSlideNumber - 1);
    }
    copySrc(currentSlide);
  });
})();

// Copy src select image in main-image
(function () {
  if (Site.template !== 'product') {
    return;
  }

  $(document).on('click', '.js-copy-src', function (event) {
    event.preventDefault();
    copySrc(this);
    var product_id = $('.product-control').attr('data-compare');
    var select_variant;
    var href = $(this).attr('href');

    Products.get(product_id)
      .done(function (product) {
        select_variant = _.find(product.variants, function (variant) {
          return (href == variant.first_image.original_url);
        });

        if (!select_variant) {
          return;
        }
        Products.getInstance($('.product-form'))
          .done(function (_product) {
            return _product.variants.setVariant(select_variant.id);
          });
      });
  });

  // Find main-image in fancybox gallery, and emulate click on fancybox
  $(document).on('click', '#gallery', function (event) {
    event.preventDefault();

    var count = $('#gallery').attr('data-gallery-count');

    $('.mobile-wrapper').find('[data-slide-number="' + count + '"]')
      .trigger('click');

    return false;
  });
})();

EventBus.subscribe('update_variant:insales:product', function (variant) {
  if (!variant.action.product.is('[data-main-form]')) {
    return;
  }

  var $product = variant.action.product;
  var $buttonBuy = $('.js-variant-shown');
  var $buttonHidden = $('.js-variant-hidden');
  var $quickCheckout = $product.find('[data-quick-checkout]');
  var $buyCredit = $product.find('[data-buy-credit]');
  var $buttonPreorder = $('.js-variant-preorder');
  var $priceCurrent = $product.find('.js-product-price');
  var $quantity = $product.find('[name="quantity"]');
  var $priceOld = $product.find('.js-product-old-price');
  var $skuWrapper = $product.find('.js-product-sku-wrapper');
  var $sku = $product.find('.js-product-sku');
  var $available = $product.find('.js-available');
  var $quantity = $product.find('.js-variant-counter');

  var notAvailable = InsalesThemeSettings.product_not_available;


  window.__savedVariant = variant;
  $buttonBuy.hide();
  $quantity.hide();
  $buttonHidden.hide();
  $buttonPreorder.hide();
  $quickCheckout
    .hide()
    .prop('disabled', true);
  $buyCredit
    .hide()
    .prop('disabled', true);

  $priceCurrent
    .html(Shop.money.format(variant.action.price));

  $priceCurrent.data('price-summ', $priceCurrent.data('price') * $quantity)

  $priceCurrent.data('price-summ', variant.action.price)

  if(_.toFinite(variant.old_price) > _.toFinite(variant.price)){
      $priceCurrent.addClass('is_discount')
  }else{
  	$priceCurrent.removeClass('is_discount')
  }
  $priceOld
    .html(Shop.money.format((_.toFinite(variant.old_price) > _.toFinite(variant.price)) ? variant.old_price : null));
  if (variant.sku) {
    $skuWrapper.show();
    $sku.text(variant.sku);
  }
  else {
    $skuWrapper.hide();
  }

  if (variant.available) {
    $buttonBuy.show();
    $quantity.show();
    $available.show();
    $quickCheckout
      .show()
      .prop('disabled', false);
    //маска
    $('#quick_checkout_form').find('#client_phone').inputmask('+7(999)999-99-99');
    $('#quick_checkout_form').find('#client_email').inputmask('email');
    $buyCredit
      .show()
      .prop('disabled', false);
  }
  else {
    switch (notAvailable) {
      case 'preorder':
        $buttonPreorder.show();
        $quickCheckout.hide();
        $buyCredit.hide();
        $available.hide();
        break;
      case 'hidden':
        $buttonHidden.show();
        $quickCheckout.hide();
        $buyCredit.hide();
        $quantity.hide();
        $available.hide();
        break;
      case 'shown':
        $buttonBuy.show();
        $quantity.show();
        $quickCheckout
          .show()
          .prop('disabled', false);
        $buyCredit
          .show()
          .prop('disabled', false);
        break;
    }
  }

  // Обновляем информацию о доставке
  	setDeliveryInfo($.cookie('geoRuCountry').split('|')[1], $.cookie('geoRuCountry').split('|')[0])
});

EventBus.subscribe('change_quantity:insales:product', function (variant) {
  if (!variant.action.product.is('[data-main-form]')) {
    return;
  }

  var $product = variant.action.product;
  var $priceCurrent = $product.find('.js-product-price');
  var $quantity = $product.find('[name="quantity"]');
  $priceCurrent.attr('data-price-summ', $priceCurrent.data('price') * $quantity.val())

  // Обновляем информацию о доставке
  	setDeliveryInfo($.cookie('geoRuCountry').split('|')[1], $.cookie('geoRuCountry').split('|')[0])
});

(function () {
  $(document).on('click', '.js-variant-preorder', function (event) {
    event.preventDefault();

    var _variant = window.__savedVariant;
    var preorderForm = {
      form: { classes: 'is-preorder' },
      fields: [
        {
          title: Site.messages.field_email,
          name: 'from',
          required: true,
        },
        {
          title: Site.messages.field_name,
          name: 'name',
          required: true,
        },
        {
          type: 'hidden',
          name: 'preorder_caption',
          value: Site.messages.preorder
        },
        {
          type: 'hidden',
          name: 'subject',
          value: Site.messages.preorder
        },
        {
          title: Site.messages.label_product,
          name: 'product',
          type: 'hidden',
          value: _variant.action.productJSON.title,
        },
        {
          title: 'Вариант',
          name: 'variant',
          type: 'hidden',
          value: _variant.title,
        },
      ],
      combineOrder: { content: { fields: [ 'preorder_caption', 'product', 'variant' ] } }
    };

    alertify.modal({ formDefination: preorderForm }).set('title', Site.messages.preorder);
  });
})();

EventBus.subscribe('update_variant:insales:product', function (data) {
  var _discountElement = $('[data-labels-id="' + data.action.productJSON.id + '"]').find('.js-label-discount');
  var _discount = null;

  if (!data.action.product.is('[data-main-form]')) {
    return;
  }

  if (data.old_price && _.toFinite(data.old_price) > _.toFinite(data.price)) {
    _discount = (data.price * -100) / data.old_price + 100;
    _discountElement
      .text(_.round(_discount, 0) + '%')
      .removeClass('hidden');
  }
  else {
    _discountElement.addClass('hidden');
  }
});

(function () {
  if (Site.template !== 'product') { return; }

  $('.js-go_to').on('click', function () {
    $('.tabs__nav > li.active').removeClass('active');
    $('.tab-pane.active').removeClass('active');
    $('#tab_reviews').addClass('active');
    $('#tab-reviews').addClass('active');
    $('html,body').animate({ scrollTop: $(`.tabs__header`).offset().top }, 500);
  });
})();