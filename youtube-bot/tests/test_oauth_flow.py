import unittest
from unittest.mock import patch

import app


class _FakeFlow:
    def __init__(self):
        self.authorization_url_called = False
        self.token_code = None
        self.state = None
        self.credentials = object()

    def authorization_url(self, **_kwargs):
        self.authorization_url_called = True
        return "https://accounts.google.com/test", "one-time-state"

    def fetch_token(self, *, code):
        self.token_code = code


class OAuthFlowTests(unittest.TestCase):
    def tearDown(self):
        app.oauth_states.clear()

    def test_oauth_callback_reuses_original_flow_for_pkce_verifier(self):
        flow = _FakeFlow()
        with patch.object(app.Flow, "from_client_secrets_file", return_value=flow), patch.object(app, "store_credentials") as save:
            response = app.auth_start()
            self.assertEqual(response.status_code, 307)
            self.assertTrue(flow.authorization_url_called)
            self.assertIs(app.oauth_states["one-time-state"][0], flow)

            callback = app.oauth_callback(request=None, code="test-auth-code", state="one-time-state", error=None)

        self.assertEqual(flow.token_code, "test-auth-code")
        save.assert_called_once_with(flow.credentials)
        self.assertEqual(callback.status_code, 200)
        self.assertIn("YouTube подключён", callback.body.decode("utf-8"))


if __name__ == "__main__":
    unittest.main()
