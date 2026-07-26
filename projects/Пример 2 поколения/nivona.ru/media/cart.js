// Для удобства вызова события можно добавить метод jQuery
  if (typeof $.fn.triggerCustom !== 'function') {
    $.fn['triggerCustom'] = function(type, data, options) {
      if (options == null) {
        options = {};
      }
      options = $.extend({}, {
        bubbles: true,
        cancelable: true,
        detail: data
      }, {
        bubbles: options.bubbles,
        cancelable: options.cancelable
      });
      return this.each(function() {
        var e;
        e = new window.CustomEvent(type, options);
        return this.dispatchEvent(e);
      });
    }
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
    
    if(data.items_count > 0){
      	$widgetCardTotalCount.addClass('active');
    }else{
    	$widgetCardTotalCount.removeClass('active');
    }

    if(data.items_count == 0){
      var items_title = 'Товаров';
    }else if(data.items_count == 1){
      var items_title = 'Товар';
    }else if(data.items_count > 1 && data.items_count < 5){
      var items_title = 'Товара';
    }else if(data.items_count >= 5){
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
  })

  $('.js-widget-dropdown').hover(
    function(){
      $('.cart-widget-dropdown').removeClass('hidden');
      setTimeout(function () {
        $('.cart-widget-dropdown').css('opacity','1')
      }, 20);
    },
    function(){
      $('.cart-widget-dropdown').addClass('hidden').css('opacity','0');
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
  var $discountBlockFooter =  $('#order_complete #discounts-block');
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
          return acc[n.id] = n, acc;
        }, {});
        var old_prices = 0;

        for (var key in order_lines) {
          // Получаем сумму скидки по товарах
            var currentVariant = order_lines[key].product.variants.find(function(variant){
              return variant.id == order_lines[key].variant_id;
            });

            if(currentVariant.old_price && currentVariant.old_price != 'null' && currentVariant.old_price != null){
              old_prices = old_prices + currentVariant.old_price*order_lines[key].quantity;
            }else{
              old_prices = old_prices + currentVariant.price*order_lines[key].quantity;
            }
        }

      $cartItemsPrice.html(Shop.money.format(data.items_price));
      $cartItemsCount.html(data.items_count);
      $cartTotalPrice.html(Shop.money.format(data.total_price));
      if(old_prices > data.items_price){
        $cartItemsDiscountPrice.closest('.order-item').show();
        $cartItemsDiscountPrice.html(Shop.money.format(data.items_price - old_prices));
        $cartItemsDiscountPercent.html('(-' + Math.round((old_prices - data.items_price)*100/old_prices) + '%)');
      }else{
        $cartItemsDiscountPrice.closest('.order-item').hide();
      }
    })

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
          return acc[n.id] = n, acc;
        }, {});

        for (var key in order_lines) {
          $('[data-item-id="' + key + '"]').find('.js-item-total-price').html(Shop.money.format(order_lines[key].total_price))
        }

      // Скидки
      	$('.js-discount-comment-list').html(Template.render(data, 'cart-discounts'));
    })

