var InsalesThemeSettings = {
  color_background_primary: '#ffffff',
  color_text_primary: '#787878',
  color_link_primary: '#282828',
  color_link_primary_hover: '#9d4e83',
  color_border_primary: '#ebbac7',
  color_background_secondary: '#eb839f',
  color_text_secondary: '#ffffff',
  color_link_secondary: '#ffffff',
  color_link_secondary_hover: '#ffffff',
  color_border_secondary: '#ebbac7',
  body_background_color: '#f5f5f5',
  body_background_type: 'stretch',
  font_family_primary: 'google:Istok+Web',
  font_size_primary: '16px',
  logotype_type: 'image',
  logotype_font_family: 'google:Ubuntu',
  logotype_font_size: '40px',
  phone: 'from_settings',
  email: 'from_settings',
  promo_slider_auto_time: '',
  category_description_position: 'before_products',
  product_not_available: 'shown',
  product_order_text: 'Узнать о поступлении',
  product_order_type: 'visible_price',
  product_order_target: 'mail',
  product_main_params: 'tip||moschnost-vt||davlenie-pompy-bar||moschnost-vt',
  actions_bundle_change_position_enable: '1',
  actions_bundle_change_position_field_handle: 'id-product-gift',
  cart_enable_gift: '1',
  cart_is_gift_handle: 'PROPERTY_IS_GIFT',
  cart_gift_handle: 'PROPERTY_GIFT',
  cart_move_gift_down: '1',
  cart_gift_lock_change: '1',
  cart_gift_lock_delete: '1',
  tinkov_pay: 'Купить в кредит',
  tinkov_url: 'https://forma.tinkoff.ru/static/onlineScript.js',
  tinkov_identifikator: '2676e1f7-73e1-4c21-b9ff-8f1e054c14a4',
  tinkov_showcaseid: 'e5f97ef0-b61b-49f7-b38b-b4ad859ebc9d',
  tinkov_promocode: 'installment_0_0_6_7',
  co_enable_hidding_pickup_private_person: '1',
  co_enable_hidding_pickup_private_person_ids: '2144703||2357434',
  co_enable_hidding_yd_legal_entities: '1',
  co_enable_hidding_yd_legal_entities_ids: '2694008||2694015||2087692||2087693||2065362||2065363',
  co_sku_mark_for_markdown: '',
  co_sku_mark_for_defective: '',
  co_hidding_payments_for_markdown: '',
  co_availableDelivery_idsGroups_1: '',
  co_availableDelivery_hideAnotherIdsDelivery_1: '',
  co_availableDelivery_hideIdsDelivery_1: '',
  co_usluga_etaj_enable: '1',
  co_usluga_etaj_delivery_ids: '2043474||2043475||2043476||2043477||2043482||',
  co_usluga_etaj_field_id: '13095506',
  co_usluga_etaj_id_price: '13626440',
  co_usluga_etaj_id_type: '13620170',
  co_usluga_etaj_id_floor_num: '13619808',
  co_usluga_etaj_price_weight_elevator: '130=0||80=0||50=0||30=0||15=0',
  co_usluga_etaj_price_weight_stairs: '530=1280||480=1160||430=1040||380=920||330=800||280=680||230=540||180=420||130=300||80=180||50=120||30=60||15=0',
  co_usluga_etaj_items_weight: '15',
  co_usluga_etaj_items_max_weight: '530',
  co_recipient_enable: '1',
  co_field_recipient_checkbox_id: '12207266',
  co_field_recipient_name_id: '12207267',
  co_field_recipient_phone_id: '12207268',
  co_hide_delivery_cost_ids: '',
  co_important_products_ids: '',
  co_id_payment_credit: '1056777',
  co_enable_omni_dates: '1',
  privacy_active: '1',
  privacy_checkbox_checked: '1',
  privacy_forms: '1',
  privacy_popup: '1',
  privacy_popup_delay: '5',
  feedback_captcha_enabled: '0',
  geo_active: '1',
  header_geo: '1',
  header_geo_popup: '1',
  geo_url: '/page/delivery',
  _settings_version: 1671018858.1090012,
};

if ($.cookie('developing') == 'true') {
  $('.developing').hide();
}
$(document).on('click', '.js-close-coockie', function () {
  $('.coockie-panel').hide();
  $.cookie('coockie', 'true', {
    path: '/',
  });
});
if ($.cookie('coockie') != 'true') {
  $('.coockie-panel').show();
}

// Функция для разворачивания параметров товара
function setParam(obj, name, value) {
  obj[name] || (obj[name] = value);
}
function productParameters(_product) {
  _product.parameters = {};
  _product.sale = null;

  // Пермалинк параметра: массив характеристик
  $.each(_product.properties, function (index, property) {
    $.each(_product.characteristics, function (index, characteristic) {
      if (property.id === characteristic.property_id) {
        _product.property = property;
        setParam(_product.parameters, property.permalink, property);
        setParam(_product.parameters[property.permalink], 'characteristics', []);

        var uniq = true;
        $.each(_product.parameters[property.permalink].characteristics, function (index, cha) {
          if (cha.id == characteristic.id) {
            uniq = false;
          }
        });
        if (uniq) {
          _product.parameters[property.permalink].characteristics.push(characteristic);
        }
      }
    });
  });
  return _product;
}

// Ленивая загрузка
$('img.lazy').each(function (index) {
  $(this).lazyload();
});

(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var lazyloadImages;

    if ('IntersectionObserver' in window) {
      lazyloadImages = document.querySelectorAll('.lazyCss');
      var imageObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var image = entry.target;
            image.classList.remove('lazyCss');
            imageObserver.unobserve(image);
          }
        });
      });

      lazyloadImages.forEach(function (image) {
        imageObserver.observe(image);
      });
    } else {
      var lazyloadThrottleTimeout;
      lazyloadImages = document.querySelectorAll('.lazyCss');

      function lazyloadCss() {
        if (lazyloadThrottleTimeout) {
          clearTimeout(lazyloadThrottleTimeout);
        }

        lazyloadThrottleTimeout = setTimeout(function () {
          var scrollTop = window.pageYOffset;
          $('.lazyCss').each(function (index) {
            if (lazyloadImages[index].offsetTop < window.innerHeight + scrollTop) {
              lazyloadImages[index].src = lazyloadImages[index].dataset.src;
              lazyloadImages[index].classList.remove('lazyCss');
            }
          });

          if (lazyloadImages.length == 0) {
            document.removeEventListener('scroll', lazyloadCss);
            window.removeEventListener('resize', lazyloadCss);
            window.removeEventListener('orientationChange', lazyloadCss);
          }
        }, 20);
      }

      document.addEventListener('scroll', lazyloadCss);
      window.addEventListener('resize', lazyloadCss);
      window.addEventListener('orientationChange', lazyloadCss);
    }
  });
})();

// equalHeight
(function () {
  function equalHeight(group) {
    var tallest = 0;
    group.each(function () {
      thisHeight = $(this).height();
      if (thisHeight > tallest) {
        tallest = thisHeight;
      }
    });
    group.height(tallest);
  }
  $(document).ready(function () {
    $(window).on('load resize', function () {
      $('.js-services-product-item').css('height', '');

      equalHeight($('.js-services-product-item'));
    });
  });
})();

/**************************************************/
/*                  RECAPTCHA (Google - disabled) */
/**************************************************/
function initRecaptcha(element) { /* Google reCaptcha disabled */ }
function resetRecaptcha() { /* Google reCaptcha disabled */ }

$(document).ready(function () {
  'use strict';

  // Имя клиента
  $.getJSON('/client_account/contacts.json', function (data) {
    if (data.client) {
      $('.js-clientName').html(data.client.name);
    }
  });

  // Прокрутка вверх
  var $scrollTop = $('.js-scroll-top');
  $(function () {
    /*$(window).scroll(function(){
				if($(document).scrollTop()>$(window).height()){
					$scrollTop.show();
				}else{
					$scrollTop.hide();
				}
			});*/
    $scrollTop.click(function () {
      $('html,body').animate({ scrollTop: 0 }, 1000);
    });
  });

  /*==============================
	Menu
	==============================*/
  $(window).on('load', function () {
    $('.menu').show();
  });
  $('.header__btn').on('click', function () {
    $('.menu').addClass('menu--active');
    $('body').append('<div class="menu__bg"></div>');
    $('body').addClass('menu__noOverflow');
    $('.menu__bg').on('click', function () {
      $('.menu').removeClass('menu--active');
      $('.menu__bg').remove('');
      $('body').removeClass('menu__noOverflow');
    });
  });
  $('.menu .menu__close').on('click', function () {
    $('.menu').removeClass('menu--active');
    $('.menu__bg').remove('');
    $('body').removeClass('menu__noOverflow');
  });

  /*==============================
	Menu Catalog
	==============================*/
  $('.js-open-header_menu').on('click', function () {
    $(this).next().toggleClass('menu--active');
  });

  /*==============================
	Slider
	==============================*/
  $('.slider .owl-carousel').owlCarousel({
    items: 1,
    loop: true,
    smartSpeed: 500,
    autoplay: true,
    pagination: true,
    autoplayTimeout: 6000,
  });
  $('.slider__img').each(function () {
    if ($(this).attr('data-bg')) {
      $(this).css({
        background: 'url(' + $(this).data('bg') + ')',
        'background-position': 'center center',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
      });
    }
  });
  $('.slider__nav .next').on('click', function () {
    $(this).closest('.slider').find('.owl-carousel').trigger('next.owl.carousel');
  });
  $('.slider__nav .prev').on('click', function () {
    $(this).closest('.slider').find('.owl-carousel').trigger('prev.owl.carousel');
  });

  /*==============================
	Carousel
	==============================*/
  $('.carousel .owl-carousel').owlCarousel({
    items: 1,
    loop: false,
    smartSpeed: 500,
    rewind: true,
    responsive: {
      0: {
        items: 1,
      },
      360: {
        items: 1,
      },
      768: {
        items: 3,
      },
      992: {
        items: 4,
      },
      1200: {
        items: 4,
      },
    },
  });
  $('.carousel__nav--next').on('click', function () {
    $(this).closest('.carousel').find('.owl-carousel').trigger('next.owl.carousel');
  });
  $('.carousel__nav--prev').on('click', function () {
    $(this).closest('.carousel').find('.owl-carousel').trigger('prev.owl.carousel');
  });

  /*==============================
	Masonry
	==============================*/
  $('.masonry').each(function () {
    if ($(this).attr('data-bg')) {
      $(this).css({
        background: 'url(' + $(this).data('bg') + ')',
        'background-position': 'center center',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
      });
    }
  });

  /*==============================
	Tooltip
	==============================*/
  $('[data-toggle="tooltip"]').tooltip();

  /*==============================
	Filter
	==============================*/
  if ($(window).width() < 768) {
    $(window).on('load', function () {
      $('.collection_filter__sidebar').show();
    });
    $('.filter__open').on('click', function () {
      $('.collection_filter__sidebar').addClass('collection_filter__sidebar-open');
      $('.collection_filter__sidebar').addClass('collection_filter__sidebar--open');
      $('body').append('<div class="collection_filter__sidebar__bg"></div>');
      $('body').addClass('collection_filter__sidebar__noOverflow');
      $('.collection_filter__sidebar__bg').on('click', function () {
        $('.collection_filter__sidebar').removeClass('collection_filter__sidebar--open');
        $('.collection_filter__sidebar__bg').remove('');
        $('body').removeClass('collection_filter__sidebar__noOverflow');
      });
    });
    $('.collection_filter__sidebar .filter__content__mobile__close, .collection_filter__sidebar .filter__btn__close').on('click', function () {
      $('.collection_filter__sidebar').removeClass('collection_filter__sidebar--open');
      $('.collection_filter__sidebar__bg').remove('');
      $('body').removeClass('collection_filter__sidebar__noOverflow');
    });
  }

  /*==============================
	Payment
	==============================*/
  $('.delivery :input').click(function () {
    $('.delivery :input').each(function () {
      if ($('#cash').is(':checked')) {
        $('.total__cash').addClass('active');
      } else {
        $('.total__cash').removeClass('active');
      }
    });
  });

  /*==============================
	Thumbnail slider
	==============================*/
  var slider = $('.thumbnail-slider').lightSlider({
    gallery: true,
    item: 1,
    loop: true,
    speed: 500,
    thumbItem: 4,
    vThumbWidth: 85,
    slideMargin: 0,
    galleryMargin: 15,
    thumbMargin: 15,
    controls: false,
    currentPagerPosition: 'left',
    responsive: [
      {
        breakpoint: 767,
        settings: {
          thumbMargin: 10,
        },
      },
    ],
  });

  /*==============================
	Video
	==============================*/
  $('.video').each(function () {
    if ($(this).attr('data-bg')) {
      $(this).css({
        background: 'url(' + $(this).data('bg') + ')',
        'background-position': 'center center',
        'background-repeat': 'no-repeat',
        'background-size': 'cover',
      });
    }
  });

  /*==============================
	Tabs
	==============================*/
  $(document).on('click', '[role="tab"]', function (event) {
    event.preventDefault();
    var el = $(this).attr('href');
    $(this).parent().parent().find('[role="presentation"]').removeClass('active');
    $(this).parent().addClass('active');

    $(el).parent().find('[role="tabpanel"]').removeClass('active');
    $(el).addClass('active');
  });

  $(document).ready(function () {
    $('[role="tablist"] [role="presentation"]').filter(':first').find('a').trigger('click');
  });

  /*==============================
	Модаль
	==============================*/
  $(document).on('click', '.popup-modal', function (event) {
    event.preventDefault();
    $('.modal .error_form').html('');
    var el = $(this).data('attr');
    if (el.length) {
      $.magnificPopup.open({
        items: {
          src: el,
        },
        type: 'inline',
      });
      $('.mfp-wrap').removeClass('mfp-wrap');
    }

  });
  $(document).on('click', '.modal__close', function (e) {
    e.preventDefault();
    $.magnificPopup.close();
  });
  $(document).on('click', '.js-magnificPopup-close', function (e) {
    e.preventDefault();
    $.magnificPopup.close();
  });
});

