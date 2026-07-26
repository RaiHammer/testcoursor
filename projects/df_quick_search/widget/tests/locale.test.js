/**
 * Unit tests for df_quick_search locale / currency helpers (v1.1.2).
 * Run: node widget/tests/locale.test.js
 */


var assert = require('assert');



var STRINGS = {

  ru: {

    products: 'Товары',

    untitled: 'Без названия',

    loadMoreOf: 'Показать ещё ({visible} из {total})',

  },

  en: {

    products: 'Products',

    untitled: 'Untitled',

    loadMoreOf: 'Show more ({visible} of {total})',

  },

};



/**

 * Mirrors widget/snippet.js normalizeLocaleString — keep in sync.

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



function detectUiLocaleFromApi(api) {

  if (api === 'en') return 'en';

  return 'ru';

}



function detectApiLocaleFromRaw(raw) {

  if (raw == null || raw === '') return null;

  var primary = normalizeLocaleString(raw).toLowerCase().split(/[-_]/)[0].trim();

  if (!primary || primary === 'object') return null;

  return primary;

}



/** Detect raw with fallbacks (undefined → ru), matching detectRawLocale contract. */

function detectRawLocaleFromSources(sources) {

  var i;

  var locale = '';

  for (i = 0; i < sources.length; i++) {

    locale = normalizeLocaleString(sources[i]);

    if (locale) return locale;

  }

  return 'ru';

}



function t(key, vars, uiLocale) {

  var locale = uiLocale === 'en' ? 'en' : 'ru';

  var dict = STRINGS[locale] || STRINGS.ru;

  var str = (dict && dict[key]) || STRINGS.ru[key] || key;

  if (vars && typeof vars === 'object') {

    Object.keys(vars).forEach(function (name) {

      str = String(str).split('{' + name + '}').join(String(vars[name]));

    });

  }

  return str;

}



function buildProductsByIdUrl(ids, lang) {

  var path = '/products_by_id/' + ids.join(',') + '.json';

  var safeLang = detectApiLocaleFromRaw(lang) || 'ru';

  path += '?lang=' + encodeURIComponent(safeLang);

  return path;

}



function mergeEnrichTitleAndPrice(product, full) {

  return {

    title: product.title || full.title,

    price_min:

      full.price_min != null && full.price_min !== ''

        ? full.price_min

        : product.price_min,

  };

}



function formatMoneyAmount(value, delimiter, separator, forceNoCents) {
  var amount = Number(value);
  if (isNaN(amount)) amount = 0;
  var noCents = forceNoCents || Math.abs(amount - Math.round(amount)) < 1e-9;
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
    return normalizeCurrencyCode(
      value.code || value.currency_code || value.iso_code || value.iso || value.currency
    );
  }
  var code = String(value).trim().toUpperCase();
  if (!code || /^\[OBJECT\s/i.test(code)) return '';
  if (code === 'RUB') return 'RUR';
  if (code === 'RUR' || code === 'USD' || code === 'EUR') return code;
  if (/^[A-Z]{3}$/.test(code)) return code;
  return '';
}

function currencyMoneyPreset(code) {
  if (code === 'USD') return { unit: '$', format: '%u%n' };
  if (code === 'EUR') return { unit: '€', format: '%n %u' };
  if (code === 'RUR' || code === 'RUB') return { unit: '₽', format: '%n %u' };
  return null;
}

function isPlausibleShopConfigValue(key, value) {
  if (value == null || value === '') return false;
  if (typeof value !== 'object' || Array.isArray(value)) return true;
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
  if (key === 'locale') return true;
  return false;
}

/**
 * Mirrors formatPrice core: money object + currencyCode preset override (v1.1.2).
 */
function formatPrice(price, money, currencyCode) {
  var num = Number(price || 0);
  var value = isNaN(num) ? 0 : num;
  var code = normalizeCurrencyCode(currencyCode);
  var preset = currencyMoneyPreset(code);
  var unit = '₽';
  var format = '%n %u';
  var delimiter = ' ';
  var separator = '.';
  var forceNoCents = false;

  if (money && typeof money === 'object' && !Array.isArray(money)) {
    if (!isPlausibleShopConfigValue('money_with_currency_format', money)) {
      money = null;
    } else {
      if (money.unit != null && money.unit !== '') unit = String(money.unit);
      if (money.format) format = String(money.format);
      else if (money.format_string) format = String(money.format_string);
      if (money.delimiter != null) delimiter = String(money.delimiter);
      if (money.separator != null) separator = String(money.separator);
      forceNoCents = !!(
        money.show_price_without_cents === true ||
        money.show_price_without_cents === 1 ||
        money.show_price_without_cents === '1'
      );
    }
  } else if (typeof money === 'string' && money) {
    if (!preset) {
      var amountForTemplate = formatMoneyAmount(value, delimiter, separator, forceNoCents);
      var withAmount = money
        .replace(/\{\{\s*amount_no_decimals\s*\}\}/gi, String(Math.round(value)))
        .replace(/\{\{\s*amount\s*\}\}/gi, amountForTemplate)
        .replace(/%n/g, amountForTemplate)
        .replace(/%u/g, unit);
      if (withAmount !== money) return withAmount;
    }
  }

  if (preset) {
    unit = preset.unit;
    format = preset.format;
  }

  var amount = formatMoneyAmount(value, delimiter, separator, forceNoCents);
  return String(format).replace(/%n/g, amount).replace(/%u/g, unit);
}

