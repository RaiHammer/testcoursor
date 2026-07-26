(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.approve=t()}(this,function(){"use strict";function e(){this.scheme="",this.valid=!1}function t(e){this.strength=e,this.points=0,this.isMinimum=!1,this.hasLower=!1,this.hasUpper=!1,this.hasNumber=!1,this.hasSpecial=!1,this.isBonus=!1,this.percent=0,this.valid=!1,this.errors=[]}var r={message:"{title} is not a valid credit card number",schemes:[{regex:/^(5610|560221|560222|560223|560224|560225)/,scheme:"Australian Bank Card"},{regex:/^(2014|2149)/,scheme:"Diner's Club"},{regex:/^36/,scheme:"Diner's Club International"},{regex:/^(30[0-5]|36|38|54|55|2014|2149)/,scheme:"Diner's Club / Carte Blanche"},{regex:/^35(2[89]|[3-8][0-9])/,scheme:"Japanese Credit Bureau"},{regex:/^(5018|5020|5038|6304|6759|676[1-3])/,scheme:"Maestro"},{regex:/^5[1-5]/,scheme:"Mastercard"},{regex:/^(6304|670[69]|6771)/,scheme:"Laser"},{regex:/^(6334|6767)/,scheme:"Solo (Paymentech)"},{regex:/^(6011|622|64|65)/,scheme:"Discover"},{regex:/^3[47]/,scheme:"American Express"},{regex:/^(4026|417500|4508|4844|491(3|7))/,scheme:"Visa Electron"},{regex:/^(4)/,scheme:"Visa"}],_getScheme:function(e){e=(""+e).replace(/\D/g,"");for(var t=this.schemes.length;t--;)if(this.schemes[t].regex.test(e))return this.schemes[t].scheme},validate:function(t){t=(""+t).replace(/\D/g,"");var r,s=new e,a=t.length,i=0,n=1;if(a<12)return!1;for(;a--;)r=t.charAt(a)*n,i+=r-9*(r>9),n^=3;return s.valid=i%10===0&&i>0,s.scheme=this._getScheme(t),s}},s={minimum:8,minimumBonus:10,strengths:{0:"Very Weak",1:"Weak",2:"Better",3:"Almost",4:"Acceptable",5:"Strong",6:"Very Strong"},message:"{title} did not pass the strength test.",expects:["min","bonus"],errors:{isMinimum:"{title} must be at least {min} characters",hasLower:"{title} must have at least 1 lower case character",hasUpper:"{title} must have at least 1 upper case character",hasNumber:"{title} must have at least 1 number",hasSpecial:"{title} must have at least 1 special character"},_getScore:function(e){var r=new t(this.strengths[0]);return e.length>this.minimumBonus?(r.points+=2,r.isBonus=!0,r.isMinimum=!0):e.length>this.minimum?(r.points++,r.isMinimum=!0):(r.points=1,r.isMinimum=!1),r.hasLower=null!==e.match(/[a-z]/),r.isMinimum&&r.hasLower&&r.points++,r.hasUpper=null!==e.match(/[A-Z]/),r.isMinimum&&r.hasUpper&&r.points++,r.hasNumber=null!==e.match(/\d+/),r.isMinimum&&r.hasNumber&&r.points++,r.hasSpecial=null!==e.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/),r.isMinimum&&r.hasSpecial&&r.points++,r.percent=Math.ceil(r.points/6*100),r},_getStrength:function(e){var t=this._getScore(e);return t.strength=this.strengths[t.points],t.isMinimum||t.errors.push(this.errors.isMinimum),t.hasLower||t.errors.push(this.errors.hasLower),t.hasUpper||t.errors.push(this.errors.hasUpper),t.hasSpecial||t.errors.push(this.errors.hasSpecial),t.hasNumber||t.errors.push(this.errors.hasNumber),t.points>4&&(t.valid=!0),t},validate:function(e,t){if(this.minimum=t.min||this.minimum,this.minimumBonus=t.bonus||this.minimumBonus,t.hasOwnProperty("config")&&t.config.hasOwnProperty("messages"))for(var r in t.config.messages)t.config.messages.hasOwnProperty(r)&&(this.errors[r]=t.config.messages[r]);return this._getStrength(e)}},a={required:{validate:function(e){return!!e},message:"{title} is required",expects:!1},email:{regex:/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,validate:function(e){return this.regex.test(e)},message:"{title} must be a valid email address",expects:!1},url:{regex:/^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i,validate:function(e){return this.regex.test(e)},message:"{title} must be a valid web address",expects:!1},alphaNumeric:{regex:/^[A-Za-z0-9]+$/i,validate:function(e){return this.regex.test(e)},message:"{title} may only contain [A-Za-z] and [0-9]",expects:!1},numeric:{regex:/^-?[0-9]+$/,validate:function(e){return this.regex.test(e)},message:"{title} may only contain [0-9]",expects:!1},alpha:{regex:/^[A-Za-z]+$/,validate:function(e){return this.regex.test(e)},message:"{title} may only contain [A-Za-z]",expects:!1},decimal:{regex:/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/,validate:function(e){return this.regex.test(e)},message:"{title} must be a valid decimal",expects:!1},currency:{regex:/^\s*(\+|-)?((\d+(\.\d\d)?)|(\.\d\d))\s*$/,validate:function(e){return this.regex.test(e)},message:"{title} must be a valid currency value",expects:!1},ip:{regex:{ipv4:/^(?:(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.){3}(?:\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/,ipv4Cidr:/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/([0-9]|[1-2][0-9]|3[0-2]))$/,ipv6:/^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/i,ipv6Cidr:/^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*(\/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$/},validate:function(e){return this.regex.ipv4.test(e)||this.regex.ipv6.test(e)||this.regex.ipv4Cidr.test(e)||this.regex.ipv6Cidr.test(e)},message:"{title} must be a valid IP address",expects:!1},min:{validate:function(e,t){return"string"==typeof e&&e.length>=t.min},message:"{title} must be a minimum of {min} characters",expects:["min"]},max:{validate:function(e,t){return"string"==typeof e&&e.length<=t.max},message:"{title} must be a maximum of {max} characters",expects:["max"]},range:{validate:function(e,t){return"string"==typeof e?e.length>=t.min&&e.length<=t.max:"number"==typeof e&&(e>=t.min&&e<=t.max)},message:"{title} must be a minimum of {min} and a maximum of {max} characters",expects:["min","max"]},equal:{validate:function(e,t){return""+e==""+t.value},message:"{title} must be equal to {field}",expects:["value","field"]},format:{validate:function(e,t){if("[object RegExp]"===Object.prototype.toString.call(t.regex))return t.regex.test(e);throw"approve.value(): [format] - regex is not a valid regular expression."},message:"{title} did not pass the [{regex}] test",expects:["regex"]},time:{regex:/^(2[0-3]|[01]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])$/,validate:function(e){return this.regex.test(e)},message:"{title} is not a valid time",expects:!1},date:{formats:{ymd:/^(?:\2)(?:[0-9]{2})?[0-9]{2}([\/-])(1[0-2]|0?[1-9])([\/-])(3[01]|[12][0-9]|0?[1-9])$/,dmy:/^(3[01]|[12][0-9]|0?[1-9])([\/-])(1[0-2]|0?[1-9])([\/-])(?:[0-9]{2})?[0-9]{2}$/},validate:function(e,t){return this.formats[t.format].test(e)},message:"{title} is not a valid date",expects:["format"]},truthy:{regex:/^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/i,validate:function(e){return this.regex.test(e)},message:"{title} is not valid",expects:!1},falsy:{regex:/^(?:1|t(?:rue)?|y(?:es)?|ok(?:ay)?)$/i,validate:function(e){return!this.regex.test(e)},message:"{title} is not valid",expects:!1},cc:r,strength:s},i=function(){this.approved=!0,this.errors=[],this.failed=[],this.each=function(e){for(var t=e&&e.constructor&&e.call&&e.apply,r=this.errors.length;r--;)t&&e(this.errors[r])},this.filter=function(e,t){var r=t&&t.constructor&&t.call&&t.apply,s=0;if(this.hasOwnProperty(e))for(s=this[e].errors.length;s--;)r&&t(this[e].errors[s])}},n={tests:a,_format:function(e,t){return t="object"==typeof t?t:Array.prototype.slice.call(arguments,1),e.replace(/\{\{|\}\}|\{(\w+)\}/g,function(e,r){return"{{"===e?"{":"}}"===e?"}":t[r]}).trim()},_isRule:function(e){var t=["title","stop","ignoreNull"];return t.indexOf(e)<0},_start:function(e,t){var r=new i,s="",a=!1,n=!1;t.hasOwnProperty("title")&&(s=t.title),t.hasOwnProperty("stop")&&(a=t.stop),t.hasOwnProperty("ignoreNull")&&(n=t.ignoreNull);for(var u in t){if(a&&!r.approved)break;if(t.hasOwnProperty(u)&&this._isRule(u)){var o=t[u];if(!this.tests.hasOwnProperty(u))throw"approve.value(): "+u+" test not defined.";var d={constraint:o,rule:u,title:s,test:this.tests[u],value:e,ignoreNull:n};this._test(d,r)}}return r},_test:function(e,t){if(!e.hasOwnProperty("ignoreNull")||e.value||!e.ignoreNull){var r=this._getArgs(e),s=e.test.validate(e.value,r);if(t[e.rule]={approved:!0,errors:[]},"object"==typeof s){if(t.approved=!!s.valid&&t.approved,t[e.rule].approved=s.valid,s.hasOwnProperty("errors")){var a=this._formatMessages(s.errors,e);t.errors=t.errors.concat(a),t[e.rule].errors=a}for(var i in s)s.hasOwnProperty(i)&&!t.hasOwnProperty(i)&&(t[e.rule][i]=s[i])}else{if("boolean"!=typeof s)throw"approve.value(): "+e.rule+" returned an invalid value";t.approved=!!s&&t.approved,t[e.rule].approved=s}if(!t.approved){var n=this._formatMessage(e);t.errors.push(n),t[e.rule].errors.push(n)}s.valid||t.failed.push(e.rule)}},_eachExpected:function(e,t){if(Array.isArray(e.test.expects))for(var r=e.test.expects.length,s=r;s--;)t(e.test.expects[s],r)},_getArgs:function(e){var t={};return this._eachExpected(e,function(r,s){if(e.constraint.hasOwnProperty(r))t[r]=e.constraint[r];else{if(!(s<=1)||!/^[A-Za-z0-9]+$/i.test(e.constraint)&&"[object RegExp]"!==toString.call(e.constraint))throw"approve.value(): "+e.rule+" expects the "+r+" parameter.";t[r]=e.constraint}}),e.constraint.hasOwnProperty("config")&&(t.config=e.constraint.config),t},_getFormat:function(e){var t={};return this._eachExpected(e,function(r){e.constraint.hasOwnProperty(r)&&(t[r]=e.constraint[r]),/^[A-Za-z0-9]+$/i.test(e.constraint)&&(t[r]=e.constraint)}),t.title=e.title,t},_formatMessages:function(e,t){for(var r=this._getFormat(t),s=e.length;s--;)e[s]=this._format(e[s],r);return e},_formatMessage:function(e){var t,r=this._getFormat(e);return e.constraint.hasOwnProperty("message")?(t=e.constraint.message,this._format(t,r)):(t=e.test.message,this._format(t,r))},value:function(e,t){if("object"!=typeof t)throw"approve.value(value, rules): rules is not a valid object.";return this._start(e,t)},addTest:function(e,t){if("object"!=typeof e)throw"approve.addTest(obj, name): obj is not a valid object.";try{this.tests.hasOwnProperty(t)||(this.tests[t]=e)}catch(r){throw"approve.addTest(): "+r.message}}};return n});


},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
var Form = require('form');
var prepareData = require('tools/prepare-data');