/*==============================
Добавлен в сравнение
==============================*/
EventBus.subscribe('add_item:insales:compares', function () {
  var el = $('#tnx-compares');
  $.magnificPopup.open({
    items: {
      src: el,
    },
    type: 'inline',
  });
});

/*==============================
Авторизация в модали
==============================*/
$(document).on('submit', '.js-form-signin', function (e) {
  e.preventDefault();
  var email = $('[name="email"]').val();
  var password = $('[name="password"]').val();
  $('.js-form-signin .error_form').html('');

  $.ajax({
    url: '/client_account/session.json',
    type: 'POST',
    data: 'email=' + email + '&password=' + password,
  }).done(function (data) {
    if (data.status == 'ok') {
      location.reload();
    } else {
      data.errors.forEach(function (element) {
        $('.js-form-signin .error_form').append('<p>' + element + '</p>');
      });
    }
  });
});

/*==============================
Регистрация в модали
==============================*/
$('input').on('focus', function () {
  $(this).removeClass('field_error');
  $(this).parent().removeClass('field_error');
});

$(document).on('submit', '.js-form-signup', function (e) {
  e.preventDefault();
  $this = $(this);
  var name = $this.find('[name="client[name]"]').val();
  var email = $this.find('[name="client[email]"]').val();
  var phone = $this.find('[name="client[phone]"]').val();
  var password = $this.find('[name="client[password]"]').val();
  var password_confirmation = $this.find('[name="client[password_confirmation]"]').val();

  var consent_to_personal_data = 0;
  if ($('.js-form-signup').find('[name="client[consent_to_personal_data]"]:checked')[0]) {
    consent_to_personal_data = 1;
  }

  $('.js-form-signup .error_form').html('');

  $.ajax({
    url: '/client_account/contacts.json',
    type: 'POST',
    data:
      'client[name]=' +
      name +
      '&client[email]=' +
      email +
      '&client[phone]=' +
      phone +
      '&client[password]=' +
      password +
      '&client[password_confirmation]=' +
      password_confirmation +
      '&client[consent_to_personal_data]=' +
      consent_to_personal_data +
      '&client[registered]=1',
  }).done(function (data) {
    if (data.status == 'ok') {
      location.reload();
    } else {
      if (consent_to_personal_data != 1) {
        $this.find('[name="client[consent_to_personal_data]"]').parent().addClass('field_error');
      }

      if (password.length < 6) {
        $this.find('[name="client[password]"]').addClass('field_error');
      } else if (password != password_confirmation) {
        $this.find('[name="client[password_confirmation]"]').addClass('field_error');
      }

      $.each(data.errors, function (key, value) {
        if (key == 'consent_to_personal_data') {
          $this
            .find('[for="' + key + '"]')
            .parent()
            .addClass('field_error');
        } else if (key == 'captcha_solution') {
          $('.js-form-signup .error_form').html(value);
        } else {
          $this.find('[name="client[' + key + ']"]').addClass('field_error');
        }
      });
    }
  });
});

/*==============================
Напомнить пароль
==============================*/
$(document).on('submit', '.js-form-reset', function (e) {
  e.preventDefault();
  var email = $('[name="email"]').val();

  $('.js-form-reset .error_form').html('');

  $.ajax({
    url: '/client_account/password/reset.json',
    type: 'POST',
    data: 'email=' + email,
  }).done(function (data) {
    if (data.status == 'ok') {
      $.magnificPopup.open({
        items: {
          src: '#thx_for_reset',
        },
        type: 'inline',
      });
    } else {
      $('[name="email"]').addClass('field_error');
      $('.js-form-signup .error_form').html(data.message);
    }
  });
});

/*==============================
Обратный звонок
==============================*/
$(document).on('submit', '.js-form-call', function (e) {
  e.preventDefault();
  var $this = $(this).closest('form');
  var captchaType = $this.attr('data-captcha');
  if (captchaType !== 'google') {
    return false;
  };
  var name = $this.find('[name="feedback[name]"]').val();
  var phone = $this.find('[name="feedback[phone]"]').val();
  var subject = $this.find('[name="feedback[subject]"]').val();
  var content = $this.find('[name="feedback[content]"]').val();
  var from = $this.find('[name="feedback[from]"]').val();
  var recaptcha = $this.find('[name="g-recaptcha-response"]').val();
  var responseModal = $this.data('response-modal');

  $('.js-form-call .error_form').html('');

  $.ajax({
    url: '/client_account/feedback.json',
    type: 'POST',
    data:
      'feedback[name]=' +
      name +
      '&feedback[from]=' +
      from +
      '&feedback[phone]=' +
      phone +
      '&feedback[subject]=' +
      subject +
      '&feedback[content]=' +
      content +
      '&g-recaptcha-response=' +
      recaptcha,
  }).done(function (data) {
    if (name.length < 4 || from.length < 4 || phone.length < 10 || content.length < 4) {
      if (name.length < 4) {
        $('[name="feedback[name]"]').addClass('field_error');
      }
      if (from.length < 4) {
        $('[name="feedback[from]"]').addClass('field_error');
      }
      if (phone.length < 10) {
        $('[name="feedback[phone]"]').addClass('field_error');
      }
      if (content.length < 4) {
        $('[name="feedback[content]"]').addClass('field_error');
      }
    } else {
      if (data.status == 'ok') {
        var el = $('#' + responseModal);
        $.magnificPopup.open({
          items: {
            src: el,
          },
          type: 'inline',
        });
      } else {
        $.each(data.errors, function (key, value) {
          $('[name="feedback[' + key + ']"]').addClass('field_error');
        });
        resetRecaptcha();
      }
    }
  });
});

EventBus.subscribe('send-feedback:insales:ui_feedback', (data) => {
  const form = data.form;
  const responseModal = form.attr('data-response-modal');
  if (!responseModal) {
    return;
  }
  const el = document.getElementById(responseModal);
  if (!el) {
    return;
  }
  $.magnificPopup.open({
    items: {
      src: el,
    },
    type: 'inline',
  });
});

/*==============================
Подписка на новости
==============================*/
// Показываем при первой загрузке страницы, чере 5 секунд
var subscribeModalRun = function () {
  var params = window.location.search
    .replace('?', '')
    .split('&')
    .reduce(function (p, e) {
      var a = e.split('=');
      p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
      return p;
    }, {});
  if (params['utm_source'] == undefined || params['utm_source'] == '' || !params['utm_source']) {
    var thisTime = new Date().getTime();
    var firstVisit = $.cookie('firstVisit');
    var delayTime = 30; // Время задержки вывода модали (в секундах)

    if (firstVisit == '' || firstVisit == null) {
      $.cookie('firstVisit', thisTime);
      firstVisit = $.cookie('firstVisit');
    }

    var subscribeModalInterval = setInterval(() => {
      if ($('.window-form').length > 0) {
        return false;
      } // модалка не откроется пока активно всплывающее окно предзаказа или информации о поступлении

      var currentTime = new Date().getTime() - delayTime * 1000;
      if (currentTime > firstVisit) {
        // Запускаем модаль. если ранее не показывали
        if (firstVisit != 'false') {
          var el = $('#subscribe');
          $.magnificPopup.open({
            items: {
              src: el,
            },
            type: 'inline',
          });
        }

        $.cookie('firstVisit', false);
        clearInterval(subscribeModalInterval);
      }
    }, 1000);
  }
};
subscribeModalRun();

(function () {
  $('.js-open-sidebar').on('click', function () {
    alertify.panel({
      target: $('[data-modal="mobile-sidebar"]').html(),
      position: 'left',
      onOpen: function (modal) {
        var $sidebarBlocks = $(modal).find('.sidebar-block-content');

        $sidebarBlocks.each(function () {
          var $menu = $(this).find('.mobile-sidebar-menu').first();

          InSalesUI.Menu.create($menu);
        });
      },
    });
  });
  $('.js-open-contacts').on('click', function () {
    $('.contacts-top-menu-block').removeClass('hidden');
    $(this).addClass('is-active');
    // console.log('Открывается!');
  });
  $(document).on('click touchstart', function (elem) {
    var contacts_top = $(elem.target).closest('.contacts-top-menu-block').length;
    var js_open_contacts = $(elem.target).closest('.js-open-contacts').length;
    if (!contacts_top && !js_open_contacts) {
      $('.contacts-top-menu-block').addClass('hidden');
      $('.js-open-contacts').removeClass('is-active');
      // console.log('Закрывается!');
    }
  });
  $('.contacts-overlay').on('click', function () {
    $('.contacts-top-menu-block').addClass('hidden');
    $('.js-open-contacts').removeClass('is-active');
  });
  // Open modal search or search panel in dependence window width
  $('.js-open-search-panel').on('click', function (elem) {
    // console.log(window.innerWidth );
    if (window.innerWidth <= 768) {
      alertify.panel({
        target: $('[data-modal="search-form"]').html(),
        position: 'top',
        hideAfter: false,
      });
      // console.log("Тут должна открыться модалка");
    } else {
      var search_container = $('.js-toggle-search');
      var search_button = $('.js-open-search-panel');
      var contacts_header = $('.js-contacts-header');
      search_button.addClass('hidden');
      search_container.removeClass('hidden');
      // console.log("Тут должна открыться панелька");
    }
  });

  // Closest search-panel when click on other documents
  $(document).on('click touchstart', function (elem) {
    var toggle_search = $(elem.target).closest('.js-toggle-search').length;
    var open_panel = $(elem.target).closest('.js-open-search-panel').length;

    if (!toggle_search && window.innerWidth >= 768 && !open_panel) {
      var search_container = $('.js-toggle-search');
      var search_button = $('.js-open-search-panel');
      var contacts_header = $('.js-contacts-header');
      search_container.addClass('hidden');
      search_button.removeClass('hidden');
      // console.log("Тут должна скрыться панелька");
    }
  });

  if (window.innerWidth <= 768) {
    if ($('.hidden-breadcrumbs').hasClass('js-hidden-bread')) {
      $('.breadcrumb-item').each(function (index) {
        if (index > 2 && index != $('.breadcrumb-item').size() - 1) {
          $(this).addClass('hidden');
          // console.log($(this).text());
        }
      });
      $('.js-hidden-bread').click(function () {
        $('.breadcrumb-item').removeClass('hidden');
        $('.js-hidden-bread').parent().addClass('hidden');
      });
    }
  }
})();

/* Модальное окно Гео-привязки */
function winboxFormatMoney(price) {
  if (typeof Shop !== 'undefined' && Shop.money && Shop.money.format) {
    return Shop.money.format(price);
  }
  if (typeof window.InSales !== 'undefined' && window.InSales.formatMoney) {
    return window.InSales.formatMoney(price);
  }
  return price;
}

function winboxInitFeedbackCaptcha($form) {
  try {
    if (!$form || !$form.length) {
      return;
    }

    var $block = $form.find('.js-winbox-yandex-captcha');
    if (!$block.length || $block.data('winbox-captcha-init')) {
      return;
    }

    var shopConfig = typeof Shop !== 'undefined' && Shop.config && Shop.config.config ? Shop.config.config : {};
    var sitekey = shopConfig.yandex_captcha_key || '';
    if (!sitekey) {
      return;
    }

    function renderCaptcha() {
      if (!$block.length || $block.data('winbox-captcha-init') || !window.smartCaptcha) {
        return;
      }

      $block.data('winbox-captcha-init', true);

      if (!$form.find('[name="yandex-smart-token"]').length) {
        $form.append('<input type="hidden" name="yandex-smart-token" value="">');
      }

      var widgetId = window.smartCaptcha.render($block[0], {
        sitekey: sitekey,
        callback: function (token) {
          $form.find('[name="yandex-smart-token"]').val(token);
        },
        'expired-callback': function () {
          $form.find('[name="yandex-smart-token"]').val('');
        },
        'error-callback': function () {
          $form.find('[name="yandex-smart-token"]').val('');
        },
      });

      $form.data('yandexCaptchaWidgetId', widgetId);
    }

    if (window.smartCaptcha) {
      renderCaptcha();
    } else if (window.yandexCaptchaCommon) {
      window.yandexCaptchaCommon.loadCaptchaScript(renderCaptcha);
    }
  } catch (e) {}
}

function winboxScheduleFeedbackCaptcha() {
  setTimeout(function () {
    winboxInitFeedbackCaptcha($('.window-content .js-request-feedback'));
  }, 200);
}

function winboxGetFeedbackCaptchaToken($form) {
  var token = $form.find('[name="yandex-smart-token"]').val() || '';
  if (token) {
    return token;
  }

  if (window.smartCaptcha && $form.data('yandexCaptchaWidgetId') != null) {
    try {
      token = window.smartCaptcha.getResponse($form.data('yandexCaptchaWidgetId')) || '';
    } catch (e) {}
  }

  return token;
}

function winboxResetFeedbackCaptcha($form) {
  if (window.smartCaptcha && $form.data('yandexCaptchaWidgetId') != null) {
    try {
      window.smartCaptcha.reset($form.data('yandexCaptchaWidgetId'));
    } catch (e) {}
  }
  $form.find('[name="yandex-smart-token"]').val('');
}

