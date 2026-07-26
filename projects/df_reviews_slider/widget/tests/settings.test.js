/**
 * Unit tests for widget settings parsing and visibility rules.
 * Run: node widget/tests/settings.test.js
 */

var assert = require('assert');

function parseBool(value, defaultOn) {
  if (value === undefined || value === null) {
    return !!defaultOn;
  }
  var normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off' || normalized === '') return false;
  return !!defaultOn;
}

function resolveHideFlag(attrs, hideKey) {
  if (!Object.prototype.hasOwnProperty.call(attrs, hideKey)) {
    return false;
  }
  return parseBool(attrs[hideKey], false);
}

assert.strictEqual(resolveHideFlag({ hide_source: 'true' }, 'hide_source'), true);
assert.strictEqual(resolveHideFlag({ hide_source: 'false' }, 'hide_source'), false);
assert.strictEqual(resolveHideFlag({}, 'hide_source'), false);

function parseInsalesPrefetchLimit(raw, pageSize) {
  var n = parseInt(String(raw != null ? raw : pageSize), 10);
  if (isNaN(n)) n = pageSize;
  return Math.min(50, Math.max(1, n));
}

assert.strictEqual(parseInsalesPrefetchLimit(null, 1), 1);
assert.strictEqual(parseInsalesPrefetchLimit(20, 1), 20);
assert.strictEqual(parseInsalesPrefetchLimit(0, 1), 1);

function isInsalesShopReviewUrl(url) {
  var value = String(url || '').trim().toLowerCase();
  if (!value) return false;
  return value === '/product/shop-reviews' || value.indexOf('/product/shop-reviews?') === 0;
}

assert.strictEqual(isInsalesShopReviewUrl('/product/shop-reviews'), true);
assert.strictEqual(isInsalesShopReviewUrl('/blogs/shop-reviews'), false);
assert.strictEqual(isInsalesShopReviewUrl('/product/hoodie'), false);
assert.strictEqual(isInsalesShopReviewUrl(''), false);

console.log('settings.test.js: all 10 checks passed');
