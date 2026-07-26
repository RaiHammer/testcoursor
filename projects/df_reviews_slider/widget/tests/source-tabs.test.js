/**
 * Source tab logic tests (no "all" tab — owner decision 2026-07-13).
 * Run: node widget/tests/source-tabs.test.js
 */

var assert = require('assert');

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

function applySourceVisibilityFlags(source, slideSource, tabsEnabled) {
  if (!tabsEnabled) return true;
  if (!source) return true;
  return slideSource === source;
}

function parseInsalesPrefetchLimit(settings, pageSize) {
  var raw = settings['insales-prefetch-limit'];
  if (raw == null) raw = settings.insales_prefetch_limit;
  var n = parseInt(String(raw != null ? raw : pageSize), 10);
  if (isNaN(n)) n = pageSize;
  return Math.min(50, Math.max(3, n));
}

assert.deepStrictEqual(visibleSourceTabs(true, false, false, true), ['insales', 'yandex']);
assert.deepStrictEqual(visibleSourceTabs(true, true, false, true), ['yandex']);
assert.deepStrictEqual(visibleSourceTabs(true, false, true, true), ['insales']);
assert.deepStrictEqual(visibleSourceTabs(true, false, false, false), ['yandex']);
assert.deepStrictEqual(visibleSourceTabs(false, false, false, true), []);
assert.deepStrictEqual(visibleSourceTabs(true, true, true, true), []);

assert.strictEqual(defaultActiveTab(['insales', 'yandex']), 'yandex');
assert.strictEqual(defaultActiveTab(['yandex']), 'yandex');
assert.strictEqual(defaultActiveTab([]), null);

assert.strictEqual(applySourceVisibilityFlags('insales', 'insales', true), true);
assert.strictEqual(applySourceVisibilityFlags('insales', 'yandex', true), false);
assert.strictEqual(applySourceVisibilityFlags(null, 'yandex', false), true);
assert.strictEqual(applySourceVisibilityFlags('yandex', 'yandex', true), true);

assert.strictEqual(parseInsalesPrefetchLimit({}, 12), 12);
assert.strictEqual(parseInsalesPrefetchLimit({ 'insales-prefetch-limit': 20 }, 12), 20);
assert.strictEqual(parseInsalesPrefetchLimit({ 'insales-prefetch-limit': 2 }, 12), 3);
assert.strictEqual(parseInsalesPrefetchLimit({ 'insales-prefetch-limit': 99 }, 12), 50);

function shouldShowTabCounts(layout) {
  return layout === 'masonry';
}

function usesFloatingActions(layout) {
  return layout === 'masonry' || layout === 'grid';
}

assert.strictEqual(shouldShowTabCounts('masonry'), true);
assert.strictEqual(shouldShowTabCounts('grid'), false);
assert.strictEqual(shouldShowTabCounts('slider'), false);
assert.strictEqual(usesFloatingActions('masonry'), true);
assert.strictEqual(usesFloatingActions('grid'), true);
assert.strictEqual(usesFloatingActions('slider'), false);
assert.strictEqual(usesFloatingActions('spotlight'), false);
assert.strictEqual(usesFloatingActions('marquee'), false);
assert.strictEqual(usesFloatingActions('list'), false);

function shouldDeferYandexMount(tabsEnabled, defaultTab) {
  if (!tabsEnabled) return false;
  return defaultTab !== 'yandex';
}

function resolveYandexSlideCount(domCount, storedCount, fragmentCount) {
  if (domCount > 0) return domCount;
  if (storedCount > 0) return storedCount;
  return fragmentCount || 0;
}

assert.strictEqual(shouldDeferYandexMount(true, 'insales'), true);
assert.strictEqual(shouldDeferYandexMount(true, 'yandex'), false);
assert.strictEqual(shouldDeferYandexMount(false, 'insales'), false);
assert.strictEqual(shouldDeferYandexMount(true, 'yandex'), false);

assert.strictEqual(resolveYandexSlideCount(5, 0, 0), 5);
assert.strictEqual(resolveYandexSlideCount(0, 12, 0), 12);
assert.strictEqual(resolveYandexSlideCount(0, 0, 8), 8);
assert.strictEqual(resolveYandexSlideCount(0, 0, 0), 0);

function estimateInitialDomSlideCount(insalesVisible, yandexTotal, deferYandex) {
  return insalesVisible + (deferYandex ? 0 : yandexTotal);
}

function assertDomBudgetWithin(initialInsales, yandexTotal, deferYandex, maxExtra) {
  var budget = estimateInitialDomSlideCount(initialInsales, yandexTotal, deferYandex);
  return budget <= initialInsales + maxExtra;
}

assert.strictEqual(estimateInitialDomSlideCount(2, 12, true), 2);
assert.strictEqual(estimateInitialDomSlideCount(2, 12, false), 14);
assert.strictEqual(estimateInitialDomSlideCount(3, 8, true), 3);
assert.strictEqual(assertDomBudgetWithin(2, 50, true, 0), true);
assert.strictEqual(assertDomBudgetWithin(2, 50, false, 50), true);

console.log('source-tabs.test.js: all 38 checks passed');
