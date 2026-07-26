(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict'
/*eslint-env browser */

module.exports = {
  /**
   * Create a <style>...</style> tag and add it to the document head
   * @param {string} cssText
   * @param {object?} options
   * @return {Element}
   */
  createStyle: function (cssText, options) {
    var container = document.head || document.getElementsByTagName('head')[0]
    var style = document.createElement('style')
    options = options || {}
    style.type = 'text/css'
    if (options.href) {
      style.setAttribute('data-href', options.href)
    }
    if (style.sheet) { // for jsdom and IE9+
      style.innerHTML = cssText
      style.sheet.cssText = cssText
    }
    else if (style.styleSheet) { // for IE8 and below
      style.styleSheet.cssText = cssText
    }
    else { // for Chrome, Firefox, and Safari
      style.appendChild(document.createTextNode(cssText))
    }
    if (options.prepend) {
      container.insertBefore(style, container.childNodes[0]);
    } else {
      container.appendChild(style);
    }
    return style
  }
}

},{}],2:[function(require,module,exports){
(function (window) {
  var InSalesUI = _.get(window, 'InSalesUI', {});
  var _supportObjectFit = false;

  require('styles/styles.scss');

  InSalesUI.Images = {
    checkCover: function () {
      if ('object-fit' in document.body.style) {
        _supportObjectFit = true;
      }

      if (_supportObjectFit) {
        return;
      }

      $('.image-container.is-cover').each(function () {
        var $container = $(this);
        var imgUrl = $container.find('img').prop('src');

        if (imgUrl) {
          $container
            .css('backgroundImage', 'url(' + imgUrl + ')')
            .addClass('with-trick');
        }
      });
    }
  }

  $(function () {
    InSalesUI.Images.checkCover();
  });

  window.InSalesUI = InSalesUI;
})(window);
},{"styles/styles.scss":3}],3:[function(require,module,exports){
module.exports.tag = require('scssify').createStyle(".image-container.is-rectangle, .image-container.is-square, .image-container.is-rectangle-widget-blogs, .image-container.is-rounded {\n  height: 0;\n  padding-top: 130%;\n  position: relative; }\n  .image-container.is-rectangle img, .image-container.is-square img, .image-container.is-rectangle-widget-blogs img, .image-container.is-rounded img {\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translate(-50%, -50%);\n    transform: translate(-50%, -50%);\n    max-height: 100%;\n    max-width: 100%; }\n    @supports (image-rendering: crisp-edges) {\n      .image-container.is-rectangle img, .image-container.is-square img, .image-container.is-rectangle-widget-blogs img, .image-container.is-rounded img {\n        image-rendering: -webkit-optimize-contrast;\n        image-rendering: -o-crisp-edges;\n        image-rendering: -moz-crisp-edges;\n        image-rendering: crisp-edges; } }\n\n.image-container {\n  display: inline-block;\n  width: 100%;\n  text-align: center; }\n  .image-container.is-square {\n    padding-top: 100%; }\n  .image-container.is-rectangle-widget-blogs {\n    padding-top: 68%; }\n  .image-container.is-rounded {\n    overflow: hidden;\n    border-radius: 50%; }\n  .image-container.is-cover {\n    overflow: hidden; }\n    .image-container.is-cover img {\n      height: 100%;\n      max-width: none;\n      max-height: none; }\n      @supports ((-o-object-fit: cover) or (object-fit: cover)) {\n        .image-container.is-cover img {\n          -o-object-fit: cover;\n             object-fit: cover;\n          width: 100%; } }\n    .image-container.is-cover.with-trick {\n      background-repeat: no-repeat;\n      background-size: cover;\n      background-position: center; }\n      .image-container.is-cover.with-trick img {\n        display: none; }\n\n/*# sourceMappingURL=to.css.map */", {"href":false,"prepend":true});
},{"scssify":1}]},{},[2]);
