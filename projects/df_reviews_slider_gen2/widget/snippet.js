/**
 * DanForge Reviews Yandex — gen-2 widget (slider + list)
 * @handle danforge_reviews_slider_g2
 */
(function () {
  var ROOT = '[data-df-reviews-root]';

  function boot() {
    document.querySelectorAll(ROOT).forEach(initWidget);
    document.addEventListener('keydown', onEscape);
  }

  function parseBool(value, fallback) {
    if (value === true || value === 'true' || value === '1' || value === 1) return true;
    if (value === false || value === 'false' || value === '0' || value === 0) return false;
    return fallback;
  }

  function parseMinRating(value) {
    var n = parseInt(value, 10);
    if (!isNaN(n)) return n;
    var m = String(value || '').match(/[0-5]/);
    return m ? parseInt(m[0], 10) : 0;
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function getShell(root) {
    return root.closest('.df-reviews');
  }

  function getSlides(root) {
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    if (!wrapper) return [];
    return Array.prototype.slice.call(wrapper.querySelectorAll('.df-reviews__slide:not(.df-reviews__slide--empty)'));
  }

  function getVisibleSlides(root) {
    return getSlides(root).filter(function (slide) {
      return !slide.classList.contains('is-hidden') && !slide.classList.contains('df-reviews__slide--mode-limited');
    });
  }

  function parseLayout(value) {
    var v = String(value || '').trim().toLowerCase();
    if (v === 'list' || v.indexOf('лент') >= 0) return 'list';
    return 'slider';
  }

  function whenSwiperReady(cb) {
    if (typeof window.Swiper === 'function') {
      cb();
      return;
    }
    var tries = 0;
    var timer = setInterval(function () {
      tries += 1;
      if (typeof window.Swiper === 'function') {
        clearInterval(timer);
        cb();
      } else if (tries > 40) {
        clearInterval(timer);
      }
    }, 100);
  }

  // Nivona and other gen-2 themes ship Swiper 3.4.2 (media/insales.ui.swiper.js).
  // Modern inSales widget libraries may inject Swiper 8+ — branch configs below.
  var swiperMajorVersion = null;

  function getSwiperMajorVersion() {
    if (swiperMajorVersion !== null) return swiperMajorVersion;
    if (typeof window.Swiper !== 'function') return 0;

    if (window.Swiper.VERSION) {
      var parsed = parseInt(String(window.Swiper.VERSION).split('.')[0], 10);
      swiperMajorVersion = isNaN(parsed) ? 8 : parsed;
      return swiperMajorVersion;
    }

    var params = null;
    var probe = document.createElement('div');
    probe.className = 'swiper-container';
    probe.innerHTML = '<div class="swiper-wrapper"><div class="swiper-slide"></div></div>';
    probe.style.cssText = 'position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(probe);
    try {
      var instance = new window.Swiper(probe, {});
      params = instance.params;
      instance.destroy(true);
    } catch (e) {
      params = window.Swiper.prototype && window.Swiper.prototype.params;
    }
    document.body.removeChild(probe);

    if (params && params.navigation !== undefined && params.nextButton === undefined) {
      swiperMajorVersion = 8;
    } else if (params && (params.nextButton !== undefined || params.prevButton !== undefined)) {
      swiperMajorVersion = 3;
    } else {
      swiperMajorVersion = 8;
    }
    return swiperMajorVersion;
  }

  function buildSwiperConfig(root, opts) {
    var major = getSwiperMajorVersion();
    var paginationEl = root.querySelector('.df-reviews__pagination');
    var nextEl = root.querySelector('.df-reviews__arrow--next');
    var prevEl = root.querySelector('.df-reviews__arrow--prev');
    var config = {
      slidesPerView: opts.mobile,
      spaceBetween: 16,
      speed: opts.speed,
      loop: false,
      breakpoints: {
        640: { slidesPerView: opts.tablet, spaceBetween: 20 },
        992: { slidesPerView: opts.desktop, spaceBetween: 24 }
      }
    };

    if (major < 8) {
      if (paginationEl) {
        config.pagination = paginationEl;
        config.paginationClickable = true;
      }
      if (opts.showArrows) {
        config.nextButton = nextEl;
        config.prevButton = prevEl;
      }
      if (opts.enableAutoplay && opts.slidesCount > 1) {
        config.autoplay = opts.delay;
        config.autoplayDisableOnInteraction = false;
      }
      return config;
    }

    config.watchOverflow = true;
    if (opts.slidesCount > 1) config.rewind = true;
    if (paginationEl) {
      config.pagination = { el: paginationEl, clickable: true };
    }
    if (opts.showArrows) {
      config.navigation = { nextEl: nextEl, prevEl: prevEl };
    }
    if (opts.enableAutoplay && opts.slidesCount > 1) {
      config.autoplay = {
        delay: opts.delay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      };
    }
    return config;
  }

  function destroySwiper(root) {
    if (!root.dfReviewsSwiper) return;
    var major = getSwiperMajorVersion();
    var swiper = root.dfReviewsSwiper;
    root.dfReviewsSwiper = null;
    try {
      if (major < 8) {
        swiper.destroy(true);
      } else {
        swiper.destroy(true, true);
      }
    } catch (e) {
      try {
        swiper.destroy(true);
      } catch (e2) {
        /* Swiper 3.4.2 (nivona insales.ui.swiper.js): destroy(true); v8+ prefers two args */
      }
    }
  }

  function initSlider(root) {
    whenSwiperReady(function () {
      if (root.dfReviewsSwiper) return;
      var slides = getVisibleSlides(root);
      if (!slides.length) return;
      var major = getSwiperMajorVersion();
      var mobile = clamp(parseInt(root.dataset.slidesMobile, 10) || 1, 1, 2);
      var tablet = clamp(parseInt(root.dataset.slidesTablet, 10) || 2, 1, 3);
      var desktop = clamp(parseInt(root.dataset.slidesDesktop, 10) || 3, 1, 4);
      var speed = parseInt(root.dataset.speed, 10) || 400;
      var enableAutoplay = parseBool(root.getAttribute('data-autoplay'), false);
      var delay = parseInt(root.dataset.autoplayDelay, 10) || 5000;
      var showArrows = parseBool(root.getAttribute('data-show-arrows'), true);
      var config = buildSwiperConfig(root, {
        mobile: mobile,
        tablet: tablet,
        desktop: desktop,
        speed: speed,
        enableAutoplay: enableAutoplay,
        delay: delay,
        showArrows: showArrows,
        slidesCount: slides.length
      });
      if (showArrows) {
        root.classList.add('df-reviews__slider--arrows');
      }
      if (major < 8) {
        root.classList.add('swiper-container');
      } else if (!root.classList.contains('swiper')) {
        root.classList.add('swiper');
      }
      root.dfReviewsSwiper = new Swiper(root, config);
    });
  }

  function filterSlides(root) {
    var minRating = parseMinRating(root.getAttribute('data-min-rating'));
    getSlides(root).forEach(function (slide) {
      var rating = parseInt(slide.getAttribute('data-rating'), 10) || 5;
      var ok = minRating <= 0 || rating >= minRating;
      slide.classList.toggle('is-hidden', !ok);
      slide.style.display = ok ? '' : 'none';
    });
  }

  function applyModeLimit(root, layout) {
    var limit;
    var slides;
    var i;
    if (layout === 'list') {
      limit = parseInt(root.getAttribute('data-list-limit'), 10) || 10;
    } else {
      limit = parseInt(root.getAttribute('data-slider-limit'), 10) || 10;
    }
    slides = getSlides(root).filter(function (s) {
      return !s.classList.contains('is-hidden');
    });
    slides.forEach(function (slide, index) {
      var hide = index >= limit;
      slide.classList.toggle('df-reviews__slide--mode-limited', hide);
      if (hide) slide.style.display = 'none';
      else if (!slide.classList.contains('is-hidden')) slide.style.display = '';
    });
  }

  function isTextClamped(el) {
    return el.scrollHeight > el.clientHeight + 2;
  }

  function getSlidePhotoUrls(slide) {
    var raw = slide.getAttribute('data-photo-urls');
    if (!raw) return [];
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }

  function initExpandButtons(root) {
    root.querySelectorAll('.df-reviews__expand').forEach(function (btn) {
      btn.parentNode.removeChild(btn);
    });
    root.querySelectorAll('.df-reviews__text').forEach(function (textEl) {
      var slide = textEl.closest('.df-reviews__slide');
      if (!slide || slide.classList.contains('df-reviews__slide--empty')) return;
      if (!isTextClamped(textEl) && !getSlidePhotoUrls(slide).length) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'df-reviews__expand';
      btn.textContent = 'Читать полностью';
      btn.addEventListener('click', function () {
        openReviewModal(getShell(root), slide);
      });
      textEl.insertAdjacentElement('afterend', btn);
    });
  }

  function openReviewModal(shell, slide) {
    if (!shell || !slide) return;
    var modal = shell.querySelector('[data-df-reviews-modal]');
    var body = shell.querySelector('[data-df-modal-body]');
    if (!modal || !body) return;
    body.innerHTML = slide.innerHTML;
    modal.hidden = false;
    shell.classList.add('is-overlay-open');
  }

  function closeReviewModal(shell) {
    if (!shell) return;
    var modal = shell.querySelector('[data-df-reviews-modal]');
    if (!modal) return;
    modal.hidden = true;
    shell.classList.remove('is-overlay-open');
  }

  function bindModal(shell) {
    if (!shell || shell.dataset.modalReady === 'true') return;
    shell.dataset.modalReady = 'true';
    shell.querySelectorAll('[data-df-modal-close]').forEach(function (node) {
      node.addEventListener('click', function () {
        closeReviewModal(shell);
      });
    });
  }

  function onEscape(event) {
    if (event.key !== 'Escape') return;
    document.querySelectorAll('.df-reviews.is-overlay-open').forEach(function (shell) {
      closeReviewModal(shell);
    });
  }

  function prepareListLayout(root) {
    root.querySelectorAll('.swiper-slide').forEach(function (slide) {
      slide.classList.remove('swiper-slide');
    });
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    if (wrapper) {
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '1rem';
      wrapper.style.maxWidth = '720px';
      wrapper.style.margin = '0 auto';
    }
  }

  function showEmptyIfNeeded(root) {
    if (getVisibleSlides(root).length) return;
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    if (!wrapper) return;
    wrapper.innerHTML =
      '<div class="df-reviews__slide df-reviews__slide--empty">' +
      '<p class="df-reviews__empty">Нет отзывов по выбранным фильтрам</p></div>';
  }

  function initWidget(root) {
    var shell = getShell(root);
    var layout = parseLayout(root.getAttribute('data-layout'));
    bindModal(shell);
    filterSlides(root);
    applyModeLimit(root, layout);
    if (!getVisibleSlides(root).length) {
      showEmptyIfNeeded(root);
      return;
    }
    initExpandButtons(root);
    destroySwiper(root);
    if (layout === 'list') {
      prepareListLayout(root);
    } else {
      initSlider(root);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
