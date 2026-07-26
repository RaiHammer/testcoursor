/**
 * Unit tests for adaptive desktop sidebar split (v1.0.4).
 * Run: node widget/tests/sidebar-split.test.js
 */

var assert = require('assert');

var SIDEBAR_SPLIT_MIN_RATIO = 0.25;
var SIDEBAR_SPLIT_MAX_RATIO = 0.7;

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

function assertSum(sizes, available) {
  assert.strictEqual(sizes.categories + sizes.articles, available);
}

// 1) Few categories, many articles (both fit) → cats hug, arts fill rest
(function () {
  var sizes = allocateSidebarSplitHeights(500, 80, 200);
  assertSum(sizes, 500);
  assert.strictEqual(sizes.categories, 80);
  assert.strictEqual(sizes.articles, 420);
})();

// 2) Many categories, few articles (overflow) → arts hug natural, cats expand past 50%
(function () {
  var sizes = allocateSidebarSplitHeights(400, 400, 80);
  assertSum(sizes, 400);
  assert.strictEqual(sizes.articles, 80);
  assert.ok(sizes.categories > 200, 'categories should expand above half');
  assert.strictEqual(sizes.categories, 320);
})();

// 3) Both fit exactly → natural heights (cats hug; arts get leftover 0)
(function () {
  var sizes = allocateSidebarSplitHeights(300, 120, 180);
  assertSum(sizes, 300);
  assert.strictEqual(sizes.categories, 120);
  assert.strictEqual(sizes.articles, 180);
})();

// 4) Both overflow equally → soft share near 50%, neither crushed
(function () {
  var sizes = allocateSidebarSplitHeights(500, 800, 800);
  assertSum(sizes, 500);
  assert.ok(sizes.categories >= 125, 'min ~25%');
  assert.ok(sizes.articles >= 125, 'min ~25%');
  assert.ok(sizes.categories <= 350, 'max ~70%');
  assert.ok(sizes.articles <= 350, 'max ~70%');
  assert.ok(Math.abs(sizes.categories - sizes.articles) <= 1);
})();

// 5) Both overflow, cats hungrier → cats get more leftover but ≤70%
(function () {
  var sizes = allocateSidebarSplitHeights(500, 900, 400);
  assertSum(sizes, 500);
  assert.ok(sizes.categories >= sizes.articles);
  assert.ok(sizes.categories <= 350);
  assert.ok(sizes.articles >= 125);
})();

// 6) Zero / empty available
(function () {
  var sizes = allocateSidebarSplitHeights(0, 100, 100);
  assert.deepStrictEqual(sizes, { categories: 0, articles: 0 });
})();

// 7) Cats tiny, arts huge overflow → cats hug, arts take rest
(function () {
  var sizes = allocateSidebarSplitHeights(500, 50, 600);
  assertSum(sizes, 500);
  assert.strictEqual(sizes.categories, 50);
  assert.strictEqual(sizes.articles, 450);
})();

console.log('sidebar-split.test.js: all passed');