function winboxFeedbackCaptchaRequired() {
  var shopConfig = typeof Shop !== 'undefined' && Shop.config && Shop.config.config ? Shop.config.config : {};
  return shopConfig.captcha_type === 'yandex';
}

$(document).ready(function () {
  function winboxReveal() {
    $('.window-shade').fadeIn(200);
    requestAnimationFrame(function () {
      $('.window').removeClass('window-tohide');
    });
  }

  function winboxOpenContent(obj) {
    try {
      winboxData(obj);
    } catch (e) {}

    if (winboxType != 'quickview' && winboxType != 'cart') {
      winboxReveal();
      winboxScheduleFeedbackCaptcha();
    }
  }

  var winboxShow = false;
  var winboxObject;
  var winboxType;
  var winboxTypeClass;
  var winboxIsQuickview = false;
  var cart_type;
  if (cart_type == 'extended') {
    var winboxTriggers = '.winbox, .cart-add';
  } else {
    var winboxTriggers = '.winbox';
  }

  $('body').on('click', '.winbox', function (e) {
    e.preventDefault();
    e.stopPropagation();
    winboxObject = $(this);
    winboxObjectProductTitle = winboxObject.data('product-title');
    winboxObjectVariantId = winboxObject.data('variant-id');
    winboxObjectVariantPrice = winboxObject.data('variant-price');
    winboxObjectVariantImage = winboxObject.data('variant-image');
    winboxObjectProductId = winboxObject.data('product-id');
    if (winboxObject.hasClass('cart-add')) {
      winboxType = 'cart';
    } else {
      var windowData = winboxObject.data('window');
      if (!windowData) {
        return;
      }
      winboxType = windowData.split('|')[0];
      winboxTypeClass = windowData;
      if (windowData == 'request') {
        winboxTypeClass = 'quickorder';
      }
    }
    if (winboxShow) {
      if (quickviewCurrent != '' && (winboxObject.data('window') == 'request' || winboxObject.data('window') == 'quickorder')) {
        winboxIsQuickview = true;
      }
      if ($('.window').hasClass('window-type-menu')) {
        $('.window').addClass('window-tohide-menu');
      }
      $('.window')
        .addClass('window-tohide')
        .animate({ left: 0 }, 200, function () {
          $('.window').attr('class', 'window window-tohide window-type-' + winboxTypeClass);
          $('.window-content').remove();
          winboxOpenContent(winboxObject);
          winboxShow = true;
        });
    } else {
      $('body').append(
        '<div class="window window-tohide window-type-' +
          winboxType +
          '"><div class="window-height"></div><div class="window-data"><button title="Close (Esc)" type="button" class="window-close js-window-close"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><rect x="23.6066" y="25.0208" width="32" height="2" rx="1" transform="rotate(-135 23.6066 25.0208)" fill="#B5ACA7"/><rect x="0.979187" y="23.6066" width="32" height="2" rx="1" transform="rotate(-45 0.979187 23.6066)" fill="#B5ACA7"/></g></svg></button></div><div class="window-fake-shade window-close js-window-close"></div></div><div class="window-shade"></div>'
      );
      $('body')
        .css('padding-right', window.innerWidth - document.body.clientWidth)
        .css('overflow', 'hidden');
      winboxOpenContent(winboxObject);
      winboxShow = true;
    }

  });
  $('body').on('click', '.js-window-close', function (e) {
    e.preventDefault();
    if (winboxIsQuickview) {
      quickviewCurrent.trigger('click');
      winboxIsQuickview = false;
      quickviewCurrent = '';
    } else {
      $('.window').addClass('window-tohide');
      $('.window-shade').fadeOut(200, function () {
        $('body').css('padding-right', 0).css('overflow', '');
        $('.window-shade').remove();
        $('.window').remove();
        winboxShow = false;
      });
    }
    geoIsUpdate = true;
  });
  var windowContent;
  var wbWindow;
  var wbLogin;
  var wbQuickorder;
  var wbTextTitle = '';
  var wbTextContent = '';
  var quickviewProductsId = new Array();
  var quickviewCurrent = '';
  function winboxData(obj) {
    $geoType = '';

    if (obj.hasClass('cart-add')) {
      wbWindow = 'cart';
    } else {
      wbWindow = obj.data('window').split('|')[0];
    }
    $('.window-data').append('<div class="window-content window-obj-quickorder window-obj-' + wbWindow + '"></div>');

    switch (wbWindow) {
      case 'text':
        //Текстовое сообщение
        windowContent = '<div>';
        windowContent += '<p class="window-title">' + wbTextTitle + '</p>';
        windowContent += '<p>' + wbTextContent + '</p>';
        windowContent += '</div>';
        break;
      case 'geo':
        //GEO
        $geoType = obj.data('window').split('|')[1];
        windowContent = '';
        switch ($geoType) {
          case 'geoTerm':
            windowContent +=
              '<p class="window-title"><span class="geo-city-short js-geo-city-short"></span><a href="' +
              geoDeliveryPageUrl +
              '" class="button button-bordered winbox" data-window="geo|geoCity">Изменить</a></p>';
            windowContent += '<p class="window-description">Измените город если он неверный или не определился.</p>';
            windowContent += '<div class="js-geo-data geo-data" data-modules="table"></div>';
            windowContent += '<p><a href="' + geoDeliveryPageUrl + '" class="button">Подробнее о доставке и оплате</a></p>';
            break;
          case 'geoCity':
            windowContent += '<p class="window-title">';
            windowContent += '<span class="geo-city-short js-geo-city-short"></span>';
            if (Site.template == 'product') {
              //windowContent += '<a href="'+geoDeliveryPageUrl+'" class="button is-bordered winbox" data-window="geo|geoTerm">Способы доставки и оплаты</a>';
            } else {
              //windowContent += '<a href="'+geoDeliveryPageUrl+'" class="button is-bordered js-geoTermCart winbox" data-window="geo|geoTerm">Способы доставки и оплаты</a>';
            }
            windowContent += '</p>';
            windowContent += '<p class="window-description">Измените город если он неверный или не определился.</p>';
            windowContent += '<div class="js-geo-data geo-data" data-modules="countries|search|populars"></div>';
            break;
          default:
          //
        }
        break;
      case 'geoMap':
        //GEO Map
        windowContent = '';
        windowContent += '<p class="window-title">Пункты выдачи</p>';
        windowContent += '<div class="js-geo-map geo-map"></div>';
        break;

      case 'request':
        $quickorderType = obj.data('window').split('|')[1];
        if ($quickorderType == 'request' && product_order_type == 'hidden_price') {
          requestClass = ' hidden';
        } else {
          requestClass = ' hidden';
        }
        //Заявка на отсутствующий товар
        windowContent =
          '<form action="/client_account/feedback" class="window-form js-request-feedback"><input name="feedback[content]" id="feedback-content" type="hidden" value=""/><input name="feedback[from]" id="feedback-from" type="hidden" value="' +
          wbWindow +
          '@' +
          domen +
          '"/>';
        windowContent += '<input name="subject" id="feedback-subject" type="hidden" value="Узнать о поступлении товара"/>';
        windowContent += '<input name="feedback[content]" id="feedback-content" type="hidden" value=""/>';
        windowContent += '<input name="content" id="feedback-content-2" type="hidden" value=""/>';
        windowContent +=
          '<p class="window-title">Узнать о поступлении товара</p><p class="window-description">Укажите ваши контактные данные и мы уведомим вас как только данный товар будет в наличии.</p>';

        windowContent +=
          '<div class="window-product"><div class="window-form-item"><div class="row"><div class="cell-xl-4 cell-md-4 cell-sm-4 col-xs-6"><div class="window-form-item-image"><img src="' +
          winboxObjectVariantImage +
          '" class="img-responsive"></div></div><div class="cell-xl-8 cell-md-8 cell-sm-8 cell-xs-6"><div class="row"><div class="cell-xl-12"><div class="window-product-title">' +
          winboxObjectProductTitle +
          '</div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-quantity item-quantity clearfix"><button class="js-cart-item-count cart-item-count item-quantity-minus" data-id="' +
          winboxObjectVariantId +
          '_0" data-action="minus"><i class="ion ion-ios-minus-empty"></i></button><input type="text" name="quantity" value="1" id="quickorder-variant-quantity" class="cart-item-quantity-input-' +
          winboxObjectVariantId +
          '_0" data-price="' +
          winboxObjectVariantPrice +
          '" data-id="' +
          winboxObjectVariantId +
          '_0" min="1" max="999"><button class="js-cart-item-count cart-item-count item-quantity-plus" data-id="' +
          winboxObjectVariantId +
          '_0" data-action="plus"><i class="ion ion-ios-plus-empty"></i></button></div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-price' +
          requestClass +
          '"><span class="cart-item-total-price-' +
          winboxObjectVariantId +
          '_0">' +
          winboxFormatMoney(winboxObjectVariantPrice) +
          '</span></div></div></div></div></div></div></div>';

        windowContent += '<div class="window-form-item"><input type="text" name="name" placeholder="Имя" class="window-input"/></div>';
        windowContent += '<div class="window-form-item"><input type="email" name="from" class="window-input required" placeholder="Электронная почта *"></div>';
        windowContent += '<div class="window-form-item"><input type="tel" name="phone" class="window-input mask-phone required" placeholder="Контактный телефон *"></div>';
        windowContent += '<input type="hidden" name="product" class="window-input" data-title="Товар" value="' + winboxObjectProductTitle + '">';
        windowContent += '<input type="hidden" name="url" class="window-input" data-title="Ссылка на товар" value="' + obj.data('window-product-url') + '">';
        windowContent += '<div class="window-form-item"><textarea name="comment" placeholder="Комментарий" class="window-input" rows="4"></textarea></div>';
        windowContent += typeof privacy !== 'undefined' ? privacy.forms_build : '';
        windowContent +=
          '<div class="window-form-item window-form-captcha"><div class="js-winbox-yandex-captcha feedback__yandex-captcha" data-yandex-captcha-type="visible" data-yandex-captcha-shield-position="top-left"></div></div>';
        windowContent += '<button type="submit" class="button_send">Отправить заявку</button>';
        windowContent += '<div class="status status-block"></div></form>';
        break;

      case 'preorder':
        $quickorderType = obj.data('window').split('|')[1];
        if ($quickorderType == 'request' && product_order_type == 'hidden_price') {
          requestClass = ' hidden';
        } else {
          requestClass = ' hidden';
        }
        //Заявка на предзаказ
        windowContent =
          '<form action="/client_account/feedback" class="window-form js-request-feedback"><input name="feedback[content]" id="feedback-content" type="hidden" value=""/><input name="feedback[from]" id="feedback-from" type="hidden" value="' +
          wbWindow +
          '@' +
          domen +
          '"/>';
        windowContent += '<input name="subject" id="feedback-subject" type="hidden" value="Заявка на товар"/>';
        windowContent += '<input name="feedback[content]" id="feedback-content" type="hidden" value=""/>';
        windowContent += '<input name="content" id="feedback-content-2" type="hidden" value=""/>';
        windowContent +=
          '<p class="window-title">Заявка на товар</p><p class="window-description">Укажите ваши контактные данные и мы уведомим вас как только данный товар будет в наличии.</p>';

        windowContent +=
          '<div class="window-product"><div class="window-form-item"><div class="row"><div class="cell-xl-4 cell-md-4 cell-sm-4 col-xs-6"><div class="window-form-item-image"><img src="' +
          winboxObjectVariantImage +
          '" class="img-responsive"></div></div><div class="cell-xl-8 cell-md-8 cell-sm-8 cell-xs-6"><div class="row"><div class="cell-xl-12"><div class="window-product-title">' +
          winboxObjectProductTitle +
          '</div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-quantity item-quantity clearfix"><button class="js-cart-item-count cart-item-count item-quantity-minus" data-id="' +
          winboxObjectVariantId +
          '_0" data-action="minus"><i class="ion ion-ios-minus-empty"></i></button><input type="text" name="quantity" value="1" id="quickorder-variant-quantity" class="cart-item-quantity-input-' +
          winboxObjectVariantId +
          '_0" data-price="' +
          winboxObjectVariantPrice +
          '" data-id="' +
          winboxObjectVariantId +
          '_0" min="1" max="999"><button class="js-cart-item-count cart-item-count item-quantity-plus" data-id="' +
          winboxObjectVariantId +
          '_0" data-action="plus"><i class="ion ion-ios-plus-empty"></i></button></div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-price' +
          requestClass +
          '"><span class="cart-item-total-price-' +
          winboxObjectVariantId +
          '_0">' +
          winboxFormatMoney(winboxObjectVariantPrice) +
          '</span></div></div></div></div></div></div></div>';

        windowContent += '<div class="window-form-item"><input type="text" name="name" placeholder="Имя" class="window-input"/></div>';
        windowContent += '<div class="window-form-item"><input type="email" name="from" class="window-input required" placeholder="Электронная почта *"></div>';
        windowContent += '<div class="window-form-item"><input type="tel" name="phone" class="window-input mask-phone required" placeholder="Контактный телефон *"></div>';
        windowContent += '<input type="hidden" name="product" class="window-input" data-title="Товар" value="' + winboxObjectProductTitle + '">';
        windowContent += '<input type="hidden" name="url" class="window-input" data-title="Ссылка на товар" value="' + obj.data('window-product-url') + '">';
        windowContent += '<div class="window-form-item"><textarea name="comment" placeholder="Комментарий" class="window-input" rows="4"></textarea></div>';
        windowContent += typeof privacy !== 'undefined' ? privacy.forms_build : '';
        windowContent +=
          '<div class="window-form-item window-form-captcha"><div class="js-winbox-yandex-captcha feedback__yandex-captcha" data-yandex-captcha-type="visible" data-yandex-captcha-shield-position="top-left"></div></div>';
        windowContent += '<button type="submit" class="button_send">Отправить заявку</button>';
        windowContent += '<div class="status status-block"></div></form>';
        break;

      case 'quickorder':
        //Покупка в 1 клик / альтернативная заявка на товар
        $quickorderType = obj.data('window').split('|')[1];
        wbQuickorder = $quickorderType;
        quickorderTypeText = '';
        //quickorderProductData = $.parseJSON($('.product'+winboxObjectProductId+'data').html());
        windowContent = '<form action="/fast_checkout" class="window-order" method="post">';
        windowContent +=
          '<input type="hidden" name="order[delivery_variant_id]" value="' +
          delivery_variant_id +
          '"><input type="hidden" name="order[payment_gateway_id]" value="' +
          payment_gateway_id +
          '"><input type="hidden" name="pid_value" value="1"><input type="hidden" value="' +
          winboxObjectVariantId +
          '" id="quickorder-variant-id"><input type="hidden" name="shipping_address[street]" value="-"><input type="hidden" name="shipping_address[house]" value="-">';
        windowContent += '<input name="order[fields_values_attributes][12207267][hack]" value="" type="hidden">';
        windowContent += '<input name="order[fields_values_attributes][12207267][field_id]" value="12207267" type="hidden">';
        windowContent += '<input name="order[fields_values_attributes][12207267][value]" id="order_field_12207267" type="hidden" value="_"/>';
        windowContent += '<input name="order[fields_values_attributes][12207268][hack]" value="" type="hidden">';
        windowContent += '<input name="order[fields_values_attributes][12207268][field_id]" value="12207268" type="hidden">';
        windowContent += '<input name="order[fields_values_attributes][12207268][value]" id="order_field_12207268" type="hidden" value="_"/>';
        switch ($quickorderType) {
          case 'request':
            windowContent += '<p class="window-title">Заявка на товар</p>';
            windowContent += '<input type="hidden" name="order[comment]" value="ВНИМАНИЕ - заявка на поступление: ' + winboxObjectProductTitle + '">';
            quickorderTypeText = '<p class="window-description">Мы оповестим вас как только данный товар появится в наличии.</p>';
            break;
          case 'fastorder':
            windowContent += '<p class="window-title">Покупка в 1 клик</p>';
            windowContent += '<input type="hidden" name="order[comment]" value="ВНИМАНИЕ - покупка в 1 клик: ' + winboxObjectProductTitle + '">';
            quickorderTypeText = '<p class="window-description">В самое ближайшее время наш менеджер свяжется с вами и уточнит сроки и стоимость доставки.</p>';
            break;
          default:
          //
        }
        if ($quickorderType == 'request' && product_order_type == 'hidden_price') {
          requestClass = ' hidden';
        } else {
          requestClass = '';
        }
        windowContent +=
          '<div class="window-product"><div class="window-form-item"><div class="row"><div class="col-lg-4 col-md-4 col-sm-4 col-xs-6"><div class="window-form-item-image"><img src="' +
          winboxObjectVariantImage +
          '" class="img-responsive"></div></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-6"><div class="row"><div class="col-lg-12"><div class="window-product-title">' +
          winboxObjectProductTitle +
          '</div></div><div class="col-sm-6 col-xs-12"><div class="window-product-quantity item-quantity clearfix"><button class="js-cart-item-count cart-item-count item-quantity-minus" data-id="' +
          winboxObjectVariantId +
          '_0" data-action="minus"><i class="fa fa-minus" aria-hidden="true"></i></button><input type="text" value="1" id="quickorder-variant-quantity" class="cart-item-quantity-input-' +
          winboxObjectVariantId +
          '_0" data-price="' +
          winboxObjectVariantPrice +
          '" data-id="' +
          winboxObjectVariantId +
          '_0" min="1" max="999"><button class="js-cart-item-count cart-item-count item-quantity-plus" data-id="' +
          winboxObjectVariantId +
          '_0" data-action="plus"><i class="fa fa-plus" aria-hidden="true"></i></button></div></div><div class="col-sm-6 col-xs-12"><div class="window-product-price' +
          requestClass +
          '"><span class="cart-item-total-price-' +
          winboxObjectVariantId +
          '_0">' +
          winboxFormatMoney(winboxObjectVariantPrice) +
          '</span></div></div></div></div></div></div></div>';
        windowContent += quickorderTypeText;
        windowContent +=
          '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Имя <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="text" name="client[name]" data-title="Имя" class="window-input required"/></div></div></div>';
        windowContent +=
          '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Контактный телефон <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="tel" name="client[phone]" class="window-input mask-phone required" data-title="Телефон"/></div></div></div>';
        switch ($quickorderType) {
          case 'request':
            windowContent +=
              '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Электронная почта <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="email" name="client[email]" class="window-input required" data-title="Электронная почта"/></div></div></div>';
            windowContent += '<button type="submit" class="button_send">Оставить заявку</button>' + privacy.forms_build + '<div class="status status-block"></div>';
            break;
          case 'fastorder':
            if (product_order_email) {
              windowContent +=
                '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Электронная почта <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="email" name="client[email]" class="window-input required" data-title="Электронная почта"/></div></div></div>';
            } else {
              windowContent += '<input type="hidden" name="client[email]" value="' + wbWindow + '@' + domen + '">';
            }
            windowContent += '<button type="submit" class="button_send">Завершить оформление</button>' + privacy.forms_build + '<div class="status status-block"></div>>';
            break;
          default:
          //
        }
        windowContent += '</form>';
        break;
    }
    if (wbWindow != 'quickview') {
      $('.window-content').append(windowContent);
      if ($.fn.inputmask) {
        try {
          $('.mask-phone').inputmask('+9(999)999-99-99');
        } catch (e) {}
      }
    }
    if (wbWindow == 'geo') {
      geoIsUpdate = false;
      checkGeo();
    }
    if (wbWindow == 'geoMap') {
      geoIsUpdate = false;
      checkGeoMap();
    }
    EventBus.subscribe('update_items:insales:cart', function (data) {
      if (data.items_count > 0) {
        $('.js-geoTermCart').show();
      } else {
        $('.js-geoTermCart').hide();
      }
    });
  }

  var windowAjax = '';
  var windowFormContent = '';
  $('body').on('submit', '.window-order', function (e) {
    e.preventDefault();
    $form = $(this);
    if (windowAjax != '') {
      windowAjax.abort();
    }
    $('.status').html('');
    var windowFormErrors = false;
    var windowPrivacyErrors = false;
    $('.window-input', $form).each(function (index) {
      $(this).removeClass('input-error');
      if ($(this).hasClass('required') && $(this).val() == '') {
        windowFormErrors = true;
        $(this).addClass('input-error');
      }
    });
    if (!$('.privacy-info input', $form).prop('checked') && $('.privacy-info input', $form).length > 0) {
      windowPrivacyErrors = true;
    }
    if (windowFormErrors || windowPrivacyErrors) {
      $('.status').html(
        '<span class="text-red"><i class="fa fa-exclamation-triangle fa-lg"></i>' +
          (windowFormErrors ? 'Не все поля заполнены корректно.' : '') +
          ' ' +
          (windowPrivacyErrors ? 'Вы должны дать согласие на обработку данных.' : '') +
          '</span>'
      );
    } else {
      $('button', $form).addClass('button-grey').prop('disabled', true);
      $('.status').html('<span class="text-grey"><i class="fa fa-spinner fa-spin fa-lg"></i>Пожалуйста, подождите&hellip;</span>');
      windowAjax = $.ajax({
        url: '/cart_items.json',
        type: 'post',
        data: '_method=put&cart[quantity][' + $('#quickorder-variant-id').val() + ']=' + $('#quickorder-variant-quantity').val(),
        success: function (e) {
          windowAjax = $.ajax({
            url: '/fast_checkout.json',
            type: 'post',
            data: $form.serialize(),
            dataType: 'json',
            success: function (e) {
              if (e.status == 'ok') {
                if (wbQuickorder == 'request') {
                  wbTextTitle = 'Заявка успешно отправлена!';
                  wbTextContent = 'Мы обязательно свяжемся с вами как только данный товар появится в наличии.</span>';
                  $('body').append('<a href="#" class="winbox js-winbox-fake" data-window="text"></a>');
                  $('.js-winbox-fake').trigger('click');
                  $('.js-winbox-fake').remove();
                } else {
                  $('.status').html(
                    '<span class="text-green"><i class="fa fa-check fa-lg"></i>Заявка успешно отправлена! Сейчас вы будете перенаправлены на страницу заказа. Если этого не произошло <a href="' +
                      e.location +
                      '" class="link-alt">нажмите сюда</a>.</span>'
                  );
                  window.setTimeout(function () {
                    window.location.href = e.location;
                  }, 3000);
                }
              } else {
                var errorText = '';
                $.each(e.errors, function (i, item) {
                  $.each(item, function (i, item2) {
                    errorText += '\n' + item2;
                  });
                });
                if (errorText != '') {
                  $('.status').html('<span class="text-red"><i class="fa fa-info fa-lg"></i>' + errorText + '</span>');
                } else {
                  $('.status').html('<span class="text-red"><i class="fa fa-info fa-lg"></i>Во время отправки данных возникза ошибка! Попробуйте повторить позже.</span>');
                }
              }
            },
          });
        },
      });
    }
  });
});

