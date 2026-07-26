
  	if( $.cookie( 'developing') == 'true' ) {
    	$('.developing').hide();       
    }
    $(document).on('click','.js-close-coockie',function(){
      $('.coockie-panel').hide();
        $.cookie( 'coockie', 'true', {
          path: '/'
        });      
    })
    if( $.cookie( 'coockie') != 'true' ) {
      $('.coockie-panel').show();       
    }


// Функция для разворачивания параметров товара
	function setParam(obj, name, value) {
		(obj[ name ] || (obj[ name ] = value))
	}
	function productParameters(_product) {
		_product.parameters = {};
		_product.sale = null;

		// Пермалинк параметра: массив характеристик
		$.each( _product.properties, function( index, property ){
			$.each( _product.characteristics, function( index, characteristic ){
			if (property.id === characteristic.property_id) {
				_product.property = property;
				setParam(_product.parameters, property.permalink, property)
				setParam(_product.parameters[ property.permalink ], 'characteristics', [])

				var uniq = true;
				$.each(_product.parameters[ property.permalink ].characteristics, function (index, cha) {
				if (cha.id == characteristic.id) {
					uniq = false;
				}
				});
				if (uniq) {
				_product.parameters[ property.permalink ].characteristics.push(characteristic)
				}
			}
			});
		});
		return _product;
	}


// Ленивая загрузка
$("img.lazy").each(function(index) {
	$(this).lazyload();
  });

  (function () {
	document.addEventListener("DOMContentLoaded", function() {
	  var lazyloadImages;

	  if ("IntersectionObserver" in window) {
		lazyloadImages = document.querySelectorAll(".lazyCss");
		var imageObserver = new IntersectionObserver(function(entries, observer) {
		  entries.forEach(function(entry) {
			if (entry.isIntersecting) {
			  var image = entry.target;
			  image.classList.remove("lazyCss");
			  imageObserver.unobserve(image);
			}
		  });
		});

		lazyloadImages.forEach(function(image) {
		  imageObserver.observe(image);
		});
	  } else {
		var lazyloadThrottleTimeout;
		lazyloadImages = document.querySelectorAll(".lazyCss");

		function lazyloadCss () {
		  if(lazyloadThrottleTimeout) {
			clearTimeout(lazyloadThrottleTimeout);
		  }

		  lazyloadThrottleTimeout = setTimeout(function() {
			var scrollTop = window.pageYOffset;
			$(".lazyCss").each(function( index ) {
				if(lazyloadImages[index].offsetTop < (window.innerHeight + scrollTop)) {
				  lazyloadImages[index].src = lazyloadImages[index].dataset.src;
				  lazyloadImages[index].classList.remove('lazyCss');
				}
			});

			if(lazyloadImages.length == 0) {
			  document.removeEventListener("scroll", lazyloadCss);
			  window.removeEventListener("resize", lazyloadCss);
			  window.removeEventListener("orientationChange", lazyloadCss);
			}
		  }, 20);
		}

		document.addEventListener("scroll", lazyloadCss);
		window.addEventListener("resize", lazyloadCss);
		window.addEventListener("orientationChange", lazyloadCss);
	  }
  });
})();


// equalHeight
(function () {
	function equalHeight(group) {
		var tallest = 0;
		group.each(function() {
			thisHeight = $(this).height();
			if(thisHeight > tallest) {
				tallest = thisHeight;
			}
		});
		group.height(tallest);
	}
	$(document).ready(function(){
		$(window).on('load resize', function(){
			$('.js-services-product-item').css('height', '')

			equalHeight($(".js-services-product-item"));
		})
	});
})();

/**************************************************/
/*                  RECAPTCHA                     */
/**************************************************/
function initRecaptcha(element){
  $(`#${element}`).html('')
  var recaptcha;
  var recaptcha_key = Shop.config.get('recaptcha_key').recaptcha_key
  recaptcha = grecaptcha.render(element, {
      'sitekey' : recaptcha_key,
      'theme' : 'light'
  });
}

function resetRecaptcha(){
  $('.g-recaptcha').find('iframe').each(function () {
    $(this).attr('src', $(this).attr('src'));
  });
}

