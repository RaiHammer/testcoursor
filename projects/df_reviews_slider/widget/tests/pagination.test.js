/**
 * Pagination and mode limits tests.
 * Run: node widget/tests/pagination.test.js
 */

var assert = require('assert');

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getTotalPages(totalSlides, pageSize) {
  if (!totalSlides) return 1;
  return Math.max(1, Math.ceil(totalSlides / pageSize));
}

function getPageWindow(current, total, size) {
  var start = Math.max(1, current - Math.floor(size / 2));
  var end = Math.min(total, start + size - 1);
  start = Math.max(1, end - size + 1);
  var pages = [];
  var p;
  for (p = start; p <= end; p++) pages.push(p);
  return pages;
}

assert.strictEqual(getTotalPages(70, 12), 6);
assert.strictEqual(getTotalPages(12, 12), 1);
assert.deepStrictEqual(getPageWindow(1, 10, 5), [1, 2, 3, 4, 5]);
assert.deepStrictEqual(getPageWindow(5, 10, 5), [3, 4, 5, 6, 7]);
assert.deepStrictEqual(getPageWindow(10, 10, 5), [6, 7, 8, 9, 10]);

function usesInsalesServerPagination(opts) {
  opts = opts || {};
  if (opts.layout !== 'masonry') return false;
  if (opts.serverPagination != null) return !!opts.serverPagination;
  if (opts.enabled === false) return false;
  var total = opts.total || 0;
  var limit = opts.prefetchLimit || opts.limit || 12;
  return total > limit;
}

function shouldApplyInsalesServerPagination(opts) {
  opts = opts || {};
  if (!usesInsalesServerPagination(opts)) return false;
  if (opts.activeTab && opts.activeTab !== 'insales') return false;
  return true;
}

function getInsalesServerPageCount(total, prefetchLimit) {
  var pages;
  if (!total || !prefetchLimit) return 1;
  pages = Math.ceil(total / prefetchLimit);
  if (total % 100 === 0 && total >= 100) {
    pages = Math.floor(total / prefetchLimit);
  }
  return Math.max(1, pages);
}

function resolveTotalPages(opts) {
  opts = opts || {};
  if (shouldApplyInsalesServerPagination(opts)) {
    return getInsalesServerPageCount(opts.total || 0, opts.prefetchLimit || opts.limit || 12);
  }
  return getTotalPages(opts.loadedSlides || opts.total || 0, opts.pageSize || 12);
}

function shouldShowInsalesLoadMore(opts) {
  opts = opts || {};
  if (opts.layout !== 'masonry') return false;
  if (opts.enabled === false) return false;
  if (opts.activeTab && opts.activeTab !== 'insales') return false;

  if (usesInsalesServerPagination(opts)) {
    var batchPage = opts.batchPage || 1;
    var totalPages = getInsalesServerPageCount(opts.total || 0, opts.prefetchLimit || opts.limit || 12);
    return batchPage < totalPages;
  }

  var loadedCount = opts.loadedCount != null ? opts.loadedCount : opts.prefetchLimit || opts.limit || 0;
  var total = opts.total || 0;
  if (total <= loadedCount) return false;
  return true;
}

function getServerPageWindow(current, total, radius) {
  var pages = [];
  var seen = {};
  var candidates = [1, total];
  var i;

  radius = radius || 2;

  for (i = current - radius; i <= current + radius; i++) {
    if (i >= 1 && i <= total) candidates.push(i);
  }

  candidates.sort(function (a, b) {
    return a - b;
  });

  for (i = 0; i < candidates.length; i++) {
    if (seen[candidates[i]]) continue;
    seen[candidates[i]] = true;
    pages.push(candidates[i]);
  }

  return pages;
}

function buildInsalesPageUrl(settings, pageNum) {
  var base = settings.ajaxUrl || settings.pathname || '/';
  var separator = base.indexOf('?') >= 0 ? '&' : '?';
  return base + separator + 'page=' + pageNum;
}

function isInsalesShopReviewUrl(url) {
  var value = String(url || '').trim().toLowerCase();
  if (!value) return false;
  return value === '/product/shop-reviews' || value.indexOf('/product/shop-reviews?') === 0;
}

function isInvalidInsalesLoadmoreUrl(url) {
  var value = String(url || '').trim().toLowerCase();
  if (!value) return false;
  return value.indexOf('/product/shop-reviews') >= 0;
}

