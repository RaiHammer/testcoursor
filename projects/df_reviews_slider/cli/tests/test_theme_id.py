import io
import unittest
from contextlib import redirect_stdout
from unittest.mock import patch

from get_reviews import (
    Config,
    ensure_theme_id,
    fetch_themes,
    normalize_theme_id,
    report_themes_for_check,
    theme_is_published,
)


class ThemeIdTest(unittest.TestCase):
    def test_normalize_theme_id(self):
        self.assertIsNone(normalize_theme_id(None))
        self.assertIsNone(normalize_theme_id(""))
        self.assertEqual(normalize_theme_id(11314809), 11314809)
        self.assertEqual(normalize_theme_id("11314809"), 11314809)
        self.assertIsNone(normalize_theme_id("abc"))

    def test_fetch_themes_prefers_published(self):
        cfg = Config(shop="test.myinsales.ru", api_key="k", password="p")
        all_themes = [
            {"id": 11248297, "title": "Published", "isPublished": True},
            {"id": 11314809, "title": "Draft", "isPublished": False},
        ]
        with patch("get_reviews.fetch_all_themes", return_value=all_themes):
            themes = fetch_themes(cfg)
        self.assertEqual([t["id"] for t in themes], [11248297])

    def test_ensure_theme_id_keeps_configured(self):
        cfg = Config(
            shop="test.myinsales.ru",
            api_key="k",
            password="p",
            theme_id=11314809,
        )
        draft = {"id": 11314809, "title": "Draft theme", "isPublished": False}
        with patch("get_reviews.fetch_theme_by_id", return_value=draft):
            ensure_theme_id(cfg)
        self.assertEqual(cfg.theme_id, 11314809)

    def test_ensure_theme_id_raises_for_missing(self):
        cfg = Config(
            shop="test.myinsales.ru",
            api_key="k",
            password="p",
            theme_id=99999999,
        )
        with patch("get_reviews.fetch_theme_by_id", return_value=None):
            with self.assertRaises(RuntimeError) as ctx:
                ensure_theme_id(cfg)
        self.assertIn("99999999", str(ctx.exception))

    def test_report_themes_highlights_selected(self):
        cfg = Config(
            shop="armedf.ru",
            api_key="k",
            password="p",
            theme_id=11314809,
        )
        all_themes = [
            {"id": 11248297, "title": "Published", "isPublished": True},
            {"id": 11314809, "title": "Draft", "isPublished": False},
        ]
        selected = all_themes[1]
        buf = io.StringIO()
        with patch("get_reviews.fetch_theme_by_id", return_value=selected):
            with patch("get_reviews.fetch_all_themes", return_value=all_themes):
                with redirect_stdout(buf):
                    report_themes_for_check(cfg)
        out = buf.getvalue()
        self.assertIn("11314809", out)
        self.assertIn("← выбрана", out)
        self.assertIn("Draft", out)

    def test_theme_is_published_aliases(self):
        self.assertTrue(theme_is_published({"isPublished": True}))
        self.assertTrue(theme_is_published({"is_published": True}))
        self.assertFalse(theme_is_published({"isPublished": False}))


if __name__ == "__main__":
    unittest.main()
