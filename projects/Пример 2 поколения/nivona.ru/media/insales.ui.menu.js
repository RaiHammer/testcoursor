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
module.exports={
  "levels": {
    "1": ["horizontal"],
    "default": ["vertical", "drop", "right"]
  }
}

},{}],3:[function(require,module,exports){
var _defaultConfig = require('default-level-config');

var Menu = require('menu');

var Factory = function (menuConfig) {
  var self = this;

  self.configs = menuConfig;
  self.opened = [];
  self.paths = self._getCurrentPaths();

  setTimeout(function () {
    self.initMenu();
  }, 0);

  return self;
};

Factory.prototype.create = function ($root) {
  var self = this;
  var _name = $root.data('menuId');
  var _menu = null;

  _menu = self.createInstance({
    node: $root,
    depth: 1,
    config: _.get(self.configs[_name], 'levels', _defaultConfig)
  });

  return _menu;
};

Factory.prototype.createInstance = function (options) {
  var self = this;
  var _menu = null;

  _menu = new Menu(options);

  return _menu;
};

Factory.prototype.initMenu = function () {
  var self = this;

  $(function () {
    $('[data-menu-id]').each(function () {
      self.create($(this));
    });
  });

  return;
};

Factory.prototype.get = function ($node) {
  var _instance = $node.Menu;

  return _instance;
};

Factory.prototype.addOpenedTouchMenu = function (menuItem) {
  var self = this;
  var _addedParent = menuItem.getParent();
  var _removeIndexes = [];

  _.chain(self.opened)
    .forEachRight(function (item, index) {
      var _parent = item.getParent();
      var _submenu = item.getSubmenu();

      if (!_submenu.is(_addedParent)) {
        _removeIndexes.push(index);
      }
      if (_submenu.is(_addedParent) || _parent.is(_addedParent)) {
        return false;
      }
    })
    .value();

  self.closeTouchMenu(_removeIndexes);

  self.opened.push(menuItem);

  return;
};

Factory.prototype.closeTouchMenu = function (removeIndexes) {
  var self = this;
  var _removeItems = [];

  if (removeIndexes) {
    _removeItems = _.chain(self.opened)
    .reduce(function (result, item, index) {
      if (_.includes(removeIndexes, index)) {
        result.push(item);
      }

      return result;
    }, [])
    .value();
    _.pullAt(self.opened, removeIndexes);
  }
  else {
    _removeItems = self.opened;
    self.opened = [];
  }

  _.chain(_removeItems)
    .forEach(function (item) {
      item.close();
    })
    .value();

  return;
};

Factory.prototype._getPaths = function () {
  var self = this;

  return self.paths;
};

Factory.prototype._getCurrentPaths = function () {
  var self = this;
  var _metaHandle = $('meta[name="handle"]');
  var _paths = {
    collection: _metaHandle.data('currentCollection'),
    article: _metaHandle.data('article')
  };

  return _paths;
};
module.exports = Factory;
},{"default-level-config":2,"menu":5}],4:[function(require,module,exports){
(function (window) {
  var InSalesUI = _.get(window, 'InSalesUI', {});
  var menus = new (require('factory'))(window.Site.menuConfig);

  require('styles/style.scss');

  InSalesUI.Menu = menus;
  window.InSalesUI = InSalesUI;

  $(document).on('touchstart', function (event) {
    if (event.target.closest('.menu-item')) {
      return;
    }

    menus.closeTouchMenu();
  });
})(window);
},{"factory":3,"styles/style.scss":8}],5:[function(require,module,exports){
var _settings = require('settings');

var Item = require('./item');

var Menu = function (options) {
  var self = this;

  self.node = options.node;
  self.$node = options.node;

  self.config = options.config;

  self.level = {
    depth: options.depth,
    config: self.getLevelConfig(options)
  };

  self.state = {
    active: false,
    current: false,
    child: false,
    drop: false,
    hovered: false,
  };

  self.node.Menu = self;

  self.getElements();
  self.setClasses('level-' + self.level.depth);
  self.initState();

  self.$node.addClass('insales-menu--loaded');

  self.bindEvents();
  self.items = self.initItems();

  return self;
};

Menu.prototype.getElements = function () {
  var self = this;

  self.$items = self.$node.children('.menu-item');

  return;
};

Menu.prototype.setClasses = function (className) {
  var self = this;

  self.$node.addClass(className);

  return;
};

Menu.prototype.removeClasses = function (className) {
  var self = this;

  self.$node.removeClass(className);

  return;
};

Menu.prototype.initItems = function () {
  var self = this;
  var _items = [];

  _items = _.chain(self.$items)
    .reduce(function (result, item) {
      result.push(new Item($(item), {
        config: _.cloneDeep(self.config),
        depth: self.level.depth,
      }));

      return result;
    }, [])
    .value();

  return _items;
};

Menu.prototype.getLevelConfig = function (options) {
  var self = this;
  var _config = {};

  _config = self.config[options.depth] || self.config.default;

  return _config;
};

Menu.prototype.initState = function () {
  var self = this;

  _.chain(self.level.config)
    .forEach(function (type) {
      self.setClasses(_settings[type]);
    })
    .value();

  return;
};

Menu.prototype.setState = function (stateName, stateValue) {
  var self = this;
  var _value = _.isNil(stateValue) ? !self.state[stateName] : stateValue;
  var _class = 'is-' + stateName;

  self.state[stateName] = _value;

  if (_value) {
    self.setClasses(_class);
  }
  else {
    self.removeClasses(_class);
  }

  return;
};

Menu.prototype.bindEvents = function () {
  var self = this;

  self.$node
    .on('active:insales-menu', function (event) {
      event.stopPropagation();

      self.setState('active');
    })
    .on('opened:insales-menu', function (event) {
      event.stopPropagation();

      self.setState('opened');
    })
    .on('hovered:insales-menu', function (event, eventData) {
      event.stopPropagation();

      self.setState('hovered', eventData.stateValue);
      self.checkOpenDirection();
    });

  return;
};

Menu.prototype.checkOpenDirection = function () {
  var self = this;
  var rightBorder = self.$node.offset().left + self.$node.width();
  var _baseDirection = self._getBaseDirection();
  var _reverseDirection = _settings.reverseDirections[_baseDirection];

  if (rightBorder > $(window).width()) {
    self.removeClasses(_settings[_baseDirection]);
    self.setClasses(_settings[_reverseDirection]);
  }
  else if (self.$node.is('.' + _settings[_reverseDirection])){
    self.removeClasses(_settings[_reverseDirection]);
    self.setClasses(_settings[_baseDirection]);
  }

  return;
};

Menu.prototype._getBaseDirection = function () {
  var self = this;
  var _config = self.level.config;
  var _direction = '';

  _direction = _.intersection(_config, _settings.alloweddirections);

  return _direction[0];
};

module.exports = Menu;
},{"./item":6,"settings":7}],6:[function(require,module,exports){
var MenuItem = function ($node, options) {
  var self = this;

  self.node = _.head($node);
  self.$node = $node;

  self.config = options.config;

  self.level = {
    depth: options.depth,
    config: self.getLevelConfig(options)
  };
  self.childConfig = self.getLevelConfig(options, true);

  self.state = {
    active: false,
    current: false,
    hovered: false,
  };

  self.node.MenuItem = self;

  self.marker = { state: {} };

  self.getElements();
  self.removeClasses('level-1');
  self.setClasses('level-' + self.level.depth);

  self.initState();
  self.bindEvents();
  self.initSubmenu();

  return self;
};

MenuItem.prototype.getElements = function () {
  var self = this;

  self.$controls = self.$node.children('.menu-item-controls');
  self.$link = self.$controls.children('.menu-link');
  self.$marker = self.$controls.children('.menu-marker');
  self.$icon = self.$controls.children('.menu-icon');
  self.$submenu = self.$node.children('.menu');

  return;
};

MenuItem.prototype.getSubmenu = function () {
  var self = this;

  return self.$submenu;
};

MenuItem.prototype.setClasses = function (className) {
  var self = this;

  self.$node.addClass(className);
  self.$controls.addClass(className);
  self.$link.addClass(className);
  self.$icon.addClass(className);
  self.$marker.addClass(className);

  return;
};

MenuItem.prototype.removeClasses = function (className) {
  var self = this;

  self.$node.removeClass(className);
  self.$controls.removeClass(className);
  self.$link.removeClass(className);
  self.$icon.removeClass(className);
  self.$marker.removeClass(className);

  return;
};

MenuItem.prototype.initState = function () {
  var self = this;
  var _isCurrentPage = self.isCurrentPage();

  if (_isCurrentPage) {
    self.setState('current', true);
    self.setState('active', true);
    self.setState('opened', true);
  }

  if (self.$submenu.length) {
    self.$node.addClass('has-submenu');
  }

  return;
};

MenuItem.prototype.setState = function (stateName, stateValue) {
  var self = this;
  var _value = _.isNil(stateValue) ? !self.state[stateName] : stateValue;
  var _class = 'is-' + stateName;
  var _eventData = {
    stateName: stateName,
    stateValue: stateValue
  };

  self.state[stateName] = _value;

  if (_value) {
    self.setClasses(_class);
  }
  else {
    self.removeClasses(_class);
  }

  setTimeout(function () {
    self.$submenu.trigger(stateName + ':insales-menu', _eventData);
  }, 0);

  return;
};

MenuItem.prototype.bindEvents = function () {
  var self = this;

  if ('ontouchstart' in document.documentElement) {
    self.$marker.on('touchstart', function (event) {
      event.preventDefault();

      if (self.isChildType('drop')) {
        self.setState('hovered');
        self.setState('touched');

        InSalesUI.Menu.addOpenedTouchMenu(self);
      }
      self.setState('opened');
    });
  }
  else {
    self.$node.on('mouseenter', function () {
      self.setState('hovered', true);
    })
    .on('mouseleave', function () {
      self.setState('hovered', false);
    });

    self.$marker.on('mousedown', function () {
      if (!self.isChildType('drop')) {
        self.setState('opened');
      }
    });
  }

  return;
};

MenuItem.prototype.getLevelConfig = function (options, forChild) {
  var self = this;
  var _depth = options.depth;
  var _config = {};

  if (forChild) {
    _depth = _depth + 1;
  }

  _config = self.config[_depth] || self.config.default;

  return _config;
};

MenuItem.prototype.isType = function (type) {
  var self = this;
  var _isType = false;

  _isType = _.includes(self.level.config, type);

  return _isType;
};

MenuItem.prototype.isChildType = function (type) {
  var self = this;
  var _isType = false;

  _isType = _.includes(self.childConfig, type);

  return _isType;
};

MenuItem.prototype.getParent = function () {
  var self = this;
  var _parent = self.$node.closest('.menu');

  return _parent;
};

MenuItem.prototype.getSubmenu = function () {
  var self = this;
  var _submenu = self.$submenu;

  return _submenu;
};

MenuItem.prototype.close = function () {
  var self = this;

  if (self.isChildType('drop')) {
    self.setState('hovered');
    self.setState('touched');
  }

  return;
};

MenuItem.prototype.isCurrentPage = function () {
  var self = this;
  var _isLinkCurrent = self.$link.data('menuLinkCurrent');
  var _isCurrent = false;

  if (_isLinkCurrent == 'yes') {
    _isCurrent = true;
  }
  else {
    _isCurrent = self._currentBySource();
  }

  return _isCurrent;
};

MenuItem.prototype._currentBySource = function () {
  var self = this;
  var _isCurrent = false;
  var _handle = self.$link.data('menuLink');
  var _linkSource = self.$link.data('menuLinkSource');
  var _currentPaths = InSalesUI.Menu._getPaths();

  switch (_linkSource) {
    case 'article':
      _isCurrent = (_handle == _currentPaths.article);
      break;

    case 'collection':
      _isCurrent = (_.includes(_currentPaths.collection, _handle));
      break;

    case 'menu':
      _isCurrent = self._isClientAccount();
      break;
  }

  return _isCurrent;
};

MenuItem.prototype._isClientAccount = function () {
  var self = this;
  var _isClientAccount = false;
  var _currentPageIsCA = _.chain(document.location.pathname)
    .split('/')
    .includes('client_account')
    .value();
  var _isHrefCA = _.chain(self.$link.attr('href'))
    .split('/')
    .includes('client_account')
    .value();

  _isClientAccount = (_currentPageIsCA && _isHrefCA);

  return _isClientAccount;
};

MenuItem.prototype.initSubmenu = function () {
  var self = this;
  var _submenu = self.getSubmenu();

  if (!_submenu.length) {
    return;
  }

  InSalesUI.Menu.createInstance({
    node: _submenu,
    config: self.config,
    depth: self.level.depth + 1
  });

  return;
};
module.exports = MenuItem;
},{}],7:[function(require,module,exports){
module.exports={
  "row": "is-horizontal",
  "horizontal": "is-horizontal",
  "column": "is-vertical",
  "vertical": "is-vertical",
  "collapse": "is-collapse",
  "drop": "is-drop",
  "left": "to-left",
  "right": "to-right",
  "down": "to-bottom",
  "up": "to-top",
  "down-left": "to-bottom-left",
  "up-left": "to-top-left",

  "alloweddirections": [
    "down", "right", "left", "up"
  ],
  "reverseDirections": {
    "down": "down-left",
    "right": "left",
    "left": "right",
    "up": "up-left"
  }
}

},{}],8:[function(require,module,exports){
module.exports.tag = require('scssify').createStyle(".menu {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin: 0;\n  padding: 0;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%;\n  list-style: none; }\n\n.menu.is-horizontal {\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row; }\n\n.menu.is-vertical {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -ms-flex-preferred-size: auto;\n      flex-basis: auto;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch; }\n\n.menu.is-drop {\n  position: absolute;\n  z-index: 1050;\n  display: none; }\n  .menu.is-drop.is-hovered {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex; }\n\n.menu.is-collapse {\n  display: none; }\n  .menu.is-collapse.level-1 {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex; }\n  .menu.is-collapse.is-opened {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex; }\n\n.menu.to-left {\n  right: 100%;\n  top: 0; }\n\n.menu.to-right {\n  left: 100%;\n  top: 0; }\n\n.menu.to-bottom {\n  top: 100%;\n  left: 0; }\n\n.menu.to-bottom-left {\n  top: 100%;\n  right: 0; }\n\n.menu.to-top {\n  bottom: 100%;\n  left: 0; }\n\n.menu.to-top-left {\n  bottom: 100%;\n  right: 0; }\n\n.menu-item {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  position: relative; }\n\n.menu-item-controls {\n  width: 100%;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: nowrap;\n      flex-wrap: nowrap;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  color: inherit; }\n\n.menu-link {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  color: pointer;\n  word-break: break-word;\n  white-space: normal; }\n\n.menu-icon {\n  position: relative;\n  color: inherit; }\n\n.menu-marker {\n  display: block;\n  width: 1rem;\n  height: 1rem;\n  border: none;\n  padding: 0;\n  position: relative;\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  color: inherit;\n  background-color: transparent;\n  cursor: pointer; }\n  .menu-marker:hover, .menu-marker:focus, .menu-marker:active {\n    outline: none; }\n\n/*# sourceMappingURL=to.css.map */", {"href":false,"prepend":true});
},{"scssify":1}]},{},[4]);