// +- для товара в модали
$('body').on('click', '.js-cart-item-count', function (e) {
  e.preventDefault();
  var item = $(this).data('id');
  var itemInput = $('.cart-item-quantity-input-' + item);
  var itemText = $('.cart-item-quantity-' + item);
  var itemVal = parseInt(itemInput.val());
  var clickDelay = false;
  if (clickDelay == false) {
    itemValTmp = parseInt(itemInput.val());
    clickDelay = true;
  }
  var itemMaxVal = itemInput.attr('max') != '' && itemInput.attr('max') != 'null' ? itemInput.attr('max') : 999;
  if (itemVal > itemMaxVal) {
    itemVal = itemMaxVal;
    itemInput.val(itemVal);
    itemText.html(itemVal);
  } else {
    switch ($(this).data('action')) {
      case 'minus':
        // Уменьшаем
        if (itemVal > 1) {
          itemVal--;
          itemInput.val(itemVal);
          itemText.html(itemVal);
        }
        break;
      case 'plus':
        // Прибавляем
        if (itemVal < itemMaxVal) {
          itemVal++;
          itemInput.val(itemVal);
          itemText.html(itemVal);
        }
        break;
      default:
      //
    }
  }
  $('.cart-item-total-price-' + item).html(winboxFormatMoney(itemInput.data('price') * itemVal));
});

// Форма обратной связи для уточнения о поступлении
$(document).on('submit', '.js-request-feedback', function (event) {
  event.preventDefault();

  var $widgetFeedback = $(this);

  $widgetFeedback.find('.input-error').removeClass('input-error');
  $widgetFeedback.find('.error').remove();

  var product = $widgetFeedback.find('[name="product"]').val();
  var url = $widgetFeedback.find('[name="url"]').val();

  var from = $widgetFeedback.find('[name="from"]').val();
  var phone = $widgetFeedback.find('[name="phone"]').val();
  var email = $widgetFeedback.find('[name="from"]').val();
  var quantity = $widgetFeedback.find('[name="quantity"]').val();
  var comment = $widgetFeedback.find('[name="comment"]').val();
  var subject = $widgetFeedback.find('[name="feedback[subject]"]').val()
    ? $widgetFeedback.find('[name="feedback[subject]"]').val()
    : $widgetFeedback.find('[name="subject"]').val();

  var content = 'Товар: ' + product + '\n';
  content += 'url: ' + url + '\n';
  content += 'Количество: ' + quantity + '\n\n';

  content += 'Комментарий: ' + comment + '\n';

  $('[name="feedback[content]"]').val(content);
  $('[name="content"]').val(content);

  var msg = $widgetFeedback.serializeObject();

  var error = false;
  if (!email) {
    error = true;
    $widgetFeedback.find('[name="from"]').addClass('input-error');
    $widgetFeedback.find('[name="from"]').after('<div class="error">Адрес электронной почты не может быть пустым</div>');
  }

  if (!phone) {
    error = true;
    $widgetFeedback.find('[name="phone"]').addClass('input-error');
    $widgetFeedback.find('[name="phone"]').after('<div class="error">Телефон не может быть пустым</div>');
  }

  if (error == true) {
    return false;
  }

  var captchaToken = winboxGetFeedbackCaptchaToken($widgetFeedback);
  if (winboxFeedbackCaptchaRequired() && !captchaToken) {
    alertify.error('Пожалуйста, подтвердите, что вы не робот');
    return false;
  }

  if (captchaToken) {
    msg['yandex-smart-token'] = captchaToken;
  }

  var val_send;
  var max_send = $(this).attr('data-max-send');

  sessionStorage.getItem('send_success') ? (val_send = sessionStorage.getItem('send_success')) : (val_send = 0);

  if (max_send <= val_send) {
    maxSendError();
    $(this).find('.button-widget-feedback').attr('disabled', 'disabled').addClass('is-secondary');

    return false;
  }

  Shop.sendMessage(msg)
    .done(function (response) {
      windowContent = `<p class="window-title">${subject}</p>`;
      // windowContent = '<p class="window-title">Заявка на товар</p>';
      windowContent += '<p class="window-description" style="text-align: center;">Заявка успешно отправлена! Мы оповестим вас как только данный товар появится в наличии.</p>';
      windowContent += '<p class="window-continue" style="text-align: center;"><button class="button_send button_continue js-window-close">Продолжить покупки</button></p>';
      $('.window-content').html(windowContent);

      $widgetFeedback.trigger('reset');
      $widgetFeedback.find('.form-row').removeClass('active');
      val_send++;
      sessionStorage.setItem('send_success', val_send);
    })
    .fail(function (response) {
      winboxResetFeedbackCaptcha($widgetFeedback);

      if (!response || !response.errors) {
        alertify.error('Ошибка при отправке заявки. Попробуйте ещё раз.');
        return;
      }

      $.each(response.errors, function (i, val) {
        $widgetFeedback.find('[name="' + i + '"]').addClass('input-error');
        $widgetFeedback.find('[name="' + i + '"]').after('<div class="error">' + val[0] + '</div>');
        alertify.error(val[0]);
      });
    });
});

