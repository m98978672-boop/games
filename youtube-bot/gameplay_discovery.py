"""Read-only GitHub candidate discovery; never downloads or runs repository code.

A source-code license is only a search filter, not proof of rights to publish
recordings, music, assets or trademarks. Every candidate is marked for rights
and safety review. This module is not a gameplay or publishing workflow.
"""
from __future__ import annotations

import json
import re
import urllib.error
import urllib.parse
import urllib.request
from collections.abc import Callable
from typing import Any

API = "https://api.github.com"
ALLOWED_LICENSES = frozenset({"MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause"})
REPO = re.compile(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+\Z")
SHA = re.compile(r"[0-9a-f]{40}\Z")


class DiscoveryError(RuntimeError):
    pass


def _get_json(url: str) -> Any:
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != "https" or parsed.netloc != "api.github.com":
        raise DiscoveryError("GitHub API URL is not allowed.")
    request = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json", "User-Agent": "GamesReviewDiscovery/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            if urllib.parse.urlsplit(response.geturl()).netloc != "api.github.com":
                raise DiscoveryError("GitHub API redirected to a different host.")
            data = response.read(2_000_001)
        if len(data) > 2_000_000:
            raise DiscoveryError("GitHub response exceeded its size limit.")
        return json.loads(data.decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise DiscoveryError("GitHub discovery failed; no game was downloaded.") from exc


def discover_games(*, limit: int = 5, get_json: Callable[[str], Any] = _get_json) -> list[dict[str, Any]]:
    """Find up to ten candidate public repositories with pinned commits.

    A candidate is not guaranteed to be a runnable game or cleared for use.
    Calls are read-only and unauthenticated; API errors fail closed.
    """
    if not 1 <= limit <= 10:
        raise ValueError("limit must be between 1 and 10")
    query = urllib.parse.urlencode({"q": "topic:game language:JavaScript license:mit", "sort": "stars", "order": "desc", "per_page": 30})
    response = get_json(f"{API}/search/repositories?{query}")
    if not isinstance(response, dict) or not isinstance(response.get("items"), list) or response.get("incomplete_results"):
        raise DiscoveryError("GitHub search did not provide complete candidate results.")
    candidates: list[dict[str, Any]] = []
    for item in response["items"]:
        if not isinstance(item, dict):
            continue
        name = item.get("full_name")
        branch = item.get("default_branch")
        license_info = item.get("license")
        license_id = license_info.get("spdx_id") if isinstance(license_info, dict) else None
        if (not isinstance(name, str) or not REPO.fullmatch(name) or not isinstance(branch, str)
                or not branch or len(branch) > 200 or item.get("private") is not False
                or item.get("archived") or item.get("fork") or license_id not in ALLOWED_LICENSES
                or item.get("html_url") != f"https://github.com/{name}"):
            continue
        branch_data = get_json(f"{API}/repos/{name}/branches/{urllib.parse.quote(branch, safe='')}")
        sha = branch_data.get("commit", {}).get("sha") if isinstance(branch_data, dict) and isinstance(branch_data.get("commit"), dict) else None
        if not isinstance(sha, str) or not SHA.fullmatch(sha):
            continue
        candidates.append({
            "repository": name, "url": item["html_url"], "commit": sha,
            "code_license": license_id, "description": str(item.get("description") or "")[:300],
            "rights_review_required": True, "safety_review_required": True,
        })
        if len(candidates) == limit:
            break
    return candidates


if __name__ == "__main__":
    print(json.dumps(discover_games(), ensure_ascii=False, indent=2))