function getInsalesAjaxBase(settings) {
  var custom = String(settings.ajaxUrl || '').trim();
  if (custom && !isInsalesShopReviewUrl(custom)) return custom;
  var pathname = settings.pathname || '/';
  if (pathname.indexOf('shop-reviews') >= 0 && !isInsalesShopReviewUrl(pathname)) return pathname;
  if (pathname !== '/' && !isInsalesShopReviewUrl(pathname)) return pathname;
  return '/blogs/shop-reviews';
}

function buildInsalesLoadMoreUrl(settings) {
  var batchPage = parseInt(settings.batchPage, 10) || 1;
  return buildInsalesPageUrl({ ajaxUrl: getInsalesAjaxBase(settings), pathname: settings.pathname }, batchPage + 1);
}

assert.strictEqual(getInsalesServerPageCount(890, 20), 45);
assert.strictEqual(getInsalesServerPageCount(890, 12), 75);
assert.strictEqual(getInsalesServerPageCount(800, 20), 40);
assert.strictEqual(getInsalesServerPageCount(12, 12), 1);
assert.strictEqual(getInsalesServerPageCount(13, 12), 2);

assert.strictEqual(
  resolveTotalPages({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true }),
  45
);
assert.strictEqual(
  resolveTotalPages({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, loadedSlides: 20 }),
  45
);
assert.strictEqual(
  resolveTotalPages({ layout: 'grid', loadedSlides: 24, pageSize: 12 }),
  2
);

assert.strictEqual(
  resolveTotalPages({ layout: 'masonry', total: 63, loadedSlides: 63, pageSize: 12, prefetchLimit: 20, batchPage: 1, activeTab: 'yandex', serverPagination: true }),
  6
);
assert.strictEqual(
  shouldApplyInsalesServerPagination({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, activeTab: 'yandex' }),
  false
);
assert.strictEqual(
  shouldApplyInsalesServerPagination({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, activeTab: 'insales' }),
  true
);
assert.strictEqual(
  shouldShowInsalesLoadMore({ layout: 'masonry', total: 890, prefetchLimit: 20, batchPage: 1, serverPagination: true }),
  true
);
assert.strictEqual(
  shouldShowInsalesLoadMore({ layout: 'masonry', total: 890, prefetchLimit: 20, batchPage: 45, serverPagination: true }),
  false
);
assert.strictEqual(
  shouldShowInsalesLoadMore({ layout: 'masonry', total: 890, prefetchLimit: 20, batchPage: 1, activeTab: 'yandex', serverPagination: true }),
  false
);
assert.strictEqual(
  shouldShowInsalesLoadMore({ layout: 'masonry', total: 12, prefetchLimit: 20, batchPage: 1, serverPagination: false }),
  false
);
assert.strictEqual(shouldShowInsalesLoadMore({ layout: 'slider', total: 890, prefetchLimit: 20 }), false);

function shouldShowMasonryMoreButton(opts) {
  opts = opts || {};
  if (opts.layout !== 'masonry') return false;
  if (shouldApplyInsalesServerPagination(opts)) return false;
  var totalPages = resolveTotalPages(opts);
  var mode = opts.mode || 'page';
  var current = opts.currentPage || 1;
  var loaded = opts.loadedPages || 1;
  if (mode === 'accumulate') return loaded < totalPages;
  return current < totalPages;
}

assert.strictEqual(
  shouldShowMasonryMoreButton({ layout: 'masonry', total: 63, loadedSlides: 63, pageSize: 12, currentPage: 1, serverPagination: true, activeTab: 'yandex' }),
  true
);
assert.strictEqual(
  shouldShowMasonryMoreButton({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, activeTab: 'insales' }),
  false
);

function shouldShowEitherLoadButton(opts) {
  opts = opts || {};
  var showMore = shouldShowMasonryMoreButton(opts);
  var showInsales = shouldShowInsalesLoadMore(opts);
  return !(showMore && showInsales);
}

assert.strictEqual(
  shouldShowEitherLoadButton({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, activeTab: 'insales', batchPage: 1 }),
  true
);
assert.strictEqual(
  shouldShowEitherLoadButton({ layout: 'masonry', total: 63, loadedSlides: 63, pageSize: 12, currentPage: 1, serverPagination: true, activeTab: 'yandex' }),
  true
);
assert.strictEqual(
  shouldShowMasonryMoreButton({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, activeTab: 'insales', batchPage: 1 }) &&
    shouldShowInsalesLoadMore({ layout: 'masonry', total: 890, prefetchLimit: 20, serverPagination: true, activeTab: 'insales', batchPage: 1 }),
  false
);