/******************************************/
/*                                        */
/*         Логика чекаут + корзина        */
/*                                        */
/******************************************/
  // Скролл для сайдбара
    $(document).scroll(function() {
      if($('#checkout-sidebar').length > 0){
        let $sidebar = $('.checkout-sidebar-wrapper'),
            $sidebarHeight = $sidebar.innerHeight(),
            $sidebarWidth = $sidebar.width(),
            $sidebarBlock = $('#checkout-sidebar'),
            $sidebarBlockTop = $sidebarBlock.offset().top,
            $footer = $('.js-footer'),
            $footerTop = $footer.offset().top,
            $scrollTop = $(document).scrollTop();


        if ($(document).innerWidth() > 1024) {
          // $sidebar.width($sidebarWidth);
          $('#checkout-sidebar').toggleClass('checkout-sidebar--sticky', $scrollTop >= $sidebarBlockTop - 75);
          $('#checkout-sidebar').toggleClass('checkout-sidebar--absol', $footerTop <= ($sidebarHeight + $scrollTop + $sidebarHeight));
        }
      }
    });

  // Удаляем позицию
    EventBus.subscribe('delete_items:insales:cart', function (data) {
      if(data.action.button){
        var $button = data.action.button;
        var $cartItem = $button.closest('.cart-item');

        $cartItem.slideUp(300, function () {
          $(this).remove();

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
        if(data.items_count < 1) {
          setTimeout(function(){
            $(location).attr('href', '/cart_items');
            return false;
          }, 1000);
        }
    });

  /**************************************/
  /*     Подарок в товарной позиции     */
  /**************************************/
    $(function () {
      if(cart_enable_gift == '1' && cart_is_gift_handle && cart_gift_handle) {
        function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

        // добавление подарка при добавлении товара
          EventBus.subscribe('add_items:insales:cart', function (data) {
            var productsObj = data;
            $.each(data.order_lines, function(index, order_line){
              productsObj.order_lines[index].product = productParameters(order_line.product);
            })

            // Если добавленный товар сопровождается подарком, добавляем подарок
              var added_item = Object.keys(productsObj.action.items);
              var added_product = productsObj.order_lines.find(item => item.id == added_item[0]); // Позиция, которая добавлена в корзину
              if(added_product.product.parameters[cart_gift_handle]){
                $.each(added_product.product.parameters[cart_gift_handle].characteristics, function(index, gift){
                  Cart.set({
                    items: _defineProperty({}, gift.permalink, 1),
                    comments: _defineProperty({}, gift.permalink, 'GIFT')
                  });
                });
              }
          })

          // Удаление подарка при удалении товара
            EventBus.subscribe('delete_items:insales:cart', function (data) {
              var productsObj = data;
              $.each(data.order_lines, function(index, order_line){
                productsObj.order_lines[index].product = productParameters(order_line.product);
              })

              // После удаления товара, проверяем все товары и вытягиваем список подарков, которые могут находиться в корзине
                var allowed_gifts = [];
                $.each(productsObj.order_lines, function(index, order_line){
                  if(order_line.product.parameters[cart_gift_handle]){
                    $.each(order_line.product.parameters[cart_gift_handle].characteristics, function(index, gift){
                      allowed_gifts.push(gift.permalink)
                    });
                  }
                });

              // Проходимся по товарам и всеряем список с массивом подарков, которые могут находиться в корзине
              // Если есть подарок который не может находиться в корзине, удаляем его
                $.each(productsObj.order_lines, function(index, order_line){
                  if(order_line.product.parameters[cart_is_gift_handle]){
                    if(allowed_gifts.indexOf(order_line.product.variants[0].id + '') == -1) {
                      Cart.delete({items: [order_line.product.variants[0].id]})
                      $('[data-item-id="'+ order_line.product.variants[0].id +'"]').remove();
                    }
                  }
                });
            })

        // Перебираем позиции в корзине и перемещаем подарки вниз
          $('[data-is-gift="true"]').each(function(){          
            if(cart_gift_settings.move_down == '1') $('.cart-list').append($(this));
            if(cart_gift_settings.lock_change == '1') {
              $(this).find('[name="cart[quantity]['+ $(this).data('variant-id') +']"]').attr('disabled', 'disabled')
              $(this).find('[data-quantity-change]').attr('disabled', 'disabled');        
            }
            if(cart_gift_settings.lock_delete == '1') {
              $(this).find('[data-item-delete]').attr('disabled', 'disabled');
            }         
          })
      }
    })

  /*****************************************************/
  /*                                                   */
  /*    Кастомный скрипт, для изменения количеств      */
  /*                                                   */
  /*****************************************************/
    $(function () {
      // Кастомный скрипт, для изменения количества позиций состава корзины (каунтер, +-) с заждержкой
      // Например если 10 раз кликнуть по +, т овсе запросы обычно летят очередью, т.е. 10 запросов
      // В нашем случае срабатывает таймер 1 секунда. Если в течении 1 секунды не менялось количество, 
      // то скрипт получает актуальное количество и выполняет ОДИН запрос к корзине, меняя ее состав
        function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
        var initCardQuantity = function(){
          var timerId;
          $(document).off('click', '[data-quantity-change-custom]').on('click', '[data-quantity-change-custom]', function(){
            var item_id = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').data('item-id')
            var current_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').val()
            var new_quantity = current_quantity*1 + $(this).data('quantity-change-custom')
            var max_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').attr('max')*1

            if(new_quantity < 1){
              $('[name="cart[quantity-custom]['+ item_id +']"]').val(1)
              new_quantity = 1;
            }else if(new_quantity > max_quantity){
              $('[name="cart[quantity-custom]['+ item_id +']"]').val(max_quantity)
              new_quantity = max_quantity;
            }else{
              $('[name="cart[quantity-custom]['+ item_id +']"]').val(new_quantity)
            }

            // Блокируем кнопки +- если минимальное или максимальное количество товара
              if(new_quantity <= 1 && new_quantity >= max_quantity){
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
              }else if(new_quantity <= 1){
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
              }else if(new_quantity >= max_quantity){
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
              }else{
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
              }

            clearTimeout(timerId)
            timerId = setTimeout(function() {
              Cart.set({
                items: _defineProperty({}, item_id, new_quantity),
              });
              console.log('done');
            }, 1000);
          })

          $(document).off('click', '.js-item-quantity').on('change', '.js-item-quantity', function(){
            var item_id = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').data('item-id')
            var new_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').val()
            var max_quantity = $(this).closest('[data-quantity-custom]').find('.js-item-quantity').attr('max')*1

            if(new_quantity < 1){
              $('[name="cart[quantity-custom]['+ item_id +']"]').val(1)
              new_quantity = 1;
            }else if(new_quantity > max_quantity){
              $('[name="cart[quantity-custom]['+ item_id +']"]').val(max_quantity)
              new_quantity = max_quantity;
            }else{
              $('[name="cart[quantity-custom]['+ item_id +']"]').val(new_quantity)
            }

            // Блокируем кнопки +- если минимальное или максимальное количество товара
              if(new_quantity <= 1 && new_quantity >= max_quantity){
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
              }else if(new_quantity <= 1){
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', true);
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
              }else if(new_quantity >= max_quantity){
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', true);
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
              }else{
                 $(this).closest('[data-quantity-custom]').find('.count-up').prop('disabled', false);
                 $(this).closest('[data-quantity-custom]').find('.count-down').prop('disabled', false);
              }

            clearTimeout(timerId)
            timerId = setTimeout(function() {
              Cart.set({
                items: _defineProperty({}, item_id, new_quantity),
              });
              console.log('done');
            }, 1000);
          })
        }
        initCardQuantity();

    }());

// Фикс промокода
$('.discount-input').on('.discount-input keyup', function(e) { // нажатие на кнопку "применить"
   if ($('.discount-input').val() == ''){
       $('.discount-button').click(function() {
         $('.discount-input').val(' ');
        })
    }
});

$('.discount-input').keydown(function(e) { // нажатие на Enter
    if(e.keyCode == 13) {
      if ($('.discount-input').val() == ''){
           $('.discount-input').val(' ');
      }
    }
  });

/*****************************************************/
/*                                                   */
/*            Удаление/добавление купонов            */
/*                                                   */
/*****************************************************/
  $(function () {
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
                }
              });
              $('[data-coupon-remove]').show();
              $('[data-coupon-submit]').hide();
              return false;
            } else {
              $('.formPromo__title-error').show();
              if ($('.discount-input').val() != '') {
                Cart.add({
                  coupon: $('.discount-input').val()
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
          }
        });
        return false;
      });
    
    // Очистка купона
      $('[data-coupon-remove]').on('click', function (event) {
        Cart.add({
          coupon: ' '
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
  }());