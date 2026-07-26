/**
 * Unit tests for df_quick_search fetch/cache/chunk helpers.
 * Run: node widget/tests/fetch.test.js
 */

var assert = require('assert');

var CACHE_TTL_MS = 60000;
var PRODUCTS_BY_ID_CHUNK_SIZE = 40;
var MIN_QUERY_LENGTH = 2;

function normalizeSearchQuery(query) {
  return String(query || '').trim().toLowerCase();
}

function chunkArray(items, size) {
  var chunks = [];
  var chunkSize = size > 0 ? size : 1;
  for (var i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

function createSearchCache() {
  var map = new Map();

  return {
    get: function (query) {
      var key = normalizeSearchQuery(query);
      var entry = map.get(key);
      if (!entry) return null;
      if (Date.now() - entry.ts > CACHE_TTL_MS) {
        map.delete(key);
        return null;
      }
      return entry.products;
    },
    set: function (query, products) {
      map.set(normalizeSearchQuery(query), { products: products, ts: Date.now() });
    },
    clear: function () {
      map.clear();
    },
    _map: map,
  };
}

function isProductAvailable(product) {
  if (!product) return false;
  if (product.available === false || product.available === 0 || product.available === 'false') {
    return false;
  }

  var variants = product && product.variants;
  if (!Array.isArray(variants) || !variants.length) return true;

  for (var i = 0; i < variants.length; i += 1) {
    var variant = variants[i];
    if (variant && variant.available !== false && variant.available !== 0 && variant.available !== 'false') {
      return true;
    }
  }

  return false;
}

function filterProductsByQuery(products, query) {
  if (!products.length) return products;
  var q = query.toLowerCase();
  return products.filter(function (product) {
    if ((product.title || '').toLowerCase().indexOf(q) !== -1) return true;
    var variants = product.variants || [];
    for (var i = 0; i < variants.length; i += 1) {
      var sku = String(variants[i].sku || '').toLowerCase();
      if (sku && sku.indexOf(q) !== -1) return true;
    }
    return false;
  });
}

function mergeProductsById(primary, secondary) {
  var seen = Object.create(null);
  var merged = [];
  primary.concat(secondary).forEach(function (product) {
    if (!product || !product.id || seen[product.id]) return;
    seen[product.id] = true;
    merged.push(product);
  });
  return merged;
}

function buildProductsByIdChunks(ids, chunkSize) {
  return chunkArray(ids, chunkSize || PRODUCTS_BY_ID_CHUNK_SIZE);
}

function simulateFetchProducts(options) {
  options = options || {};
  var cache = options.cache || createSearchCache();
  var query = options.query;
  var suggestions = options.suggestions || [];
  var searchJson = options.searchJson || [];
  var limit = options.limit || 24;
  var calls = { suggestions: 0, searchJson: 0, productsById: 0 };

  var cached = cache.get(query);
  if (cached) {
    return Promise.resolve({ products: cached, calls: calls, fromCache: true });
  }

  calls.suggestions += 1;
  var filtered = filterProductsByQuery(suggestions, query);

  var chain = Promise.resolve(filtered);
  if (filtered.length < limit) {
    chain = chain.then(function (primary) {
      calls.searchJson += 1;
      var jsonFiltered = filterProductsByQuery(searchJson, query);
      return mergeProductsById(primary, jsonFiltered);
    });
  }

  return chain.then(function (products) {
    var ids = products.map(function (p) {
      return p.id;
    });
    var chunks = buildProductsByIdChunks(ids);
    calls.productsById += chunks.length;
    cache.set(query, products);
    return { products: products, calls: calls, fromCache: false };
  });
}

assert.deepStrictEqual(chunkArray([1, 2, 3, 4, 5], 2), [[1, 2], [3, 4], [5]]);
assert.deepStrictEqual(chunkArray([], 40), []);
assert.deepStrictEqual(chunkArray([1, 2], 0), [[1], [2]]);

assert.strictEqual(buildProductsByIdChunks(Array.from({ length: 85 }, function (_, i) {
  return i + 1;
})).length, 3);

var cache = createSearchCache();
cache.set('Шорты', [{ id: 1, title: 'Шорты' }]);
assert.strictEqual(cache.get('шорты').length, 1);
cache._map.set('expired', { products: [{ id: 2 }], ts: Date.now() - CACHE_TTL_MS - 1 });
assert.strictEqual(cache.get('expired'), null);

assert.strictEqual(isProductAvailable({ variants: [{ available: true }] }), true);
assert.strictEqual(isProductAvailable({ variants: [{ available: false }] }), false);
assert.strictEqual(isProductAvailable({ variants: [] }), true);
assert.strictEqual(isProductAvailable({}), true);

assert.deepStrictEqual(
  filterProductsByQuery([{ title: 'Шорты', variants: [] }, { title: 'Куртка', variants: [] }], 'шорт'),
  [{ title: 'Шорты', variants: [] }]
);
assert.deepStrictEqual(filterProductsByQuery([{ title: 'Куртка', variants: [] }], 'шорт'), []);

return simulateFetchProducts({
  query: 'шорты',
  suggestions: [{ id: 1, title: 'Шорты', variants: [] }],
  searchJson: [{ id: 2, title: 'Шорты 2', variants: [] }],
  limit: 24,
  cache: cache,
}).then(function (first) {
  assert.strictEqual(first.fromCache, true);
  assert.strictEqual(first.calls.suggestions, 0);

  return simulateFetchProducts({
    query: 'куртка',
    suggestions: [{ id: 3, title: 'Куртка', variants: [] }],
    searchJson: [],
    limit: 24,
    cache: createSearchCache(),
  });
}).then(function (second) {
  assert.strictEqual(second.fromCache, false);
  assert.strictEqual(second.calls.suggestions, 1);
  assert.strictEqual(second.calls.searchJson, 1);
  assert.strictEqual(second.calls.productsById, 1);
  assert.strictEqual(second.products.length, 1);

  return simulateFetchProducts({
    query: 'бот',
    suggestions: [{ id: 10, title: 'Ботинки', variants: [] }],
    searchJson: [{ id: 11, title: 'Ботинки 2', variants: [] }],
    limit: 2,
    cache: createSearchCache(),
  });
}).then(function (third) {
  assert.strictEqual(third.calls.searchJson, 1);
  assert.strictEqual(third.products.length, 2);
  console.log('fetch.test.js: all 18 checks passed');
});