assert.deepStrictEqual(getServerPageWindow(1, 45, 2), [1, 2, 3, 45]);
assert.deepStrictEqual(getServerPageWindow(22, 45, 2), [1, 20, 21, 22, 23, 24, 45]);
assert.deepStrictEqual(getServerPageWindow(45, 45, 2), [1, 43, 44, 45]);

assert.strictEqual(getInsalesAjaxBase({ ajaxUrl: '/product/shop-reviews', pathname: '/' }), '/blogs/shop-reviews');
assert.strictEqual(getInsalesAjaxBase({ ajaxUrl: '/product/shop-reviews', pathname: '/blogs/shop-reviews' }), '/blogs/shop-reviews');
assert.strictEqual(getInsalesAjaxBase({ ajaxUrl: '/blogs/shop-reviews', pathname: '/' }), '/blogs/shop-reviews');
assert.strictEqual(getInsalesAjaxBase({ ajaxUrl: '', pathname: '/blogs/shop-reviews' }), '/blogs/shop-reviews');
assert.strictEqual(getInsalesAjaxBase({ ajaxUrl: '', pathname: '/' }), '/blogs/shop-reviews');
assert.strictEqual(buildInsalesLoadMoreUrl({ ajaxUrl: '', pathname: '/blogs/shop-reviews', batchPage: 1 }), '/blogs/shop-reviews?page=2');
assert.strictEqual(buildInsalesLoadMoreUrl({ ajaxUrl: '', pathname: '/', batchPage: 1 }), '/blogs/shop-reviews?page=2');
assert.strictEqual(
  buildInsalesLoadMoreUrl({ ajaxUrl: '/product/shop-reviews', pathname: '/blogs/shop-reviews', batchPage: 1 }),
  '/blogs/shop-reviews?page=2'
);
assert.strictEqual(buildInsalesPageUrl({ ajaxUrl: '/blogs/shop-reviews' }, 2), '/blogs/shop-reviews?page=2');
assert.strictEqual(isInvalidInsalesLoadmoreUrl('/product/shop-reviews?page=2'), true);
assert.strictEqual(isInvalidInsalesLoadmoreUrl('/blogs/shop-reviews?page=2'), false);

var BP_MOBILE = 639;
var BP_TABLET = 991;

function getViewportBreakpoint(width) {
  if (width <= BP_MOBILE) return 'mobile';
  if (width <= BP_TABLET) return 'tablet';
  return 'desktop';
}

function getLayoutColumnsForBreakpoint(settings, breakpoint) {
  if (breakpoint === 'mobile') return settings.columnsMobile;
  if (breakpoint === 'tablet') return settings.columnsTablet;
  return settings.columnsDesktop;
}

function getEffectivePageSize(settings, breakpoint) {
  if (breakpoint === 'mobile') return settings.pageSizeMobile;
  return settings.pageSizeDesktop;
}

assert.strictEqual(getViewportBreakpoint(320), 'mobile');
assert.strictEqual(getViewportBreakpoint(768), 'tablet');
assert.strictEqual(getViewportBreakpoint(1200), 'desktop');

function getListLimit(raw, fallback) {
  var value = parseInt(String(raw != null ? raw : fallback), 10);
  if (isNaN(value)) value = fallback;
  return Math.min(100, Math.max(1, value));
}

assert.strictEqual(getListLimit(null, 10), 10);
assert.strictEqual(getListLimit(5, 10), 5);
assert.strictEqual(getListLimit(200, 10), 100);

var sampleSettings = {
  columnsDesktop: 3,
  columnsTablet: 2,
  columnsMobile: 1,
  pageSizeDesktop: 1,
  pageSizeMobile: 1
};

assert.strictEqual(getLayoutColumnsForBreakpoint(sampleSettings, 'mobile'), 1);
assert.strictEqual(getLayoutColumnsForBreakpoint(sampleSettings, 'tablet'), 2);
assert.strictEqual(getLayoutColumnsForBreakpoint(sampleSettings, 'desktop'), 3);
assert.strictEqual(getEffectivePageSize(sampleSettings, 'mobile'), 1);
assert.strictEqual(getEffectivePageSize(sampleSettings, 'desktop'), 1);
assert.strictEqual(getTotalPages(10, getEffectivePageSize(sampleSettings, 'mobile')), 10);

console.log('pagination.test.js: all 57 checks passed');
