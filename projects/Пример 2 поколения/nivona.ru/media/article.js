(function () {
  if (Site.template == 'article') {

    new Swiper ('[data-slider="article-related-products"]', {
      slidesPerView: 4,
      spaceBetween: 24,

      breakpoints: {
        380: {
          slidesPerView: 1,
        },
        480: {
          slidesPerView: 2
        },
        640: {
          slidesPerView: 3
        },
        1024: {
          slidesPerView: 3
        }
      }
    });

};

})();