/** @deprecated alias — keep old call sites green */
function formatPriceWithMoney(price, money) {
  return formatPrice(price, money, null);
}

function buildSearchCacheKey(query, locale, currency) {
  var safeLocale = detectApiLocaleFromRaw(locale) || detectUiLocaleFromApi(null) || 'ru';
  return String(query || '').trim().toLowerCase() + '::' + safeLocale + '::' + currency;
}



// --- normalizeLocaleString ---



assert.strictEqual(normalizeLocaleString('en'), 'en');

assert.strictEqual(normalizeLocaleString(' ru '), 'ru');

assert.strictEqual(normalizeLocaleString(undefined), '');

assert.strictEqual(normalizeLocaleString(null), '');

assert.strictEqual(normalizeLocaleString({ code: 'en' }), 'en');

assert.strictEqual(normalizeLocaleString({ locale: 'ru' }), 'ru');

assert.strictEqual(normalizeLocaleString({ iso: 'en-US' }), 'en-US');

assert.strictEqual(normalizeLocaleString({ iso_code: 'ru_RU' }), 'ru_RU');

assert.strictEqual(normalizeLocaleString({ lang: 'en' }), 'en');

assert.strictEqual(normalizeLocaleString({ language: 'en' }), 'en');

assert.strictEqual(normalizeLocaleString({ language: { code: 'en' } }), 'en');

assert.strictEqual(normalizeLocaleString({ title: 'English', code: 'en' }), 'en');

assert.strictEqual(normalizeLocaleString({ title: 'English' }), '');

assert.strictEqual(normalizeLocaleString('[object Object]'), '');

assert.strictEqual(normalizeLocaleString({}), '');



// --- detectApiLocaleFromRaw (object → string; undefined → null then callers use ru) ---



assert.strictEqual(detectApiLocaleFromRaw('en'), 'en');

assert.strictEqual(detectApiLocaleFromRaw('en-US'), 'en');

assert.strictEqual(detectApiLocaleFromRaw('ru_RU'), 'ru');

assert.strictEqual(detectApiLocaleFromRaw({ code: 'en' }), 'en');

assert.strictEqual(detectApiLocaleFromRaw({ locale: 'en-GB' }), 'en');

assert.strictEqual(detectApiLocaleFromRaw({ iso: 'ru' }), 'ru');

assert.strictEqual(detectApiLocaleFromRaw(undefined), null);

assert.strictEqual(detectApiLocaleFromRaw(null), null);

assert.strictEqual(detectApiLocaleFromRaw({}), null);

assert.strictEqual(detectApiLocaleFromRaw('[object Object]'), null);



assert.strictEqual(detectRawLocaleFromSources([undefined]), 'ru');

assert.strictEqual(detectRawLocaleFromSources([null, '']), 'ru');

assert.strictEqual(detectRawLocaleFromSources([{ code: 'en' }]), 'en');

assert.strictEqual(detectRawLocaleFromSources([{}, 'ru']), 'ru');

assert.strictEqual(detectRawLocaleFromSources(['en']), 'en');



assert.strictEqual(detectUiLocaleFromApi('en'), 'en');

assert.strictEqual(detectUiLocaleFromApi('de'), 'ru');

assert.strictEqual(detectUiLocaleFromApi(null), 'ru');



assert.strictEqual(t('products', null, 'en'), 'Products');

assert.strictEqual(t('products', null, 'ru'), 'Товары');

assert.strictEqual(t('products', null, 'de'), 'Товары');

assert.strictEqual(t('loadMoreOf', { visible: 12, total: 50 }, 'en'), 'Show more (12 of 50)');



assert.strictEqual(

  buildProductsByIdUrl([1, 2], 'en'),

  '/products_by_id/1,2.json?lang=en'

);