var FIRST = 0;

var Factrory = function () {
  var self = this;

  _.merge(self, Shop.config.get([ 'consent_to_personal_data', 'locale' ]));
  self.setConfig({ messages: require('settings/messages') });

  self.bindEvents();

  return self;
};

Factrory.prototype._render = function (formDefination) {
  var _form = '';

  _form = Template.render(formDefination, 'system-form');

  return _form;
};


Factrory.prototype.get = function ($node) {
  var self = this;
  var $formNode = {};

  $formNode = self._getNode($node);

  return $formNode.Form;
};

Factrory.prototype.create = function ($parentNode, formDefination) {
  var self = this;
  var _formDefination = prepareData(formDefination, self);
  var $formNode = {};
  var _form = {};
  var _data = $parentNode.data();

  console.log('>>', formDefination);

  if (!$parentNode.length) {
    return false;
  }

  $($parentNode).html(self._render(_formDefination));

  $formNode = self._getNode($parentNode);

  if (!self._isFormIninted($formNode)) {
    _form = new Form($formNode, _formDefination, _data);
  }
  else {
    _form = $formNode.Form;
  }

  return _form;
};

Factrory.prototype._getNode = function ($node) {
  var _form = $node;

  if (!_form.hasClass('form')) {
    _form = $node.find('.form').first();
  }

  return _form[FIRST];
};