// Форма обратной связи для предзаказа
$(document).on('submit', '.js-preorder-feedback', function (event) {
  event.preventDefault();
  var $widgetFeedback = $(this);

  $widgetFeedback.find('.input-error').removeClass('input-error');
  $widgetFeedback.find('.error').remove();

  var product = $widgetFeedback.find('[name="product"]').val();
  var url = $widgetFeedback.find('[name="url"]').val();

  var from = $widgetFeedback.find('[name="from"]').val();
  var name = $widgetFeedback.find('[name="name"]').val();
  var phone = $widgetFeedback.find('[name="phone"]').val();
  var email = $widgetFeedback.find('[name="from"]').val();
  var quantity = $widgetFeedback.find('[name="quantity"]').val();
  var comment = $widgetFeedback.find('[name="comment"]').val();

  var content = 'Товар: ' + product + '\n';
  content += 'url: ' + url + '\n';
  content += 'Имя: ' + name + '\n';
  content += 'Количество: ' + quantity + '\n\n';
  content += 'Комментарий: ' + comment + '\n';

  $('[name="feedback[content]"]').val(content);
  $('[name="content"]').val(content);

  var msg = $widgetFeedback.serializeObject();

  var error = false;
  if (!name) {
    error = true;
    $widgetFeedback.find('[name="name"]').addClass('input-error');
    $widgetFeedback.find('[name="name"]').after('<div class="error">Укажите ваше имя</div>');
  }

  if (!email) {
    error = true;
    $widgetFeedback.find('[name="from"]').addClass('input-error');
    $widgetFeedback.find('[name="from"]').after('<div class="error">Адрес электронной почты не может быть пустым</div>');
  }

  if (!phone) {
    error = true;
    $widgetFeedback.find('[name="phone"]').addClass('input-error');
    $widgetFeedback.find('[name="phone"]').after('<div class="error">Телефон не может быть пустым</div>');
  }

  if (error == true) {
    return false;
  }

  var val_send;
  var max_send = $(this).attr('data-max-send');

  sessionStorage.getItem('send_success') ? (val_send = sessionStorage.getItem('send_success')) : (val_send = 0);

  if (max_send <= val_send) {
    maxSendError();
    $(this).find('.button-widget-feedback').attr('disabled', 'disabled').addClass('is-secondary');

    return false;
  }
  console.log('$widgetFeedback', $widgetFeedback);
  /*if($widgetFeedback.find('.g-recaptcha').length > 0){
            	var recaptchaId = $widgetFeedback.find('.g-recaptcha').attr('id');
                resetRecaptcha();
              	initRecaptcha(recaptchaId);
            }*/
  $.post('/cart_items.json', {
    variant_id: $widgetFeedback.find('#quickorder-variant-quantity').data('id').replace('_0', ''),
    quantity: 1,
  }).done(function (cart) {
    console.log(cart);

    $.post('/fast_checkout.json', {
      client: {
        name: name,
        email: email,
        phone: phone,
        consent_to_personal_data: true,
      },
      order: {
        delivery_variant_id: 4692733,
        payment_gateway_id: 2870119,
        // delivery_variant_id: 2807915,
        // payment_gateway_id: 925052,
        comment: 'Предзаказ: \n' + comment,
      },
    }).done(function (response) {
      if (response.errors) {
        $.each(response.errors, function (i, val) {
          $widgetFeedback.find('[name="' + i + '"]').addClass('input-error');
          $widgetFeedback.find('[name="' + i + '"]').after('<div class="error">' + val[0] + '</div>');
          alertify.error(val);
        });
      } else {
        windowContent = '<p class="window-title">Заявка на товар</p>';
        windowContent += '<p class="window-description" style="text-align: center;">Заявка успешно отправлена! Мы оповестим вас как только данный товар появится в наличии.</p>';
        windowContent += '<p class="window-continue" style="text-align: center;"><button class="button_send button_continue js-window-close">Продолжить покупки</button></p>';
        $('.window-content').html(windowContent);

        $widgetFeedback.trigger('reset');
        $widgetFeedback.find('.form-row').removeClass('active');
        val_send++;
        sessionStorage.setItem('send_success', val_send);
      }
    });
  });

  /*
    Shop.sendMessage(msg)
        .done(function (response) {
            windowContent = '<p class="window-title">Заявка на товар</p>';
            windowContent += '<p class="window-description" style="text-align: center;">Заявка успешно отправлена! Мы оповестим вас как только данный товар появится в наличии.</p>';
            windowContent += '<p class="window-continue" style="text-align: center;"><button class="button_send button_continue js-window-close">Продолжить покупки</button></p>';
            $('.window-content').html(windowContent)

            $widgetFeedback.trigger('reset');
            $widgetFeedback.find('.form-row').removeClass('active');
            val_send++;
            sessionStorage.setItem('send_success', val_send);
        })
        .fail(function (response) {
            $.each(response.errors, function (i, val) {
                $widgetFeedback.find('[name="' + i + '"]').addClass('input-error');
                $widgetFeedback.find('[name="' + i + '"]').after('<div class="error">' + val[0] + '</div>');
                alertify.error(val);
            });
        });*/
});

// Подписка на новости
$('.js-subscribe_submit').click(function (event) {
  event.preventDefault();
  var $this = $(this).closest('.js-subscribe');
  $this.find('.errorMsg').remove();
  $this.find('#subscribe_email').removeClass('error');

  var errors = '';
  var name = $this.find('#subscribe_name');
  var phone = $this.find('#subscribe_phone');
  var email = $this.find('#subscribe_email');
  var pattern = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);
  if (phone.val() == '') {
    phone.val('80000000000');
  }
  if (email.val() != '' && pattern.test(email.val()) && name.val() != '') {
    $.ajax({ url: '/client_account/session.json', type: 'delete' });
    $.ajax({
      url: '/client_account/contacts.json',
      type: 'post',
      data:
        'client[consent_to_personal_data]=1&client[registered]=1&client[phone]=' +
        phone.val() +
        '&client[password]=q1w2e3&client[password_confirmation]=q1w2e3&client[email]=' +
        email.val() +
        '&client[name]=' +
        name.val(),
      success: function (response) {
        if (response.status == 'error') {
          $.each(response.errors, function (index, value) {
            errors += '<li>' + value[0] + '</li>';
          });
        } else {
          $this.find('.subscribe_block_content').hide();
          $this.find('.subscribe_block_success').show();
          return true;
        }

        if (errors) {
          $this.append('<ul class="errorMsg">' + errors + '</ul>');
        }
      },
      error: function (response) {
        $this.find('#subscribe_email').addClass('error');
        return false;
      },
    });
  } else {
    $this.find('input#subscribe_name,input#subscribe_email').addClass('error');
    errors = 'Эти поля обязательны к заполнению.';
  }

  if (errors) {
    $this.find('.subscribe_block_info').before('<ul class="errorMsg">' + errors + '</ul>');
  }
});
$(document).on('focus', 'input', function () {
  $(this).removeClass('error');
});

/*
 * Отложенные
 */
var Favorite = new Favorites({
  onUpdate: function (data) {
    if (data.$target) {
      if ($(data.$target).hasClass('is-added') == true) {
        var el = $('#thx-favorites');
        $.magnificPopup.open({
          items: {
            src: el,
          },
          type: 'inline',
        });
      }
    }

    // Пример работает только с common.js v2
    // Рендер списка товаров
    var products = data.products;
    var product_ids = '';
    $('.js-favorite').html('');
    if (data.favorites.size > 0) {
      $('.js-wishlist-count').html(data.favorites.size).show();
    } else {
      $('.js-wishlist-count').html('0').hide();
    }

    _.forEach(products, function (product) {
      if (product) {
        $('.js-favorite').append('<div class="col-xs-6 col-sm-4 col-md-3">' + Template.render(product, 'product_card') + '</div>');
        $('.js-favorite').find('[data-favorites-trigger]').addClass('is-added');
      }
    });

    if ($('.js-favorite').html() == '') {
      $('.js-favorite').html('<div class="col-xs-12 col-sm-12 col-md-12"><div class="products_empty">Список избранного пуст!</div></div>');
    } else {
      $('.favorite-actions').show();
    }

    $('.js-favorite img.lazy').each(function (index) {
      $(this).lazyload();
    });

    // инициализация инстансов нужна после динамического добавления товаров
    Products.getList(_.map(products, 'id'));
  },
});

$('form:not(#order_form)').find('#client_phone').inputmask('+7(999)999-99-99');
$('form:not(#order_form)').find('#client_phone_reg').inputmask('+7(999)999-99-99');

//маска на телефоне обратного звонка
$('form:not(#order_form)').find('#feedback_phone').inputmask('+7(999)999-99-99');
$('form:not(#order_form)').find('#feedback_phone_nd').inputmask('+7(999)999-99-99');
$('form:not(#order_form)').find('#feedback_phone_sr').inputmask('+7(999)999-99-99');

/*****************************************/
/*          ОТЛОЖЕННЫЕ ТОВАРЫ            */
/*****************************************/
// Добавляем все товары в корзину
$('.js-buy-all').on('click', function () {
  $('.js-favorite')
    .find('[data-item-add]')
    .each(function (index) {
      $(this).trigger('click');
    });
});

// Удаляем все товары из избранного
$('.js-clear-all').on('click', function () {
  $('.js-favorite')
    .find('[data-favorites-trigger]')
    .each(function (index) {
      $(this).trigger('click');
    });
  $('.favorite-actions').hide();
  $('.js-favorite').html('<div class="col-xs-12 col-sm-12 col-md-12"><div class="products_empty">Список избранного пуст!</div></div>');
});
(function () {
  if (Site.template != 'index') {
    return;
  }

  var _options = {
    autoHeight: true,
    loop: true,
    pagination: true,
  };

  if (_.get(InsalesThemeSettings, 'promo_slider_auto')) {
    _options.autoplay = _.get(InsalesThemeSettings, 'promo_slider_auto_time', 5) * 1000;
  }

  $('[data-slider="promo"]').each(function () {
    new Swiper(this, _options);
  });
})();

