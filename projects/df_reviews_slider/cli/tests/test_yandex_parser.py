import unittest

from get_reviews import (
    dedupe_reviews,
    extract_yandex_review_photos,
    is_yandex_shop_url,
    extract_shop_object_id,
    parse_digest_view_reviews,
    parse_yandex_shop_display_count,
    normalize_yandex_reviews_url,
    parse_yandex_expected_count,
    parse_yandex_html,
    render_photo_urls_attr,
    render_slide,
    Review,
    yandex_url_with_page,
)


class YandexParserHelpersTest(unittest.TestCase):
    def test_normalize_maps_url_adds_reviews_suffix(self):
        raw = "https://yandex.ru/maps/org/armedf/54635011104"
        normalized = normalize_yandex_reviews_url(raw)
        self.assertTrue(normalized.endswith("/reviews/"))

    def test_normalize_shop_reviews_url_keeps_path(self):
        raw = "https://reviews.yandex.ru/shop/nivona.ru?utm=1"
        normalized = normalize_yandex_reviews_url(raw)
        self.assertEqual(normalized, raw)

    def test_parse_expected_count(self):
        html = '<meta itemProp="reviewCount" content="70"/>'
        self.assertEqual(parse_yandex_expected_count(html), 70)

    def test_yandex_url_with_page_preserves_query(self):
        url = (
            "https://yandex.ru/maps/org/armedf/54635011104/reviews/"
            "?indoorLevel=1&ll=37.439077%2C55.634746&z=17"
        )
        result = yandex_url_with_page(url, 2)
        self.assertIn("page=2", result)
        self.assertIn("indoorLevel=1", result)

    def test_dedupe_reviews(self):
        reviews = [
            Review("Anna", "Great shop", 5, "yandex", created_at="2026-01-01"),
            Review("Anna", "Great shop", 5, "yandex", created_at="2026-01-01"),
            Review("Bob", "Fast delivery", 4, "yandex", created_at="2026-01-02"),
        ]
        self.assertEqual(len(dedupe_reviews(reviews)), 2)

    def test_render_slide_without_card_photos(self):
        review = Review(
            "Test User",
            "Great product",
            5,
            "yandex",
            photo_urls=["https://example.com/thumb.jpg"],
        )
        html = render_slide(review)
        self.assertIn("data-photo-urls=", html)
        self.assertNotIn("df-reviews__photos", html)
        self.assertNotIn("df-reviews__photo", html)

    def test_extract_carousel_photos(self):
        block = (
            '<div class="business-review-media__item">'
            '<img class="business-review-media__item-img" src="https://example.com/a.jpg"/>'
            '</div>'
            '<div class="business-review-media__item">'
            '<img class="business-review-media__item-img" src="https://example.com/b.jpg"/>'
            '</div>'
        )
        self.assertEqual(
            extract_yandex_review_photos(block),
            ["https://example.com/a.jpg", "https://example.com/b.jpg"],
        )

    def test_parse_yandex_html_falls_back_to_json_ld(self):
        html = """
        <html><head>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "review": [
            {
              "@type": "Review",
              "author": {"@type": "Person", "name": "Ирина"},
              "datePublished": "2026-07-18",
              "reviewBody": "Очень довольны сервисом и качеством товара.",
              "reviewRating": {"@type": "Rating", "ratingValue": 5}
            }
          ]
        }
        </script>
        </head><body></body></html>
        """
        reviews = parse_yandex_html(html)
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0].author, "Ирина")
        self.assertEqual(reviews[0].rating, 5)

    def test_is_yandex_shop_url(self):
        self.assertTrue(is_yandex_shop_url("https://reviews.yandex.ru/shop/armedf.ru"))
        self.assertFalse(is_yandex_shop_url("https://yandex.ru/maps/org/test/reviews/"))

    def test_extract_shop_object_id_from_html(self):
        html = '"objectId":"/site/YXJtZWRmLnJ1"'
        obj_id = extract_shop_object_id(html, "https://reviews.yandex.ru/shop/armedf.ru")
        self.assertEqual(obj_id, "/site/YXJtZWRmLnJ1")

    def test_parse_digest_view_reviews(self):
        payload = {
            "view": {
                "views": [
                    {
                        "id": "r1",
                        "type": "/ugc/review",
                        "time": 1784173365294,
                        "author": {"name": "Олег"},
                        "text": "Прибыло быстро. Качество отличное.",
                        "rating": {"val": 5, "max": 5},
                    },
                    {"id": "more", "type": "/ugc/button", "title": "Ещё"},
                ]
            }
        }
        reviews = parse_digest_view_reviews(payload)
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0].author, "Олег")
        self.assertEqual(reviews[0].rating, 5)

    def test_parse_yandex_shop_display_count(self):
        html = '"ugcData":{"reviews":{"count":87,"totalCount":87'
        self.assertEqual(parse_yandex_shop_display_count(html), 87)
        self.assertEqual(parse_yandex_expected_count(html), 87)


if __name__ == "__main__":
    unittest.main()
