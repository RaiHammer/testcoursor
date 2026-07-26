import unittest
from unittest.mock import patch

from pathlib import Path

from get_reviews import (
    SNIPPET_INNER_NAME,
    Config,
    Review,
    is_manual_client,
    render_slide,
    review_sort_ts,
    sample_yandex_reviews,
    validate_manual_config,
)


class CliYandexOnlyTest(unittest.TestCase):
    def test_snippet_name_is_yandex(self):
        self.assertEqual(SNIPPET_INNER_NAME, "danforge_reviews_yandex.liquid")

    def test_sample_yandex_sort_desc(self):
        cfg = Config(
            shop="test.myinsales.ru",
            api_key="k",
            password="p",
            yandex_limit=10,
            min_rating=1,
        )
        yandex = [
            Review("Old", "A", 5, "yandex", created_at="2024-01-01T00:00:00Z"),
            Review("New", "B", 5, "yandex", created_at="2025-06-01T00:00:00Z"),
            Review("Mid", "C", 5, "yandex", created_at="2024-06-01T00:00:00Z"),
        ]
        picked = sample_yandex_reviews(yandex, cfg)
        self.assertEqual([r.author for r in picked], ["New", "Mid", "Old"])

    def test_sample_yandex_respects_limit(self):
        cfg = Config(
            shop="test.myinsales.ru",
            api_key="k",
            password="p",
            yandex_limit=2,
            min_rating=1,
        )
        yandex = [
            Review("A", "x", 5, "yandex", created_at="2025-01-02T00:00:00Z"),
            Review("B", "x", 5, "yandex", created_at="2025-01-01T00:00:00Z"),
            Review("C", "x", 5, "yandex", created_at="2024-12-01T00:00:00Z"),
        ]
        picked = sample_yandex_reviews(yandex, cfg)
        self.assertEqual(len(picked), 2)
        self.assertEqual(picked[0].author, "A")

    def test_sample_yandex_zero_limit_exports_all(self):
        cfg = Config(
            shop="test.myinsales.ru",
            api_key="k",
            password="p",
            yandex_limit=0,
            sample_count=0,
            min_rating=1,
        )
        yandex = [
            Review("A", "x", 5, "yandex", created_at="2025-01-02T00:00:00Z"),
            Review("B", "x", 5, "yandex", created_at="2025-01-01T00:00:00Z"),
            Review("C", "x", 5, "yandex", created_at="2024-12-01T00:00:00Z"),
        ]
        picked = sample_yandex_reviews(yandex, cfg)
        self.assertEqual(len(picked), 3)

    def test_render_slide_has_sort_ts(self):
        review = Review(
            "Anna",
            "Text",
            5,
            "yandex",
            created_at="2025-01-15T12:00:00Z",
        )
        html = render_slide(review)
        self.assertIn('data-sort-ts="', html)
        self.assertIn('data-source="yandex"', html)
        self.assertGreater(review_sort_ts(review), 0)

    @patch("get_reviews.fetch_insales_reviews")
    @patch("get_reviews.fetch_yandex_reviews")
    @patch("get_reviews.write_outputs")
    @patch("get_reviews.generate_liquid", return_value="liquid")
    def test_run_skips_insales_by_default(self, _gen, _write, mock_yandex, mock_insales):
        from get_reviews import run

        mock_yandex.return_value = [
            Review("Y", "x", 5, "yandex", created_at="2025-01-01T00:00:00Z")
        ]
        cfg = Config(shop="t.myinsales.ru", api_key="k", password="p")
        run(cfg, upload=False, dry_run=True, fetch_insales=False)
        mock_insales.assert_not_called()
        mock_yandex.assert_called_once()

    def test_validate_manual_config_requires_yandex_source(self):
        cfg = Config(
            shop="manual.local",
            api_key="",
            password="",
            yandex_org_url=None,
            yandex_reviews_file=None,
        )
        with self.assertRaises(SystemExit) as ctx:
            validate_manual_config(cfg, Path("clients/test/config.json"))
        self.assertIn("yandex_org_url", str(ctx.exception))

    def test_validate_manual_config_accepts_url(self):
        cfg = Config(
            shop="manual.local",
            api_key="",
            password="",
            yandex_org_url="https://yandex.ru/maps/org/test/reviews/",
        )
        validate_manual_config(cfg, Path("clients/test/config.json"))

    def test_is_manual_client_by_api_key(self):
        cfg = Config(
            shop="nivona.manual.local",
            api_key="manual-no-api",
            password="manual-no-api",
        )
        self.assertTrue(is_manual_client(cfg))

    def test_is_manual_client_by_shop_suffix(self):
        cfg = Config(shop="foo.manual.local", api_key="k", password="p")
        self.assertTrue(is_manual_client(cfg))

    def test_is_manual_client_false_for_real_shop(self):
        cfg = Config(shop="myshop.myinsales.ru", api_key="abc12345", password="secret12")
        self.assertFalse(is_manual_client(cfg))


if __name__ == "__main__":
    unittest.main()
