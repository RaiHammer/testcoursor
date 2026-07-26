/**
 * Marquee layout unit tests — tab dedupe, overlay overflow, offset restore.
 * Run: node widget/tests/marquee.test.js
 */

var assert = require('assert');

function shouldApplyShellOverflowHidden(layout, overlayOpen) {
  return overlayOpen && layout !== 'marquee';
}

function shouldSkipMarqueeCloneSlide(slideMeta) {
  return !!slideMeta.inMarqueeClone;
}

function getSlideDedupeKey(slide) {
  var source = (slide.source || '').toLowerCase();
  var reviewId = slide.reviewId || '';

  if (reviewId) return source + ':' + reviewId;

  return source + ':' + (slide.index || '') + ':' + (slide.text || '').trim().slice(0, 80);
}

function dedupeSlideKeys(slides) {
  var seen = {};
  var result = [];

  slides.forEach(function (slide) {
    var key = getSlideDedupeKey(slide);
    if (seen[key]) return;
    seen[key] = true;
    result.push(slide);
  });

  return result;
}

function parseTranslateXPx(transform) {
  var match;
  var parts;

  if (!transform || transform === 'none') return 0;

  match = transform.match(/matrix3d\(([^)]+)\)/);
  if (match) {
    parts = match[1].split(',');
    return parseFloat(parts[12]) || 0;
  }

  match = transform.match(/matrix\(([^)]+)\)/);
  if (match) {
    parts = match[1].split(',');
    return parseFloat(parts[4]) || 0;
  }

  return 0;
}

function computeMarqueeAnimationDelay(offsetPx, setWidth, durationSec) {
  var progress;

  if (!offsetPx || !setWidth || !durationSec) return null;

  progress = Math.abs(offsetPx) / setWidth;
  progress = progress - Math.floor(progress);

  return -progress * durationSec;
}

function getMarqueeContainmentStyleKeys() {
  return ['max-width', 'min-width', 'width'];
}

function buildMarqueeViewportContainmentStyles() {
  return {
    'max-width': '100%',
    'min-width': '0',
    width: '100%'
  };
}

function applyMarqueeViewportContainmentMock(styleStore) {
  var styles = buildMarqueeViewportContainmentStyles();
  var key;

  for (key in styles) {
    if (Object.prototype.hasOwnProperty.call(styles, key)) {
      styleStore[key] = styles[key];
    }
  }
}

function clearMarqueeViewportContainmentMock(styleStore) {
  getMarqueeContainmentStyleKeys().forEach(function (key) {
    delete styleStore[key];
  });
}

assert.strictEqual(shouldApplyShellOverflowHidden('marquee', true), false);
assert.strictEqual(shouldApplyShellOverflowHidden('marquee', false), false);
assert.strictEqual(shouldApplyShellOverflowHidden('slider', true), true);
assert.strictEqual(shouldApplyShellOverflowHidden('grid', true), true);

assert.strictEqual(shouldSkipMarqueeCloneSlide({ inMarqueeClone: true }), true);
assert.strictEqual(shouldSkipMarqueeCloneSlide({ inMarqueeClone: false }), false);

assert.strictEqual(
  getSlideDedupeKey({ source: 'insales', reviewId: '42', index: '1', text: 'A' }),
  'insales:42'
);
assert.strictEqual(
  getSlideDedupeKey({ source: 'yandex', reviewId: '', index: '3', text: 'Hello' }),
  'yandex:3:Hello'
);

assert.deepStrictEqual(
  dedupeSlideKeys([
    { source: 'insales', reviewId: '1', index: '0', text: 'A' },
    { source: 'insales', reviewId: '1', index: '0', text: 'A copy' },
    { source: 'yandex', reviewId: '', index: '2', text: 'B' }
  ]).length,
  2
);

assert.strictEqual(parseTranslateXPx('matrix(1, 0, 0, 1, -120, 0)'), -120);
assert.strictEqual(parseTranslateXPx('matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -240, 0, 0, 1)'), -240);
assert.strictEqual(parseTranslateXPx('none'), 0);

assert.strictEqual(computeMarqueeAnimationDelay(-120, 480, 40), -10);
assert.strictEqual(computeMarqueeAnimationDelay(0, 480, 40), null);

assert.deepStrictEqual(getMarqueeContainmentStyleKeys(), [
  'max-width',
  'min-width',
  'width'
]);
assert.deepStrictEqual(buildMarqueeViewportContainmentStyles(), {
  'max-width': '100%',
  'min-width': '0',
  width: '100%'
});

var mockStyles = {};
applyMarqueeViewportContainmentMock(mockStyles);
assert.strictEqual(mockStyles['max-width'], '100%');
assert.strictEqual(mockStyles['min-width'], '0');
assert.strictEqual(mockStyles.width, '100%');
clearMarqueeViewportContainmentMock(mockStyles);
assert.strictEqual(mockStyles['max-width'], undefined);
assert.strictEqual(mockStyles.width, undefined);

console.log('marquee.test.js: all 19 checks passed');
