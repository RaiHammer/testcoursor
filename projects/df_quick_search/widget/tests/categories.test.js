/**
 * Unit tests for category chip label disambiguation (v0.0.26).
 * Run: node widget/tests/categories.test.js
 */

var assert = require('assert');

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

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- attachCollectionParents ---

var tree = [
  { id: 1, title: 'Мужское', url: '/collection/men', level: 1 },
  { id: 2, title: 'Шорты', url: '/collection/shorty', level: 2 },
  { id: 3, title: 'Брюки', url: '/collection/bryuki', level: 2 },
  { id: 4, title: 'Женское', url: '/collection/women', level: 1 },
  { id: 5, title: 'Шорты', url: '/collection/shorty-2', level: 2 },
];
attachCollectionParents(tree);

assert.strictEqual(tree[0].parentTitle, '');
assert.strictEqual(tree[1].parentTitle, 'Мужское');
assert.strictEqual(tree[2].parentTitle, 'Мужское');
assert.strictEqual(tree[3].parentTitle, '');
assert.strictEqual(tree[4].parentTitle, 'Женское');

// --- unique title stays plain ---

var uniqueMap = {
  10: { title: 'Брюки', url: '/collection/bryuki', parentTitle: 'Мужское' },
};
assert.strictEqual(buildCategoryDisplayLabels(uniqueMap)['10'], 'Брюки');

// --- duplicate titles get parent · title ---

var dupMap = {
  2: { title: 'Шорты', url: '/collection/shorty', parentTitle: 'Мужское' },
  3: { title: 'Брюки', url: '/collection/bryuki', parentTitle: 'Мужское' },
  5: { title: 'Шорты', url: '/collection/shorty-2', parentTitle: 'Женское' },
};
var dupLabels = buildCategoryDisplayLabels(dupMap);
assert.strictEqual(dupLabels['2'], 'Мужское · Шорты');
assert.strictEqual(dupLabels['3'], 'Брюки');
assert.strictEqual(dupLabels['5'], 'Женское · Шорты');

// --- case-insensitive / trim collision ---

var caseMap = {
  a: { title: '  шорты ', url: '/collection/shorty', parentTitle: 'Мужское' },
  b: { title: 'Шорты', url: '/collection/shorty-2', parentTitle: 'Женское' },
};
var caseLabels = buildCategoryDisplayLabels(caseMap);
assert.strictEqual(caseLabels.a, 'Мужское · шорты');
assert.strictEqual(caseLabels.b, 'Женское · Шорты');

// --- no parent → path hint ---

var noParentMap = {
  x: { title: 'Шорты', url: '/collection/shorty', parentTitle: '' },
  y: { title: 'Шорты', url: '/collection/shorty-2', parentTitle: '' },
};
var pathLabels = buildCategoryDisplayLabels(noParentMap);
assert.strictEqual(pathLabels.x, 'Шорты · shorty');
assert.strictEqual(pathLabels.y, 'Шорты · shorty-2');

// --- still-colliding Parent · Title → escalate to path ---

var sameParentDup = {
  p1: { title: 'Шорты', url: '/collection/shorty', parentTitle: 'Мужское' },
  p2: { title: 'Шорты', url: '/collection/shorty-2', parentTitle: 'Мужское' },
};
var escalateLabels = buildCategoryDisplayLabels(sameParentDup);
assert.strictEqual(escalateLabels.p1, 'Шорты · shorty');
assert.strictEqual(escalateLabels.p2, 'Шорты · shorty-2');

// --- escapeHtml for labels with special chars ---

assert.strictEqual(escapeHtml('Мужское · Шорты'), 'Мужское · Шорты');
assert.strictEqual(escapeHtml('A < B & "C"'), 'A &lt; B &amp; &quot;C&quot;');

console.log('categories.test.js: OK');