assert.strictEqual(

  buildProductsByIdUrl([1], { code: 'en' }),

  '/products_by_id/1.json?lang=en'

);

assert.strictEqual(buildProductsByIdUrl([1], null), '/products_by_id/1.json?lang=ru');

assert.strictEqual(buildProductsByIdUrl([1], undefined), '/products_by_id/1.json?lang=ru');



var merged = mergeEnrichTitleAndPrice(

  { title: 'EN Title', price_min: 132 },

  { title: 'RU Title', price_min: 1.6896 }

);

assert.strictEqual(merged.title, 'EN Title');

assert.strictEqual(merged.price_min, 1.6896);



var mergedFallback = mergeEnrichTitleAndPrice(

  { title: '', price_min: 0 },

  { title: 'EN from enrich', price_min: 2.9 }

);

assert.strictEqual(mergedFallback.title, 'EN from enrich');

assert.strictEqual(mergedFallback.price_min, 2.9);



assert.strictEqual(
  formatPriceWithMoney(227, { format: '%n %u', unit: '₽', delimiter: ' ', separator: '.' }),
  '227 ₽'
);
assert.strictEqual(
  formatPriceWithMoney(2.9056, { format: '%u%n', unit: '$', delimiter: ' ', separator: '.' }),
  '$2.91'
);
assert.strictEqual(
  formatPriceWithMoney(1.6896, { format: '%u%n', unit: '$', delimiter: ' ', separator: '.' }),
  '$1.69'
);

// v1.1.2: USD via currency_code when money missing / incomplete / whole-config mistaken
assert.strictEqual(formatPrice(0.81, null, 'USD'), '$0.81');
assert.strictEqual(formatPrice(0.81, undefined, 'USD'), '$0.81');
assert.strictEqual(
  formatPrice(0.81, { format: '%n %u', unit: '₽', delimiter: ' ', separator: '.' }, 'USD'),
  '$0.81'
);
assert.strictEqual(
  formatPrice(2.9056, { format: '%u%n', unit: '$', delimiter: ' ', separator: '.' }, 'USD'),
  '$2.91'
);
assert.strictEqual(formatPrice(12.5, null, 'EUR'), '12.50 €');
assert.strictEqual(formatPrice(227, null, 'RUR'), '227 ₽');
assert.strictEqual(formatPrice(227, null, 'RUB'), '227 ₽');

// String money format + USD code → preset ($0.81), not "%n %u" with ₽
assert.strictEqual(formatPrice(0.81, '%n %u', 'USD'), '$0.81');
assert.strictEqual(formatPrice(0.81, '%u%n', 'USD'), '$0.81');
assert.strictEqual(formatPrice(0.81, '{{amount}} $', null), '0.81 $');

// Whole Shop.config blob must not be treated as money object
assert.strictEqual(
  isPlausibleShopConfigValue('money_with_currency_format', {
    currency_code: 'USD',
    money_with_currency_format: { unit: '$', format: '%u%n' },
    account_id: 1,
  }),
  false
);
assert.strictEqual(
  isPlausibleShopConfigValue('money_with_currency_format', {
    unit: '$',
    format: '%u%n',
    delimiter: ' ',
    separator: '.',
  }),
  true
);
assert.strictEqual(
  formatPrice(
    0.81,
    {
      currency_code: 'USD',
      money_with_currency_format: { unit: '$', format: '%u%n' },
      account_id: 1,
    },
    'USD'
  ),
  '$0.81'
);

assert.strictEqual(normalizeCurrencyCode('usd'), 'USD');
assert.strictEqual(normalizeCurrencyCode('RUB'), 'RUR');
assert.strictEqual(normalizeCurrencyCode({ code: 'USD' }), 'USD');
assert.strictEqual(normalizeCurrencyCode({}), '');




assert.strictEqual(buildSearchCacheKey('Book', 'en', 'USD'), 'book::en::USD');

assert.strictEqual(buildSearchCacheKey('Book', { code: 'en' }, 'USD'), 'book::en::USD');

assert.strictEqual(buildSearchCacheKey('Book', undefined, 'USD'), 'book::ru::USD');

assert.notStrictEqual(

  buildSearchCacheKey('book', 'en', 'USD'),

  buildSearchCacheKey('book', 'en', 'RUR')

);



// Regression: naive String(object) must never become API locale

assert.notStrictEqual(String({ code: 'en' }), 'en');

assert.ok(String({ code: 'en' }).indexOf('object') !== -1);

assert.strictEqual(detectApiLocaleFromRaw({ code: 'en' }), 'en');



console.log('locale.test.js: OK');


