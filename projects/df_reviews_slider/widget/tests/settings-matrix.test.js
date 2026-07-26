/**
 * Settings interaction matrix tests.
 * Run: node widget/tests/settings-matrix.test.js
 */

var assert = require('assert');

function parseBool(value, defaultOn) {
  if (value === undefined || value === null) return !!defaultOn;
  var normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off' || normalized === '') {
    return false;
  }
  return !!defaultOn;
}

function parseLayout(value) {
  var raw = String(value == null ? 'slider' : value).trim().toLowerCase();
  if (raw.indexOf('masonry') !== -1 || raw.indexOf('mason') !== -1 || raw.indexOf('мансори') !== -1 || raw.indexOf('колон') !== -1) return 'masonry';
  if (raw.indexOf('grid') !== -1 || raw.indexOf('сетк') !== -1) return 'grid';
  if (raw.indexOf('list') !== -1 || raw.indexOf('лент') !== -1) return 'list';
  if (raw.indexOf('spotlight') !== -1 || raw.indexOf('крупн') !== -1 || raw.indexOf('фокус') !== -1) return 'spotlight';
  if (raw.indexOf('marquee') !== -1 || raw.indexOf('бегущ') !== -1) return 'marquee';
  if (raw.indexOf('slider') !== -1 || raw.indexOf('слайд') !== -1) return 'slider';
  return 'slider';
}

function clampColumns(value) {
  var n = parseInt(String(value), 10);
  if (isNaN(n)) return 3;
  return Math.min(4, Math.max(1, n));
}

function visibleSourceTabs(enabled, hideInsales, hideYandex, reviewsEnabled) {
  if (!enabled) return [];
  if (hideInsales && hideYandex) return [];
  var tabs = [];
  if (!hideInsales && reviewsEnabled !== false) tabs.push('insales');
  if (!hideYandex) tabs.push('yandex');
  return tabs;
}

function defaultActiveTab(tabs) {
  if (tabs.indexOf('yandex') >= 0) return 'yandex';
  if (tabs.indexOf('insales') >= 0) return 'insales';
  return null;
}

assert.strictEqual(parseLayout('Masonry'), 'masonry');
assert.strictEqual(parseLayout('Мансори'), 'masonry');
assert.strictEqual(parseLayout('Сетка'), 'grid');
assert.strictEqual(parseLayout('Лента'), 'list');
assert.strictEqual(parseLayout('Слайдер'), 'slider');
assert.strictEqual(parseLayout('Бегущая строка'), 'marquee');
assert.strictEqual(parseLayout('Режим фокуса'), 'spotlight');
assert.strictEqual(clampColumns(2), 2);
assert.strictEqual(clampColumns(9), 4);
assert.deepStrictEqual(visibleSourceTabs(true, true, false, true), ['yandex']);
assert.deepStrictEqual(visibleSourceTabs(true, false, true, true), ['insales']);
assert.deepStrictEqual(visibleSourceTabs(true, false, false, true), ['insales', 'yandex']);
assert.deepStrictEqual(visibleSourceTabs(true, true, true, true), []);
assert.deepStrictEqual(visibleSourceTabs(false, false, false, true), []);
assert.strictEqual(defaultActiveTab(['insales', 'yandex']), 'yandex');
assert.strictEqual(defaultActiveTab(['yandex']), 'yandex');

console.log('settings-matrix.test.js: all 16 checks passed');
