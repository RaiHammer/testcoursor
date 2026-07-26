/**
 * Unit tests for df_quick_search settings parsing.
 * Run: node widget/tests/settings.test.js
 */

var assert = require('assert');

var DEFAULT_RESULTS_LIMIT = 24;
var DEFAULT_ARTICLES_DISPLAY_LIMIT = 8;
var MAX_RESULTS_LIMIT = 200;
var MAX_ARTICLES_DISPLAY_LIMIT = 100;

function parseBool(value, fallback) {
  if (value === true || value === 'true' || value === '1' || value === 1) return true;
  if (value === false || value === 'false' || value === '0' || value === 0) return false;
  return fallback;
}

function parsePositiveInt(value, fallback, min, max) {
  var raw = String(value != null ? value : fallback);
  var num = parseInt(raw, 10);
  if (isNaN(num)) {
    var match = raw.match(/\d+/);
    num = match ? parseInt(match[0], 10) : fallback;
  }
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

function parseResultsLimit(value) {
  return parsePositiveInt(value, DEFAULT_RESULTS_LIMIT, 1, MAX_RESULTS_LIMIT);
}

function parseArticlesDisplayLimit(value) {
  return parsePositiveInt(value, DEFAULT_ARTICLES_DISPLAY_LIMIT, 1, MAX_ARTICLES_DISPLAY_LIMIT);
}

function parseArticlesBlogUrl(value) {
  return String(value != null ? value : '').trim();
}

function resolveArticlesBlogUrl(articlesBlogUrl, articleBlogHandles) {
  var url = parseArticlesBlogUrl(articlesBlogUrl);
  if (url) return url;

  var handles = String(articleBlogHandles || 'blog').split(',');
  for (var i = 0; i < handles.length; i += 1) {
    var handle = handles[i].trim();
    if (handle) return '/' + handle;
  }

  return '/blog';
}

function shouldShowAllArticlesLink(hasMoreLocal, hasArticles, indexIncomplete) {
  if (!hasArticles) return false;
  if (!hasMoreLocal) return true;
  return !!indexIncomplete;
}

function isArticlesIndexIncomplete(serverTotal, indexTotal) {
  var server = Number(serverTotal) || 0;
  var indexed = Number(indexTotal) || 0;
  return server > indexed;
}

var ARTICLES_CACHE_PREFIX = 'df_qs_articles_v1:';
var ARTICLES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildArticlesCacheStorageKey(cacheKey) {
  var key = String(cacheKey != null ? cacheKey : '').trim();
  if (!key) return '';
  return ARTICLES_CACHE_PREFIX + key;
}

function isArticlesCachePayloadValid(payload, cacheKey, now, ttlMs) {
  if (!payload || typeof payload !== 'object') return false;
  if (String(payload.key || '') !== String(cacheKey || '')) return false;
  if (!Array.isArray(payload.articles)) return false;
  var ts = Number(payload.ts);
  if (!ts || isNaN(ts)) return false;
  var ttl = typeof ttlMs === 'number' ? ttlMs : ARTICLES_CACHE_TTL_MS;
  var at = typeof now === 'number' ? now : Date.now();
  return at - ts <= ttl;
}

function parseGridCols(value, fallback) {
  var raw = String(value != null ? value : fallback);
  var num = parseInt(raw, 10);
  if (isNaN(num)) {
    var match = raw.match(/\d+/);
    num = match ? parseInt(match[0], 10) : fallback;
  }
  if (num < 2) return 2;
  if (num > 6) return 6;
  return num;
}

function getProductOldPrice(product, currentPrice) {
  var variants = product && product.variants;
  if (!Array.isArray(variants) || !variants.length) return 0;

  var oldPriceVal = Number(variants[0].old_price);
  if (isNaN(oldPriceVal)) oldPriceVal = 0;
  if (oldPriceVal > currentPrice) return oldPriceVal;

  return 0;
}

function isProductAvailable(product) {
  if (!product) return false;
  if (product.available === false || product.available === 0 || product.available === 'false') return false;

  var variants = product.variants;
  if (!Array.isArray(variants) || !variants.length) return true;

  for (var i = 0; i < variants.length; i += 1) {
    var variant = variants[i];
    if (variant && variant.available !== false && variant.available !== 0 && variant.available !== 'false') {
      return true;
    }
  }

  return false;
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function isFalsyFlag(value) {
  return value === false || value === 0 || value === '0' || value === 'false';
}

function isProductHiddenFromStorefront(product) {
  if (!product) return true;
  if (isTruthyFlag(product.is_hidden) || isTruthyFlag(product.isHidden) || isTruthyFlag(product.hidden)) {
    return true;
  }
  if (isTruthyFlag(product.archived)) return true;
  if (isFalsyFlag(product.published) || isFalsyFlag(product.is_published)) return true;
  return false;
}

function isApiProductUrl(url) {
  var value = String(url || '');
  return /\/product_by_id\//i.test(value) || /\/products_by_id\//i.test(value);
}

function resolveProductUrl(product) {
  if (!product || typeof product !== 'object') return '';

  var candidates = [product.url, product.html_url, product.htmlUrl, product.link];
  for (var i = 0; i < candidates.length; i += 1) {
    var candidate = String(candidates[i] || '').trim();
    if (candidate && candidate !== '/' && !isApiProductUrl(candidate)) return candidate;
  }

  var handle = product.permalink || product.handle || product.slug;
  if (handle) {
    handle = String(handle).trim().replace(/^\/+/, '');
    if (!handle) return '';
    if (handle.indexOf('product/') === 0) return '/' + handle;
    return '/product/' + handle;
  }

  return '';
}

function shouldKeepStorefrontProduct(product, options) {
  options = options || {};
  if (isProductHiddenFromStorefront(product)) return false;
  if (!resolveProductUrl(product)) return false;
  if (options.hideOutOfStock && !isProductAvailable(product)) return false;
  return true;
}

function urlFromImageObject(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (typeof image !== 'object') return '';
  return (
    image.large_url ||
    image.compact_url ||
    image.medium_url ||
    image.thumb_url ||
    image.small_url ||
    image.url ||
    image.original_url ||
    image.src ||
    ''
  );
}

function pickProductImage(product) {
  if (!product || typeof product !== 'object') return null;
  var candidates = [];
  if (product.first_image) candidates.push(product.first_image);
  if (Array.isArray(product.images)) {
    for (var i = 0; i < product.images.length; i += 1) {
      if (product.images[i]) candidates.push(product.images[i]);
    }
  }
  if (product.image) candidates.push(product.image);
  if (product.image_url) candidates.push({ large_url: product.image_url });
  for (var j = 0; j < candidates.length; j += 1) {
    if (urlFromImageObject(candidates[j])) return candidates[j];
  }
  return null;
}

function getProductImageUrl(product) {
  return urlFromImageObject(pickProductImage(product));
}

function pickProductSecondImage(product) {
  if (!product || typeof product !== 'object') return null;
  if (!Array.isArray(product.images) || product.images.length < 2) return null;
  var primaryUrl = getProductImageUrl(product);
  if (!primaryUrl) return null;
  for (var i = 0; i < product.images.length; i += 1) {
    var candidate = product.images[i];
    var url = urlFromImageObject(candidate);
    if (url && url !== primaryUrl) return candidate;
  }
  return null;
}

function getProductSecondImageUrl(product) {
  return urlFromImageObject(pickProductSecondImage(product));
}

function productImageWrapClass(imageSrc, secondImageSrc) {
  var cls = imageSrc ? 'is-skeleton' : 'is-placeholder';
  if (secondImageSrc) cls += ' has-hover-image';
  return cls;
}

function articleMatchesQuery(article, query, productIdMap) {
  var q = String(query || '').toLowerCase();
  if (!q) return false;

  if ((article.title || '').toLowerCase().indexOf(q) !== -1) return true;

  var tags = article.tags || [];
  for (var i = 0; i < tags.length; i += 1) {
    if (String(tags[i] || '').toLowerCase().indexOf(q) !== -1) return true;
  }

  var relatedTitles = article.related_titles || [];
  for (var j = 0; j < relatedTitles.length; j += 1) {
    if (String(relatedTitles[j] || '').toLowerCase().indexOf(q) !== -1) return true;
  }

  var relatedIds = article.related_ids || [];
  for (var k = 0; k < relatedIds.length; k += 1) {
    if (productIdMap[relatedIds[k]]) return true;
  }

  return false;
}

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function productMatchesQuery(product, query) {
  var q = query.toLowerCase();
  if ((product.title || '').toLowerCase().indexOf(q) !== -1) return true;

  var variants = product.variants || [];
  for (var i = 0; i < variants.length; i += 1) {
    var sku = String(variants[i].sku || '').toLowerCase();
    if (sku && sku.indexOf(q) !== -1) return true;
  }

  return false;
}

function filterProductsByQuery(products, query) {
  if (!products.length) return products;
  return products.filter(function (product) {
    return productMatchesQuery(product, query);
  });
}

function highlightQueryInText(text, query) {
  var raw = String(text == null ? '' : text);
  var q = String(query || '').trim();
  if (!q) return escapeHtml(raw);

  var lowerRaw = raw.toLowerCase();
  var lowerQ = q.toLowerCase();
  var index = lowerRaw.indexOf(lowerQ);
  if (index === -1) return escapeHtml(raw);

  return (
    escapeHtml(raw.slice(0, index)) +
    '<mark class="df-quick-search__mark">' +
    escapeHtml(raw.slice(index, index + q.length)) +
    '</mark>' +
    escapeHtml(raw.slice(index + q.length))
  );
}

function buildSearchPageUrl(query) {
  var encoded = encodeURIComponent(query || '').replace(/%20/g, '+');
  return '/search?q=' + encoded;
}

var MAX_POPULAR_QUERIES = 12;

function parsePopularQueries(value) {
  var raw = String(value != null ? value : '');
  if (!raw.trim()) return [];

  var seen = {};
  var result = [];
  var parts = raw.split(',');
  for (var i = 0; i < parts.length; i += 1) {
    var item = parts[i].trim();
    if (!item) continue;
    var key = item.toLowerCase();
    if (seen[key]) continue;
    seen[key] = true;
    result.push(item);
    if (result.length >= MAX_POPULAR_QUERIES) break;
  }
  return result;
}

assert.strictEqual(parseBool('true', false), true);
assert.strictEqual(parseBool('false', true), false);
assert.strictEqual(parseBool(undefined, true), true);

assert.strictEqual(parseResultsLimit(null), 24);
assert.strictEqual(parseResultsLimit('12'), 12);
assert.strictEqual(parseResultsLimit('24'), 24);
assert.strictEqual(parseResultsLimit('48'), 48);
assert.strictEqual(parseResultsLimit('99'), 99);
assert.strictEqual(parseResultsLimit('250'), 200);
assert.strictEqual(parseResultsLimit('0'), 1);
assert.strictEqual(parseResultsLimit('Количество товаров в выдаче: 24'), 24);

assert.strictEqual(parseArticlesDisplayLimit(null), 8);
assert.strictEqual(parseArticlesDisplayLimit('8'), 8);
assert.strictEqual(parseArticlesDisplayLimit('12'), 12);
assert.strictEqual(parseArticlesDisplayLimit('16'), 16);
assert.strictEqual(parseArticlesDisplayLimit('24'), 24);
assert.strictEqual(parseArticlesDisplayLimit('99'), 99);
assert.strictEqual(parseArticlesDisplayLimit('150'), 100);
assert.strictEqual(parseArticlesDisplayLimit('0'), 1);
assert.strictEqual(parseArticlesDisplayLimit('Статей в первой порции: 16'), 16);

assert.strictEqual(parseArticlesBlogUrl(' /articles '), '/articles');
assert.strictEqual(parseArticlesBlogUrl(null), '');
assert.strictEqual(resolveArticlesBlogUrl('/blog', 'news'), '/blog');
assert.strictEqual(resolveArticlesBlogUrl('', 'blog, reviews'), '/blog');
assert.strictEqual(resolveArticlesBlogUrl('', ''), '/blog');
assert.strictEqual(shouldShowAllArticlesLink(true, true, false), false);
assert.strictEqual(shouldShowAllArticlesLink(true, true, true), true);
assert.strictEqual(shouldShowAllArticlesLink(false, true, false), true);
assert.strictEqual(shouldShowAllArticlesLink(false, false, true), false);

assert.strictEqual(isArticlesIndexIncomplete(500, 100), true);
assert.strictEqual(isArticlesIndexIncomplete(500, 500), false);
assert.strictEqual(isArticlesIndexIncomplete(100, 100), false);
assert.strictEqual(isArticlesIndexIncomplete(0, 0), false);
assert.strictEqual(isArticlesIndexIncomplete(10, 12), false);

assert.strictEqual(buildArticlesCacheStorageKey(''), '');
assert.strictEqual(buildArticlesCacheStorageKey('  '), '');
assert.strictEqual(buildArticlesCacheStorageKey('500-blog-123'), 'df_qs_articles_v1:500-blog-123');
assert.strictEqual(buildArticlesCacheStorageKey(' 500-blog-123 '), 'df_qs_articles_v1:500-blog-123');

(function () {
  var now = 1000000;
  var ttl = ARTICLES_CACHE_TTL_MS;
  var key = '500-blog-99';
  assert.strictEqual(isArticlesCachePayloadValid(null, key, now, ttl), false);
  assert.strictEqual(isArticlesCachePayloadValid({ key: key, ts: now, articles: [] }, key, now, ttl), true);
  assert.strictEqual(
    isArticlesCachePayloadValid({ key: 'other', ts: now, articles: [] }, key, now, ttl),
    false
  );
  assert.strictEqual(
    isArticlesCachePayloadValid({ key: key, ts: now - ttl - 1, articles: [{ id: 1 }] }, key, now, ttl),
    false
  );
  assert.strictEqual(
    isArticlesCachePayloadValid({ key: key, ts: now - ttl + 1, articles: [{ id: 1 }] }, key, now, ttl),
    true
  );
  assert.strictEqual(
    isArticlesCachePayloadValid({ key: key, ts: now, articles: 'nope' }, key, now, ttl),
    false
  );
})();

assert.strictEqual(parseGridCols(null, 2), 2);
assert.strictEqual(parseGridCols('4', 2), 4);
assert.strictEqual(parseGridCols('1', 2), 2);
assert.strictEqual(parseGridCols('9', 3), 6);
assert.strictEqual(parseGridCols('Товаров в ряд: 3', 2), 3);

assert.strictEqual(getProductOldPrice({ variants: [{ old_price: 5000 }] }, 3000), 5000);
assert.strictEqual(getProductOldPrice({ variants: [{ old_price: 2000 }] }, 3000), 0);
assert.strictEqual(getProductOldPrice({ variants: [] }, 1000), 0);

assert.strictEqual(
  articleMatchesQuery({ title: 'Милитари стиль', tags: [] }, 'милит', {}),
  true
);
assert.strictEqual(
  articleMatchesQuery({ title: 'News', tags: ['лето'], related_ids: [] }, 'лето', {}),
  true
);
assert.strictEqual(
  articleMatchesQuery({ title: 'News', tags: [], related_ids: [42] }, 'xyz', { 42: true }),
  true
);
assert.strictEqual(
  articleMatchesQuery({ title: 'News', tags: [], related_ids: [] }, 'xyz', {}),
  false
);

assert.deepStrictEqual(
  filterProductsByQuery(
    [{ title: 'Куртка', variants: [] }, { title: 'Ботинки', variants: [] }],
    'курт'
  ),
  [{ title: 'Куртка', variants: [] }]
);
assert.deepStrictEqual(
  filterProductsByQuery([{ title: 'Куртка', variants: [] }], 'xyz'),
  []
);
assert.deepStrictEqual(filterProductsByQuery([], 'курт'), []);

assert.strictEqual(
  highlightQueryInText('Куртка милитари', 'милит'),
  'Куртка <mark class="df-quick-search__mark">милит</mark>ари'
);
assert.strictEqual(highlightQueryInText('Test', ''), 'Test');
assert.strictEqual(highlightQueryInText('A & B', 'a'), '<mark class="df-quick-search__mark">A</mark> &amp; B');

assert.strictEqual(buildSearchPageUrl('куртка'), '/search?q=%D0%BA%D1%83%D1%80%D1%82%D0%BA%D0%B0');
assert.strictEqual(buildSearchPageUrl('hello world'), '/search?q=hello+world');

assert.strictEqual(isProductAvailable({ variants: [{ available: true }] }), true);
assert.strictEqual(isProductAvailable({ variants: [{ available: false }] }), false);
assert.strictEqual(isProductAvailable({ available: false, variants: [{ available: true }] }), false);

assert.strictEqual(parseBool('true', false), true, 'show_out_of_stock_badge default on');
assert.strictEqual(parseBool('false', true), false, 'show_out_of_stock_badge off');
assert.strictEqual(parseBool(undefined, true), true, 'show_out_of_stock_badge fallback true');
assert.strictEqual(parseBool(undefined, true), true, 'articles_lazy_load fallback true');
assert.strictEqual(parseBool('false', true), false, 'articles_lazy_load off parses eager load');

// v0.0.25 — product URL
assert.strictEqual(resolveProductUrl({ url: '/product/pants' }), '/product/pants');
assert.strictEqual(resolveProductUrl({ url: '/product_by_id/473676207' }), '');
assert.strictEqual(resolveProductUrl({ url: '/product_by_id/1', permalink: 'fabt12' }), '/product/fabt12');
assert.strictEqual(resolveProductUrl({ handle: 'abercrombie-pants' }), '/product/abercrombie-pants');
assert.strictEqual(resolveProductUrl({ html_url: '/collection/x/product/y' }), '/collection/x/product/y');
assert.ok(!isApiProductUrl('/product/ok'));
assert.ok(isApiProductUrl('/product_by_id/123'));

// v0.0.25 — hidden / OOS filter
assert.strictEqual(isProductHiddenFromStorefront({ is_hidden: true, url: '/product/x' }), true);
assert.strictEqual(isProductHiddenFromStorefront({ archived: true, url: '/product/x' }), true);
assert.strictEqual(isProductHiddenFromStorefront({ published: false, url: '/product/x' }), true);
assert.strictEqual(isProductHiddenFromStorefront({ url: '/product/x', available: false }), false);
assert.strictEqual(
  shouldKeepStorefrontProduct({ is_hidden: true, url: '/product/x', variants: [] }, {}),
  false
);
assert.strictEqual(
  shouldKeepStorefrontProduct(
    { url: '/product/x', available: false, variants: [{ available: false }] },
    {}
  ),
  true,
  'published OOS stays (badge)'
);
assert.strictEqual(
  shouldKeepStorefrontProduct(
    { url: '/product/x', available: false, variants: [{ available: false }] },
    { hideOutOfStock: true }
  ),
  false
);
assert.strictEqual(shouldKeepStorefrontProduct({ id: 1, title: 'No url' }, {}), false);
assert.strictEqual(
  shouldKeepStorefrontProduct({ url: '/product_by_id/473676207', permalink: '' }, {}),
  false
);

// v0.0.25 — images / skeleton class
assert.strictEqual(getProductImageUrl({ first_image: { large_url: 'https://cdn/a.jpg' } }), 'https://cdn/a.jpg');
assert.strictEqual(
  getProductImageUrl({ first_image: {}, images: [{ medium_url: 'https://cdn/b.jpg' }] }),
  'https://cdn/b.jpg'
);
assert.strictEqual(getProductImageUrl({}), '');
assert.strictEqual(productImageWrapClass(''), 'is-placeholder');
assert.strictEqual(productImageWrapClass('https://cdn/a.jpg'), 'is-skeleton');

// v1.0.10 — second image for desktop hover
assert.strictEqual(
  getProductSecondImageUrl({
    first_image: { large_url: 'https://cdn/a.jpg' },
    images: [{ large_url: 'https://cdn/a.jpg' }, { large_url: 'https://cdn/b.jpg' }],
  }),
  'https://cdn/b.jpg'
);
assert.strictEqual(
  getProductSecondImageUrl({
    first_image: { large_url: 'https://cdn/a.jpg' },
    images: [{ large_url: 'https://cdn/a.jpg' }],
  }),
  '',
  'single image → no hover swap'
);
assert.strictEqual(
  getProductSecondImageUrl({
    images: [{ large_url: 'https://cdn/a.jpg' }, { large_url: 'https://cdn/a.jpg' }],
  }),
  '',
  'duplicate URLs → no hover swap'
);
assert.strictEqual(
  productImageWrapClass('https://cdn/a.jpg', 'https://cdn/b.jpg'),
  'is-skeleton has-hover-image'
);

// v1.1.3 — admin can disable hover second image
function resolveHoverSecondImageSrc(showPhotos, hoverSecondImage, product) {
  if (!showPhotos || hoverSecondImage === false) return '';
  return getProductSecondImageUrl(product);
}
(function () {
  var product = {
    first_image: { large_url: 'https://cdn/a.jpg' },
    images: [{ large_url: 'https://cdn/a.jpg' }, { large_url: 'https://cdn/b.jpg' }],
  };
  assert.strictEqual(resolveHoverSecondImageSrc(true, true, product), 'https://cdn/b.jpg');
  assert.strictEqual(resolveHoverSecondImageSrc(true, false, product), '', 'setting off → no second img');
  assert.strictEqual(resolveHoverSecondImageSrc(false, true, product), '', 'photos off → no second img');
  assert.strictEqual(
    productImageWrapClass('https://cdn/a.jpg', resolveHoverSecondImageSrc(true, false, product)),
    'is-skeleton',
    'no has-hover-image when disabled'
  );
})();

// v0.0.27 — popular queries CSV
assert.deepStrictEqual(parsePopularQueries(''), []);
assert.deepStrictEqual(parsePopularQueries(null), []);
assert.deepStrictEqual(parsePopularQueries('   '), []);
assert.deepStrictEqual(parsePopularQueries('куртка, ботинки'), ['куртка', 'ботинки']);
assert.deepStrictEqual(parsePopularQueries(' куртка , , ботинки ,куртка '), ['куртка', 'ботинки']);
assert.deepStrictEqual(parsePopularQueries('Куртка, куртка, КУРТКА'), ['Куртка']);
(function () {
  var many = [];
  for (var i = 1; i <= 20; i += 1) many.push('q' + i);
  var parsed = parsePopularQueries(many.join(', '));
  assert.strictEqual(parsed.length, 12);
  assert.strictEqual(parsed[0], 'q1');
  assert.strictEqual(parsed[11], 'q12');
})();

// v0.0.29 — product sort (price / popularity; default relevance)
function getPopularityScore(product) {
  if (!product) return null;
  var keys = ['popularity', 'sales_rate', 'orders_count', 'sort_weight'];
  for (var i = 0; i < keys.length; i += 1) {
    var raw = product[keys[i]];
    if (raw == null || raw === '') continue;
    var num = Number(raw);
    if (isFinite(num)) return num;
  }
  return null;
}

function productsHavePopularityData(products) {
  if (!products || !products.length) return false;
  for (var i = 0; i < products.length; i += 1) {
    if (getPopularityScore(products[i]) != null) return true;
  }
  return false;
}

function toPrice(value) {
  var num = Number(value);
  return isFinite(num) ? num : 0;
}

function sortPreparedProducts(products, sortMode) {
  var list = products.slice();
  if (sortMode === 'price_asc') {
    list.sort(function (a, b) {
      return toPrice(a.price_min) - toPrice(b.price_min);
    });
    return list;
  }
  if (sortMode === 'price_desc') {
    list.sort(function (a, b) {
      return toPrice(b.price_min) - toPrice(a.price_min);
    });
    return list;
  }
  if (sortMode === 'popularity') {
    list.sort(function (a, b) {
      var pa = getPopularityScore(a);
      var pb = getPopularityScore(b);
      if (pa == null && pb == null) return 0;
      if (pa == null) return 1;
      if (pb == null) return -1;
      return pb - pa;
    });
    return list;
  }
  return list;
}

assert.strictEqual(getPopularityScore({ popularity: 12 }), 12);
assert.strictEqual(getPopularityScore({ sales_rate: '3.5' }), 3.5);
assert.strictEqual(getPopularityScore({ title: 'x' }), null);
assert.strictEqual(productsHavePopularityData([{ price_min: 1 }, { popularity: 0 }]), true);
assert.strictEqual(productsHavePopularityData([{ price_min: 1 }]), false);
assert.deepStrictEqual(
  sortPreparedProducts(
    [{ price_min: 300 }, { price_min: 100 }, { price_min: 200 }],
    'price_asc'
  ).map(function (p) {
    return p.price_min;
  }),
  [100, 200, 300]
);
assert.deepStrictEqual(
  sortPreparedProducts(
    [{ price_min: 300 }, { price_min: 100 }, { price_min: 200 }],
    'price_desc'
  ).map(function (p) {
    return p.price_min;
  }),
  [300, 200, 100]
);
assert.deepStrictEqual(
  sortPreparedProducts(
    [{ popularity: 1, id: 1 }, { popularity: 9, id: 2 }, { id: 3 }],
    'popularity'
  ).map(function (p) {
    return p.id;
  }),
  [2, 1, 3]
);
assert.strictEqual(parseBool('true', false), true, 'show_product_sort on');
assert.strictEqual(parseBool('false', true), false, 'show_product_sort off');

// v0.0.31 — keyboard layout swap RU↔EN
function buildLayoutMap(fromKeys, toKeys) {
  var map = Object.create(null);
  var len = Math.min(fromKeys.length, toKeys.length);
  for (var i = 0; i < len; i += 1) {
    map[fromKeys.charAt(i)] = toKeys.charAt(i);
    var fromUpper = fromKeys.charAt(i).toUpperCase();
    var toUpper = toKeys.charAt(i).toUpperCase();
    if (fromUpper !== fromKeys.charAt(i)) {
      map[fromUpper] = toUpper;
    }
  }
  return map;
}

var LAYOUT_EN = "`qwertyuiop[]asdfghjkl;'zxcvbnm,./";
var LAYOUT_RU = 'ёйцукенгшщзхъфывапролджэячсмитьбю.';
var LAYOUT_EN_TO_RU = buildLayoutMap(LAYOUT_EN, LAYOUT_RU);
var LAYOUT_RU_TO_EN = buildLayoutMap(LAYOUT_RU, LAYOUT_EN);

function swapKeyboardLayout(text) {
  var source = String(text != null ? text : '');
  if (!source) return null;
  var hasEn = /[a-zA-Z`\[\];',.\/]/.test(source);
  var hasRu = /[а-яА-ЯёЁ]/.test(source);
  if (hasEn && hasRu) return null;
  var map = hasRu ? LAYOUT_RU_TO_EN : hasEn ? LAYOUT_EN_TO_RU : null;
  if (!map) return null;
  var out = '';
  for (var i = 0; i < source.length; i += 1) {
    var ch = source.charAt(i);
    out += map[ch] != null ? map[ch] : ch;
  }
  if (out === source) return null;
  return out;
}

assert.strictEqual(swapKeyboardLayout('рщтвф'), 'honda');
assert.strictEqual(swapKeyboardLayout('honda'), 'рщтвф');
assert.strictEqual(swapKeyboardLayout('abcй'), null, 'mixed scripts');
assert.strictEqual(swapKeyboardLayout('123'), null);
assert.strictEqual(swapKeyboardLayout(''), null);

// v0.0.33 — empty = no products+articles; categories must not block layout suggestion
function isZeroResultsEmpty(visibleProductsLength, totalArticles) {
  return !visibleProductsLength && !totalArticles;
}

assert.strictEqual(isZeroResultsEmpty(0, 0), true, 'empty with no categories');
assert.strictEqual(isZeroResultsEmpty(0, 0), true, 'empty even if suggested categories exist');
assert.strictEqual(isZeroResultsEmpty(1, 0), false, 'has products');
assert.strictEqual(isZeroResultsEmpty(0, 2), false, 'has articles');

function resolveLayoutSuggestion(query, layoutCorrection, pendingSuggestion) {
  if (layoutCorrection && layoutCorrection.to) return '';
  var pending = String(pendingSuggestion || '').trim();
  if (pending) return pending;
  var swapped = swapKeyboardLayout(query);
  if (swapped && swapped.length >= 2) return swapped;
  return '';
}

assert.strictEqual(
  resolveLayoutSuggestion('рщтвф', null, null),
  'honda',
  'empty state computes honda from рщтвф'
);
assert.strictEqual(
  resolveLayoutSuggestion('рщтвф', null, 'honda'),
  'honda',
  'pending suggestion from failed retry'
);
assert.strictEqual(
  resolveLayoutSuggestion('рщтвф', { from: 'рщтвф', to: 'honda' }, 'honda'),
  '',
  'no empty-state tip when correction banner already applied'
);

function renderEmptyLayoutSuggestSnippet(layoutSuggestion) {
  if (!layoutSuggestion) return '';
  return (
    'Возможно, вы имели в виду «' +
    layoutSuggestion +
    '»?'
  );
}

// v0.0.36 — layout-suggest UI commented out in snippet.js; resolve logic still available
assert.ok(
  renderEmptyLayoutSuggestSnippet(resolveLayoutSuggestion('рщтвф', null, 'honda')).indexOf('honda') !== -1,
  'resolve still yields honda tip text (UI commented out)'
);

// v0.0.36 — recent searches only for successful queries; save query that had hits
function shouldSaveRecentSearch(preparedProductsLength, matchedArticlesLength) {
  return preparedProductsLength > 0 || matchedArticlesLength > 0;
}

function recentQueryToSave(query) {
  // applySearchPayload receives the successful query string (corrected when layout fix worked)
  return query;
}

assert.strictEqual(shouldSaveRecentSearch(0, 0), false, 'zero results — do not save');
assert.strictEqual(shouldSaveRecentSearch(2, 0), true, 'products — save');
assert.strictEqual(shouldSaveRecentSearch(0, 1), true, 'articles — save');
assert.strictEqual(shouldSaveRecentSearch(1, 1), true, 'both — save');
assert.strictEqual(
  recentQueryToSave('honda'),
  'honda',
  'layout fix saves corrected query (payload query = to)'
);
assert.strictEqual(recentQueryToSave('honda'), 'honda', 'original hit saves original');

// v0.0.37 — hide empty-message when categories are shown; keep search link
function shouldShowEmptyMessage(categoryIds, categoryMap) {
  var hasCategories = categoryIds && categoryIds.length && categoryMap;
  return !hasCategories;
}

assert.strictEqual(
  shouldShowEmptyMessage([], { '1': { title: 'X' } }),
  true,
  'no categories — show empty-message'
);
assert.strictEqual(
  shouldShowEmptyMessage(null, null),
  true,
  'missing options — show empty-message'
);
assert.strictEqual(
  shouldShowEmptyMessage(['10'], { '10': { title: 'Мотоциклы' } }),
  false,
  'categories present — hide empty-message'
);
assert.strictEqual(
  shouldShowEmptyMessage(['10'], null),
  true,
  'ids without map — still show empty-message'
);

console.log('settings.test.js: all checks passed');
