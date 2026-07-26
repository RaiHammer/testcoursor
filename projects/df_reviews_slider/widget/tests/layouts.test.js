/**
 * Layout parsing and mode tests.
 * Run: node widget/tests/layouts.test.js
 */

var assert = require('assert');

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
  if (raw.indexOf('marquee') !== -1 || raw.indexOf('бегущ') !== -1 || raw.indexOf('строк') !== -1) {
    return 'marquee';
  }
  if (raw.indexOf('slider') !== -1 || raw.indexOf('слайд') !== -1) return 'slider';

  return 'slider';
}

function usesSwiper(layout) {
  return layout === 'slider' || layout === 'spotlight';
}

function usesStaticGrid(layout) {
  return layout === 'masonry' || layout === 'grid' || layout === 'list';
}

assert.strictEqual(parseLayout('slider'), 'slider');
assert.strictEqual(parseLayout('masonry'), 'masonry');
assert.strictEqual(parseLayout('Masonry (колонки)'), 'masonry');
assert.strictEqual(parseLayout('Мансори'), 'masonry');
assert.strictEqual(parseLayout('Сетка'), 'grid');
assert.strictEqual(parseLayout('Лента'), 'list');
assert.strictEqual(parseLayout('Spotlight (1 крупный)'), 'spotlight');
assert.strictEqual(parseLayout('Режим фокуса'), 'spotlight');
assert.strictEqual(parseLayout('Бегущая строка'), 'marquee');
assert.strictEqual(parseLayout('Слайдер'), 'slider');
assert.strictEqual(parseLayout('unknown'), 'slider');

assert.strictEqual(usesSwiper('slider'), true);
assert.strictEqual(usesSwiper('spotlight'), true);
assert.strictEqual(usesSwiper('masonry'), false);
assert.strictEqual(usesStaticGrid('grid'), true);
assert.strictEqual(usesStaticGrid('marquee'), false);

console.log('layouts.test.js: all 16 checks passed');
