
function toggleCompare(same_row) {
        if (same_row) {
          $('.js-compare-table .same-row')
             .hide();
        }
        else {
          $('.js-compare-table .same-row')
            .show();
        }
};

EventBus.subscribe('update_items:insales:compares', function (data) {
  $('.js-compares-widget-count').html(data.products.length);
  if(data.products.length > 0) {
  	$('.js-compares-widget-count').show()
  }else{
  	$('.js-compares-widget-count').hide()
  }
});

EventBus.subscribe('update_items:insales:compares', function (data) {
  var $product = $('[data-product-id="'+data.action.item+'"]');
  var productId = $product.data('product-id');
  var $compareAdd = $product.find('.js-compare-add');
  var $compareDelete = $product.find('.js-compare-delete');

  var inCompare = _.find(data.products, function(product) {
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

  $('[data-compared-id="'+ data.action.item +'"]').remove();

  if (data.products.length == 0) {
    $('#js-compare-inner').hide();
    $('.js-compare-empty').removeClass('hidden');
  };
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

    $(this).find('.link-text')
       .toggleClass('hide')
       .toggleClass('show');
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
      if ($('.js-compare-table .same-row').length && (data.products.length > 1)){
        $('.compare-toolbar').removeClass('hidden');
        setTimeout(function () {
          if (same_row) {
            $('.js-same-toggle').find('.link-text')
            .toggleClass('hide')
            .toggleClass('show');
          }
          console.log('Function after setTimeout! '  + same_row);
          toggleCompare(same_row);
        }, 0)

      }
      else{
        $('.compare-toolbar').addClass('hidden');
      }
    });
  });
});