Factrory.prototype._isFormIninted = function ($formNode) {
  var _isInited = false;

  _isInited = _.get($formNode, [ FIRST, 'Form' ], false);

  return _isInited;
};

Factrory.prototype.setConfig = function (options) {
  var self = this;

  if (!self.messages) {
    self.messages = {};
  }
  _.merge(self.messages, options.messages);

  self.baseClasses = options.baseClasses;

  return;
};

Factrory.prototype.bindEvents = function () {
  $(document).on('scroll_to:insales', function (event, eventData) {
    var _scrollTo = eventData.scrollTo;

    $('html, body').animate({ scrollTop: _scrollTo }, 300);
  });

  return;
};

module.exports = Factrory;
},{"form":4,"settings/messages":12,"tools/prepare-data":15}],4:[function(require,module,exports){
var Row = require('./row');

var FIRST = 0;
var TOP_PANEL_OFFSET = -60;

var Form = function (node, formDefination, parentNodeData) {
  var self = this;

  self.selectors = require('settings/selectors');

  self.node = node;
  self.$node = $(node);

  self.config = formDefination.config;
  self.messages = formDefination.messages;
  self.rows = self._initRows(self.$node, formDefination);
  self.firstRow = formDefination.fields[FIRST].name;

  self._initOptions(formDefination);
  self.data = parentNodeData;
  self.sendToOptions = _.get(formDefination, 'sendToOptions', {});

  self.node.Form = self;

  return self;
};

Form.prototype._initRows = function ($form, formDefination) {
  var self = this;
  var _fieldsConfig = formDefination.fields;
  var _rows = {};

  $form.find(self.selectors.row)
    .each(function (index, row) {
      var _row = new Row({
        node: row,
        field: _fieldsConfig[index],
        config: formDefination.form
      });

      _rows[_row.name] = _row;
    });

  return _rows;
};

Form.prototype.getFirstRow = function () {
  var self = this;

  return self.rows[self.firstRow];
};

Form.prototype.getFirstInput = function () {
  var self = this;
  var _row = self.getFirstRow();

  return _row.input;
};

Form.prototype.clear = function () {
  var self = this;

  _.forEach(self.rows, function (row) {
    row.clear();
  });

  return;
};

Form.prototype.markErrors = function (errors) {
  var self = this;
  var _markErrors = _.get(self.config, 'errors.show', true);
  var _firstWithError = null;

  if (!_markErrors) {
    return;
  }

  _.forEach(errors, function (fieldErrors, fieldName) {
    var _name = fieldName;

    if (typeof fieldName !== 'string') { return; }
    if (fieldName.indexOf('captcha') !== -1) { return; }
    if (!self.rows[_name]) { return; }

    self.rows[_name]
      .markError(fieldErrors);

    if (!_firstWithError) {
      _firstWithError = self.rows[_name];
    }
  });

  self.scrollToErrorField(_firstWithError);

  return;
};

Form.prototype.getErrors = function () {
  var self = this;

  var _errors = {};

  _errors = _.chain(self.rows)
    .reduce(function (result, row) {
      var _check = row.getErrors();

      if (!_.isEmpty(_check)) {
        result[_check.name] = _check.errors;
      }

      return result;
    }, {})
    .value();

  return _errors;
};

Form.prototype.getData = function () {
  var self = this;
  var _object = self._serializeRows();

  _object = self._combine(_object);

  return _object;
};

Form.prototype._serializeRows = function () {
  var self = this;
  var _rows = {};

  _.forEach(self.rows, function (row) {
    var _data = row.getSerializeData();

    if (row.type == 'captcha') {
      _.merge(_rows, _data.value);
    }
    else {
      _rows[row.name] = _data;
    }
  });

  return _rows;
};

Form.prototype._initOptions = function (options) {
  var self = this;

  if (_.get(self.config, 'blockSubmit', true)) {
    self.$node.on('submit', function (event) {
      event.preventDefault();
    });
  }

  _.forEach(options.buttons, function (button, index) {
    self.$node.find('[data-form-button="' + index + '"]')
      .on('click', function () {
        if (_.isFunction(button.onClick)) {
          button.onClick(self);
        }
      });
  });

  self.sendTo = options.sendTo;
  self.sendToOptions = options.sendToOptions || {};
  self.onValid = options.onValid;
  self.onErrors = options.onErrors || self.markErrors;

  self.combineOrder = options.combineOrder || {};
  self.delemiter = options.delemiter;

  return;
};

Form.prototype.validate = function (options) {
  var self = this;
  var _errors = self.getErrors();
  var _data = self.getData();
  var $result = $.Deferred();
  var _options = options || self.sendToOptions;

  if (_.size(_errors)) {
    self.onErrors(_errors);
    self.reloadCaptcha();
    $result.reject(_errors);
  }
  else {
    self.sendTo(_data, _options)
      .then(function (response) {
        self.onValid(response, self);
        self.reloadCaptcha();

        return $result.resolve(response);
      }, function (response) {
        self.reloadCaptcha();
        self.onErrors(response.errors, self);

        return $result.reject(response.errors);
      });
  }

  return $result.promise();
};

Form.prototype._combine = function (values) {
  var self = this;
  var _combineRules = self.combineOrder;
  var _result = values;
  var _exclude = [];

  _.forEach(_combineRules, function (rule, name) {
    _result[name] = self._joinFields(rule, values);
    _exclude = _.concat(_exclude, rule.fields);
  });

  _exclude = _.chain(_exclude)
    .compact()
    .uniq()
    .forEach(function (fieldName) {
      _.unset(_result, fieldName);
    })
    .value();

  _.forEach(_result, function (fieldData, fieldName) {
    if (_.isObject(fieldData)) {
      _result[fieldName] = fieldData.value;
    }
  });

  return _result;
};

Form.prototype._joinFields = function (rules, values) {
  var _fields = [];
  var _delemiter = rules.delemiter || '\n';

  _fields = _.chain(rules.fields)
    .reduce(function (result, fieldName) {
      var _field = values[fieldName];
      var _value = _field.value || '';

      if (_value && rules.useTitle !== false) {
        _value = _field.title + ' ' + _value;
      }

      result.push(_value);

      return result;
    }, [])
    .compact()
    .join(_delemiter)
    .value();

  return _fields;
};

Form.prototype.reloadCaptcha = function () {
  var self = this;

  try {
    grecaptcha.reset(window.grecaptchaWidget);
  }
  catch (e) {
    return;
  }
};

Form.prototype.scrollToErrorField = function (errorField) {
  var self = this;
  var _viewport = errorField.node.getBoundingClientRect();
  var _bodyHeight = document.documentElement.clientHeight;
  var _scrollTo = null;
  var _needScroll = false;

  if (_viewport.top + TOP_PANEL_OFFSET < 0) {
    _needScroll = true;
  }
  else if (_viewport.top > _bodyHeight) {
    _needScroll = true;
  }

  if (_needScroll) {
    _scrollTo = errorField.$node.offset().top + TOP_PANEL_OFFSET;
    self.$node.trigger('scroll_to:insales', { scrollTo: _scrollTo });
  }

  return;
};

module.exports = Form;
},{"./row":6,"settings/selectors":13}],5:[function(require,module,exports){
var validate = require('approvejs');
var Input = function ($row, options) {
  var self = this;
  var $node = $row.find('.form-field');

  _.merge(self, self._pickOptions(options));
  self.rules = self._pickRules(options);

  self.$node = $node;
  self.$node.each(function () {
    this.Input = self;
  });

  self.$node.on('click  change', function () {
    setTimeout(function () {
      var _state = self.$node.find('[type="checkbox"]').prop('checked');

      self.unmark();
      self.setClasses('active', _state);
    }, 0);
  });

  return self;
};

Input.prototype.clear = function () {
  var self = this;

  self.$node.val('');
  self.unmark();

  return;
};

Input.prototype.getErrors = function () {
  var self = this;
  var _result = {};
  var _value = self.value();
  var _input = self.$node;

  _result = validate.value(_value, self.rules);
  
  if (_.startsWith(_input.attr('name'), 'dirty_email')) {
    _result.approved = !_input.val();
  }

  if (_.startsWith(_input.attr('name'), 'dirty_email')) {
    _result.approved = !_input.val();
  }

  return _result;
};

Input.prototype.value = function () {
  var self = this;
  var _value = null;
  var _group = null;

  if (self.type == 'group') {
    _group = self.$node.find(':checked');

    if (self.multiple) {
      _value = [];
      _group.each(function () {
        _value.push($(this).val());
      });

      _value = _.isEmpty(_value) ? '' : _value;
    }
    else {
      _value = _group.val();
    }
  }
  else if (self.type == 'rating') {
    _group = self.$node.find(':checked');
    _value = _group.val();
  }
  else if (self.type == 'checkbox') {
    _value = self.$node
      .find('[type="checkbox"]:checked')
      .val();
  }
  else if (self.type == 'captcha') {
    try {
      _value = grecaptcha.getResponse(window.grecaptchaWidget);
    }
    catch (e) {
      _value = false;
    }
    finally {
      _value = !!_value;
    }
  }
  else {
    _value = self.$node.val();
  }

  return _value;
};

Input.prototype.markError = function () {
  var self = this;

  self.$node
    .addClass('with-error');

  return;
};

Input.prototype.unmark = function () {
  var self = this;

  self.$node
    .removeClass('with-error');

  return;
};

Input.prototype._pickOptions = function (options) {
  var _options = {};

  _options = _.pick(options, [
    'type',
    'required',
    'multiple'
  ]);

  return _options;
};

Input.prototype._pickRules = function (options) {
  var _rules = {};

  _rules = _.chain(options)
    .pick(require('settings/approve-rules'))
    .reduce(function (result, ruleValue, ruleName) {
      var _rule = {};
      var _message = InSalesUI.Form.messages[ruleName];

      if (ruleName == 'title' || ruleName == 'stop') {
        _rule = ruleValue;
      }
      else if (ruleValue === true && _message) {
        _rule = { message: _message };
      }
      else if (ruleValue === false) {
        _rule = null;
      }
      else {
        _rule = ruleValue;
      }

      if (_rule) {
        result[ruleName] = _rule;
      }

      return result;
    }, {})
    .value();

  return _rules;
};

Input.prototype.setClasses = function (stateName, stateValue) {
  var self = this;
  var _marker = self.$node.find('.form-toggle-marker');

  if (self.type != 'checkbox' && self.type != 'group') {
    return;
  }

  if (stateValue) {
    _marker.addClass('is-active');
  }
  else {
    _marker.removeClass('is-active');
  }

  return;
};

module.exports = Input;
},{"approvejs":1,"settings/approve-rules":8}],6:[function(require,module,exports){
var Input = require('./input');

var Row = function (options) {
  var self = this;

  _.merge(self, self._pickOptions(options.field));
  self.errors = options.config.errors;

  self.node = options.node;
  self.$node = $(options.node);

  self.$label = self._getLabelNode();
  self.input = new Input(self.$node, options.field);
  self.$errorNotice = self.$node.find('[data-form-row-error]') || $({});

  self.node.Row = self;

  self._initCaptcha();
  self._initRating();
  self._bindEvents(options);

  return self;
};

Row.prototype.clear = function (instance) {
  var self = instance || this;

  self.input.clear();
  self.unmark();

  return;
};

Row.prototype.markError = function (fieldErrors) {
  var self = this;
  var _showErrors = _.get(self.errors, 'show', true);
  var _errorMessage = [];

  if (!_showErrors) {
    return;
  }

  _errorMessage = _.chain(fieldErrors)
    .map(_.upperFirst)
    .join('<br/>')
    .value();

  self.$node.addClass('with-error');
  self.$label.addClass('with-error');
  self.$errorNotice.html(_errorMessage);

  self.input.markError();

  return;
};

Row.prototype.unmark = function () {
  var self = this;

  self.$node.removeClass('with-error');
  self.$label.removeClass('with-error');
  self.$errorNotice.html('');

  return;
};

Row.prototype.getErrors = function () {
  var self = this;
  var _check = self.input.getErrors();
  var _error = {};

  if (!_check.approved) {
    _error = {
      name: self.name,
      errors: _check.errors
    };
  }

  return _error;
};

Row.prototype._pickOptions = function (options) {
  var _options = {};

  _options = _.pick(options, [
    'title',
    'name',
    'required',
    'type'
  ]);

  return _options;
};

Row.prototype._getLabelNode = function () {
  var self = this;

  return self.$node.find('.form-label');
};

Row.prototype.getSerializeData = function () {
  var self = this;
  var _data = {};
  var _value = self.input.value();

  if (self.type == 'captcha') {
    var verifyCaptcha = _.get(self.captcha, 'solution', false);

    if (verifyCaptcha) {
      _data.value = { 'g-recaptcha-response': self.captcha.solution };
    }
    else {
      self.input.getErrors();
    }
  }
  else if (self.type == 'rating') {
    _data.value = self.rating.find('.form-rating-input:checked').val();
  }
  else if (_value) {
    _data.value = _value;
  }
  _data.title = self.title;

  return _data;
};

Row.prototype._initCaptcha = function () {
  var self = this;
  var key = Shop.config.get('recaptcha_key').recaptcha_key;

  if (self.type != 'captcha') {
    return;
  }

var recaptchaVerify = function (response) {
  self.captcha = { solution: response };
  if (response) {
    self.unmark();
  }

  jquery('[name="g-recaptcha-response"]').html(response);

  return ;
};

if (Shop.config.config.feedback_captcha_enabled) {
  EventBus.subscribe('recaptcha:insales:loaded', function () {
    var key = Shop.config.get('recaptcha_key').recaptcha_key;

    $('.form-row #gRecaptcha').each(function(index, el) {
      var randomId = 'gRecaptcha' + _.random(1, 99999999)
      $(this).attr('id', randomId);

      grecaptchaWidget = grecaptcha.render($(el).get(0), {
        sitekey: key,
        callback: recaptchaVerify
      });
      window = { grecaptchaWidget: grecaptchaWidget };
    });
  })
} else {
  setTimeout(function () {
    var loadCapthca = setInterval(function () {
      if (grecaptcha) {
        try {
          $('.form-row #gRecaptcha').each(function(index, el) {
            var randomId = 'gRecaptcha' + _.random(1, 99999999)
            $(this).attr('id', randomId);
            grecaptchaWidget = grecaptcha.render(randomId, {
              sitekey: key,
              callback: recaptchaVerify
            });
            window = { grecaptchaWidget: grecaptchaWidget };
          });

          clearInterval(loadCapthca);
        } catch (e) {
          console.log(e);
          clearInterval(loadCapthca);
        }
      }
    }, 500);
  }, 0);
}

  self.name = 'captcha';

  return;
};

Row.prototype._initRating = function () {
  var self = this;

  if (self.type != 'rating') {
    return;
  }

  self.rating = self.$node.find('.form-rating');

  return;
};

Row.prototype._bindEvents = function () {
  var self = this;

  self.$node.on('click focusin', function () {
    self.unmark();
  });

  if (_.get(self.errors, 'onBlur', true)) {
    var _blur = _.throttle(function (event) {
      var _error = self.getErrors();

      if (_.size(_error)) {
        self.markError(_error.errors);
      }
    }, 200);

    self.$node.on('focusout', _blur);
  }

  return;
};

module.exports = Row;
},{"./input":5}],7:[function(require,module,exports){
(function (window) {
  var InSalesUI = window.InSalesUI ? window.InSalesUI : {};

  require('ui/templates');
  require('styles/style.scss');

  InSalesUI.Form = new (require('./factory'))();
  if (Shop.config.config && Shop.config.config.captcha_type === 'google') {
    var script = document.createElement('script');
    var recaptcha_locale = Shop.config.get('locale').locale;
    script.src = 'https://www.google.com/recaptcha/api.js?hl=' + recaptcha_locale + '&render=explicit';
    document.getElementsByTagName('head')[0].appendChild(script);
  }
  $(function () {
    $('[data-product-rating]').each(function () {
      var _node = $(this);
      var _rating = _node.data('productRating');
      var _maxRating = _node.data('productMaxRating') || 5;

      _node.html(Template.render({
        rating: _rating,
        max: _maxRating
      }, 'system-review-rating'));
    });
  });

  window.InSalesUI = InSalesUI;
})(window);
},{"./factory":3,"styles/style.scss":14,"ui/templates":20}],8:[function(require,module,exports){
module.exports=[
  "stop",
  "title",
  "required",

  "min",
  "max",
  "range",
  "email"
]
},{}],9:[function(require,module,exports){
module.exports={
  "classes": "",
  "title": "",
  "type": "text",
  "name": "",
  "value": "",
  "options": [],
  "placeholder": "",
  "notice": [
    {
      "classes": "is-error",
      "data": "data-form-row-error"
    }
  ],
  "stop": true
}

},{}],10:[function(require,module,exports){
module.exports=[
  "hidden",
  "text",
  "textarea",
  "password",

  "email",
  "tel",

  "select",

  "checkbox",
  "group",
  "captcha",
  "rating"
]
},{}],11:[function(require,module,exports){
module.exports = function () {
  return {
    form: {
      classes: '',
      id: ''
    },
    buttons: [],
    fields: [],
    config: {},
    sendTo: Shop.sendMessage,
    onValid: function () {},
    onErrors: null
  };
};
},{}],12:[function(require,module,exports){
module.exports={
  "min": "Поле должно быть не меньше {min} символов",
  "max": "Поле должно быть не более {max} символов",
  "range": "поле должно быть не менее {min} и не более {max} символов",
  "required": "Поле обязательно для заполнения",
  "email": "Должен быть указан валидный e-mail"
}

},{}],13:[function(require,module,exports){
module.exports={
  "form": ".form",
  "row": ".form-row",
  "label": ".form-label",
  "field": ".form-field"
}

},{}],14:[function(require,module,exports){
module.exports.tag = require('scssify').createStyle(".form {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  margin-left: -0.5em;\n  margin-right: -0.5em;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n  font-size: 1rem; }\n\n.form-row {\n  padding-left: 0.5em;\n  padding-right: 0.5em;\n  margin-bottom: 1em; }\n\n.form-controls-wrapper {\n  padding-left: 0.5em;\n  padding-right: 0.5em;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%; }\n\n.form-row {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  min-width: 200px;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center; }\n  .form-row.is-inline .form-label {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100px;\n            flex: 0 0 100px; }\n  .form-row.is-hidden {\n    display: none; }\n  .form-row:not(.with-error) .form-notice.is-error {\n    display: none; }\n  .form-row.is-captcha {\n    padding-top: 1rem; }\n    .form-row.is-captcha.with-error {\n      background-color: #ffebeb; }\n    @media (max-width: 320px) {\n      .form-row.is-captcha {\n        padding-left: 0;\n        max-width: 302px; } }\n  .form-row:not(.is-success) .form-notice.is-success {\n    display: none; }\n\n.form-label {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%;\n  font-weight: 400;\n  color: inherit;\n  line-height: 1.4; }\n  .form-label.is-required:after {\n    content: '*';\n    color: red;\n    margin-left: 0.32em; }\n  .form-label.with-error {\n    color: #ff4c65; }\n\n.form-field {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  min-width: 100px;\n  border-style: solid;\n  border-width: 1px;\n  border-color: #aaa; }\n  .form-field:focus {\n    -webkit-box-shadow: 0 0 1px;\n            box-shadow: 0 0 1px; }\n  .form-field.without-border {\n    border: none !important; }\n  .form-field.is-text {\n    padding: 0.3em;\n    line-height: 1.2;\n    background-color: #fff;\n    color: #333; }\n  .form-field.is-textarea {\n    min-height: calc(6em + 0.6em);\n    resize: vertical; }\n  .form-field.is-select {\n    padding: 0.3em;\n    line-height: 1.2;\n    cursor: pointer;\n    background-color: #fff;\n    color: #333; }\n  .form-field.with-error {\n    background-color: #ffbdbd;\n    border-color: #ff4c65;\n    font-weight: 300; }\n  .form-field.is-checkbox, .form-field.is-group {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    margin-left: -0.3em;\n    margin-right: -0.3em;\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -ms-flex-preferred-size: 100%;\n        flex-basis: 100%;\n    background-color: transparent; }\n  .form-field.is-checkbox {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center; }\n  .form-field.is-group {\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    margin-bottom: 0.3em;\n    margin-top: 0.3em; }\n  .form-field.is-rating {\n    background-color: transparent; }\n  .form-field.is-captcha {\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 10em;\n            flex: 1 1 10em; }\n\n.form-toggle {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  cursor: pointer;\n  margin-left: 0.3em;\n  margin-right: 0.3em;\n  opacity: 0;\n  position: absolute;\n  z-index: -1; }\n\n.form-toggle-marker {\n  display: inline-block;\n  width: 1rem;\n  height: 1rem;\n  margin-left: 0.3em;\n  margin-right: 0.3em;\n  border: 1px solid;\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  cursor: pointer;\n  text-align: center;\n  position: relative; }\n  .form-toggle-marker:before {\n    display: block;\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%); }\n\n.form-toggle-caption {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  margin: 0;\n  cursor: pointer;\n  padding-right: 0.3em;\n  padding-left: 0.3em;\n  line-height: 1.4; }\n  @supports ((-webkit-hyphens: auto) or (-ms-hyphens: auto) or (hyphens: auto)) {\n    .form-toggle-caption {\n      hyphens: auto;\n      -webkit-hyphens: auto;\n      -moz-hyphens: auto;\n      -ms-hyphens: auto; } }\n  @supports not ((-webkit-hyphens: auto) or (-ms-hyphens: auto) or (hyphens: auto)) {\n    .form-toggle-caption {\n      word-break: break-word; } }\n\n.form-toggle:focus + .form-toggle-marker {\n  -webkit-box-shadow: 0 0 1px;\n          box-shadow: 0 0 1px; }\n\n.form-toggle[type=\"radio\"] + .form-toggle-marker {\n  border-radius: 50%; }\n\n.form-field.is-group .form-toggle-caption {\n  -webkit-box-ordinal-group: 2;\n      -ms-flex-order: 1;\n          order: 1; }\n\n.form-field.is-group .form-toggle,\n.form-field.is-group .form-toggle-marker {\n  -webkit-box-ordinal-group: 1;\n      -ms-flex-order: 0;\n          order: 0; }\n\n.form-field.is-checkbox .form-toggle-caption {\n  -webkit-box-flex: 0;\n      -ms-flex-positive: 0;\n          flex-grow: 0;\n  -webkit-box-ordinal-group: 2;\n      -ms-flex-order: 1;\n          order: 1; }\n\n.form-field.is-checkbox .form-toggle,\n.form-field.is-checkbox .form-toggle-marker {\n  -webkit-box-ordinal-group: 0;\n      -ms-flex-order: -1;\n          order: -1; }\n\n.product-rating {\n  display: inline-block;\n  color: green; }\n\n.product-rating:after {\n  content: '';\n  display: block;\n  clear: both; }\n\n.product-rating-point {\n  display: block;\n  width: 1rem;\n  height: 1rem;\n  position: relative;\n  float: left; }\n  .product-rating-point:after {\n    content: '\\2605';\n    position: absolute;\n    top: 50%;\n    left: 50%;\n    -webkit-transform: translate(-50%, -50%);\n            transform: translate(-50%, -50%);\n    font-size: 1.5em;\n    color: inherit; }\n  .product-rating-point.is-current {\n    color: orange; }\n\n.form-rating {\n  cursor: pointer; }\n\n.form-rating-input {\n  position: absolute;\n  z-index: -1;\n  opacity: 0; }\n  .form-rating-input:checked ~ .form-rating-label {\n    color: orange; }\n\n.form-rating-label {\n  float: right;\n  width: 1.5rem;\n  height: 1.5rem;\n  cursor: pointer; }\n  .form-rating-label:hover {\n    color: orange; }\n    .form-rating-label:hover ~ .form-rating-label {\n      color: orange; }\n  .form-rating-label:nth-last-child(1) {\n    color: red !important; }\n    .form-rating-label:nth-last-child(1):after {\n      content: '\\26D4'; }\n\n.form-notice {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 100%;\n          flex: 1 1 100%;\n  line-height: 1.4; }\n  .form-notice:empty {\n    display: none; }\n\n/*# sourceMappingURL=to.css.map */", {"href":false,"prepend":true});
},{"scssify":2}],15:[function(require,module,exports){
var fieldDefaults = require('settings/field-defaults');
var formDefaults = require('settings/form-defaults')();

var availableTypes = require('settings/field-types');

function _getMods (field) {
  var _classes = [];

  if (field.required) {
    _classes.push('is-required');
  }
  if (field.inline) {
    _classes.push('is-inline');
  }
  _classes.push('is-' + field.type);

  return _.join(_classes, ' ');
}

function _getRowClasess (field) {
  var _classes = _.split(field.classes, ' ');

  _classes = _.chain(field.mods)
    .split(' ')
    .concat(_classes)
    .value();

  return _.join(_classes, ' ');
}

function _checkFieldType (type) {
  var _type = type;

  if (!_.includes(availableTypes, _type)) {
    _type = 'text';
  }

  return _type;
}

function _getRenderType (fieldType) {
  var _checkType = 'system-' + fieldType;
  var _renderType = 'system-text';

  if (Template._templateList[_checkType]) {
    _renderType = _checkType;
  }

  return _renderType;
}

function _prepareField (field, local) {
  var _field = _.cloneDeep(fieldDefaults);

  field.renderType = _getRenderType(field.type);

  _.merge(_field, field);
  _field.type = _checkFieldType(_field.type);

  if (_field.type == 'captcha') {
    _field.required = true;
  }

  if (_field.type == 'rating') {
    _field.rating = _field.rating || 5;
  }

  _field.mods = _getMods(_field);
  _field.classes = _getRowClasess(_field);
  _field.language = local;

  return _field;
}

module.exports = function (formDefination, factory) {
  var _form = _.cloneDeep(formDefaults);
  var _data = _.merge({}, _form, formDefination);
  var _defBasClasses = factory.baseClasses;
  var _consent = factory.consent_to_personal_data;

  if (_consent.active) {
    _data.fields.push({
      type: 'checkbox',
      required: true,
      title: _consent.description,
      name: 'consent_to_personal_data',
      value: 'agree',
    });
  }
  
  if (_data.form.useDirtyEmail) {
    _data.fields.push({
      type: 'hidden',
      required: false,
      title: 'хаха, ты робот!',
      name: 'dirty_email' + Date.now()
    });
  }

  if (_data.form.useDirtyEmail) {
    _data.fields.push({
      type: 'hidden',
      required: false,
      title: 'хаха, ты робот!',
      name: 'dirty_email' + Date.now()
    });
  }

  _data.fields = _.reduce(_data.fields, function (res, field) {
    res.push(_prepareField(field, factory.locale));

    return res;
  }, []);

  _data.config.baseClasses = _.get(_data, 'config.baseClasses', _defBasClasses);

  return _data;
};
},{"settings/field-defaults":9,"settings/field-types":10,"settings/form-defaults":11}],16:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='';
 var key = Shop.config.get('recaptcha_key').recaptcha_key 
