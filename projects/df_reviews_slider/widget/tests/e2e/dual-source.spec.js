/**
 * Dual-source lazy Yandex e2e smoke (Playwright).
 * Run: cd widget/tests && npx playwright test
 */

const path = require('path');
const { pathToFileURL } = require('url');
const { test, expect } = require('playwright/test');

const FIXTURE = path.join(__dirname, '..', 'fixtures', 'dual-source.html');
const FIXTURE_URL = pathToFileURL(FIXTURE).href;

async function waitForWidgetReady(page, sectionId) {
  const root = page.locator(`#${sectionId} [data-df-reviews-root]`);
  await expect(root).toHaveAttribute('data-df-reviews-ready', 'true');
  return root;
}

function countYandexSlides(section) {
  return section.locator(
    '.df-reviews__slide[data-source="yandex"]:not(.df-reviews__slide--empty)'
  );
}

test.describe('dual-source lazy Yandex', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(FIXTURE_URL);
  });

  test('tabs ON, default insales — Yandex not in DOM', async ({ page }) => {
    const section = page.locator('#w-slider-tabs');
    await waitForWidgetReady(page, 'w-slider-tabs');

    const root = section.locator('[data-df-reviews-root]');
    await expect(root).toHaveAttribute('data-yandex-count', '2');
    await expect(countYandexSlides(section)).toHaveCount(0);

    const wrapper = section.locator('[data-df-reviews-wrapper]');
    await expect(wrapper.locator('[data-source="yandex"]')).toHaveCount(0);
  });

  test('click Yandex tab — slides mount', async ({ page }) => {
    const section = page.locator('#w-slider-tabs');
    await waitForWidgetReady(page, 'w-slider-tabs');

    await section.locator('[data-source-tab="yandex"]').click();
    await expect(countYandexSlides(section)).toHaveCount(2);
  });

  test('masonry tab counts before and after Yandex mount', async ({ page }) => {
    const section = page.locator('#w-masonry-tabs');
    await waitForWidgetReady(page, 'w-masonry-tabs');

    const insalesCount = section.locator('[data-df-tab-count="insales"]');
    const yandexCount = section.locator('[data-df-tab-count="yandex"]');

    await expect(insalesCount).toHaveText('3');
    await expect(yandexCount).toHaveText('2');

    await section.locator('[data-source-tab="yandex"]').click();
    await expect(countYandexSlides(section)).toHaveCount(2);
    await expect(yandexCount).toHaveText('2');
  });

  test('hide_yandex ON — tab hidden, Yandex not in DOM', async ({ page }) => {
    const section = page.locator('#w-hide-yandex');
    await waitForWidgetReady(page, 'w-hide-yandex');

    const yandexTab = section.locator('[data-source-tab="yandex"]');
    await expect(yandexTab).toBeHidden();
    await expect(countYandexSlides(section)).toHaveCount(0);
  });

  test('masonry server pagination shows full page count upfront', async ({ page }) => {
    function nativeItem(id, author) {
      return `<div class="masonry-reviews-item">
        <div class="masonry-reviews-item__content">
          <div class="review-title-container" data-json="{&quot;id&quot;:${id},&quot;author&quot;:&quot;${author}&quot;,&quot;rating&quot;:5,&quot;content&quot;:&quot;Text&quot;,&quot;created_at&quot;:&quot;2024-01-01T00:00:00+03:00&quot;}"></div>
          <div class="review-header"><div class="author">${author}</div></div>
          <div class="review-content">Text</div>
        </div>
      </div>`;
    }

    const batchItems = [];
    for (let i = 1; i <= 20; i++) {
      batchItems.push(nativeItem(400 + i, 'Page2 ' + i));
    }

    await page.route('**/masonry-large-batch**', async (route) => {
      const url = route.request().url();
      const pageNum = url.includes('page=3') ? 3 : 2;
      const items = pageNum === 2 ? batchItems : batchItems.map((item, idx) => item.replace('Page2', 'Page3').replace(String(400 + idx + 1), String(500 + idx + 1)));
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <div class="masonry-reviews-list">${items.join('')}</div>
          <div class="pagination_container">
            <button class="loadmore_button" type="button" data-url="https://fixture.test/masonry-large-batch?page=${pageNum + 1}">Загрузить еще</button>
          </div>
        </body></html>`,
      });
    });

    const section = page.locator('#w-masonry-paginated');
    await waitForWidgetReady(page, 'w-masonry-paginated');

    const pagesList = section.locator('[data-df-pages-list] .df-reviews__page');
    await expect(pagesList).toHaveCount(4);
    await expect(section.locator('[data-df-page="45"]')).toBeVisible();
    await expect(section.locator('[data-df-page="1"]')).toHaveClass(/is-active/);

    const wrapper = section.locator('[data-df-reviews-wrapper]');
    await expect(wrapper.locator('.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)')).toHaveCount(4);

    await section.locator('[data-df-page="2"]').click();
    await expect(wrapper.locator('.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)')).toHaveCount(20);

    const root = section.locator('[data-df-reviews-root]');
    await expect(root).toHaveAttribute('data-pagination-page', '2');
    await expect(root).toHaveAttribute('data-insales-batch-page', '2');
    await expect(section.locator('[data-df-page="2"]')).toHaveClass(/is-active/);

    await section.locator('[data-df-insales-loadmore]').click();
    await expect(wrapper.locator('.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)')).toHaveCount(40);
    await expect(root).toHaveAttribute('data-insales-batch-page', '3');

    const pageButtons = await pagesList.count();
    expect(pageButtons).toBeLessThan(10);
    expect(pageButtons).not.toBe(60);
  });

  test('masonry load-more parses native masonry-reviews-list', async ({ page }) => {
    await page.route('**/native-reviews-more**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <div class="masonry-reviews-list">
            <div class="masonry-reviews-item">
              <div class="masonry-reviews-item__content">
                <div class="review-title-container" data-json="{&quot;id&quot;:301,&quot;author&quot;:&quot;Native 3&quot;,&quot;rating&quot;:5,&quot;content&quot;:&quot;Text 3&quot;,&quot;created_at&quot;:&quot;2024-01-03T00:00:00+03:00&quot;}"></div>
                <div class="review-header"><div class="author">Native 3</div></div>
                <div class="review-content">Text 3</div>
              </div>
            </div>
            <div class="masonry-reviews-item">
              <div class="masonry-reviews-item__content">
                <div class="review-title-container" data-json="{&quot;id&quot;:302,&quot;author&quot;:&quot;Native 4&quot;,&quot;rating&quot;:4,&quot;content&quot;:&quot;Text 4&quot;,&quot;created_at&quot;:&quot;2024-01-04T00:00:00+03:00&quot;}"></div>
                <div class="review-header"><div class="author">Native 4</div></div>
                <div class="review-content">Text 4</div>
              </div>
            </div>
          </div>
          <div class="pagination_container">
            <button class="loadmore_button" type="button" data-url="https://fixture.test/native-reviews-more?page=3">Загрузить еще</button>
          </div>
        </body></html>`,
      });
    });

    const section = page.locator('#w-masonry-loadmore');
    await waitForWidgetReady(page, 'w-masonry-loadmore');

    await expect(section.locator('[data-df-insales-loadmore]')).toHaveAttribute(
      'data-url',
      'https://fixture.test/native-reviews-more?page=2'
    );

    await section.locator('[data-df-insales-loadmore]').click();
    await expect(section.locator('.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)')).toHaveCount(4);
    await expect(section.locator('[data-df-insales-loadmore]')).toHaveAttribute('data-url', 'https://fixture.test/native-reviews-more?page=3');
  });

  test('slider load-more insales — AJAX does not duplicate yandex', async ({ page }) => {
    await page.route('**/insales-more**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<!DOCTYPE html><html><body>
          <div data-df-reviews-wrapper>
            <div class="df-reviews__slide" data-source="insales" data-review-id="i3" data-rating="5">
              <div class="df-reviews__author">InSales 3</div>
            </div>
            <div class="df-reviews__slide" data-source="insales" data-review-id="i4" data-rating="5">
              <div class="df-reviews__author">InSales 4</div>
            </div>
          </div>
        </body></html>`,
      });
    });

    const section = page.locator('#w-slider-loadmore');
    await waitForWidgetReady(page, 'w-slider-loadmore');

    await expect(countYandexSlides(section)).toHaveCount(0);

    await section.locator('[data-df-insales-loadmore]').click();
    await expect(section.locator('.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)')).toHaveCount(4);
    await expect(countYandexSlides(section)).toHaveCount(0);

    const root = section.locator('[data-df-reviews-root]');
    await expect(root).toHaveAttribute('data-yandex-count', '2');
    await expect(section.locator('[data-df-reviews-pool] [data-source="yandex"]')).toHaveCount(0);
  });

  test('editor layout change — rescan without DOM leak', async ({ page }) => {
    const section = page.locator('#w-layout-rescan');
    const root = section.locator('[data-df-reviews-root]');
    await waitForWidgetReady(page, 'w-layout-rescan');

    await expect(countYandexSlides(section)).toHaveCount(0);
    const yandexBefore = await section.locator('.df-reviews__slide[data-source="yandex"]').count();
    const insalesBefore = await section.locator(
      '.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)'
    ).count();

    await root.evaluate((el) => {
      el.setAttribute('data-layout', 'masonry');
      el.setAttribute('data-page-size', '6');
      el.dataset.dfReviewsLayout = 'slider';
    });
    await page.waitForTimeout(300);

    await expect(root).toHaveAttribute('data-layout', 'masonry');
    await expect(countYandexSlides(section)).toHaveCount(0);

    const yandexAfter = await section.locator('.df-reviews__slide[data-source="yandex"]').count();
    expect(yandexAfter).toBe(yandexBefore);

    const insalesAfter = await section.locator(
      '.df-reviews__slide[data-source="insales"]:not(.df-reviews__slide--empty)'
    ).count();
    expect(insalesAfter).toBeGreaterThanOrEqual(insalesBefore);
    expect(insalesAfter).toBeLessThanOrEqual(insalesBefore + 2);

    const rootsInSection = await section.locator('[data-df-reviews-root]').count();
    expect(rootsInSection).toBe(1);
    await expect(root).toHaveAttribute('data-yandex-count', '2');
  });
});
