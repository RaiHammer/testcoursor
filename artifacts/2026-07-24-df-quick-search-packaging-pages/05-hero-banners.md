# Hero-баннеры: Быстрый поиск — danforge.ru

**Продукт:** `danforge_quick_search` v1.0.9  
**Страница:** `/services/modules/quick-search-widget` (ещё не опубликована)  
**Папка:** `artifacts/2026-07-24-df-quick-search-packaging-pages/assets/hero/`  
**Стиль:** тёмный `#212528`, акцент `#fba064` (= бренд `#fba064` / RGB 251,160,100 из логотипа)  
**Принцип:** visual-led PNG + копирайт в Cover (Tilda); **реальный логотип DanForge на баннере**

---

## Логотип (источник)

Папка владельца: `D:\Важное\Личный джарвис\Логотипы\` (оригиналы **не** перемещать).

| Файл | Тип | Использование на hero |
|------|-----|------------------------|
| `Логотип на прозрачном фоне\2.png` | **Full wordmark** (белый DANFORGE + оранжевая молния), прозрачный фон | **PRIMARY** — вшит в desktop и mobile |
| `Логотип на прозрачном фоне\3.png` | Mark-only (молния + D), светлый | Референс GenerateImage |
| `Логотип на прозрачном фоне\1.png` | Full, тёмный wordmark | Для светлых фонов (не для этих hero) |
| `Логотип на прозрачном фоне\4.png` | Mark-only, тёмный D | Светлые фоны |
| `Лого\2.png` / `Лого\3.png` | Компактные full / mark | Дубликаты меньшего размера |
| `Векторный формат логотипа\…` | SVG / PDF / CDR | Мастер-вектор (цвета `#EF9C66` ≈ `#fba064`, `#2B2A29`) |

**v2 (2026-07-24):** primary PNG перезаписаны с **реальным** логотипом (не AI-wordmark). Фон сгенерирован с `reference_image_paths` на `…\2.png` (+ mark `…\3.png` для desktop), затем exact-size crop и композит `2.png` поверх.

---

## Рекомендация primary

| Слот | Файл | Вердикт |
|------|------|---------|
| **Desktop Cover** | `danforge-quick-search-hero-1920x800.png` | **PRIMARY** — Layout B: sidebar + карточки по краям, центр свободен, лого top-left |
| **Mobile Cover** | `danforge-quick-search-hero-mobile-1080x1350.png` | **PRIMARY** — лого top-center, центр под H1 |
| Gen sources | `hero-desktop-gen.png`, `hero-mobile-gen.png` | Исходники gen до кропа/композита |

**Почему:** атмосфера Layout B + бренд-марка из `Логотипы`, центр тёмный под текст Tilda.

---

## Текущее состояние

- Страница в Tilda создана, **не опубликована**.
- Скрины демо уже вставлены владельцем (галерея / ниже fold).
- Primary hero **обновлены**: реальный логотип на баннере.

---

## Предложение: как сосуществуют баннер и скрины

```
Viewport 1 (Cover / Hero)
  └─ Баннер = атмосфера + РЕАЛЬНЫЙ логотип DanForge
  └─ Текст только в Tilda: H1 + lead + CTA + бейдж inSales
  └─ НЕ класть скрины демо в первый экран

Ниже fold (Блок 3 «Как это выглядит»)
  └─ Скрины armedf.ru / демо — доказательство продукта
```

---

## Размеры

| Файл | px | Назначение |
|------|-----|------------|
| `danforge-quick-search-hero-1920x800.png` | **1920×800** | Cover desktop — **основной** |
| `danforge-quick-search-hero-mobile-1080x1350.png` | **1080×1350** | Cover mobile |
| `hero-desktop-gen.png` / `hero-mobile-gen.png` | gen | Архив правок |

---

## Текст в Tilda (не на PNG)

| Поле | Текст |
|------|-------|
| **H1** | Быстрый поиск для inSales |
| **Lead** | Покупатель видит товары с фото и ценой ещё до перехода в каталог. Layout B, поиск по названию и артикулу, Gen-2 и Gen-4. |
| **Pillar (опц.)** | Поиск как витрина, не как строка. |
| **Бейдж** | Сертифицированный партнёр inSales |
| **CTA** | Заказать установку → `#order` · Смотреть демо → armedf с UTM |

Логотип **уже на PNG** — не дублировать wordmark «DanForge» крупным текстом в Cover (бейдж inSales — ок).

---

## Инструкция для Tilda

### 1. Cover desktop

1. Открыть блок **Cover** на странице quick-search.
2. Background image → загрузить  
   `danforge-quick-search-hero-1920x800.png` (**перезалить**, если был старый без реального лого).
3. **Cover settings:**
   - Position: **center**
   - Size / Fit: **cover**
   - Высота ~700–800 px desktop
   - Overlay: слабое 10–25% только если H1 плохо читается
4. H1, lead, кнопки, бейдж — текстовыми слоями Cover.
5. Не рисовать второй логотип поверх баннера.

### 2. Cover mobile

1. Отдельное mobile-изображение →  
   `danforge-quick-search-hero-mobile-1080x1350.png`.
2. На mobile: **1 primary CTA** + демо вторичной.

### 3. Скрины демо

Только ниже fold — блок «Как это выглядит». Не в Cover.

### 4. Alt-тексты

| Файл | Alt |
|------|-----|
| `…hero-1920x800.png` | Быстрый поиск DanForge для inSales — обложка с логотипом |
| `…hero-mobile-1080x1350.png` | Быстрый поиск DanForge — обложка mobile с логотипом |

---

## Чеклист владельца

- [ ] Загрузить **primary** desktop 1920×800 (версия с реальным лого)
- [ ] Загрузить **mobile** 1080×1350
- [ ] H1 / lead / CTA / бейдж — текстом в Tilda (без второго wordmark)
- [ ] Скрины демо только ниже fold
- [ ] Проверить читаемость H1 и лого на desktop / mobile
- [ ] Не публиковать, пока не готовы остальные блоки / SEO

---

## Файлы (пути)

База:  
`D:\Важное\Личный джарвис\artifacts\2026-07-24-df-quick-search-packaging-pages\assets\hero\`

**К загрузке в Tilda:**

- `danforge-quick-search-hero-1920x800.png` ← **primary desktop** (лого: `Логотипы\…\2.png`)
- `danforge-quick-search-hero-mobile-1080x1350.png` ← **primary mobile** (лого: `…\2.png`)

---

*Designer DanForge · `2026-07-24-df-quick-search-packaging-pages` · v1.0.9 · logos from `Логотипы/`*