$(document).ready(function () {
	"use strict";

	// Имя клиента
		$.getJSON("/client_account/contacts.json", function(data){
			if(data.client) {
				$('.js-clientName').html(data.client.name);
			}
		});

    // Прокрутка вверх
		var $scrollTop = $('.js-scroll-top');
		$(function(){
			/*$(window).scroll(function(){
				if($(document).scrollTop()>$(window).height()){
					$scrollTop.show();
				}else{
					$scrollTop.hide();
				}
			});*/
			$scrollTop.click(function(){
				$('html,body').animate({scrollTop: 0}, 1000);
			});
		});

	/*==============================
	Menu
	==============================*/
	$(window).on('load', function() {
		$('.menu').show();
	});
	$('.header__btn').on('click', function() {
		$('.menu').addClass('menu--active');
		$('body').append('<div class="menu__bg"></div>')
		$('body').addClass('menu__noOverflow')
		$('.menu__bg').on('click', function() {
			$('.menu').removeClass('menu--active');
			$('.menu__bg').remove('')
			$('body').removeClass('menu__noOverflow')
		});
	});
	$('.menu .menu__close').on('click', function() {
		$('.menu').removeClass('menu--active');
		$('.menu__bg').remove('')
		$('body').removeClass('menu__noOverflow')
	});

	/*==============================
	Menu Catalog
	==============================*/
	$('.js-open-header_menu').on('click', function() {
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
	$('.slider__img').each(function(){
		if ($(this).attr('data-bg')){
			$(this).css({
				'background': 'url(' + $(this).data('bg') + ')',
				'background-position': 'center center',
				'background-repeat': 'no-repeat',
				'background-size': 'cover'
			});
		}
	});
	$('.slider__nav .next').on('click', function() {
		$(this).closest('.slider').find('.owl-carousel').trigger('next.owl.carousel');
	});
	$('.slider__nav .prev').on('click', function() {
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
		responsive:{
			0:{
				items:1
			},
			360:{
				items:1
			},
			768:{
				items:3
			},
			992:{
				items:4
			},
			1200:{
				items:4
			}
		}
	});
	$('.carousel__nav--next').on('click', function() {
		$(this).closest('.carousel').find('.owl-carousel').trigger('next.owl.carousel');
	});
	$('.carousel__nav--prev').on('click', function() {
		$(this).closest('.carousel').find('.owl-carousel').trigger('prev.owl.carousel');
	});

	/*==============================
	Masonry
	==============================*/
	$('.masonry').each(function(){
		if ($(this).attr('data-bg')){
			$(this).css({
				'background': 'url(' + $(this).data('bg') + ')',
				'background-position': 'center center',
				'background-repeat': 'no-repeat',
				'background-size': 'cover'
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
	if($(window).width() < 768){
		$(window).on('load', function() {
			$('.collection_filter__sidebar').show();
		});
		$('.filter__open').on('click', function() {
			$('.collection_filter__sidebar').addClass('collection_filter__sidebar-open');
			$('.collection_filter__sidebar').addClass('collection_filter__sidebar--open');
			$('body').append('<div class="collection_filter__sidebar__bg"></div>')
			$('body').addClass('collection_filter__sidebar__noOverflow')
			$('.collection_filter__sidebar__bg').on('click', function() {
				$('.collection_filter__sidebar').removeClass('collection_filter__sidebar--open');
				$('.collection_filter__sidebar__bg').remove('')
				$('body').removeClass('collection_filter__sidebar__noOverflow')
			});
		});
		$('.collection_filter__sidebar .filter__content__mobile__close, .collection_filter__sidebar .filter__btn__close').on('click', function() {
			$('.collection_filter__sidebar').removeClass('collection_filter__sidebar--open');
			$('.collection_filter__sidebar__bg').remove('')
			$('body').removeClass('collection_filter__sidebar__noOverflow')
		});
	}

	/*==============================
	Payment
	==============================*/
	$('.delivery :input').click(function () {
		$('.delivery :input').each(function() {
			if ($('#cash').is(":checked")) {
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
		gallery:true,
		item:1,
		loop:true,
		speed:500,
		thumbItem:4,
		vThumbWidth:85,
		slideMargin:0,
		galleryMargin:15,
		thumbMargin:15,
		controls:false,
		currentPagerPosition:'left',
		responsive : [
			{
				breakpoint:767,
					settings: {
						thumbMargin:10,
					}
			}
		]
	});

	/*==============================
	Video
	==============================*/
	$('.video').each(function(){
		if ($(this).attr('data-bg')){
			$(this).css({
				'background': 'url(' + $(this).data('bg') + ')',
				'background-position': 'center center',
				'background-repeat': 'no-repeat',
				'background-size': 'cover'
			});
		}
	});

	/*==============================
	Tabs
	==============================*/
		$(document).on('click', '[role="tab"]', function (event) {
			event.preventDefault()
			var el = $(this).attr('href');
			$(this).parent().parent().find('[role="presentation"]').removeClass('active');
			$(this).parent().addClass('active');

			$(el).parent().find('[role="tabpanel"]').removeClass('active');
			$(el).addClass('active');
		});

		$(document).ready(function() {
			$('[role="tablist"] [role="presentation"]').filter( ':first' ).find('a').trigger('click');
		});

	/*==============================
	Модаль
	==============================*/
		$(document).on('click', '.popup-modal', function (event) {
			event.preventDefault()
			$('.modal .error_form').html('');
			var el = $(this).data('attr');
			if (el.length) {
					$.magnificPopup.open({
							items: {
									src: el
							},
							type: 'inline'
					});
					$('.mfp-wrap').removeClass('mfp-wrap');
			}
          
          	if($(el).find('.g-recaptcha').length > 0){
            	var recaptchaId = $(el).find('.g-recaptcha').attr('id');
                resetRecaptcha();
              	initRecaptcha(recaptchaId);
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
			src: el
		},
		type: 'inline'
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
		url: "/client_account/session.json",
		type: "POST",
		data: "email="+ email +"&password=" + password,
	}).done(function(data) {
		if(data.status == 'ok'){
			location.reload();
		}else{
			data.errors.forEach(function(element) {
				$('.js-form-signin .error_form').append('<p>' + element + '</p>');
			});
		}
	});
});

/*==============================
Регистрация в модали
==============================*/
$('input').on('focus', function(){
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
	if($('.js-form-signup').find('[name="client[consent_to_personal_data]"]:checked')[0]){
		consent_to_personal_data = 1;
	}

	$('.js-form-signup .error_form').html('');

	$.ajax({
		url: "/client_account/contacts.json",
		type: "POST",
		data: "client[name]="+ name +"&client[email]="+ email +"&client[phone]=" + phone +"&client[password]=" + password +"&client[password_confirmation]=" + password_confirmation +"&client[consent_to_personal_data]=" + consent_to_personal_data+"&client[registered]=1" ,
	}).done(function(data) {
		if(data.status == 'ok'){
			location.reload();
		}else{
			if(consent_to_personal_data != 1){
				$this.find('[name="client[consent_to_personal_data]"]').parent().addClass('field_error');
			}

			if(password.length < 6){
				$this.find('[name="client[password]"]').addClass('field_error');
			}else if(password != password_confirmation){
				$this.find('[name="client[password_confirmation]"]').addClass('field_error');
			}

			$.each(data.errors, function(key, value) {
				if(key == 'consent_to_personal_data'){
					$this.find('[for="'+ key +'"]').parent().addClass('field_error');
				}else if(key == 'captcha_solution'){
					$('.js-form-signup .error_form').html(value);
				}else{
					$this.find('[name="client['+ key +']"]').addClass('field_error');
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
		url: "/client_account/password/reset.json",
		type: "POST",
		data: "email="+ email,
	}).done(function(data) {
		if(data.status == 'ok'){
			$.magnificPopup.open({
				items: {
						src: '#thx_for_reset'
				},
				type: 'inline'
			});
		}else{
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
	var name = $this.find('[name="feedback[name]"]').val();
	var phone = $this.find('[name="feedback[phone]"]').val();
	var subject = $this.find('[name="feedback[subject]"]').val();
	var content = $this.find('[name="feedback[content]"]').val();
	var from = $this.find('[name="feedback[from]"]').val();
  	var recaptcha = $this.find('[name="g-recaptcha-response"]').val();
  	var responseModal = $this.data('response-modal');

	$('.js-form-call .error_form').html('');

	$.ajax({
		url: "/client_account/feedback.json",
		type: "POST",
		data: "feedback[name]="+ name +"&feedback[from]="+ from +"&feedback[phone]=" + phone +"&feedback[subject]=" + subject +"&feedback[content]=" + content + "&g-recaptcha-response=" + recaptcha,
	}).done(function(data) {
		if(name.length < 4 || from.length < 4 || phone.length < 10 || content.length < 4){
			if(name.length < 4){
				$('[name="feedback[name]"]').addClass('field_error');
			}
			if(from.length < 4){
				$('[name="feedback[from]"]').addClass('field_error');
			}
			if(phone.length < 10){
				$('[name="feedback[phone]"]').addClass('field_error');
			}
			if(content.length < 4){
				$('[name="feedback[content]"]').addClass('field_error');
			}
		}else{
			if(data.status == 'ok'){
				var el = $('#' + responseModal);
				$.magnificPopup.open({
						items: {
								src: el
						},
						type: 'inline'
				});
			}else{
				$.each(data.errors, function(key, value) {
					$('[name="feedback['+ key +']"]').addClass('field_error');
				});
              	resetRecaptcha();
			}
		}
	});
});

/*==============================
Подписка на новости
==============================*/
// Показываем при первой загрузке страницы, чере 5 секунд
var subscribeModalRun = function () {
    if (window.navigator.webdriver) return; // не показываем в автотестах (Lighthouse, боты)
  	var params = window.location.search.replace('?','').split('&').reduce(function(p,e){var a = e.split('=');p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);return p;},{});
    if(params['utm_source'] == undefined || params['utm_source'] == '' || !params['utm_source']){
      var thisTime = new Date().getTime();
      var firstVisit = $.cookie("firstVisit");
      var delayTime = 30; // Время задержки вывода модали (в секундах)

      if(firstVisit == '' || firstVisit == null) {
          $.cookie("firstVisit", thisTime);
          firstVisit = $.cookie("firstVisit");
      }

			
      var subscribeModalInterval = setInterval(() => {
					if($('.window-form').length > 0 ){return false;} // модалка не откроется пока активно всплывающее окно предзаказа или информации о поступлении

          var currentTime = new Date().getTime()-delayTime*1000;
          if(currentTime > firstVisit) {
              // Запускаем модаль. если ранее не показывали
                  if (firstVisit != "false"){
                      var el = $('#subscribe');
                      $.magnificPopup.open({
                          items: {
                              src: el
                          },
                          type: 'inline'
                      });
                  }

              $.cookie("firstVisit", false);
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
      }
    });
  });
$('.js-open-contacts').on('click',function(){
  $('.contacts-top-menu-block').removeClass('hidden');
  $(this).addClass('is-active');
  // console.log('Открывается!');
})
$(document).on('click touchstart',function(elem){
  var contacts_top = $(elem.target).closest('.contacts-top-menu-block').length;
  var js_open_contacts = $(elem.target).closest('.js-open-contacts').length;
  if (!contacts_top && !js_open_contacts){
      $('.contacts-top-menu-block').addClass('hidden');
      $(".js-open-contacts").removeClass('is-active');
        // console.log('Закрывается!');
  }
});
$('.contacts-overlay').on('click',function(){
  $('.contacts-top-menu-block').addClass('hidden');
  $(".js-open-contacts").removeClass('is-active');
})
// Open modal search or search panel in dependence window width
$('.js-open-search-panel').on('click', function (elem) {
// console.log(window.innerWidth );
  if (window.innerWidth  <= 768){
        alertify.panel({
          target: $('[data-modal="search-form"]').html(),
          position: 'top', hideAfter: false
        });
        // console.log("Тут должна открыться модалка");
  }
  else {
    var search_container = $('.js-toggle-search');
    var search_button = $('.js-open-search-panel');
    var contacts_header =   $('.js-contacts-header');
    search_button.addClass('hidden');
    search_container.removeClass('hidden');
    // console.log("Тут должна открыться панелька");
    }
});

// Closest search-panel when click on other documents
$(document).on('click touchstart',function(elem){
  var toggle_search = $(elem.target).closest('.js-toggle-search').length;
  var open_panel = $(elem.target).closest('.js-open-search-panel').length;

  if (  !toggle_search && (window.innerWidth  >= 768) && !open_panel ){
    var search_container = $('.js-toggle-search');
    var search_button = $('.js-open-search-panel');
    var contacts_header =  $('.js-contacts-header');
    search_container.addClass('hidden');
    search_button.removeClass('hidden');
    // console.log("Тут должна скрыться панелька");
  }
});


if (window.innerWidth  <= 768){
  if ($('.hidden-breadcrumbs').hasClass("js-hidden-bread")){

    $('.breadcrumb-item').each(function(index){
      if ((index > 2) && (index != $(".breadcrumb-item").size() - 1))
      {
        $(this).addClass("hidden");
        // console.log($(this).text());
      }
    })
    $('.js-hidden-bread').click(function(){
      $('.breadcrumb-item').removeClass("hidden");
      $('.js-hidden-bread').parent().addClass("hidden");
    })
  }
}
})();

/* Модальное окно Гео-привязки */
	$(document).ready(function() {
      var winboxShow = false;
      var winboxObject;
      var winboxType;
      var winboxTypeClass;
      var winboxIsQuickview = false;
      var cart_type;
      if(cart_type == 'extended'){
          var winboxTriggers = '.winbox, .cart-add';
      }else{
          var winboxTriggers = '.winbox';
      }

      $('body').on('click', '.winbox', function(e){
          e.preventDefault();
          winboxObject = $(this);
          winboxObjectProductTitle = winboxObject.data('product-title');
          winboxObjectVariantId = winboxObject.data('variant-id');
          winboxObjectVariantPrice = winboxObject.data('variant-price');
          winboxObjectVariantImage = winboxObject.data('variant-image');
          winboxObjectProductId = winboxObject.data('product-id');
          if(winboxObject.hasClass('cart-add')){
              winboxType = 'cart';
          }else{
              winboxType = winboxObject.data('window').split('|')[0];
              winboxTypeClass = winboxObject.data('window');
              if(winboxObject.data('window') == 'request'){
              	winboxTypeClass = 'quickorder';
              }
          }
          if(winboxShow){
              if(quickviewCurrent != '' && (winboxObject.data('window') == 'request' || winboxObject.data('window') == 'quickorder')){
                  winboxIsQuickview = true;
              }
              if($('.window').hasClass('window-type-menu')){
                  $('.window').addClass('window-tohide-menu');
              }
              $('.window').addClass('window-tohide').animate({left: 0}, 200, function(){

                  $('.window').attr('class', 'window window-tohide window-type-'+winboxTypeClass);
                  $('.window-content').remove();
                  winboxData(winboxObject);
                  if(winboxType != 'quickview' && winboxType != 'cart'){
                      $('.window').animate({left: 0}, 200, function(){
                          $('.window').removeClass('window-tohide');
                      });
                  }
                  winboxShow = true;
              });
							
						}else{
              $('body').append('<div class="window window-tohide window-type-'+winboxType+'"><div class="window-height"></div><div class="window-data"><button title="Close (Esc)" type="button" class="window-close js-window-close"><svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg"><g opacity="0.5"><rect x="23.6066" y="25.0208" width="32" height="2" rx="1" transform="rotate(-135 23.6066 25.0208)" fill="#B5ACA7"/><rect x="0.979187" y="23.6066" width="32" height="2" rx="1" transform="rotate(-45 0.979187 23.6066)" fill="#B5ACA7"/></g></svg></button></div><div class="window-fake-shade window-close js-window-close"></div></div><div class="window-shade"></div>');
              $('body').css('padding-right',window.innerWidth-document.body.clientWidth).css('overflow','hidden');
              winboxData(winboxObject);
              $('.window-shade').fadeIn(200);
              if(winboxType != 'quickview' && winboxType != 'cart'){
                  $('.window').animate({left: 0}, 200, function(){
                      $('.window').removeClass('window-tohide');
                  });
              }
              winboxShow = true;
          }

          	if($('.window-type-'+winboxType+'').find('.g-recaptcha').length > 0){
            	var recaptchaId = $('.window-type-'+winboxType).find('.g-recaptcha').attr('id');
                resetRecaptcha();
              	initRecaptcha(recaptchaId);
            }        
      });
      $('body').on('click', '.js-window-close', function(e){
          e.preventDefault();
          if(winboxIsQuickview){
              quickviewCurrent.trigger('click');
              winboxIsQuickview = false;
              quickviewCurrent = '';
          }else{
              $('.window').addClass('window-tohide');
              $('.window-shade').fadeOut(200,function(){
                  $('body').css('padding-right',0).css('overflow','');
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
      function winboxData(obj){
          $geoType = '';

          if(obj.hasClass('cart-add')){
              wbWindow = 'cart';
          }else{
              wbWindow = obj.data('window').split('|')[0];
          }
          $('.window-data').append('<div class="window-content window-obj-quickorder window-obj-'+wbWindow+'"></div>');

          switch(wbWindow){
			case 'text':
				//Текстовое сообщение
				windowContent = '<div>';
				windowContent += '<p class="window-title">'+wbTextTitle+'</p>';
				windowContent += '<p>'+wbTextContent+'</p>';
				windowContent += '</div>';
				break;
			case 'geo':
				//GEO
				$geoType = obj.data('window').split('|')[1];
				windowContent = '';
				switch($geoType){
					case 'geoTerm':
						windowContent += '<p class="window-title"><span class="geo-city-short js-geo-city-short"></span><a href="'+geoDeliveryPageUrl+'" class="button button-bordered winbox" data-window="geo|geoCity">Изменить</a></p>';
						windowContent += '<p class="window-description">Измените город если он неверный или не определился.</p>';
						windowContent += '<div class="js-geo-data geo-data" data-modules="table"></div>';
						windowContent += '<p><a href="'+geoDeliveryPageUrl+'" class="button">Подробнее о доставке и оплате</a></p>';
						break;
					case 'geoCity':
                    	windowContent += '<p class="window-title">';
                    	windowContent += '<span class="geo-city-short js-geo-city-short"></span>';
                    	if(Site.template == 'product'){
                    		//windowContent += '<a href="'+geoDeliveryPageUrl+'" class="button is-bordered winbox" data-window="geo|geoTerm">Способы доставки и оплаты</a>';
                        }else{
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
                windowContent = '<form action="/client_account/feedback" class="window-form js-request-feedback"><input name="feedback[content]" id="feedback-content" type="hidden" value=""/><input name="feedback[from]" id="feedback-from" type="hidden" value="' + wbWindow + '@' + domen + '"/>';
                windowContent += '<input name="feedback[subject]" id="feedback-subject" type="hidden" value="Заявка на товар"/>';
                windowContent += '<input name="feedback[content]" id="feedback-content" type="hidden" value=""/>';
                windowContent += '<input name="content" id="feedback-content-2" type="hidden" value=""/>';
                windowContent += '<p class="window-title">Заявка на товар</p><p class="window-description">Укажите ваши контактные данные и мы уведомим вас как только данный товар будет в наличии.</p>';

                windowContent += '<div class="window-product"><div class="window-form-item"><div class="row"><div class="cell-xl-4 cell-md-4 cell-sm-4 col-xs-6"><div class="window-form-item-image"><img src="' + winboxObjectVariantImage + '" class="img-responsive"></div></div><div class="cell-xl-8 cell-md-8 cell-sm-8 cell-xs-6"><div class="row"><div class="cell-xl-12"><div class="window-product-title">' + winboxObjectProductTitle + '</div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-quantity item-quantity clearfix"><button class="js-cart-item-count cart-item-count item-quantity-minus" data-id="' + winboxObjectVariantId + '_0" data-action="minus"><i class="ion ion-ios-minus-empty"></i></button><input type="text" name="quantity" value="1" id="quickorder-variant-quantity" class="cart-item-quantity-input-' + winboxObjectVariantId + '_0" data-price="' + winboxObjectVariantPrice + '" data-id="' + winboxObjectVariantId + '_0" min="1" max="999"><button class="js-cart-item-count cart-item-count item-quantity-plus" data-id="' + winboxObjectVariantId + '_0" data-action="plus"><i class="ion ion-ios-plus-empty"></i></button></div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-price' + requestClass + '"><span class="cart-item-total-price-' + winboxObjectVariantId + '_0">' + InSales.formatMoney(winboxObjectVariantPrice, cv_currency_format) + '</span></div></div></div></div></div></div></div>';

                windowContent += '<div class="window-form-item"><input type="text" name="name" placeholder="Имя" class="window-input"/></div>';
                windowContent += '<div class="window-form-item"><input type="email" name="from" class="window-input required" placeholder="Электронная почта *"></div>';
                windowContent += '<div class="window-form-item"><input type="tel" name="phone" class="window-input mask-phone required" placeholder="Контактный телефон *"></div>';
                windowContent += '<input type="hidden" name="product" class="window-input" data-title="Товар" value="' + winboxObjectProductTitle + '">';
                windowContent += '<input type="hidden" name="url" class="window-input" data-title="Ссылка на товар" value="' + obj.data('window-product-url') + '">';
                windowContent += '<div class="window-form-item"><textarea name="comment" placeholder="Комментарий" class="window-input" rows="4"></textarea></div>';
                windowContent += privacy.forms_build;
                windowContent += '<div id="captchaPreorder" class="g-recaptcha"></div>';
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
                windowContent = '<form action="/client_account/feedback" class="window-form js-preorder-feedback"><input name="feedback[content]" id="feedback-content" type="hidden" value=""/><input name="feedback[from]" id="feedback-from" type="hidden" value="' + wbWindow + '@' + domen + '"/>';
                windowContent += '<input name="feedback[subject]" id="feedback-subject" type="hidden" value="Заявка на товар"/>';
                windowContent += '<input name="feedback[content]" id="feedback-content" type="hidden" value=""/>';
                windowContent += '<input name="content" id="feedback-content-2" type="hidden" value=""/>';
                windowContent += '<p class="window-title">Заявка на товар</p><p class="window-description">Укажите ваши контактные данные и мы уведомим вас как только данный товар будет в наличии.</p>';

                windowContent += '<div class="window-product"><div class="window-form-item"><div class="row"><div class="cell-xl-4 cell-md-4 cell-sm-4 col-xs-6"><div class="window-form-item-image"><img src="' + winboxObjectVariantImage + '" class="img-responsive"></div></div><div class="cell-xl-8 cell-md-8 cell-sm-8 cell-xs-6"><div class="row"><div class="cell-xl-12"><div class="window-product-title">' + winboxObjectProductTitle + '</div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-quantity item-quantity clearfix"><button class="js-cart-item-count cart-item-count item-quantity-minus" data-id="' + winboxObjectVariantId + '_0" data-action="minus"><i class="ion ion-ios-minus-empty"></i></button><input type="text" name="quantity" value="1" id="quickorder-variant-quantity" class="cart-item-quantity-input-' + winboxObjectVariantId + '_0" data-price="' + winboxObjectVariantPrice + '" data-id="' + winboxObjectVariantId + '_0" min="1" max="999"><button class="js-cart-item-count cart-item-count item-quantity-plus" data-id="' + winboxObjectVariantId + '_0" data-action="plus"><i class="ion ion-ios-plus-empty"></i></button></div></div><div class="cell-sm-6 cell-xs-12"><div class="window-product-price' + requestClass + '"><span class="cart-item-total-price-' + winboxObjectVariantId + '_0">' + InSales.formatMoney(winboxObjectVariantPrice, cv_currency_format) + '</span></div></div></div></div></div></div></div>';

                windowContent += '<div class="window-form-item"><input type="text" name="name" placeholder="Имя" class="window-input required"/></div>';
                windowContent += '<div class="window-form-item"><input type="email" name="from" class="window-input required" placeholder="Электронная почта *"></div>';
                windowContent += '<div class="window-form-item"><input type="tel" name="phone" class="window-input mask-phone required" placeholder="Контактный телефон *"></div>';
                windowContent += '<input type="hidden" name="product" class="window-input" data-title="Товар" value="' + winboxObjectProductTitle + '">';
                windowContent += '<input type="hidden" name="url" class="window-input" data-title="Ссылка на товар" value="' + obj.data('window-product-url') + '">';
                windowContent += '<div class="window-form-item"><textarea name="comment" placeholder="Комментарий" class="window-input" rows="4"></textarea></div>';
                windowContent += privacy.forms_build;
                windowContent += '<div id="captchaPreorder" class="g-recaptcha"></div>';
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
				windowContent += '<input type="hidden" name="order[delivery_variant_id]" value="'+delivery_variant_id+'"><input type="hidden" name="order[payment_gateway_id]" value="'+payment_gateway_id+'"><input type="hidden" name="pid_value" value="1"><input type="hidden" value="'+winboxObjectVariantId+'" id="quickorder-variant-id"><input type="hidden" name="shipping_address[street]" value="-"><input type="hidden" name="shipping_address[house]" value="-">';
              	windowContent += '<input name="order[fields_values_attributes][12207267][hack]" value="" type="hidden">';
              	windowContent += '<input name="order[fields_values_attributes][12207267][field_id]" value="12207267" type="hidden">';
              	windowContent += '<input name="order[fields_values_attributes][12207267][value]" id="order_field_12207267" type="hidden" value="_"/>';
              	windowContent += '<input name="order[fields_values_attributes][12207268][hack]" value="" type="hidden">';
              	windowContent += '<input name="order[fields_values_attributes][12207268][field_id]" value="12207268" type="hidden">';
              	windowContent += '<input name="order[fields_values_attributes][12207268][value]" id="order_field_12207268" type="hidden" value="_"/>';
				switch($quickorderType){
					case 'request':
						windowContent += '<p class="window-title">Заявка на товар</p>';
						windowContent += '<input type="hidden" name="order[comment]" value="ВНИМАНИЕ - заявка на поступление: '+winboxObjectProductTitle+'">';
						quickorderTypeText = '<p class="window-description">Мы оповестим вас как только данный товар появится в наличии.</p>';
						break;
					case 'fastorder':
						windowContent += '<p class="window-title">Покупка в 1 клик</p>';
						windowContent += '<input type="hidden" name="order[comment]" value="ВНИМАНИЕ - покупка в 1 клик: '+winboxObjectProductTitle+'">';
						quickorderTypeText = '<p class="window-description">В самое ближайшее время наш менеджер свяжется с вами и уточнит сроки и стоимость доставки.</p>';
						break;
					default:
						//
				}
				if($quickorderType == 'request' && product_order_type == 'hidden_price'){
					requestClass = ' hidden';
				}else{
					requestClass = '';
				}
				windowContent += '<div class="window-product"><div class="window-form-item"><div class="row"><div class="col-lg-4 col-md-4 col-sm-4 col-xs-6"><div class="window-form-item-image"><img src="'+winboxObjectVariantImage+'" class="img-responsive"></div></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-6"><div class="row"><div class="col-lg-12"><div class="window-product-title">'+winboxObjectProductTitle+'</div></div><div class="col-sm-6 col-xs-12"><div class="window-product-quantity item-quantity clearfix"><button class="js-cart-item-count cart-item-count item-quantity-minus" data-id="'+winboxObjectVariantId+'_0" data-action="minus"><i class="fa fa-minus" aria-hidden="true"></i></button><input type="text" value="1" id="quickorder-variant-quantity" class="cart-item-quantity-input-'+winboxObjectVariantId+'_0" data-price="'+winboxObjectVariantPrice+'" data-id="'+winboxObjectVariantId+'_0" min="1" max="999"><button class="js-cart-item-count cart-item-count item-quantity-plus" data-id="'+winboxObjectVariantId+'_0" data-action="plus"><i class="fa fa-plus" aria-hidden="true"></i></button></div></div><div class="col-sm-6 col-xs-12"><div class="window-product-price'+requestClass+'"><span class="cart-item-total-price-'+winboxObjectVariantId+'_0">'+InSales.formatMoney(winboxObjectVariantPrice, cv_currency_format)+'</span></div></div></div></div></div></div></div>';
				windowContent += quickorderTypeText;
				windowContent += '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Имя <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="text" name="client[name]" data-title="Имя" class="window-input required"/></div></div></div>';
				windowContent += '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Контактный телефон <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="tel" name="client[phone]" class="window-input mask-phone required" data-title="Телефон"/></div></div></div>';
				switch($quickorderType){
					case 'request':
						windowContent += '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Электронная почта <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="email" name="client[email]" class="window-input required" data-title="Электронная почта"/></div></div></div><div id="captchrequest" class="g-recaptcha"></div>';
						windowContent += '<button type="submit" class="button_send">Оставить заявку</button>'+privacy.forms_build+'<div class="status status-block"></div>';
						break;
					case 'fastorder':
						if(product_order_email){
							windowContent += '<div class="window-form-item"><div class="row"><div class="col-lg-12"><label>Электронная почта <span class="required">*</span></label></div><div class="col-lg-8 col-md-8 col-sm-8 col-xs-12"><input type="email" name="client[email]" class="window-input required" data-title="Электронная почта"/></div></div></div><div id="captchaFastorder" class="g-recaptcha"></div>';
						}else{
							windowContent += '<input type="hidden" name="client[email]" value="'+wbWindow+'@'+domen+'">';
						}
						windowContent += '<button type="submit" class="button_send">Завершить оформление</button>'+privacy.forms_build+'<div class="status status-block"></div>>';
						break;
					default:
						//
				}
				windowContent += '</form>';
				break;
          }
          if(wbWindow != 'quickview'){
              $('.window-content').append(windowContent);
              $('.mask-phone').inputmask('+9(999)999-99-99');
          }
          if(wbWindow == 'geo'){
              geoIsUpdate = false;
              checkGeo();
          }
          if(wbWindow == 'geoMap'){
              geoIsUpdate = false;
              checkGeoMap();
          }
          EventBus.subscribe('update_items:insales:cart', function (data) {
            if(data.items_count > 0) {
               $('.js-geoTermCart').show();
            }else{
               $('.js-geoTermCart').hide();
            }
          });
      }


	var windowAjax = '';
	var windowFormContent = '';
	$('body').on('submit', '.window-order', function(e){
		e.preventDefault();
		$form = $(this);
		if(windowAjax != ''){
			windowAjax.abort();
		}
		$('.status').html('');
		var windowFormErrors = false;
		var windowPrivacyErrors = false;
		$('.window-input', $form).each(function(index){
			$(this).removeClass('input-error');
			if($(this).hasClass('required') && $(this).val() == ''){
				windowFormErrors = true;
				$(this).addClass('input-error');
			}
		});
		if(!$('.privacy-info input', $form).prop('checked') && $('.privacy-info input', $form).length > 0){
			windowPrivacyErrors = true;
		}
		if(windowFormErrors || windowPrivacyErrors){
			$('.status').html('<span class="text-red"><i class="fa fa-exclamation-triangle fa-lg"></i>'+((windowFormErrors)?'Не все поля заполнены корректно.':'')+' '+((windowPrivacyErrors)?'Вы должны дать согласие на обработку данных.':'')+'</span>');
		}else{
			$('button', $form).addClass('button-grey').prop('disabled', true);
			$('.status').html('<span class="text-grey"><i class="fa fa-spinner fa-spin fa-lg"></i>Пожалуйста, подождите&hellip;</span>');
			windowAjax = $.ajax({
				url: '/cart_items.json',
				type: 'post',
				data: '_method=put&cart[quantity]['+$('#quickorder-variant-id').val()+']='+$('#quickorder-variant-quantity').val(),
				success: function(e){
					windowAjax = $.ajax({
						url: '/fast_checkout.json',
						type: 'post',
						data: $form.serialize(),
						dataType: 'json',
						success: function(e){
							if(e.status == 'ok'){
								if(wbQuickorder == 'request'){
									wbTextTitle = 'Заявка успешно отправлена!';
									wbTextContent = 'Мы обязательно свяжемся с вами как только данный товар появится в наличии.</span>';
									$('body').append('<a href="#" class="winbox js-winbox-fake" data-window="text"></a>');
									$('.js-winbox-fake').trigger('click');
									$('.js-winbox-fake').remove();
								}else{
									$('.status').html('<span class="text-green"><i class="fa fa-check fa-lg"></i>Заявка успешно отправлена! Сейчас вы будете перенаправлены на страницу заказа. Если этого не произошло <a href="'+e.location+'" class="link-alt">нажмите сюда</a>.</span>');
									window.setTimeout(function(){
										window.location.href = e.location;
									}, 3000);
								}
							}else{
								var errorText = '';
								$.each(e.errors, function(i,item){
									$.each(item, function(i,item2){
										errorText += '\n'+item2;
									});
								});
								if(errorText != ''){
									$('.status').html('<span class="text-red"><i class="fa fa-info fa-lg"></i>'+errorText+'</span>');
								}else{
									$('.status').html('<span class="text-red"><i class="fa fa-info fa-lg"></i>Во время отправки данных возникза ошибка! Попробуйте повторить позже.</span>');
								}
							}
						}
					});
				}
			});
		}
	});
  });

// +- для товара в модали
	$('body').on('click', '.js-cart-item-count', function(e){
		e.preventDefault();
		var item = $(this).data('id');
		var itemInput = $('.cart-item-quantity-input-'+item);
		var itemText = $('.cart-item-quantity-'+item);
		var itemVal = parseInt(itemInput.val());
      	var clickDelay = false;
		if(clickDelay == false){
			itemValTmp = parseInt(itemInput.val());
			clickDelay = true;
		}
		var itemMaxVal = (itemInput.attr('max') != '' && itemInput.attr('max') != 'null') ? itemInput.attr('max') : 999;
		if(itemVal > itemMaxVal){
			itemVal = itemMaxVal;
			itemInput.val(itemVal);
			itemText.html(itemVal);
		}else{
			switch($(this).data('action')){
				case 'minus':
					// Уменьшаем
					if(itemVal > 1){
						itemVal--;
						itemInput.val(itemVal);
						itemText.html(itemVal);
					}
					break;
				case 'plus':
					// Прибавляем
					if(itemVal < itemMaxVal){
						itemVal++;
						itemInput.val(itemVal);
						itemText.html(itemVal);
					}
					break;
				default:
					//
			}
		}
		$('.cart-item-total-price-'+item).html(InSales.formatMoney(itemInput.data('price')*itemVal, cv_currency_format));
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

    var val_send;
    var max_send = $(this).attr('data-max-send');

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
            windowContent = '<p class="window-title">Заявка на товар</p>';
            windowContent += '<p class="window-description" style="text-align: center;">Заявка успешно отправлена! Мы оповестим вас как только данный товар появится в наличии.</p>';
            windowContent += '<p class="window-continue js-window-close" style="text-align: center;"><button class="button_send button_continue">Продолжить покупки</button></p>';
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

    sessionStorage.getItem('send_success') ? val_send = sessionStorage.getItem('send_success') : val_send = 0;

    if (max_send <= val_send) {
        maxSendError();
        $(this).find('.button-widget-feedback')
            .attr('disabled', 'disabled')
            .addClass('is-secondary');

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
  })
  .done(function (cart) {
    console.log(cart);
  
  $.post('/fast_checkout.json', {
    client: {
      name: name,
      email: email,
      phone: phone,
      consent_to_personal_data: true
    },
    order: {
      delivery_variant_id: 4692733,
      payment_gateway_id: 2870119,
      // delivery_variant_id: 2807915,
      // payment_gateway_id: 925052,
      comment: "Предзаказ: \n" + comment,
    },
  })
  .done(function (response) {
    if(response.errors) {
            $.each(response.errors, function (i, val) {
                $widgetFeedback.find('[name="' + i + '"]').addClass('input-error');
                $widgetFeedback.find('[name="' + i + '"]').after('<div class="error">' + val[0] + '</div>');
                alertify.error(val);
            });
    } else {
            windowContent = '<p class="window-title">Заявка на товар</p>';
            windowContent += '<p class="window-description" style="text-align: center;">Заявка успешно отправлена! Мы оповестим вас как только данный товар появится в наличии.</p>';
            windowContent += '<p class="window-continue" style="text-align: center;"><button class="button_send button_continue js-window-close">Продолжить покупки</button></p>';
            $('.window-content').html(windowContent)

            $widgetFeedback.trigger('reset');
            $widgetFeedback.find('.form-row').removeClass('active');
            val_send++;
            sessionStorage.setItem('send_success', val_send);
    }
  })
  
  })
  
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
	$('.js-subscribe_submit').click(function(event) {
		event.preventDefault();
		var $this = $(this).closest('.js-subscribe');
		$this.find('.errorMsg').remove();
		$this.find('#subscribe_email').removeClass('error');

		var errors = '';
		var name = $this.find('#subscribe_name');
		var phone = $this.find('#subscribe_phone');
		var email = $this.find('#subscribe_email');
		var pattern = new RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9-]+.+.[A-Z]{2,4}$/i);
		if(phone.val() == '' ){
			phone.val('80000000000')
		}
		if(email.val() != '' && pattern.test(email.val()) && name.val() != ''){
			$.ajax({ url:'/client_account/session.json',
				type: 'delete'
			});
			$.ajax({
				url: '/client_account/contacts.json',
				type: 'post',
				data: 'client[consent_to_personal_data]=1&client[registered]=1&client[phone]='+phone.val()+'&client[password]=q1w2e3&client[password_confirmation]=q1w2e3&client[email]='+email.val()+'&client[name]='+name.val(),
				success: function(response){
					if(response.status == 'error') {
						$.each(response.errors, function(index, value){
							errors += '<li>'+ value[0] +'</li>'
						});
					}else{
						$this.find('.subscribe_block_content').hide();
						$this.find('.subscribe_block_success').show();
						return true;
					}

					if (errors) {
						$this.append('<ul class="errorMsg">' + errors + '</ul>');
					}
				},
				error: function(response){
					$this.find('#subscribe_email').addClass('error');
					return false;
				}
			});
		}else{
			$this.find('input#subscribe_name,input#subscribe_email').addClass('error');
			errors = 'Эти поля обязательны к заполнению.';
		}

		if(errors){
			$this.find('.subscribe_block_info').before('<ul class="errorMsg">' + errors + '</ul>')
		}
	});
$(document).on('focus','input',function(){
	$(this).removeClass('error');
})

/*
* Отложенные
*/
var Favorite = new Favorites({
	onUpdate: function (data) {
	  if(data.$target){
	  	if($(data.$target).hasClass('is-added') == true){
			var el = $('#thx-favorites');
			$.magnificPopup.open({
				items: {
					src: el
				},
				type: 'inline'
			});
		}
	  }

      // Пример работает только с common.js v2
      // Рендер списка товаров
      var products = data.products;
      var product_ids = '';
      $('.js-favorite').html('');
      if(data.favorites.size > 0){
        $('.js-wishlist-count').html(data.favorites.size).show();
      }else{
        $('.js-wishlist-count').html('0').hide();
      }

      _.forEach(products, function(product) {
          if(product){
              $('.js-favorite').append('<div class="col-xs-6 col-sm-4 col-md-3">' + Template.render(product, 'product_card') + '</div>');
              $('.js-favorite').find('[data-favorites-trigger]').addClass('is-added');
          }
      });

      if($('.js-favorite').html() == ''){
		$('.js-favorite').html('<div class="col-xs-12 col-sm-12 col-md-12"><div class="products_empty">Список избранного пуст!</div></div>');
      }else{
		$('.favorite-actions').show();
	  }

	  $(".js-favorite img.lazy").each(function(index) {
		$(this).lazyload();
	  });

      // инициализация инстансов нужна после динамического добавления товаров
      Products.getList(_.map(products, 'id'))
	}
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
	$('.js-buy-all').on('click', function() {
		$(".js-favorite").find('[data-item-add]').each(function(index) {
			$(this).trigger('click');
		});
	});

// Удаляем все товары из избранного
	$('.js-clear-all').on('click', function() {
		$(".js-favorite").find('[data-favorites-trigger]').each(function(index) {
			$(this).trigger('click');
		});
		$('.favorite-actions').hide();
		$('.js-favorite').html('<div class="col-xs-12 col-sm-12 col-md-12"><div class="products_empty">Список избранного пуст!</div></div>');
	});