(function () {
  if (Site.template != 'index') {
    return;
  }

  var _spOptions = {
    slidesPerView: 4,
    spaceBetween: 16,
    breakpoints: {
      380: { slidesPerView: 1 },
      480: { slidesPerView: 2 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  };

  $('[data-slider="special-products"]').each(function () {
    new Swiper(this, _spOptions);
  });
})();

(function () {
  if (Site.template != 'index') {
    return;
  }

  var _blogOptions = {
    slidesPerView: 4,
    spaceBetween: 16,
    breakpoints: {
      480: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    },
  };

  $('[data-slider="blogs"]').each(function () {
    new Swiper(this, _blogOptions);
  });
})();

(function () {
  if (Site.template != 'collection') {
    return;
  }
})();

// Прибиваем меню при скролле

(function () {
  $(window).scroll(function () {
    if (window.pageYOffset > 250 && window.innerWidth <= 768) {
      $('.js-top-panel-fixed').addClass('fixed');
      $('.top-panel-wrapper').addClass('z-index');
    } else {
      $('.js-top-panel-fixed').removeClass('fixed');
      $('top-panel-wrapper').removeClass('z-index');
    }
  });

  $('.js-arrow-up').click(function () {
    $('body,html').animate({ scrollTop: 0 }, 500);
  });
})();

// Проверяет на кол-во отправленных заапросов звонка, ограничивает их
(function () {
  if (Site.template != 'index') {
    return;
  }

  $(document).on('submit', '.js-widget-feedback', function (event) {
    var $widgetFeedback = $(this);
    var msg = $widgetFeedback.serializeObject();
    var val_send;
    var max_send = $(this).attr('data-max-send');

    event.preventDefault();
    sessionStorage.getItem('send_success') ? (val_send = sessionStorage.getItem('send_success')) : (val_send = 0);

    if (max_send <= val_send) {
      maxSendError();
      $(this).find('.button-widget-feedback').attr('disabled', 'disabled').addClass('is-secondary');

      return false;
    }
    Shop.sendMessage(msg)
      .done(function (response) {
        alertify.success(response.notice);
        $widgetFeedback.trigger('reset');
        val_send++;
        sessionStorage.setItem('send_success', val_send);
      })
      .fail(function (response) {
        $.each(response.errors, function (i, val) {
          alertify.error(val[0]);
        });
      });
  });
})();

(function () {
  Shop.client.get().done(function (data) {
    if (!data.authorized) {
      return false;
    }
    var myname = data.name;

    $('.js-user-name').html(myname);

    $('.js-open-sidebar').on('click', function () {
      $('.js-user-name-mobile').html(myname);
    });
  });
})();
// Запуск видео
$(document).on('click', '.js-product-video-play', function (event) {
  event.preventDefault();
  videoEl = document.getElementsByTagName('video')[0];
  if ($(this).parent().hasClass('active')) {
    videoEl.pause();
    $(this).parent().removeClass('active');
  } else {
    videoEl.play();
    $(this).parent().addClass('active');
  }
});

/* Характеристики */
$('.js-properties-block').each(function (index) {
  if ($(this).find('.properties-table').html() == '') {
    $(this).hide();
  }
});

/* Табы */
if ($('[role="presentation"].active').find('[aria-controls]') == 'tab-reviews') {
  $('.js-tab-products').hide();
} else {
  $('.js-tab-products').show();
}
$('[data-toggle="tab"]').on('click', function () {
  if ($(this).attr('aria-controls') == 'tab-reviews') {
    $('.js-tab-products').hide();
  } else {
    $('.js-tab-products').show();
  }
});

/* Цена доставки */
function setDeliveryInfo(city, region) {
  if ($('.js-delivery-product').length) {
    if (!city) {
      var city = 'Москва';
    }
    $('.js-delivery-product .delivery__title').find('.warning').hide();
    $('.js-delivery-product .info__delivery__item__warning').hide();
    // if (city == 'Москва') {
    //   if ($('.js-delivery-product').closest('[data-main-form]').find('.js-product-price').attr('data-price-summ') * 1 < 5000) {
    //     var courier_price = 'от 350 <i class="fa fa-rub priceCurrency"></i>';
    //     var pickup_price = 'от 250 <i class="fa fa-rub priceCurrency"></i>';
    //   } else {
    //     var courier_price = 'бесплатно';
    //     var pickup_price = 'бесплатно';
    //   }
    // } else if (city == 'Санкт-Петербург') {
    //   if ($('.js-delivery-product').closest('[data-main-form]').find('.js-product-price').attr('data-price-summ') * 1 < 5000) {
    //     var courier_price = 'от 500 <i class="fa fa-rub priceCurrency"></i>';
    //     var pickup_price = 'от 250 <i class="fa fa-rub priceCurrency"></i>';
    //   } else {
    //     var courier_price = 'бесплатно';
    //     var pickup_price = 'бесплатно';
    //   }
    // } else {
    //   if ($('.js-delivery-product').closest('[data-main-form]').find('.js-product-price').attr('data-price-summ') * 1 < 5000) {
    //     var courier_price = 'от 500 <i class="fa fa-rub priceCurrency"></i>';
    //     var pickup_price = 'от 250 <i class="fa fa-rub priceCurrency"></i>';
    //   } else {
    //     var courier_price = 'бесплатно';
    //     var pickup_price = 'бесплатно';
    //   }
    //   /*$('.js-delivery-product .delivery__title').find('.warning').show();
    //       $('.js-delivery-product .info__delivery__item__warning').show();*/
    // }
    var courier_price = 'бесплатно';
    var pickup_price = 'бесплатно';
    $('.js-delivery-product .info__delivery__item__courier').find('.delivery__price').html(courier_price);
    $('.js-delivery-product .info__delivery__item__pickup').find('.delivery__price').html(pickup_price);
    $('.pickup_mapLink').html(
      '<a href="#" class="pickup_mapLink_item_link button is-primary" onclick="boxberry.open(\'\', \'1$9e87972f2ec0897780e8b4ae28b047f9\', \'' +
        city +
        ', ' +
        region +
        '\');  return false;"><span class="icon"><img src="https://static-sl.insales.ru/files/1/7101/16997309/original/logo-boxberry.png" /></span><span class="title">Пункты выдачи boxberry</span></a>'
    );
  }
}

// Пункты выдачи nivona
var myMap;
function init() {
  myMap = new ymaps.Map(
    'map',
    {
      center: [55.8218067, 37.595461, 17],
      zoom: 15,
    },
    {
      searchControlProvider: 'yandex#search',
    }
  );

  myMap.geoObjects
    .add(
      new ymaps.Placemark(
        [55.649916, 37.913882],
        {
          balloonContent: 'Московская обл. Люберцы, г. Томилино, рп, Птицефабрика мрк. литера №/Этаж 5Т,Т, Т2,Т3,Т4/2, помещение 4',
        },
        {
          preset: 'islands#icon',
          iconColor: '#b00917',
        }
      )
    )
    .add(
      new ymaps.Placemark(
        [55.649916, 37.913882],
        {
          balloonContent: 'Московская обл. Люберцы, г. Томилино, рп, Птицефабрика мрк. литера №/Этаж 5Т,Т, Т2,Т3,Т4/2, помещение 4',
        },
        {
          preset: 'islands#icon',
          iconColor: '#b00917',
        }
      )
    );
}

function setCity(city) {
  if (city == 'Москва') {
    $('.js-productMap').show();
    myMap.panTo([55.649916, 37.913882], {
      delay: 1500,
    });
  } else if (city == 'Санкт-Петербург') {
    $('.js-productMap').show();
    myMap.panTo([59.865076, 30.4241173], {
      delay: 1500,
    });
  } else {
    //$('.js-productMap').hide();
  }
}

$('.js-pickup_mapLink_nivona').on('click', function (e) {
  e.preventDefault();
  var el = $('#pickup_mapLink_nivona');
  $.magnificPopup.open({
    items: {
      src: el,
    },
    type: 'inline',
  });

  $('#map').html('');
  loadYmaps(function() {
    init();
    setCity($.cookie('geoData').split('|')[1]);
  });
});

/* Галерея */
function product_gallery() {
  var $product = $('.js-product-wrapper');

  var $galleryThumbs = $('.js-gallery-thumbs');
  var $galleryMain = $('.js-product-gallery-main');
  var $galleryTriggers = $galleryThumbs.find('.js-gallery-trigger');

  if ($galleryThumbs.length) {
    var ThumbsSwiper = new Swiper($galleryThumbs, {
      slidesPerView: 5,
      breakpoints: {
        0: { slidesPerView: 2 },
        480: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1980: { slidesPerView: 5 },
      },
      spaceBetween: 10,
      initialSlide: 0,
      centeredSlides: false,
      nextButton: '.js-gallery-thumbs-next',
      prevButton: '.js-gallery-thumbs-prev',

      touchRatio: 0.2,
      slideToClickedSlide: true,
      loop: false,
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
        dynamicBullets: true,
      },
      breakpoints: {
        768: { paginationClickable: true },
      },
      onSlideChangeEnd: function (e) {
        $galleryTriggers.not(':eq(' + e.activeIndex + ')').removeClass('active');
        $galleryTriggers.eq(e.activeIndex).addClass('active');
        $galleryThumbs[0].swiper.slideTo(e.activeIndex);
      },
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

function copySrc(self) {
  var src = $(self).attr('data-image-large');
  var href = $(self).attr('href');
  var title = $(self).attr('title');
  var count = $(self).attr('data-gallery-count');

  $(self).parent().siblings().find('a').removeClass('is-checked');
  $(self).addClass('is-checked');

  $('#gallery')
    .attr({
      href: href,
      title: title,
      'data-gallery-count': count,
    })
    .find('img')
    .attr({
      src: src,
      alt: title,
    });
}

// Добавляет в сессию id товаров, в которые мы заходили
(function () {
  if (Site.template !== 'product') {
    return;
  }
  var find_it = true;
  var product_id = $('.product-control').attr('data-compare');

  localforage.getItem('view_array').then(function (temp_view) {
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
      1024: { slidesPerView: 3 },
    },
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
      1100: { slidesPerView: 2 },
    },
    onSlideChangeEnd: function () {
      $('.product-slider img.lazy').each(function (index) {
        $(this).lazyload();
      });
    },
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

    var currentSlide = $('[data-slider="gallery-thumbs"]').find('[href="' + variant.first_image.original_url + '"]');

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

    Products.get(product_id).done(function (product) {
      select_variant = _.find(product.variants, function (variant) {
        return href == variant.first_image.original_url;
      });

      if (!select_variant) {
        return;
      }
      Products.getInstance($('.product-form')).done(function (_product) {
        return _product.variants.setVariant(select_variant.id);
      });
    });
  });

  // Find main-image in fancybox gallery, and emulate click on fancybox
  $(document).on('click', '#gallery', function (event) {
    event.preventDefault();

    var count = $('#gallery').attr('data-gallery-count');

    $('.mobile-wrapper')
      .find('[data-slide-number="' + count + '"]')
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
  $quickCheckout.hide().prop('disabled', true);
  $buyCredit.hide().prop('disabled', true);

  $priceCurrent.html(Shop.money.format(variant.action.price));

  $priceCurrent.data('price-summ', $priceCurrent.data('price') * $quantity);

  $priceCurrent.data('price-summ', variant.action.price);

  if (_.toFinite(variant.old_price) > _.toFinite(variant.price)) {
    $priceCurrent.addClass('is_discount');
  } else {
    $priceCurrent.removeClass('is_discount');
  }
  $priceOld.html(Shop.money.format(_.toFinite(variant.old_price) > _.toFinite(variant.price) ? variant.old_price : null));
  if (variant.sku) {
    $skuWrapper.show();
    $sku.text(variant.sku);
  } else {
    $skuWrapper.hide();
  }

  if (variant.available) {
    $buttonBuy.show();
    $quantity.show();
    $available.show();
    $quickCheckout.show().prop('disabled', false);
    //маска
    $('#quick_checkout_form').find('#client_phone').inputmask('+7(999)999-99-99');
    $('#quick_checkout_form').find('#client_email').inputmask('email');
    $buyCredit.show().prop('disabled', false);
  } else {
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
        $quickCheckout.show().prop('disabled', false);
        $buyCredit.show().prop('disabled', false);
        break;
    }
  }

  // Обновляем информацию о доставке
  setDeliveryInfo($.cookie('geoRuCountry').split('|')[1], $.cookie('geoRuCountry').split('|')[0]);
});

EventBus.subscribe('change_quantity:insales:product', function (variant) {
  if (!variant.action.product.is('[data-main-form]')) {
    return;
  }

  var $product = variant.action.product;
  var $priceCurrent = $product.find('.js-product-price');
  var $quantity = $product.find('[name="quantity"]');
  $priceCurrent.attr('data-price-summ', $priceCurrent.data('price') * $quantity.val());

  // Обновляем информацию о доставке
  setDeliveryInfo($.cookie('geoRuCountry').split('|')[1], $.cookie('geoRuCountry').split('|')[0]);
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
          value: Site.messages.preorder,
        },
        {
          type: 'hidden',
          name: 'subject',
          value: Site.messages.preorder,
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
      combineOrder: { content: { fields: ['preorder_caption', 'product', 'variant'] } },
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
    _discountElement.text(_.round(_discount, 0) + '%').removeClass('hidden');
  } else {
    _discountElement.addClass('hidden');
  }
});

(function () {
  if (Site.template !== 'product') {
    return;
  }

  $('.js-go_to').on('click', function () {
    $('.tabs__nav > li.active').removeClass('active');
    $('.tab-pane.active').removeClass('active');
    $('#tab_reviews').addClass('active');
    $('#tab-reviews').addClass('active');
    $('html,body').animate({ scrollTop: $(`.tabs__header`).offset().top }, 500);
  });
})();
(function () {
  if (Site.template == 'article') {
    new Swiper('[data-slider="article-related-products"]', {
      slidesPerView: 4,
      spaceBetween: 24,

      breakpoints: {
        380: {
          slidesPerView: 1,
        },
        480: {
          slidesPerView: 2,
        },
        640: {
          slidesPerView: 3,
        },
        1024: {
          slidesPerView: 3,
        },
      },
    });
  }
})();
// Для удобства вызова события можно добавить метод jQuery
if (typeof $.fn.triggerCustom !== 'function') {
  $.fn['triggerCustom'] = function (type, data, options) {
    if (options == null) {
      options = {};
    }
    options = $.extend(
      {},
      {
        bubbles: true,
        cancelable: true,
        detail: data,
      },
      {
        bubbles: options.bubbles,
        cancelable: options.cancelable,
      }
    );
    return this.each(function () {
      var e;
      e = new window.CustomEvent(type, options);
      return this.dispatchEvent(e);
    });
  };
}

/******************************************/
/*                                        */
/*            Виджет корзины              */
/*                                        */
/******************************************/
EventBus.subscribe('update_items:insales:cart', function (data) {
  var $widgetCardTotalSumm = $('.js-widget-card-total-summ');
  var $widgetCardTotalCount = $('.js-widget-card-total-count');

  $widgetCardTotalSumm.html(Shop.money.format(data.items_price));
  $widgetCardTotalCount.html(data.items_count);

  if (data.items_count > 0) {
    $widgetCardTotalCount.addClass('active');
  } else {
    $widgetCardTotalCount.removeClass('active');
  }

  if (data.items_count == 0) {
    var items_title = 'Товаров';
  } else if (data.items_count == 1) {
    var items_title = 'Товар';
  } else if (data.items_count > 1 && data.items_count < 5) {
    var items_title = 'Товара';
  } else if (data.items_count >= 5) {
    var items_title = 'Товаров';
  }

  if (data.order_lines.length == 0) {
    $('.js-cart-widget-empty').addClass('hidden');
    $('.js-cart-empty').removeClass('hidden');
    $('.cart-widget-dropdown').addClass('empty-cart');
  } else {
    $('.js-cart-widget-empty').removeClass('hidden');
    $('.js-cart-empty').addClass('hidden');
    $('.cart-widget-dropdown').removeClass('empty-cart');
  }
});

$('.js-widget-dropdown').hover(
  function () {
    $('.cart-widget-dropdown').removeClass('hidden');
    setTimeout(function () {
      $('.cart-widget-dropdown').css('opacity', '1');
    }, 20);
  },
  function () {
    $('.cart-widget-dropdown').addClass('hidden').css('opacity', '0');
  }
);

/******************************************/
/*                                        */
/*           Логика в корзине             */
/*                                        */
/******************************************/
var $cartItemsPrice = $('.js-cart-items-price'); // Стоимость позиций товара в сайбаре
var $cartItemsCount = $('.js-cart-items-count'); // Количество позиций товара в сайбаре
var $cartTotalPrice = $('.js-cart-total-price'); // Общая стоимость с учетом скидки
var $discountComment = $('#js-discount-comment');
var $discountBlock = $('#discounts-block');
var $discountBlockFooter = $('#order_complete #discounts-block');
var $discountNotices = $('#js-discount-notices');
var $cartItemsDiscountPrice = $('.js-cart-items-discount-price'); // Скидка по товарам
var $cartItemsDiscountPercent = $('.js-cart-items-discount-percent'); // Процент скидки по товарам

// Пересчет цены на позиции товара в корзины и саму корзину
EventBus.subscribe('update_items:insales:cart', function (data) {
  if (Site.template != 'cart') {
    return false;
  }
  var old_prices = 0;

  // Обновляем цены позиций заказа
  var order_lines = data.order_lines.reduce(function (acc, n) {
    return (acc[n.id] = n), acc;
  }, {});
  var old_prices = 0;

  for (var key in order_lines) {
    // Получаем сумму скидки по товарах
    var currentVariant = order_lines[key].product.variants.find(function (variant) {
      return variant.id == order_lines[key].variant_id;
    });

    if (currentVariant.old_price && currentVariant.old_price != 'null' && currentVariant.old_price != null) {
      old_prices = old_prices + currentVariant.old_price * order_lines[key].quantity;
    } else {
      old_prices = old_prices + currentVariant.price * order_lines[key].quantity;
    }
  }

  $cartItemsPrice.html(Shop.money.format(data.items_price));
  $cartItemsCount.html(data.items_count);
  $cartTotalPrice.html(Shop.money.format(data.total_price));
  if (old_prices > data.items_price) {
    $cartItemsDiscountPrice.closest('.order-item').show();
    $cartItemsDiscountPrice.html(Shop.money.format(data.items_price - old_prices));
    $cartItemsDiscountPercent.html('(-' + Math.round(((old_prices - data.items_price) * 100) / old_prices) + '%)');
  } else {
    $cartItemsDiscountPrice.closest('.order-item').hide();
  }
});

// пересчет актуальной цены за товар и общей стоимости позиции
/*EventBus.subscribe('update_variant:insales:item', function (data) {
      if (Site.template != 'cart') {
        return false;
      }

      var $item = data.action.product;
      var $price = $item.find('.js-item-price');
      var $total = $item.find('.js-item-total-price');
      var total = data.action.price * data.action.quantity.current;

      $price.html(Shop.money.format(data.action.price));
      $total.html(Shop.money.format(total));
    });*/

// Выводим список применившихся скидок
EventBus.subscribe('update_items:insales:cart', function (data) {
  if (Site.template != 'cart') {
    return false;
  }

  // Обновляем цены позиций заказа
  var order_lines = data.order_lines.reduce(function (acc, n) {
    return (acc[n.id] = n), acc;
  }, {});

  for (var key in order_lines) {
    $('[data-item-id="' + key + '"]')
      .find('.js-item-total-price')
      .html(Shop.money.format(order_lines[key].total_price));
  }

  // Скидки
  $('.js-discount-comment-list').html(Template.render(data, 'cart-discounts'));
});

/******************************************/
/*                                        */
/*         Логика чекаут + корзина        */
/*                                        */
/******************************************/
// Скролл для сайдбара
$(document).scroll(function () {
  if ($('#checkout-sidebar').length > 0) {
    let $sidebar = $('.checkout-sidebar-wrapper'),
      $sidebarHeight = $sidebar.innerHeight(),
      $sidebarWidth = $sidebar.width(),
      $sidebarBlock = $('#checkout-sidebar'),
      $sidebarBlockTop = $sidebarBlock.offset().top,
      $footer = $('.js-footer'),
      $footerTop = $footer.offset().top,
      $scrollTop = $(document).scrollTop(),
      $carIElem = $('.cart-items-page'),
      $carIElemHeight = $carIElem.innerHeight();
    // console.log('🦆-----------------------⬇️⬇️⬇️-----------------------🦆');
    // console.log('footerTop: ', $footerTop);
    // console.log('$sidebarHeight + $scrollTop + ($sidebarHeight/3): ', $sidebarHeight + $scrollTop + ($sidebarHeight/3));
    // console.log('$sidebarHeight: ', $sidebarHeight);
    // console.log('$sidebarNewHeight: ', $sidebarNewHeight);
    // console.log('---------------------------------------------------------');
    if ($(document).innerWidth() > 1024 && $sidebarHeight < $carIElemHeight) {
      $sidebarBlock.toggleClass('checkout-sidebar--stable', $scrollTop <= $sidebarBlockTop - 75);
      $sidebarBlock.toggleClass('checkout-sidebar--sticky', $scrollTop >= $sidebarBlockTop - 75);
      $sidebarBlock.toggleClass(
        'checkout-sidebar--absol',
        $footerTop <= $sidebarHeight + $scrollTop + $sidebarHeight / 3
      );

      if ($(document).innerWidth() > 1024) {
        // $sidebar.width($sidebarWidth);
        $('#checkout-sidebar').toggleClass('checkout-sidebar--sticky', $scrollTop >= $sidebarBlockTop - 75);
        $('#checkout-sidebar').toggleClass('checkout-sidebar--absol', $footerTop <= $sidebarHeight + $scrollTop + 335);
      } else {
        $('#checkout-sidebar').removeClass('checkout-sidebar--sticky');
        $('#checkout-sidebar').removeClass('checkout-sidebar--absol');
      }
    }
  }
});

// Удаляем позицию
EventBus.subscribe('delete_items:insales:cart', function (data) {

  if (data.action.button) {
    var $button = data.action.button;
    var $cartItem = $button.closest('.cart-item');

    $cartItem.slideUp(300, function () {
      $(this).remove();

      /* ODX-3434 */
      if (Site.template == 'cart' || Site.template == 'checkout') {
        checkProductsInCart(data.order_lines);
      }

      if (Site.template == 'cart') {
        var $emptyMessage = $('.js-cart-empty');
        var $cartForm = $('[data-cart-form]');
        if (data.order_lines.length == 0) {
          $cartForm.addClass('hidden');
          $emptyMessage.removeClass('hidden');
        }
      }
    });
  }

  // Если корзина пустая, переходив в корзину / обновляем странциу
  if (data.items_count < 1) {
    setTimeout(function () {
      $(location).attr('href', '/cart_items');
      return false;
    }, 1000);
  }
});

/**************************************/
/*     Подарок в товарной позиции     */
/**************************************/
$(function () {
  if (cart_enable_gift == '1' && cart_is_gift_handle && cart_gift_handle) {
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }

    // добавление подарка при добавлении товара
    EventBus.subscribe('add_items:insales:cart', function (data) {
      var productsObj = data;
      $.each(data.order_lines, function (index, order_line) {
        productsObj.order_lines[index].product = productParameters(order_line.product);
      });

      // Если добавленный товар сопровождается подарком, добавляем подарок
      var added_item = Object.keys(productsObj.action.items);
      var added_product = productsObj.order_lines.find((item) => item.id == added_item[0]); // Позиция, которая добавлена в корзину
      if (added_product.product.parameters[cart_gift_handle]) {
        $.each(added_product.product.parameters[cart_gift_handle].characteristics, function (index, gift) {
          Cart.set({
            items: _defineProperty({}, gift.permalink, 1),
            comments: _defineProperty({}, gift.permalink, 'GIFT'),
          });
        });
      }
    });

    // Удаление подарка при удалении товара
    EventBus.subscribe('delete_items:insales:cart', function (data) {
      var productsObj = data;
      $.each(data.order_lines, function (index, order_line) {
        productsObj.order_lines[index].product = productParameters(order_line.product);
      });

      // После удаления товара, проверяем все товары и вытягиваем список подарков, которые могут находиться в корзине
      var allowed_gifts = [];
      $.each(productsObj.order_lines, function (index, order_line) {
        if (order_line.product.parameters[cart_gift_handle]) {
          $.each(order_line.product.parameters[cart_gift_handle].characteristics, function (index, gift) {
            allowed_gifts.push(gift.permalink);
          });
        }
      });

      // Проходимся по товарам и всеряем список с массивом подарков, которые могут находиться в корзине
      // Если есть подарок который не может находиться в корзине, удаляем его
      $.each(productsObj.order_lines, function (index, order_line) {
        if (order_line.product.parameters[cart_is_gift_handle]) {
          if (allowed_gifts.indexOf(order_line.product.variants[0].id + '') == -1) {
            Cart.delete({ items: [order_line.product.variants[0].id] });
            $('[data-item-id="' + order_line.product.variants[0].id + '"]').remove();
          }
        }
      });
    });

    // Перебираем позиции в корзине и перемещаем подарки вниз
    $('[data-is-gift="true"]').each(function () {
      if (cart_gift_settings.move_down == '1') $('.cart-list').append($(this));
      if (cart_gift_settings.lock_change == '1') {
        $(this)
          .find('[name="cart[quantity][' + $(this).data('variant-id') + ']"]')
          .attr('disabled', 'disabled');
        $(this).find('[data-quantity-change]').attr('disabled', 'disabled');
      }
      if (cart_gift_settings.lock_delete == '1') {
        $(this).find('[data-item-delete]').attr('disabled', 'disabled');
      }
    });
  }
});

/*****************************************************/
/*                                                   */
/*    Кастомный скрипт, для изменения количеств      */
/*                                                   */
/*****************************************************/
$(
  (function () {
    // Кастомный скрипт, для изменения количества позиций состава корзины (каунтер, +-) с заждержкой
    // Например если 10 раз кликнуть по +, т овсе запросы обычно летят очередью, т.е. 10 запросов
    // В нашем случае срабатывает таймер 1 секунда. Если в течении 1 секунды не менялось количество,
    // то скрипт получает актуальное количество и выполняет ОДИН запрос к корзине, меняя ее состав
    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
      } else {
        obj[key] = value;
      }
      return obj;
    }
    var initCardQuantity = function () {
      var timerId;
      $(document)
        .off('click', '[data-quantity-change-custom]')
        .on('click', '[data-quantity-change-custom]', function () {
          var item_id = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').data('item-id');
          var current_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').val();
          var new_quantity = current_quantity * 1 + $(this).data('quantity-change-custom');
          var max_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').attr('max') * 1;

          if (new_quantity < 1) {
            $('[name="cart[quantity-custom][' + item_id + ']"]').val(1);
            new_quantity = 1;
          } else if (new_quantity > max_quantity) {
            $('[name="cart[quantity-custom][' + item_id + ']"]').val(max_quantity);
            new_quantity = max_quantity;
          } else {
            $('[name="cart[quantity-custom][' + item_id + ']"]').val(new_quantity);
          }

          // Блокируем кнопки +- если минимальное или максимальное количество товара
          if (new_quantity <= 1 && new_quantity >= max_quantity) {
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
          } else if (new_quantity <= 1) {
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
          } else if (new_quantity >= max_quantity) {
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
          } else {
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
          }

          clearTimeout(timerId);
          timerId = setTimeout(function () {
            Cart.set({
              items: _defineProperty({}, item_id, new_quantity),
            });
            console.log('done');
          }, 1000);
        });

      $(document)
        .off('click', '.js-item-quantity')
        .on('change', '.js-item-quantity', function () {
          var item_id = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').data('item-id');
          var new_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').val();
          var max_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').attr('max') * 1;

          if (new_quantity < 1) {
            $('[name="cart[quantity-custom][' + item_id + ']"]').val(1);
            new_quantity = 1;
          } else if (new_quantity > max_quantity) {
            $('[name="cart[quantity-custom][' + item_id + ']"]').val(max_quantity);
            new_quantity = max_quantity;
          } else {
            $('[name="cart[quantity-custom][' + item_id + ']"]').val(new_quantity);
          }

          // Блокируем кнопки +- если минимальное или максимальное количество товара
          if (new_quantity <= 1 && new_quantity >= max_quantity) {
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
          } else if (new_quantity <= 1) {
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
          } else if (new_quantity >= max_quantity) {
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
          } else {
            $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
            $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
          }

          clearTimeout(timerId);
          timerId = setTimeout(function () {
            Cart.set({
              items: _defineProperty({}, item_id, new_quantity),
            });
            console.log('done');
          }, 1000);
        });
    };
    initCardQuantity();
  })()
);

