import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from playthrough_feedback_youtube import assess_video


class Request:
    def __init__(self, value): self.value = value
    def execute(self):
        if isinstance(self.value, Exception): raise self.value
        return self.value


class FakeYoutube:
    def __init__(self):
        self.now = datetime(2026, 12, 1, tzinfo=timezone.utc)
        self.video = {"snippet": {"channelId": "owner", "publishedAt": (self.now-timedelta(days=4)).isoformat()},
                      "status": {"privacyStatus": "public"}, "statistics": {"viewCount": "101", "likeCount": "6"}}
        self.comments = [{"snippet": {"topLevelComment": {"snippet": {"authorChannelId": {"value": author}, "textDisplay": "Жду продолжения"}}}} for author in ("a", "b")]
        self.comments_error = None
    def channels(self): return self
    def videos(self): return self
    def commentThreads(self): return self
    def list(self, **kwargs):
        if kwargs.get("mine"): return Request({"items": [{"id": "owner"}]})
        if kwargs.get("videoId"): return Request(self.comments_error or {"items": self.comments})
        return Request({"items": [self.video]})


class FeedbackYoutubeTests(unittest.TestCase):
    def test_owned_public_video_collects_only_aggregate_signal(self):
        api = FakeYoutube()
        result = assess_video(api, "AbCdEf01234", now=api.now)
        self.assertEqual(result["decision"], "continue")
        self.assertEqual(result["positive_authors"], 2)
        self.assertNotIn("Жду", str(result))
        self.assertNotIn("author_id", str(result))

    def test_non_public_foreign_missing_or_disabled_wait(self):
        api = FakeYoutube()
        api.video["status"]["privacyStatus"] = "private"
        self.assertEqual(assess_video(api, "AbCdEf01234", now=api.now)["reason"], "not_public")
        api.video["status"]["privacyStatus"] = "public"
        api.video["snippet"]["channelId"] = "other"
        self.assertEqual(assess_video(api, "AbCdEf01234", now=api.now)["reason"], "video_not_owned")
        api.video["snippet"]["channelId"] = "owner"
        del api.video["statistics"]["likeCount"]
        self.assertEqual(assess_video(api, "AbCdEf01234", now=api.now)["reason"], "feedback_unavailable")
        api.video["statistics"]["likeCount"] = "6"
        api.comments_error = RuntimeError("disabled")
        self.assertEqual(assess_video(api, "AbCdEf01234", now=api.now)["reason"], "feedback_unavailable")

    def test_age_and_bad_video_id(self):
        api = FakeYoutube()
        api.video["snippet"]["publishedAt"] = api.now.isoformat()
        self.assertEqual(assess_video(api, "AbCdEf01234", now=api.now)["reason"], "minimum_age_not_reached")
        with self.assertRaises(ValueError): assess_video(api, "../bad", now=api.now)


if __name__ == "__main__": unittest.main()
