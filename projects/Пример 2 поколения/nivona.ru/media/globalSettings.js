  // Глобальные настройки для витрины
  	var globalSettings = {
      	omniDates: {
          	omniShop: "nivona-calc",
            saved_address: {
                save: false,
                street: "",
                house: "",
                building: "",
                structure: "",
                flat: ""  
            },
            omni_fields_id: { // id дополнительных полей в InSales куда сохраняем данные
                delivery_date: "10813248",
                delivery_interval_from: "10813249",
                delivery_interval_till: "10813250",
                delivery_rate: "10813266",

                building: "10813299",
                structure: "10813314" 
            },
            delivery_id_map: { // таблица соответствия вариантов доставки зонам
                "2043474": ["msk1", "msk", "zone1"],
                "2043475": ["spb1", "spb", "zone1"],
                "2043476": ["msk2", "msk", "zone2"],
                "2043477": ["msk3", "msk", "zone2"],
                "2043482": ["spb2", "spb", "zone2"],
                "2043483": ["spb3", "spb", "zone2"],
                "2087692": ["yado", "", ""], // Курьер
                "2087693": ["yado", "", ""], // ПВЗ
                "2694008": ["yado", "", ""], // Курьер
                "2694015": ["yado", "", ""], // ПВЗ
                "2733447": ["yado", "", ""], // Курьер
                "2733448": ["yado", "", ""], // ПВЗ
                "2065362": ["strizh_pvz_msk", "msk_pvz", "zone1"],
                "2065363": ["strizh_pvz_spb", "spb_pvz", "zone1"],
                "2144703": ["strizh_pvz_msk", "msk_pvz", "zone1"],
                "2178579": ["strizh_pvz_msk", "msk_pvz", "zone1"],
                "2178948": ["strizh_pvz_msk", "msk_pvz", "zone1"],
            },
            delivery_id_hidden: [ // список id вариантов где виджет не надо показывать пользователю (чтобы просто посчтиталась ближайшая дата)
                2087693,2087692,2178579,2178948,2694008,2694015,2733447,2733448 // прописываем тут id для ЯДо
            ],
            delivery_address_hidden: [
                2065362, 2065363 , 2087693, 2144703, 2733448, 8445128, 3262740, 3262738, 2807915// прописываем тут ПВЗ
            ],
            pvz_delivery_address: {
                "strizh_pvz_msk": {
                    street: "Огородный проезд",
                    house: "20",
                    building: "3",
                    structure: "",
                    flat: ""
                },
                "strizh_pvz_spb": {
                    street: "Южное шоссе",
                    house: "37",
                    building: "",
                    structure: "корпус 1В",
                    flat: ""
                },
                "yado": {
                    street: "",
                    house: "",
                    building: "",
                    structure: "",
                    flat: ""
                }
            },
            // Правила для праздничных дат. Данная надствройка имеет больший приоритет, чем приходящие данные от Omni
          	// intervals.zone1 - интервалы за рамками мкад/пкад
          	// intervals.zone2 - интервалы за рамками мкад/пкад
            delivery_date_rules: {
              msk: [
                 {
                    "date": "2020-12-29",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-31",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-01", 
                    "intervals": []
                 },
                 {
                    "date": "2021-01-02",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-03",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-04",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-05",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-06",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-07",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-08",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-09",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-10",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-11",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-12",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
                 {
                    "date": "2021-01-13",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 }
             ],
             spb: [
                 {
                    "date": "2020-12-28",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-29",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-31",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-01", 
                    "intervals": []
                 },
                 {
                    "date": "2021-01-02",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-03",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-04",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-05",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-06",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-07",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-08",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-09",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-10",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-11",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-12",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-13",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
                 {
                    "date": "2021-01-14",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 }
             ],
             msk_pvz: [
                 {
                    "date": "2020-12-29",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-31",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-01", 
                    "intervals": []
                 },
                 {
                    "date": "2021-01-02",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-03",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-04",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-05",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-06",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-07",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-08",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-09",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-10",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-11",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-12",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
                 {
                    "date": "2021-01-13",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
                 {
                    "date": "2021-01-14",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
             ],
             spb_pvz: [
                 {
                    "date": "2020-12-29",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-31",
                    "intervals": []
                 },
                 {
                    "date": "2020-12-30",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-01", 
                    "intervals": []
                 },
                 {
                    "date": "2021-01-02",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-03",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-04",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-05",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-06",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-07",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-08",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-09",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-10",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-11",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-12",
                    "intervals": []
                 },
                 {
                    "date": "2021-01-13",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
                 {
                    "date": "2021-01-14",
                   	"intervals": {
                      "zone1": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ],
                      "zone2": [
                          {"from": "10:00:00", "till": "22:00:00"}
                      ]
                    }
                 },
             ]
           }
        }
    }
;
