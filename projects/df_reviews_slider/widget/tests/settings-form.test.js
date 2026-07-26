/**
 * Validates settings_form.json select options use inSales [label, value] order.
 * Run: node widget/tests/settings-form.test.js
 */

var assert = require('assert');
var fs = require('fs');
var path = require('path');

function parseLayout(value) {
  var raw = String(value == null ? 'slider' : value).trim().toLowerCase();
  var allowed = ['slider', 'masonry', 'grid', 'list', 'spotlight', 'marquee'];
  var i;

  for (i = 0; i < allowed.length; i++) {
    if (raw === allowed[i]) return allowed[i];
  }

  if (raw.indexOf('masonry') !== -1 || raw.indexOf('mason') !== -1 || raw.indexOf('мансори') !== -1 || raw.indexOf('колон') !== -1) return 'masonry';
  if (raw.indexOf('grid') !== -1 || raw.indexOf('сетк') !== -1) return 'grid';
  if (raw.indexOf('list') !== -1 || raw.indexOf('лент') !== -1) return 'list';
  if (raw.indexOf('spotlight') !== -1 || raw.indexOf('крупн') !== -1 || raw.indexOf('фокус') !== -1) return 'spotlight';
  if (raw.indexOf('marquee') !== -1 || raw.indexOf('бегущ') !== -1 || raw.indexOf('строк') !== -1) return 'marquee';
  if (raw.indexOf('slider') !== -1 || raw.indexOf('слайд') !== -1) return 'slider';

  return 'slider';
}

function parseTitleAlign(value) {
  var raw = String(value == null ? 'center' : value).trim().toLowerCase();
  if (raw === 'left' || raw.indexOf('left') !== -1 || raw.indexOf('лев') !== -1) return 'left';
  return 'center';
}

function findField(form, name) {
  var sections = Object.keys(form);
  var s;
  var g;
  var i;
  var j;

  for (s = 0; s < sections.length; s++) {
    var groups = form[sections[s]] || [];
    for (g = 0; g < groups.length; g++) {
      var items = groups[g].items || [];
      for (i = 0; i < items.length; i++) {
        if (items[i].name === name) return items[i];
      }
    }
  }

  return null;
}

var formPath = path.join(__dirname, '..', 'settings_form.json');
var form = JSON.parse(fs.readFileSync(formPath, 'utf8'));
var displayMode = findField(form, 'display_mode');
var titleAlign = findField(form, 'title-align');
var layoutKeys = ['slider', 'masonry', 'grid', 'list', 'spotlight', 'marquee'];

assert.ok(displayMode, 'display_mode field must exist');
assert.ok(titleAlign, 'title-align field must exist');

displayMode.options.forEach(function (pair) {
  assert.strictEqual(pair.length, 2, 'display_mode option must be [label, value]');
  assert.ok(layoutKeys.indexOf(pair[1]) !== -1, 'display_mode value must be layout key, got: ' + pair[1]);
  assert.ok(layoutKeys.indexOf(pair[0]) === -1, 'display_mode label must not be English key: ' + pair[0]);
  assert.strictEqual(parseLayout(pair[0]), pair[1], 'Russian label must parse to value: ' + pair[0]);
  assert.strictEqual(parseLayout(pair[1]), pair[1], 'English value must parse to itself: ' + pair[1]);
});

titleAlign.options.forEach(function (pair) {
  assert.strictEqual(pair.length, 2, 'title-align option must be [label, value]');
  assert.ok(['left', 'center'].indexOf(pair[1]) !== -1, 'title-align value must be left|center');
  assert.ok(['left', 'center'].indexOf(pair[0]) === -1, 'title-align label must not be English key: ' + pair[0]);
  assert.strictEqual(parseTitleAlign(pair[0]), pair[1], 'Russian label must parse to value: ' + pair[0]);
});

console.log('settings-form.test.js: all ' + (displayMode.options.length + titleAlign.options.length + 2) + ' checks passed');