// Фикс промокода
$('.discount-input').on('.discount-input keyup', function (e) {
  // нажатие на кнопку "применить"
  if ($('.discount-input').val() == '') {
    $('.discount-button').click(function () {
      $('.discount-input').val(' ');
    });
  }
});

$('.discount-input').keydown(function (e) {
  // нажатие на Enter
  if (e.keyCode == 13) {
    if ($('.discount-input').val() == '') {
      $('.discount-input').val(' ');
    }
  }
});

/*****************************************************/
/*                                                   */
/*            Удаление/добавление купонов            */
/*                                                   */
/*****************************************************/
$(
  (function () {
    // Добавление купона
    $('[data-coupon-submit]').on('click', function (event) {
      event.preventDefault();
      var coupon = $('.discount-input').val();
      var fields = 'cart[coupon]=' + coupon;
      var path = '/cart_items.json';
      $.ajax({
        url: path,
        type: 'post',
        data: fields,
        dataType: 'json',
        success: function ($data) {
          if ($data.errors.length > 0) {
            var coupon = ' ';
            var fields = 'cart[coupon]=' + coupon;
            var path = '/cart_items.json';
            $.ajax({
              url: path,
              type: 'post',
              data: fields,
              dataType: 'json',
              success: function ($data) {
                $('.formPromo__title-error').show();
              },
            });
            $('[data-coupon-remove]').show();
            $('[data-coupon-submit]').hide();
            return false;
          } else {
            $('.formPromo__title-error').show();
            if ($('.discount-input').val() != '') {
              Cart.add({
                coupon: $('.discount-input').val(),
              });
              $('.formPromo__title-error').hide();
              if ($('.discount_price_new .co-basket_subtotal-title').html()) {
                $('.discount_price_new').show();
              } else {
                $('.discount_price_new').hide();
              }
              $('[data-coupon-remove]').show();
              $('[data-coupon-submit]').hide();
            }
          }
        },
      });
      return false;
    });

    // Очистка купона
    $('[data-coupon-remove]').on('click', function (event) {
      Cart.add({
        coupon: ' ',
      });
      $('.discount-input').val('');
      $('.discount_price_new').hide();
      $('[data-coupon-remove]').hide();
      $('[data-coupon-submit]').show();
    });

    // Прослушиватель купона
    $(document).on('set_coupon:insales:cart', function (e) {
      if ($('.discount_price_new .co-basket_subtotal-title').html()) {
        $('.discount_price_new').show();
      } else {
        $('.discount_price_new').hide();
      }
    });
  })()
);
$(function () {
  var $pass = $('#contacts #client_password, #contacts #client_password_confirmation, #contacts #client_old_password');
  $('[name="client[change_password]"]').on('change', function () {
    if (this.checked) {
      $('#change_password_fields').show();
      $pass.prop('disabled', '');
    } else {
      $('#change_password_fields').hide();
      $pass.prop('disabled', true);
    }
  });

  $('#delivery_address .field, #checkout_buyer_fields .field').each(function () {
    var $field = $(this);

    if ($field.find('input[type="checkbox"]').length) {
      $field.addClass('is-checkbox');
    }
  });

  $('.field.is-checkbox').each(function () {
    var $field = $(this);
    $field.find('.small').appendTo($field);
  });

  $('.field-content.small').removeClass('small');
});
(function () {
  $('.js-open-filter').on('click', function () {
    alertify.panel({
      target: $('[data-modal="collection-filter"]').html(),
      position: 'left',
      onOpen: function (modal) {
        InSalesUI.Filter.create($(modal));
      },
    });
  });
})();

