(function(){
  $('.js-open-filter').on('click', function () {
    alertify.panel({
      target: $('[data-modal="collection-filter"]').html(),
      position: 'left',
      onOpen: function (modal) {
        InSalesUI.Filter.create($(modal));
      }
    });
  });
}());

$('body').on('click', '[data-item-add]', function(e){
  if($(this).data('reload') == true){
    setTimeout(function (){
      $(location).attr('href', '/cart_items');
    }, 500);
  }else{
    $.magnificPopup.open({
      items: {
          src: '#thx'
      },
      type: 'inline'
    });
  }
});

(function(){
  if (Site.template != 'collection') {
    return;
  }

  var _reviewsOption = {
    slidesPerView: 4,
    spaceBetween: 16,
    breakpoints: {
      380: {
        slidesPerView: 1
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
    }
  };

// Просмотренные товары рендер
  $(function(){

    localforage.getItem('view_array')
      .then(function(temp_array) {
        if ((temp_array == null) || (temp_array == 'undefined')) {
          return false;
        }

        Products.getList(temp_array)
          .done(function (products) {
            var _products = _.reduce(temp_array, function (result, id) {
                result.push(products[id]);

                return result;
              }, []);

            $('.js-view-products').html(Template.render(_products, 'view_products'));

            $('[data-slider="reviews-products"]').each(function () {
              new Swiper (this, _reviewsOption);
            });
        });
      });
  })
})();

/*
* SORT
*/
    $('.js-sort').find('.collection-order-item_title').html($('[name="order"] option:selected').html())

    $(document).on("click", ".js-sort .collection-order-item_title", function(event) {
      event.preventDefault();

      if($(this).parent().hasClass('active')) {
        $(this).parent().removeClass('active')
      }else{
        $(this).parent().addClass('active')
      }
    });

    $(document).mouseup(function (event){
      event.preventDefault();
      var dqv = $(".js-sort");
      if (!dqv.is(event.target) && dqv.has(event.target).length === 0) {
        dqv.removeClass('active')
      }
    });

    $(document).on("click", ".js-sort-item", function(event) {
      event.preventDefault();
      $('.js-sort').removeClass('active')
      var current_order = $('.js-sorting [name="order"] option:selected').val();
      var order = $(this).attr('data-order');
      var order_descending = $(this).attr('data-order-descending');

      $('.js-sort-item').each(function( index ) {
        $(this).removeClass('descending');
      })

      $('.js-sorting [name="order"] option').attr('selected', false);
      $('.js-sorting [name="order"] option[value=' + order + ']').attr('selected', true);

      if(order_descending == 'true'){
        $('.js-sort').addClass('descending')
      }else{
        $('.js-sort').removeClass('descending')
      }

      var $form = $('.js-sorting');
      sendFilter($form, $form);

      $('.js-sort').removeClass('active')
    });

/************************************/
/*          ВИД ЛИСТИНГА            */
/************************************/
function collection_view() {
    if($.cookie('view_state') == 'list') {
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

    $('.collection-listing-type__item').click(function(e){
      e.preventDefault();
      if(!$(this).hasClass('active')){
        if($('.collection-listing-type').find('.grid').hasClass('active')) {
          $('.collection-listing-type').find('.grid').removeClass('active');
          $('.collection-listing-type').find('.list').addClass('active');
          $('.products-items_list').addClass('active');
          $('.products-items_grid').removeClass('active');
          $.cookie('view_state', 'list');
        }else{
          $('.collection-listing-type').find('.list').removeClass('active');
          $('.collection-listing-type').find('.grid').addClass('active');
          $('.products-items_list').removeClass('active');
          $('.products-items_grid').addClass('active');
          $.cookie('view_state', 'grid');
        }
      }
    });

    $("[data-ajax] img.lazy").each(function(index) {
      $(this).lazyload();
    });
}
collection_view();

$(window).on('load resize', function(){
  if($(window).width() < 768){
    $('.collection-listing-type').find('.list').removeClass('active');
    $('.collection-listing-type').find('.grid').addClass('active');
    $('.products-items_list').removeClass('active');
    $('.products-items_grid').addClass('active');
    $.cookie('view_state', 'grid');
  }
})

/************************************/
/*     ФУНКЦИЯ ФИЛЬТРАЦИИ           */
/************************************/
  $('.filter__item__block').each(function(index){
    if($(this).html() < 30){
      $(this).remove();
    }
  })

  if($('[data-filter]').serialize()){
    $('[data-filter-clear]').show();
    $('.filter__bottom').show();
  }else{
    $('[data-filter-clear]').hide();
    $('.filter__bottom').hide();
  }

  function sendFilter($form, $source) {
    if (!$form.hasClass("collection-filter")) {
      return false;
    }

      $.ajax({
        type: 'GET',
        url: $form.attr('action'),
        dataType: 'html',
        data: $form.serialize(),
        beforeSend: function(){

        },
        success: function(result){
          var allProducts = $(result).find('[data-ajax]').html();
          var allPagination = $(result).find('.pages-navbar').html();
          $('[data-ajax]').html(allProducts);
          $('.js-sorting').html($(result).find('.js-sorting').html())
          $('.js-filtersCount').html($(result).find('.js-filtersCount').html())

          if($('[data-filter]').serialize()){
            $('[data-filter-clear]').show();
            $('.filter__bottom').show();
          }else{
            $('[data-filter-clear]').hide();
            $('.filter__bottom').hide();
          }

          var redUrl = $form.serialize();
          window.history.pushState('object or string', 'Title', '?' + redUrl);

          $('.js-sort').find('.collection-order-item_title').html($('[name="order"] option:selected').html())

          $("[data-ajax] img.lazy").each(function(index) {
            $(this).lazyload();
          });

          collection_view();

          if($form.serialize()){
            $('[data-filter-clear]').show();
          }else{
            $('[data-filter-clear]').hide();
          }
        }
      });
    }

    $(document).on('change',".js-filter-trigger", function(event) {
      var $form = $(this).parents("form:first");
      sendFilter($form, $(this));
    });




