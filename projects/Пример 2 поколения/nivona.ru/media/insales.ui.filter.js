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
var Filter = require('filter');
var selectors = require('selectors');

var Factory = function (filterConfig) {
  var self = this;

  self.config = filterConfig;

  self.initFilters();

  return self;
};

Factory.prototype.create = function ($node) {
  var self = this;
  var _node = self.getNode($node);
  var _name = _node.data('filter');
  var _config = self.config[_name];
  var _form = null;

  _form = new Filter({
    $node: _node,
    config: _config
  });

  return _form;
};

Factory.prototype.get = function ($node) {
  var self = this;
  var _node = self.getNode($node);
  var _form = null;

  _form = _.get(_node, 'Filter', self.initFilter(_node));

  return _form;
};

Factory.prototype.getNode = function ($node) {
  var _node = $node;

  if (!_node.is(selectors.filter)) {
    _node = _node.find(selectors.filter);
  }

  return _node;
};

Factory.prototype.initFilters = function () {
  var self = this;

  $(selectors.filter).each(function () {
    self.create($(this));
  });

  return;
};

module.exports = Factory;
},{"filter":3,"selectors":8}],3:[function(require,module,exports){
var selectors = require('selectors');
var button = require('helpers/button');
var Section = require('./section');

var Filter = function (options) {
  var self = this;

  self.node = _.head(options.$node);
  self.$node = options.$node;

  self.options = options.config;

  self.$submit = self.$node.find(selectors.submit);
  self.$clear = self.$node.find(selectors.clear);
  self.$sections = self.$node.find(selectors.section);

  self.sections = self.initSections();

  self.state = {};
  self.checkState();
  self.bindEvents();

  return self;
};

Filter.prototype.send = function () {
  var self = this;

  self.node.submit();

  return;
};

Filter.prototype.clear = function () {
  var self = this;

  _.chain(self.sections)
    .forEach(function (section) {
      section.clear();
    })
    .value();

  self.node.submit();

  return;
};

Filter.prototype.bindEvents = function () {
  var self = this;

  self.$submit.on('click', function (event) {
    event.preventDefault();

    self.send();
  });
  self.$clear.on('click', function () {
    self.clear();
  });
  self.$node.on('change', function () {
    self.checkState();
    
    if (self.options.submitOnChange) {
      setTimeout(function() { self.send(); }, 0)
    }
    
  });

  return;
};

Filter.prototype.initSections = function () {
  var self = this;
  var _sections = [];

  self.$sections.each(function () {
    _sections.push(new Section({
      $node: $(this),
      options: self.options
    }));
  });

  return _sections;
};

Filter.prototype.setClasses = function () {
  var self = this;

  if (self.state.active) {
    button.enable(self.$clear);
  }
  else {
    button.disable(self.$clear);
  }

  if (self.state.hide) {
    //self.$node.addClass('is-hidden');
  }

  return;
};

Filter.prototype.checkState = function () {
  var self = this;
  var _sectionsActive = false;
  var _sectionsHide = false;

  _sectionsActive = _.chain(self.sections)
    .reduce(function (isActive, section) {
      var _state = section.getState();

      return isActive || _state.active;
    }, false)
    .value();
  _sectionsHide = _.chain(self.sections)
    .reduce(function (isHide, section) {
      var _state = section.getState();

      return (isHide && _state.hide);
    }, true)
    .value();

  self.setState('active', _sectionsActive);
  self.setState('hide', _sectionsHide);

  return;
};

Filter.prototype.setState = function (stateName, stateValue) {
  var self = this;

  self.state[stateName] = stateValue;

  self.setClasses();

  return;
};

module.exports = Filter;
},{"./section":5,"helpers/button":6,"selectors":8}],4:[function(require,module,exports){
var selectors = require('selectors');

var Item = function (node) {
  var self = this;

  self.node = _.head(node);
  self.$node = node;

  self.$input = null;
  self.rangeSlider = null;
  self.bindEvents();
  self.type = self.getType();

  self.getElements();
  self.state = {};
  if (self.type == 'checkbox') {
    self.setState('active', self.$input.prop('checked'));
  }
  else {
    self.setState('active', false);
  }

  return self;
};

Item.prototype.getElements = function () {
  var self = this;

  self.$marker = self.$node.find(selectors.items.marker);

  return;
};

Item.prototype.setState = function (stateName, stateValue) {
  var self = this;

  self.state[stateName] = stateValue;
  self.setClasses(stateName, stateValue);

  return;
};

Item.prototype.getState = function () {
  var self = this;

  return self.state;
};

Item.prototype.clear = function () {
  var self = this;

  if (self.type == 'checkbox') {
    self.$input.prop('checked', false);
  }
  else {
    self.$input.clear();
  }
  self.setState('active', false);

  return;
};

Item.prototype.change = function (eventData) {
  var self = this;

  if (self.type == 'checkbox') {
    self.setState('active', self.$input.prop('checked'));
  }
  else if (eventData) {
    self.setState('active', !eventData.disabled);
  }

  return;
};

Item.prototype.bindEvents = function () {
  var self = this;

  self.$node
    .on('change', function (event, eventData) {
      self.change(eventData);
    })
    .on('inited:slider', function (event) {
      self.$input = _.get(event, 'target.rangeSlider', {});
    });

  return;
};

Item.prototype.getType = function () {
  var self = this;
  var _type = 'checkbox';
  var _slider = self.$node.find(selectors.slider);

  if (_slider.length) {
    _type = 'slider';
    self.$node.trigger('init:range:filter');
  }
  else {
    self.$input = self.$node.find(selectors.checkbox);
  }

  return _type;
};

Item.prototype.getSlider = function () {
  var self = this;
  var _slider = self.$node.find(selectors.slider);

  self.$input = _.get(_slider, '[0].rangeSlider');

  return;
};

Item.prototype.setClasses = function (stateName, stateValue) {
  var self = this;
  var _className = 'is-' + stateName;

  if (stateValue) {
    self.$node.addClass(_className);
    self.$marker.addClass(_className);
  }
  else {
    self.$node.removeClass(_className);
    self.$marker.removeClass(_className);
  }

  return;
};

module.exports = Item;
},{"selectors":8}],5:[function(require,module,exports){
var selectors = require('selectors');
var button = require('helpers/button');
var Item = require('./item');

var Section = function (options) {
  var self = this;
  var _initState = {};

  self.node = _.head(options.$node);
  self.$node = options.$node;

  _initState = self.$node.data();
  self.options = options.options;
  self.state = { hide: false };

  self.getElements();

  self.bindEvents();
  self.items = self.initItems();
  self.state.active = _initState.filterSection;
  self.state.onInit = _initState.filterSection;
  self.state.collapse = self.options.collapse;
  self.state.open = (_initState.filterSection && self.options.openActive);

  self.initClasses();

  return self;
};

Section.prototype.getElements = function () {
  var self = this;

  self.$submit = self.$node.find(selectors.submit);
  self.$clear = self.$node.find(selectors.sections.clear);
  self.$toggle = self.$node.find(selectors.sections.toggle);
  self.$items = self.$node.find(selectors.items.item);
  self.$container = self.$node.find(selectors.items.wrapper);
  self.$controls = self.$node.find(selectors.sections.controls);

  return;
};

Section.prototype.bindEvents = function () {
  var self = this;

  self.$submit.on('click', function () {
    self.submit();
  });
  self.$clear.on('click', function () {
    self.clear();
  });
  self.$node.on('change', function () {
    self.checkState();
  })
  .on('hide:section:filter', function () {
    self.setState('hide', true);
  });
  self.$toggle.on('click', function () {
    self.toggleCollapse();
  });

  return;
};

Section.prototype.clear = function () {
  var self = this;

  _.chain(self.items)
    .forEach(function (item) {
      item.clear();
    })
    .value();
  self.state.active = false;
  self.setClasses();

  if (self.state.onInit) {
    self.$submit.trigger('click');
  }

  return;
};

Section.prototype.submit = function () {
  return;
};

Section.prototype.initItems = function () {
  var self = this;
  var _items = [];

  self.$items.each(function () {
    _items.push(new Item($(this)));
  });

  return _items;
};

Section.prototype.initClasses = function () {
  var self = this;

  if (self.options.collapse) {
    self.$node.addClass('is-collapse');
    self.$toggle.addClass('button is-active-toggle');
    self.$container.addClass('is-collapsable');

    if (self.options.openActive && self.state.active) {
      self.$container.addClass('is-opened');
      self.$controls.addClass('is-collapse-opened');
      self.$toggle.addClass('is-active');
    }
    else {
      //self.$container.addClass('is-closed');
    }
  }

  self.setClasses();

  return;
};

Section.prototype.setClasses = function () {
  var self = this;

  if (self.state.active) {
    self.$node
      .addClass('has-active-items');
    button.enable(self.$clear);
    button.enable(self.$submit);
  }
  else {
    self.$node
      .removeClass('has-active-items');
    button.disable(self.$clear);
    button.disable(self.$submit);
  }

  if (self.state.hide) {
    //self.$node.addClass('is-hidden');
  }

  return;
};

Section.prototype.toggleCollapse = function () {
  var self = this;

  if (!self.state.collapse) {
    return;
  }

  self.$toggle.toggleClass('is-active');
  self.$container.toggleClass('is-opened is-closed');
  self.$controls.toggleClass('is-collapse-opened');

  return;
};

Section.prototype.checkState = function () {
  var self = this;
  var _itemsState = false;

  _itemsState = _.chain(self.items)
    .reduce(function (active, item) {
      var _state = item.getState();

      return active || _state.active;
    }, false)
    .value();

  self.setState('active', _itemsState);

  return;
};

Section.prototype.setState = function (stateName, stateValue) {
  var self = this;

  self.state[stateName] = stateValue;
  self.setClasses();

  return;
};

Section.prototype.getState = function () {
  var self = this;

  return self.state;
};

module.exports = Section;
},{"./item":4,"helpers/button":6,"selectors":8}],6:[function(require,module,exports){
module.exports = {
  enable: function ($button) {
    $button
      .removeClass('is-disabled')
      .addClass('is-enable')
      .prop('disabled', false);
  },
  disable: function ($button) {
    $button
      .removeClass('is-enable')
      .addClass('is-disabled')
      .prop('disabled', true);
  }
};
},{}],7:[function(require,module,exports){
(function (jquery, window) {
  var InSalesUI = _.get(window, 'InSalesUI', {});
  var _configs = _.get(window, 'Site.filterConfig', {});

  require('styles/style.scss');

  InSalesUI.Filter = new (require('factory'))(_configs);

  jquery(document)
    .on('change', '[name="order"]', function () {
      jquery(this).closest('form')
        .submit();
    })
    .on('change', '[name="page_size"]', function () {
      jquery(this).closest('form')
        .submit();
    });

  window.InSalesUI = InSalesUI;
})(jQuery, window);
},{"factory":2,"styles/style.scss":9}],8:[function(require,module,exports){
module.exports={
  "filter": "[data-filter]",
  "clear": "[data-filter-clear]",
  "submit": "[data-filter-submit]",
  "section": "[data-filter-section]",
  "sections": {
    "clear": "[data-filter-section-clear]",
    "toggle": "[data-filter-section-toggle]",
    "controls": ".filter-section-control"
  },
  "items": {
    "wrapper": "[data-filter-section-items]",
    "item": "[data-filter-section-item]",
    "marker": ".filter-field-marker"
  },
  "slider": "[data-range-slider]",
  "checkbox": "[type='checkbox']"
}

},{}],9:[function(require,module,exports){
module.exports.tag = require('scssify').createStyle(".filter {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap; }\n  .filter.is-hidden {\n    display: none !important; }\n\n.filter-clear:not(.is-enable) {\n  display: none; }\n\n.filter-section {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto; }\n  .filter-section.is-hidden {\n    display: none; }\n\n.filter-section-control {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: nowrap;\n      flex-wrap: nowrap;\n  width: 100%;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none; }\n\n.filter-section-toggle {\n  display: block;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  padding: 0;\n  margin: 0;\n  border: none;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n  background-color: transparent;\n  text-align: left;\n  vertical-align: middle; }\n  .filter-section-toggle:active, .filter-section-toggle:focus, .filter-section-toggle:hover {\n    outline: none; }\n\n.filter-section-clear {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto; }\n  .filter-section-clear:not(.is-enable) {\n    display: none; }\n\n.filter-section-submit {\n  width: 100%; }\n\n.filter-section-toolbar {\n  padding-top: 0.5rem; }\n\n.filter-items-wrapper {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%; }\n  .filter-items-wrapper.is-closed {\n    display: none; }\n\n.filter-items-list {\n  background: -webkit-gradient(linear, left top, left bottom, color-stop(30%, var(--filter-background-color)), to(var(--filter-background-color-transparent))), -webkit-gradient(linear, left top, left bottom, from(var(--filter-background-color-transparent)), color-stop(70%, var(--filter-background-color))) 0 100%, -webkit-gradient(linear, left top, left bottom, from(rgba(0, 0, 0, 0.05)), to(transparent)), -webkit-gradient(linear, left top, left bottom, from(transparent), to(rgba(0, 0, 0, 0.05))) 0 100%;\n  background: linear-gradient(var(--filter-background-color) 30%, var(--filter-background-color-transparent)), linear-gradient(var(--filter-background-color-transparent), var(--filter-background-color) 70%) 0 100%, linear-gradient(rgba(0, 0, 0, 0.05), transparent), linear-gradient(transparent, rgba(0, 0, 0, 0.05)) 0 100%;\n  background-size: 100% 4rem, 100% 4rem, 100% 1rem, 100% 1rem;\n  background-repeat: no-repeat;\n  /* Opera doesn't support this in the shorthand */\n  background-attachment: local, local, scroll, scroll;\n  list-style: none;\n  margin: 0;\n  padding: 0.5rem 0;\n  max-height: 18rem;\n  overflow-y: auto; }\n\n.filter-item {\n  padding: 0.25rem 0; }\n  .filter-item.is-range-slider {\n    padding-top: 2rem; }\n\n.filter-field {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: nowrap;\n      flex-wrap: nowrap;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  position: relative;\n  cursor: pointer;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none; }\n\n.filter-field-input {\n  position: absolute;\n  z-index: -1; }\n\n.filter-field-marker {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 1rem;\n          flex: 0 0 1rem; }\n\n.filter-field-caption {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%; }\n\n/*# sourceMappingURL=to.css.map */", {"href":false,"prepend":true});
},{"scssify":1}]},{},[7]);
$('.show-more.button').click(function(){
	event.preventDefault();
  	$(this).hide();
  	$('.filter__item._hide*').show();
});