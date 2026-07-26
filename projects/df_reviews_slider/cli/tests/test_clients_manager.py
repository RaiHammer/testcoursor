import json
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

import clients_manager as cm


class ClientsManagerMetaTest(unittest.TestCase):
    def test_client_mode_manual(self):
        data = {"shop": "x.manual.local", "api_key": "manual-no-api", "client_mode": "manual"}
        self.assertEqual(cm.client_mode_from_config(data), "manual")

    def test_client_mode_api(self):
        data = {"shop": "shop.myinsales.ru", "api_key": "abcdefgh"}
        self.assertEqual(cm.client_mode_from_config(data), "api")

    def test_delivery_status_uploaded(self):
        run = {"status": "ok", "uploaded": True}
        self.assertEqual(cm.delivery_status_from_log(run), "загружен")

    def test_delivery_status_copied(self):
        run = {"status": "ok", "uploaded": False, "snippet_copied_at": "2026-07-14T12:00:00"}
        self.assertEqual(cm.delivery_status_from_log(run), "скопирован")

    def test_delivery_status_file_ready(self):
        run = {"status": "ok", "uploaded": False}
        self.assertEqual(cm.delivery_status_from_log(run), "файл готов")

    def test_mark_snippet_copied(self):
        with TemporaryDirectory() as tmp:
            slug = "test-client"
            with patch.object(cm, "CLIENTS_DIR", Path(tmp)):
                cm.ensure_clients_dir()
                cm.client_dir(slug).mkdir(parents=True)
                cm.mark_snippet_copied(slug)
                data = json.loads(cm.client_log_path(slug).read_text(encoding="utf-8"))
                self.assertIn("snippet_copied_at", data)


if __name__ == "__main__":
    unittest.main()