$('body').on('click', '[data-item-add]', function (e) {
  if ($(this).data('reload') == true) {
    setTimeout(function () {
      $(location).attr('href', '/cart_items');
    }, 500);
  } else {
    $.magnificPopup.open({
      items: {
        src: '#thx',
      },
      type: 'inline',
    });
  }
});

(function () {
  if (Site.template != 'collection') {
    return;
  }

  var _reviewsOption = {
    slidesPerView: 4,
    spaceBetween: 16,
    breakpoints: {
      380: {
        slidesPerView: 1,
      },
      480: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
      },
    },
  };

  // Просмотренные товары рендер
  $(function () {
    localforage.getItem('view_array').then(function (temp_array) {
      if (temp_array == null || temp_array == 'undefined') {
        return false;
      }

      Products.getList(temp_array).done(function (products) {
        var _products = _.reduce(
          temp_array,
          function (result, id) {
            result.push(products[id]);

            return result;
          },
          []
        );

        $('.js-view-products').html(Template.render(_products, 'view_products'));

        $('[data-slider="reviews-products"]').each(function () {
          new Swiper(this, _reviewsOption);
        });
      });
    });
  });
})();

/*
 * SORT
 */
$('.js-sort').find('.collection-order-item_title').html($('[name="order"] option:selected').html());

$(document).on('click', '.js-sort .collection-order-item_title', function (event) {
  event.preventDefault();

  if ($(this).parent().hasClass('active')) {
    $(this).parent().removeClass('active');
  } else {
    $(this).parent().addClass('active');
  }
});

$(document).mouseup(function (event) {
  event.preventDefault();
  var dqv = $('.js-sort');
  if (!dqv.is(event.target) && dqv.has(event.target).length === 0) {
    dqv.removeClass('active');
  }
});

$(document).on('click', '.js-sort-item', function (event) {
  event.preventDefault();
  $('.js-sort').removeClass('active');
  var current_order = $('.js-sorting [name="order"] option:selected').val();
  var order = $(this).attr('data-order');
  var order_descending = $(this).attr('data-order-descending');

  $('.js-sort-item').each(function (index) {
    $(this).removeClass('descending');
  });

  $('.js-sorting [name="order"] option').attr('selected', false);
  $('.js-sorting [name="order"] option[value=' + order + ']').attr('selected', true);

  if (order_descending == 'true') {
    $('.js-sort').addClass('descending');
  } else {
    $('.js-sort').removeClass('descending');
  }

  var $form = $('.js-sorting');
  sendFilter($form, $form);

  $('.js-sort').removeClass('active');
});

/************************************/
/*          ВИД ЛИСТИНГА            */
/************************************/
function collection_view() {
  if ($.cookie('view_state') == 'list') {
    $('.collection-listing-type').find('.list').addClass('active');
    $('.collection-listing-type').find('.grid').removeClass('active');
    $('.products-items_list').addClass('active');
    $('.products-items_grid').removeClass('active');
  } else {
    $('.collection-listing-type').find('.grid').addClass('active');
    $('.collection-listing-type').find('.list').removeClass('active');
    $('.products-items_list').removeClass('active');
    $('.products-items_grid').addClass('active');
  }

  $('.collection-listing-type__item').click(function (e) {
    e.preventDefault();
    if (!$(this).hasClass('active')) {
      if ($('.collection-listing-type').find('.grid').hasClass('active')) {
        $('.collection-listing-type').find('.grid').removeClass('active');
        $('.collection-listing-type').find('.list').addClass('active');
        $('.products-items_list').addClass('active');
        $('.products-items_grid').removeClass('active');
        $.cookie('view_state', 'list');
      } else {
        $('.collection-listing-type').find('.list').removeClass('active');
        $('.collection-listing-type').find('.grid').addClass('active');
        $('.products-items_list').removeClass('active');
        $('.products-items_grid').addClass('active');
        $.cookie('view_state', 'grid');
      }
    }
  });

  $('[data-ajax] img.lazy').each(function (index) {
    $(this).lazyload();
  });
}
collection_view();

$(window).on('load resize', function () {
  if ($(window).width() < 768) {
    $('.collection-listing-type').find('.list').removeClass('active');
    $('.collection-listing-type').find('.grid').addClass('active');
    $('.products-items_list').removeClass('active');
    $('.products-items_grid').addClass('active');
    $.cookie('view_state', 'grid');
  }
});

/************************************/
/*     ФУНКЦИЯ ФИЛЬТРАЦИИ           */
/************************************/
$('.filter__item__block').each(function (index) {
  if ($(this).html() < 30) {
    $(this).remove();
  }
});

if ($('[data-filter]').serialize()) {
  $('[data-filter-clear]').show();
  $('.filter__bottom').show();
} else {
  $('[data-filter-clear]').hide();
  $('.filter__bottom').hide();
}

function sendFilter($form, $source) {
  if (!$form.hasClass('collection-filter')) {
    return false;
  }

  $.ajax({
    type: 'GET',
    url: $form.attr('action'),
    dataType: 'html',
    data: $form.serialize(),
    beforeSend: function () {},
    success: function (result) {
      var allProducts = $(result).find('[data-ajax]').html();
      var allPagination = $(result).find('.pages-navbar').html();
      $('[data-ajax]').html(allProducts);
      $('.js-sorting').html($(result).find('.js-sorting').html());
      $('.js-filtersCount').html($(result).find('.js-filtersCount').html());

      if ($('[data-filter]').serialize()) {
        $('[data-filter-clear]').show();
        $('.filter__bottom').show();
      } else {
        $('[data-filter-clear]').hide();
        $('.filter__bottom').hide();
      }

      var redUrl = $form.serialize();
      window.history.pushState('object or string', 'Title', '?' + redUrl);

      $('.js-sort').find('.collection-order-item_title').html($('[name="order"] option:selected').html());

      $('[data-ajax] img.lazy').each(function (index) {
        $(this).lazyload();
      });

      collection_view();

      if ($form.serialize()) {
        $('[data-filter-clear]').show();
      } else {
        $('[data-filter-clear]').hide();
      }
    },
  });
}

$(document).on('change', '.js-filter-trigger', function (event) {
  var $form = $(this).parents('form:first');
  sendFilter($form, $(this));
});

function toggleCompare(same_row) {
  if (same_row) {
    $('.js-compare-table .same-row').hide();
  } else {
    $('.js-compare-table .same-row').show();
  }
}

EventBus.subscribe('update_items:insales:compares', function (data) {
  $('.js-compares-widget-count').html(data.products.length);
  if (data.products.length > 0) {
    $('.js-compares-widget-count').show();
  } else {
    $('.js-compares-widget-count').hide();
  }
});

EventBus.subscribe('update_items:insales:compares', function (data) {
  var $product = $('[data-product-id="' + data.action.item + '"]');
  var productId = $product.data('product-id');
  var $compareAdd = $product.find('.js-compare-add');
  var $compareDelete = $product.find('.js-compare-delete');

  var inCompare = _.find(data.products, function (product) {
    return product.id == productId;
  });

  if (inCompare) {
    $compareAdd.hide();
    $compareDelete.show();
  } else {
    $compareAdd.show();
    $compareDelete.hide();
  }
});
EventBus.subscribe('remove_item:insales:compares', function (data) {
  if (Site.template != 'compare') {
    return false;
  }

  $('[data-compared-id="' + data.action.item + '"]').remove();

  if (data.products.length == 0) {
    $('#js-compare-inner').hide();
    $('.js-compare-empty').removeClass('hidden');
  }
});

$(function () {
  var compareWrapper = '#js-compare-wrapper';
  var compareInner = '#js-compare-inner';
  var same_row = false;

  localforage.setItem('same_row', '0');
  $(document).on('click', '.js-same-toggle', function (event) {
    var action = $(this).data('action');
    $(this).parent().find('li').removeClass('active');
    $(this).addClass('active');
    console.log(action);

    $(this).find('.link-text').toggleClass('hide').toggleClass('show');
    same_row = !same_row;

    // localforage.setItem('same_row', same_row);
    console.log('Function before setTimeout! ' + same_row);
    toggleCompare(same_row);
  });

  EventBus.subscribe('update_items:insales:compares', function (data) {
    if (Site.template != 'compare') {
      return false;
    }
    if (data.products.length < 1) {
      return false;
    }

    var _now = new Date().getTime();
    var _url = '?' + _now;
    var _getNode = _url + compareWrapper + ' ' + compareInner;

    $(compareWrapper).load(_getNode, function () {
      if ($('.js-compare-table .same-row').length && data.products.length > 1) {
        $('.compare-toolbar').removeClass('hidden');
        setTimeout(function () {
          if (same_row) {
            $('.js-same-toggle').find('.link-text').toggleClass('hide').toggleClass('show');
          }
          console.log('Function after setTimeout! ' + same_row);
          toggleCompare(same_row);
        }, 0);
      } else {
        $('.compare-toolbar').addClass('hidden');
      }
    });
  });
});

/* Checking the serial number */
$(document).ready(function () {
  // console.log('Site.template: ', Site.template);

  if (Site.template != 'page') {
    return false;
  }

  let field = $('.js-form-block-filed');
  let button = $('.js-form-block-send');
  let clear = $('.js-form-block-filed-clear');
  let success = $('.js-form-block-success');
  let error = $('.js-form-block-error');

  clearField();

  field.on('input', function (e) {
    e.target.value.length > 0 ? clear.show() : clear.hide();
    e.target.value.length >= 10 ? button.prop('disabled', false) : button.prop('disabled', true);
  });
  field.on('keydown', function (e) {
    if (e.keyCode == 13) {
      if (field.val() == '') return false;
      e.preventDefault();
      checkSerial(field.val());
    }
  });

  clear.on('click', () => clearField());

  button.on('click', function (e) {
    if (field.val() == '') return false;
    e.preventDefault();
    success.hide();
    error.hide();
    checkSerial(field.val());
  });

  function checkSerial(data) {
    const settings = {
      url: 'https://ias.omnicrm.ru/seriapks/',
      method: 'POST',
      timeout: 0,
      headers: {
        Authorization: 'Basic eWFuZGV4OnlhbmRleDE1MjQh',
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        СерийныйНомер: data,
      }),
    };

    try {
      $.ajax(settings).done(function (response) {
        console.log('response: ', response);
        if (response == 'false') {
          success.hide();
          error.show();
          button.prop('disabled', true);
        }
        if (response == 'true') {
          error.hide();
          success.show();
          button.prop('disabled', true);
        }
      });
    } catch (error) {
      console.error('An error occurred: ', error);
    }
  }
  function clearField() {
    field.val('');
    button.prop('disabled', true);
    clear.hide();
    success.hide();
    error.hide();
  }
});

/* ODX-3434 */
function checkProductsInCart(items) {
  const defaultPhone = account_phone || '+7 499 990 61 21';
  const defaultPhonelink = `tel:${defaultPhone.replace(/\s/gm, '')}` || 'tel:+7 499 990 61 21';
  const hasSpecialProduct = items.some(({ product: { canonical_url_collection_id } }) => canonical_url_collection_id === 46708225);
  const $phoneHeader = $('.top_phone a');
  const $phoneHeaderText = $('.top_phone a span');
  const $phoneFooter = $('.footer__contacts__phone .phone a');

  if (!hasSpecialProduct) {
    $phoneHeader.attr('href', defaultPhonelink);
    $phoneHeaderText.text(defaultPhone);
    $phoneFooter.attr('href', defaultPhonelink);
    $phoneFooter.text(defaultPhone);
  }
};