__p+=' <div class="g-recaptcha" id="gRecaptcha" data-sitekey="'+
((__t=( key ))==null?'':__t)+
'"></div>';
}
return __p;
};
},{}],17:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<label class="form-field without-border is-checkbox"> <input class="form-toggle" type="checkbox" name="'+
((__t=( name ))==null?'':__t)+
'" value="'+
((__t=( value ))==null?'':__t)+
'"> <span class="form-toggle-marker"></span> <span class="form-label form-toggle-caption '+
((__t=( classes ))==null?'':__t)+
'" lang="'+
((__t=( language ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</span> </label>';
}
return __p;
};
},{}],18:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<form class="form '+
((__t=( form.classes ))==null?'':__t)+
'" id="'+
((__t=( form.id ))==null?'':__t)+
'"> ';
 _.forEach(fields, function (field) { 
__p+=' <div class="form-row '+
((__t=( field.classes ))==null?'':__t)+
'"> '+
((__t=( Template.render(field, field.renderType) ))==null?'':__t)+
' ';
 _.forEach(field.notice, function(notice) { 
__p+=' <div class="form-notice '+
((__t=( _.get(config, 'baseClasses.notice', '') ))==null?'':__t)+
' '+
((__t=( notice.classes ))==null?'':__t)+
'" '+
((__t=( notice.data ))==null?'':__t)+
'>'+
((__t=( notice.message ))==null?'':__t)+
'</div> ';
 }) 
__p+=' </div> ';
 }) 
