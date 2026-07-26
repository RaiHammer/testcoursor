$(function() {
  var reviewMainSrc = $('.reviews').attr('data-review-main-src');
  var reviewMainTitle = $('.reviews').attr('data-review-main-title');

  /* Отправка формы */
  
  $widget.find('.js-show-form').on("click", function() {
    $widget.find('.reviews-wrapper').toggleClass('hidden');
    $(this).hide();
  });

  $widget.find('.js-hide-form').on("click", function() {
    $widget.find('.reviews-wrapper').toggleClass('hidden');
    $widget.find('.js-show-form').show();
  });

  $widget.find('.js-load-review-image').on("change", function() {
    let str = $(this).val();
    let i = str.lastIndexOf('/') + 1;

    if (str.lastIndexOf('\\')) {
      i = str.lastIndexOf('\\') + 1;
    }

    let filename = str.slice(i);

    $widget.find('.load-review-image-name').html(filename);
  });

  EventBus.subscribe('send-review:insales:ui_reviews', (data) => {
    const $thisWidget = $(data.form[0].closest('.layout'));

    // Проверяем что событие прилетело для этого виджета
    if ($thisWidget.attr('class') !== $widget.attr('class')) { return; }

    const review_notice_success = $thisWidget.find("[data-reviews-form-success]");
    const file_input = $thisWidget.find("[data-reviews-file-input-name]");

    if (file_input.length) {
      file_input.text(file_input.data('reviews-file-input-name'));
    }

    if (review_notice_success.length) {
      $('html,body').animate({
        scrollTop: review_notice_success.offset().top
      }, 'smooth');
    }
  });

  /* Massonry with Grid list */
  function resizeMassonryGridItem(item) {
    $('.masonry-reviews-item-hidden').removeClass('masonry-reviews-item-hidden');
    let grid = document.getElementsByClassName("masonry-reviews-list")[0];
    let rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    let rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));

    if (rowGap == 0) {
      rowGap = 1;
    }

    let rowSpan = Math.ceil((item.querySelector('.masonry-reviews-item__content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));

    item.style.gridRowEnd = "span " + rowSpan;
  }

  function resizeAllMassonryGridItems() {
    const allItems = document.getElementsByClassName("masonry-reviews-item");

    for (let x = 0; x < allItems.length; x++) {
      resizeMassonryGridItem(allItems[x]);
    }
  }
  
  // function addTitle(){
  //   // из data-json добавляем название товара, ссылку и картинку товара
  //   const reviewElements = document.querySelectorAll('.review-title-container');
  //   // Обрабатываем каждый элемент
  //   reviewElements.forEach((element) => {
  //     // Извлекаем данные JSON из атрибута data-json  
  //     const reviewData = JSON.parse(element.getAttribute('data-json'));
  //     $(element).html("<a href="+ reviewData.url +"><div class='title-img'><img class='product-img' loading='lazy' src='"+ reviewData.first_image.medium_url +"'><div class='prod-title'>"+ reviewData.title +"</div></div></a>");
  //     resizeAllMassonryGridItems(); 
  //   });
  // }

  function addTitle() {
    // Из data-json добавляем название товара, ссылку и картинку товара
    const reviewElements = document.querySelectorAll('.review-title-container');
    // Обрабатываем каждый элемент
    reviewElements.forEach((element) => {
        // Извлекаем данные JSON из атрибута data-json
        const reviewData = JSON.parse(element.getAttribute('data-json'));
        
        // Проверяем значение reviewData.url
        if (reviewData.url === '/product/shop-reviews') {
            // Создаём div без ссылки и заменяем данные
            $(element).html("<div class='title-img'><img class='product-img' style='height: 66.66px' loading='lazy' src='" + reviewMainSrc + "'><div class='prod-title'>" + reviewMainTitle + "</div></div>");
        } else {
            // Создаём стандартный тег a с данными из reviewData
            $(element).html("<a href=" + reviewData.url + "><div class='title-img'><img class='product-img' loading='lazy' src='" + reviewData.first_image.medium_url + "'><div class='prod-title'>" + reviewData.title + "</div></div></a>");
        }
        
        resizeAllMassonryGridItems(); 
    });
  }

  addTitle();
  resizeAllMassonryGridItems();
  $(window).on("load", function() {resizeAllMassonryGridItems()});
  window.addEventListener("resize", resizeAllMassonryGridItems);
  $(window).scroll(function(){
	  resizeAllMassonryGridItems();
  });

  EventBus.subscribe('widget:input-setting:insales:system:editor', (data) => {
    let masonryReviewsList = document.querySelector('[data-widget-id="' + data.widget_id + '"] .masonry-reviews-list');

    if (masonryReviewsList) {
      resizeAllMassonryGridItems();
    }
  });

  EventBus.subscribe('widget:change-setting:insales:system:editor', (data) => {
    let masonryReviewsList = document.querySelector('[data-widget-id="' + data.widget_id + '"] .masonry-reviews-list');

    if (masonryReviewsList) {
      resizeAllMassonryGridItems();
    }
  });

  $(widget).on('click', '.js-show-manager', function() {
    $(this).parents('.masonry-reviews-item__content').find('.comments-item').toggleClass('hidden');
    resizeAllMassonryGridItems();
    $(this).toggleClass('hidden');
    $(this).parents('.masonry-reviews-item__content').find('.js-hide-manager').toggleClass('hidden');
  });

  $(widget).on('click', '.js-hide-manager', function() {
    $(this).parents('.masonry-reviews-item__content').find('.comments-item').toggleClass('hidden');
    resizeAllMassonryGridItems();
    $(this).toggleClass('hidden');
    $(this).parents('.masonry-reviews-item__content').find('.js-show-manager').toggleClass('hidden');
  });
  
  $(document).on('click', '.loadmore_button', async function() {
    const $list = $('.masonry-reviews-list');
    const pagination = $('.pagination_container');
    const $button = $(this);
    $button.text('Загружаем…');
    $button.attr('disabled', true); 
    const url = $button.attr('data-url');
  
    $("html, body").animate({scrollTop: $('.loadmore_button').offset().top - window.innerHeight}, {duration: 370,easing: "linear" });

    const html = await $.get(url);
    const $html = $(html);
    const newListHTML = $html.find('.masonry-reviews-list').html();
    const newPagination = $html.find('.pagination_container').html();
    $list.append(newListHTML).find('img[loading="lazy"]').removeAttr('loading');
    pagination.html(newPagination);
    addTitle();
    refreshFsLightbox(); 
    let timerId = setInterval(() => resizeAllMassonryGridItems(), 200);
    setTimeout(() => { clearInterval(timerId) }, 10000);
  });

});

