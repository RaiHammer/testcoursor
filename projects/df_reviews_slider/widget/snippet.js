/**

 * DanForge Reviews Slider — виджет inSales (multi-layout)

 * @author DanForge (danforge.ru)

 * @handle danforge_reviews_slider

 */

(function () {

  var ROOT_SELECTOR = '[data-df-reviews-root]';

  var BP_MOBILE = 639;

  var BP_TABLET = 991;

  var escapeBound = false;

  var REFRESH_DEBOUNCE_MS = 150;



  function boot() {

    try {

      bindEscapeClose();

      bindMarqueeResize();

      bindMasonryResize();

      bindResponsiveLayoutResize();

      bindMasonryEditorEvents();

      bindSwiperLateInit();

      document.querySelectorAll(ROOT_SELECTOR).forEach(initWidget);

    } catch (err) {

      if (typeof console !== 'undefined' && console.error) {

        console.error('[df-reviews]', err);

      }

    }

  }



  function bindMarqueeResize() {

    if (typeof window === 'undefined' || window._dfMarqueeResizeBound) return;

    window._dfMarqueeResizeBound = true;

    window.addEventListener('resize', function () {

      document.querySelectorAll(ROOT_SELECTOR).forEach(function (root) {

        if (parseLayout(root.getAttribute('data-layout')) === 'marquee') applyMarqueeSpeed(root);

      });

    });

  }



  function getShell(root) {

    return root.closest('.df-reviews');

  }



  function initOverlays(shell) {

    if (!shell || shell.dataset.overlaysReady === 'true') return;

    shell.dataset.overlaysReady = 'true';



    var modal = shell.querySelector('[data-df-reviews-modal]');

    var lightbox = shell.querySelector('[data-df-reviews-lightbox]');



    if (modal) {

      modal.querySelectorAll('[data-df-modal-close]').forEach(function (node) {

        node.addEventListener('click', function () {

          closeReviewModal(shell);

        });

      });

    }



    if (lightbox) {

      lightbox.querySelectorAll('[data-df-lightbox-close]').forEach(function (node) {

        node.addEventListener('click', function () {

          closeLightbox(shell);

        });

      });

    }



    var formModal = shell.querySelector('[data-df-reviews-form-modal]');

    if (formModal) {

      shell.querySelectorAll('[data-df-reviews-write-btn]').forEach(function (writeBtn) {

        writeBtn.addEventListener('click', function () {

          openReviewFormModal(shell);

        });

      });



      formModal.querySelectorAll('[data-df-form-close]').forEach(function (node) {

        node.addEventListener('click', function () {

          closeReviewFormModal(shell);

        });

      });



      var fileInput = formModal.querySelector('[data-reviews-form-image]');

      var fileLabel = formModal.querySelector('[data-df-review-file-name]');

      if (fileInput && fileLabel) {

        fileInput.addEventListener('change', function () {

          var value = fileInput.value || '';

          var name = value.split('\\').pop().split('/').pop();

          fileLabel.textContent = name || fileLabel.getAttribute('data-default-label') || '';

        });

      }



      bindStarRating(formModal);

    }

  }



  function syncStarRating(container) {

    var rating = container ? container.querySelector('.df-reviews__star-rating') : null;

    if (!rating) return;

    var radios = rating.querySelectorAll('.df-reviews__star-radio');

    var labels = rating.querySelectorAll('.df-reviews__star-label');

    var checked = null;

    var value = 0;

    var i;



    for (i = 0; i < radios.length; i++) {

      if (radios[i].checked) {

        checked = radios[i];

        break;

      }

    }



    value = checked ? parseInt(checked.value, 10) : 0;

    if (isNaN(value)) value = 0;



    for (i = 0; i < labels.length; i++) {

      var starVal = parseInt(labels[i].getAttribute('title') || '0', 10);

      labels[i].classList.toggle('is-active', value > 0 && starVal <= value);

    }

  }



  function bindStarRating(container) {

    var rating = container ? container.querySelector('.df-reviews__star-rating') : null;

    if (!rating || rating.dataset.dfStarReady === 'true') return;

    rating.dataset.dfStarReady = 'true';



    var radios = rating.querySelectorAll('.df-reviews__star-radio');

    var labels = rating.querySelectorAll('.df-reviews__star-label');

    var i;



    for (i = 0; i < radios.length; i++) {

      radios[i].addEventListener('change', function () {

        syncStarRating(container);

      });

    }



    for (i = 0; i < labels.length; i++) {

      labels[i].addEventListener('mouseenter', function () {

        var hoverVal = parseInt(this.getAttribute('title') || '0', 10);

        var j;



        for (j = 0; j < labels.length; j++) {

          var labelVal = parseInt(labels[j].getAttribute('title') || '0', 10);

          labels[j].classList.toggle('is-hover', !isNaN(hoverVal) && labelVal <= hoverVal);

        }

      });

    }



    rating.addEventListener('mouseleave', function () {

      var j;



      for (j = 0; j < labels.length; j++) {

        labels[j].classList.remove('is-hover');

      }

    });



    syncStarRating(container);

  }



  function setOverlayOpen(shell, isOpen) {

    if (!shell) return;

    if (isOpen) {

      shell.classList.add('is-overlay-open');

      bindEscapeClose();

    } else {

      shell.classList.remove('is-overlay-open');

    }

  }



  function openReviewFormModal(shell) {

    var formModal = shell ? shell.querySelector('[data-df-reviews-form-modal]') : null;

    if (!formModal) return;

    formModal.hidden = false;

    setOverlayOpen(shell, true);

  }



  function closeReviewFormModal(shell) {

    var formModal = shell ? shell.querySelector('[data-df-reviews-form-modal]') : null;

    if (!formModal) return;

    formModal.hidden = true;

    var lightbox = shell.querySelector('[data-df-reviews-lightbox]');

    var modal = shell.querySelector('[data-df-reviews-modal]');

    if ((!lightbox || lightbox.hidden) && (!modal || modal.hidden)) {

      setOverlayOpen(shell, false);

    }

  }



  function bindEscapeClose() {

    if (escapeBound) return;

    escapeBound = true;

    document.addEventListener('keydown', function (event) {

      if (event.key !== 'Escape') return;

      document.querySelectorAll('.df-reviews.is-overlay-open').forEach(function (shell) {

        var lightbox = shell.querySelector('[data-df-reviews-lightbox]');

        var modal = shell.querySelector('[data-df-reviews-modal]');

        if (lightbox && !lightbox.hidden) closeLightbox(shell);

        else if (modal && !modal.hidden) closeReviewModal(shell);

        else {

          var formModal = shell.querySelector('[data-df-reviews-form-modal]');

          if (formModal && !formModal.hidden) closeReviewFormModal(shell);

        }

      });

    });

  }



  function parseLayout(value) {
    var raw = String(value == null ? 'slider' : value).trim().toLowerCase();
    var allowed = ['slider', 'masonry', 'grid', 'list', 'spotlight', 'marquee'];
    var i;

    for (i = 0; i < allowed.length; i++) {
      if (raw === allowed[i]) return allowed[i];
    }

    if (raw.indexOf('masonry') !== -1 || raw.indexOf('mason') !== -1 || raw.indexOf('мансори') !== -1 || raw.indexOf('колон') !== -1) return 'masonry';
    if (raw.indexOf('grid') !== -1 || raw.indexOf('сетк') !== -1) return 'grid';
    if (raw.indexOf('list') !== -1 || raw.indexOf('лент') !== -1) return 'list';
    if (raw.indexOf('spotlight') !== -1 || raw.indexOf('крупн') !== -1 || raw.indexOf('фокус') !== -1) {
      return 'spotlight';
    }
    if (raw.indexOf('marquee') !== -1 || raw.indexOf('бегущ') !== -1 || raw.indexOf('строк') !== -1) {
      return 'marquee';
    }
    if (raw.indexOf('slider') !== -1 || raw.indexOf('слайд') !== -1) return 'slider';

    return 'slider';
  }



  function parseTitleAlign(value) {
    var raw = String(value == null ? 'center' : value).trim().toLowerCase();
    if (raw === 'left' || raw.indexOf('left') !== -1 || raw.indexOf('лев') !== -1) return 'left';
    return 'center';
  }



  function parseReviewTextAlign(value) {
    var raw = String(value == null ? 'center' : value).trim().toLowerCase();
    if (raw === 'left' || raw.indexOf('left') !== -1 || raw.indexOf('лев') !== -1) return 'left';
    if (raw === 'right' || raw.indexOf('right') !== -1 || raw.indexOf('прав') !== -1) return 'right';
    return 'center';
  }



  function applyReviewTextAlign(shell, align) {
    var parsed = parseReviewTextAlign(align);

    if (!shell) return parsed;

    shell.style.setProperty('--df-reviews-text-align', parsed);
    setAttrIfChanged(shell, 'data-df-review-text-align', parsed);
    return parsed;
  }



  function settingVarNames(name) {
    return [name, name.replace(/_/g, '-'), name.replace(/-/g, '_')];
  }



  function findWidgetLayout(root) {
    var shell = getShell(root);
    if (!shell) return null;
    return (
      shell.closest('.layout.widget-type_danforge_reviews_slider') ||
      shell.closest('.layout[class*="danforge_reviews"]') ||
      shell.closest('.layout')
    );
  }



  function readCssVar(el, names) {
    if (!el || typeof window === 'undefined' || !window.getComputedStyle) return '';
    var style = window.getComputedStyle(el);
    var i;
    var value;

    for (i = 0; i < names.length; i++) {
      value = style.getPropertyValue('--' + names[i]).trim();
      if (value) return value;
    }

    return '';
  }



  function readShellData(shell, name, fallback) {
    if (!shell) return fallback;
    var camel = name.replace(/-([a-z])/g, function (_, ch) {
      return ch.toUpperCase();
    });
    var value = shell.getAttribute('data-df-' + name) || shell.dataset[camel];
    return value == null || value === '' ? fallback : value;
  }



  function setAttrIfChanged(el, name, value) {
    var next = String(value);
    if (!el || el.getAttribute(name) === next) return;
    el.setAttribute(name, next);
  }



  function setStylePropIfChanged(el, prop, value) {
    if (!el || el.style.getPropertyValue(prop) === value) return;
    el.style.setProperty(prop, value);
  }



  function applyColumnClasses(shell, columns) {
    var cols = clamp(parseInt(columns, 10) || 3, 1, 4);
    var i;
    var hasAll = shell.classList.contains('df-reviews--cols-' + cols);

    if (hasAll && shell.getAttribute('data-df-columns-effective') === String(cols)) {
      return cols;
    }

    for (i = 1; i <= 4; i++) {
      shell.classList.toggle('df-reviews--cols-' + i, i === cols);
    }

    setAttrIfChanged(shell, 'data-df-columns-effective', cols);
    return cols;
  }



  function getViewportBreakpoint() {
    if (typeof window === 'undefined') return 'desktop';
    var width = window.innerWidth;

    if (width <= BP_MOBILE) return 'mobile';
    if (width <= BP_TABLET) return 'tablet';
    return 'desktop';
  }



  function getLayoutColumnsForBreakpoint(root, breakpoint) {
    if (breakpoint === 'mobile') {
      return parseSettingInt(root, ['columns-mobile', 'layout-columns-mobile'], 1, 1, 2);
    }

    if (breakpoint === 'tablet') {
      return parseSettingInt(root, ['columns-tablet', 'layout-columns-tablet'], 2, 1, 4);
    }

    return parseSettingInt(root, ['columns', 'layout-columns'], 3, 1, 4);
  }



  function getEffectiveColumns(root) {
    return getLayoutColumnsForBreakpoint(root, getViewportBreakpoint());
  }



  function applyEffectiveColumnClasses(root) {
    var shell = getShell(root);

    if (!shell) return getEffectiveColumns(root);

    return applyColumnClasses(shell, getEffectiveColumns(root));
  }



  function syncResponsiveColumnSettings(root, shell, layoutEl) {
    var desktop;
    var tablet;
    var mobile;
    var pageSizeMobile;

    desktop = readShellData(shell, 'columns', '');

    if (!desktop && layoutEl) desktop = readCssVar(layoutEl, settingVarNames('layout-columns'));

    if (desktop) setAttrIfChanged(root, 'data-columns', clamp(parseInt(desktop, 10) || 3, 1, 4));

    tablet = readShellData(shell, 'columns-tablet', '');

    if (!tablet && layoutEl) tablet = readCssVar(layoutEl, settingVarNames('layout-columns-tablet'));

    if (tablet) setAttrIfChanged(root, 'data-columns-tablet', clamp(parseInt(tablet, 10) || 2, 1, 4));

    mobile = readShellData(shell, 'columns-mobile', '');

    if (!mobile && layoutEl) mobile = readCssVar(layoutEl, settingVarNames('layout-columns-mobile'));

    if (mobile) setAttrIfChanged(root, 'data-columns-mobile', clamp(parseInt(mobile, 10) || 1, 1, 2));

    pageSizeMobile = readShellData(shell, 'page-size-mobile', '');

    if (!pageSizeMobile && layoutEl) pageSizeMobile = readCssVar(layoutEl, settingVarNames('page-size-mobile'));

    if (pageSizeMobile) {
      setAttrIfChanged(root, 'data-page-size-mobile', clamp(parseInt(pageSizeMobile, 10) || 1, 1, 20));
    }

    applyEffectiveColumnClasses(root);
  }



  function applyTitleAlign(shell, align) {
    var parsed = parseTitleAlign(align);
    var isLeft = parsed === 'left';

    if (
      shell.getAttribute('data-df-title-align') === parsed &&
      shell.classList.contains('df-reviews--title-left') === isLeft
    ) {
      return parsed;
    }

    shell.classList.toggle('df-reviews--title-left', isLeft);
    shell.classList.toggle('df-reviews--title-center', !isLeft);
    setAttrIfChanged(shell, 'data-df-title-align', parsed);
    return parsed;
  }



  function syncSettingsFromLayout(root, options) {
    var readLayoutMode = !options || options.readLayoutMode !== false;
    var shell = getShell(root);
    var layoutEl = findWidgetLayout(root);
    var layoutValue;
    var layout;
    var columns;
    var pageSize;
    var sliderLimit;
    var spotlightLimit;
    var marqueeSpeed;
    var titleAlign;
    var sourceTabs;
    var hideInsales;
    var hideYandex;

    if (shell) {
      if (readLayoutMode) {
        layoutValue = readSetting(root, ['display_mode', 'display-mode', 'layout_mode'], '');
        if (!layoutValue) layoutValue = readShellData(shell, 'layout', '');
        if (layoutValue) {
          layout = parseLayout(layoutValue);
          syncLayoutClasses(root, layout);
          setAttrIfChanged(root, 'data-layout', layout);
          setAttrIfChanged(shell, 'data-df-layout', layout);
        }
      }

      columns = readShellData(shell, 'columns', '');

      if (columns) setAttrIfChanged(root, 'data-columns', clamp(parseInt(columns, 10) || 3, 1, 4));

      syncResponsiveColumnSettings(root, shell, layoutEl);

      pageSize = readSetting(root, ['page-size', 'page_size', 'max-visible', 'max_visible'], '');

      if (pageSize) setAttrIfChanged(root, 'data-page-size', parseInt(pageSize, 10) || 12);

      pageSize = readSetting(root, ['page-size-mobile', 'page_size_mobile'], '');

      if (pageSize) setAttrIfChanged(root, 'data-page-size-mobile', clamp(parseInt(pageSize, 10) || 1, 1, 20));

      setAttrIfChanged(root, 'data-list-limit', getListLimit(root));
      setAttrIfChanged(root, 'data-slider-limit', getSliderLimit(root));
      setAttrIfChanged(root, 'data-spotlight-limit', getSpotlightLimit(root));
      setAttrIfChanged(root, 'data-page-size', getPageSize(root));
      setAttrIfChanged(root, 'data-marquee-limit', getMarqueeLimit(root));

      marqueeSpeed = readShellData(shell, 'marquee-speed', '');
      if (marqueeSpeed) {
        marqueeSpeed = parseInt(String(marqueeSpeed).replace(/s$/i, ''), 10) || 40;
        setAttrIfChanged(root, 'data-marquee-speed', marqueeSpeed);
      }

      applyMarqueeSpeed(root);
      applyFloatingOffset(root);
      applyProductStyles(root);
      applyReviewTextAlign(
        shell,
        readSetting(root, ['review-text-align', 'review_text_align'], readShellData(shell, 'review-text-align', 'center'))
      );
    }

    if (!layoutEl) {
      if (shell) {
        titleAlign = readSetting(root, ['title-align', 'title_align'], readShellData(shell, 'title-align', 'center'));
        applyTitleAlign(shell, titleAlign);
        applyReviewTextAlign(
          shell,
          readSetting(root, ['review-text-align', 'review_text_align'], readShellData(shell, 'review-text-align', 'center'))
        );
      }
      return;
    }

    columns = readCssVar(layoutEl, settingVarNames('layout-columns'));

    if (columns) setAttrIfChanged(root, 'data-columns', clamp(parseInt(columns, 10) || 3, 1, 4));

    if (shell) syncResponsiveColumnSettings(root, shell, layoutEl);

    setAttrIfChanged(root, 'data-page-size', getPageSize(root));
    setAttrIfChanged(root, 'data-list-limit', getListLimit(root));
    setAttrIfChanged(root, 'data-slider-limit', getSliderLimit(root));
    setAttrIfChanged(root, 'data-spotlight-limit', getSpotlightLimit(root));
    setAttrIfChanged(root, 'data-marquee-limit', getMarqueeLimit(root));

    marqueeSpeed = readCssVar(layoutEl, settingVarNames('marquee-speed'));
    if (marqueeSpeed) setAttrIfChanged(root, 'data-marquee-speed', parseInt(String(marqueeSpeed).replace(/s$/i, ''), 10) || 40);

    applyMarqueeSpeed(root);
    applyFloatingOffset(root);
    applyProductStyles(root);

    if (shell) {
      titleAlign = readSetting(root, ['title-align', 'title_align'], readShellData(shell, 'title-align', 'center'));
      applyTitleAlign(shell, titleAlign);
      applyReviewTextAlign(
        shell,
        readSetting(root, ['review-text-align', 'review_text_align'], readShellData(shell, 'review-text-align', 'center'))
      );
    }

    sourceTabs = readCssVar(layoutEl, settingVarNames('source-tabs'));
    if (sourceTabs) {
      setAttrIfChanged(root, 'data-source-tabs', parseBool(sourceTabs, false) ? 'true' : 'false');
    }

    hideInsales = readCssVar(layoutEl, settingVarNames('hide_insales'));
    if (!hideInsales) hideInsales = readCssVar(layoutEl, settingVarNames('hide-insales'));
    if (hideInsales) {
      setAttrIfChanged(root, 'data-hide-insales', parseBool(hideInsales, false) ? 'true' : 'false');
    }

    hideYandex = readCssVar(layoutEl, settingVarNames('hide_yandex'));
    if (!hideYandex) hideYandex = readCssVar(layoutEl, settingVarNames('hide-yandex'));
    if (hideYandex) {
      setAttrIfChanged(root, 'data-hide-yandex', parseBool(hideYandex, false) ? 'true' : 'false');
    }
  }



  function prepareStaticLayout(root, layout) {
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var columns;
    var slide;

    if (!wrapper) return;

    if (layout === 'slider' || layout === 'spotlight') {
      wrapper.style.display = '';
      wrapper.style.columnCount = '';
      wrapper.style.gridTemplateColumns = '';
      wrapper.style.gap = '';
      wrapper.style.columnGap = '';
      wrapper.style.flexDirection = '';
      wrapper.style.maxWidth = '';
      wrapper.style.margin = '';
      wrapper.style.width = '';
      wrapper.style.flexShrink = '';
      return;
    }

    if (layout === 'marquee') {
      if (root.dataset.marqueeReady !== 'true') {
        wrapper.style.display = '';
        wrapper.style.columnCount = '';
        wrapper.style.gridTemplateColumns = '';
        wrapper.style.gap = '';
        wrapper.style.columnGap = '';
        wrapper.style.flexDirection = '';
        wrapper.style.maxWidth = '';
        wrapper.style.margin = '';
      }
      return;
    }

    columns = getEffectiveColumns(root);
    wrapper.style.display = '';
    wrapper.style.columnCount = '';
    wrapper.style.gridTemplateColumns = '';
    wrapper.style.gap = '';
    wrapper.style.columnGap = '';
    wrapper.style.flexDirection = '';
    wrapper.style.maxWidth = '';
    wrapper.style.margin = '';

    if (layout === 'masonry') {
      wrapper.style.display = 'grid';
      wrapper.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';
      wrapper.style.gridAutoRows = '10px';
      wrapper.style.gap = '1.25rem';
      wrapper.style.columnCount = '';
      wrapper.style.columnGap = '';
    } else if (layout === 'grid') {
      wrapper.style.display = 'grid';
      wrapper.style.gridTemplateColumns = 'repeat(' + columns + ', minmax(0, 1fr))';
      wrapper.style.gap = '1.25rem';
    } else if (layout === 'list') {
      wrapper.style.display = 'flex';
      wrapper.style.flexDirection = 'column';
      wrapper.style.gap = '1rem';
      wrapper.style.maxWidth = '720px';
      wrapper.style.margin = '0 auto';
    }

    wrapper.querySelectorAll('.df-reviews__slide').forEach(function (node) {
      slide = node;
      slide.classList.remove('swiper-slide');
      slide.style.width = '';
      slide.style.height = '';
      slide.style.marginRight = '';
      slide.style.flexShrink = '';
      if (layout === 'masonry') slide.style.gridRowEnd = '';
    });
  }



  function resizeMasonrySlide(slide, grid) {
    var style = window.getComputedStyle(grid);
    var rowHeight = parseInt(style.getPropertyValue('grid-auto-rows'), 10) || 10;
    var rowGap = parseInt(style.getPropertyValue('row-gap'), 10);
    if (isNaN(rowGap)) rowGap = parseInt(style.getPropertyValue('grid-row-gap'), 10) || 0;
    if (!rowGap) rowGap = 1;
    var height = slide.getBoundingClientRect().height;
    var rowSpan = Math.max(1, Math.ceil((height + rowGap) / (rowHeight + rowGap)));

    slide.style.gridRowEnd = 'span ' + rowSpan;
  }



  function layoutMasonryGrid(root) {
    var wrapper;

    if (!root || parseLayout(root.getAttribute('data-layout')) !== 'masonry') return;

    wrapper = root.querySelector('[data-df-reviews-wrapper]');
    if (!wrapper) return;

    getActiveSlides(root).forEach(function (slide) {
      resizeMasonrySlide(slide, wrapper);
    });

    root.querySelectorAll('.df-reviews__slide img').forEach(function (img) {
      if (img.dataset.dfMasonryImgBound === 'true') return;
      img.dataset.dfMasonryImgBound = 'true';
      if (!img.complete) {
        img.addEventListener('load', function () {
          scheduleMasonryLayout(root);
        });
      }
    });
  }



  function scheduleMasonryLayout(root, afterLayout) {
    if (!root) return;

    if (root._dfMasonryLayoutTimer) clearTimeout(root._dfMasonryLayoutTimer);

    root._dfMasonryLayoutTimer = setTimeout(function () {
      root._dfMasonryLayoutTimer = null;
      window.requestAnimationFrame(function () {
        layoutMasonryGrid(root);
        if (typeof afterLayout === 'function') afterLayout();
      });
    }, 60);
  }



  function bindMasonryResize() {
    if (typeof window === 'undefined' || window._dfMasonryResizeBound) return;

    window._dfMasonryResizeBound = true;

    window.addEventListener('resize', function () {
      document.querySelectorAll(ROOT_SELECTOR).forEach(function (root) {
        if (parseLayout(root.getAttribute('data-layout')) === 'masonry') {
          scheduleMasonryLayout(root);
        }
      });
    });

    window.addEventListener('load', function () {
      document.querySelectorAll(ROOT_SELECTOR).forEach(function (root) {
        if (parseLayout(root.getAttribute('data-layout')) === 'masonry') {
          scheduleMasonryLayout(root);
        }
      });
    });
  }



  function bindMasonryEditorEvents() {
    if (typeof EventBus === 'undefined' || window._dfMasonryEditorBound) return;

    window._dfMasonryEditorBound = true;

    EventBus.subscribe('widget:change-setting:insales:system:editor', function () {
      document.querySelectorAll(ROOT_SELECTOR).forEach(function (root) {
        if (parseLayout(root.getAttribute('data-layout')) === 'masonry') {
          scheduleMasonryLayout(root);
        }
      });
    });
  }



  function clearMarqueeWrapperStyles(wrapper) {
    if (!wrapper) return;

    wrapper.style.display = '';
    wrapper.style.width = '';
    wrapper.style.flexShrink = '';
    wrapper.style.transform = '';
    wrapper.classList.remove('df-reviews__marquee-clone');

    wrapper.querySelectorAll('.df-reviews__slide').forEach(function (node) {
      node.classList.remove('swiper-slide');
      node.style.width = '';
      node.style.flexShrink = '';
      node.style.marginRight = '';
    });
  }



  function applyMarqueeViewportContainment(root) {
    if (!root) return;

    root.style.setProperty('max-width', '100%');
    root.style.setProperty('min-width', '0');
    root.style.setProperty('width', '100%');
  }



  function clearMarqueeViewportContainment(root) {
    if (!root) return;

    root.style.removeProperty('max-width');
    root.style.removeProperty('min-width');
    root.style.removeProperty('width');
  }



  function getSlideDedupeKey(slide) {
    var source = (slide.dataset.source || '').toLowerCase();
    var reviewId = slide.getAttribute('data-review-id') || '';

    if (reviewId) return source + ':' + reviewId;

    return (
      source +
      ':' +
      (slide.getAttribute('data-df-slide-index') || '') +
      ':' +
      (slide.textContent || '').trim().slice(0, 80)
    );
  }



  function dedupeSlidesInWrapper(wrapper) {
    var seen = {};
    var slides;
    var i;
    var slide;
    var key;

    if (!wrapper) return;

    slides = Array.prototype.slice.call(wrapper.querySelectorAll('.df-reviews__slide'));
    for (i = 0; i < slides.length; i++) {
      slide = slides[i];
      if (slide.classList.contains('df-reviews__slide--empty')) continue;
      key = getSlideDedupeKey(slide);
      if (seen[key]) {
        if (slide.parentNode) slide.parentNode.removeChild(slide);
      } else {
        seen[key] = true;
      }
    }
  }



  function parseTranslateXPx(transform) {
    var match;
    var parts;

    if (!transform || transform === 'none') return 0;

    match = transform.match(/matrix3d\(([^)]+)\)/);
    if (match) {
      parts = match[1].split(',');
      return parseFloat(parts[12]) || 0;
    }

    match = transform.match(/matrix\(([^)]+)\)/);
    if (match) {
      parts = match[1].split(',');
      return parseFloat(parts[4]) || 0;
    }

    return 0;
  }



  function saveMarqueeOffsetForTab(root, source) {
    var track;

    if (!source || typeof window === 'undefined') return;

    track = root.querySelector('.df-reviews__marquee-track');
    if (!track) return;

    if (!root._dfMarqueeTabOffsets) root._dfMarqueeTabOffsets = {};

    root._dfMarqueeTabOffsets[source] = parseTranslateXPx(
      window.getComputedStyle(track).transform
    );
  }



  function applyMarqueeOffsetForTab(root, source) {
    var track;
    var offsetPx;
    var setWidth;
    var duration;
    var progress;

    if (typeof window === 'undefined') return;

    track = root.querySelector('.df-reviews__marquee-track');
    if (!track) return;

    offsetPx = 0;
    if (
      source &&
      root._dfMarqueeTabOffsets &&
      Object.prototype.hasOwnProperty.call(root._dfMarqueeTabOffsets, source)
    ) {
      offsetPx = root._dfMarqueeTabOffsets[source];
    }

    if (!offsetPx) {
      track.style.removeProperty('animation-delay');
      return;
    }

    setWidth = track.scrollWidth / 2;
    if (!setWidth) return;

    duration = parseFloat(window.getComputedStyle(track).animationDuration) || 40;
    if (isNaN(duration)) duration = 40;

    progress = Math.abs(offsetPx) / setWidth;
    progress = progress - Math.floor(progress);

    track.style.animationDelay = '-' + progress * duration + 's';
  }



  function resetMarqueeState(root) {
    var tracks;
    var track;
    var wrapper;
    var i;

    tracks = root.querySelectorAll('.df-reviews__marquee-track');
    for (i = 0; i < tracks.length; i++) {
      track = tracks[i];
      wrapper = track.querySelector('[data-df-reviews-wrapper]');
      if (wrapper && track.parentNode) track.parentNode.insertBefore(wrapper, track);
      if (track.parentNode) track.parentNode.removeChild(track);
    }

    root.querySelectorAll('.df-reviews__marquee-clone').forEach(function (node) {
      if (node.parentNode) node.parentNode.removeChild(node);
    });

    wrapper = root.querySelector('[data-df-reviews-wrapper]');
    clearMarqueeWrapperStyles(wrapper);
    clearMarqueeViewportContainment(root);
    root.dataset.marqueeReady = '';
  }



  function readSetting(root, keys, fallback) {
    var shell = getShell(root);
    var layoutEl = findWidgetLayout(root);
    var i;
    var key;
    var val;

    keys = Array.isArray(keys) ? keys : [keys];

    for (i = 0; i < keys.length; i++) {
      key = keys[i];
      val = root.getAttribute('data-' + key);
      if (val != null && val !== '') return val;
      if (shell) {
        val = readShellData(shell, key, '');
        if (val) return val;
      }
      if (layoutEl) {
        val = readCssVar(layoutEl, settingVarNames(key));
        if (val) return val;
      }
    }

    return fallback;
  }



  function parseSettingInt(root, keys, fallback, min, max) {
    var raw = readSetting(root, keys, String(fallback));
    var value = parseInt(String(raw).replace(/[^\d-]/g, ''), 10);
    if (isNaN(value)) value = fallback;
    return clamp(value, min, max);
  }



  function ensureSlidePool(shell) {
    var pool = shell.querySelector('[data-df-reviews-pool]');
    if (pool) return pool;
    pool = document.createElement('div');
    pool.hidden = true;
    pool.setAttribute('data-df-reviews-pool', '');
    pool.setAttribute('aria-hidden', 'true');
    shell.appendChild(pool);
    return pool;
  }



  function getPageSize(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));

    if (usesPagination(layout) && getViewportBreakpoint() === 'mobile') {
      return parseSettingInt(root, ['page-size-mobile', 'page_size_mobile'], 6, 1, 20);
    }

    return parseSettingInt(root, ['page-size', 'page_size', 'max-visible', 'max_visible'], 12, 1, 50);
  }



  function getSliderLimit(root) {
    return parseSettingInt(root, ['slider-limit', 'slider_limit'], 10, 1, 100);
  }



  function getSpotlightLimit(root) {
    return parseSettingInt(root, ['spotlight-limit', 'spotlight_limit'], 5, 1, 50);
  }



  function getMarqueeLimit(root) {
    return parseSettingInt(root, ['marquee-limit', 'marquee_limit'], 20, 2, 50);
  }



  function getListLimit(root) {
    return parseSettingInt(root, ['list-limit', 'list_limit'], 10, 1, 100);
  }



  function usesPagination(layout) {
    return layout === 'masonry' || layout === 'grid' || layout === 'list';
  }



  function usesLoadMore(layout) {
    return layout === 'masonry';
  }



  function usesInsalesServerPagination(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    var total;
    var limit;

    if (layout !== 'masonry') return false;
    if (!parseBool(root.getAttribute('data-insales-ajax-enabled'), true)) return false;
    if (resolveHideFlag(root, 'data-hide-insales')) return false;

    if (root.hasAttribute('data-insales-server-pagination')) {
      return parseBool(root.getAttribute('data-insales-server-pagination'), false);
    }

    total = parseInt(root.getAttribute('data-insales-count'), 10) || 0;
    limit = getInsalesPrefetchLimit(root);

    return total > limit;
  }



  function shouldApplyInsalesServerPagination(root) {
    var active;

    if (!usesInsalesServerPagination(root)) return false;

    active = getActiveSourceTab(root);
    if (active && active !== 'insales') return false;

    return true;
  }



  function getInsalesBatchPage(root) {
    return parseInt(root.getAttribute('data-insales-batch-page'), 10) || 1;
  }



  function isInsalesAccumulated(root) {
    if (!usesInsalesServerPagination(root)) return false;
    if (root.dataset.paginationMode === 'accumulate') return true;
    return countLoadedInsalesSlides(root) > getInsalesPrefetchLimit(root);
  }



  function countLoadedInsalesSlides(root) {
    return getOrderedSlides(root).filter(function (slide) {
      return (slide.getAttribute('data-source') || '').toLowerCase() === 'insales';
    }).length;
  }



  function getInsalesPrefetchLimit(root) {
    return parseSettingInt(root, ['insales-prefetch-limit', 'insales_prefetch_limit'], 20, 1, 50);
  }



  function getInsalesServerPageCount(root) {
    var fromAttr = parseInt(root.getAttribute('data-insales-total-pages'), 10);
    var total = parseInt(root.getAttribute('data-insales-count'), 10) || 0;
    var limit = getInsalesPrefetchLimit(root);
    var pages;

    if (!isNaN(fromAttr) && fromAttr > 0) return fromAttr;
    if (!total || !limit) return 1;

    pages = Math.ceil(total / limit);
    if (total % 100 === 0 && total >= 100) {
      pages = Math.floor(total / limit);
    }

    return Math.max(1, pages);
  }



  function buildReviewStars(rating) {
    var value = clamp(parseInt(rating, 10) || 5, 1, 5);
    var stars = '';
    var i;

    for (i = 1; i <= 5; i++) {
      stars += i <= value ? '★' : '☆';
    }

    return stars;
  }



  function parseMasonryReviewJson(item) {
    var container = item.querySelector('.review-title-container[data-json]');
    var raw;

    if (!container) return null;

    raw = container.getAttribute('data-json') || '';
    if (!raw) return null;

    return parseReviewMeta(raw.replace(/'/g, '"'));
  }



  function masonryItemToSlide(item, root) {
    var meta = parseMasonryReviewJson(item);
    var authorEl = item.querySelector('.author');
    var ratingEl = item.querySelector('.star-rating-wrapper .title');
    var contentEl = item.querySelector('.review-content');
    var dateEl = item.querySelector('.date');
    var photoLink = item.querySelector('.reviews__photo_new a[href], .reviews__photo_new a[data-type="image"]');
    var photoImg = item.querySelector('.reviews__photo_new img');
    var author = authorEl ? authorEl.textContent.trim() : meta && meta.author ? String(meta.author).trim() : '';
    var rating = ratingEl ? parseInt(ratingEl.textContent.trim(), 10) : meta && meta.rating ? parseInt(meta.rating, 10) : 5;
    var content = contentEl ? contentEl.textContent.trim() : meta && meta.content ? String(meta.content).trim() : '';
    var createdAt = meta && meta.created_at ? String(meta.created_at) : '';
    var dateText = dateEl ? dateEl.textContent.trim() : '';
    var sortTs = createdAt ? Math.floor(Date.parse(createdAt) / 1000) : '';
    var photoUrl = photoLink ? photoLink.getAttribute('href') || '' : '';
    var photoPreview = photoImg ? photoImg.getAttribute('src') || '' : '';
    var reviewId = meta && meta.id != null ? String(meta.id) : '';
    var minRating = parseMinRating(root.getAttribute('data-min-rating'));
    var hideDate = resolveHideFlag(root, 'data-hide-date');
    var hideSource = resolveHideFlag(root, 'data-hide-source');
    var slide;
    var avatar;
    var authorNode;
    var stars;
    var text;
    var source;
    var dateNode;
    var metaJson;
    var initial;

    if (isNaN(rating)) rating = 5;
    if (minRating > 0 && rating < minRating) return null;
    if (!author && !content) return null;

    slide = document.createElement('div');
    slide.className = 'df-reviews__slide';
    slide.setAttribute('data-source', 'insales');
    slide.setAttribute('data-rating', String(rating));

    if (sortTs) slide.setAttribute('data-sort-ts', String(sortTs));
    if (reviewId) slide.setAttribute('data-review-id', reviewId);

    if (meta) {
      metaJson = JSON.stringify(meta).replace(/"/g, '&quot;');
      slide.setAttribute('data-df-review-meta', metaJson);
    }

    if (photoUrl) {
      slide.setAttribute('data-photo-urls', JSON.stringify([photoUrl]));
      if (photoPreview) slide.setAttribute('data-photo-previews', JSON.stringify([photoPreview]));
    }

    initial = author ? author.charAt(0) : '?';

    avatar = document.createElement('div');
    avatar.className = 'df-reviews__avatar df-reviews__avatar--placeholder';
    avatar.textContent = initial;
    slide.appendChild(avatar);

    authorNode = document.createElement('div');
    authorNode.className = 'df-reviews__author';
    authorNode.textContent = author;
    slide.appendChild(authorNode);

    if (!hideDate) {
      dateNode = document.createElement('time');
      dateNode.className = 'df-reviews__date';
      if (createdAt) dateNode.setAttribute('datetime', createdAt);
      dateNode.textContent = dateText;
      slide.appendChild(dateNode);
    }

    stars = document.createElement('div');
    stars.className = 'df-reviews__stars';
    stars.setAttribute('aria-label', rating + ' из 5');
    stars.textContent = buildReviewStars(rating);
    slide.appendChild(stars);

    text = document.createElement('p');
    text.className = 'df-reviews__text';
    text.textContent = content;
    slide.appendChild(text);

    if (!hideSource) {
      source = document.createElement('span');
      source.className = 'df-reviews__source';
      source.textContent = 'InSales';
      slide.appendChild(source);
    }

    return slide;
  }



  function extractInsalesSlidesFromResponse(doc, root) {
    var slides = [];
    var seen = {};
    var nativeItems;
    var widgetSlides;
    var i;
    var slide;
    var reviewId;

    widgetSlides = doc.querySelectorAll(
      '[data-df-reviews-wrapper] .df-reviews__slide[data-source="insales"], .df-reviews__slide[data-source="insales"]'
    );

    for (i = 0; i < widgetSlides.length; i++) {
      slide = widgetSlides[i];
      if (slide.classList.contains('df-reviews__slide--empty')) continue;
      reviewId = slide.getAttribute('data-review-id') || '';
      if (reviewId && seen[reviewId]) continue;
      if (reviewId) seen[reviewId] = true;
      slides.push(slide.cloneNode(true));
    }

    if (slides.length) return slides;

    nativeItems = doc.querySelectorAll('.masonry-reviews-list .masonry-reviews-item');

    for (i = 0; i < nativeItems.length; i++) {
      slide = masonryItemToSlide(nativeItems[i], root);
      if (!slide) continue;
      reviewId = slide.getAttribute('data-review-id') || '';
      if (reviewId && seen[reviewId]) continue;
      if (reviewId) seen[reviewId] = true;
      slides.push(slide);
    }

    return slides;
  }



  function extractLoadmoreUrlFromResponse(doc) {
    var btn =
      doc.querySelector('[data-df-insales-loadmore][data-url]') ||
      doc.querySelector('.loadmore_button[data-url]');
    var url = btn ? btn.getAttribute('data-url') || '' : '';

    if (isInvalidInsalesLoadmoreUrl(url)) return '';

    return url;
  }



  function syncInsalesLoadmoreButton(root, url) {
    var shell = getShell(root);
    var btn = shell ? shell.querySelector('[data-df-insales-loadmore]') : null;

    if (!btn || !url || isInvalidInsalesLoadmoreUrl(url)) return;

    btn.setAttribute('data-url', url);
    btn.hidden = false;
    btn.disabled = false;
  }



  function removeInsalesSlidesFromDom(root) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool = shell ? shell.querySelector('[data-df-reviews-pool]') : null;
    var containers = [wrapper, pool];
    var i;

    for (i = 0; i < containers.length; i++) {
      if (!containers[i]) continue;
      containers[i].querySelectorAll('.df-reviews__slide[data-source="insales"]').forEach(function (node) {
        node.remove();
      });
    }
  }



  function insertInsalesSlides(root, newSlides, append) {
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var yandexAnchor;
    var i;
    var slide;

    if (!wrapper || !newSlides.length) return 0;

    if (!append) {
      removeInsalesSlidesFromDom(root);
    }

    yandexAnchor = wrapper.querySelector('.df-reviews__slide[data-source="yandex"]');

    for (i = 0; i < newSlides.length; i++) {
      slide = newSlides[i];
      if (yandexAnchor) wrapper.insertBefore(slide, yandexAnchor);
      else wrapper.appendChild(slide);
    }

    return newSlides.length;
  }



  function mountAllSlidesVisible(root, options) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool = shell ? shell.querySelector('[data-df-reviews-pool]') : null;
    var slides = getOrderedSlides(root);
    var preserveScroll = options && options.preserveScroll === true;
    var scrollY = preserveScroll && typeof window !== 'undefined' ? window.pageYOffset : null;
    var i;
    var slide;

    if (!wrapper) return;

    for (i = 0; i < slides.length; i++) {
      slide = slides[i];
      slide.classList.remove('df-reviews__slide--page-hidden');
      slide.style.removeProperty('display');
      slide.classList.remove('df-reviews__slide--collapsed');
      wrapper.appendChild(slide);
    }

    if (pool) {
      pool.querySelectorAll('.df-reviews__slide').forEach(function (node) {
        node.classList.remove('df-reviews__slide--page-hidden');
        wrapper.appendChild(node);
      });
    }

    if (preserveScroll) restoreScrollPosition(scrollY);

    if (parseLayout(root.getAttribute('data-layout')) === 'masonry') {
      scheduleMasonryLayout(root, preserveScroll
        ? function () {
            restoreScrollPosition(scrollY);
          }
        : null);
    }

    initExpandButtons(root);
    syncMasonryInlinePhotos(root);
  }



  function resolvePageAfterInsalesLoad(prevSlideCount, pageSize, newSlideCount) {
    var prevTotalPages = Math.max(1, Math.ceil(prevSlideCount / pageSize));
    var newTotalPages = Math.max(1, Math.ceil(newSlideCount / pageSize));
    var targetPage = prevTotalPages + 1;

    if (targetPage > newTotalPages) targetPage = newTotalPages;
    if (targetPage < 1) targetPage = 1;

    return {
      targetPage: targetPage,
      newTotalPages: newTotalPages
    };
  }



  function expandPaginationAfterInsalesLoad(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));

    if (usesInsalesServerPagination(root)) {
      root.dataset.paginationMode = 'accumulate';
      root.dataset.paginationPage = String(getInsalesBatchPage(root));
      mountAllSlidesVisible(root, { preserveScroll: true });
      renderPageControls(root);
      updateMoreButton(root);
      updateInsalesLoadMore(root);
      return;
    }

    updateMoreButton(root);
    updateInsalesLoadMore(root);

    if (!usesPagination(layout)) return;

    mountAllSlidesVisible(root, { preserveScroll: true });
    renderPageControls(root);
  }



  function hasMoreInsalesOnServer(root) {
    var total = parseInt(root.getAttribute('data-insales-count'), 10) || 0;
    if (!parseBool(root.getAttribute('data-insales-ajax-enabled'), true)) return false;
    return total > countLoadedInsalesSlides(root);
  }



  function getInsalesAjaxBase(root) {
    var custom = String(root.getAttribute('data-insales-ajax-url') || '').trim();
    if (custom && !isInsalesShopReviewUrl(custom)) return custom;

    if (typeof window !== 'undefined' && window.location && window.location.pathname) {
      var path = window.location.pathname || '/';
      if (path.indexOf('shop-reviews') >= 0 && !isInsalesShopReviewUrl(path)) return path;
      if (path !== '/' && !isInsalesShopReviewUrl(path) && !/\.html$/i.test(path)) return path;
    }

    return '/blogs/shop-reviews';
  }



  function isInvalidInsalesLoadmoreUrl(url) {
    var value = String(url || '').trim().toLowerCase();
    if (!value) return false;
    return value.indexOf('/product/shop-reviews') >= 0;
  }



  function parseUrlPageParam(url) {
    var match = String(url || '').match(/[?&]page=(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }



  function syncInsalesBatchPageAfterLoad(root, doc, url) {
    var fetchedRoot = findFetchedWidgetRoot(doc);
    var batch = fetchedRoot ? fetchedRoot.getAttribute('data-insales-batch-page') : '';
    var batchNum = parseInt(batch, 10);
    var loadedPage;

    if (!isNaN(batchNum) && batchNum > 0) {
      root.setAttribute('data-insales-batch-page', String(batchNum));
      return;
    }

    loadedPage = parseUrlPageParam(url);
    if (loadedPage > 0) {
      root.setAttribute('data-insales-batch-page', String(loadedPage));
    }
  }



  function buildInsalesPageUrl(root, pageNum) {
    var base = getInsalesAjaxBase(root);
    var page = parseInt(pageNum, 10) || 1;
    var url;
    var preview;
    var isAbsolute = /^https?:\/\//i.test(base);

    if (typeof window === 'undefined' || !window.location) {
      return base + (base.indexOf('?') >= 0 ? '&' : '?') + 'page=' + page;
    }

    try {
      url = new URL(base, window.location.origin);
    } catch (ignore) {
      url = new URL(window.location.pathname || '/', window.location.origin);
    }

    url.searchParams.set('page', String(page));
    preview = new URLSearchParams(window.location.search).get('theme_preview');
    if (preview) url.searchParams.set('theme_preview', preview);

    if (isAbsolute) return url.toString();
    return url.pathname + url.search;
  }



  function buildInsalesLoadMoreUrl(root) {
    return buildInsalesPageUrl(root, getInsalesBatchPage(root) + 1);
  }



  function syncInsalesLoadMoreUrl(root, force) {
    var shell = getShell(root);
    var btn = shell ? shell.querySelector('[data-df-insales-loadmore]') : null;
    var built;
    var existing;
    if (!btn || !usesLoadMore(parseLayout(root.getAttribute('data-layout')))) return;
    existing = btn.getAttribute('data-url') || '';
    if (
      !force &&
      existing &&
      !isInvalidInsalesLoadmoreUrl(existing) &&
      (/^https?:\/\//i.test(existing) || parseUrlPageParam(existing) > 0)
    ) {
      return;
    }
    built = buildInsalesLoadMoreUrl(root);
    if (existing && !force && !isInvalidInsalesLoadmoreUrl(existing) && parseUrlPageParam(existing) > parseUrlPageParam(built)) return;
    btn.setAttribute('data-url', built);
  }



  function findFetchedWidgetRoot(doc) {
    var shells = doc.querySelectorAll('[data-danforge-widget="danforge_reviews_slider"]');
    var i;
    var root;

    for (i = 0; i < shells.length; i++) {
      root = shells[i].querySelector('[data-df-reviews-root]');
      if (root) return root;
    }

    return doc.querySelector('[data-df-reviews-root]');
  }



  function extractInsalesSlidesFromDocument(doc) {
    var fetchedRoot = findFetchedWidgetRoot(doc);
    var wrapper = fetchedRoot ? fetchedRoot.querySelector('[data-df-reviews-wrapper]') : null;

    if (wrapper) {
      return wrapper.querySelectorAll('.df-reviews__slide[data-source="insales"]');
    }

    return doc.querySelectorAll(
      '[data-df-reviews-wrapper] .df-reviews__slide[data-source="insales"], .df-reviews__slide[data-source="insales"]'
    );
  }



  function isAtEndOfLoadedPagination(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    var totalPages;
    var current;
    var loaded;
    var pageSize;
    var slides;
    var visibleCount;

    if (shouldApplyInsalesServerPagination(root)) {
      return getInsalesBatchPage(root) >= getInsalesServerPageCount(root);
    }

    if (!usesPagination(layout)) return true;

    totalPages = getTotalPages(root);
    pageSize = getPageSize(root);
    slides = getOrderedSlides(root);

    if (root.dataset.paginationMode === 'accumulate') {
      loaded = parseInt(root.dataset.paginationLoaded, 10) || 1;
      visibleCount = Math.min(loaded * pageSize, slides.length);
      if (visibleCount >= slides.length && !hasMoreInsalesOnServer(root)) return true;
      if (loaded >= totalPages) return true;
      return visibleCount >= slides.length;
    }

    if (totalPages <= 1) {
      return slides.length <= pageSize;
    }

    current = parseInt(root.dataset.paginationPage, 10) || 1;
    return current >= totalPages;
  }



  var SWIPER_READY_POLL_MS = 50;

  var SWIPER_READY_MAX_ATTEMPTS = 100;



  function whenSwiperReady(callback) {
    if (typeof Swiper !== 'undefined') {
      callback();
      return;
    }

    var attempts = 0;
    var timer = null;
    var onLoad = null;

    function cleanup() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }

      if (onLoad) {
        window.removeEventListener('load', onLoad);
        onLoad = null;
      }
    }

    function tryRun() {
      if (typeof Swiper !== 'undefined') {
        cleanup();
        callback();
        return true;
      }

      return false;
    }

    onLoad = function () {
      tryRun();
    };

    window.addEventListener('load', onLoad);

    timer = setInterval(function () {
      attempts += 1;
      if (tryRun() || attempts >= SWIPER_READY_MAX_ATTEMPTS) cleanup();
    }, SWIPER_READY_POLL_MS);
  }



  function usesFloatingActions(layout) {
    return layout === 'masonry' || layout === 'grid';
  }



  function shouldShowTabCounts(layout) {
    return layout === 'masonry';
  }



  function getRawSlides(root) {
    var shell = getShell(root);
    if (!shell) return [];
    return Array.prototype.slice.call(
      shell.querySelectorAll('.df-reviews__slide:not(.is-hidden):not(.df-reviews__slide--empty)')
    );
  }



  function isSlideVisibleInWrapper(slide) {
    if (!slide || slide.classList.contains('df-reviews__slide--empty')) return false;
    if (slide.classList.contains('is-hidden')) return false;
    if (slide.classList.contains('df-reviews__slide--page-hidden')) return false;
    if (slide.classList.contains('df-reviews__slide--source-hidden')) return false;
    return true;
  }



  function getActiveSlides(root) {
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    if (!wrapper) return [];
    return Array.prototype.filter.call(
      wrapper.querySelectorAll('.df-reviews__slide'),
      isSlideVisibleInWrapper
    );
  }



  function getOrderedSlides(root, options) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool = shell ? shell.querySelector('[data-df-reviews-pool]') : null;
    var nodes = [];
    var hasIndex = false;
    var includeLimited = options && options.includeLimited === true;

    if (wrapper) {
      nodes = nodes.concat(
        Array.prototype.slice.call(
          wrapper.querySelectorAll('.df-reviews__slide:not(.is-hidden):not(.df-reviews__slide--empty)')
        )
      );
    }

    if (pool) {
      nodes = nodes.concat(
        Array.prototype.slice.call(
          pool.querySelectorAll('.df-reviews__slide:not(.is-hidden):not(.df-reviews__slide--empty)')
        )
      );
    }

    if (!includeLimited) {
      nodes = nodes.filter(function (node) {
        return !node.classList.contains('df-reviews__slide--mode-limited');
      });
    }

    if (!nodes.length) return nodes;

    hasIndex = nodes.some(function (node) {
      return node.hasAttribute('data-df-slide-index');
    });

    if (hasIndex) {
      nodes.sort(function (a, b) {
        return (
          (parseInt(a.getAttribute('data-df-slide-index'), 10) || 0) -
          (parseInt(b.getAttribute('data-df-slide-index'), 10) || 0)
        );
      });
      return nodes;
    }

    nodes.forEach(function (slide, index) {
      slide.setAttribute('data-df-slide-index', String(index));
    });

    return nodes;
  }



  function ensureSlideOrder(root) {
    var slides = getOrderedSlides(root);
    slides.forEach(function (slide, index) {
      setAttrIfChanged(slide, 'data-df-slide-index', index);
    });
    return slides;
  }



  function getAllSlides(root) {
    return getOrderedSlides(root);
  }



  function getDisplayedSlides(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));

    if (usesPagination(layout)) {
      return getActiveSlides(root);
    }

    return getActiveSlides(root);
  }



  function parsePhotoUrlsAttr(raw) {
    var text;
    var parsed;
    var i;
    var urls = [];

    if (!raw) return urls;

    text = String(raw)
      .replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    try {
      parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        for (i = 0; i < parsed.length; i++) {
          if (parsed[i]) urls.push(String(parsed[i]));
        }
      }
    } catch (ignore) {}

    return urls;
  }



  function getSlidePhotoUrls(slide) {
    var urls = parsePhotoUrlsAttr(slide.getAttribute('data-photo-urls'));
    var i;

    if (urls.length) return urls;

    slide.querySelectorAll('.df-reviews__photo').forEach(function (btn) {
      var full = btn.getAttribute('data-photo-full') || '';
      var img = btn.querySelector('img');
      var src = full || (img ? img.getAttribute('src') : '');
      if (src) urls.push(src);
    });

    return urls;
  }



  function getSlidePhotoPreviews(slide) {
    var previews = parsePhotoUrlsAttr(slide.getAttribute('data-photo-previews'));
    var full = getSlidePhotoUrls(slide);
    var i;
    var out = [];

    if (previews.length) {
      for (i = 0; i < full.length; i++) {
        out.push(previews[i] || photoPreviewUrl(full[i]));
      }
      return out;
    }

    for (i = 0; i < full.length; i++) {
      out.push(photoPreviewUrl(full[i]));
    }

    return out;
  }



  function photoPreviewUrl(fullUrl) {
    var url = String(fullUrl || '');

    if (!url) return url;

    if (url.indexOf('/orig') !== -1) return url.replace('/orig', '/L');

    if (/\/[A-Z]$/.test(url)) return url.replace(/\/[A-Z]$/, '/L');

    return url;
  }



  function preloadImages(urls) {
    var i;

    if (!urls || !urls.length) return;

    for (i = 0; i < urls.length; i++) {
      if (!urls[i]) continue;
      (function (src) {
        var img = new Image();
        img.decoding = 'async';
        img.src = src;
      })(urls[i]);
    }
  }



  function parseReviewMeta(raw) {
    var text;
    if (!raw) return null;
    text = String(raw)
      .replace(/&quot;/g, '"')
      .replace(/&#34;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    try {
      return JSON.parse(text);
    } catch (ignore) {
      return null;
    }
  }



  function isProductPageMode(root) {
    var shell = getShell(root);
    return !!(shell && shell.getAttribute('data-df-product-page') === 'true');
  }



  function isInsalesShopReviewUrl(url) {
    var value = String(url || '').trim().toLowerCase();
    if (!value) return false;
    return value === '/product/shop-reviews' || value.indexOf('/product/shop-reviews?') === 0;
  }



  function getShopAvatarUrl(root) {
    var shell = getShell(root);
    if (shell) {
      var fromShell = shell.getAttribute('data-df-shop-avatar-url') || '';
      if (fromShell) return fromShell;
    }
    return readSetting(root, ['df-shop-avatar-url'], '');
  }



  function getReviewAuthorInitial(slide, meta) {
    var author = slide.querySelector('.df-reviews__author');
    var text = author ? author.textContent.trim() : '';
    if (!text && meta && meta.author) text = String(meta.author).trim();
    return text ? text.charAt(0) : '?';
  }



  function getInsalesProductInfo(meta) {
    var url;
    var title;
    var imageUrl;

    if (!meta) return null;

    url = meta.url ? String(meta.url).trim() : '';
    if (!url || isInsalesShopReviewUrl(url)) return null;

    title = meta.title || (meta.product && meta.product.title) || '';
    title = String(title).trim();

    if (meta.first_image && meta.first_image.medium_url) {
      imageUrl = meta.first_image.medium_url;
    } else if (meta.product && meta.product.first_image && meta.product.first_image.medium_url) {
      imageUrl = meta.product.first_image.medium_url;
    } else {
      imageUrl = '';
    }

    if (!title && !imageUrl) return null;

    return {
      url: url,
      title: title || 'Товар',
      imageUrl: imageUrl
    };
  }



  function buildInsalesAvatarMarkup(slide, meta, shopAvatarUrl) {
    var initial = getReviewAuthorInitial(slide, meta);
    var url = meta && meta.url ? String(meta.url).trim() : '';
    var isShop = isInsalesShopReviewUrl(url);

    if (isShop) {
      if (shopAvatarUrl) {
        return (
          '<div class="df-reviews__avatar">' +
          '<img src="' + escapeAttr(shopAvatarUrl) + '" alt="" loading="lazy" width="72" height="72">' +
          '</div>'
        );
      }
      if (meta && meta.image && meta.image.medium_url) {
        return (
          '<div class="df-reviews__avatar">' +
          '<img src="' + escapeAttr(meta.image.medium_url) + '" alt="" loading="lazy" width="72" height="72">' +
          '</div>'
        );
      }
    }

    return '<div class="df-reviews__avatar df-reviews__avatar--placeholder">' + escapeAttr(initial) + '</div>';
  }



  function buildInsalesProductMarkup(info) {
    var thumb;

    if (!info || !info.url) return '';

    thumb = info.imageUrl
      ? (
        '<span class="df-reviews__product-thumb">' +
        '<img src="' + escapeAttr(info.imageUrl) + '" alt="" loading="lazy" width="48" height="48">' +
        '</span>'
      )
      : '';

    return (
      '<a class="df-reviews__product" href="' + escapeAttr(info.url) + '">' +
      '<span class="df-reviews__product-title">' + escapeAttr(info.title) + '</span>' +
      thumb +
      '</a>'
    );
  }



  function replaceOrInsertProductBlock(slide, markup) {
    var existing = slide.querySelector('.df-reviews__product');
    var stars;

    if (!markup) {
      if (existing) existing.remove();
      return;
    }

    if (existing) {
      existing.outerHTML = markup;
      return;
    }

    stars = slide.querySelector('.df-reviews__stars');
    if (stars) stars.insertAdjacentHTML('afterend', markup);
  }



  function replaceSlideAvatar(slide, markup) {
    var current = slide.querySelector('.df-reviews__avatar, .df-reviews__avatar--link, a.df-reviews__avatar--link');
    var host = document.createElement('div');
    var next;

    if (!markup) return;
    host.innerHTML = markup;
    next = host.firstElementChild;
    if (!next) return;

    if (current && current.parentNode) {
      current.parentNode.replaceChild(next, current);
    } else {
      slide.insertBefore(next, slide.firstElementChild);
    }
  }



  function applyInsalesProductAvatars(root) {
    var shell = getShell(root);
    var shopAvatarUrl;
    var hideAvatar;

    if (!root) return;

    shopAvatarUrl = getShopAvatarUrl(root);
    hideAvatar = shell && shell.classList.contains('df-reviews--hide-avatar');

    root.querySelectorAll('.df-reviews__slide[data-source="insales"]').forEach(function (slide) {
      var meta = parseReviewMeta(slide.getAttribute('data-df-review-meta'));
      var url = meta && meta.url ? String(meta.url).trim() : '';
      var markup;

      if (hideAvatar) return;

      if (!meta) return;

      markup = buildInsalesAvatarMarkup(slide, meta, shopAvatarUrl);
      replaceSlideAvatar(slide, markup);

      if (hideAvatar) {
        replaceOrInsertProductBlock(slide, '');
      } else if (isProductPageMode(root)) {
        replaceOrInsertProductBlock(slide, '');
      } else {
        replaceOrInsertProductBlock(
          slide,
          buildInsalesProductMarkup(getInsalesProductInfo(meta))
        );
      }

      if (!isInsalesShopReviewUrl(url) && url) {
        slide.setAttribute('data-product-url', url);
      } else {
        slide.removeAttribute('data-product-url');
      }
    });
  }



  function migrateCardPhotos(root) {
    getRawSlides(root).forEach(function (slide) {
      var photos = slide.querySelector('.df-reviews__photos');
      var urls;

      if (!slide.getAttribute('data-photo-urls') && photos) {
        urls = getSlidePhotoUrls(slide);
        if (urls.length) slide.setAttribute('data-photo-urls', JSON.stringify(urls));
      }

      if (photos) photos.parentNode.removeChild(photos);
    });
  }



  function collectVisiblePhotoUrls(root) {
    var urls = [];
    var seen = {};

    getDisplayedSlides(root).forEach(function (slide) {
      getSlidePhotoUrls(slide).forEach(function (url) {
        if (url && !seen[url]) {
          seen[url] = true;
          urls.push(url);
        }
      });
    });

    return urls;
  }



  function restoreAllSlidesToWrapper(root) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool = shell ? shell.querySelector('[data-df-reviews-pool]') : null;

    if (!wrapper || !pool) return;

    while (pool.firstChild) {
      wrapper.appendChild(pool.firstChild);
    }

    ensureSlideOrder(root);
  }



  function getEditorSettingsKey(root) {
    var layoutEl = findWidgetLayout(root);
    var layout = parseLayout(root.getAttribute('data-layout'));
    var parts = [
      layout,
      String(getPageSize(root)),
      String(getViewportBreakpoint()),
      String(root.getAttribute('data-columns') || ''),
      String(root.getAttribute('data-columns-tablet') || ''),
      String(root.getAttribute('data-columns-mobile') || ''),
      String(root.getAttribute('data-page-size-mobile') || ''),
      String(getSliderLimit(root)),
      String(getSpotlightLimit(root)),
      String(getMarqueeLimit(root)),
      String(resolveHideFlag(root, 'data-hide-avatar')),
      String(resolveHideFlag(root, 'data-hide-source')),
      String(resolveHideFlag(root, 'data-hide-date')),
      String(resolveHideFlag(root, 'data-hide-insales')),
      String(resolveHideFlag(root, 'data-hide-yandex')),
      String(root.getAttribute('data-source-tabs') || ''),
      String(root.getAttribute('data-min-rating') || '')
    ];

    if (layoutEl) {
      parts.push(readCssVar(layoutEl, settingVarNames('page-size')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('page-size-mobile')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('layout-columns')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('layout-columns-tablet')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('layout-columns-mobile')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('hide-insales')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('hide-yandex')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('hide-avatar')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('hide-source')) || '');
      parts.push(readCssVar(layoutEl, settingVarNames('hide-date')) || '');
    }

    return parts.join('\0');
  }



  function applyModeLimits(root, layout) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool;
    var slides;
    var limit = 0;
    var i;
    var slide;

    if (!shell || !wrapper) return;

    pool = ensureSlidePool(shell);

    if (layout === 'slider' || layout === 'spotlight' || layout === 'marquee' || layout === 'list') {
      while (pool.firstChild) {
        wrapper.appendChild(pool.firstChild);
      }
    }

    slides = getOrderedSlides(root, { includeLimited: true });

    if (layout === 'slider') limit = getSliderLimit(root);
    else if (layout === 'spotlight') limit = getSpotlightLimit(root);
    else if (layout === 'marquee') limit = getMarqueeLimit(root);
    else if (layout === 'list') limit = getListLimit(root);
    else {
      slides.forEach(function (node) {
        node.classList.remove('df-reviews__slide--mode-limited');
      });
      setAttrIfChanged(root, 'data-list-limit', getListLimit(root));
      return;
    }

    for (i = 0; i < slides.length; i++) {
      slide = slides[i];
      if (i >= limit) {
        slide.classList.remove('swiper-slide');
        slide.classList.add('df-reviews__slide--mode-limited');
        pool.appendChild(slide);
      } else {
        slide.classList.remove('df-reviews__slide--mode-limited');
        if (layout === 'slider' || layout === 'spotlight' || layout === 'marquee') {
          slide.classList.add('swiper-slide');
        }
      }
    }

    setAttrIfChanged(root, 'data-slider-limit', getSliderLimit(root));
    setAttrIfChanged(root, 'data-spotlight-limit', getSpotlightLimit(root));
    setAttrIfChanged(root, 'data-marquee-limit', getMarqueeLimit(root));
    setAttrIfChanged(root, 'data-list-limit', getListLimit(root));
  }



  function getTotalPages(root) {
    if (shouldApplyInsalesServerPagination(root)) {
      return getInsalesServerPageCount(root);
    }

    var slides = getOrderedSlides(root);
    var pageSize = getPageSize(root);
    if (!slides.length) return 1;
    return Math.max(1, Math.ceil(slides.length / pageSize));
  }



  function getServerPageWindow(current, total, radius) {
    var pages = [];
    var seen = {};
    var candidates = [1, total];
    var i;

    radius = radius || 2;

    for (i = current - radius; i <= current + radius; i++) {
      if (i >= 1 && i <= total) candidates.push(i);
    }

    candidates.sort(function (a, b) {
      return a - b;
    });

    for (i = 0; i < candidates.length; i++) {
      if (seen[candidates[i]]) continue;
      seen[candidates[i]] = true;
      pages.push(candidates[i]);
    }

    return pages;
  }



  function renderPageControls(root) {
    var shell = getShell(root);
    var nav = shell ? shell.querySelector('[data-df-reviews-pages]') : null;
    var list = shell ? shell.querySelector('[data-df-pages-list]') : null;
    var layout = parseLayout(root.getAttribute('data-layout'));
    var totalPages;
    var current;
    var windowSize = 5;
    var startPage;
    var endPage;
    var html = '';
    var p;
    var prev;
    var next;
    var signature;

    if (!nav || !list || !usesPagination(layout)) return;

    if (usesLoadMore(layout) && !shouldApplyInsalesServerPagination(root)) {
      nav.hidden = true;
      return;
    }

    totalPages = getTotalPages(root);
    current = parseInt(root.dataset.paginationPage, 10) || 1;

    if (totalPages <= 1) {
      nav.hidden = true;
      return;
    }

    nav.hidden = false;

    if (shouldApplyInsalesServerPagination(root)) {
      var windowPages = getServerPageWindow(current, totalPages, 2);
      var prevNum = null;
      var gap;
      var wi;

      for (wi = 0; wi < windowPages.length; wi++) {
        gap = windowPages[wi] - (prevNum == null ? windowPages[wi] : prevNum);
        if (prevNum != null && gap > 1) {
          html += '<span class="df-reviews__page-void">…</span>';
        }
        prevNum = windowPages[wi];
        html +=
          '<button type="button" class="df-reviews__page' +
          (windowPages[wi] === current ? ' is-active' : '') +
          '" data-df-page="' +
          windowPages[wi] +
          '">' +
          windowPages[wi] +
          '</button>';
      }
    } else {
      startPage = Math.max(1, current - Math.floor(windowSize / 2));
      endPage = Math.min(totalPages, startPage + windowSize - 1);
      startPage = Math.max(1, endPage - windowSize + 1);

      for (p = startPage; p <= endPage; p++) {
        html +=
          '<button type="button" class="df-reviews__page' +
          (p === current ? ' is-active' : '') +
          '" data-df-page="' +
          p +
          '">' +
          p +
          '</button>';
      }
    }

    signature = html + '|' + current + '|' + totalPages;

    if (list.dataset.dfPagesSignature === signature) {
      prev = nav.querySelector('[data-df-page-prev]');
      next = nav.querySelector('[data-df-page-next]');
      if (prev) prev.disabled = current <= 1;
      if (next) next.disabled = current >= totalPages;
      return;
    }

    list.dataset.dfPagesSignature = signature;
    list.innerHTML = html;
    prev = nav.querySelector('[data-df-page-prev]');
    next = nav.querySelector('[data-df-page-next]');
    if (prev) prev.disabled = current <= 1;
    if (next) next.disabled = current >= totalPages;
  }



  function scrollToWidget(shell, alignBottom) {
    if (!shell || typeof window === 'undefined') return;
    var rect = shell.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - 16;
    var bottom = rect.bottom + window.pageYOffset - window.innerHeight + 24;

    window.scrollTo({
      top: alignBottom ? bottom : top,
      behavior: 'smooth'
    });
  }



  function scrollToLoadMoreAnchor(shell) {
    var btn;
    var top;

    if (!shell || typeof window === 'undefined') return;

    btn =
      shell.querySelector('[data-df-insales-loadmore]:not([hidden])') ||
      shell.querySelector('[data-df-reviews-more]:not([hidden])') ||
      shell.querySelector('[data-df-insales-loadmore]') ||
      shell.querySelector('[data-df-reviews-more]');

    if (!btn) {
      scrollToWidget(shell, true);
      return;
    }

    top = btn.getBoundingClientRect().top + window.pageYOffset - window.innerHeight;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });
  }



  function isInternalReviewsMutation(node) {
    if (!node || typeof node.closest !== 'function') return false;
    return !!node.closest('.df-reviews[data-danforge-widget]');
  }



  function slidesMatchVisibleIndices(root, visibleIndices) {
    var mounted = getActiveSlides(root);
    var slides = getOrderedSlides(root);
    var i;

    if (mounted.length !== visibleIndices.length) return false;

    for (i = 0; i < visibleIndices.length; i++) {
      if (mounted[i] !== slides[visibleIndices[i]]) return false;
    }

    return true;
  }



  function restoreScrollPosition(scrollY) {
    if (scrollY == null || typeof window === 'undefined') return;

    window.scrollTo(0, scrollY);

    window.requestAnimationFrame(function () {
      window.scrollTo(0, scrollY);
    });
  }



  function mountPaginationSlides(root, visibleIndices, options) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool = ensureSlidePool(shell);
    var slides = getOrderedSlides(root);
    var showMap = {};
    var animate = !options || options.animate !== false;
    var preserveScroll = options && options.preserveScroll === true;
    var scrollY = preserveScroll && typeof window !== 'undefined' ? window.pageYOffset : null;
    var i;
    var slide;
    var idx;

    if (!wrapper) return;

    if (slidesMatchVisibleIndices(root, visibleIndices)) return;

    root.dataset.dfPaginationLock = '1';

    try {
      for (i = 0; i < visibleIndices.length; i++) {
        showMap[visibleIndices[i]] = true;
      }

      for (i = 0; i < slides.length; i++) {
        slide = slides[i];
        idx = parseInt(slide.getAttribute('data-df-slide-index'), 10);
        if (isNaN(idx)) idx = i;
        var visible = !!showMap[idx];

        slide.classList.toggle('df-reviews__slide--page-hidden', !visible);
        slide.style.removeProperty('display');
        slide.classList.remove('df-reviews__slide--collapsed');
        slide.classList.remove('swiper-slide');

        if (visible) {
          wrapper.appendChild(slide);
          if (animate) {
            slide.classList.add('df-reviews__slide--entering');
            (function (node) {
              window.setTimeout(function () {
                node.classList.remove('df-reviews__slide--entering');
              }, 450);
            })(slide);
          }
        } else {
          pool.appendChild(slide);
          if (parseLayout(root.getAttribute('data-layout')) === 'masonry') {
            slide.style.gridRowEnd = '';
          }
        }
      }
    } finally {
      delete root.dataset.dfPaginationLock;
    }

    if (preserveScroll) restoreScrollPosition(scrollY);

    if (parseLayout(root.getAttribute('data-layout')) === 'masonry') {
      if (preserveScroll) {
        scheduleMasonryLayout(root, function () {
          restoreScrollPosition(scrollY);
        });
      } else {
        scheduleMasonryLayout(root);
      }
    }

    initExpandButtons(root);
    syncMasonryInlinePhotos(root);
  }



  function goToServerPage(root, page, options) {
    var targetPage = clamp(parseInt(page, 10) || 1, 1, getInsalesServerPageCount(root));
    var prevPage = parseInt(root.dataset.paginationPage, 10) || 1;
    var shell = getShell(root);
    var animate = !options || options.animate !== false;
    var scrollMode = options ? options.scroll : 'auto';
    var batchPage = getInsalesBatchPage(root);

    root.dataset.paginationMode = 'page';
    root.dataset.paginationLoaded = '';
    root.dataset.paginationPage = String(targetPage);
    root.dataset.dfPaginationState = targetPage >= getInsalesServerPageCount(root) ? 'all' : 'partial';

    if (targetPage === 1 && !isInsalesAccumulated(root) && batchPage === 1) {
      mountAllSlidesVisible(root, {
        preserveScroll: options && options.preserveScroll === true
      });
      renderPageControls(root);
      updateMoreButton(root);
      updateInsalesLoadMore(root);
      if (scrollMode === 'bottom') scrollToWidget(shell, true);
      else if (scrollMode === 'top') scrollToWidget(shell, false);
      else if (scrollMode === 'auto' && targetPage !== prevPage) scrollToWidget(shell, targetPage > prevPage);
      return Promise.resolve();
    }

    return fetchInsalesServerPage(root, targetPage, {
      replace: true,
      animate: animate,
      preserveScroll: options && options.preserveScroll === true
    }).then(function () {
      if (scrollMode === 'bottom') scrollToWidget(shell, true);
      else if (scrollMode === 'top') scrollToWidget(shell, false);
      else if (scrollMode === 'auto' && targetPage !== prevPage) scrollToWidget(shell, targetPage > prevPage);
    });
  }



  function goToPage(root, page, options) {
    if (shouldApplyInsalesServerPagination(root)) {
      return goToServerPage(root, page, options);
    }

    var pageSize = getPageSize(root);
    var slides = getOrderedSlides(root);
    var totalPages = getTotalPages(root);
    var prevPage = parseInt(root.dataset.paginationPage, 10) || 1;
    var targetPage = clamp(parseInt(page, 10) || 1, 1, totalPages);
    var start = (targetPage - 1) * pageSize;
    var end = Math.min(start + pageSize, slides.length);
    var shell = getShell(root);
    var animate = !options || options.animate !== false;
    var scrollMode = options ? options.scroll : 'auto';
    var indices = [];
    var i;

    for (i = start; i < end; i++) indices.push(i);

    root.dataset.paginationMode = 'page';
    root.dataset.paginationLoaded = '';
    root.dataset.paginationPage = String(targetPage);
    root.dataset.dfPaginationState = targetPage >= totalPages ? 'all' : 'partial';

    mountPaginationSlides(root, indices, {
      animate: animate,
      preserveScroll: options && options.preserveScroll === true
    });

    renderPageControls(root);
    updateMoreButton(root);
    updateInsalesLoadMore(root);

    if (scrollMode === 'bottom') scrollToWidget(shell, true);
    else if (scrollMode === 'top') scrollToWidget(shell, false);
    else if (scrollMode === 'auto' && targetPage !== prevPage) scrollToWidget(shell, targetPage > prevPage);
  }



  function loadMoreReviews(root, options) {
    var pageSize = getPageSize(root);
    var slides = getOrderedSlides(root);
    var totalPages = getTotalPages(root);
    var mode = root.dataset.paginationMode || 'page';
    var currentPage = parseInt(root.dataset.paginationPage, 10) || 1;
    var loadedPages = parseInt(root.dataset.paginationLoaded, 10) || 0;
    var nextLoaded;
    var shell = getShell(root);
    var animate = !options || options.animate !== false;
    var scrollMode = options && options.scroll != null ? options.scroll : false;
    var visibleCount;
    var indices = [];
    var i;

    if (mode === 'accumulate' && loadedPages > 0) {
      nextLoaded = loadedPages + 1;
    } else {
      nextLoaded = currentPage + 1;
    }

    nextLoaded = clamp(nextLoaded, 1, totalPages);
    visibleCount = Math.min(nextLoaded * pageSize, slides.length);

    for (i = 0; i < visibleCount; i++) indices.push(i);

    root.dataset.paginationMode = 'accumulate';
    root.dataset.paginationLoaded = String(nextLoaded);
    root.dataset.dfPaginationState = nextLoaded >= totalPages ? 'all' : 'partial';

    mountPaginationSlides(root, indices, { animate: animate, preserveScroll: true });

    renderPageControls(root);
    updateMoreButton(root);
    updateInsalesLoadMore(root);

    if (scrollMode === 'bottom') scrollToLoadMoreAnchor(shell);
    else if (scrollMode === 'top') scrollToWidget(shell, false);
    else if (scrollMode !== false) scrollToLoadMoreAnchor(shell);
  }



  function resetPaginationState(root) {
    root.dataset.paginationPage = '1';
    root.dataset.paginationMode = 'page';
    root.dataset.paginationLoaded = '';
    root.dataset.dfPaginationState = '';
  }



  function reapplyAccumulated(root, options) {
    var loadedPages = parseInt(root.dataset.paginationLoaded, 10);
    var pageSize = getPageSize(root);
    var slides = getOrderedSlides(root);
    var visibleCount;
    var indices = [];
    var i;

    if (isNaN(loadedPages) || loadedPages < 1) {
      loadedPages = 1;
    }

    visibleCount = Math.min(loadedPages * pageSize, slides.length);

    for (i = 0; i < visibleCount; i++) indices.push(i);

    root.dataset.paginationMode = 'accumulate';
    mountPaginationSlides(root, indices, options || { animate: false });
    renderPageControls(root);
    updateMoreButton(root);
    updateInsalesLoadMore(root);
  }



  function applyPagination(root, forceReset) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    var mode;
    var current;

    if (root.dataset.dfPaginationLock === '1') return;

    if (!usesPagination(layout)) {
      renderPageControls(root);
      return;
    }

    if (shouldApplyInsalesServerPagination(root)) {
      if (forceReset) {
        resetPaginationState(root);
        root.dataset.paginationPage = String(getInsalesBatchPage(root));
      }
      mountAllSlidesVisible(root, { preserveScroll: !forceReset });
      renderPageControls(root);
      updateMoreButton(root);
      updateInsalesLoadMore(root);
      return;
    }

    if (forceReset) {
      resetPaginationState(root);
      goToPage(root, 1, { animate: false, scroll: false });
      return;
    }

    mode = root.dataset.paginationMode || 'page';
    if (mode === 'accumulate') {
      reapplyAccumulated(root, { animate: false });
      return;
    }

    current = parseInt(root.dataset.paginationPage, 10) || 1;
    goToPage(root, current, { animate: false, scroll: false });
  }



  function updateMoreButton(root) {
    var shell = getShell(root);
    var moreBtn = shell ? shell.querySelector('[data-df-reviews-more]') : null;
    var layout = parseLayout(root.getAttribute('data-layout'));
    var current;
    var totalPages;
    var loaded;

    if (!moreBtn || !usesLoadMore(layout)) {
      if (moreBtn) moreBtn.hidden = true;
      return;
    }

    if (shouldApplyInsalesServerPagination(root)) {
      moreBtn.hidden = true;
      return;
    }

    totalPages = getTotalPages(root);
    current = parseInt(root.dataset.paginationPage, 10) || 1;

    if (
      !usesLoadMore(layout) &&
      totalPages > 1 &&
      (root.dataset.paginationMode || 'page') === 'page'
    ) {
      moreBtn.hidden = true;
      return;
    }

    if (root.dataset.paginationMode === 'accumulate') {
      loaded = parseInt(root.dataset.paginationLoaded, 10) || 1;
      moreBtn.hidden = loaded >= totalPages;
      return;
    }

    moreBtn.hidden = current >= totalPages;
  }



  function bindPageControls(root) {
    var shell = getShell(root);
    if (!shell || shell.dataset.paginationBound === 'true') return;
    shell.dataset.paginationBound = 'true';

    shell.addEventListener('click', function (event) {
      var viewport = shell.querySelector('[data-df-reviews-root]');
      var pageBtn = event.target.closest('[data-df-page]');
      var prevBtn = event.target.closest('[data-df-page-prev]');
      var nextBtn = event.target.closest('[data-df-page-next]');
      var moreBtn = event.target.closest('[data-df-reviews-more]');
      var current;
      var layout;

      if (!viewport) return;

      current = parseInt(viewport.dataset.paginationPage, 10) || 1;
      layout = parseLayout(viewport.getAttribute('data-layout'));

      if (!usesPagination(layout)) return;

      if (moreBtn && shell.contains(moreBtn) && usesLoadMore(layout)) {
        event.preventDefault();
        loadMoreReviews(viewport, { animate: true, scroll: 'append' });
        return;
      }

      if (pageBtn && shell.contains(pageBtn)) {
        goToPage(viewport, pageBtn.getAttribute('data-df-page'), {
          animate: true,
          scroll: shouldApplyInsalesServerPagination(viewport) ? 'top' : 'auto'
        });
        return;
      }

      if (prevBtn && shell.contains(prevBtn) && current > 1) {
        goToPage(viewport, current - 1, { animate: true, scroll: 'top' });
        return;
      }

      if (nextBtn && shell.contains(nextBtn) && current < getTotalPages(viewport)) {
        goToPage(viewport, current + 1, { animate: true, scroll: 'auto' });
      }
    });
  }



  function initPagination(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    if (!usesPagination(layout)) return;
    ensureSlideOrder(root);
    resetPaginationState(root);
    if (shouldApplyInsalesServerPagination(root)) {
      root.dataset.paginationPage = String(getInsalesBatchPage(root));
    }
    applyPagination(root, true);
  }



  function applyFloatingOffset(root) {
    var shell = getShell(root);
    var raw;
    var value;

    if (!shell) return;

    raw = readSetting(root, ['floating-offset', 'floating_offset'], readShellData(shell, 'floating-offset', '1.5'));
    value = parseFloat(String(raw).replace(',', '.'));
    if (isNaN(value)) value = 1.5;

    shell.style.setProperty('--df-reviews-floating-top', clamp(value, 0, 10) + 'rem');
  }



  function formatCssAspectRatio(raw) {
    var value = String(raw || '1/1').trim();
    if (!value || value === 'auto') return '';
    if (value.indexOf(' / ') !== -1) return value;
    return value.replace('/', ' / ');
  }



  function applyProductStyles(root) {
    var shell = getShell(root);
    var bg;
    var color;
    var ratio;

    if (!shell) return;

    bg = readSetting(root, ['product-bg-color', 'product_bg_color'], 'rgba(0,0,0,0.04)');
    color = readSetting(root, ['product-text-color', 'product_text_color'], '#333333');
    ratio = readSetting(
      root,
      ['product-thumb-ratio', 'product_thumb_ratio'],
      readShellData(shell, 'product-thumb-ratio', '1/1')
    );

    shell.style.setProperty('--df-reviews-product-bg', bg || 'rgba(0,0,0,0.04)');
    shell.style.setProperty('--df-reviews-product-color', color || '#333333');
    shell.classList.toggle('df-reviews--product-thumb-auto', String(ratio).trim() === 'auto');

    if (String(ratio).trim() === 'auto') {
      shell.style.removeProperty('--df-reviews-product-thumb-ratio');
    } else {
      shell.style.setProperty('--df-reviews-product-thumb-ratio', formatCssAspectRatio(ratio));
    }
  }



  function syncMasonryInlinePhotos(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    var isMasonry = layout === 'masonry';

    getRawSlides(root).forEach(function (slide) {
      var existing = slide.querySelector(':scope > .df-reviews__photos');
      var urls;
      var previews;
      var photosHost;
      var insertAfter;

      if (!isMasonry) {
        if (existing) existing.remove();
        return;
      }

      urls = getSlidePhotoUrls(slide);
      if (!urls.length) {
        if (existing) existing.remove();
        return;
      }

      previews = getSlidePhotoPreviews(slide);
      insertAfter = slide.querySelector('.df-reviews__expand') || slide.querySelector('.df-reviews__text');
      photosHost = existing;

      if (!photosHost) {
        photosHost = document.createElement('div');
        photosHost.className = 'df-reviews__photos';
      }

      photosHost.innerHTML = '';
      urls.forEach(function (full, index) {
        var preview;
        var photoBtn;

        if (!full) return;

        preview = previews[index] || photoPreviewUrl(full);
        photoBtn = document.createElement('button');
        photoBtn.type = 'button';
        photoBtn.className = 'df-reviews__photo';
        photoBtn.setAttribute('data-photo-index', String(index));
        photoBtn.setAttribute('data-photo-full', full);
        photoBtn.innerHTML = '<img src="' + escapeAttr(preview) + '" alt="" loading="lazy">';
        photosHost.appendChild(photoBtn);
      });

      if (insertAfter) {
        insertAfter.insertAdjacentElement('afterend', photosHost);
      } else if (photosHost.parentNode !== slide) {
        slide.appendChild(photosHost);
      }
    });

    if (isMasonry) scheduleMasonryLayout(root);
  }



  function applyMarqueeSpeed(root) {
    var shell = getShell(root);
    var desktop;
    var mobile;
    var speed;

    if (!shell) return;
    if (parseLayout(root.getAttribute('data-layout')) !== 'marquee') return;

    desktop = parseSettingInt(root, ['marquee-speed', 'marquee_speed'], 40, 10, 120);
    mobile = parseSettingInt(root, ['marquee-speed-mobile', 'marquee_speed_mobile'], desktop, 10, 120);
    speed = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 639px)').matches
      ? mobile
      : desktop;

    shell.style.setProperty('--df-marquee-duration', speed + 's');
    setAttrIfChanged(root, 'data-marquee-speed', speed);
    setAttrIfChanged(root, 'data-marquee-speed-mobile', mobile);
  }



  function hasReviewSlides(root) {
    var shell = getShell(root);
    var fragment;
    var i;
    var n;

    if (!shell) return false;
    if (shell.querySelectorAll('.df-reviews__slide:not(.df-reviews__slide--empty)').length > 0) {
      return true;
    }

    fragment = root._dfYandexLazyFragment;
    if (fragment && fragment.childNodes.length) return true;

    n = parseInt(root.getAttribute('data-yandex-count'), 10);
    return !isNaN(n) && n > 0;
  }



  function getVisibleSlides(root) {
    return getDisplayedSlides(root);
  }



  function reinitSwiperIfNeeded(root, layout) {
    if (layout !== 'slider' && layout !== 'spotlight') return;
    destroyExternalSwiper(root);
    applyModeLimits(root, layout);
    if (layout === 'slider') initSlider(root);
    else initSpotlight(root);
  }



  function syncLayoutClasses(root, layout) {
    var shell = getShell(root);
    var layouts = ['slider', 'masonry', 'grid', 'list', 'spotlight', 'marquee'];
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var usesSwiper = layout === 'slider' || layout === 'spotlight';
    var usesMarquee = layout === 'marquee';
    var i;

    if (shell) {
      for (i = 0; i < layouts.length; i++) {
        shell.classList.toggle('df-reviews--layout-' + layouts[i], layouts[i] === layout);
      }

      var actions = shell.querySelector('.df-reviews__actions');
      if (actions) {
        actions.classList.toggle('df-reviews__actions--floating', usesFloatingActions(layout));
      }

      var cta = shell.querySelector('.df-reviews__cta');
      if (cta) {
        cta.classList.toggle('df-reviews__cta--floating', usesFloatingActions(layout));
      }
    }

    root.setAttribute('data-layout', layout);
    root.classList.toggle('df-reviews__slider', usesSwiper);
    root.classList.toggle('df-reviews__marquee-root', usesMarquee);
    root.classList.remove('swiper');

    if (wrapper) {
      wrapper.classList.toggle('swiper-wrapper', usesSwiper || usesMarquee);
      wrapper.classList.toggle('df-reviews__grid', !usesSwiper && !usesMarquee);
    }
  }



  function destroyExternalSwiper(root) {
    if (root.dfReviewsSwiper && root.dfReviewsSwiper.destroy) {
      root.dfReviewsSwiper.destroy(true, true);
      root.dfReviewsSwiper = null;
    }

    if (root.swiper && root.swiper.destroy && root.swiper !== root.dfReviewsSwiper) {
      try {
        root.swiper.destroy(true, true);
      } catch (ignore) {}
      root.swiper = null;
    }
  }



  function initLayoutMode(root, layout) {
    syncLayoutClasses(root, layout);
    destroyExternalSwiper(root);
    prepareStaticLayout(root, layout);

    if (usesPagination(layout)) {
      restoreAllSlidesToWrapper(root);
      initPagination(root);
      return;
    }

    applyModeLimits(root, layout);

    if (layout === 'marquee') {
      resetMarqueeState(root);
      applyMarqueeSpeed(root);
      initMarquee(root);
      return;
    }

    if (layout === 'spotlight') {
      initSpotlight(root);
      return;
    }

    if (layout === 'slider') {
      initSlider(root);
      return;
    }
  }



  function markResponsiveState(root) {
    root.dataset.dfViewportBp = getViewportBreakpoint();
    root.dataset.dfLastPageSize = String(getPageSize(root));
    root.dataset.dfLastColumns = String(getEffectiveColumns(root));
  }



  function handleResponsiveLayoutChange(root) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    var bp;
    var prevBp;
    var prevPageSize;
    var prevColumns;
    var newPageSize;
    var newColumns;
    var changed;

    if (layout !== 'masonry' && layout !== 'grid' && layout !== 'list') return;

    bp = getViewportBreakpoint();
    prevBp = root.dataset.dfViewportBp || bp;
    prevPageSize = parseInt(root.dataset.dfLastPageSize, 10);
    prevColumns = parseInt(root.dataset.dfLastColumns, 10);
    newPageSize = getPageSize(root);
    newColumns = getEffectiveColumns(root);

    if (isNaN(prevPageSize)) prevPageSize = newPageSize;
    if (isNaN(prevColumns)) prevColumns = newColumns;

    changed = bp !== prevBp || newPageSize !== prevPageSize || newColumns !== prevColumns;

    if (!changed) {
      if (layout === 'masonry') scheduleMasonryLayout(root);
      return;
    }

    applyEffectiveColumnClasses(root);
    prepareStaticLayout(root, layout);

    if (usesPagination(layout)) {
      ensureSlideOrder(root);
      resetPaginationState(root);
      applyPagination(root, true);
    }

    markResponsiveState(root);

    if (layout === 'masonry') scheduleMasonryLayout(root);
  }



  function bindResponsiveLayoutResize() {
    if (typeof window === 'undefined' || window._dfResponsiveLayoutBound) return;

    window._dfResponsiveLayoutBound = true;

    var timer;

    window.addEventListener('resize', function () {
      if (timer) clearTimeout(timer);

      timer = setTimeout(function () {
        timer = null;
        document.querySelectorAll(ROOT_SELECTOR).forEach(handleResponsiveLayoutChange);
      }, REFRESH_DEBOUNCE_MS);
    });
  }



  function refreshWidgetSettings(root) {
    var layout;
    var prevLayout = root.dataset.dfReviewsLayout || parseLayout(root.getAttribute('data-layout'));
    var prevPageSize = getPageSize(root);
    var prevColumns = getEffectiveColumns(root);
    var prevBreakpoint = root.dataset.dfViewportBp || getViewportBreakpoint();
    var prevSliderLimit = getSliderLimit(root);
    var prevSpotlightLimit = getSpotlightLimit(root);
    var settingsKey;

    if (root.dataset.dfSyncLock === '1') return;
    root.dataset.dfSyncLock = '1';

    try {
      syncSettingsFromLayout(root);
      settingsKey = getEditorSettingsKey(root);

      if (root.dataset.dfSettingsKey === settingsKey) return;

      root.dataset.dfSettingsKey = settingsKey;
      applyVisibility(root);
      applyInsalesProductAvatars(root);
      applyProductStyles(root);
      syncMasonryInlinePhotos(root);

      layout = parseLayout(root.getAttribute('data-layout'));
      prepareStaticLayout(root, layout);

      if (layout !== prevLayout) {
        resetMarqueeState(root);
        destroyExternalSwiper(root);
        root.dataset.marqueeReady = '';
        resetPaginationState(root);
        initLayoutMode(root, layout);
        root.dataset.dfReviewsLayout = layout;
        markResponsiveState(root);
        return;
      }

      if (usesPagination(layout)) {
        if (
          getPageSize(root) !== prevPageSize ||
          getEffectiveColumns(root) !== prevColumns ||
          getViewportBreakpoint() !== prevBreakpoint
        ) {
          ensureSlideOrder(root);
          resetPaginationState(root);
          applyPagination(root, true);
        }

        markResponsiveState(root);

        if (layout === 'masonry') scheduleMasonryLayout(root);
      } else {
        applyModeLimits(root, layout);
        applyMarqueeSpeed(root);

        if (layout === 'slider' && getSliderLimit(root) !== prevSliderLimit) {
          reinitSwiperIfNeeded(root, layout);
        } else if (layout === 'spotlight' && getSpotlightLimit(root) !== prevSpotlightLimit) {
          reinitSwiperIfNeeded(root, layout);
        } else if (layout === 'marquee') {
          resetMarqueeState(root);
          initMarquee(root);
        }
      }
    } finally {
      root.dataset.dfSyncLock = '';
    }
  }



  function scheduleRefreshWidgetSettings(root) {
    if (root._dfRefreshTimer) clearTimeout(root._dfRefreshTimer);
    root._dfRefreshTimer = setTimeout(function () {
      root._dfRefreshTimer = null;
      refreshWidgetSettings(root);
    }, REFRESH_DEBOUNCE_MS);
  }



  function initWidget(root) {

    var shell = getShell(root);
    var layout = parseLayout(root.getAttribute('data-layout'));
    var prevLayout = root.dataset.dfReviewsLayout || '';
    var slides;

    initOverlays(shell);

    if (root.dataset.dfReviewsReady === 'true' && prevLayout === layout) {
      return;
    }

    syncSettingsFromLayout(root);

    applyFloatingOffset(root);

    applyProductStyles(root);

    if (shell) {
      applyReviewTextAlign(
        shell,
        readSetting(root, ['review-text-align', 'review_text_align'], readShellData(shell, 'review-text-align', 'center'))
      );
    }

    applyVisibility(root);

    watchVisibility(root);

    watchLayoutSettings(root);

    filterSlides(root);

    migrateCardPhotos(root);

    applyInsalesProductAvatars(root);

    stashYandexSlidesLazy(root);

    initSourceTabs(root);

    applyInitialSourceTab(root);

    updateSourceTabCounts(root);

    if (usesPagination(parseLayout(root.getAttribute('data-layout')))) {
      ensureSlideOrder(root);
    }

    bindLightboxPhotos(root);

    bindInsalesLoadMore(root);
    syncInsalesLoadMoreUrl(root);

    bindPageControls(root);

    initExpandButtons(root);

    syncMasonryInlinePhotos(root);



    if (root.dataset.dfReviewsReady === 'true' && prevLayout !== layout) {

      resetMarqueeState(root);

      destroyExternalSwiper(root);

      root.dataset.marqueeReady = '';

      resetPaginationState(root);

    }

    root.dataset.dfReviewsReady = 'true';

    slides = getVisibleSlides(root);



    if (!hasReviewSlides(root)) {

      showEmptyState(root);

      return;

    }



    if (!slides.length && isSourceTabsEnabled(root)) {

      switchSourceTab(root, getActiveSourceTab(root));

      slides = getVisibleSlides(root);

    }



    if (!slides.length) {

      showEmptyState(root);

      return;

    }



    initLayoutMode(root, layout);

    markResponsiveState(root);

    root.dataset.dfReviewsLayout = layout;

    root.dataset.dfSettingsKey = getEditorSettingsKey(root);

    toggleSchema(root);

  }



  function initSlider(root) {
    whenSwiperReady(function () {
      if (root.dfReviewsSwiper) return;

    var slides = getVisibleSlides(root);

    var slideCount = slides.length;

    if (!slideCount) return;



    var mobile = clamp(parseInt(root.dataset.slidesMobile, 10) || 1, 1, 4);

    var tablet = clamp(parseInt(root.dataset.slidesTablet, 10) || 2, 1, 4);

    var desktop = clamp(parseInt(root.dataset.slidesDesktop, 10) || 3, 1, 4);

    var speed = parseInt(root.dataset.speed, 10) || 400;

    var enableAutoplay = parseBool(root.getAttribute('data-autoplay'), false);

    var delay = parseInt(root.dataset.autoplayDelay, 10) || 5000;

    var showArrows = parseBool(root.getAttribute('data-show-arrows'), true);



    if (showArrows) root.classList.add('df-reviews__slider--arrows');



    var loop = false;

    var config = {

      slidesPerView: mobile,

      spaceBetween: 16,

      speed: speed,

      watchOverflow: true,

      loop: loop,

      rewind: slideCount > 1,

      pagination: {

        el: root.querySelector('.df-reviews__pagination'),

        clickable: true

      },

      breakpoints: {

        640: { slidesPerView: tablet, spaceBetween: 20 },

        992: { slidesPerView: desktop, spaceBetween: 24 }

      }

    };



    if (showArrows) {

      config.navigation = {

        nextEl: root.querySelector('.df-reviews__arrow--next'),

        prevEl: root.querySelector('.df-reviews__arrow--prev')

      };

    }



    if (enableAutoplay && slideCount > 1) {

      config.autoplay = {

        delay: delay,

        disableOnInteraction: false,

        pauseOnMouseEnter: true

      };

    }



    root.classList.add('swiper');

    var swiper = new Swiper(root, config);

    root.dfReviewsSwiper = swiper;

    });

  }



  function initSpotlight(root) {
    whenSwiperReady(function () {
      if (root.dfReviewsSwiper) return;

    var slides = getVisibleSlides(root);

    if (!slides.length) return;



    var speed = parseInt(root.dataset.speed, 10) || 400;

    var enableAutoplay = parseBool(root.getAttribute('data-autoplay'), true);

    var delay = parseInt(root.dataset.autoplayDelay, 10) || 6000;

    var showArrows = parseBool(root.getAttribute('data-show-arrows'), true);



    if (showArrows) root.classList.add('df-reviews__slider--arrows');



    var config = {

      slidesPerView: 1,

      spaceBetween: 0,

      speed: speed,

      centeredSlides: true,

      watchOverflow: true,

      loop: false,

      rewind: slides.length > 1,

      pagination: {

        el: root.querySelector('.df-reviews__pagination'),

        clickable: true

      }

    };



    if (showArrows) {

      config.navigation = {

        nextEl: root.querySelector('.df-reviews__arrow--next'),

        prevEl: root.querySelector('.df-reviews__arrow--prev')

      };

    }



    if (enableAutoplay && slides.length > 1) {

      config.autoplay = {

        delay: delay,

        disableOnInteraction: false,

        pauseOnMouseEnter: true

      };

    }



    root.classList.add('swiper');

    root.dfReviewsSwiper = new Swiper(root, config);

    });

  }



  function bindSwiperLateInit() {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', function () {
      document.querySelectorAll(ROOT_SELECTOR).forEach(function (root) {
        var layout = parseLayout(root.getAttribute('data-layout'));

        if ((layout === 'slider' || layout === 'spotlight') && !root.dfReviewsSwiper) {
          if (layout === 'slider') initSlider(root);
          else initSpotlight(root);
        }
      });
    });
  }



  function initMarquee(root, tabSource) {
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var slides;
    var track;
    var clone;
    var slide;
    var source;

    if (!wrapper) return;

    resetMarqueeState(root);
    applyMarqueeViewportContainment(root);
    applyModeLimits(root, 'marquee');
    applyMarqueeSpeed(root);
    dedupeSlidesInWrapper(wrapper);

    slides = getActiveSlides(root);
    if (!slides.length) return;

    root.dataset.marqueeReady = 'true';

    slides.forEach(function (node) {
      slide = node;
      slide.classList.add('swiper-slide');
      slide.style.width = '280px';
      slide.style.flexShrink = '0';
      slide.style.marginRight = '1rem';
    });

    wrapper.style.display = 'flex';
    wrapper.style.width = 'max-content';
    wrapper.style.flexShrink = '0';
    wrapper.style.transform = 'translate3d(0, 0, 0)';

    track = document.createElement('div');
    track.className = 'df-reviews__marquee-track';
    wrapper.parentNode.insertBefore(track, wrapper);
    track.appendChild(wrapper);

    clone = wrapper.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.add('df-reviews__marquee-clone');
    clone.removeAttribute('data-df-reviews-wrapper');
    clone.style.transform = 'translate3d(0, 0, 0)';
    track.appendChild(clone);

    source = tabSource || getActiveSourceTab(root) || getDefaultSourceTab(root);

    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(function () {
        applyMarqueeOffsetForTab(root, source);
      });
    }
  }



  function shouldDeferYandexSlides(root) {
    if (!isSourceTabsEnabled(root)) return false;
    return getDefaultSourceTab(root) !== 'yandex';
  }



  function stashYandexSlidesLazy(root) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var slides;
    var i;
    var n;
    var fragment;

    if (!shouldDeferYandexSlides(root) || !shell || !wrapper || root._dfYandexLazyFragment) {
      return;
    }

    slides = wrapper.querySelectorAll(
      '.df-reviews__slide[data-source="yandex"]:not(.df-reviews__slide--empty)'
    );
    if (!slides.length) return;

    n = 0;
    fragment = document.createDocumentFragment();
    for (i = 0; i < slides.length; i++) {
      fragment.appendChild(slides[i]);
      n++;
    }

    setAttrIfChanged(root, 'data-yandex-count', n);
    root._dfYandexLazyFragment = fragment;
    root._dfYandexLazyMounted = false;
  }



  function mountYandexSlidesLazy(root) {
    var shell;
    var pool;
    var fragment;

    if (root._dfYandexLazyMounted) return;

    fragment = root._dfYandexLazyFragment;
    if (!fragment || !fragment.childNodes.length) return;

    shell = getShell(root);
    if (!shell) return;

    pool = ensureSlidePool(shell);
    pool.appendChild(fragment);
    root._dfYandexLazyMounted = true;
    root._dfYandexLazyFragment = null;
  }



  function ensureYandexCount(root) {
    if (root.getAttribute('data-yandex-count')) return;

    var shell = getShell(root);
    var fragment = root._dfYandexLazyFragment;
    var n = 0;
    var i;
    var node;

    if (fragment) {
      for (i = 0; i < fragment.childNodes.length; i++) {
        node = fragment.childNodes[i];
        if (node.nodeType !== 1) continue;
        if (!node.classList.contains('df-reviews__slide--empty')) n++;
      }
      if (n) {
        setAttrIfChanged(root, 'data-yandex-count', n);
        return;
      }
    }

    if (shell) {
      n = shell.querySelectorAll('.df-reviews__slide[data-source="yandex"]:not(.df-reviews__slide--empty)').length;
    }
    setAttrIfChanged(root, 'data-yandex-count', n);
  }



  function getSourceTotalCount(root, source) {
    var shell = getShell(root);
    var n;

    if (source === 'insales') {
      n = parseInt(root.getAttribute('data-insales-count'), 10);
      if (!isNaN(n) && n >= 0) return n;
    }

    if (source === 'yandex') {
      ensureYandexCount(root);
      n = parseInt(root.getAttribute('data-yandex-count'), 10);
      if (!isNaN(n) && n >= 0) return n;
    }

    if (!shell) return 0;

    return shell.querySelectorAll(
      '.df-reviews__slide[data-source="' + source + '"]:not(.df-reviews__slide--empty)'
    ).length;
  }



  function updateSourceTabCounts(root) {
    var shell = getShell(root);
    var tabs = shell ? shell.querySelector('[data-df-reviews-tabs]') : null;
    var layout = parseLayout(root.getAttribute('data-layout'));
    var showCounts = shouldShowTabCounts(layout);
    var i;
    var btn;
    var source;
    var countEl;

    if (!tabs) return;

    ensureYandexCount(root);

    tabs.querySelectorAll('[data-source-tab]').forEach(function (tabBtn) {
      source = tabBtn.getAttribute('data-source-tab') || '';
      countEl = tabBtn.querySelector('[data-df-tab-count]');
      if (countEl) {
        if (showCounts) {
          countEl.hidden = false;
          countEl.textContent = String(getSourceTotalCount(root, source));
        } else {
          countEl.hidden = true;
          countEl.textContent = '';
        }
      }
    });
  }



  function isSourceTabsEnabled(root) {
    return parseBool(root.getAttribute('data-source-tabs'), false);
  }



  function getDefaultSourceTab(root) {
    var preset = root.getAttribute('data-default-source-tab') || '';
    if (preset === 'insales' || preset === 'yandex') return preset;
    if (!resolveHideFlag(root, 'data-hide-yandex')) return 'yandex';
    if (!resolveHideFlag(root, 'data-hide-insales')) return 'insales';
    return 'yandex';
  }



  function getActiveSourceTab(root) {
    if (!isSourceTabsEnabled(root)) return null;
    return root._dfActiveSourceTab || getDefaultSourceTab(root);
  }



  function applySourceVisibility(root, source) {
    var shell = getShell(root);
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var pool = shell ? ensureSlidePool(shell) : null;
    var layout = parseLayout(root.getAttribute('data-layout'));
    var slides = shell ? shell.querySelectorAll('.df-reviews__slide') : [];
    var showAll = !source;
    var i;
    var slide;
    var slideSource;
    var visible;

    for (i = 0; i < slides.length; i++) {
      slide = slides[i];
      if (slide.classList.contains('df-reviews__slide--empty')) continue;
      if (slide.closest('.df-reviews__marquee-clone')) continue;
      slideSource = (slide.dataset.source || '').toLowerCase();
      visible = showAll || slideSource === source;
      slide.classList.toggle('is-hidden', !visible);
      slide.classList.toggle('df-reviews__slide--source-hidden', !visible);

      if (visible) {
        if (wrapper && slide.parentNode !== wrapper && !slide.classList.contains('df-reviews__slide--page-hidden')) {
          wrapper.appendChild(slide);
        }
        slide.style.removeProperty('display');
      } else if (pool) {
        pool.appendChild(slide);
        slide.style.display = 'none';
        if (layout === 'masonry') slide.style.gridRowEnd = '';
      } else {
        slide.style.display = 'none';
      }
    }
  }



  function reindexSlides(root) {
    ensureSlideOrder(root);
  }



  function switchSourceTab(root, source) {
    var layout = parseLayout(root.getAttribute('data-layout'));
    var tabsEnabled = isSourceTabsEnabled(root);
    var prevSource = tabsEnabled ? root._dfActiveSourceTab || getDefaultSourceTab(root) : null;

    if (layout === 'marquee') {
      if (tabsEnabled && prevSource) saveMarqueeOffsetForTab(root, prevSource);
      resetMarqueeState(root);
    }

    if (source === 'yandex') {
      mountYandexSlidesLazy(root);
    }

    if (usesPagination(layout)) {
      restoreAllSlidesToWrapper(root);
    }

    if (tabsEnabled) {
      root._dfActiveSourceTab = source;
      applySourceVisibility(root, source);
    } else {
      root._dfActiveSourceTab = null;
      applySourceVisibility(root, null);
    }

    reindexSlides(root);
    resetPaginationState(root);
    applyModeLimits(root, layout);

    if (usesPagination(layout)) {
      applyPagination(root, true);
    } else if (layout === 'marquee') {
      applyMarqueeSpeed(root);
      initMarquee(root, source);
    } else if (layout === 'slider' || layout === 'spotlight') {
      reinitSwiperIfNeeded(root, layout);
    }

    if (layout === 'masonry') scheduleMasonryLayout(root);
    updateMoreButton(root);
    renderPageControls(root);
    updateInsalesLoadMore(root);
    updateSourceTabCounts(root);
    initExpandButtons(root);
    syncMasonryInlinePhotos(root);
  }



  function applyInitialSourceTab(root) {
    if (isSourceTabsEnabled(root)) {
      switchSourceTab(root, getDefaultSourceTab(root));
    } else {
      switchSourceTab(root, null);
    }
  }



  function updateInsalesLoadMore(root) {
    var shell = getShell(root);
    var wrap = shell ? shell.querySelector('[data-df-insales-pagination]') : null;
    var btn = shell ? shell.querySelector('[data-df-insales-loadmore]') : null;
    var layout = parseLayout(root.getAttribute('data-layout'));
    var enabled = parseBool(root.getAttribute('data-insales-ajax-enabled'), true);
    var active = getActiveSourceTab(root);
    var show = false;

    if (shouldApplyInsalesServerPagination(root)) {
      show =
        enabled &&
        getInsalesBatchPage(root) < getInsalesServerPageCount(root) &&
        (!active || active === 'insales');
    } else {
      show =
        usesLoadMore(layout) &&
        enabled &&
        hasMoreInsalesOnServer(root) &&
        isAtEndOfLoadedPagination(root) &&
        (!active || active === 'insales');
    }

    if (wrap) wrap.hidden = !show;
    if (btn) btn.hidden = !show;

    if (show) {
      var moreBtn = shell ? shell.querySelector('[data-df-reviews-more]') : null;
      if (moreBtn) moreBtn.hidden = true;
      syncInsalesLoadMoreUrl(root);
    }
  }



  function bindInsalesLoadMore(root) {
    var shell = getShell(root);
    if (!shell || shell.dataset.insalesLoadmoreBound === 'true') return;
    shell.dataset.insalesLoadmoreBound = 'true';

    shell.addEventListener('click', function (event) {
      var btn = event.target.closest('[data-df-insales-loadmore]');
      var viewport;
      if (!btn || !shell.contains(btn)) return;
      event.preventDefault();
      viewport = shell.querySelector('[data-df-reviews-root]');
      if (!viewport) return;
      loadInsalesPage(viewport, btn.getAttribute('data-url') || '');
    });
  }



  function fetchInsalesServerPage(root, pageNum, options) {
    options = options || {};
    var shell = getShell(root);
    var btn = shell ? shell.querySelector('[data-df-insales-loadmore]') : null;
    var wrap = shell ? shell.querySelector('[data-df-insales-pagination]') : null;
    var scrollY = options.preserveScroll && typeof window !== 'undefined' ? window.scrollY : null;
    var layout = parseLayout(root.getAttribute('data-layout'));
    var targetPage = clamp(parseInt(pageNum, 10) || 1, 1, getInsalesServerPageCount(root));
    var append = options.append === true;
    var fetchUrl = options.url || buildInsalesPageUrl(root, targetPage);
    var isLoadMoreBtn = options.useButtonState === true;

    if (!fetchUrl || !parseBool(root.getAttribute('data-insales-ajax-enabled'), true)) {
      return Promise.reject(new Error('InSales AJAX disabled'));
    }

    if (isLoadMoreBtn && btn) {
      btn.disabled = true;
      btn.dataset.loading = 'true';
      btn.dataset.error = '';
      if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Загружаем…';
    }

    return fetch(fetchUrl, { credentials: 'same-origin' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var newSlides = extractInsalesSlidesFromResponse(doc, root);
        var nextUrl = extractLoadmoreUrlFromResponse(doc);
        var newPagination = doc.querySelector('[data-df-insales-pagination], .pagination_container');
        var seen = {};
        var uniqueSlides = [];
        var i;
        var slide;
        var reviewId;
        var addedCount;

        if (!newSlides.length) {
          throw new Error('No insales reviews in response');
        }

        getOrderedSlides(root).forEach(function (node) {
          if ((node.getAttribute('data-source') || '').toLowerCase() !== 'insales') return;
          reviewId = node.getAttribute('data-review-id') || '';
          if (reviewId) seen[reviewId] = true;
        });

        for (i = 0; i < newSlides.length; i++) {
          slide = newSlides[i];
          reviewId = slide.getAttribute('data-review-id') || '';
          if (reviewId && seen[reviewId]) continue;
          if (reviewId) seen[reviewId] = true;
          uniqueSlides.push(slide);
        }

        if (!uniqueSlides.length && append) {
          throw new Error('No new insales reviews');
        }

        addedCount = insertInsalesSlides(root, uniqueSlides, append);

        if (!addedCount && !append) {
          throw new Error('No insales reviews inserted');
        }

        root.setAttribute('data-insales-batch-page', String(targetPage));
        syncInsalesBatchPageAfterLoad(root, doc, fetchUrl);

        if (append) {
          root.dataset.paginationMode = 'accumulate';
          root.dataset.paginationPage = String(targetPage);
        } else {
          root.dataset.paginationMode = 'page';
          root.dataset.paginationLoaded = '';
          root.dataset.paginationPage = String(targetPage);
        }

        root.dataset.dfPaginationState =
          targetPage >= getInsalesServerPageCount(root) ? 'all' : 'partial';

        if (wrap && newPagination) {
          var fetchedBtn = newPagination.querySelector('[data-df-insales-loadmore], .loadmore_button');
          if (fetchedBtn && fetchedBtn.getAttribute('data-url')) {
            syncInsalesLoadmoreButton(root, fetchedBtn.getAttribute('data-url'));
          } else {
            syncInsalesLoadMoreUrl(root, true);
          }
        } else if (nextUrl) {
          syncInsalesLoadmoreButton(root, nextUrl);
        } else {
          syncInsalesLoadMoreUrl(root, true);
        }

        migrateCardPhotos(root);
        applyInsalesProductAvatars(root);
        syncMasonryInlinePhotos(root);
        updateSourceTabCounts(root);

        if (isSourceTabsEnabled(root)) {
          switchSourceTab(root, getActiveSourceTab(root));
        }

        ensureSlideOrder(root);
        mountAllSlidesVisible(root, { preserveScroll: options.preserveScroll === true });
        renderPageControls(root);
        updateMoreButton(root);
        updateInsalesLoadMore(root);

        if (options.preserveScroll && typeof window !== 'undefined') {
          window.scrollTo(0, scrollY);
        } else if (options.scrollAfterAppend) {
          scrollToLoadMoreAnchor(shell);
        } else if (!append) {
          scrollToWidget(shell, false);
        }

        if (layout === 'masonry') {
          if (options.scrollAfterAppend) {
            scheduleMasonryLayout(root, function () {
              scrollToLoadMoreAnchor(shell);
            });
          } else if (options.preserveScroll) {
            scheduleMasonryLayout(root, function () {
              restoreScrollPosition(scrollY);
            });
          } else {
            scheduleMasonryLayout(root);
          }
        }
      })
      .catch(function () {
        if (isLoadMoreBtn && btn) {
          btn.dataset.error = 'true';
          btn.hidden = false;
          btn.textContent = 'Не удалось загрузить';
        }
        throw new Error('InSales fetch failed');
      })
      .finally(function () {
        if (isLoadMoreBtn && btn) {
          btn.disabled = false;
          btn.dataset.loading = '';
          if (btn.dataset.error !== 'true' && btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
          }
        }
        updateInsalesLoadMore(root);
      });
  }



  function loadInsalesPage(root, url) {
    var shell = getShell(root);
    var layout = parseLayout(root.getAttribute('data-layout'));
    var nextPage = getInsalesBatchPage(root) + 1;

    if (shouldApplyInsalesServerPagination(root)) {
      scrollToLoadMoreAnchor(shell);
      fetchInsalesServerPage(root, nextPage, {
        append: true,
        url: url || buildInsalesLoadMoreUrl(root),
        useButtonState: true,
        preserveScroll: false,
        scrollAfterAppend: true
      }).catch(function () {});
      return;
    }

    var btn = shell ? shell.querySelector('[data-df-insales-loadmore]') : null;
    var wrap = shell ? shell.querySelector('[data-df-insales-pagination]') : null;
    var wrapper = root.querySelector('[data-df-reviews-wrapper]');
    var fetchUrl = url || buildInsalesLoadMoreUrl(root);
    var addedCount = 0;
    var prevSlideCount = getOrderedSlides(root).length;

    if (!fetchUrl || !wrapper || !parseBool(root.getAttribute('data-insales-ajax-enabled'), true)) return;

    scrollToLoadMoreAnchor(shell);

    if (btn) {
      btn.disabled = true;
      btn.dataset.loading = 'true';
      btn.dataset.error = '';
      if (!btn.dataset.originalText) btn.dataset.originalText = btn.textContent;
      btn.textContent = 'Загружаем…';
    }

    fetch(fetchUrl, { credentials: 'same-origin' })
      .then(function (resp) {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        return resp.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var newSlides = extractInsalesSlidesFromResponse(doc, root);
        var nextUrl = extractLoadmoreUrlFromResponse(doc);
        var newPagination = doc.querySelector('[data-df-insales-pagination]');
        var seen = {};
        var i;
        var slide;
        var reviewId;

        if (!newSlides.length) {
          throw new Error('No insales reviews in response');
        }

        wrapper.querySelectorAll('.df-reviews__slide[data-source="insales"]').forEach(function (node) {
          reviewId = node.getAttribute('data-review-id') || '';
          if (reviewId) seen[reviewId] = true;
        });

        for (i = 0; i < newSlides.length; i++) {
          slide = newSlides[i];
          reviewId = slide.getAttribute('data-review-id') || '';
          if (reviewId && seen[reviewId]) continue;
          if (reviewId) seen[reviewId] = true;
          wrapper.appendChild(slide);
          addedCount += 1;
        }

        if (!addedCount) {
          throw new Error('No new insales reviews');
        }

        syncInsalesBatchPageAfterLoad(root, doc, fetchUrl);

        if (wrap && newPagination) {
          wrap.innerHTML = newPagination.innerHTML;
        } else if (nextUrl) {
          syncInsalesLoadmoreButton(root, nextUrl);
        } else {
          syncInsalesLoadMoreUrl(root, true);
        }

        migrateCardPhotos(root);

        applyInsalesProductAvatars(root);
        syncMasonryInlinePhotos(root);

        updateSourceTabCounts(root);

        if (isSourceTabsEnabled(root)) {
          switchSourceTab(root, getActiveSourceTab(root));
        }

        ensureSlideOrder(root);
        if (usesPagination(layout)) {
          expandPaginationAfterInsalesLoad(root);
        } else {
          updateMoreButton(root);
          updateInsalesLoadMore(root);
        }

        if (layout === 'masonry') {
          scheduleMasonryLayout(root, function () {
            scrollToLoadMoreAnchor(shell);
          });
        } else {
          scrollToLoadMoreAnchor(shell);
        }
      })
      .catch(function () {
        if (btn) {
          btn.dataset.error = 'true';
          btn.hidden = false;
          btn.textContent = 'Не удалось загрузить';
        }
      })
      .finally(function () {
        if (btn) {
          btn.disabled = false;
          btn.dataset.loading = '';
          if (btn.dataset.error !== 'true' && btn.dataset.originalText) {
            btn.textContent = btn.dataset.originalText;
          }
        }
        updateInsalesLoadMore(root);
      });
  }



  function updateSourceTabsVisibility(root) {

    var shell = root.closest('.df-reviews');

    if (!shell) return;

    var tabs = shell.querySelector('[data-df-reviews-tabs]');

    if (!tabs) return;

    if (!parseBool(root.getAttribute('data-source-tabs'), false)) {

      tabs.hidden = true;

      return;

    }



    var hideInsales = resolveHideFlag(root, 'data-hide-insales');

    var hideYandex = resolveHideFlag(root, 'data-hide-yandex');



    tabs.querySelectorAll('[data-source-tab]').forEach(function (tabBtn) {

      var source = tabBtn.getAttribute('data-source-tab') || '';

      var visible = true;

      if (source === 'insales') visible = !hideInsales;

      if (source === 'yandex') visible = !hideYandex;

      tabBtn.hidden = !visible;

      tabBtn.style.display = visible ? '' : 'none';

    });



    var visibleTabs = tabs.querySelectorAll('[data-source-tab]:not([hidden])');

    if (!visibleTabs.length) {

      tabs.hidden = true;

      return;

    }



    if (visibleTabs.length === 1) {

      tabs.hidden = true;

      switchSourceTab(root, visibleTabs[0].getAttribute('data-source-tab') || getDefaultSourceTab(root));

      return;

    }



    tabs.hidden = false;



    var active = tabs.querySelector('.df-reviews__tab.is-active');

    if (active && active.hidden) {

      active.classList.remove('is-active');

      var firstVisible = tabs.querySelector('[data-source-tab]:not([hidden])');

      if (firstVisible) {

        firstVisible.classList.add('is-active');

        switchSourceTab(root, firstVisible.getAttribute('data-source-tab') || getDefaultSourceTab(root));

      }

    }

  }



  function initSourceTabs(root) {

    if (!isSourceTabsEnabled(root)) return;



    updateSourceTabsVisibility(root);



    var shell = root.closest('.df-reviews');

    if (!shell) return;



    var tabs = shell.querySelector('[data-df-reviews-tabs]');

    if (!tabs || tabs.dataset.sourceTabsBound === 'true') return;

    tabs.dataset.sourceTabsBound = 'true';



    tabs.querySelectorAll('[data-source-tab]').forEach(function (tabBtn) {

      tabBtn.addEventListener('click', function () {

        var source = tabBtn.getAttribute('data-source-tab') || getDefaultSourceTab(root);

        tabs.querySelectorAll('.df-reviews__tab').forEach(function (btn) {

          btn.classList.toggle('is-active', btn === tabBtn);

        });

        switchSourceTab(root, source);

      });

    });

  }



  function bindLightboxPhotos(root) {

    var shell = root.closest('.df-reviews');

    if (!shell || shell.dataset.lightboxBound === 'true') return;

    shell.dataset.lightboxBound = 'true';

    shell.addEventListener('click', function (event) {

      var btn = event.target.closest('.df-reviews__modal-photo, .df-reviews__photo');

      if (!btn || !shell.contains(btn)) return;

      event.preventDefault();

      var viewport = shell.querySelector('[data-df-reviews-root]');

      var sourceSlide = btn.closest('.df-reviews__slide');

      if (!sourceSlide && btn.classList.contains('df-reviews__modal-photo')) {
        sourceSlide = shell._dfModalSlide || null;
      }

      var photoIndex = parseInt(btn.getAttribute('data-photo-index'), 10);

      if (isNaN(photoIndex)) photoIndex = 0;

      openLightbox(shell, btn, viewport, sourceSlide, photoIndex);

    });

  }



  function openLightbox(shell, activeBtn, root, sourceSlide, photoIndex) {

    var host = shell ? shell.querySelector('[data-df-reviews-lightbox]') : null;

    var swiperEl;

    var urls;

    var startIndex;

    var showNav;

    var config;

    if (!host || typeof Swiper === 'undefined') return;

    if (sourceSlide) {
      urls = getSlidePhotoUrls(sourceSlide);
    } else {
      urls = [];
    }

    if (!urls.length) return;

    startIndex = clamp(parseInt(photoIndex, 10) || 0, 0, urls.length - 1);

    if (activeBtn && activeBtn.querySelector('img')) {
      var activeSrc = activeBtn.querySelector('img').getAttribute('src') || '';
      var matched = urls.indexOf(activeSrc);
      if (matched === -1 && activeSrc) {
        urls.forEach(function (url, idx) {
          if (matched !== -1) return;
          if (url === activeSrc || url.indexOf(activeSrc) !== -1 || activeSrc.indexOf(url) !== -1) {
            matched = idx;
          }
        });
      }
      if (matched !== -1) startIndex = matched;
    }

    showNav = urls.length > 1;
    host.classList.toggle('df-reviews__lightbox--single', !showNav);

    var wrapper = host.querySelector('.df-reviews__lightbox-wrapper');

    wrapper.innerHTML = urls

      .map(function (url) {

        return (

          '<div class="swiper-slide df-reviews__lightbox-slide">' +

          '<img src="' + escapeAttr(url) + '" alt="">' +

          '</div>'

        );

      })

      .join('');

    host.hidden = false;

    setOverlayOpen(shell, true);

    if (shell.dfReviewsLightboxSwiper) {

      shell.dfReviewsLightboxSwiper.destroy(true, true);

      shell.dfReviewsLightboxSwiper = null;

    }

    swiperEl = host.querySelector('.df-reviews__lightbox-swiper');

    if (!swiperEl) return;

    swiperEl.classList.add('swiper');

    config = {

      slidesPerView: 1,

      spaceBetween: 0,

      loop: false,

      initialSlide: startIndex,

      watchOverflow: true,

      observer: true,

      observeParents: true,

      keyboard: { enabled: showNav }

    };

    if (showNav) {

      config.navigation = {

        nextEl: host.querySelector('.df-reviews__lightbox-next'),

        prevEl: host.querySelector('.df-reviews__lightbox-prev')

      };

      config.pagination = {

        el: host.querySelector('.df-reviews__lightbox-pagination'),

        clickable: true

      };

    }

    window.requestAnimationFrame(function () {

      shell.dfReviewsLightboxSwiper = new Swiper(swiperEl, config);

    });

  }



  function closeLightbox(shell) {

    if (!shell) return;

    var host = shell.querySelector('[data-df-reviews-lightbox]');

    if (!host) return;

    host.hidden = true;

    if (shell.dfReviewsLightboxSwiper) {

      shell.dfReviewsLightboxSwiper.destroy(true, true);

      shell.dfReviewsLightboxSwiper = null;

    }

    var modal = shell.querySelector('[data-df-reviews-modal]');

    if (!modal || modal.hidden) setOverlayOpen(shell, false);

  }



  function initExpandButtons(root) {
    root.querySelectorAll('.df-reviews__expand').forEach(function (btn) {
      btn.remove();
    });

    root.querySelectorAll('.df-reviews__text').forEach(function (textEl) {
      textEl.dataset.expandReady = '';

      var slide = textEl.closest('.df-reviews__slide');
      var layout;
      var textClamped;
      var hasPhotos;

      if (!slide) return;

      textEl.dataset.expandReady = 'true';

      layout = parseLayout(root.getAttribute('data-layout'));
      textClamped = isTextClamped(textEl);
      hasPhotos = getSlidePhotoUrls(slide).length > 0;

      if (layout === 'masonry') {
        if (!textClamped) return;
      } else if (!textClamped && !hasPhotos) {
        return;
      }



      var btn = document.createElement('button');

      btn.type = 'button';

      btn.className = 'df-reviews__expand';

      btn.textContent = 'Читать полностью';

      btn.addEventListener('mouseenter', function () {
        preloadImages(getSlidePhotoUrls(slide));
      }, { once: true });

      btn.addEventListener('click', function () {

        openReviewModal(slide);

      });

      textEl.insertAdjacentElement('afterend', btn);

      var layoutRoot = textEl.closest('[data-df-reviews-root]');
      if (layoutRoot) scheduleMasonryLayout(layoutRoot);

    });

    syncMasonryInlinePhotos(root);

  }



  function openReviewModal(slide) {

    var shell = slide.closest('.df-reviews');

    var host = shell ? shell.querySelector('[data-df-reviews-modal]') : null;

    if (!host) return;



    var author = slide.querySelector('.df-reviews__author');

    var avatar = slide.querySelector('.df-reviews__avatar');

    var date = slide.querySelector('.df-reviews__date');

    var stars = slide.querySelector('.df-reviews__stars');

    var text = slide.querySelector('.df-reviews__text');

    var source = slide.querySelector('.df-reviews__source');

    var photoUrls = getSlidePhotoUrls(slide);
    var photoPreviews = getSlidePhotoPreviews(slide);

    preloadImages(photoUrls);

    var authorHost = host.querySelector('.df-reviews__modal-author');
    var avatarHost = host.querySelector('.df-reviews__modal-avatar');
    var hideAvatar = shell.classList.contains('df-reviews--hide-avatar');

    if (authorHost) {
      authorHost.textContent = author ? author.textContent.trim() : '';
    }

    if (avatarHost) {
      if (!hideAvatar && avatar) {
        avatarHost.hidden = false;
        if (avatar.classList.contains('df-reviews__avatar--link')) {
          avatarHost.innerHTML = avatar.outerHTML;
          avatarHost.className = 'df-reviews__modal-avatar';
        } else {
          avatarHost.innerHTML = avatar.innerHTML;
          avatarHost.className = 'df-reviews__modal-avatar' + (avatar.classList.contains('df-reviews__avatar--placeholder') ? ' df-reviews__avatar--placeholder' : '');
        }
      } else {
        avatarHost.hidden = true;
        avatarHost.innerHTML = '';
        avatarHost.className = 'df-reviews__modal-avatar';
      }
    }

    host.querySelector('.df-reviews__modal-date').textContent = date ? date.textContent.trim() : '';

    host.querySelector('.df-reviews__modal-stars').innerHTML = stars ? stars.innerHTML : '';

    var productHost = host.querySelector('.df-reviews__modal-product');
    var productBlock = slide.querySelector('.df-reviews__product');

    if (productHost) {
      if (productBlock) {
        productHost.hidden = false;
        productHost.innerHTML = productBlock.outerHTML;
      } else {
        productHost.hidden = true;
        productHost.innerHTML = '';
      }
    }

    host.querySelector('.df-reviews__modal-text').textContent = text ? text.textContent.trim() : '';

    host.querySelector('.df-reviews__modal-source').textContent = source ? source.textContent.trim() : '';



    var photosHost = host.querySelector('.df-reviews__modal-photos');

    var root = shell ? shell.querySelector('[data-df-reviews-root]') : null;

    shell._dfModalSlide = slide;

    photosHost.innerHTML = '';

    if (photoUrls.length) {
      photosHost.hidden = false;
    } else {
      photosHost.hidden = true;
    }

    photoUrls.forEach(function (full, index) {

      if (!full) return;

      var preview = photoPreviews[index] || photoPreviewUrl(full);

      var photoBtn = document.createElement('button');

      photoBtn.type = 'button';

      photoBtn.className = 'df-reviews__modal-photo';

      photoBtn.setAttribute('data-photo-index', String(index));

      photoBtn.setAttribute('data-photo-full', full);

      photoBtn.innerHTML = '<img src="' + escapeAttr(preview) + '" alt="">';

      photosHost.appendChild(photoBtn);

    });



    host.hidden = false;

    setOverlayOpen(shell, true);

  }



  function closeReviewModal(shell) {

    if (!shell) return;

    var host = shell.querySelector('[data-df-reviews-modal]');

    if (!host) return;

    host.hidden = true;

    shell._dfModalSlide = null;

    var lightbox = shell.querySelector('[data-df-reviews-lightbox]');

    if (!lightbox || lightbox.hidden) setOverlayOpen(shell, false);

  }



  function parseBool(value, defaultOn) {

    if (value === undefined || value === null) return !!defaultOn;

    var normalized = String(value).trim().toLowerCase();

    if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true;

    if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off' || normalized === '') {

      return false;

    }

    return !!defaultOn;

  }



  function parseMinRating(value) {

    var raw = String(value == null ? '0' : value).trim();

    var direct = parseInt(raw, 10);

    if (!isNaN(direct)) return clamp(direct, 0, 5);

    if (raw.indexOf('5') !== -1) return 5;

    if (raw.indexOf('4') !== -1) return 4;

    return 0;

  }



  function resolveHideFlag(slider, hideAttr) {

    if (!slider.hasAttribute(hideAttr)) return false;

    return parseBool(slider.getAttribute(hideAttr), false);

  }



  function applyVisibility(slider) {

    var shell = slider.closest('.df-reviews') || slider;

    var hideAvatar = resolveHideFlag(slider, 'data-hide-avatar');

    var hideSource = resolveHideFlag(slider, 'data-hide-source');

    var hideDate = resolveHideFlag(slider, 'data-hide-date');



    shell.classList.toggle('df-reviews--hide-avatar', hideAvatar);

    shell.classList.toggle('df-reviews--hide-source', hideSource);

    shell.classList.toggle('df-reviews--hide-date', hideDate);



    updateSourceTabsVisibility(slider);

    updateInsalesLoadMore(slider);

    slider.querySelectorAll('.df-reviews__avatar').forEach(function (node) {

      node.style.setProperty('display', hideAvatar ? 'none' : '', 'important');

    });

    slider.querySelectorAll('.df-reviews__product').forEach(function (node) {

      node.style.setProperty('display', hideAvatar ? 'none' : '', 'important');

    });

    slider.querySelectorAll('.df-reviews__source').forEach(function (node) {

      node.style.setProperty('display', hideSource ? 'none' : '', 'important');

    });

    slider.querySelectorAll('.df-reviews__date').forEach(function (node) {

      node.style.setProperty('display', hideDate ? 'none' : '', 'important');

    });

  }



  function watchVisibility(slider) {

    if (typeof MutationObserver === 'undefined') return;

    if (slider.dataset.visibilityWatchReady === 'true') return;

    slider.dataset.visibilityWatchReady = 'true';

    new MutationObserver(function (mutations) {
      var shouldRepaginate = false;
      var i;

      for (i = 0; i < mutations.length; i++) {
        if (
          mutations[i].attributeName === 'data-page-size' ||
          mutations[i].attributeName === 'data-page-size-mobile' ||
          mutations[i].attributeName === 'data-list-limit' ||
          mutations[i].attributeName === 'data-columns' ||
          mutations[i].attributeName === 'data-columns-tablet' ||
          mutations[i].attributeName === 'data-columns-mobile'
        ) {
          shouldRepaginate = true;
          break;
        }
      }

      if (slider._dfVisibilityTimer) clearTimeout(slider._dfVisibilityTimer);

      slider._dfVisibilityTimer = setTimeout(function () {

        slider._dfVisibilityTimer = null;

        applyVisibility(slider);

        filterSlides(slider);

        var layout = parseLayout(slider.getAttribute('data-layout'));

        applyModeLimits(slider, layout);

        if (shouldRepaginate && usesPagination(layout)) {
          ensureSlideOrder(slider);
          resetPaginationState(slider);
          applyPagination(slider, true);
          return;
        }

        if (layout === 'slider' || layout === 'spotlight') {
          reinitSwiperIfNeeded(slider, layout);
        } else if (layout === 'marquee') {
          applyMarqueeSpeed(slider);
          initMarquee(slider);
        }

      }, 50);

    }).observe(slider, {

      attributes: true,

      attributeFilter: [

        'data-layout',

        'data-columns',

        'data-columns-tablet',

        'data-columns-mobile',

        'data-page-size',

        'data-page-size-mobile',

        'data-list-limit',

        'data-slider-limit',

        'data-spotlight-limit',

        'data-marquee-speed',

        'data-marquee-speed-mobile',

        'data-marquee-limit',

        'data-hide-avatar',

        'data-hide-source',

        'data-hide-date',

        'data-hide-insales',

        'data-hide-yandex',

        'data-source-tabs',

        'data-min-rating'

      ]

    });

  }



  function rescanWidgetRoots() {

    document.querySelectorAll(ROOT_SELECTOR).forEach(function (root) {

      if (root.dataset.dfReviewsReady !== 'true') initWidget(root);

    });

  }



  function scheduleRescanWidgetRoots() {

    if (window._dfRescanTimer) clearTimeout(window._dfRescanTimer);

    window._dfRescanTimer = setTimeout(function () {

      window._dfRescanTimer = null;

      rescanWidgetRoots();

    }, REFRESH_DEBOUNCE_MS);

  }



  function watchLayoutSettings(root) {

    var layoutEl = findWidgetLayout(root);

    if (!layoutEl || typeof MutationObserver === 'undefined') return;

    if (layoutEl.dataset.dfLayoutWatchReady === 'true') return;

    layoutEl.dataset.dfLayoutWatchReady = 'true';

    new MutationObserver(function (mutations) {

      var i;
      var needsRefresh = false;

      for (i = 0; i < mutations.length; i++) {
        if (mutations[i].type === 'attributes' && mutations[i].attributeName === 'style') {
          needsRefresh = true;
        }
      }

      if (needsRefresh) scheduleRefreshWidgetSettings(root);

    }).observe(layoutEl, {

      attributes: true,

      attributeFilter: ['style']

    });

  }



  function filterSlides(container) {

    var minRating = parseMinRating(container.getAttribute('data-min-rating'));



    container.querySelectorAll('.df-reviews__slide').forEach(function (slide) {

      if (slide.classList.contains('df-reviews__slide--empty')) return;



      var rating = parseInt(slide.dataset.rating, 10) || 5;

      var source = (slide.dataset.source || '').toLowerCase();

      var ratingOk = minRating <= 0 || rating >= minRating;



      if (source === 'yandex' && !ratingOk) {

        slide.classList.add('is-hidden');

        slide.style.display = 'none';

      }

    });

  }



  function showEmptyState(container) {

    var wrapper = container.querySelector('[data-df-reviews-wrapper]');

    if (!wrapper) return;

    wrapper.innerHTML =

      '<div class="swiper-slide df-reviews__slide df-reviews__slide--empty">' +

      '<p class="df-reviews__empty">Нет отзывов по выбранным фильтрам</p></div>';

  }



  function toggleSchema(container) {

    if (parseBool(container.getAttribute('data-schema'), true)) return;

    container.querySelectorAll('[itemprop]').forEach(function (el) {

      el.removeAttribute('itemprop');

      el.removeAttribute('itemscope');

      el.removeAttribute('itemtype');

    });

  }



  function isTextClamped(el) {

    return el.scrollHeight - el.clientHeight > 2;

  }



  function escapeAttr(value) {

    return String(value)

      .replace(/&/g, '&amp;')

      .replace(/"/g, '&quot;')

      .replace(/</g, '&lt;')

      .replace(/>/g, '&gt;');

  }



  function clamp(value, min, max) {

    return Math.min(max, Math.max(min, value));

  }



  if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', boot);

  } else {

    boot();

  }

})();


