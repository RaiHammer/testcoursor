# -*- coding: utf-8 -*-
from pathlib import Path

path = Path(r"D:\Важное\Личный джарвис\projects\df_quick_search\widget\snippet.js")
text = path.read_text(encoding="utf-8")

pairs = [
    (
        """    var sidebarArticlesCountText = hasMoreSidebarArticles
      ? sidebarArticles.length + ' из ' + totalArticles
      : String(totalArticles);""",
        """    var sidebarArticlesCountText = hasMoreSidebarArticles
      ? t('countOf', { visible: sidebarArticles.length, total: totalArticles })
      : String(totalArticles);""",
    ),
    (
        """          '<button type=\"button\" class=\"df-quick-search__load-more\" data-df-quick-search-load-more-sidebar-articles>Показать ещё</button>'""",
        """          '<button type=\"button\" class=\"df-quick-search__load-more\" data-df-quick-search-load-more-sidebar-articles>' +
            escapeHtml(t('showMore')) +
            '</button>'""",
    ),
    (
        """            '\">Все статьи →</a>'""",
        """            '\">' + escapeHtml(t('allArticles')) + '</a>'""",
    ),
    (
        """    var loadMoreLabel = 'Показать ещё (' + visibleProducts.length + ' из ' + totalProducts + ')';""",
        """    var loadMoreLabel = t('loadMoreOf', { visible: visibleProducts.length, total: totalProducts });""",
    ),
    (
        """    var countText = hasMore ? visibleCount + ' из ' + totalArticles : String(totalArticles);""",
        """    var countText = hasMore
      ? t('countOf', { visible: visibleCount, total: totalArticles })
      : String(totalArticles);""",
    ),
    (
        """            '>Показать ещё</button>'""",
        """            '>' + escapeHtml(t('showMore')) + '</button>'""",
    ),
    (
        """      renderChipSection('recent', 'Недавние запросы', recent, 'data-df-quick-search-recent') +
      renderChipSection('popular', 'Популярные запросы', popular, 'data-df-quick-search-popular');""",
        """      renderChipSection('recent', t('recentQueries'), recent, 'data-df-quick-search-recent') +
      renderChipSection('popular', t('popularQueries'), popular, 'data-df-quick-search-popular');""",
    ),
    (
        """        '<div class=\"df-quick-search__section-title\">Статьи <span class=\"df-quick-search__section-count\">(' +""",
        """        '<div class=\"df-quick-search__section-title\">' +
        escapeHtml(t('articles')) +
        ' <span class=\"df-quick-search__section-count\">(' +""",
    ),
    (
        """        '>Показать ещё</button>';""",
        """        '>' + escapeHtml(t('showMore')) + '</button>';""",
    ),
    (
        """        '\">Все статьи →</a>';""",
        """        '\">' + escapeHtml(t('allArticles')) + '</a>';""",
    ),
    (
        """  function renderLayoutHintHtml(correction) {
    if (!correction || !correction.from || !correction.to) return '';
    return (
      '<div class=\"df-quick-search__layout-hint\" role=\"status\">' +
      '<p class=\"df-quick-search__layout-hint-text\">Показаны результаты для «' +
      escapeHtml(correction.to) +
      '» — похоже, была другая раскладка клавиатуры (запрос «' +
      escapeHtml(correction.from) +
      '»).</p>' +
      '<button type=\"button\" class=\"df-quick-search__layout-hint-apply\" data-df-quick-search-apply-layout=\"' +
      escapeHtml(correction.to) +
      '\">Заменить запрос на «' +
      escapeHtml(correction.to) +
      '»</button>' +
      '</div>'
    );
  }""",
        """  function renderLayoutHintHtml(correction) {
    if (!correction || !correction.from || !correction.to) return '';
    return (
      '<div class=\"df-quick-search__layout-hint\" role=\"status\">' +
      '<p class=\"df-quick-search__layout-hint-text\">' +
      escapeHtml(t('layoutHint', { to: correction.to, from: correction.from })) +
      '</p>' +
      '<button type=\"button\" class=\"df-quick-search__layout-hint-apply\" data-df-quick-search-apply-layout=\"' +
      escapeHtml(correction.to) +
      '\">' +
      escapeHtml(t('layoutHintApply', { to: correction.to })) +
      '</button>' +
      '</div>'
    );
  }""",
    ),
    (
        """        '<p class=\"df-quick-search__empty-message\">Ничего не найдено по запросу «' +
        escapeHtml(query) +
        '»</p>';""",
        """        '<p class=\"df-quick-search__empty-message\">' +
        escapeHtml(t('emptyMessage', { q: query })) +
        '</p>';""",
    ),
    (
        """        '\">Искать на странице поиска</a>';""",
        """        '\">' + escapeHtml(t('emptySearchLink')) + '</a>';""",
    ),
    (
        """    var titleHtml = highlightQueryInText(product.title || 'Без названия', query);
    var titlePlain = escapeHtml(product.title || 'Без названия');""",
        """    var titleHtml = highlightQueryInText(product.title || t('untitled'), query);
    var titlePlain = escapeHtml(product.title || t('untitled'));""",
    ),
    (
        """        html += '<span class=\"df-quick-search__product-badge\">Нет в наличии</span>';""",
        """        html += '<span class=\"df-quick-search__product-badge\">' + escapeHtml(t('oosBadge')) + '</span>';""",
    ),
    (
        """    var loadMoreLabel = options.loadMoreLabel || 'Показать ещё';""",
        """    var loadMoreLabel = options.loadMoreLabel || t('showMore');""",
    ),
    (
        """          '<div class=\"df-quick-search__section-title\">Товары <span class=\"df-quick-search__section-count\">(' +""",
        """          '<div class=\"df-quick-search__section-title\">' +
          escapeHtml(t('products')) +
          ' <span class=\"df-quick-search__section-count\">(' +""",
    ),
    (
        """        '\">Все результаты (' +
        totalProducts +
        ')</a>';""",
        """        '\">' +
        escapeHtml(t('allResults')) +
        ' (' +
        totalProducts +
        ')</a>';""",
    ),
    (
        """      ? tabArticles.length + ' из ' + totalArticles""",
        """      ? t('countOf', { visible: tabArticles.length, total: totalArticles })""",
    ),
    (
        """      ? sidebarArticles.length + ' из ' + totalArticles""",
        """      ? t('countOf', { visible: sidebarArticles.length, total: totalArticles })""",
    ),
    (
        """      'Показать ещё (' + visibleProducts.length + ' из ' + totalProducts + ')';""",
        """      t('loadMoreOf', { visible: visibleProducts.length, total: totalProducts });""",
    ),
    (
        """        '<div class=\"df-quick-search__tabs\" role=\"tablist\" aria-label=\"Результаты поиска\" data-df-quick-search-tabs>';""",
        """        '<div class=\"df-quick-search__tabs\" role=\"tablist\" aria-label=\"' +
        escapeHtml(t('resultsAria')) +
        '\" data-df-quick-search-tabs>';""",
    ),
    (
        """        '<button type=\"button\" class=\"df-quick-search__tab is-active\" role=\"tab\" data-df-quick-search-tab=\"products\" aria-selected=\"true\" aria-controls=\"df-qs-tabpanel-products\" id=\"df-qs-tab-products\" tabindex=\"0\">Товары <span class=\"df-quick-search__tab-count\">(' +""",
        """        '<button type=\"button\" class=\"df-quick-search__tab is-active\" role=\"tab\" data-df-quick-search-tab=\"products\" aria-selected=\"true\" aria-controls=\"df-qs-tabpanel-products\" id=\"df-qs-tab-products\" tabindex=\"0\">' +
        escapeHtml(t('products')) +
        ' <span class=\"df-quick-search__tab-count\">(' +""",
    ),
    (
        """          '<button type=\"button\" class=\"df-quick-search__tab\" role=\"tab\" data-df-quick-search-tab=\"articles\" aria-selected=\"false\" aria-controls=\"df-qs-tabpanel-articles\" id=\"df-qs-tab-articles\" tabindex=\"-1\">Статьи <span class=\"df-quick-search__tab-count\">(' +""",
        """          '<button type=\"button\" class=\"df-quick-search__tab\" role=\"tab\" data-df-quick-search-tab=\"articles\" aria-selected=\"false\" aria-controls=\"df-qs-tabpanel-articles\" id=\"df-qs-tab-articles\" tabindex=\"-1\">' +
          escapeHtml(t('articles')) +
          ' <span class=\"df-quick-search__tab-count\">(' +""",
    ),
    (
        """        '<aside class=\"' + sidebarClass + '\" aria-label=\"Категории и статьи\">' + sidebarHtml + '</aside>';""",
        """        '<aside class=\"' + sidebarClass + '\" aria-label=\"' +
        escapeHtml(t('sidebarAria')) +
        '\">' +
        sidebarHtml +
        '</aside>';""",
    ),
    (
        """      html += '<div class=\"df-quick-search__empty\">Товары не найдены</div>';""",
        """      html += '<div class=\"df-quick-search__empty\">' + escapeHtml(t('emptyProducts')) + '</div>';""",
    ),
    (
        """    state.contentNode.innerHTML = '<div class=\"df-quick-search__empty\">Ошибка поиска. Попробуйте еще раз.</div>';""",
        """    state.contentNode.innerHTML =
      '<div class=\"df-quick-search__empty\">' + escapeHtml(t('searchError')) + '</div>';""",
    ),
]

missing = []
for i, (old, new) in enumerate(pairs):
    if old not in text:
        missing.append((i, old[:120]))
    else:
        text = text.replace(old, new, 1)

path.write_text(text, encoding="utf-8")
print("applied", len(pairs) - len(missing), "of", len(pairs))
for i, sample in missing:
    print("MISSING", i, sample)