__p+=' ';
 if (buttons) { 
__p+=' <div class="form-controls-wrapper"> <div class="form-controls"> ';
 _.forEach(buttons, function (button, index) { 
__p+=' <button class="form-button '+
((__t=( _.get(config, 'baseClasses.button', '') ))==null?'':__t)+
' button '+
((__t=( button.classes ))==null?'':__t)+
'" type="'+
((__t=( button.type ))==null?'':__t)+
'" data-form-button="'+
((__t=( index ))==null?'':__t)+
'">'+
((__t=( button.title ))==null?'':__t)+
'</button> ';
 }) 
__p+=' </div> </div> ';
 } 
__p+=' </form>';
}
return __p;
};
},{}],19:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-label '+
((__t=( mods ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</div> ';
 var _type = obj.multiple ? 'checkbox' : 'radio' 
__p+=' ';
 var _name = obj.multiple ? name + '[]' : name 
__p+=' ';
 _.forEach(options, function (option) { 
__p+=' <label class="form-field without-border is-group"> ';
 var _selected = option.selected ? 'checked' : '' 
__p+=' <input class="form-toggle" type="'+
((__t=( _type ))==null?'':__t)+
'" value="'+
((__t=( option.value ))==null?'':__t)+
'" name="'+
((__t=( _name ))==null?'':__t)+
'" '+
((__t=( _selected ))==null?'':__t)+
' > <span class="form-toggle-marker"></span> <span class="form-toggle-caption" lang="'+
((__t=( language ))==null?'':__t)+
'">'+
((__t=( option.title ))==null?'':__t)+
'</span> </label> ';
 }) 
__p+='';
}
return __p;
};
},{}],20:[function(require,module,exports){
Template.addCompiled(require('./form.html'), 'system-form');
Template.addCompiled(require('./text.html'), 'system-text');
Template.addCompiled(require('./textarea.html'), 'system-textarea');
Template.addCompiled(require('./checkbox.html'), 'system-checkbox');
Template.addCompiled(require('./select.html'), 'system-select');
Template.addCompiled(require('./group.html'), 'system-group');
Template.addCompiled(require('./captcha.html'), 'system-captcha');
Template.addCompiled(require('./rating.html'), 'system-rating');
Template.addCompiled(require('./review-rating.html'), 'system-review-rating');
},{"./captcha.html":16,"./checkbox.html":17,"./form.html":18,"./group.html":19,"./rating.html":21,"./review-rating.html":22,"./select.html":23,"./text.html":24,"./textarea.html":25}],21:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-label '+
((__t=( mods ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</div> <div class="form-field without-border '+
((__t=( mods ))==null?'':__t)+
'"> <div class="form-rating product-rating"> ';
 for(i = rating; i >= 0; i--){ 
__p+=' <input type="radio" name="'+
((__t=( name ))==null?'':__t)+
'" value="'+
((__t=( i ? i : '' ))==null?'':__t)+
'" class="form-rating-input" id="'+
((__t=( name ))==null?'':__t)+
''+
((__t=( i ))==null?'':__t)+
'"> <label class="form-rating-label product-rating-point '+
((__t=( i ? '' : 'is-rating-reset' ))==null?'':__t)+
'" for="'+
((__t=( name ))==null?'':__t)+
''+
((__t=( i ))==null?'':__t)+
'" title="'+
((__t=( i || 'clear' ))==null?'':__t)+
'"></label> ';
 } 
__p+=' </div> </div>';
}
return __p;
};
},{}],22:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="product-rating"> ';
 if (rating) { 
__p+=' ';
 for (i = 1; i <= max; i ++) { 
__p+=' ';
 var _current = (i <= rating) ? 'is-current' : ''; 
__p+=' <span class="product-rating-point '+
((__t=( _current ))==null?'':__t)+
'"></span> ';
 } 
__p+=' ';
 }
