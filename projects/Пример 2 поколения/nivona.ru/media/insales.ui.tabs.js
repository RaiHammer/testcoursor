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
var Tab = require('tab');

var Factory = function () {
  var self = this;

  self.initTab();

  return self;
};

Factory.prototype.create = function ($node) {
  var _tab = null;

  _tab = new Tab($node);

  return _tab;
};

Factory.prototype.initTab = function () {
  var self = this;

  $(function () {
    $('.tab').each(function () {
      self.create($(this));
    });
  });

  return;
};

module.exports = Factory;
},{"tab":6}],3:[function(require,module,exports){
var TOP_PANEL_OFFSET = -60;

module.exports = function (node) {
  if (window.matchMedia('(max-width: 768px)').matches) {
    $(node).trigger('scroll_to:insales', {
      scrollTo: $(node).offset().top + TOP_PANEL_OFFSET
    });
  }

  return;
};
},{}],4:[function(require,module,exports){
(function (jquery, window) {
  var InSalesUI = _.get(window, 'InSalesUI', {});

  require('styles/style.scss');

  InSalesUI.Tab = new (require('factory'))();

  window.InSalesUI = InSalesUI;
})(jQuery, window);
},{"factory":2,"styles/style.scss":5}],5:[function(require,module,exports){
module.exports.tag = require('scssify').createStyle(".tab {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  position: relative; }\n\n.tab-toggle {\n  display: block;\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 100%;\n          flex: 0 0 100%;\n  background-color: transparent;\n  border: none;\n  cursor: pointer; }\n  .tab-toggle:focus {\n    outline: none; }\n  @media (min-width: 769px) {\n    .tab-toggle {\n      -webkit-box-ordinal-group: 0;\n          -ms-flex-order: -1;\n              order: -1;\n      -webkit-box-flex: 0;\n          -ms-flex: 0 0 auto;\n              flex: 0 0 auto; } }\n\n.tab-block {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%; }\n  .tab-block.is-closed {\n    display: none; }\n  @media (min-width: 769px) {\n    .tab-block {\n      -webkit-box-ordinal-group: 11;\n          -ms-flex-order: 10;\n              order: 10; } }\n\n/*# sourceMappingURL=to.css.map */", {"href":false,"prepend":true});
},{"scssify":1}],6:[function(require,module,exports){
var Toggle = require('./toggle');

var Tab = function ($node) {
  var self = this;

  self.node = _.get($node, '[0]');
  self.$node = $node;

  self.togglers = [];
  self.currentOpened = 0;

  self.initToggles();

  if (self.togglers.length) {
    self.initActive();
  }

  self.node.Tab = self;

  self.bindEvents();

  return self;
};

Tab.prototype.initToggles = function () {
  var self = this;

  self.$node.find('[data-toggle="tabs"]')
    .each(function (index) {
      self.togglers.push(new Toggle(this, index));
    });

  return;
};

Tab.prototype.switchTo = function (toggle) {
  var self = this;
  var _index = _.get(toggle, 'Toggle.index');

  if (_.isNil(_index)) {
    return;
  }
  self.togglers[self.currentOpened].close();
  self.togglers[_index].open();
  self.currentOpened = _index;

  return;
};

Tab.prototype.bindEvents = function () {
  var self = this;

  self.$node.on('switch:tab', function (event) {
    event.stopPropagation();

    self.switchTo(event.target);
  });

  return;
};

Tab.prototype.initActive = function () {
  var self = this;
  var _first = {};

  _first = _.chain(self.togglers)
    .forEach(function (toggle) {
      toggle.close();
    })
    .filter({ activeOnInit: true })
    .value();

  _first = _.head(_first) || _.head(self.togglers);
  _first.open();

  self.currentOpened = _first.index;

  return;
};

module.exports = Tab;
},{"./toggle":7}],7:[function(require,module,exports){
var needScroll = require('helpers/need-scroll');

var Toggle = function (node, index) {
  var self = this;

  self.node = node;
  self.$node = $(node);
  self.$target = $(self.$node.data('target'));

  self.index = index;
  self.activeOnInit = self.getInitState();

  node.Toggle = self;

  self.bindEvents();

  return self;
};

Toggle.prototype.open = function () {
  var self = this;

  self.$node
    .removeClass('is-closed')
    .addClass('is-active is-opened');

  self.$target
    .removeClass('is-closed')
    .addClass('is-active is-opened');

  return;
};

Toggle.prototype.close = function () {
  var self = this;

  self.$node
    .removeClass('is-active is-opened')
    .addClass('is-closed');

  self.$target
    .removeClass('is-active is-opened')
    .addClass('is-closed');

  return;
};

Toggle.prototype.bindEvents = function () {
  var self = this;

  self.$node.on('click', function (event) {
    event.preventDefault();

    self.$node.trigger('switch:tab');
    needScroll(self.node);
  });

  return;
};

Toggle.prototype.getInitState = function () {
  var self = this;
  var _state = self.$node.hasClass('is-active');

  return _state;
};

module.exports = Toggle;
},{"helpers/need-scroll":3}]},{},[4]);
