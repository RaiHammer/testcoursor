/**
 * DanForge Quick Search
 * @handle danforge_quick_search
 *
 * Search architecture (see README.md):
 * 1. Primary: GET /search_suggestions — same endpoint & params as platform AjaxSearch
 *    (query, account_id, locale, fields[], hide_items_out_of_stock). Keeps Cyrillic working on armedf.ru.
 * 2. Enrich: GET /products_by_id/{ids}.json?lang=… — images, categories, variants/old_price.
 *    Multi-lang titles require query param `lang` (not `locale`); without it API returns shop-default language.
 * 3. Supplement: GET /search.json?q=…&lang=… — when suggestions return fewer than results_limit (no per_page — HTTP 555 on some shops).
 * 4. Client filter: productMatchesQuery() — title + SKU, preserves Cyrillic relevance.
 * Custom fullscreen UI; reuses AjaxSearch.path/data when present, does not hook EventBus (independent panel).
 */
(function () {
  var ROOT = '[data-df-quick-search-root]';
  var MIN_QUERY_LENGTH = 2;
  var DEBOUNCE_MS = 300;
  var DEFAULT_RESULTS_LIMIT = 24;
  var DEFAULT_ARTICLES_DISPLAY_LIMIT = 8;
  var MAX_RESULTS_LIMIT = 200;
  var MAX_ARTICLES_DISPLAY_LIMIT = 100;
  var CACHE_TTL_MS = 60000;
  var PRODUCTS_BY_ID_CHUNK_SIZE = 40;
  var RECENT_SEARCHES_KEY = 'df_qs_recent_searches';
  var ARTICLES_CACHE_PREFIX = 'df_qs_articles_v1:';
  var ARTICLES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
  var MAX_RECENT_SEARCHES = 5;
  var MAX_POPULAR_QUERIES = 12;
  var RESIZE_DEBOUNCE_MS = 150;
  var SIDEBAR_ARTICLE_ITEM_ESTIMATE = 40;
  var SIDEBAR_ARTICLE_FOOTER_RESERVE = 60;
  var SIDEBAR_SPLIT_MIN_RATIO = 0.25;
  var SIDEBAR_SPLIT_MAX_RATIO = 0.7;
  var SIDEBAR_SPLIT_GAP_FALLBACK = 16;
  // Windows RU/EN keyboard pairs (same physical keys)
  var LAYOUT_EN = "`qwertyuiop[]asdfghjkl;'zxcvbnm,./";
  var LAYOUT_RU = 'ёйцукенгшщзхъфывапролджэячсмитьбю.';

  var STRINGS = {
    ru: {
      products: 'Товары',
      articles: 'Статьи',
      categories: 'Категории',
      resultsAria: 'Результаты поиска',
      sidebarAria: 'Категории и статьи',
      emptyProducts: 'Товары не найдены',
      searchError: 'Ошибка поиска. Попробуйте еще раз.',
      untitled: 'Без названия',
      sortLabel: 'Сортировка',
      sortAria: 'Сортировка товаров',
      sortRelevance: 'По умолчанию',
      sortPriceAsc: 'Цена: по возрастанию',
      sortPriceDesc: 'Цена: по убыванию',
      sortPopularity: 'По популярности',
      showMore: 'Показать ещё',
      of: 'из',
      allResults: 'Все результаты',
      allArticles: 'Все статьи →',
      recentQueries: 'Недавние запросы',
      popularQueries: 'Популярные запросы',
      oosBadge: 'Нет в наличии',
      productPhotosAria: 'Фото товара',
      announceProducts: 'Найдено товаров: {n}',
      announceArticles: ', статей: {n}',
      layoutHint:
        'Показаны результаты для «{to}» — похоже, была другая раскладка клавиатуры (запрос «{from}»).',
      layoutHintApply: 'Заменить запрос на «{to}»',
      emptyMessage: 'Ничего не найдено по запросу «{q}»',
      emptySearchLink: 'Искать на странице поиска',
      loadMoreOf: 'Показать ещё ({visible} из {total})',
      countOf: '{visible} из {total}',
    },
    en: {
      products: 'Products',
      articles: 'Articles',
      categories: 'Categories',
      resultsAria: 'Search results',
      sidebarAria: 'Categories and articles',
      emptyProducts: 'No products found',
      searchError: 'Search error. Please try again.',
      untitled: 'Untitled',
      sortLabel: 'Sort',
      sortAria: 'Sort products',
      sortRelevance: 'Default',
      sortPriceAsc: 'Price: low to high',
      sortPriceDesc: 'Price: high to low',
      sortPopularity: 'Popularity',
      showMore: 'Show more',
      of: 'of',
      allResults: 'All results',
      allArticles: 'All articles →',
      recentQueries: 'Recent searches',
      popularQueries: 'Popular searches',
      oosBadge: 'Out of stock',
      productPhotosAria: 'Product photos',
      announceProducts: 'Products found: {n}',
      announceArticles: ', articles: {n}',
      layoutHint:
        'Showing results for “{to}” — looks like the wrong keyboard layout (query “{from}”).',
      layoutHintApply: 'Replace query with “{to}”',
      emptyMessage: 'Nothing found for “{q}”',
      emptySearchLink: 'Search on the search page',
      loadMoreOf: 'Show more ({visible} of {total})',
      countOf: '{visible} of {total}',
    },
  };

  var searchCache = new Map();

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

  var LAYOUT_EN_TO_RU = buildLayoutMap(LAYOUT_EN, LAYOUT_RU);
  var LAYOUT_RU_TO_EN = buildLayoutMap(LAYOUT_RU, LAYOUT_EN);

  /**
   * Swap RU↔EN keyboard layout for mistyped queries, e.g. «рщтвф» → «honda».
   * Returns null if nothing changed or string has no layout letters.
   */
  function swapKeyboardLayout(text) {
    var source = String(text != null ? text : '');
    if (!source) return null;

    var hasEn = /[a-zA-Z`\[\];',.\/]/.test(source);
    var hasRu = /[а-яА-ЯёЁ]/.test(source);
    // Mixed scripts — don't guess
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

  function boot() {
    document.querySelectorAll(ROOT).forEach(initWidget);
  }

  function parseBool(value, fallback) {
    if (value === true || value === 'true' || value === '1' || value === 1) return true;
    if (value === false || value === 'false' || value === '0' || value === 0) return false;
    return fallback;
  }

  var DEFAULT_TRIGGERS =
    '.header__search, .header__search-form, .header__search-field, .header__search-btn, .js-open-search-panel, .js-show-search';
  var DEFAULT_SUGGESTIONS_PATH = '/search_suggestions';
  var SEARCH_JSON_PATH = '/search.json';
  var Z_OVERLAY = 2147483000;
  var Z_PANEL = 2147483646;

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

  function normalizeSearchQuery(query) {
    return String(query || '').trim().toLowerCase();
  }

  function buildSearchCacheKey(query) {
    var locale = detectApiLocale() || detectUiLocale() || 'ru';
    var currency = detectCurrencyCode() || '';
    return normalizeSearchQuery(query) + '::' + locale + '::' + currency;
  }

  function getCachedSearchProducts(query) {
    var key = buildSearchCacheKey(query);
    var entry = searchCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      searchCache.delete(key);
      return null;
    }
    return entry.products;
  }

  function setCachedSearchProducts(query, products) {
    searchCache.set(buildSearchCacheKey(query), {
      products: products,
      ts: Date.now(),
    });
  }

  function clearSearchCache() {
    searchCache.clear();
  }

  function chunkArray(items, size) {
    var chunks = [];
    var chunkSize = size > 0 ? size : 1;
    for (var i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  function pushAnalytics(eventName, data) {
    if (!window.dataLayer || !Array.isArray(window.dataLayer)) return;
    var payload = { event: eventName };
    if (data && typeof data === 'object') {
      Object.keys(data).forEach(function (key) {
        payload[key] = data[key];
      });
    }
    window.dataLayer.push(payload);
  }

  function getRecentSearches() {
    try {
      var raw = window.sessionStorage.getItem(RECENT_SEARCHES_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function saveRecentSearch(query) {
    var normalized = String(query || '').trim();
    if (normalized.length < MIN_QUERY_LENGTH) return;

    var list = getRecentSearches().filter(function (item) {
      return item !== normalized;
    });
    list.unshift(normalized);
    if (list.length > MAX_RECENT_SEARCHES) {
      list = list.slice(0, MAX_RECENT_SEARCHES);
    }

    try {
      window.sessionStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(list));
    } catch (error) {
      /* sessionStorage unavailable */
    }
  }

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

  function isProductAvailable(product) {
    if (!product) return false;
    // Product-level flag from /products_by_id (OOS). Missing flag → fall through to variants.
    if (isFalsyFlag(product.available)) return false;

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

  /** Hidden / unpublished / archived — must not appear in storefront search. OOS-only is OK (badge). */
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

  /**
   * Storefront product URL only. Never /product_by_id/{id} (API, 404 on click).
   * Preference: url → html_url → /product/{permalink|handle}.
   */
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

  function shouldHideOutOfStockItems() {
    var data = window.AjaxSearch && window.AjaxSearch.data;
    if (data && data.hide_items_out_of_stock != null) {
      return parseBool(data.hide_items_out_of_stock, false);
    }

    var hideItems = getShopConfigValue('hide_items_out_of_stock');
    if (hideItems == null && window.Site && window.Site.account && window.Site.account.hide_items != null) {
      hideItems = window.Site.account.hide_items;
    }
    return parseBool(hideItems, false);
  }

  function shouldKeepStorefrontProduct(product, options) {
    options = options || {};
    if (isProductHiddenFromStorefront(product)) return false;
    if (!resolveProductUrl(product)) return false;
    if (options.hideOutOfStock && !isProductAvailable(product)) return false;
    return true;
  }

  function debounce(fn, delay) {
    var timer = 0;
    return function () {
      var args = arguments;
      var context = this;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        fn.apply(context, args);
      }, delay);
    };
  }

  function getFocusableElements(container) {
    if (!container) return [];

    return Array.prototype.slice.call(
      container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter(function (el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  function announceSearchResults(liveNode, productsCount, articlesCount) {
    if (!liveNode) return;

    var message = t('announceProducts', { n: productsCount });
    if (articlesCount > 0) {
      message += t('announceArticles', { n: articlesCount });
    }
    liveNode.textContent = message;
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

  function readArticlesCache(cacheKey) {
    var storageKey = buildArticlesCacheStorageKey(cacheKey);
    if (!storageKey) return null;

    try {
      var raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      var payload = JSON.parse(raw);
      if (!isArticlesCachePayloadValid(payload, cacheKey, Date.now(), ARTICLES_CACHE_TTL_MS)) {
        window.localStorage.removeItem(storageKey);
        return null;
      }
      return payload.articles;
    } catch (error) {
      return null;
    }
  }

  function writeArticlesCache(cacheKey, articles) {
    var storageKey = buildArticlesCacheStorageKey(cacheKey);
    if (!storageKey || !Array.isArray(articles)) return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          key: String(cacheKey),
          ts: Date.now(),
          articles: articles,
        })
      );
    } catch (error) {
      /* localStorage unavailable or quota exceeded */
    }
  }

  function loadArticlesList(root, cacheKey) {
    var key = String(cacheKey != null ? cacheKey : (root && root.dataset ? root.dataset.articlesCacheKey : '') || '').trim();
    var cached = readArticlesCache(key);
    if (cached) return cached;

    var articles = parseArticlesFromNode(getArticlesNode(root));
    writeArticlesCache(key, articles);
    return articles;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatMoneyAmount(value, delimiter, separator, forceNoCents) {
    var amount = Number(value);
    if (isNaN(amount)) amount = 0;
    var noCents =
      forceNoCents || Math.abs(amount - Math.round(amount)) < 1e-9;
    var delim = delimiter != null ? String(delimiter) : ' ';
    var sep = separator != null ? String(separator) : '.';

    if (noCents) {
      return String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, delim);
    }

    var fixed = (Math.round(amount * 100) / 100).toFixed(2);
    var parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, delim);
    return parts[0] + sep + parts[1];
  }

  function normalizeCurrencyCode(value) {
    if (value == null || value === '') return '';
    if (typeof value === 'object') {
      var nested =
        value.code ||
        value.currency_code ||
        value.iso_code ||
        value.iso ||
        value.currency;
      return normalizeCurrencyCode(nested);
    }
    var code = String(value).trim().toUpperCase();
    if (!code || /^\[OBJECT\s/i.test(code)) return '';
    if (code === 'RUB') return 'RUR';
    if (code === 'RUR' || code === 'USD' || code === 'EUR') return code;
    if (/^[A-Z]{3}$/.test(code)) return code;
    return '';
  }

  function inferCurrencyCodeFromUnit(unit) {
    var u = String(unit || '').trim();
    if (!u) return '';
    if (u === '$' || /\$|usd/i.test(u)) return 'USD';
    if (u === '\u20AC' || /eur|€/i.test(u)) return 'EUR';
    if (u === '\u20BD' || /руб|р\.|rub|rur/i.test(u)) return 'RUR';
    return '';
  }

  function currencyMoneyPreset(code) {
    if (code === 'USD') return { unit: '$', format: '%u%n' };
    if (code === 'EUR') return { unit: '\u20AC', format: '%n %u' };
    if (code === 'RUR' || code === 'RUB') return { unit: '\u20BD', format: '%n %u' };
    return null;
  }

  /**
   * Current storefront currency: Shop.config → header select → money.unit heuristic.
   * Language (?lang=) is independent; prices follow /site_currencies session.
   */
  function detectCurrencyCode() {
    var code = normalizeCurrencyCode(
      getShopConfigValue('currency_code') || getShopConfigValue('currency_iso_code')
    );
    if (code) return code;

    try {
      var select = document.querySelector(
        '.header-currency select[name="site_currency_code"], select[name="site_currency_code"]'
      );
      if (select) {
        code = normalizeCurrencyCode(select.value);
        if (code) return code;
        var selected = select.querySelector('option[selected]');
        if (selected) {
          code = normalizeCurrencyCode(selected.value || selected.getAttribute('value'));
          if (code) return code;
        }
      }
    } catch (error) {
      /* ignore DOM errors */
    }

    var money = getShopConfigValue('money_with_currency_format');
    if (money && typeof money === 'object' && money.unit != null) {
      code = inferCurrencyCodeFromUnit(money.unit);
      if (code) return code;
    }

    return '';
  }

  /**
   * Format using Shop.config money_with_currency_format (object on multi-currency shops).
   * After /site_currencies/update_current, products_by_id returns converted prices via session
   * cookie — prefer those over suggestion RUR prices. Symbol/format must follow detectCurrencyCode
   * (DOM select + config); never keep default ₽ when currency is USD/EUR.
   */
  function formatPrice(price) {
    var num = Number(price || 0);
    var value = isNaN(num) ? 0 : num;
    var currencyCode = detectCurrencyCode();
    var preset = currencyMoneyPreset(currencyCode);

    if (
      window.Shop &&
      window.Shop.money &&
      typeof window.Shop.money.format === 'function'
    ) {
      try {
        var shopFormatted = window.Shop.money.format(value);
        if (
          shopFormatted != null &&
          shopFormatted !== '' &&
          String(shopFormatted).indexOf('[object') === -1
        ) {
          var asText = String(shopFormatted);
          var staleVsPreset =
            preset &&
            ((currencyCode === 'USD' &&
              /[\u20BD]|руб/i.test(asText) &&
              asText.indexOf('$') === -1) ||
              (currencyCode === 'EUR' &&
                /[\u20BD]|руб/i.test(asText) &&
                asText.indexOf('\u20AC') === -1));
          if (!staleVsPreset) return asText;
        }
      } catch (error) {
        /* fall through to manual format */
      }
    }

    var money =
      getShopConfigValue('money_with_currency_format') || getShopConfigValue('money_format');
    var unit = '\u20BD';
    var format = '%n %u';
    var delimiter = ' ';
    var separator = '.';
    var forceNoCents = false;

    if (money && typeof money === 'object' && !Array.isArray(money)) {
      if (money.unit != null && money.unit !== '') unit = String(money.unit);
      if (money.format) format = String(money.format);
      else if (money.format_string) format = String(money.format_string);
      if (money.delimiter != null) delimiter = String(money.delimiter);
      else if (money.price_delimiter != null) delimiter = String(money.price_delimiter);
      if (money.separator != null) separator = String(money.separator);
      else if (money.price_separator != null) separator = String(money.price_separator);
      forceNoCents = !!(
        money.show_price_without_cents === true ||
        money.show_price_without_cents === 1 ||
        money.show_price_without_cents === '1'
      );
    } else if (typeof money === 'string' && money) {
      // Prefer known currency preset over Liquid/string templates that may still carry ₽.
      if (!preset) {
        var numberLocale = detectUiLocale() === 'en' ? 'en-US' : 'ru-RU';
        var amountForTemplate = formatMoneyAmount(value, delimiter, separator, forceNoCents);
        var withAmount = money
          .replace(
            /\{\{\s*amount_no_decimals\s*\}\}/gi,
            Math.round(value).toLocaleString(numberLocale)
          )
          .replace(/\{\{\s*amount\s*\}\}/gi, amountForTemplate)
          .replace(/%n/g, amountForTemplate)
          .replace(/%u/g, unit);
        if (withAmount !== money) return withAmount;
      }
    }

    // Known currency always wins over stale/default ₽ when config is incomplete or wrong.
    if (preset) {
      unit = preset.unit;
      format = preset.format;
    }

    var amount = formatMoneyAmount(value, delimiter, separator, forceNoCents);
    return String(format).replace(/%n/g, amount).replace(/%u/g, unit);
  }

  function toPrice(value) {
    var num = Number(value);
    return isNaN(num) ? 0 : num;
  }

  function getProductOldPrice(product, currentPrice) {
    var variants = product && product.variants;
    if (!Array.isArray(variants) || !variants.length) return 0;

    var oldPriceVal = toPrice(variants[0].old_price);
    if (oldPriceVal > currentPrice) return oldPriceVal;

    return 0;
  }

  function getImageRatio(root) {
    var ratio = String(root.dataset.imageRatio || 'square').toLowerCase();
    if (
      ratio !== 'portrait' &&
      ratio !== 'portrait-34' &&
      ratio !== 'landscape' &&
      ratio !== 'natural'
    ) {
      ratio = 'square';
    }
    return ratio;
  }

  /**
   * Shop.config.get(key) on some themes ignores the key and returns the whole config.
   * Treating that blob as money_with_currency_format leaves unit at default ₽.
   */
  function isPlausibleShopConfigValue(key, value) {
    if (value == null || value === '') return false;
    if (typeof value !== 'object' || Array.isArray(value)) return true;

    // Full config mistaken for a leaf value.
    if (
      value.money_with_currency_format != null &&
      (value.currency_code != null || value.account_id != null)
    ) {
      return false;
    }

    if (key === 'money_with_currency_format' || key === 'money_format') {
      return (
        value.unit != null ||
        value.format != null ||
        value.format_string != null ||
        value.delimiter != null ||
        value.separator != null
      );
    }
    if (key === 'default_currency') {
      return value.code != null || value.unit != null || value.format_string != null;
    }
    if (key === 'locale') {
      return true;
    }
    // Primitive keys (currency_code, account_id, …) must not be objects.
    return false;
  }

  function getShopConfigValue(key) {
    if (window.Shop && window.Shop.config && typeof window.Shop.config.get === 'function') {
      var shopValue = window.Shop.config.get(key);
      if (isPlausibleShopConfigValue(key, shopValue)) return shopValue;

      try {
        var all = window.Shop.config.get();
        if (
          all &&
          typeof all === 'object' &&
          !Array.isArray(all) &&
          all[key] != null &&
          all[key] !== '' &&
          isPlausibleShopConfigValue(key, all[key])
        ) {
          return all[key];
        }
      } catch (error) {
        /* ignore */
      }
    }

    var meta = document.querySelector('meta[name="shop-config"]');
    if (meta) {
      var raw =
        (meta.dataset && meta.dataset.config) ||
        meta.getAttribute('data-config') ||
        meta.getAttribute('content') ||
        '';
      if (raw) {
        try {
          var config = JSON.parse(raw);
          if (config[key] != null && config[key] !== '' && isPlausibleShopConfigValue(key, config[key])) {
            return config[key];
          }
        } catch (error) {
          /* invalid shop config */
        }
      }
    }

    return null;
  }

  /**
   * Coerce Shop.config.locale / Site.language / Liquid attrs to a plain locale string.
   * inSales may expose locale as an object ({ code, locale, iso, … }); String(obj) → "[object Object]".
   */
  function normalizeLocaleString(value) {
    if (value == null || value === '') return '';
    var type = typeof value;
    if (type === 'string' || type === 'number' || type === 'boolean') {
      var asString = String(value).trim();
      if (!asString || /^\[object\s/i.test(asString)) return '';
      return asString;
    }
    if (type !== 'object') return '';

    var prefer = ['code', 'locale', 'iso', 'iso_code', 'language_code', 'lang', 'language'];
    var i;
    var key;
    var nested;
    for (i = 0; i < prefer.length; i++) {
      key = prefer[i];
      if (value[key] == null || value[key] === '') continue;
      if (typeof value[key] === 'object') {
        nested = normalizeLocaleString(value[key]);
        if (nested) return nested;
        continue;
      }
      nested = normalizeLocaleString(value[key]);
      if (nested) return nested;
    }

    if (value.language && typeof value.language === 'object') {
      nested = normalizeLocaleString(value.language);
      if (nested) return nested;
    }

    return '';
  }

  function detectRawLocale() {
    var locale = normalizeLocaleString(getShopConfigValue('locale'));

    if (!locale && window.Site && window.Site.language) {
      locale = normalizeLocaleString(window.Site.language.locale);
      if (!locale) locale = normalizeLocaleString(window.Site.language);
    }
    if (!locale) {
      var htmlLang = document.documentElement && document.documentElement.getAttribute('lang');
      if (htmlLang) locale = normalizeLocaleString(htmlLang);
    }
    if (!locale) {
      var defaultMeta = document.querySelector('meta[name="default-locale"]');
      if (defaultMeta) {
        locale = normalizeLocaleString(defaultMeta.getAttribute('content') || '');
      }
    }
    if (!locale) {
      try {
        if (typeof URLSearchParams === 'function') {
          locale = normalizeLocaleString(
            new URLSearchParams(window.location.search || '').get('lang')
          );
        }
      } catch (error) {
        /* ignore URL parse errors */
      }
    }
    if (!locale) {
      var root = document.querySelector('[data-df-quick-search-root]');
      if (root) {
        locale = normalizeLocaleString(
          root.getAttribute('data-ui-locale') || root.dataset.uiLocale || ''
        );
      }
    }
    if (!locale) return 'ru';
    return locale;
  }

  function detectApiLocale() {
    var raw = detectRawLocale();
    if (raw == null || raw === '') return null;
    var primary = normalizeLocaleString(raw).toLowerCase().split(/[-_]/)[0].trim();
    if (!primary || primary === 'object') return null;
    return primary;
  }

  function detectUiLocale() {
    var api = detectApiLocale();
    if (api === 'en') return 'en';
    return 'ru';
  }

  function t(key, vars) {
    var locale = detectUiLocale();
    var dict = STRINGS[locale] || STRINGS.ru;
    var str = (dict && dict[key]) || STRINGS.ru[key] || key;
    if (vars && typeof vars === 'object') {
      Object.keys(vars).forEach(function (name) {
        str = String(str).split('{' + name + '}').join(String(vars[name]));
      });
    }
    return str;
  }

  function parseSelectors(value) {
    return String(value || DEFAULT_TRIGGERS)
      .split(',')
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function normalizeProducts(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== 'object') return [];

    if (Array.isArray(payload.products)) return payload.products;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.results)) return payload.results;
    if (payload.data && Array.isArray(payload.data.products)) return payload.data.products;

    return [];
  }

  function normalizeSuggestionItem(item) {
    if (!item || typeof item !== 'object') return null;

    var fields = item.fields && typeof item.fields === 'object' ? item.fields : {};
    var id = item.id || item.data || item.product_id || fields.id;
    var title = item.title || item.value || item.label || '';
    var price =
      fields.price_min != null
        ? fields.price_min
        : fields.price_min_available != null
          ? fields.price_min_available
          : item.price_min != null
            ? item.price_min
            : item.price;
    var image = fields.first_image || pickProductImage(item);
    var url = resolveProductUrl({
      url: item.url || item.link || fields.url,
      html_url: item.html_url || fields.html_url,
      permalink: item.permalink || fields.permalink,
      handle: item.handle || fields.handle,
    });

    return {
      id: id,
      title: title,
      url: url,
      price_min: price,
      first_image: image,
      permalink: item.permalink || fields.permalink,
      handle: item.handle || fields.handle,
      variants: fields.variants || item.variants || [],
      canonical_url_collection_id:
        fields.canonical_url_collection_id || item.canonical_url_collection_id || fields.category_id || item.category_id,
      category_id: fields.category_id || item.category_id,
      category_title: item.category_title,
      category_url: item.category_url,
    };
  }

  function normalizeSearchJsonProduct(item) {
    if (!item || typeof item !== 'object' || !item.id) return null;

    return {
      id: item.id,
      title: item.title || '',
      url: resolveProductUrl(item),
      price_min: item.price_min != null ? item.price_min : item.price,
      first_image: pickProductImage(item),
      images: item.images,
      permalink: item.permalink,
      handle: item.handle,
      is_hidden: item.is_hidden,
      archived: item.archived,
      published: item.published,
      variants: item.variants || [],
      canonical_url_collection_id: item.canonical_url_collection_id || item.category_id,
      category_id: item.category_id,
      category_title: item.category_title,
      category_url: item.category_url,
    };
  }

  function urlFromImageObject(image, options) {
    options = options || {};
    if (!image) return '';
    if (typeof image === 'string') return image;
    if (typeof image !== 'object') return '';

    if (options.preferPreview !== false) {
      return (
        image.compact_url ||
        image.medium_url ||
        image.thumb_url ||
        image.small_url ||
        image.large_url ||
        image.url ||
        image.original_url ||
        image.src ||
        ''
      );
    }

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

  /**
   * Second distinct product image for desktop hover swap.
   * Prefers images[1+] with a URL different from the primary photo.
   */
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

  function collectProductImageUrls(product, maxCount) {
    if (!product || maxCount < 1) return [];

    var urls = [];
    var seen = Object.create(null);

    function pushCandidate(image) {
      if (urls.length >= maxCount) return;
      var url = urlFromImageObject(image, { preferPreview: true });
      if (!url || seen[url]) return;
      seen[url] = true;
      urls.push(url);
    }

    if (product.first_image) pushCandidate(product.first_image);
    if (Array.isArray(product.images)) {
      for (var i = 0; i < product.images.length; i += 1) {
        pushCandidate(product.images[i]);
      }
    }
    if (product.image) pushCandidate(product.image);
    if (product.image_url) pushCandidate({ url: product.image_url });

    return urls;
  }

  function normalizeProductsByIdResponse(payload) {
    if (!payload || typeof payload !== 'object') return [];
    if (Array.isArray(payload.products)) return payload.products;
    if (Array.isArray(payload)) return payload;
    return [];
  }

  function requestProductsByIdsChunk(ids, signal) {
    if (!ids.length) return Promise.resolve([]);

    var path = '/products_by_id/' + ids.join(',') + '.json';
    var lang = detectApiLocale() || 'ru';
    var data = { lang: lang };

    if (window.jQuery && window.jQuery.ajax) {
      return new Promise(function (resolve, reject) {
        var jqXHR = window.jQuery.ajax({
          url: path,
          data: data,
          dataType: 'json',
          success: function (payload) {
            resolve(normalizeProductsByIdResponse(payload));
          },
          error: function () {
            reject(new Error('Products request failed'));
          },
        });

        if (signal) {
          signal.addEventListener('abort', function () {
            jqXHR.abort();
          });
        }
      });
    }

    var url = path + (path.indexOf('?') === -1 ? '?' : '&') + 'lang=' + encodeURIComponent(lang);

    var fetchOptions = {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    };

    if (signal) fetchOptions.signal = signal;

    return fetch(url, fetchOptions)
      .then(function (response) {
        if (!response.ok) throw new Error('Products request failed');
        return response.json();
      })
      .then(normalizeProductsByIdResponse);
  }

  function requestProductsByIds(ids, signal) {
    if (!ids.length) return Promise.resolve([]);

    var chunks = chunkArray(ids, PRODUCTS_BY_ID_CHUNK_SIZE);
    if (chunks.length === 1) {
      return requestProductsByIdsChunk(chunks[0], signal);
    }

    return chunks
      .reduce(function (chain, chunk) {
        return chain.then(function (acc) {
          return requestProductsByIdsChunk(chunk, signal).then(function (products) {
            return acc.concat(products);
          });
        });
      }, Promise.resolve([]));
  }

  function enrichSuggestionProducts(products, signal) {
    var ids = products
      .map(function (product) {
        return product.id;
      })
      .filter(Boolean);

    if (!ids.length) return Promise.resolve(products);

    var hideOutOfStock = shouldHideOutOfStockItems();

    return requestProductsByIds(ids, signal)
      .then(function (fullProducts) {
        var map = Object.create(null);
        fullProducts.forEach(function (product) {
          if (product && product.id != null && product.id !== '') {
            map[String(product.id)] = product;
          }
        });

        return products
          .map(function (product) {
            var full = product.id != null ? map[String(product.id)] : null;
            if (!full) {
              // No enrich hit — keep only if we already have a real storefront URL.
              return shouldKeepStorefrontProduct(product, { hideOutOfStock: hideOutOfStock })
                ? product
                : null;
            }

            var mergedImage = pickProductImage(full) || pickProductImage(product);
            // Prefer suggestion title if present (locale-aware); enrich with ?lang= is primary fix.
            // Prefer enrich price: suggestions stay in base RUR; products_by_id follows currency cookie.
            var merged = {
              id: full.id != null ? full.id : product.id,
              title: product.title || full.title,
              url: resolveProductUrl(full) || resolveProductUrl(product),
              price_min:
                full.price_min != null && full.price_min !== ''
                  ? full.price_min
                  : product.price_min,
              first_image: mergedImage,
              images: full.images || product.images,
              permalink: full.permalink || product.permalink,
              handle: full.handle || product.handle,
              is_hidden: full.is_hidden,
              isHidden: full.isHidden,
              hidden: full.hidden,
              archived: full.archived,
              published: full.published,
              is_published: full.is_published,
              available: full.available,
              variants: full.variants || product.variants || [],
              popularity:
                full.popularity != null
                  ? full.popularity
                  : product.popularity != null
                    ? product.popularity
                    : null,
              sales_rate:
                full.sales_rate != null
                  ? full.sales_rate
                  : product.sales_rate != null
                    ? product.sales_rate
                    : null,
              orders_count:
                full.orders_count != null
                  ? full.orders_count
                  : product.orders_count != null
                    ? product.orders_count
                    : null,
              sort_weight:
                full.sort_weight != null
                  ? full.sort_weight
                  : product.sort_weight != null
                    ? product.sort_weight
                    : null,
              canonical_url_collection_id:
                full.canonical_url_collection_id ||
                product.canonical_url_collection_id ||
                full.category_id ||
                product.category_id,
              category_id: full.category_id || product.category_id,
              category_title: product.category_title,
              category_url: product.category_url,
            };

            // Re-resolve after merging handle/permalink from enrich.
            merged.url = resolveProductUrl(merged);
            return merged;
          })
          .filter(function (product) {
            return product && shouldKeepStorefrontProduct(product, { hideOutOfStock: hideOutOfStock });
          });
      })
      .catch(function () {
        return products.filter(function (product) {
          return shouldKeepStorefrontProduct(product, { hideOutOfStock: hideOutOfStock });
        });
      });
  }

  function normalizeSearchResponse(payload) {
    var products = normalizeProducts(payload);
    if (products.length) return products;

    if (payload && Array.isArray(payload.suggestions)) {
      return payload.suggestions
        .map(normalizeSuggestionItem)
        .filter(Boolean);
    }

    return [];
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

  function getSuggestedCategories(collections, query, limit) {
    var list = [];
    var q = String(query || '').toLowerCase();

    Object.keys(collections).forEach(function (id) {
      var item = collections[id];
      if (item && item.title && item.url) list.push(item);
    });

    if (q) {
      list.sort(function (a, b) {
        var aMatch = (a.title || '').toLowerCase().indexOf(q) !== -1;
        var bMatch = (b.title || '').toLowerCase().indexOf(q) !== -1;
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return String(a.title || '').localeCompare(String(b.title || ''), detectUiLocale());
      });
    } else {
      list.sort(function (a, b) {
        return String(a.title || '').localeCompare(String(b.title || ''), detectUiLocale());
      });
    }

    return list.slice(0, limit || 5);
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

  function attachCollectionParents(list) {
    var stack = [];

    list.forEach(function (item) {
      if (!item) return;

      var level = parseInt(item.level, 10);
      if (isNaN(level)) level = 0;

      while (stack.length && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      var parent = stack.length ? stack[stack.length - 1] : null;
      item.parentTitle = parent && parent.title ? String(parent.title) : '';
      stack.push({ level: level, title: item.title || '' });
    });
  }

  function getCollections(root) {
    var node = root.querySelector('[data-df-quick-search-collections]');
    if (!node) return Object.create(null);

    try {
      var list = JSON.parse(node.textContent || '[]');
      if (!Array.isArray(list)) return Object.create(null);

      attachCollectionParents(list);

      var map = Object.create(null);
      list.forEach(function (item) {
        if (item && item.id) map[item.id] = item;
      });
      return map;
    } catch (error) {
      return Object.create(null);
    }
  }

  function getArticlesNode(root) {
    return root.querySelector('[data-df-quick-search-articles]');
  }

  function parseArticlesFromNode(node) {
    if (!node) return [];

    try {
      var list = JSON.parse(node.textContent || '[]');
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  }

  function ensureArticlesLoaded(state) {
    if (state.articlesLoaded) return state.articles;

    state.articles = loadArticlesList(state.root, state.articlesCacheKey);
    state.articlesIndexTotal = state.articles.length;
    state.articlesLoaded = true;
    return state.articles;
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

  function filterArticles(articles, query, products) {
    if (!articles.length) return [];

    var productIdMap = Object.create(null);
    (products || []).forEach(function (product) {
      if (product && product.id) productIdMap[product.id] = true;
    });

    return articles.filter(function (article) {
      return articleMatchesQuery(article, query, productIdMap);
    });
  }

  var IMAGE_SKELETON_TIMEOUT_MS = 8000;
  var SLIDER_DRAG_THRESHOLD_PX = 40;
  var SLIDER_CLICK_SUPPRESS_MS = 300;
  var MAX_PRODUCT_PHOTO_SLIDER = 4;

  /** product_photo_slider ON → 4 photos; else hover_second_image → 2; else 1. */
  function resolveProductPhotoLimit(options) {
    options = options || {};
    if (options.photoSlider === true) return MAX_PRODUCT_PHOTO_SLIDER;
    if (options.hoverSecondImage !== false) return 2;
    return 1;
  }

  function getHoverZoneSlideIndex(clientX, rect, count) {
    if (!rect || !rect.width || count < 2) return 0;
    var ratio = (clientX - rect.left) / rect.width;
    if (ratio < 0) ratio = 0;
    if (ratio > 1) ratio = 1;
    var index = Math.floor(ratio * count);
    if (index >= count) index = count - 1;
    return index;
  }

  function bindProductImages(container) {
    if (!container) return;

    container.querySelectorAll('.df-quick-search__product-image').forEach(function (img) {
      if (img.getAttribute('data-df-qs-img-bound') === '1') return;
      if (img.getAttribute('data-df-qs-lazy-src') && !img.getAttribute('src')) return;
      // Hover swap image must not drive skeleton settle / flash.
      if (img.classList.contains('df-quick-search__product-image--hover')) {
        img.setAttribute('data-df-qs-img-bound', '1');
        return;
      }

      var wrap = img.closest('.df-quick-search__product-image-wrap');
      if (!wrap) return;

      img.setAttribute('data-df-qs-img-bound', '1');

      var settled = false;

      function settleOk() {
        if (settled) return;
        settled = true;
        wrap.classList.remove('is-skeleton');
        wrap.classList.remove('is-placeholder');
      }

      function settleEmpty() {
        if (settled) return;
        settled = true;
        wrap.classList.remove('is-skeleton');
        wrap.classList.add('is-placeholder');
      }

      img.addEventListener('load', settleOk);
      img.addEventListener('error', settleEmpty);

      if (img.complete) {
        if (img.naturalWidth > 0) settleOk();
        else settleEmpty();
      } else {
        window.setTimeout(function () {
          if (!settled) settleEmpty();
        }, IMAGE_SKELETON_TIMEOUT_MS);
      }
    });
  }

  function loadSliderSlideImage(slide) {
    if (!slide) return;
    var img = slide.querySelector('img[data-df-qs-lazy-src]');
    if (!img) return;
    var src = img.getAttribute('data-df-qs-lazy-src');
    if (!src) return;
    img.setAttribute('src', src);
    img.removeAttribute('data-df-qs-lazy-src');
    img.setAttribute('loading', 'lazy');
  }

  function prefetchSliderAdjacentSlides(wrap, index) {
    var slides = wrap.querySelectorAll('[data-df-qs-slide-index]');
    loadSliderSlideImage(slides[index]);
    if (index > 0) loadSliderSlideImage(slides[index - 1]);
    if (index < slides.length - 1) loadSliderSlideImage(slides[index + 1]);
  }

  function setProductSliderIndex(wrap, index) {
    var count = parseInt(wrap.getAttribute('data-df-qs-slide-count'), 10) || 1;
    if (index < 0) index = count - 1;
    if (index >= count) index = 0;

    wrap.setAttribute('data-df-qs-active-slide', String(index));

    var track = wrap.querySelector('.df-quick-search__product-slider-track');
    if (track) track.style.setProperty('--df-qs-slide-index', String(index));

    wrap.querySelectorAll('[data-df-qs-slide-index]').forEach(function (slide) {
      var slideIndex = parseInt(slide.getAttribute('data-df-qs-slide-index'), 10);
      slide.classList.toggle('is-active', slideIndex === index);
    });

    wrap.querySelectorAll('[data-df-qs-slide-dot]').forEach(function (dot) {
      var dotIndex = parseInt(dot.getAttribute('data-df-qs-slide-dot'), 10);
      dot.classList.toggle('is-active', dotIndex === index);
    });

    prefetchSliderAdjacentSlides(wrap, index);
  }

  function bindProductSliders(container) {
    if (!container) return;

    container.querySelectorAll('[data-df-qs-slider]').forEach(function (wrap) {
      if (wrap.getAttribute('data-df-qs-slider-bound') === '1') return;
      wrap.setAttribute('data-df-qs-slider-bound', '1');

      var count = parseInt(wrap.getAttribute('data-df-qs-slide-count'), 10) || 1;
      if (count < 2) return;

      var trackHost = wrap.querySelector('[data-df-qs-slider-track]');
      var track = wrap.querySelector('.df-quick-search__product-slider-track');
      if (!trackHost || !track) return;

      var drag = {
        active: false,
        startX: 0,
        currentX: 0,
        pointerId: null,
        suppressClick: false,
      };
      var useHoverZones = window.matchMedia('(any-hover: hover)').matches;

      function getActiveSlideIndex() {
        return parseInt(wrap.getAttribute('data-df-qs-active-slide') || '0', 10) || 0;
      }

      function goToSlide(index) {
        setProductSliderIndex(wrap, index);
      }

      if (useHoverZones) {
        wrap.classList.add('has-slider--hover-zones');

        trackHost.addEventListener('mousemove', function (event) {
          var index = getHoverZoneSlideIndex(event.clientX, trackHost.getBoundingClientRect(), count);
          if (index !== getActiveSlideIndex()) goToSlide(index);
        });

        trackHost.addEventListener('mouseleave', function () {
          goToSlide(0);
        });

        trackHost.addEventListener('mouseenter', function () {
          for (var prefetchIndex = 1; prefetchIndex < count; prefetchIndex += 1) {
            loadSliderSlideImage(
              wrap.querySelector('[data-df-qs-slide-index="' + prefetchIndex + '"]')
            );
          }
        });
      } else {
        function onPointerDown(event) {
        if (event.button !== undefined && event.button !== 0) return;
        drag.active = true;
        drag.startX = event.clientX;
        drag.currentX = event.clientX;
        drag.pointerId = event.pointerId;
        drag.suppressClick = false;
        track.classList.add('is-dragging');
        if (trackHost.setPointerCapture) trackHost.setPointerCapture(event.pointerId);
      }

      function onPointerMove(event) {
        if (!drag.active || event.pointerId !== drag.pointerId) return;
        drag.currentX = event.clientX;
        var deltaX = drag.currentX - drag.startX;
        track.style.setProperty('--df-qs-drag-offset', deltaX + 'px');
      }

      function onPointerUp(event) {
        if (!drag.active || event.pointerId !== drag.pointerId) return;
        drag.active = false;
        var deltaX = drag.currentX - drag.startX;
        track.classList.remove('is-dragging');
        track.style.removeProperty('--df-qs-drag-offset');

        if (trackHost.releasePointerCapture) {
          try {
            trackHost.releasePointerCapture(event.pointerId);
          } catch (releaseError) {
            /* ignore */
          }
        }

        if (Math.abs(deltaX) >= SLIDER_DRAG_THRESHOLD_PX) {
          drag.suppressClick = true;
          var index = getActiveSlideIndex();
          if (deltaX < 0 && index < count - 1) goToSlide(index + 1);
          else if (deltaX > 0 && index > 0) goToSlide(index - 1);
          window.setTimeout(function () {
            drag.suppressClick = false;
          }, SLIDER_CLICK_SUPPRESS_MS);
        }
        }

        trackHost.addEventListener('pointerdown', onPointerDown);
        trackHost.addEventListener('pointermove', onPointerMove);
        trackHost.addEventListener('pointerup', onPointerUp);
        trackHost.addEventListener('pointercancel', onPointerUp);

        var productLink = wrap.closest('[data-df-quick-search-product]');
        if (productLink) {
          productLink.addEventListener('click', function (event) {
            if (drag.suppressClick) {
              event.preventDefault();
              event.stopPropagation();
            }
          });
        }

        wrap.addEventListener('mouseenter', function () {
          var index = getActiveSlideIndex();
          if (index + 1 < count) {
            loadSliderSlideImage(wrap.querySelector('[data-df-qs-slide-index="' + (index + 1) + '"]'));
          }
        });
      }

      wrap.querySelectorAll('[data-df-qs-slide-dot]').forEach(function (dot) {
        dot.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          var dotIndex = parseInt(dot.getAttribute('data-df-qs-slide-dot'), 10);
          if (!isNaN(dotIndex)) goToSlide(dotIndex);
        });
      });
    });
  }

  function getSuggestionsBaseData(limit) {
    var data;

    if (window.AjaxSearch && window.AjaxSearch.data) {
      data = Object.assign({}, window.AjaxSearch.data);
    } else {
      data = {
        fields: ['price_min', 'price_min_available'],
      };

      var accountId = getShopConfigValue('account_id');
      if (accountId == null && window.Site && window.Site.account) {
        accountId = window.Site.account.id;
      }
      if (accountId != null && accountId !== '') {
        data.account_id = accountId;
      }

      var hideItems = getShopConfigValue('hide_items_out_of_stock');
      if (hideItems == null && window.Site && window.Site.account && window.Site.account.hide_items != null) {
        hideItems = window.Site.account.hide_items;
      }
      if (hideItems != null) {
        data.hide_items_out_of_stock = hideItems;
      }
    }

    // Always force a string locale (AjaxSearch.data may omit, stale, or pass an object).
    data.locale = detectApiLocale() || 'ru';

    // Undocumented on inSales; some backends may honour it. Safe to send.
    if (limit > 0) {
      data.limit = limit;
    }

    return data;
  }

  function getSuggestionsPath() {
    if (window.AjaxSearch && window.AjaxSearch.path) return window.AjaxSearch.path;
    return DEFAULT_SUGGESTIONS_PATH;
  }

  function buildSuggestionsUrl(query, limit) {
    var url = new URL(getSuggestionsPath(), window.location.origin);
    var data = getSuggestionsBaseData(limit);
    var key;

    data.query = query;

    for (key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;

      if (key === 'fields' && Array.isArray(data.fields)) {
        data.fields.forEach(function (field) {
          url.searchParams.append('fields[]', field);
        });
        continue;
      }

      if (data[key] != null && data[key] !== '') {
        url.searchParams.append(key, data[key]);
      }
    }

    return url.href;
  }

  function requestSearchSuggestions(query, limit, signal) {
    var data = getSuggestionsBaseData(limit);
    data.query = query;
    var path = getSuggestionsPath();

    if (window.jQuery && window.jQuery.ajax) {
      return new Promise(function (resolve, reject) {
        var jqXHR = window.jQuery.ajax({
          url: path,
          data: data,
          dataType: 'json',
          success: function (payload) {
            resolve(normalizeSearchResponse(payload));
          },
          error: function () {
            reject(new Error('Search request failed'));
          },
        });

        if (signal) {
          signal.addEventListener('abort', function () {
            jqXHR.abort();
          });
        }
      });
    }

    var url = buildSuggestionsUrl(query, limit);
    var fetchOptions = {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    };

    if (signal) fetchOptions.signal = signal;

    return fetch(url, fetchOptions)
      .then(function (response) {
        if (!response.ok) throw new Error('Search request failed');
        return response.json();
      })
      .then(normalizeSearchResponse);
  }

  function requestSearchJson(query, signal) {
    var data = { q: query, lang: detectApiLocale() || 'ru' };

    // Do NOT send per_page — caused HTTP 555 on armedf.ru (see CHANGELOG v0.0.4).

    if (window.jQuery && window.jQuery.ajax) {
      return new Promise(function (resolve, reject) {
        var jqXHR = window.jQuery.ajax({
          url: SEARCH_JSON_PATH,
          data: data,
          dataType: 'json',
          success: function (payload) {
            var products = normalizeProducts(payload)
              .map(normalizeSearchJsonProduct)
              .filter(Boolean);
            resolve(products);
          },
          error: function () {
            reject(new Error('Search JSON request failed'));
          },
        });

        if (signal) {
          signal.addEventListener('abort', function () {
            jqXHR.abort();
          });
        }
      });
    }

    var url = new URL(SEARCH_JSON_PATH, window.location.origin);
    Object.keys(data).forEach(function (key) {
      url.searchParams.append(key, data[key]);
    });

    var fetchOptions = {
      headers: {
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      credentials: 'same-origin',
    };

    if (signal) fetchOptions.signal = signal;

    return fetch(url.href, fetchOptions)
      .then(function (response) {
        if (!response.ok) throw new Error('Search JSON request failed');
        return response.json();
      })
      .then(function (payload) {
        return normalizeProducts(payload)
          .map(normalizeSearchJsonProduct)
          .filter(Boolean);
      });
  }

  function fetchProducts(query, limit, signal) {
    var cached = getCachedSearchProducts(query);
    if (cached) {
      return Promise.resolve(cached);
    }

    return requestSearchSuggestions(query, limit, signal)
      .then(function (suggestions) {
        var filtered = filterProductsByQuery(suggestions, query);

        if (filtered.length >= limit) {
          return filtered;
        }

        return requestSearchJson(query, signal)
          .then(function (jsonProducts) {
            var jsonFiltered = filterProductsByQuery(jsonProducts, query);
            return mergeProductsById(filtered, jsonFiltered);
          })
          .catch(function () {
            return filtered;
          });
      })
      .then(function (products) {
        return enrichSuggestionProducts(products, signal);
      })
      .then(function (products) {
        setCachedSearchProducts(query, products);
        return products;
      });
  }

  function buildCategoryMap(products, collections, query) {
    var map = Object.create(null);
    var q = String(query || '').toLowerCase();

    products.forEach(function (product) {
      var categoryId = product.canonical_url_collection_id || product.category_id;
      if (!categoryId || map[categoryId]) return;

      if (collections[categoryId]) {
        map[categoryId] = collections[categoryId];
        return;
      }

      var categoryTitle = product.category_title || '';
      var categoryUrl = product.category_url || '';
      if (categoryTitle && categoryUrl) {
        map[categoryId] = { title: categoryTitle, url: categoryUrl, parentTitle: '' };
      }
    });

    if (q) {
      Object.keys(collections).forEach(function (id) {
        if (map[id]) return;
        var collection = collections[id];
        if ((collection.title || '').toLowerCase().indexOf(q) !== -1) {
          map[id] = collection;
        }
      });
    }

    return map;
  }

  function normalizeCategoryTitle(title) {
    return String(title || '')
      .trim()
      .toLowerCase();
  }

  function getCategoryPathHint(url) {
    var parts = String(url || '')
      .split('/')
      .filter(Boolean);
    var last = parts.length ? parts[parts.length - 1] : '';
    try {
      last = decodeURIComponent(last);
    } catch (error) {
      // keep raw segment
    }
    return last;
  }

  function resolveCategoryDisplayLabel(item, needsDisambiguation) {
    var title = String((item && item.title) || '').trim();
    if (!needsDisambiguation) return title;

    var parent = String((item && item.parentTitle) || '').trim();
    if (parent && normalizeCategoryTitle(parent) !== normalizeCategoryTitle(title)) {
      return parent + ' · ' + title;
    }

    var hint = getCategoryPathHint(item && item.url);
    if (hint && normalizeCategoryTitle(hint) !== normalizeCategoryTitle(title)) {
      return title + ' · ' + hint;
    }

    return title;
  }

  function buildCategoryDisplayLabels(categoryMap) {
    var labels = Object.create(null);
    var ids = Object.keys(categoryMap || {});
    var groups = Object.create(null);

    ids.forEach(function (id) {
      var item = categoryMap[id];
      if (!item) return;
      var key = normalizeCategoryTitle(item.title);
      if (!key) {
        labels[id] = String(item.title || '').trim();
        return;
      }
      if (!groups[key]) groups[key] = [];
      groups[key].push(id);
    });

    ids.forEach(function (id) {
      var item = categoryMap[id];
      if (!item || labels[id] != null) return;
      var key = normalizeCategoryTitle(item.title);
      var group = groups[key] || [];
      labels[id] = resolveCategoryDisplayLabel(item, group.length >= 2);
    });

    var labelGroups = Object.create(null);
    ids.forEach(function (id) {
      var labelKey = normalizeCategoryTitle(labels[id]);
      if (!labelKey) return;
      if (!labelGroups[labelKey]) labelGroups[labelKey] = [];
      labelGroups[labelKey].push(id);
    });

    Object.keys(labelGroups).forEach(function (labelKey) {
      var group = labelGroups[labelKey];
      if (group.length < 2) return;
      group.forEach(function (id) {
        var item = categoryMap[id];
        var hint = getCategoryPathHint(item && item.url);
        var title = String((item && item.title) || '').trim();
        if (hint && normalizeCategoryTitle(hint) !== normalizeCategoryTitle(title)) {
          labels[id] = title + ' · ' + hint;
        }
      });
    });

    return labels;
  }

  function buildSearchPageUrl(query) {
    var url = new URL('/search', window.location.origin);
    url.searchParams.set('q', query || '');
    return url.pathname + url.search;
  }

  function renderCategoriesHtml(categoryIds, categoryMap, extraClass) {
    if (!categoryIds.length) return '';

    var className = 'df-quick-search__categories' + (extraClass ? ' ' + extraClass : '');
    var displayLabels = buildCategoryDisplayLabels(categoryMap);
    var html =
      '<div class="' +
      className +
      '"><div class="df-quick-search__section-title">' +
      escapeHtml(t('categories')) +
      '</div><div class="df-quick-search__category-list">';

    categoryIds.forEach(function (id) {
      var item = categoryMap[id];
      if (!item) return;
      var label = displayLabels[id] != null ? displayLabels[id] : item.title;
      html +=
        '<a class="df-quick-search__category-item" href="' +
        escapeHtml(item.url) +
        '">' +
        escapeHtml(label) +
        '</a>';
    });

    html += '</div></div>';
    return html;
  }

  function renderArticleListHtml(articleItems, query) {
    var html = '<div class="df-quick-search__article-list">';
    articleItems.forEach(function (article) {
      html += renderArticleItemHtml(article, query);
    });
    html += '</div>';
    return html;
  }

  function renderArticleItemHtml(article, query) {
    var title = highlightQueryInText(article.title || t('untitled'), query);
    return (
      '<a class="df-quick-search__article-item" href="' +
      escapeHtml(article.url || '/') +
      '">' +
      title +
      '</a>'
    );
  }

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

  function getPreparedProducts(state, products) {
    var hideZeroPrice = parseBool(state.root.dataset.hideZeroPrice, false);
    var filtered = products.filter(function (product) {
      if (!hideZeroPrice) return true;
      return toPrice(product.price_min) > 0;
    });
    var sortMode = (state && state.productSort) || 'relevance';
    if (sortMode === 'relevance') return filtered;
    return sortPreparedProducts(filtered, sortMode);
  }

  function renderProductSortSelectHtml(state, products) {
    if (!parseBool(state.root.dataset.showProductSort, true)) return '';
    if (!products || products.length < 2) return '';

    var current = state.productSort || 'relevance';
    var hasPopularity = productsHavePopularityData(products);
    if (current === 'popularity' && !hasPopularity) {
      current = 'relevance';
      state.productSort = 'relevance';
    }

    var html =
      '<label class="df-quick-search__sort">' +
      '<span class="df-quick-search__sort-label">' +
      escapeHtml(t('sortLabel')) +
      '</span>' +
      '<select class="df-quick-search__sort-select" data-df-quick-search-sort aria-label="' +
      escapeHtml(t('sortAria')) +
      '">';

    var options = [
      { value: 'relevance', label: t('sortRelevance') },
      { value: 'price_asc', label: t('sortPriceAsc') },
      { value: 'price_desc', label: t('sortPriceDesc') },
    ];

    if (hasPopularity) {
      options.push({ value: 'popularity', label: t('sortPopularity') });
    }

    options.forEach(function (option) {
      html +=
        '<option value="' +
        option.value +
        '"' +
        (option.value === current ? ' selected' : '') +
        '>' +
        option.label +
        '</option>';
    });

    html += '</select></label>';
    return html;
  }

  function computeSidebarArticlesVisibleCount(state, contentNode) {
    if (window.innerWidth < 768 || !state.matchedArticles.length) {
      return state.articlesDisplayLimit;
    }

    var articlesBlock = contentNode.querySelector('.df-quick-search__articles--sidebar');
    if (!articlesBlock) {
      return Math.max(state.articlesDisplayLimit, state.sidebarArticlesVisibleCount || state.articlesDisplayLimit);
    }

    var title = articlesBlock.querySelector('.df-quick-search__section-title');
    var titleHeight = title ? title.offsetHeight + 8 : 28;
    var availableHeight = articlesBlock.clientHeight - titleHeight - SIDEBAR_ARTICLE_FOOTER_RESERVE;

    if (availableHeight <= 0) {
      return state.articlesDisplayLimit;
    }

    var sampleItem = articlesBlock.querySelector('.df-quick-search__article-item');
    var itemHeight = sampleItem ? sampleItem.getBoundingClientRect().height + 5.6 : SIDEBAR_ARTICLE_ITEM_ESTIMATE;
    if (itemHeight <= 0) itemHeight = SIDEBAR_ARTICLE_ITEM_ESTIMATE;

    var calculated = Math.floor(availableHeight / itemHeight);
    calculated = Math.max(state.articlesDisplayLimit, calculated);
    calculated = Math.min(calculated, state.matchedArticles.length);

    return calculated;
  }

  function updateSidebarArticlesSection(state, query) {
    var contentNode = state.contentNode;
    if (!contentNode) return;

    var articlesBlock = contentNode.querySelector('.df-quick-search__articles--sidebar');
    if (!articlesBlock) return;

    var articles = state.matchedArticles || [];
    var totalArticles = articles.length;
    var sidebarArticles = articles.slice(0, state.sidebarArticlesVisibleCount);
    var hasMoreSidebarArticles = totalArticles > state.sidebarArticlesVisibleCount;
    var sidebarArticlesCountText = hasMoreSidebarArticles
      ? t('countOf', { visible: sidebarArticles.length, total: totalArticles })
      : String(totalArticles);
    var indexArticleTotal = state.articlesIndexTotal || state.articles.length || 0;
    var serverArticleTotal = state.articlesServerTotal || 0;
    var indexIncomplete = isArticlesIndexIncomplete(serverArticleTotal, indexArticleTotal);
    var allArticlesUrl = resolveArticlesBlogUrl(state.articlesBlogUrl, state.articleBlogHandles);
    var showAllSidebarArticlesLink = shouldShowAllArticlesLink(
      hasMoreSidebarArticles,
      totalArticles > 0,
      indexIncomplete
    );

    var listNode = articlesBlock.querySelector('.df-quick-search__article-list');
    if (listNode) {
      listNode.innerHTML = sidebarArticles
        .map(function (article) {
          return renderArticleItemHtml(article, query);
        })
        .join('');
    }

    var countNode = articlesBlock.querySelector('.df-quick-search__section-count');
    if (countNode) {
      countNode.textContent = '(' + sidebarArticlesCountText + ')';
    }

    var loadMoreBtn = articlesBlock.querySelector('[data-df-quick-search-load-more-sidebar-articles]');
    if (hasMoreSidebarArticles) {
      if (!loadMoreBtn) {
        articlesBlock.insertAdjacentHTML(
          'beforeend',
          '<button type="button" class="df-quick-search__load-more" data-df-quick-search-load-more-sidebar-articles>' +
            escapeHtml(t('showMore')) +
            '</button>'
        );
        loadMoreBtn = articlesBlock.querySelector('[data-df-quick-search-load-more-sidebar-articles]');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function (event) {
            handleLoadMoreSidebarArticles(state, event);
          });
        }
      }
    } else if (loadMoreBtn) {
      loadMoreBtn.remove();
    }

    var allArticlesLink = articlesBlock.querySelector('.df-quick-search__all-articles');
    if (showAllSidebarArticlesLink && allArticlesUrl) {
      if (!allArticlesLink) {
        articlesBlock.insertAdjacentHTML(
          'beforeend',
          '<a class="df-quick-search__all-articles" href="' +
            escapeHtml(allArticlesUrl) +
            '">' + escapeHtml(t('allArticles')) + '</a>'
        );
      }
    } else if (allArticlesLink) {
      allArticlesLink.remove();
    }

    layoutSidebarSplit(state);
  }

  function updateProductsLoadMoreButton(state, preparedProducts, query) {
    var contentNode = state.contentNode;
    if (!contentNode) return;

    var productsBlock = contentNode.querySelector('.df-quick-search__products');
    if (!productsBlock) return;

    var visibleProducts = preparedProducts.slice(0, state.visibleCount);
    var hasMoreProducts = preparedProducts.length > state.visibleCount;
    var totalProducts = preparedProducts.length;
    var loadMoreLabel = t('loadMoreOf', { visible: visibleProducts.length, total: totalProducts });
    var loadMoreBtn = productsBlock.querySelector('[data-df-quick-search-load-more]');

    if (hasMoreProducts) {
      if (!loadMoreBtn) {
        productsBlock.insertAdjacentHTML(
          'beforeend',
          '<button type="button" class="df-quick-search__load-more" data-df-quick-search-load-more>' +
            escapeHtml(loadMoreLabel) +
            '</button>'
        );
        loadMoreBtn = productsBlock.querySelector('[data-df-quick-search-load-more]');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function (event) {
            handleLoadMoreProducts(state, query, event);
          });
        }
      } else {
        loadMoreBtn.textContent = loadMoreLabel;
      }
    } else if (loadMoreBtn) {
      loadMoreBtn.remove();
    }
  }

  function appendMoreProducts(state, query) {
    var preparedProducts = getPreparedProducts(state, state.allProducts);
    var prevVisible = state.visibleCount;
    state.visibleCount = Math.min(state.visibleCount + state.resultsLimit, preparedProducts.length);
    var newProducts = preparedProducts.slice(prevVisible, state.visibleCount);

    var grid = state.contentNode.querySelector('.df-quick-search__product-grid');
    if (grid && newProducts.length) {
      var showPhotos = parseBool(state.root.dataset.showPhotos, true);
      var showPrices = parseBool(state.root.dataset.showPrices, true);
      var showOutOfStockBadge = parseBool(state.root.dataset.showOutOfStockBadge, true);
      var hoverSecondImage = parseBool(state.root.dataset.hoverSecondImage, true);
      var photoSlider = parseBool(state.root.dataset.productPhotoSlider, false);
      grid.insertAdjacentHTML(
        'beforeend',
        newProducts
          .map(function (product) {
            return renderProductCardHtml(product, {
              showPhotos: showPhotos,
              showPrices: showPrices,
              showOutOfStockBadge: showOutOfStockBadge,
              hoverSecondImage: hoverSecondImage,
              photoSlider: photoSlider,
              query: query,
            });
          })
          .join('')
      );
      bindProductImages(state.contentNode);
      bindProductSliders(state.contentNode);
    }

    updateProductsLoadMoreButton(state, preparedProducts, query);
  }

  function appendMoreArticles(state, query, target) {
    var articles = state.matchedArticles || [];
    var isSidebar = target === 'sidebar';
    var countKey = isSidebar ? 'sidebarArticlesVisibleCount' : 'articlesVisibleCount';
    var selector = isSidebar
      ? '.df-quick-search__articles--sidebar .df-quick-search__article-list'
      : '.df-quick-search__articles--mobile .df-quick-search__article-list';
    var blockSelector = isSidebar
      ? '.df-quick-search__articles--sidebar'
      : '.df-quick-search__articles--mobile';

    var prevVisible = state[countKey];
    state[countKey] = Math.min(state[countKey] + state.articlesDisplayLimit, articles.length);
    var newArticles = articles.slice(prevVisible, state[countKey]);

    var listNode = state.contentNode.querySelector(selector);
    if (listNode && newArticles.length) {
      listNode.insertAdjacentHTML(
        'beforeend',
        newArticles
          .map(function (article) {
            return renderArticleItemHtml(article, query);
          })
          .join('')
      );
    }

    var articlesBlock = state.contentNode.querySelector(blockSelector);
    if (!articlesBlock) return;

    var totalArticles = articles.length;
    var visibleCount = state[countKey];
    var hasMore = totalArticles > visibleCount;
    var countText = hasMore
      ? t('countOf', { visible: visibleCount, total: totalArticles })
      : String(totalArticles);
    var countNode = articlesBlock.querySelector('.df-quick-search__section-count');
    if (countNode) {
      countNode.textContent = '(' + countText + ')';
    }

    var loadMoreAttr = isSidebar
      ? 'data-df-quick-search-load-more-sidebar-articles'
      : 'data-df-quick-search-load-more-articles';
    var loadMoreBtn = articlesBlock.querySelector('[' + loadMoreAttr + ']');

    if (hasMore) {
      if (!loadMoreBtn) {
        articlesBlock.insertAdjacentHTML(
          'beforeend',
          '<button type="button" class="df-quick-search__load-more" ' +
            loadMoreAttr +
            '>' + escapeHtml(t('showMore')) + '</button>'
        );
        loadMoreBtn = articlesBlock.querySelector('[' + loadMoreAttr + ']');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function (event) {
            if (isSidebar) handleLoadMoreSidebarArticles(state, event);
            else handleLoadMoreArticles(state, query, event);
          });
        }
      }
    } else if (loadMoreBtn) {
      loadMoreBtn.remove();
    }

    if (isSidebar) {
      layoutSidebarSplit(state);
    }
  }

  function handleLoadMoreProducts(state, query, event) {
    if (event) event.preventDefault();
    appendMoreProducts(state, query);
  }

  function handleLoadMoreArticles(state, query, event) {
    if (event) event.preventDefault();
    appendMoreArticles(state, query, 'mobile');
  }

  function handleLoadMoreSidebarArticles(state, event) {
    if (event) event.preventDefault();
    appendMoreArticles(state, state.currentQuery || '', 'sidebar');
  }

  function recalculateSidebarArticlesAfterRender(state, query) {
    layoutSidebarSplit(state);

    if (window.innerWidth < 768 || !state.matchedArticles.length) return;

    var contentNode = state.contentNode;
    var calculated = computeSidebarArticlesVisibleCount(state, contentNode);
    if (calculated <= state.sidebarArticlesVisibleCount) return;

    state.sidebarArticlesVisibleCount = calculated;
    updateSidebarArticlesSection(state, query);
  }

  function bindSuggestionChipClicks(state, selector, attrName) {
    state.contentNode.querySelectorAll(selector).forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var chipQuery = btn.getAttribute(attrName) || '';
        state.input.value = chipQuery;
        if (chipQuery.length >= MIN_QUERY_LENGTH) {
          showSearchLoading(state);
          runSearch(state, chipQuery);
        }
      });
    });
  }

  function renderChipSection(classPrefix, title, items, dataAttr) {
    if (!items.length) return '';

    var html =
      '<div class="df-quick-search__' +
      classPrefix +
      '">' +
      '<p class="df-quick-search__' +
      classPrefix +
      '-title">' +
      escapeHtml(title) +
      '</p>' +
      '<div class="df-quick-search__' +
      classPrefix +
      '-list">';

    items.forEach(function (item) {
      html +=
        '<button type="button" class="df-quick-search__' +
        classPrefix +
        '-item" ' +
        dataAttr +
        '="' +
        escapeHtml(item) +
        '">' +
        escapeHtml(item) +
        '</button>';
    });

    html += '</div></div>';
    return html;
  }

  function renderRecentSearches(state) {
    if (!state.contentNode) return;

    var recent = getRecentSearches();
    var popular = parsePopularQueries(state.root.dataset.popularQueries);
    if (!recent.length && !popular.length) {
      state.contentNode.innerHTML = '';
      hideSearchLoading(state);
      return;
    }

    var html =
      renderChipSection('recent', t('recentQueries'), recent, 'data-df-quick-search-recent') +
      renderChipSection('popular', t('popularQueries'), popular, 'data-df-quick-search-popular');

    state.contentNode.innerHTML = html;
    hideSearchLoading(state);

    bindSuggestionChipClicks(state, '[data-df-quick-search-recent]', 'data-df-quick-search-recent');
    bindSuggestionChipClicks(state, '[data-df-quick-search-popular]', 'data-df-quick-search-popular');
  }

  function bindAnalyticsDelegation(state) {
    if (!state.contentNode || state.analyticsBound) return;
    state.analyticsBound = true;

    state.contentNode.addEventListener('click', function (event) {
      var productLink = event.target.closest('[data-df-quick-search-product]');
      if (productLink) {
        pushAnalytics('df_qs_product_click', {
          df_qs_query: state.currentQuery || '',
          df_qs_url: productLink.getAttribute('href') || '',
        });
        return;
      }

      var categoryLink = event.target.closest('.df-quick-search__category-item');
      if (categoryLink) {
        pushAnalytics('df_qs_category_click', {
          df_qs_query: state.currentQuery || '',
          df_qs_url: categoryLink.getAttribute('href') || '',
        });
      }
    });
  }

  function renderArticlesHtml(options) {
    var articles = options.articles || [];
    if (!articles.length) return '';

    var countText = options.countText || String(articles.length);
    var extraClass = options.extraClass || '';
    var html =
      '<div class="df-quick-search__articles' +
      (extraClass ? ' ' + extraClass : '') +
      '">';

    if (!options.hideSectionTitle) {
      html +=
        '<div class="df-quick-search__section-title">' +
        escapeHtml(t('articles')) +
        ' <span class="df-quick-search__section-count">(' +
        countText +
        ')</span></div>';
    }

    html += renderArticleListHtml(articles, options.query);

    if (options.showLoadMore) {
      var loadMoreAttr = options.loadMoreAttr || 'data-df-quick-search-load-more-articles';
      html +=
        '<button type="button" class="df-quick-search__load-more" ' +
        loadMoreAttr +
        '>' + escapeHtml(t('showMore')) + '</button>';
    }

    if (options.showAllArticlesLink && options.allArticlesUrl) {
      html +=
        '<a class="df-quick-search__all-articles" href="' +
        escapeHtml(options.allArticlesUrl) +
        '">' + escapeHtml(t('allArticles')) + '</a>';
    }

    html += '</div>';
    return html;
  }

  function renderLayoutHintHtml(correction) {
    if (!correction || !correction.from || !correction.to) return '';
    return (
      '<div class="df-quick-search__layout-hint" role="status">' +
      '<p class="df-quick-search__layout-hint-text">' +
      escapeHtml(t('layoutHint', { to: correction.to, from: correction.from })) +
      '</p>' +
      '<button type="button" class="df-quick-search__layout-hint-apply" data-df-quick-search-apply-layout="' +
      escapeHtml(correction.to) +
      '">' +
      escapeHtml(t('layoutHintApply', { to: correction.to })) +
      '</button>' +
      '</div>'
    );
  }

  function renderEmptyStateHtml(query, options) {
    options = options || {};
    var hasCategories =
      options.categoryIds && options.categoryIds.length && options.categoryMap;
    var html = '<div class="df-quick-search__empty df-quick-search__empty--zero">';

    // Categories count as a result — skip «Ничего не найдено…» when chips are shown
    if (!hasCategories) {
      html +=
        '<p class="df-quick-search__empty-message">' +
        escapeHtml(t('emptyMessage', { q: query })) +
        '</p>';
    }

    // v0.0.36 — layout-suggest empty-state UI temporarily disabled
    // if (options.layoutSuggestion) {
    //   html +=
    //     '<p class="df-quick-search__layout-suggest">' +
    //     'Возможно, вы имели в виду «' +
    //     escapeHtml(options.layoutSuggestion) +
    //     '»?' +
    //     ' <button type="button" class="df-quick-search__layout-suggest-btn" data-df-quick-search-apply-layout="' +
    //     escapeHtml(options.layoutSuggestion) +
    //     '">Искать</button>' +
    //     '</p>';
    // }

    if (options.searchUrl) {
      html +=
        '<a class="df-quick-search__empty-search-link" href="' +
        escapeHtml(options.searchUrl) +
        '">' + escapeHtml(t('emptySearchLink')) + '</a>';
    }

    if (hasCategories) {
      html += renderCategoriesHtml(
        options.categoryIds,
        options.categoryMap,
        'df-quick-search__categories--empty'
      );
    }

    html += '</div>';
    return html;
  }

  function renderProductPhotosHtml(product, options) {
    var titlePlain = escapeHtml(product.title || t('untitled'));
    var showOutOfStockBadge = options.showOutOfStockBadge !== false;
    var unavailable = !isProductAvailable(product);
    var photoSlider = options.photoSlider === true;
    var hoverSecondImage = options.hoverSecondImage !== false;

    if (photoSlider) {
      var sliderUrls = collectProductImageUrls(product, MAX_PRODUCT_PHOTO_SLIDER);
      var sliderPrimary = sliderUrls[0] || '';
      var sliderSrc = sliderPrimary ? escapeHtml(sliderPrimary) : '';
      var sliderWrapClass = sliderSrc ? ' is-skeleton' : ' is-placeholder';

      if (sliderUrls.length > 1) {
        sliderWrapClass += ' has-slider';
        var html =
          '<span class="df-quick-search__product-image-wrap' +
          sliderWrapClass +
          '" data-df-qs-slider data-df-qs-slide-count="' +
          sliderUrls.length +
          '" data-df-qs-active-slide="0">';
        html +=
          '<span class="df-quick-search__product-slider" data-df-qs-slider-track role="presentation" aria-label="' +
          escapeHtml(t('productPhotosAria')) +
          '">';
        html +=
          '<span class="df-quick-search__product-slider-track" style="--df-qs-slide-count: ' +
          sliderUrls.length +
          '; --df-qs-slide-index: 0;">';

        for (var i = 0; i < sliderUrls.length; i += 1) {
          var url = escapeHtml(sliderUrls[i]);
          html +=
            '<span class="df-quick-search__product-slider-slide' +
            (i === 0 ? ' is-active' : '') +
            '" data-df-qs-slide-index="' +
            i +
            '">';
          if (i === 0) {
            html +=
              '<img class="df-quick-search__product-image" src="' +
              url +
              '" alt="' +
              titlePlain +
              '" loading="lazy" draggable="false">';
          } else {
            html +=
              '<img class="df-quick-search__product-image" data-df-qs-lazy-src="' +
              url +
              '" alt="" aria-hidden="true" draggable="false">';
          }
          html += '</span>';
        }

        html += '</span></span>';
        html += '<span class="df-quick-search__product-slider-dots" aria-hidden="true">';
        for (var d = 0; d < sliderUrls.length; d += 1) {
          html +=
            '<span class="df-quick-search__product-slider-dot' +
            (d === 0 ? ' is-active' : '') +
            '" data-df-qs-slide-dot="' +
            d +
            '"></span>';
        }
        html += '</span>';

        if (showOutOfStockBadge && unavailable) {
          html += '<span class="df-quick-search__product-badge">' + escapeHtml(t('oosBadge')) + '</span>';
        }
        html += '</span>';
        return html;
      }

      var sliderSingleOut =
        '<span class="df-quick-search__product-image-wrap' + sliderWrapClass + '">';
      if (sliderSrc) {
        sliderSingleOut +=
          '<img class="df-quick-search__product-image" src="' +
          sliderSrc +
          '" alt="' +
          titlePlain +
          '" loading="lazy">';
      }
      if (showOutOfStockBadge && unavailable) {
        sliderSingleOut +=
          '<span class="df-quick-search__product-badge">' + escapeHtml(t('oosBadge')) + '</span>';
      }
      sliderSingleOut += '</span>';
      return sliderSingleOut;
    }

    var imageUrls = collectProductImageUrls(product, hoverSecondImage ? 2 : 1);
    var primaryUrl = imageUrls[0] || '';
    var imageSrc = primaryUrl ? escapeHtml(primaryUrl) : '';
    var wrapStateClass = imageSrc ? ' is-skeleton' : ' is-placeholder';
    var secondImageSrc =
      hoverSecondImage && imageUrls.length > 1 ? escapeHtml(imageUrls[1]) : '';

    if (secondImageSrc) wrapStateClass += ' has-hover-image';

    var out = '<span class="df-quick-search__product-image-wrap' + wrapStateClass + '">';
    if (imageSrc) {
      out +=
        '<img class="df-quick-search__product-image" src="' +
        imageSrc +
        '" alt="' +
        titlePlain +
        '" loading="lazy">';
    }
    if (secondImageSrc) {
      out +=
        '<img class="df-quick-search__product-image df-quick-search__product-image--hover" src="' +
        secondImageSrc +
        '" alt="" aria-hidden="true" loading="lazy">';
    }
    if (showOutOfStockBadge && unavailable) {
      out += '<span class="df-quick-search__product-badge">' + escapeHtml(t('oosBadge')) + '</span>';
    }
    out += '</span>';
    return out;
  }

  function renderProductCardHtml(product, options) {
    options = options || {};
    var showPhotos = options.showPhotos;
    var showPrices = options.showPrices;
    var query = options.query || '';
    var titleHtml = highlightQueryInText(product.title || t('untitled'), query);
    var url = escapeHtml(resolveProductUrl(product) || '#');
    var price = toPrice(product.price_min);
    var oldPrice = getProductOldPrice(product, price);
    var html = '<a class="df-quick-search__product" href="' + url + '" data-df-quick-search-product>';

    if (showPhotos) {
      html += renderProductPhotosHtml(product, options);
    }

    html += '<span class="df-quick-search__product-title">' + titleHtml + '</span>';

    if (showPrices) {
      html += '<span class="df-quick-search__product-prices">';
      if (oldPrice > 0) {
        html += '<span class="df-quick-search__product-price-old">' + formatPrice(oldPrice) + '</span>';
      }
      html += '<span class="df-quick-search__product-price">' + formatPrice(price) + '</span>';
      html += '</span>';
    }

    html += '</a>';
    return html;
  }

  function renderProductsHtml(options) {
    var products = options.products || [];
    if (!products.length) return '';

    var totalProducts = options.totalProducts != null ? options.totalProducts : products.length;
    var showPhotos = options.showPhotos;
    var showPrices = options.showPrices;
    var hoverSecondImage = options.hoverSecondImage !== false;
    var photoSlider = options.photoSlider === true;
    var hasMore = options.hasMore;
    var loadMoreLabel = options.loadMoreLabel || t('showMore');
    var hideTitle = options.hideTitle;
    var extraClass = options.extraClass || '';
    var query = options.query || '';
    var allResultsUrl = options.allResultsUrl || '';
    var showAllResultsLink = !!options.showAllResultsLink && !!allResultsUrl;
    var sortHtml = options.sortHtml || '';

    var html = '<div class="df-quick-search__products' + (extraClass ? ' ' + extraClass : '') + '">';

    if (!hideTitle || sortHtml) {
      html += '<div class="df-quick-search__products-header">';
      if (!hideTitle) {
        html +=
          '<div class="df-quick-search__section-title">' +
          escapeHtml(t('products')) +
          ' <span class="df-quick-search__section-count">(' +
          totalProducts +
          ')</span></div>';
      }
      html += sortHtml;
      html += '</div>';
    }

    html += '<div class="df-quick-search__product-grid">';

    var showOutOfStockBadge = options.showOutOfStockBadge !== false;

    products.forEach(function (product) {
      html += renderProductCardHtml(product, {
        showPhotos: showPhotos,
        showPrices: showPrices,
        showOutOfStockBadge: showOutOfStockBadge,
        hoverSecondImage: hoverSecondImage,
        photoSlider: photoSlider,
        query: query,
      });
    });

    html += '</div>';

    if (hasMore) {
      html +=
        '<button type="button" class="df-quick-search__load-more" data-df-quick-search-load-more>' +
        escapeHtml(loadMoreLabel) +
        '</button>';
    }

    if (showAllResultsLink) {
      html +=
        '<a class="df-quick-search__all-results" href="' +
        escapeHtml(allResultsUrl) +
        '">' +
        escapeHtml(t('allResults')) +
        ' (' +
        totalProducts +
        ')</a>';
    }

    html += '</div>';
    return html;
  }

  function bindResultTabs(state, resultsNode) {
    var tablist = resultsNode.querySelector('[data-df-quick-search-tabs]');
    if (!tablist) return;

    var tabs = tablist.querySelectorAll('[role="tab"]');
    if (!tabs.length) return;

    function setActiveTab(tabName, scrollToTop) {
      var changed = state.activeTab !== tabName;
      state.activeTab = tabName;

      tabs.forEach(function (tab) {
        var isActive = tab.getAttribute('data-df-quick-search-tab') === tabName;
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
        tab.classList.toggle('is-active', isActive);
        tab.tabIndex = isActive ? 0 : -1;
      });

      resultsNode.querySelectorAll('[data-df-quick-search-tabpanel]').forEach(function (panel) {
        var isActive = panel.getAttribute('data-df-quick-search-tabpanel') === tabName;
        panel.classList.toggle('is-active', isActive);
        panel.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      if (scrollToTop && changed && state.resultsNode) {
        state.resultsNode.scrollTop = 0;
      }
    }

    if (state.activeTab !== 'products' && state.activeTab !== 'articles') {
      state.activeTab = 'products';
    }

    if (state.activeTab === 'articles' && !resultsNode.querySelector('[data-df-quick-search-tab="articles"]')) {
      state.activeTab = 'products';
    }

    setActiveTab(state.activeTab, false);

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function (event) {
        event.preventDefault();
        setActiveTab(tab.getAttribute('data-df-quick-search-tab'), true);
      });

      tab.addEventListener('keydown', function (event) {
        var currentIndex = Array.prototype.indexOf.call(tabs, tab);
        var nextIndex = currentIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          nextIndex = (currentIndex + 1) % tabs.length;
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        tabs[nextIndex].focus();
        setActiveTab(tabs[nextIndex].getAttribute('data-df-quick-search-tab'), true);
      });
    });
  }

  function showSearchLoading(state) {
    if (!state.resultsNode) return;

    var spinner = state.spinnerNode;
    if (!spinner) return;

    spinner.classList.add('is-visible');
    spinner.setAttribute('aria-hidden', 'false');
    spinner.setAttribute('aria-busy', 'true');
    state.isLoading = true;
  }

  function hideSearchLoading(state) {
    if (!state.resultsNode) return;

    var spinner = state.spinnerNode;
    if (!spinner) return;

    spinner.classList.remove('is-visible');
    spinner.setAttribute('aria-hidden', 'true');
    spinner.removeAttribute('aria-busy');
    state.isLoading = false;
  }

  function getSidebarCategoryScrollNode(contentNode) {
    return (
      contentNode.querySelector(
        '.df-quick-search__sidebar--with-articles .df-quick-search__categories--sidebar .df-quick-search__category-list'
      ) || contentNode.querySelector('.df-quick-search__categories--sidebar')
    );
  }

  function getSidebarArticleScrollNode(contentNode) {
    return (
      contentNode.querySelector(
        '.df-quick-search__sidebar--with-articles .df-quick-search__articles--sidebar .df-quick-search__article-list'
      ) || contentNode.querySelector('.df-quick-search__articles--sidebar')
    );
  }

  /**
   * Adaptive desktop sidebar split (categories + articles).
   * Both fit → categories hug natural height; articles take the rest.
   * Overflow → start at min(natural, half), give leftover to the side still
   * short; when both need scroll keep each ≥25% and ≤70% of available.
   */
  function allocateSidebarSplitHeights(available, catNatural, artNatural, options) {
    options = options || {};
    var minRatio = options.minRatio != null ? options.minRatio : SIDEBAR_SPLIT_MIN_RATIO;
    var maxRatio = options.maxRatio != null ? options.maxRatio : SIDEBAR_SPLIT_MAX_RATIO;
    available = Math.max(0, Math.floor(Number(available) || 0));
    catNatural = Math.max(0, Number(catNatural) || 0);
    artNatural = Math.max(0, Number(artNatural) || 0);

    if (available <= 0) {
      return { categories: 0, articles: 0 };
    }

    if (catNatural + artNatural <= available) {
      return {
        categories: Math.round(catNatural),
        articles: available - Math.round(catNatural),
      };
    }

    var half = available / 2;
    var minFloor = available * minRatio;
    var maxCap = available * maxRatio;
    var catH = Math.min(catNatural, half);
    var artH = Math.min(artNatural, half);
    var bothNeedScroll = catNatural > catH && artNatural > artH;

    if (bothNeedScroll) {
      catH = Math.max(catH, Math.min(minFloor, catNatural));
      artH = Math.max(artH, Math.min(minFloor, artNatural));
      if (catH + artH > available) {
        var scale = available / (catH + artH);
        catH *= scale;
        artH = available - catH;
      }
    }

    var left = available - catH - artH;
    if (left > 0.5) {
      var catDef = Math.max(0, catNatural - catH);
      var artDef = Math.max(0, artNatural - artH);

      if (catDef > 0 && artDef > 0) {
        var totalDef = catDef + artDef;
        var catAdd = left * (catDef / totalDef);
        var artAdd = left - catAdd;

        if (catH + catAdd > maxCap) {
          var overCat = catH + catAdd - maxCap;
          catAdd -= overCat;
          artAdd += overCat;
        }
        if (artH + artAdd > maxCap) {
          var overArt = artH + artAdd - maxCap;
          artAdd -= overArt;
          catAdd += overArt;
        }

        catH += catAdd;
        artH += artAdd;
      } else if (catDef > 0) {
        catH += left;
        artH = available - catH;
      } else if (artDef > 0) {
        artH += left;
        catH = available - artH;
      } else if (catNatural >= artNatural) {
        catH += left;
      } else {
        artH += left;
      }
    }

    catH = Math.round(catH);
    artH = available - catH;
    if (artH < 0) {
      artH = 0;
      catH = available;
    }

    return { categories: catH, articles: artH };
  }

  function getSidebarSplitGapPx(sidebar) {
    if (!sidebar || !window.getComputedStyle) return SIDEBAR_SPLIT_GAP_FALLBACK;
    var style = window.getComputedStyle(sidebar);
    var gap = parseFloat(style.rowGap || style.gap);
    return isNaN(gap) ? SIDEBAR_SPLIT_GAP_FALLBACK : gap;
  }

  function clearSidebarSplitInline(el) {
    if (!el) return;
    el.style.flex = '';
    el.style.height = '';
    el.style.maxHeight = '';
    el.style.minHeight = '';
  }

  function measureSidebarSectionNaturalHeight(el) {
    if (!el) return 0;
    var prevFlex = el.style.flex;
    var prevHeight = el.style.height;
    var prevMaxHeight = el.style.maxHeight;
    var prevMinHeight = el.style.minHeight;
    var prevOverflow = el.style.overflow;

    el.style.flex = '0 0 auto';
    el.style.height = 'auto';
    el.style.maxHeight = 'none';
    el.style.minHeight = '0';
    el.style.overflow = 'hidden';

    var height = el.scrollHeight;

    el.style.flex = prevFlex;
    el.style.height = prevHeight;
    el.style.maxHeight = prevMaxHeight;
    el.style.minHeight = prevMinHeight;
    el.style.overflow = prevOverflow;

    return height;
  }

  function applySidebarSplitHeight(el, px) {
    if (!el) return;
    var h = Math.max(0, Math.round(px));
    el.style.flex = '0 0 ' + h + 'px';
    el.style.height = h + 'px';
    el.style.maxHeight = h + 'px';
    el.style.minHeight = '0';
  }

  function layoutSidebarSplit(state) {
    if (typeof window !== 'undefined' && window.innerWidth < 768) return;
    var contentNode = state && state.contentNode;
    if (!contentNode) return;

    var sidebar = contentNode.querySelector('.df-quick-search__sidebar--with-articles');
    if (!sidebar) return;

    var categories = sidebar.querySelector('.df-quick-search__categories--sidebar');
    var articles = sidebar.querySelector('.df-quick-search__articles--sidebar');
    if (!categories || !articles) return;

    clearSidebarSplitInline(categories);
    clearSidebarSplitInline(articles);

    var available = sidebar.clientHeight;
    var usable = Math.max(0, available - getSidebarSplitGapPx(sidebar));
    var catNatural = measureSidebarSectionNaturalHeight(categories);
    var artNatural = measureSidebarSectionNaturalHeight(articles);
    var sizes = allocateSidebarSplitHeights(usable, catNatural, artNatural);

    applySidebarSplitHeight(categories, sizes.categories);
    applySidebarSplitHeight(articles, sizes.articles);
  }

  function captureScrollPositions(state) {
    var contentNode = state.contentNode;
    if (!contentNode) return null;

    var main = contentNode.querySelector('.df-quick-search__main');
    var sidebarCategories = getSidebarCategoryScrollNode(contentNode);
    var sidebarArticles = getSidebarArticleScrollNode(contentNode);

    return {
      main: main ? main.scrollTop : 0,
      sidebarCategories: sidebarCategories ? sidebarCategories.scrollTop : 0,
      sidebarArticles: sidebarArticles ? sidebarArticles.scrollTop : 0,
      results: state.resultsNode ? state.resultsNode.scrollTop : 0,
    };
  }

  function restoreScrollPositions(state, positions) {
    if (!positions) return;

    var contentNode = state.contentNode;
    if (!contentNode) return;

    var main = contentNode.querySelector('.df-quick-search__main');
    var sidebarCategories = getSidebarCategoryScrollNode(contentNode);
    var sidebarArticles = getSidebarArticleScrollNode(contentNode);

    if (main) main.scrollTop = positions.main;
    if (sidebarCategories) sidebarCategories.scrollTop = positions.sidebarCategories || 0;
    if (sidebarArticles) sidebarArticles.scrollTop = positions.sidebarArticles;
    if (state.resultsNode) state.resultsNode.scrollTop = positions.results;
  }

  function renderResults(state, products, collections, query, matchedArticles, renderOptions) {
    var contentNode = state.contentNode;
    if (!contentNode) return;

    var root = state.root;
    var showPhotos = parseBool(root.dataset.showPhotos, true);
    var showPrices = parseBool(root.dataset.showPrices, true);
    var showOutOfStockBadge = parseBool(root.dataset.showOutOfStockBadge, true);
    var hoverSecondImage = parseBool(root.dataset.hoverSecondImage, true);
    var photoSlider = parseBool(root.dataset.productPhotoSlider, false);
    var showCategories = parseBool(root.dataset.showCategories, true);
    var articles = Array.isArray(matchedArticles) ? matchedArticles : state.matchedArticles || [];
    var totalArticles = articles.length;
    var tabArticles = articles.slice(0, state.articlesVisibleCount);
    var hasMoreArticles = totalArticles > state.articlesVisibleCount;
    var articlesTabCountText = hasMoreArticles
      ? t('countOf', { visible: tabArticles.length, total: totalArticles })
      : String(totalArticles);
    var sidebarArticles = articles.slice(0, state.sidebarArticlesVisibleCount);
    var hasMoreSidebarArticles = totalArticles > state.sidebarArticlesVisibleCount;
    var sidebarArticlesCountText = hasMoreSidebarArticles
      ? t('countOf', { visible: sidebarArticles.length, total: totalArticles })
      : String(totalArticles);
    var indexArticleTotal = state.articlesIndexTotal || state.articles.length || 0;
    var serverArticleTotal = state.articlesServerTotal || 0;
    var indexIncomplete = isArticlesIndexIncomplete(serverArticleTotal, indexArticleTotal);
    var allArticlesUrl = resolveArticlesBlogUrl(state.articlesBlogUrl, state.articleBlogHandles);
    var showAllArticlesLink = shouldShowAllArticlesLink(hasMoreArticles, totalArticles > 0, indexIncomplete);
    var showAllSidebarArticlesLink = shouldShowAllArticlesLink(
      hasMoreSidebarArticles,
      totalArticles > 0,
      indexIncomplete
    );

    var preparedProducts = getPreparedProducts(state, products);

    var visibleProducts = preparedProducts.slice(0, state.visibleCount);
    var hasMoreProducts = preparedProducts.length > state.visibleCount;
    var totalProducts = preparedProducts.length;
    var searchPageUrl = buildSearchPageUrl(query);
    var loadMoreLabel =
      t('loadMoreOf', { visible: visibleProducts.length, total: totalProducts });

    var categoryMap = showCategories ? buildCategoryMap(preparedProducts, collections, query) : Object.create(null);
    var categoryIds = Object.keys(categoryMap);

    // Empty = zero products + zero articles. Suggested/title-matched categories
    // must NOT skip layout suggestion or the zero-results empty state.
    if (!visibleProducts.length && !totalArticles) {
      var emptyCategoryMap = Object.create(null);
      var emptyCategoryIds = [];

      if (showCategories) {
        if (categoryIds.length) {
          emptyCategoryMap = categoryMap;
          emptyCategoryIds = categoryIds;
        } else {
          var suggested = getSuggestedCategories(collections, query, 5);
          suggested.forEach(function (item, index) {
            emptyCategoryMap['suggest-' + index] = item;
            emptyCategoryIds.push('suggest-' + index);
          });
        }
      }

      var layoutSuggestion = '';
      if (!(state.layoutCorrection && state.layoutCorrection.to)) {
        layoutSuggestion = String(state.layoutSuggestion || '').trim();
        if (!layoutSuggestion) {
          var swappedEmpty = swapKeyboardLayout(query);
          if (swappedEmpty && swappedEmpty.length >= MIN_QUERY_LENGTH) {
            layoutSuggestion = swappedEmpty;
          }
        }
      }
      state.layoutSuggestion = null;

      contentNode.innerHTML = renderEmptyStateHtml(query, {
        searchUrl: searchPageUrl,
        categoryIds: emptyCategoryIds,
        categoryMap: emptyCategoryMap,
        layoutSuggestion: layoutSuggestion,
      });
      hideSearchLoading(state);
      bindLayoutFixActions(state);
      return;
    }

    var hasCategories = showCategories && categoryIds.length;
    var hasArticles = totalArticles > 0;
    var hasProducts = visibleProducts.length > 0;
    var showMobileTabs = hasArticles;
    var html = '<div class="df-quick-search__layout df-quick-search__layout--split">';

    if (state.layoutCorrection && state.layoutCorrection.to) {
      html += renderLayoutHintHtml(state.layoutCorrection);
    }

    if (hasCategories) {
      html += renderCategoriesHtml(categoryIds, categoryMap, 'df-quick-search__categories--rail');
    }

    if (showMobileTabs) {
      html +=
        '<div class="df-quick-search__tabs" role="tablist" aria-label="' +
        escapeHtml(t('resultsAria')) +
        '" data-df-quick-search-tabs>';
      html +=
        '<button type="button" class="df-quick-search__tab is-active" role="tab" data-df-quick-search-tab="products" aria-selected="true" aria-controls="df-qs-tabpanel-products" id="df-qs-tab-products" tabindex="0">' +
        escapeHtml(t('products')) +
        ' <span class="df-quick-search__tab-count">(' +
        totalProducts +
        ')</span></button>';

      if (hasArticles) {
        html +=
          '<button type="button" class="df-quick-search__tab" role="tab" data-df-quick-search-tab="articles" aria-selected="false" aria-controls="df-qs-tabpanel-articles" id="df-qs-tab-articles" tabindex="-1">' +
          escapeHtml(t('articles')) +
          ' <span class="df-quick-search__tab-count">(' +
          totalArticles +
          ')</span></button>';
      }

      html += '</div>';
    }

    html += '<div class="df-quick-search__split-body">';

    var sidebarHtml = '';

    if (hasCategories) {
      sidebarHtml += renderCategoriesHtml(categoryIds, categoryMap, 'df-quick-search__categories--sidebar');
    }

    if (hasArticles) {
      sidebarHtml += renderArticlesHtml({
        articles: sidebarArticles,
        countText: sidebarArticlesCountText,
        extraClass: 'df-quick-search__articles--sidebar',
        query: query,
        showLoadMore: hasMoreSidebarArticles,
        loadMoreAttr: 'data-df-quick-search-load-more-sidebar-articles',
        showAllArticlesLink: showAllSidebarArticlesLink,
        allArticlesUrl: allArticlesUrl,
      });
    }

    if (sidebarHtml) {
      var sidebarClass =
        'df-quick-search__sidebar' +
        (hasCategories && hasArticles ? ' df-quick-search__sidebar--with-articles' : '');
      html +=
        '<aside class="' + sidebarClass + '" aria-label="' +
        escapeHtml(t('sidebarAria')) +
        '">' +
        sidebarHtml +
        '</aside>';
    }

    html += '<div class="df-quick-search__main">';
    html +=
      '<div class="df-quick-search__tabpanel is-active" role="tabpanel" id="df-qs-tabpanel-products" aria-labelledby="df-qs-tab-products" aria-hidden="false" data-df-quick-search-tabpanel="products">';

    if (hasProducts) {
      var showAllResults = parseBool(root.dataset.showAllResults, true);
      html += renderProductsHtml({
        products: visibleProducts,
        totalProducts: totalProducts,
        showPhotos: showPhotos,
        showPrices: showPrices,
        showOutOfStockBadge: showOutOfStockBadge,
        hoverSecondImage: hoverSecondImage,
        photoSlider: photoSlider,
        hasMore: hasMoreProducts,
        loadMoreLabel: loadMoreLabel,
        query: query,
        showAllResultsLink: showAllResults,
        allResultsUrl: searchPageUrl,
        sortHtml: renderProductSortSelectHtml(state, preparedProducts),
      });
    } else {
      html += '<div class="df-quick-search__empty">' + escapeHtml(t('emptyProducts')) + '</div>';
    }

    html += '</div>';

    if (hasArticles) {
      html +=
        '<div class="df-quick-search__tabpanel df-quick-search__articles-panel" role="tabpanel" id="df-qs-tabpanel-articles" aria-labelledby="df-qs-tab-articles" aria-hidden="true" data-df-quick-search-tabpanel="articles">';
      html += renderArticlesHtml({
        articles: tabArticles,
        countText: articlesTabCountText,
        extraClass: 'df-quick-search__articles--mobile',
        query: query,
        showLoadMore: hasMoreArticles,
        hideSectionTitle: showMobileTabs,
        showAllArticlesLink: showAllArticlesLink,
        allArticlesUrl: allArticlesUrl,
      });
      html += '</div>';
    }

    html += '</div></div></div>';

    contentNode.innerHTML = html;
    hideSearchLoading(state);
    bindProductImages(contentNode);
    bindProductSliders(contentNode);
    bindResultTabs(state, contentNode);
    bindProductSort(state, query);
    bindLayoutFixActions(state);
    bindAnalyticsDelegation(state);

    state.currentQuery = query;
    announceSearchResults(state.liveNode, totalProducts, totalArticles);

    if (renderOptions && renderOptions.preserveScroll) {
      restoreScrollPositions(state, renderOptions.preserveScroll);
    }

    window.requestAnimationFrame(function () {
      recalculateSidebarArticlesAfterRender(state, query);
    });

    var loadMoreBtn = contentNode.querySelector('[data-df-quick-search-load-more]');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', function (event) {
        handleLoadMoreProducts(state, query, event);
      });
    }

    var loadMoreArticlesBtn = contentNode.querySelector('[data-df-quick-search-load-more-articles]');
    if (loadMoreArticlesBtn) {
      loadMoreArticlesBtn.addEventListener('click', function (event) {
        handleLoadMoreArticles(state, query, event);
      });
    }

    var loadMoreSidebarArticlesBtn = contentNode.querySelector('[data-df-quick-search-load-more-sidebar-articles]');
    if (loadMoreSidebarArticlesBtn) {
      loadMoreSidebarArticlesBtn.addEventListener('click', function (event) {
        handleLoadMoreSidebarArticles(state, event);
      });
    }
  }

  function bindProductSort(state, query) {
    var select = state.contentNode
      ? state.contentNode.querySelector('[data-df-quick-search-sort]')
      : null;
    if (!select) return;

    select.addEventListener('change', function () {
      var next = select.value || 'relevance';
      if (next === 'popularity' && !productsHavePopularityData(state.allProducts)) {
        next = 'relevance';
      }
      if (state.productSort === next) return;
      state.productSort = next;
      var preserveScroll = captureScrollPositions(state);
      renderResults(
        state,
        state.allProducts,
        state.collections,
        query || state.currentQuery,
        state.matchedArticles,
        { preserveScroll: preserveScroll }
      );
    });
  }

  function clearResults(state, options) {
    options = options || {};
    if (state.contentNode) state.contentNode.innerHTML = '';
    hideSearchLoading(state);
    state.allProducts = [];
    state.matchedArticles = [];
    state.visibleCount = 0;
    state.articlesVisibleCount = 0;
    state.sidebarArticlesVisibleCount = 0;
    state.layoutCorrection = null;
    state.layoutSuggestion = null;
    state.activeTab = 'products';
    state.currentQuery = '';

    if (options.showRecent !== false) {
      renderRecentSearches(state);
    }
  }

  function showSearchError(state) {
    if (!state.contentNode) return;
    state.contentNode.innerHTML =
      '<div class="df-quick-search__empty">' + escapeHtml(t('searchError')) + '</div>';
    hideSearchLoading(state);
  }

  function matchesTrigger(target, selectors) {
    for (var i = 0; i < selectors.length; i += 1) {
      try {
        if (target.closest(selectors[i])) return true;
      } catch (error) {
        /* invalid selector */
      }
    }
    return false;
  }

  function applyLayerZIndex(state) {
    state.overlay.style.zIndex = String(Z_OVERLAY);
    state.panel.style.zIndex = String(Z_PANEL);
  }

  function lockBodyScroll(state) {
    if (state.bodyScrollLocked) return;

    state.savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    document.documentElement.classList.add('df-quick-search-open');
    document.body.classList.add('df-quick-search-open');
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + state.savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    state.bodyScrollLocked = true;
  }

  function unlockBodyScroll(state) {
    if (!state.bodyScrollLocked) return;

    document.documentElement.classList.remove('df-quick-search-open');
    document.body.classList.remove('df-quick-search-open');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, state.savedScrollY || 0);
    state.bodyScrollLocked = false;
  }

  function openPanel(state, triggerElement) {
    applyLayerZIndex(state);
    state.root.classList.add('is-open');
    state.overlay.classList.add('is-open');
    state.panel.classList.add('is-open');
    state.overlay.removeAttribute('aria-hidden');
    state.panel.removeAttribute('aria-hidden');
    state.lastFocusElement = triggerElement || document.activeElement;
    lockBodyScroll(state);
    if (state.showArticles && state.articlesLazyLoad) {
      ensureArticlesLoaded(state);
    }
    renderRecentSearches(state);
    window.setTimeout(function () {
      state.input.focus();
    }, 50);
  }

  function closePanel(state) {
    state.root.classList.remove('is-open');
    state.overlay.classList.remove('is-open');
    state.panel.classList.remove('is-open');
    state.overlay.setAttribute('aria-hidden', 'true');
    state.panel.setAttribute('aria-hidden', 'true');
    unlockBodyScroll(state);
    state.input.value = '';
    state.searchSeq += 1;
    if (state.searchAbort) {
      state.searchAbort.abort();
      state.searchAbort = null;
    }
    window.clearTimeout(state.searchTimer);
    clearResults(state, { showRecent: false });
    clearSearchCache();

    var restoreTarget = state.lastFocusElement;
    state.lastFocusElement = null;
    if (restoreTarget && typeof restoreTarget.focus === 'function') {
      window.setTimeout(function () {
        restoreTarget.focus();
      }, 0);
    }
  }

  function bindTriggers(state) {
    document.addEventListener(
      'click',
      function (event) {
        if (!matchesTrigger(event.target, state.selectors)) return;
        if (state.root.contains(event.target)) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openPanel(state, event.target);
      },
      true
    );
  }

  function bindLayoutFixActions(state) {
    if (!state.contentNode) return;
    var buttons = state.contentNode.querySelectorAll('[data-df-quick-search-apply-layout]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        event.preventDefault();
        var nextQuery = String(btn.getAttribute('data-df-quick-search-apply-layout') || '').trim();
        if (!nextQuery || !state.input) return;
        state.input.value = nextQuery;
        state.layoutCorrection = null;
        state.layoutSuggestion = null;
        showSearchLoading(state);
        runSearch(state, nextQuery);
      });
    });
  }

  function applySearchPayload(state, query, products, seq, layoutCorrection, layoutSuggestion) {
    if (seq !== state.searchSeq) return false;

    state.currentQuery = query;
    state.allProducts = products;
    state.visibleCount = state.resultsLimit;
    state.activeTab = 'products';
    state.layoutCorrection = layoutCorrection || null;
    state.layoutSuggestion =
      layoutCorrection && layoutCorrection.to
        ? null
        : layoutSuggestion
          ? String(layoutSuggestion)
          : null;

    if (state.showArticles) {
      if (state.articlesLazyLoad) {
        ensureArticlesLoaded(state);
      }
      state.matchedArticles = filterArticles(state.articles, query, products);
    } else {
      state.matchedArticles = [];
    }
    state.articlesVisibleCount = state.matchedArticles.length ? state.articlesDisplayLimit : 0;
    state.sidebarArticlesVisibleCount = state.matchedArticles.length ? state.articlesDisplayLimit : 0;

    var preparedProducts = getPreparedProducts(state, products);
    var hasHits = preparedProducts.length > 0 || state.matchedArticles.length > 0;
    // Recent chips: only successful queries (products and/or articles).
    // Save the query that produced hits (corrected string when layout fix worked).
    if (hasHits) {
      saveRecentSearch(query);
    }
    if (!hasHits) {
      pushAnalytics('df_qs_zero_results', { df_qs_query: query });
    } else if (layoutCorrection) {
      pushAnalytics('df_qs_layout_fix', {
        df_qs_query: layoutCorrection.from,
        df_qs_corrected: layoutCorrection.to,
      });
    }

    renderResults(state, products, state.collections, query, state.matchedArticles);
    return true;
  }

  function runSearch(state, query) {
    state.searchSeq += 1;
    var seq = state.searchSeq;
    state.currentQuery = query;
    state.layoutCorrection = null;
    state.layoutSuggestion = null;

    pushAnalytics('df_qs_search', { df_qs_query: query });

    if (state.searchAbort) {
      state.searchAbort.abort();
    }

    state.searchAbort = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var signal = state.searchAbort ? state.searchAbort.signal : null;

    return fetchProducts(query, state.resultsLimit, signal)
      .then(function (products) {
        if (seq !== state.searchSeq) return;

        var preparedProducts = getPreparedProducts(state, products);
        var articlesPreview = [];
        if (state.showArticles) {
          if (state.articlesLazyLoad) {
            ensureArticlesLoaded(state);
          }
          articlesPreview = filterArticles(state.articles, query, products);
        }

        // Categories never count as search hits — layout retry runs on zero products+articles.
        var hasHits = preparedProducts.length > 0 || articlesPreview.length > 0;
        if (hasHits) {
          applySearchPayload(state, query, products, seq, null, null);
          return;
        }

        var swapped = swapKeyboardLayout(query);
        if (!swapped || swapped.length < MIN_QUERY_LENGTH || swapped === query) {
          applySearchPayload(state, query, products, seq, null, null);
          return;
        }

        return fetchProducts(swapped, state.resultsLimit, signal).then(function (swappedProducts) {
          if (seq !== state.searchSeq) return;

          var swappedPrepared = getPreparedProducts(state, swappedProducts);
          var swappedArticles = state.showArticles
            ? filterArticles(state.articles, swapped, swappedProducts)
            : [];
          var swappedHasHits = swappedPrepared.length > 0 || swappedArticles.length > 0;

          if (swappedHasHits) {
            applySearchPayload(state, swapped, swappedProducts, seq, {
              from: query,
              to: swapped,
            }, null);
            return;
          }

          // Retry empty too — keep original query, offer «имели в виду …?»
          applySearchPayload(state, query, products, seq, null, swapped);
        });
      })
      .catch(function (error) {
        if (seq !== state.searchSeq) return;
        if (error && error.name === 'AbortError') return;
        showSearchError(state);
      });
  }

  function initWidget(root) {
    if (!root || root.dataset.dfQuickSearchReady === 'true') return;

    var isEnabled = parseBool(root.dataset.enabled, true);
    if (!isEnabled) {
      root.hidden = true;
      root.dataset.dfQuickSearchReady = 'true';
      return;
    }

    root.classList.add('df-quick-search--ratio-' + getImageRatio(root));

    var overlay = root.querySelector('[data-df-quick-search-overlay]');
    var panel = root.querySelector('[data-df-quick-search-panel]');
    var input = root.querySelector('[data-df-quick-search-input]');
    var closeBtn = root.querySelector('[data-df-quick-search-close]');
    var form = root.querySelector('.df-quick-search__form');
    var resultsNode = panel ? panel.querySelector('[data-df-quick-search-results]') : null;
    var contentNode = resultsNode
      ? resultsNode.querySelector('[data-df-quick-search-results-content]') || resultsNode
      : null;
    var spinnerNode = resultsNode ? resultsNode.querySelector('[data-df-quick-search-spinner]') : null;
    var liveNode = resultsNode ? resultsNode.querySelector('[data-df-quick-search-live]') : null;
    var collections = getCollections(root);
    var showArticles = parseBool(root.dataset.showArticles, false);
    var articlesLazyLoad = parseBool(root.dataset.articlesLazyLoad, true);
    var articlesCacheKey = String(root.dataset.articlesCacheKey || '').trim();
    var articles = [];
    var articlesLoaded = false;

    if (showArticles && !articlesLazyLoad) {
      articles = loadArticlesList(root, articlesCacheKey);
      articlesLoaded = true;
    }

    var showOutOfStockBadge = parseBool(root.dataset.showOutOfStockBadge, true);
    var selectors = parseSelectors(root.dataset.triggerSelectors);
    var ratioClass = 'df-quick-search--ratio-' + getImageRatio(root);
    var resultsLimit = parseResultsLimit(root.dataset.resultsLimit);
    var articlesDisplayLimit = parseArticlesDisplayLimit(root.dataset.articlesDisplayLimit);
    var articlesBlogUrl = parseArticlesBlogUrl(root.dataset.articlesBlogUrl);
    var articleBlogHandles = root.dataset.articleBlogHandles || 'blog';
    var articlesServerTotal = parsePositiveInt(root.dataset.articlesServerTotal, 0, 0, 1000000);

    if (!overlay || !panel || !input || !resultsNode || !contentNode) {
      root.dataset.dfQuickSearchReady = 'true';
      return;
    }

    panel.classList.add(ratioClass);

    var state = {
      root: root,
      overlay: overlay,
      panel: panel,
      input: input,
      resultsNode: resultsNode,
      contentNode: contentNode,
      spinnerNode: spinnerNode,
      liveNode: liveNode,
      selectors: selectors,
      collections: collections,
      articles: articles,
      articlesLoaded: articlesLoaded,
      articlesLazyLoad: articlesLazyLoad,
      articlesCacheKey: articlesCacheKey,
      showArticles: showArticles,
      showOutOfStockBadge: showOutOfStockBadge,
      articlesBlogUrl: articlesBlogUrl,
      articleBlogHandles: articleBlogHandles,
      articlesServerTotal: articlesServerTotal,
      articlesIndexTotal: articles.length,
      resultsLimit: resultsLimit,
      articlesDisplayLimit: articlesDisplayLimit,
      allProducts: [],
      matchedArticles: [],
      visibleCount: 0,
      articlesVisibleCount: 0,
      sidebarArticlesVisibleCount: 0,
      productSort: 'relevance',
      layoutCorrection: null,
      layoutSuggestion: null,
      activeTab: 'products',
      isLoading: false,
      searchSeq: 0,
      searchAbort: null,
      searchTimer: 0,
      bodyScrollLocked: false,
      savedScrollY: 0,
      currentQuery: '',
      lastFocusElement: null,
      analyticsBound: false,
    };

    state.focusTrapHandler = function (event) {
      if (event.key !== 'Tab' || !root.classList.contains('is-open')) return;

      var focusable = getFocusableElements(panel);
      if (focusable.length < 2) return;

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    panel.addEventListener('keydown', state.focusTrapHandler);

    state.recalculateSidebarOnResize = debounce(function () {
      if (!root.classList.contains('is-open')) return;

      layoutSidebarSplit(state);

      if (!state.matchedArticles.length) return;
      var previousCount = state.sidebarArticlesVisibleCount;
      var calculated = computeSidebarArticlesVisibleCount(state, contentNode);
      if (calculated !== previousCount) {
        state.sidebarArticlesVisibleCount = calculated;
        updateSidebarArticlesSection(state, state.currentQuery || '');
      }
    }, RESIZE_DEBOUNCE_MS);

    window.addEventListener('resize', state.recalculateSidebarOnResize);

    applyLayerZIndex(state);
    bindTriggers(state);

    overlay.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      closePanel(state);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function (event) {
        event.preventDefault();
        closePanel(state);
      });
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input.value.trim();
        if (query.length >= MIN_QUERY_LENGTH) {
          window.location.href = buildSearchPageUrl(query);
        }
      });
    }

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && root.classList.contains('is-open')) {
        closePanel(state);
      }
    });

    input.addEventListener('input', function () {
      var query = input.value.trim();
      window.clearTimeout(state.searchTimer);

      if (query.length < MIN_QUERY_LENGTH) {
        state.searchSeq += 1;
        if (state.searchAbort) {
          state.searchAbort.abort();
          state.searchAbort = null;
        }
        clearResults(state);
        return;
      }

      state.searchTimer = window.setTimeout(function () {
        runSearch(state, query);
      }, DEBOUNCE_MS);

      showSearchLoading(state);
    });

    root.dataset.dfQuickSearchReady = 'true';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();