__p+=' </div>';
}
return __p;
};
},{}],23:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-label '+
((__t=( mods ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</div> <select class="form-field is-select" name="'+
((__t=( name ))==null?'':__t)+
'"> ';
 _.forEach(options, function (option) { 
__p+=' ';
 var _selected = option.selected ? 'selected' : '' 
__p+=' <option value="'+
((__t=( option.value ))==null?'':__t)+
'" '+
((__t=( _selected ))==null?'':__t)+
'>'+
((__t=( option.title ))==null?'':__t)+
'</option> ';
 }) 
__p+=' </select>';
}
return __p;
};
},{}],24:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-label '+
((__t=( mods ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</div> <input class="form-field is-text" type="'+
((__t=( type ))==null?'':__t)+
'" name="'+
((__t=( name ))==null?'':__t)+
'" value="'+
((__t=( value ))==null?'':__t)+
'" placeholder="'+
((__t=( placeholder ))==null?'':__t)+
'">';
}
return __p;
};
},{}],25:[function(require,module,exports){
module.exports = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="form-label '+
((__t=( mods ))==null?'':__t)+
'">'+
((__t=( title ))==null?'':__t)+
'</div> <textarea class="form-field is-text is-textarea" name="'+
((__t=( name ))==null?'':__t)+
'" placeholder="';
 placeholder 
__p+='">'+
((__t=( value ))==null?'':__t)+
'</textarea>';
}
return __p;
};
},{}]},{},[7]);
