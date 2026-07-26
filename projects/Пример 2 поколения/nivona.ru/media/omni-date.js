;(function() {

    // основная функция для библиотеки
    function omni_date(containerId, options) {
      // 1) + проверить и запомнить входные данные omni_container + omni_zone
      // 2) + нарисовать интерфейс (если не рисовали)
      // 3) + получить данные из Omni
      // 4) + распарсить и отобразить в интерфейсе
      // заголовки и сообшений

        var r = null;
        omni_zone = options.omniZone || "" ;
      	omni_global_zone = options.omniGlobalZone || "" ;
      	omni_zone_type = options.omniZoneType || "zone2" ;
        omni_shop = options.omniShop || "" ;
        omni_date_rules = options.omniDateRules || "" ;
        var dev_cluster = options.devel || false;
        if ( dev_cluster === true ) { omni_dev_cluster = true; }

        on_load_callback = options.onLoad || on_load_callback;
        on_select_callback = options.onSelect || on_select_callback;

        omni_delivery_date_label = options.dateLabel || omni_delivery_date_label ;
        omni_delivery_interval_label = options.intervalLabel || omni_delivery_interval_label ;
        omni_no_date_message = options.noDateMessage || omni_no_date_message ;
        // omni_delivery_final_message = options.finalMessage || omni_delivery_final_message;

        if ( omni_ui_draw == false ) {

            omni_container = containerId || ""; // сохнаним идентификатор элемента
            if ( $( omni_container ).length != 1 ) { return false ; } // если его нет или элементов несколько вернём ошибку
            // нарисуем в omni_container нужные элементы  интерфейса с лейблами которе передали / а если их не передали то с текстами  них по умолчанию
            // ну а если кому-то нужно поменять их внешний вид пусть использует стили (id элементов описаны ниже)
            // $( omni_container ).addClass('content-item').append( $('<div id="omni_delivery_date_label" class="block-title">'+omni_delivery_date_label+'</div><div id="omni_delivery_date_picker_div"/><div id="omni_delivery_date_input"/><div id="omni_delivery_interval_label">'+omni_delivery_interval_label+'</div><select id="omni_delivery_interval_select"/><input id="omni_delivery_date_picker_input" type="hidden"><div id="omni_delivery_final_message">'+omni_delivery_final_message+'</div>') );


            $(omni_container).addClass('content-item').append($('<div id="omni_delivery_date_label" class="block-title">'+omni_delivery_date_label+'</div>'));

            $(omni_container).append($('<div class="content-item__wrapper"/>'));

            $(omni_container).find('.content-item__wrapper').append($('<div class="content-item__wrapper-elem co-input co-input-date"/>'));
            $(omni_container).find('.co-input-date').append($('<label class="co-input-label">Дата доставки</label>'));
            $(omni_container).find('.co-input-date').find('.co-input-label').after($('<div class="co-input-select-wrapper"><select class="omni_delivery_date_select co-input-field" /></div>'));

            // $(omni_container).find('.co-input-date').append($('<input id="omni_delivery_date_input" class="co-input-field omni_delivery_date_picker_input"></input>')); // Old Вывод от календаря

            // $(omni_container).find('.co-input-date').append($('<div id="omni_delivery_date_picker_div"/>')); // Old Календарь

            $(omni_container).find('.content-item__wrapper').append($('<div class="content-item__wrapper-elem co-input co-input-time"/>'));
            $(omni_container).find('.co-input-time').append($('<label id="omni_delivery_interval_label" class="co-input-label">Время доставки</label>'));
            $(omni_container).find('.co-input-time').append($('<div class="co-input-select-wrapper"><select id="omni_delivery_interval_select" class="co-input-field" /></div>'));
            $(omni_container).find('.co-input-time').append($('<input id="omni_delivery_date_picker_input" class="omni_delivery_date_picker_input" type="hidden">')); // type="hidden"
            // $(omni_container).append($('<div id="omni_delivery_final_message">'+omni_delivery_final_message+'</div>'));

            // Old инициализируем пикер
            // $( "#omni_delivery_date_picker_div" ).datepicker({
            //     altField: ".omni_delivery_date_picker_input",
            //     altFormat: "DD, d M",
            //     dateFormat: "yy-mm-dd",
            //     dayNames: [ "Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота" ],
            //     dayNamesShort: [ "Вск.", "Пн.", "Вт.", "Ср.", "Чт.", "Пт.", "Сб." ],
            //     dayNamesMin: [ "Вск.", "Пн.", "Вт.", "Ср.", "Чт.", "Пт.", "Сб." ],
            //     monthNames: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
            //     monthNamesShort: ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"],
            //     firstDay: 1,
            //     changeYear: false,
            //     showOtherMonths: true,
            //     selectOtherMonths: true,
            //     minDate: 0,
            //     maxDate: "+3w",
            //     //appendText: "(yyyy-mm-dd)",
            //     hideIfNoPrevNext: true,
            //     beforeShowDay: check_date_4_picker,
            //     onSelect: check_selected_date
            // });

            omni_ui_draw = true ; // отметим флаг что нарисовали интерфейс (чтобы не исключить рисование в следующий вызов)
            r = true;
        }
        $("#omni_delivery_interval_select").attr("onchange","omniDatesCheckInterval()");
        get_omni_dates(omni_zone,omni_global_zone,omni_zone_type,omni_shop,omni_date_rules); // получим данные, распарсим и отобразим
        return r ; // вернём результат true если нарисовали и null если не рисовали так как было уже нарисовано (false вернули выше если была ошибка в идентификаторе элемента)
        // Тут показываем скрытый элемент
    }

    // id  используемых элементов
    /*
        $("#omni_delivery_date_picker_div")    //  <div> где будет показан датапикер
        $("#omni_delivery_interval_select")  // <select> где будут показан список интервалов
        $("#omni_delivery_date_picker_input") // <input> куда датапикер пишет дату для пользователя (делаем скрытым)
        $("#omni_delivery_date_input") // <div> где выводим дату для пользователя (записываем туда данные обработчиком при выборе)
        $("#omni_delivery_date_label"> // <div> для лейбла дат доставки
        $("#omni_delivery_interval_label"> // <div> для лейбла интервалов доставки
        // $("#omni_delivery_date") // <input> где сохраняется дата для Omni (записываем туда данные обработчиком при выборе)
        // $("#omni_delivery_interval_from") // <input> куда обработчиком выбора сохраняем начало интервала для Omni (делаем скрытым)
        // $("#omni_delivery_interval_till")// <input> куда обработчиком выбора сохраняем конец интервала для Omni (делаем скрытым)
    */

    // TODO
    /*

        + функции обратного вызова (после загрузки данных и после выбора даты/интервала )
        + поведение при ошибке получения данных - используем для этого коллбёк на load данных из omni + скрываем интервалы и обнуляем результаты с вызовом коллбека выбора (для удобства использования в обработчике)
        + ошибка входных данных - отдаёт false но правильно ли это? - false для обязательного аргумента containerId / остальные проверяем через загрузку данных - но нужно добавть  проверку сущестования элемента
        + результат выполнения (что возвращать) - false если нет containerId или (надо добавить) не найден по id
        поведение при ошибке инициацмм пикера / jquery
        + опции запуска вместо аргрментов
        + опции для надписей

        / показ без пикера (select) + хранение и получение опций
        / публичные функции переписать на функциональные выражения
        / добавить картинку-лоадер и не показывать интерфейс пока не загрузилось

    */

    // вспомогательная переменные
    var version = '1.0'; // версия либы
    var omni_container = "" ; //  id элемента, в котором рисуется интерфейс
    var on_select_callback = undefined ;
    var on_load_callback = undefined ;
    var omni_zone = ""; // зона доставки
    var omni_shop = ""; // зона доставки
    var omni_dev_cluster = false; // кластер для подключения
    var omni_ui_draw = false; // флаг отрисован ли интерфейс
    var omni_data_load = false; // флаг загрузились ли данные
    var omni_intervals={}; // самый главный ассоциативный массив, в котором для дат омни хранятся интервалы
    var omni_rezult = {  // результаты выбора
        user_delivery_date: null, // дата в формате для пользователя
        user_delivery_interval: null, // интервал в формате для пользователя
        omni_delivery_provider: {}, // внешний код службы доставки
        omni_delivery_rate: {}, // внешний код тарифа на доставку
        omni_delivery_date: null, // дата в формате для передаче в Omni
        omni_delivery_interval:  { // границы интервала в формате для передаче в Omni
            from: null,
            till: null
        }
    };
    omni_delivery_date_label =  "Дата доставки" ;
    omni_delivery_interval_label =  "Интервал" ;
    omni_no_date_message =  "Нет доступных дат" ;
    // omni_delivery_final_message= "";

    // вспомогательные функции
    function get_omni_dates(zone,global_zone,zone_type,shop,omni_date_rules) {  // получаем данные из Omni
        var omni_request = { // запрос к Omni
            // city: "",
            products: null
         } ;
        //omni_request.city=$geoData[2];
        //omni_request.products=getCart(); // берём корзину
        //omni_request.products=ORDER.order_lines;
        var nnn = [{"id":null,"order_id":null,"variant_id":175167512,"title":"Уличный очаг Firecup Игра престолов","sku":"61014","created_at":null,"updated_at":null,"weight":null,"product_id":102129177,"comment":"","sale_price":150000,"quantity":1},{"id":null,"order_id":null,"variant_id":175167735,"title":"Гриль-камадо угольный Broil King KEG 5000","sku":"32506","created_at":null,"updated_at":null,"weight":null,"product_id":102129383,"comment":"","sale_price":119900,"quantity":1}];
        //omni_request.products = nnn;
        $.get('/cart_items.json').done(function (data) {
          omni_request.products = data.order_lines;

          $.ajax({  // отправим запрос к прослойке Omni
                type: 'post',
                 url: 'https://is'+ (omni_dev_cluster ?'-dev' : '') + '.omnicrm.ru/insales-proxy/get_omni_dates/'+shop+'/?location='+zone,
                 cache: false,
                 dataType: 'json',
                 data: JSON.stringify(omni_request),
                 success: function(data){
                   	// Манипуляция с датами доставки, если включена надствойка
                   	   var lastDate = '';
                   	   var zone_intervals = [];
                   	   if(omni_date_rules[global_zone]){
                           data.result.courierOffers[0].dates.forEach(function(item, index){
                              omni_date_rules[global_zone].forEach(function(settingsItem){
                                if(settingsItem.intervals[zone_type]) {
                                  if(settingsItem.intervals[zone_type].length > 0) {
                                     zone_intervals = settingsItem.intervals[zone_type];
                                  }else{
                                     zone_intervals = [];
                                  }
                                }else{
                                   zone_intervals = [];
                                }
                                if(settingsItem.date == item.date) {
                                  data.result.courierOffers[0].dates[index].date = settingsItem.date;
                                  data.result.courierOffers[0].dates[index].intervals = zone_intervals;
                                }
                              });
                              lastDate = item.date;
                           })

                           var lastDateInt = lastDate.replace(/-/gi, '')*1;
                         
                           var settingDateInt;

                           omni_date_rules[global_zone].forEach(function(settingsItem){
                             if(settingsItem.intervals[zone_type]) {
                               if(settingsItem.intervals[zone_type].length > 0) {
                                  zone_intervals = settingsItem.intervals[zone_type];
                               }else{
                                  zone_intervals = [];
                               }
                             }else{
                             	zone_intervals = [];
                             }

                             settingDateInt = settingsItem.date.replace(/-/gi, '')*1;
                             if(settingDateInt > lastDateInt) {
                                data.result.courierOffers[0].dates.push({
                                	"date": settingsItem.date,
                                  	"intervals": zone_intervals
                                });
                             }
                           });
                       }
                   	   console.log('new_date_intervals',data.result.courierOffers[0].dates);
                   		
                   
                     // if(typeof data.rate === 'undefined') {
                     // } else  {
                     // }
                     // omni_dates=JSON.parse(data);
                     parse_omni_response(data); // делаем парсинг
                     omni_data_load = true ; // сохраним флаг
                     if ( on_load_callback === undefined ) { } else { on_load_callback( omni_data_load) ; } // вызовем если есть колбек функцию
                 },
                 error: function(data){
                     console.log('get_omni_dates error');
                     console.log(data);
                   
                     omni_intervals={};  // обнулим массив интервалов
                     $( "#omni_delivery_date_picker_div" ).datepicker( "refresh" ); // обновим пикер
                     omni_rezult = {  // обнулим результаты
                        user_delivery_date: null, // дата в формате для пользователя
                        user_delivery_interval: null, // интервал в формате для пользователя
                        omni_delivery_date: null, // дата в формате для передаче в Omni
                        omni_delivery_interval:  { // границы интервала в формате для передаче в Omni
                            from: null,
                            till: null
                        }
                    };
                    $("#omni_delivery_interval_select").empty(); // очистим интервалы
                    $(".omni_delivery_date_input").text(omni_no_date_message); // покажем сообщение покупателю
                    $("#omni_delivery_interval_select").hide(); // скроем интервалы
                    $("#omni_delivery_interval_label").hide(); // скроем интервалы
                    omni_data_load = false ; // сохраним флаг
                    if ( on_load_callback === undefined ) { } else { on_load_callback( omni_data_load) ; } // вызовем если есть колбек функцию
                }
           });
         });
    }
    function parse_omni_response(omni_response) { // разбор полученных данных от Omni и отображение/обновление пикера

        omni_intervals={};  // почистим массив дат и интервалов
        omni_rezult.omni_delivery_rate.id = omni_response.result.courierOffers[0].courierRateId; //
        omni_response.included.forEach(function(item) { // ищем в доп данных внешний код тарифа и код службы доставки
           if( (item.type == "courier-rate" ) && (item.data.id == omni_rezult.omni_delivery_rate.id ) ) {
               omni_rezult.omni_delivery_rate.externalId = item.data.externalId;
               omni_rezult.omni_delivery_rate.name = item.data.name;
               omni_rezult.omni_delivery_provider.id = item.data.providerId;
           }
        });
        omni_response.included.forEach(function(item) { // ищем в доп данных внешний код тарифа и код службы доставки
           if( (item.type == "provider" ) && (item.data.id == omni_rezult.omni_delivery_provider.id ) ) {
               omni_rezult.omni_delivery_provider.externalId = item.data.externalId;
               omni_rezult.omni_delivery_provider.name = item.data.name;
           }
        });

      	if(omni_response.result.courierOffers[0].dates.length == 0){
        	return false;
        }
        var omniDate = new Date(omni_response.result.courierOffers[0].dates[0].date);
        var omniDate2 = omni_response.result.courierOffers[0].dates[0].date;

        $('.omni_delivery_date_select').empty();
		var itemsCount = 0;
        omni_response.result.courierOffers[0].dates.forEach(function(item) { // заполним ассоциативный массив дат и интервалов (ключ дата в формате Omni)
            omni_intervals[item.date] = item.intervals;
          	if(omni_intervals[item.date].length > 0 && itemsCount < 7){
            	$('.omni_delivery_date_select').append($('<option class="omni_delivery_date_picker" value="'+item.date+'">'+moment(item.date).locale('ru').format('dddd, D MMMM')+'</option>')); // Заполняем селект датами из массива
              	itemsCount++;
            }
        });


        $(".omni_delivery_date_select [value='"+omniDate2+"']").attr("selected", "selected"); // Selected для первой доступной даты
        omni_rezult.user_delivery_date=$('.omni_delivery_date_select').find(':selected').text(); // Дата для пользователя
        check_selected_date($('.omni_delivery_date_select').val()); // Сохраним для первой отрисовки

      	// Кастомный select для даты, псевдоселект
          if($('.omni_delivery_date_select').hasClass('select2-hidden-accessible')){
              $('.omni_delivery_date_select').select2("destroy");
          }else{
              $('.omni_delivery_date_select').on('select2:select', function (e) {
                select_selected_dates(e); // Обновление данных через селект ИНТЕРВАЛОВ
              });
          }

          $('.omni_delivery_date_select').select2({
              minimumResultsForSearch: -1
          });
    }
    function select_selected_dates(ui) { // Связываем селект и псевдоселект даты
      console.log(ui.params.data.id);
      $('.omni_delivery_date_picker').removeAttr('selected');
      let thisSelectedDate = $(".omni_delivery_date_select [value='"+ui.params.data.id+"']");
      thisSelectedDate.attr("selected", "selected");
      omni_rezult.omni_delivery_date=thisSelectedDate.val(); // Дата для омни
      omni_rezult.user_delivery_date=thisSelectedDate.text(); // Дата для пользователя
      check_selected_date(thisSelectedDate.val());
    }
    // function check_date_4_picker(date) {  // Old проверяет для пикера доступность конкретной даты
    //     var r=[true];
    //     var omni_format_date=date.getFullYear() +'-'+ (date.getMonth()+1 < 10 ? '0' : '') + (date.getMonth()+1)   + '-' + (date.getDate() < 10 ? '0' : '') + date.getDate();
    //     //console.log(omni_date);
    //     if (omni_intervals[omni_format_date] === undefined) {
    //         r[0]=false;
    //         r[1]=true;
    //         r[2]="Нет доставки на эту дату";
    //     }
    //     return r;
    // };
    function check_selected_date(dateText) { // обработчик выбора даты - рисует интервалы //dateText, inst
        omni_rezult.omni_delivery_date=dateText; // сохраним дату для Omni
        // console.log(omni_rezult.omni_delivery_date);
        // omni_rezult.user_delivery_date=$("#omni_delivery_date_picker_input").val(); // сохраним дату для Пользователя
        // console.log(omni_rezult.user_delivery_date);
        //$("#omni_delivery_date").val(omni_rezult.omni_delivery_date); // сохраним дату в поле
        $(".omni_delivery_date_input").text(omni_rezult.user_delivery_date); //покажем пользователю что он выбрал
        $("#omni_delivery_interval_select").empty(); // очистим интервалы
        if(omni_intervals[dateText] === undefined) { // поищем инеравалы для даты
            console.log("undefined date");
            omni_rezult.omni_delivery_interval.from=null; // обнулим интервалы
            omni_rezult.omni_delivery_interval.till=null;
            $("#omni_delivery_interval_label").hide(); // скроем интервалы
            $("#omni_delivery_interval_select").hide(); //
            if ( on_select_callback === undefined ) { } else { on_select_callback(omni_rezult); }
        } else {
            // заполним список и в дата-атрибутах  элементов сохраним границы интервалов для Omni
            if( omni_intervals[dateText].length < 1 )
            {
                console.log("no interval for date");
                omni_rezult.omni_delivery_interval.from=null; // обнулим интервалы
                omni_rezult.omni_delivery_interval.till=null;
                $("#omni_delivery_interval_label").hide(); // скроем интервалы заголовок
                // $("#omni_delivery_interval_select").hide(); // Old скроем интервалы
                $('#omni_delivery_interval_select-button').hide(); // скроем интервалы псевдоселект
                if ( on_select_callback === undefined ) { } else { on_select_callback(omni_rezult); }
            } else {
                omni_intervals[dateText].forEach(function(item) {
                    //console.log(item);
                    $("#omni_delivery_interval_select").append( $('<option class="omni_delivery_interval_picker" value="'+item.from+'-'+item.till+'" data-from="'+item.from+'" data-till="'+item.till+'" >'+item.from.slice(0,-3)+'-'+item.till.slice(0,-3)+'</option>'));
                    // $("#delivery_interval2").append( $('<p><input type="radio" name="delivery_interval"  value="'+item.from+'-'+item.till+'" data-from="'+item.from.slice(0,-3)+'" data-till="'+item.till.slice(0,-3)+'"> с'+item.from.slice(0,-3)+' до '+item.till.slice(0,-3)+'</option></p>'));
                });
                $("#omni_delivery_interval_select option:first").attr("selected", "selected"); // Selected для первой доступной даты

                // Кастомный select для интервалов, псевдоселект
                  if($('#omni_delivery_interval_select').hasClass('select2-hidden-accessible')){
                      $('#omni_delivery_interval_select').select2("destroy");
                  }else{
                      $('#omni_delivery_interval_select').on('select2:select', function (e) {
                        select_selected_intervals(e); // Обновление данных через селект ИНТЕРВАЛОВ
                      });
                  }
                  $('#omni_delivery_interval_select').select2({
                      minimumResultsForSearch: -1,
                  });
                
                $("#omni_delivery_interval_label").show(); // покажем интервалы заголовок
                // $("#omni_delivery_interval_select").show(); // Old покажем интервалы
                $('#omni_delivery_interval_select-button').show(); // скроем интервалы псевдоселект
                check_interval(); // Обновление данных через селект ДАТЫ. Обновим поля для границ интервалов так как при создании обработчик выбора не отрабатывает
            }
        }
    }
    function select_selected_intervals(ui) { // Связываем селект и псевдоселект интервалов
      $('.omni_delivery_interval_picker').removeAttr('selected');
      let thisSelectedInter = $("#omni_delivery_interval_select [value='"+ui.params.data.id+"']");
      thisSelectedInter.attr("selected", "selected");
    }
    function check_interval() { // обработчик выбора интервала - сохраняем границы интервала
        omni_rezult.omni_delivery_interval.from=$("#omni_delivery_interval_select option:selected").attr("data-from"); // сохраним начало интервала для Omni
        omni_rezult.omni_delivery_interval.till=$("#omni_delivery_interval_select option:selected").attr("data-till"); // сохраним конец интервала для Omni
        //$("#omni_delivery_interval_from").val();
        //$("#omni_delivery_interval_till").val();
        if ( on_select_callback === undefined ) { } else { on_select_callback(omni_rezult); }
    }

    // публичные функции
    // !!! переписать на функциональные выражения
    function size(collection) {
        return Object.keys(collection).length;
    }
    function getVersion() { // получить версию
        return version;
    }
    function getData() { // получить данные (обёект типа omni_rezult)
        return omni_rezult;
    }
    // function changeDates(zone,shop) { // изменить (обновить) список дат (агрументы опциональные - если не переданы берёт сохранённые при создании)
    //    return omni_date(zone,shop);
    //}

    // присвоим свойствам omni_date функции, которые нужно вынести из модуля (сделать их публичными)
    omni_date.getData = getData;
    omni_date.getVersion = getVersion;
    //omni_date.changeDates = changeDates;

    // "экспортировать" omni_date наружу из модуля
    window.omniDates = omni_date; // в оригинальном коде lodash  сложнее, но смысл тот же
    window.omniDatesCheckInterval = check_interval;

    }());
