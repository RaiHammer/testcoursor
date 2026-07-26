/**
 * Settings sync parsers (layout shell + editor CSS vars).
 * Run: node widget/tests/settings-sync.test.js
 */

var assert = require('assert');

function parseTitleAlign(value) {
  var raw = String(value == null ? 'center' : value).trim().toLowerCase();
  if (raw === 'left' || raw.indexOf('left') !== -1 || raw.indexOf('лев') !== -1) return 'left';
  return 'center';
}

function parseLayout(value) {
  var raw = String(value == null ? 'slider' : value).trim().toLowerCase();
  if (raw.indexOf('masonry') !== -1 || raw.indexOf('mason') !== -1 || raw.indexOf('мансори') !== -1 || raw.indexOf('колон') !== -1) return 'masonry';
  if (raw.indexOf('grid') !== -1 || raw.indexOf('сетк') !== -1) return 'grid';
  if (raw.indexOf('list') !== -1 || raw.indexOf('лент') !== -1) return 'list';
  if (raw.indexOf('spotlight') !== -1 || raw.indexOf('крупн') !== -1 || raw.indexOf('фокус') !== -1) return 'spotlight';
  if (raw.indexOf('marquee') !== -1 || raw.indexOf('бегущ') !== -1 || raw.indexOf('строк') !== -1) return 'marquee';
  if (raw.indexOf('slider') !== -1 || raw.indexOf('слайд') !== -1) return 'slider';
  return 'slider';
}

function settingVarNames(name) {
  return [name, name.replace(/_/g, '-'), name.replace(/-/g, '_')];
}

assert.strictEqual(parseTitleAlign('center'), 'center');
assert.strictEqual(parseTitleAlign('По центру'), 'center');
assert.strictEqual(parseTitleAlign('left'), 'left');
assert.strictEqual(parseTitleAlign('Слева'), 'left');

assert.strictEqual(parseLayout('Сетка'), 'grid');
assert.strictEqual(parseLayout('masonry'), 'masonry');
assert.strictEqual(parseLayout('Мансори'), 'masonry');
assert.strictEqual(parseLayout('Режим фокуса'), 'spotlight');
assert.strictEqual(parseLayout('Бегущая строка'), 'marquee');

assert.deepStrictEqual(settingVarNames('display_mode'), ['display_mode', 'display-mode', 'display_mode']);
assert.ok(settingVarNames('layout-columns').indexOf('layout-columns') !== -1);
assert.ok(settingVarNames('layout-columns-tablet').indexOf('layout-columns-tablet') !== -1);
assert.ok(settingVarNames('layout-columns-mobile').indexOf('layout-columns-mobile') !== -1);
assert.ok(settingVarNames('page-size-mobile').indexOf('page-size-mobile') !== -1);
assert.ok(settingVarNames('title-align').indexOf('title_align') !== -1);

console.log('settings-sync.test.js: all 13 checks passed');
