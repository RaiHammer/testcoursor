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
      1024: { slidesPerView: 3 }
    }
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
    }
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
    if ((window.pageYOffset > 250) && (window.innerWidth <= 768)) {
      $('.js-top-panel-fixed').addClass('fixed');
      $('.top-panel-wrapper').addClass('z-index');
    }
    else {
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
    sessionStorage.getItem('send_success') ? val_send = sessionStorage.getItem('send_success') : val_send = 0;

    if (max_send <= val_send) {
      maxSendError();
      $(this).find('.button-widget-feedback')
        .attr('disabled', 'disabled')
        .addClass('is-secondary');

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
