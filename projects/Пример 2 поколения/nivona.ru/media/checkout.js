/******************************************/
/*                                        */
/*             Логика чекаута             */
/*                                        */
/******************************************/







$(function () {
  if (Site.template != 'checkout') {
    return false;
  }

  // Фикс бага с выводом ошибки.
  // Например, человек положил в корзину 4 единицы товара, хотя по факту на складе только 3
  // При переходе в чекаут, система видит, что нет в наличии достаточного кеоличества товаров и выводит ошибку, но при этом сама же уменьшает количество добавленных товаров.
  // В итоге, сама же устраняет несоответствия, но при этом ошибка продолжает висеть.
  // Для устранения бага, мы вравниванием наличие каждой позиции с текущим количестве в корзине и уменьшаем при необходимости
  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  var firstLoad = true;
  // Бажит. Удаляется товар в произвольном порядке
  /*EventBus.subscribe('update_items:insales:cart', function (data) {
    if(firstLoad == true) {
      var updCartObj = {};
      data.order_lines.forEach(function(item){
        if(item.quantity > item.variant_quantity || item.variant_quantity == 0 || item.quantity != $('.js-item-quantity[data-item-id="'+ item.variant_id +'"]').val()) {
          if(item.variant_quantity == 0) {
            Cart.delete({items: [item.variant_id]});
            $('[data-item-id="'+ item.variant_id +'"]').remove()
          }else{
            $('.js-item-quantity[data-item-id="'+ item.variant_id +'"]').val(item.variant_quantity)
            Cart.set({
               items: _defineProperty({}, item.variant_id, item.variant_quantity),
            }); 
          }
        }
      })

      if($('#checkout_order_errors').html().indexOf('В вашей корзине есть товар, недоступный для покупки.') != -1){
        $('#checkout_order_errors').hide();
      }
      
      firstLoad = false;
    }
  })*/
  
  // Создаем подписчика на обновление нопки оформление заказа
  // Проверка доступности оформления заказа
  // Проверяем не только доступны ли варианты доставки, но и заполненость обязательных полей
  EventBus.subscribe('update:order_send_btn', function (data) {
    var errors_num = 0;
    $('[data-disabled-send-btn]').each(function(){
      if($(this).attr('data-disabled-send-btn') == 'true'){
       errors_num++;
      }
    })
    $('[data-disabled-send-btn-second]').each(function(){
      if($(this).attr('data-disabled-send-btn-second') == 'true'){
       errors_num++;
      }                         
    })
    
    $('#order_form .co-input--required').each(function(){
        if($(this).is(':visible')) {
           if($(this).find('.js-input-field[name]').val().length == 0) {
              errors_num++;
           }
        }
    })
    
    if(errors_num > 0) {
        $('#create_order_new').attr('disabled',true).addClass('co-button--checkout-disabled');
    }else{
        $('#create_order_new').attr('disabled',false).removeClass('co-button--checkout-disabled');
    }
  });

  // Создаем подписчика на обновление чекаута
  // Тут будет последяя инстанция обновления данных чекатуа
  EventBus.subscribe('update:checkout', function (data) {
    const $totalPrice = $('#total_price');
    const paymentSale = document.querySelector('#payment_way_block').style.display;
    const paymentSaleVal = +document.querySelector('#payment_gateway_price').textContent.replace(/[^0-9]/g, '');
    let totalValue = (+data.total_price + +data.delivery_price + +data.riseFloor_price);

    (paymentSale != 'none' ? totalValue = totalValue - paymentSaleVal : totalValue);
    $totalPrice.html(Shop.money.format(totalValue))
  });

  // Пересчет цены на позиции товара в чекауте
  EventBus.subscribe('update_variant:insales:item', function (data) {
    if (Site.template != 'checkout') {
      return false;
    }

    var $item = data.action.product;
    var $price = $item.find('.js-item-price');
    var $total = $item.find('.js-item-total-price');
    var total = data.action.price * data.action.quantity.current;

    $price.html(Shop.money.format(data.action.price));
    $total.html(Shop.money.format(total));
  });
  
  // Функция переключения способа оплаты
  function chooseFirstPayment(isUpdate) {
    if ($('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').hasClass('not_available_custom') 
        || $('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').hasClass('not_available_custom_1') 
        || $('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').hasClass('not_aviable') 
        || $('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').hasClass('not_aviable') 
        || $('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').hasClass('not_available') 
        || $('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').hasClass('not_available_for_markdown') 
        || isUpdate == true) 
    {
      var paymentFirstChecked = false;
      $('.co-payment_method').each(function (index) {
        if (!$(this).hasClass('not_available_custom') && !$(this).hasClass('not_available_custom_1') && !$(this).hasClass('not_aviable') && !$(this).hasClass('not_available') && !$(this).closest('.co-payment_method').parent().hasClass('not_available_custom') && !$(this).closest('.co-delivery_method').parent().hasClass('not_available_custom_1') && !$(this).hasClass('not_available_for_markdown') && paymentFirstChecked == false) {
          $(this).trigger('click');
          paymentFirstChecked = true;
        }
      });
      setHideCredit(); // Скрываем способ оплаты Кредит если есть товар из категории Запчасти и комплектующие
      isUpdate = false;
    }
  }

  //Функция проверки наличия категории у товара для запрета покупки в Кредит
  function checkCategoryForHideCredit() {
    return $('.cart-item').filter(function() {
      return $(this).data('item-collection') === 'Запчасти и комплектующие';
    }).length > 0;
  }
  //Функция после проверки checkCategoryForHideCredit
  function setHideCredit() {
    console.log('%c checkCategoryForHideCredit', 'background:darksalmon;color:white;padding:5px;', checkCategoryForHideCredit());
    if (checkCategoryForHideCredit()) {
      // console.log('%c Запчасти и комплектующие ', 'background:darkgreen;color:white;padding:5px;', $('[for="order_payment_gateway_id_1354133"]') );
      $('[for="order_payment_gateway_id_1354133"]').addClass('not_available_for_markdown');
    } else {
      // console.log('%c Запчасти и комплектующие ', 'background:darkred;color:white;padding:5px;', $('[for="order_payment_gateway_id_1354133"]') );
      $('[for="order_payment_gateway_id_1354133"]').removeClass('not_available_for_markdown');
    }
  }
  
  var $coItemsPrice = $('.js-co-items-price'); // Стоимость позиций товара в сайбаре
  var $coItemsCount = $('.js-co-items-count'); // Количество позиций товара в сайбаре
  var $coItemsDiscountPrice = $('.js-co-items-discount-price'); // Скидка по товарам
  var $coItemsDiscountPercent = $('.js-co-items-discount-percent'); // Процент скидки по товарам
  EventBus.subscribe('update_items:insales:cart', function (data) {
    // Обновляем цены позиций заказа
      var order_lines = data.order_lines.reduce(function (acc, n) {
        return acc[n.id] = n, acc;
      }, {});
      var old_prices = 0;

      for (var key in order_lines) {
        $('[data-item-id="' + key + '"]').find('.js-item-total-price').html(Shop.money.format(order_lines[key].total_price))
        
        // Блокируем кнопки +- если минимальное или максимальное количество товара
          if(order_lines[key].quantity <= 1 && order_lines[key].quantity >= order_lines[key].variant_quantity){
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-down').prop('disabled', true);
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-up').prop('disabled', true);
          }else if(order_lines[key].quantity <= 1){
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-down').prop('disabled', true);
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-up').prop('disabled', false);
          }else if(order_lines[key].quantity >= order_lines[key].variant_quantity){
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-up').prop('disabled', true);
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-down').prop('disabled', false);
          }else{
             $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-up').prop('disabled', false);
              $('[data-cart-form] [data-item-id="'+ order_lines[key].id +'"]').find('.count-down').prop('disabled', false);
          }
        
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

    // Количество и стоимость в чекауте
      $coItemsPrice.html(Shop.money.format(data.items_price));
      $coItemsCount.html(data.items_count);
      if(old_prices > data.items_price){
        $coItemsDiscountPrice.closest('.order-item').removeClass('not_available_order_item');
        $coItemsDiscountPrice.html(Shop.money.format(data.items_price - old_prices));
        $coItemsDiscountPercent.html('(-' + Math.round((old_prices - data.items_price)*100/old_prices) + '%)');
      }else{
        $coItemsDiscountPrice.closest('.order-item').addClass('not_available_order_item');
      }

    // Обновляем список купонов
      var coupon_tpl = Template.render(data, 'cart-discounts');
      if(coupon_tpl.length > 10){
          $('#discounts-block').show().html(Template.render(data, 'cart-discounts'));
      }else{
          $('#discounts-block').hide();
      }
    
    // Обновляем список доставки
      debounced_deliveries();
  })

  // Если это покупка в кредит, переключаем способ оплаты
  function get(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
  }
  if (get('buy_credit') == 1) {
    var checkPayment = setTimeout(function tick() {
      if ($('#order_payment_gateway_id_' + coSettings.paymentCreditId).is(':checked')) {
        setTimeout(function () {
          if ($('#order_payment_gateway_id_' + coSettings.paymentCreditId).is(':checked')) {

          } else {
            $('[for="order_payment_gateway_id_' + coSettings.paymentCreditId + '"]').trigger('click');
            timerId = setTimeout(tick, 500);
          }
        }, 2000);
      } else {
        $('[for="order_payment_gateway_id_' + coSettings.paymentCreditId + '"]').trigger('click');
        timerId = setTimeout(tick, 500);
      }
    }, 2000);
  }

  // Задержка для клика по +/-
  $('[data-quantity-change]').on('click', function (e) {
    var button = $(this);
    e.preventDefault();
    setTimeout(function () {
      button.attr("disabled", true);
    }, 1);
    setTimeout(function () {
      button.attr("disabled", false);
    }, 1500);
  });
  
  /*************************************************/
  /* Скрываем стоимость доставки
  /* для определенных способов
  /*************************************************/
      $(document).on( "changed:insales:deliveries", function(e) {
      var hide_delivery_cost_ids_arr = coSettings.hide_delivery_cost_ids.split("||");
      var hide_subtotal = false;  
      $.each(hide_delivery_cost_ids_arr, function(index, value){
         $('#price_' + value).addClass('hideDeliveryMethodPrice')
         if($('#delivery_variants').find('[name="order[delivery_variant_id]"]:checked').val() == value ){
            hide_subtotal = true;
         }
      });
      if(hide_subtotal){
         $('#delivery_price').closest('.co-basket_subtotal').addClass('hideDeliveryPrice');
      }else{
         $('#delivery_price').closest('.co-basket_subtotal').removeClass('hideDeliveryPrice');
      }
    });

  /*************************************************/
  /* Указать другого получателя
  /* (Есть тригер в предобработчике отправки заказа)
  /*************************************************/
    if(coSettings.recipientEnable == '1') {
      $('#client_info').append($('<div class="another_recipient co-checkout-block-2" id="another_recipient"></div>'));
      $('#client_info .another_recipient').append($('[for="order_field_' + coSettings.fieldRecipientCheckboxId + '"]').parent());
      $('#client_info .another_recipient').append('<div class="js_another_recipient_fields" style="display:none;"></div>');
      $('#client_info .another_recipient .js_another_recipient_fields').append($('#order_field_' + coSettings.fieldRecipientNameId).closest('.co-input'));
      $('#client_info .another_recipient .js_another_recipient_fields').append($('#order_field_' + coSettings.fieldRecipientPhoneId).closest('.co-input'));
      $('#order_field_' + coSettings.fieldRecipientPhoneId).inputmask('+9(999)999-99-99');

      if($('#order_field_' + coSettings.fieldRecipientCheckboxId).is(':checked')) {
          $('.js_another_recipient_fields').show();
      }

      $('#order_field_' + coSettings.fieldRecipientCheckboxId).on('change', function() {
          if($(this).is(":checked")) {
            $('.js_another_recipient_fields').show();
          }else{
            $('.js_another_recipient_fields').hide();
          }
      });
    }

  /*********************************/
  /* Смена способа доcтавки
  /*********************************/
  $(document).on( "changed:insales:deliveries", function(e) {
    $('#delivery_variants').find('.co-delivery_method').removeClass('delivery_active');
    $('#delivery_variants').find('[name="order[delivery_variant_id]"]:checked').closest('.co-delivery_method').addClass('delivery_active');

    // Показываем, что нет возможности доставить, если не выбрана доставка
    if ( $('#delivery_variants').find('[name="order[delivery_variant_id]"]:checked').is(':checked') ) {
      $('#delivery_variants').find('#deliveries-not-available-for-town').hide();
      $('#delivery_variants').attr('data-disabled-send-btn', false);
      $('#address_info').show();
      $('#payment_info').show();
    } else {
      $('#delivery_variants').find('#deliveries-not-available-for-town').show();
      $('#delivery_variants').attr('data-disabled-send-btn', true);
      $('#address_info').hide();
      $('#payment_info').hide();
    }
    EventBus.publish('update:order_send_btn');
  });

  /*********************************/
  /* Смена способа оплаты
  /*********************************/
  setTimeout(function() {
    $('#payment_gateways').find('.co-payment_method').removeClass('payment_active');
    $('#payment_gateways').find('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').addClass('payment_active');
  }, 1500);

  $("#payment_gateways .radio_button").change(function(){
    $('#payment_gateways').find('.co-payment_method').removeClass('payment_active');
    $('#payment_gateways').find('[name="order[payment_gateway_id]"]:checked').closest('.co-payment_method').addClass('payment_active');
  });

  /*********************************/
  /* Подъем на этаж
  /*********************************/
  if (coSettings.riseFloorEnable == '1') {
    $('#delivery_price').closest('.order-item').before('<div id="riseFloor_priceBlock" style="display:none;" class="co-basket_subtotal order-item"><div class="co-basket_subtotal-title">Подъем на этаж</div><div class="co-basket_subtotal-price co-price--current order-item__number" id="riseFloor_price"></div><div id="riseFloor_price_unformatted" style="display:none"></div></div>');

    $('#address_info .co-delivery_adress-form').append('<div id="riseFloor" class="riseFloor"></div>')
    $('#riseFloor').append('<div class="riseFloor_warning"><div class="riseFloor_warning__title">Особые условия для крупногабаритных заказов и заказов свыше 15 кг</div><div class="riseFloor_warning__descr">Если ваш заказ весит более 15 кг (когда в заказе несколько товаров, считается сумма их веса), либо заказ не помещается в лифт, курьеры поднимают такие заказы на этаж по лестнице только за дополнительную плату.<br/>Чтобы узнать стоимость подъема, введите свой этаж в форму ниже.<br/>Если заказ не поместится в лифт или этаж окажется выше заявленного, вы сможете доплатить курьеру за услугу подъема на месте по тарифу "<a href="/page/delivery" target="_blank" style="text-decoration: underline"><b>подъем по лестнице</b></a>", либо донести свой заказ от машины транспортной компании самостоятельно.<br/><br/>Подъем заказов легче 15 кг, либо тяжелее, но на лифте - <b>бесплатно</b>.</div></div>');
    $('#riseFloor').append('<input value="" name="order[delivery_price]" type="text" style="display: none;">').change();
    $('#riseFloor').append($('[for="order_field_' + coSettings.riseFloorFieldId + '"]').parent())
    $('#riseFloor').append('<div class="riseFloor__settings" style="display: none;"></div>')
    $('#order_field_' + coSettings.riseFloorFieldId).prop('checked', true);

    $('#address_info .co-delivery_adress-form').append('<div id="riseFloor"></div>')
    $('#riseFloor .riseFloor__settings').append($('[for="order_field_' + coSettings.riseFloorNumFieldId + '"]').parent().addClass('field-floor'))
    $('#order_field_' + coSettings.riseFloorNumFieldId).val(1)

    $('#riseFloor .riseFloor__settings').append($('[for="order_field_' + coSettings.riseFloorTypeFieldId + '"]').parent().hide())
    $('#riseFloor .riseFloor__settings').append('<div class="riseFloorType"><label for="stairs"><input name="riseFloorType" type="radio" id="stairs" value="stairs"  data-title="по лестнице" checked><span></span> по лестнице</label><label for="elevator" class="disabled"><input name="riseFloorType" type="radio" value="elevator" id="elevator" data-title="на лифте" disabled><span></span> на лифте</label></div>')
    
    if(coSettings.riseFloorOnlStairs == 1){
        $('#order_field_' + coSettings.riseFloorFieldId).closest('.co-input').find('.co-input-title').html('Нужен подъём на этаж (без лифта)');
          $('#riseFloor .riseFloor__settings').find('.riseFloorType').hide();
    }

    // Функция калькуляции
    function calcPriceRiseFloor(action) {
      if (action == 'calc') {
        var riseFloorType = $('[name="riseFloorType"]:checked').val();
        var floorNum = +$('#order_field_' + coSettings.riseFloorNumFieldId).val();
        var $currentDelivery = $('[name="order[delivery_variant_id]"]:checked').closest('.co-delivery_method');
        var $currentDeliveryPrice = +$currentDelivery.find('[data-price]').data('price');
        var $riseFloorPrice = 0;

        if (riseFloorType == 'elevator') {
          coSettings.riseFloorWeightElevatorFieldId.split('||').forEach(function (item) {
            var weight = +item.split('=')[0]
            var price = +item.split('=')[1]
            if (ORDER.items_weight < weight) {
              $riseFloorPrice = price;
            }
          })
        } else {
          coSettings.riseFloorWeightStairsFieldId.split('||').forEach(function (item) {
            var weight = +item.split('=')[0]
            var price = +item.split('=')[1]
            if (ORDER.items_weight < weight) {
              $riseFloorPrice = price * floorNum;
            }
          })
        }
      } else {
        var $riseFloorPrice = 0;
      }

      ORDER.riseFloor_price = $riseFloorPrice;
      EventBus.publish('update:checkout', ORDER);
      $('#order_field_' + coSettings.riseFloorPriceFieldId).val($riseFloorPrice)
      $('#riseFloor_price').html(Shop.money.format($riseFloorPrice));
      $('#riseFloor_price_unformatted').html($riseFloorPrice);
    }

    // При изменении состава корзины, пересчитываем стоимость подъема на этаж
    EventBus.subscribe('update_items:insales:cart', function (data) {
      ORDER.items_price = data.items_price;
      ORDER.total_price = data.total_price;
      ORDER.items_weight = data.items_weight;
      
      riseFloor()
      EventBus.publish('update:checkout', ORDER);
    })

    // Функция настроек
    var timerRiseFloor;
    function riseFloor() {
      clearTimeout(timerRiseFloor)
      timerRiseFloor = setTimeout(function() {
        if ($('#shipping_address').is(':visible')) {
          var riseFloorDeliveryArr = coSettings.riseFloorDeliveryIds.split("||");
          var show_riseFloor = false;  
          $.each(riseFloorDeliveryArr, function(index, value){
             if($('#delivery_variants').find('[name="order[delivery_variant_id]"]:checked').val() == value){
                show_riseFloor = true;
             }
          });
          
          if (ORDER.items_weight >= coSettings.riseFloorMinWeighFieldId && ORDER.items_weight <= coSettings.riseFloorMaxWeighFieldId && show_riseFloor == true) {
            if(!$('#riseFloor').is(":visible")) { // Если подъем был скрыт, то показываем его и включаем по-умолчанию
              console.log('Включен подъем');
              $('#riseFloor').show();
              $('#order_field_' + coSettings.riseFloorFieldId).prop('checked', 'checked')
              $('#order_field_' + coSettings.riseFloorTypeFieldId).val($('[name="riseFloorType"]:checked').data('title'))
              $('#order_field_' + coSettings.riseFloorFieldId).closest('.co-input').find('.co-input-description').html('Услуга подъёма на этаж подключена');
              $('#riseFloor .riseFloor__settings').show();
              $('#riseFloor_priceBlock').show();
              calcPriceRiseFloor('calc');
            }else{
              $('#riseFloor').show();
              if ($('#order_field_' + coSettings.riseFloorFieldId).is(':checked') == true) {
                console.log('Включен подъем');
                $('#order_field_' + coSettings.riseFloorTypeFieldId).val($('[name="riseFloorType"]:checked').data('title'))
                $('#order_field_' + coSettings.riseFloorFieldId).closest('.co-input').find('.co-input-description').html('Услуга подъёма на этаж подключена');
                $('#riseFloor .riseFloor__settings').show();
                $('#riseFloor_priceBlock').show();
                calcPriceRiseFloor('calc');
              } else {
                console.log('Выключен подъем');
                $('#order_field_' + coSettings.riseFloorTypeFieldId).val('')
                $('#order_field_' + coSettings.riseFloorFieldId).closest('.co-input').find('.co-input-description').html('Услуга подъёма на этаж не требуется');
                $('#riseFloor .riseFloor__settings').hide();
                $('#riseFloor_priceBlock').hide();
                calcPriceRiseFloor('reset');
              }
            }
          } else {
            console.log('Платный подъем скрыт');
            $('#order_field_' + coSettings.riseFloorTypeFieldId).val('')
            $('#riseFloor_priceBlock').hide();
            $('#riseFloor').hide();
            $('#order_field_' + coSettings.riseFloorFieldId).prop('checked', false);
            calcPriceRiseFloor('reset');
          }
        } else {
          console.log('Платный подъем скрыт');
          $('#order_field_' + coSettings.riseFloorTypeFieldId).val('')
          $('#riseFloor').hide();
          $('#riseFloor_priceBlock').hide();
          $('#order_field_' + coSettings.riseFloorFieldId).prop('checked', false);
          calcPriceRiseFloor('reset');
        }
      }, 500);
    }
    
    // При изменении способа дсоатвки проверяем функциюонал "подъем на этаж"
      $(document).on( "changed:insales:deliveries", function(e) {
       riseFloor()
    });

    // При смене типа поднятия, меняем доп. поле
    $('[name="riseFloorType"]').on('change', function () {
      riseFloor()
    })

    // Переключение чекбокса включения услуги
    $('#order_field_' + coSettings.riseFloorFieldId).on('change', function () {
      riseFloor()
    });

    // Изменение этажа
    $('#order_field_' + coSettings.riseFloorNumFieldId).on('change', function () {
      var floorNum = $(this).val();
      if (floorNum < 1) {
        floorNum = 1;
        $(this).val(floorNum)
      }
      
      if(floorNum == 1){
         $('.riseFloorType').find('[for="elevator"]').addClass('disabled').find('[name="riseFloorType"]').prop('disabled', true)
      }else{
           $('.riseFloorType').find('[for="elevator"]').removeClass('disabled').find('[name="riseFloorType"]').prop('disabled', false)
      }
      riseFloor()
    })
  }

  /*************************************/
  /* Манипуляция со способами доставки 
  /*************************************/
  $(document).ready(function () {
    var individual_hide_delivery_ids = coSettings.individualHideDeliveryIds + '';
    var individual_hide_delivery_ids_arr = individual_hide_delivery_ids.split('||');

    var legal_hide_delivery_ids = coSettings.legalHideDeliveryIds + '';
    var legal_hide_delivery_ids_arr = legal_hide_delivery_ids.split('||');

    // Скрытие способов доставки в зависимости от того, юрик или физик
      function settings_client_type(type, is_selector) {
        is_selector = is_selector || true;
        console.log("settings_client_type (type, is_selector=)", type, is_selector);
        if (type == 'individual') {          
          // уберём скрытие от юриков (если оно включено и это было переключение типа клиентов)
          if (coSettings.enableHiddingYdLegalEntities == "1") {
            if (is_selector) {
              $.each(legal_hide_delivery_ids_arr, function (index, value) {
                $('[for="order_delivery_variant_id_' + value + '"]').removeClass('not_available_custom');
                $('[data-delivery-tariffs-' + value + ']').removeClass('not_available_custom');
              });
            }
          }
          // добавим скрытие для физиков
          if (coSettings.enableHiddingPickupPrivatePerson == "1") {
            $.each(individual_hide_delivery_ids_arr, function (index, value) {
              $('[for="order_delivery_variant_id_' + value + '"]').addClass('not_available_custom');
              $('[data-delivery-tariffs-' + value + ']').addClass('not_available_custom');
            });
          }

        } else {          
          // уберём скрытие от физиков (если оно включено  и это было переключение типа клиентов)
          if (coSettings.enableHiddingPickupPrivatePerson == "1") {
            if (is_selector) {
              $.each(individual_hide_delivery_ids_arr, function (index, value) {
                $('[for="order_delivery_variant_id_' + value + '"]').removeClass('not_available_custom');
                $('[data-delivery-tariffs-' + value + ']').removeClass('not_available_custom');
              });
            }
          }

          // добавим скрытие для юриков
          if (coSettings.enableHiddingYdLegalEntities == "1") {

            $.each(legal_hide_delivery_ids_arr, function (index, value) {
              $('[for="order_delivery_variant_id_' + value + '"]').addClass('not_available_custom');
              $('[data-delivery-tariffs-' + value + ']').addClass('not_available_custom');
            });
          }
        }
      }

      if (coSettings.isClient == true) {
        // опеределение типа клиента
        $.getJSON("/client_account/contacts.json", function (data) {
          if (data.client.type == 'Client::Individual') {
            settings_client_type('individual');
          } else {
            settings_client_type('organization');
          }
        });

      } else {
        if ($('#client_info').find('.js-tabs-node--switch.co-tabs-node--active').data('target') == '#tabs-person') {
          settings_client_type('individual');
        } else if ($('#client_info').find('.js-tabs-node--switch.co-tabs-node--active').data('target') == '#tabs-organization') {
          settings_client_type('organization');
        }
        $('.js-tabs-node--switch').on('click', function () {
          if ($(this).data('target') == '#tabs-person') {
            settings_client_type('individual', true);
          } else if ($(this).data('target') == '#tabs-organization') {
            settings_client_type('organization', true);
          }
        });
      }
    
    // Скрытие/показ вариантов доставки/оплаты для особых групп
       if(coSettings.availableDeliveryIdsGroups1Enable == '1') {
          var idsGroups = coSettings.availableDeliveryIdsGroups1 + '';
          var idsGroups_arr = idsGroups.split('||');
          if (idsGroups_arr.indexOf(coSettings.clientGroupId) != -1) {
            var extra_hideDelivery_ids = coSettings.availableDeliveryHideIdsDelivery1 + '';
            var extra_hideDelivery_ids_arr = extra_hideDelivery_ids.split('||');
            $.each(extra_hideDelivery_ids_arr, function (index, value) {
              $('[for="order_delivery_variant_id_' + value + '"]').addClass('not_available_custom_1');
              $('[data-delivery-tariffs-' + value + ']').addClass('not_available_custom_1');
            });
            
            var extra_hidePayments_ids = coSettings.availableDeliveryHideIdsPayments1 + '';
            var extra_hidePayments_ids_arr = extra_hidePayments_ids.split('||');
            $.each(extra_hidePayments_ids_arr, function (index, value) {
              $('[for="order_payment_gateway_id_' + value + '"]').addClass('not_available_custom_1');
            });
          }else{
            var extra_hideAnotherDelivery_ids = coSettings.availableDeliveryHideAnotherIdsDelivery1 + '';
            var extra_hideAnotherDelivery_ids_arr = extra_hideAnotherDelivery_ids.split('||');
            $.each(extra_hideAnotherDelivery_ids_arr, function (index, value) {
              $('[for="order_delivery_variant_id_' + value + '"]').addClass('not_available_custom_1');
              $('[data-delivery-tariffs-' + value + ']').addClass('not_available_custom_1');
            });
          }
      }
  });

  /*************************************/
  /* Скрываем доставку в регионы
  /* если это уцененный товар
  /*************************************/
  if (coSettings.enableHiddingRegionsForMarkdown == "1" || coSettings.enableHiddingBuyCreditForMarkdown) {
    // Отслеживаем изменение состава корзины
    EventBus.subscribe('update_items:insales:cart', function (data) {
      check_markdown();
    });

    $(document).on('changed:insales:deliveries', function (e) {
      check_markdown();
    });

    function check_markdown() {
      // Проверка наличия товаров с уценкой и браком
      $.ajax({
        url: '/cart_items.json',
        type: 'get',
        dataType: 'json',
        success: function (data) {
          var mark_for_markdown = coSettings.skuMarkForMarkdown;
          var mark_for_defective = coSettings.skuMarkForDefective;
          var there_markdown = false;
          var there_defective = false;
          var chooseFirstPaymentTimerId;

          data.order_lines.forEach(function (item) {
            if(item.sku){
              if (item.sku.indexOf(mark_for_markdown) != -1) {
                there_markdown = true;
              }

              if (item.sku.indexOf(mark_for_defective) != -1) {
                if (item.sku.indexOf(mark_for_markdown) == -1) {
                  there_defective = true;
                }
              }
            }
          });

          // Если одно из утверждений истина (брак или уценка), скрываем способы оплаты, которые заданы в настройках
          if (coSettings.enableHiddingBuyCreditForMarkdown == "1") {
            if (there_markdown == true || there_defective == true) {
              coSettings.hiddingPaymentsForMarkdown.split('||').forEach(function(item){
                 $('[for="order_payment_gateway_id_' + item + '"]').addClass('not_available_for_markdown');
              })
            } else {
              coSettings.hiddingPaymentsForMarkdown.split('||').forEach(function(item){
                 $('[for="order_payment_gateway_id_' + item + '"]').removeClass('not_available_for_markdown');
              })
            }
          }

          // Скрываем доставку, если это не МСК и не СПБ
          if (coSettings.enableHiddingRegionsForMarkdown == "1") {
            if (there_markdown == true || there_defective == true) {
              var $thisLocation = JSON.parse($('[name="shipping_address[kladr_json]').val())
                     if ($thisLocation.city == 'Санкт-Петербург' || $thisLocation.city == 'Москва' || $thisLocation.state == 'Московская' || $thisLocation.state == 'Санкт-Петербург') {
                 $('#delivery_variants').find('.co-tabs-content').removeClass('not_available_for_markdown');
                 $('#deliveries-not-available-for-markdown').remove();
                 $('#delivery_variants').attr('data-disabled-send-btn-second', false);
                 $('#address_info').removeClass('not_available_for_markdown');
                 $('#payment_info').removeClass('not_available_for_markdown');
                 $('#delivery_price').closest('.order-item').removeClass('not_available_for_markdown');
              } else {
                 $('#delivery_variants').find('.co-tabs-content').addClass('not_available_for_markdown');
                 if (!$('#delivery_variants').find('#deliveries-not-available-for-markdown').length > 0) {
                    $('#delivery_variants').append('<div id="deliveries-not-available-for-markdown">В заказе есть уценённые товары! Мы доставляем уцененные товары только в пределах МКАД по Москве и в пределах КАД по Санкт-Петербургу, укажите в поле "Город" Москву или Санкт-Петербург и выберете пункт самовывоза.</div>');
                    $('#delivery_variants').attr('data-disabled-send-btn-second', true);
                    $('#address_info').addClass('not_available_for_markdown');
                    $('#payment_info').addClass('not_available_for_markdown');
                    $('#delivery_price').closest('.order-item').addClass('not_available_for_markdown');
                 }
              }
              chooseFirstPayment()
            } else {
              $('#delivery_variants').find('.co-tabs-content').removeClass('not_available_for_markdown');
              $('#deliveries-not-available-for-markdown').remove();
              $('#delivery_variants').attr('data-disabled-send-btn-second', false);
              $('#address_info').removeClass('not_available_for_markdown');
              $('#payment_info').removeClass('not_available_for_markdown');
              $('#delivery_price').closest('.order-item').removeClass('not_available_for_markdown');
            }
            EventBus.publish('update:order_send_btn');
          }
        }
      });
    }
  }

  /*************************************/
  /* Выбираем первый доcтупный 
  /* способ доставки
  /*************************************/
  // Функция переключения способа доставки
  function chooseFirstDelivery(isUpdate) {
    if ($('[data-delivery-id]:checked').closest('.co-delivery_method').hasClass('not_available_custom') || $('[data-delivery-id]:checked').closest('.co-delivery_method').hasClass('not_available_custom_1') || $('[data-delivery-id]:checked').closest('.co-delivery_method').hasClass('not_aviable') || $('[data-delivery-id]:checked').closest('.co-delivery_method').hasClass('not_aviable') || $('[data-delivery-id]:checked').closest('.co-delivery_method').parent().hasClass('not_available') || !$('[data-delivery-id]:checked').data('delivery-id') || isUpdate == true) {
      var deliveryFirstChecked = false;
      $('.co-delivery_method').each(function (index) {
        if (!$(this).hasClass('not_available_custom') && !$(this).hasClass('not_available_custom_1') && !$(this).hasClass('not_aviable') && !$(this).hasClass('not_available') && !$(this).closest('.co-delivery_method').parent().hasClass('not_available_custom') && !$(this).closest('.co-delivery_method').parent().hasClass('not_available_custom_1') && deliveryFirstChecked == false) {
          $(this).trigger('click');
          deliveryFirstChecked = true;
        }
      });
      isUpdate = false;
    }
  }

  // Первый доступный способ доставки (реагируем на загрузку страницы и смену города)
  var full_locality_name = '';
  setInterval(function () {
    chooseFirstDelivery();
    if (full_locality_name != $('[name="shipping_address[full_locality_name]"]').val()) {
      full_locality_name = $('[name="shipping_address[full_locality_name]"]').val();
      setTimeout(function () {
        chooseFirstDelivery(true);
      }, 2000);
    }

    // Скрываем кнопку покупки и выводим сообщение, если нет доступных способов доставки
    var deliveries_num = 0;
    $('.co-delivery_method').each(function () {
      if (!$(this).hasClass('not_available_custom') && !$(this).hasClass('not_available_custom_1') && !$(this).hasClass('not_available')) {
        deliveries_num++;
      }
    })
    if (deliveries_num == 0) {
      $('#deliveries-not-available').show();
      $('#delivery_price').closest('.co-basket_subtotal').hide();
      $('#delivery_price').attr('data-disabled-send-btn', true);
      $('#checkout_omni_dates').addClass('delivery_omni_dates_hide');
    } else {
      $('#deliveries-not-available').hide();
      $('#delivery_price').closest('.co-basket_subtotal').show();
      $('#delivery_price').attr('data-disabled-send-btn', false);
      $('#checkout_omni_dates').removeClass('delivery_omni_dates_hide');
    }
    EventBus.publish('update:order_send_btn');
  }, 1000);

  /*************************************/
  /* Переключение табов юр/физ
  /*************************************/
  $('.js-tabs-node--switch').on('click', function(){
      chooseFirstDelivery(true)
  })
  
  /*************************************/
  /* Выбираем первый доcтупный 
  /* способ оплаты
  /*************************************/
  // Первый доступный способ оплаты (реагируем на загрузку страницы и смену способа доставки)
  var full_locality_name = '';
  setTimeout(function () {
     chooseFirstPayment(true);
  }, 1000);
  
  // Обновление списка оплаты - последний этап. Из него получаем актуальные цены
  $(document).on("loaded:insales:payments", function (e) {
    $.get('/cart_items.json').done(function (data) {
      // Обновляем цены
      ORDER.total_price = data.total_price;
      ORDER.delivery_price = data.delivery_price;
      EventBus.publish('update:checkout', ORDER);
    })
    setHideCredit(); // Скрываем способ оплаты Кредит если есть товар из категории Запчасти и комплектующие
  });
  
  /*************************************/
  /* OMNI DATES
  /*************************************/
    if(coSettings.enableOmniDates == true) {
      var prev_variant_id = 0;
      var saved_address = globalSettings.omniDates.saved_address;
      var omni_fields_id = globalSettings.omniDates.omni_fields_id;
      var delivery_id_map = globalSettings.omniDates.delivery_id_map;
      var delivery_id_hidden = globalSettings.omniDates.delivery_id_hidden;
      var delivery_address_hidden = globalSettings.omniDates.delivery_address_hidden;
      var pvz_delivery_address = globalSettings.omniDates.pvz_delivery_address;
      var omniShop = globalSettings.omniDates.omniShop;
      var delivery_date_rules = globalSettings.omniDates.delivery_date_rules;
  
      function checkDelivery () {
          var deliveryCount = $(".co-delivery_method").not(".not_available").length;
          if (deliveryCount == 0) { // скроем виджет
              $("#checkout_omni_dates").hide(); 
              $("#shipping_address").hide();
              $("#create_order").hide();
              $("#payment_gateways").hide();
              $(".co-customer").hide();
              $(".co-input--comment").parent().hide();
          } else {// покажем
              $("#shipping_address").show();
              $("#create_order").show();
              $("#payment_gateways").show();
              $(".co-customer").show();
              $(".co-input--comment").parent().show();
              showDates();
          }
      }
    
      function omniDateClientType(clientType){
          $('#omni-dates-not-available').remove()
          if(clientType == 'organization'){
              // Скрывем календарь дат для юрика
              $('#checkout_omni_dates .content-item__wrapper').hide()
              $('#checkout_omni_dates').append('<div id="omni-dates-not-available" style="display: block;">Дата и время доставки согласуются после оплаты счёта.</div>')
              $('#checkout_omni_dates').data('available', false)
          }else{
              // Показываем календарь дат
              $('#checkout_omni_dates .content-item__wrapper').show()
              $('#checkout_omni_dates').data('available', true)
          }
      }
      
      function showDates () {  // обработчик клика на выбор опций (вариантов) доставки
            if($(".delivery_variants .js-input-field:input:checked").data() != undefined) {
                var id = $(".delivery_variants .js-input-field:input:checked").data().deliveryId
              if(delivery_address_hidden.indexOf(id) != -1 && delivery_id_hidden .indexOf(id) != -1) {
                    $('#address_info').addClass('hide_address_info');
              } else {
                    $('#address_info').removeClass('hide_address_info');
              }
              if(delivery_address_hidden.indexOf(id) == -1) { // скрытие/показ полей адреса 
                      // проверить есть ли сохранённый адрес
                      if(saved_address.save) { // восстановить данные
                          $("#shipping_address_street").val(saved_address.street);
                          $("#shipping_address_house").val(saved_address.house);
                          $("#shipping_address_field_"+omni_fields_id.building).val(saved_address.building);
                          $("#shipping_address_field_"+omni_fields_id.structure).val(saved_address.structure);
                          $("#shipping_address_flat").val(saved_address.flat);
                          saved_address.save=false;
                      }
                      $("#shipping_address").show();
                        
              } else {
                if (delivery_id_map[id]) {
                      if(delivery_id_map[id][0]!= undefined && pvz_delivery_address[delivery_id_map[id][0]] != undefined ) { 
                          if(!saved_address.save) {
                              saved_address.save=true;  
                              saved_address.street=$("#shipping_address_street").val();
                              saved_address.house=$("#shipping_address_house").val();
                                saved_address.building=$("#shipping_address_field_"+omni_fields_id.building).val();
                              saved_address.structure=$("#shipping_address_field_"+omni_fields_id.structure).val();
                              saved_address.flat=$("#shipping_address_flat").val();               
                              saved_address.save=true;                                        	$("#shipping_address_street").val(pvz_delivery_address[delivery_id_map[id][0]].street);
                              $("#shipping_address_house").val(pvz_delivery_address[delivery_id_map[id][0]].house);
                              $("#shipping_address_field_"+omni_fields_id.building).val(pvz_delivery_address[delivery_id_map[id][0]].building);
                              $("#shipping_address_field_"+omni_fields_id.structure).val(pvz_delivery_address[delivery_id_map[id][0]].structure);
                              $("#shipping_address_flat").val(pvz_delivery_address[delivery_id_map[id][0]].flat);
                          }
                      }
                }
                      $("#shipping_address").hide();
              }          
              if(prev_variant_id==id) {
                  return; // не поменялась
              }
              prev_variant_id=id;
  
              $("#checkout_omni_dates").hide() ; // скроем виджет
              $("#checkout_load_dates").attr( 'style', '' );
              
              if (delivery_id_map[id] == undefined) {
                  $("#omni_delivery_data" ).html('');
                  $("#checkout_omni_dates").hide();
                  $("#checkout_load_dates").attr( 'style', 'display: none; visibility: hidden;' );
                  return;
              }
  
              omniDates("#checkout_omni_dates", { // обновить данные в виджете для выбранного id
                  omniShop: omniShop, // в какой сет настроек прослойки к  Omni пойдём за данными
                  omniZone: delivery_id_map[id][0],  // берём зону для варианта
                    omniGlobalZone: delivery_id_map[id][1],  // берём глобальную зону для варианта
                    omniZoneType: delivery_id_map[id][2],  // берём тип зоны для варианта
                    omniDateRules: delivery_date_rules,  // Правила праздничных дат
                  devel: false,
                  intervalLabel: "<br/>Выберите время доставки", // можно использовать теги
                  dateLabel: "Выберите дату доставки",
                  finalMessage: "<br/>", // добавим отсут в конце
                  onLoad: function (result) {  // обработчик ошибок загрузки данных
                      $("#checkout_load_dates").attr( 'style', 'display: none; visibility: hidden;' );
                      if ( result == false ) {  // если ошибка
                          $("#checkout_omni_dates").hide(); // скроем виджет
                          $("#checkout_omni_dates_error").show() ; // покажем сообщение
                      } else { // когда хорошо
                          $("#checkout_omni_dates_error").hide(); // скроем сообщение
                          var curdate = new Date;
                          var sdate = new Date("2020-01-10");
                        
                          if( curdate>=sdate && delivery_id_hidden.indexOf(id) == -1 ) {
                              $("#checkout_omni_dates").show() ; // покажем виджет там где не надо его скрывать
                                $('#address_info').removeClass('hide_omni_dates');
                          } else {
                              console.log('$("#checkout_omni_dates").hide()');
                              $("#checkout_omni_dates").hide() ; // скроем виджет
                              $('#address_info').addClass('hide_omni_dates');
                          }
                      }
                    
                      if (coSettings.isClient == true) {
                        $.getJSON("/client_account/contacts.json", function (data) {
                          if (data.client.type == 'Client::Individual') {
                            omniDateClientType('individual');
                          } else {
                            omniDateClientType('organization');
                          }
                        });
                      } else {
                        if ($('#client_info').find('.js-tabs-node--switch.co-tabs-node--active').data('target') == '#tabs-person') {
                          omniDateClientType('individual');
                        } else if ($('#client_info').find('.js-tabs-node--switch.co-tabs-node--active').data('target') == '#tabs-organization') {
                          omniDateClientType('organization');
                        }
                        $('.js-tabs-node--switch').on('click', function () {
                          if ($(this).data('target') == '#tabs-person') {
                            omniDateClientType('individual');
                          } else if ($(this).data('target') == '#tabs-organization') {
                            omniDateClientType('organization');
                          }
                        });
                      }
                  },
                  onSelect: function (rezult) {  // обработчик выбора
                      console.log ('omni_delivery_data rezult', rezult) // пока пусто
                      $("#omni_delivery_data").html( // заполним скрытые поля
                          '<input value="' + omni_fields_id.delivery_date + '" id="order_field_id_' + omni_fields_id.delivery_date + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_date + '][field_id]" type="hidden">' +
                          '<input value="' + rezult.omni_delivery_date + '" id="order_field_value_' + omni_fields_id.delivery_date + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_date + '][value]" type="hidden">' +
  
                          '<input value="' + omni_fields_id.delivery_rate + '" id="order_field_id_' + omni_fields_id.delivery_rate + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_rate + '][field_id]" type="hidden">' +
                          '<input value="' + rezult.omni_delivery_rate.externalId + '" id="order_field_value_' + omni_fields_id.delivery_rate + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_rate + '][value]" type="hidden">' +                  
  
                          '<input value="' + omni_fields_id.delivery_interval_from +  '" id="order_field_id_' + omni_fields_id.delivery_interval_from + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_interval_from + '][field_id]"   type="hidden">' +
                          '<input value="' + rezult.omni_delivery_interval.from + '" id="order_field_value_'  + omni_fields_id.delivery_interval_from + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_interval_from + '][value]" type="hidden">' +
  
                          '<input value="' + omni_fields_id.delivery_interval_till +  '" id="order_field_id_' + omni_fields_id.delivery_interval_till + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_interval_till + '][field_id]" type="hidden">' +
                          '<input value="' + rezult.omni_delivery_interval.till + '" id="order_field_value_' + omni_fields_id.delivery_interval_till + '" name="order[fields_values_attributes][' + omni_fields_id.delivery_interval_till + '][value]" type="hidden">'
                      );
                    
                      // Способ доставки по-умолчанию
                          if($('#delivery_variants').find('.delivery_active').is(':visible')){
  
                          }else{             
                              $('#delivery_variants').find('.co-delivery_method:visible').not('.not_available_custom, .not_available').filter(':first').trigger('click');
                          }
                  }, 
              });
          }
      }
        
      // Инициализация календаря
          $('#shipping_address').after('<div id="checkout_omni_dates"/>'); // создать контейнер для виджета  // payment_gateways
          $('#shipping_address').after('<div id="checkout_omni_dates_error" style="display: none; visibility: hidden; color:red></div>'); // создать контейнер для виджета  // payment_gateways
          $('#shipping_address').after('<div id="checkout_load_dates" style="display: none; visibility: hidden;"><img src="https://static-internal.insales.ru/files/1/11/5832715/original/loading.gif"></div>'); // создать контейнер для виджета
          $(".delivery_variants :input(#radio_button, #js-input-field)").click( function () {
            showDates();  
          }); // повесить обработчик на изменение (выбор) опций доставки (через селектр по классу)
        
          $('#shipping_address').after( $('<div id="omni_delivery_data"></div>') );   // сделаем контейнер для данных
        
      // При изменении способа доставки проверяем обновляем календарь
          $(document).on( "changed:insales:deliveries", function(e) {
            checkDelivery()
          });
    }
     
  /****************************************************************/
  /* Предобработчик отправки заказа
  /* 1. Заполнение полей "Получатель"
  /* 2. Изменение цены доставки, если включен подъем на этаж
  /***************************************************************/
      // Перед отправкой формы заполняем поля "Получатель", если они не заполнены
      $('#create_order').after('<button class="co-button co-button--checkout js-button-checkout_submit" id="create_order_new" type="submit">Подтвердить заказ</button>');
      $('#create_order').addClass('hide_btn');
      $('#create_order_new').on('click', function(Event){
        Event.preventDefault();
        
        var priceDelivery = ORDER.riseFloor_price + +$('#delivery_price_unformatted').html();
        
        if($('#order_field_' + coSettings.fieldRecipientCheckboxId).is(':checked')) {
            // Меняем стоимость доставки в зависимости от стоимости подъема на этаж и отправляем заказ
              $('[name="order[delivery_price]"]').val(priceDelivery);
           
              setTimeout(function() {
                  $('#create_order').trigger('click');
              }, 500);
            
              // if (typeof (sendOrder) === "function") {
              //     sendOrder();
              // }
        }else{
          if(coSettings.isClient == true) {
            if(coSettings.recipientEnable == '1') {
              $.getJSON("/client_account/contacts.json", function(data){
                $('#order_field_' + coSettings.fieldRecipientNameId).val(data.client.name);
                $('#order_field_' + coSettings.fieldRecipientNameId).closest('.co-input').removeClass('co-input--empty_nested');

                $('#order_field_' + coSettings.fieldRecipientPhoneId).val(data.client.phone);
                $('#order_field_' + coSettings.fieldRecipientPhoneId).closest('.co-input').removeClass('co-input--empty_nested');

                // Меняем стоимость доставки в зависимости от стоимости подъема на этаж и отправляем заказ
                  $('[name="order[delivery_price]"]').val(priceDelivery);

                  setTimeout(function() {
                      $('#create_order').trigger('click');
                  }, 500);

                  if (typeof (sendOrder) === "function") {
                      //sendOrder()
                  }
              });
            }else{
                // Меняем стоимость доставки в зависимости от стоимости подъема на этаж и отправляем заказ
                  $('[name="order[delivery_price]"]').val(priceDelivery);

                  setTimeout(function() {
                      $('#create_order').trigger('click');
                  }, 500);

                  if (typeof (sendOrder) === "function") {
                      //sendOrder()
                  }
            }
          }else{       
            if(coSettings.recipientEnable == '1') {       
              if($('#client_info').find('.js-tabs-node--switch.co-tabs-node--active').data('target') == '#tabs-person'){
                var client_phone = $('#tabs-person').find('#client_phone').val();
                var client_name = $('#tabs-person').find('#client_name').val();
              }else if($('#client_info').find('.js-tabs-node--switch.co-tabs-node--active').data('target') == '#tabs-organization'){
                var client_phone = $('#tabs-organization').find('#client_phone').val();
                var client_name = $('#tabs-organization').find('#client_name').val();
              }
              if(client_name && parseInt(client_phone.replace(/\D+/g,"")) != 'NaN') {
                if($('#order_field_' + coSettings.fieldRecipientNameId).val() != client_name || parseInt($('#order_field_' + coSettings.fieldRecipientPhoneId).val().replace(/\D+/g,"")) != parseInt(client_phone.replace(/\D+/g,""))){
                  $('#order_field_' + coSettings.fieldRecipientNameId).val(client_name);
                  $('#order_field_' + coSettings.fieldRecipientNameId).closest('.co-input').removeClass('co-input--empty_nested');

                  $('#order_field_' + coSettings.fieldRecipientPhoneId).val(parseInt(client_phone.replace(/\D+/g,"")));
                  $('#order_field_' + coSettings.fieldRecipientPhoneId).closest('.co-input').removeClass('co-input--empty_nested');
                }
              }
            }
            
            // Меняем стоимость доставки в зависимости от стоимости подъема на этаж и отправляем заказ
              $('[name="order[delivery_price]"]').val(priceDelivery);

              setTimeout(function() {
                  $('#create_order').trigger('click');
              }, 500);
            
              if (typeof (sendOrder) === "function") {
                  //sendOrder()
              }
          }
        }
     });  

     let ya_items;
     EventBus.subscribe('update_items:insales:cart', function (data) {
      // console.log('order_ready >> ', data);
      ya_items = data.order_lines.map(e => {
        return {
          id: e.id,
          name: e.title,
          price: e.total_price,
          quantity: e.quantity
        }
      });
      // console.log('%c items >> ', 'background:black;color:white;padding:5px;',  items);
    });
     EventBus.subscribe('order_ready:insales:cart', function (data) {
      // console.log('order_ready >> ', data);
      ya_items = data.order_lines.map(e => {
        return {
          id: e.id,
          name: e.title,
          price: e.total_price,
          quantity: e.quantity
        }
      });
      // console.log('%c items >> ', 'background:black;color:white;padding:5px;',  items);
    });
    let ready = false;
    $('#order_form').on('submit', function(e){
      if(!ready) {
        console.log('%c Not ready ', 'background: red; color: #bada55');
        ready = true;
      // ОТПРАВКА ЦЕЛИ ТОЛЬКО ПРИ ПЕРВОМ КЛИКЕ
         yaCounter48352907.reachGoal('otpravka_formy_zakaza');
      // yaCounter48352907.reachGoal('send_form_confirm-order');
        e.preventDefault();
        setTimeout(() => {
          $('#order_form').submit();
        }, 1000);
      };
    });
});