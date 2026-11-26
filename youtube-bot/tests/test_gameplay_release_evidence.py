"""The release gate must check proof, not accept a claim.

Each test builds a real artifact folder - a subtitle file with measured timings,
a part video, hashes and the rights record - and then breaks exactly one thing.
If the gate still passed, a padded or fabricated recording could reach the
channel under the owner's rules, which is what the gate exists to prevent.
"""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from gameplay_captions import render_srt
from gameplay_release_evidence import measure_srt, verify
from gameplay_release_gate import require_verified_gameplay_release


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(folder: Path, *, capture=1200.0, play=1200.0, actions=400,
          parts=((1, 0.0, 1200.0, 1200.0),), approval='2026-11-24') -> Path:
    """Write a folder that satisfies every requirement, as the builder would."""
    cues, cursor = [], 0.0
    index = 0
    while cursor < capture - 40:
        cues.append((cursor, min(cursor + 30, capture - 1), f'Комментарий {index + 1} по ходу записи.'))
        cursor += 40
        index += 1
    track = render_srt(cues, end=capture)
    (folder / 'episode.ru.srt').write_text(track, encoding='utf-8')
    cue_count, spoken = measure_srt(track)
    rows = []
    for number, start, end, part_play in parts:
        name = f'part{number}.mp4'
        (folder / name).write_bytes(b'\x00' * (1024 + number))
        rows.append({'number': number, 'start_seconds': start, 'end_seconds': end,
                     'play_seconds': part_play, 'video': name, 'sha256': digest(folder / name)})
    evidence = {
        'capture_seconds': capture, 'play_seconds': play,
        'subtitle_tracks': [{'name': 'episode.ru.srt', 'sha256': digest(folder / 'episode.ru.srt'),
                             'cues': cue_count, 'spoken_seconds': round(spoken, 3)}],
        'evidence': [{'kind': 'actions', 'count': actions},
                     {'kind': 'screen_changes', 'count': max(1, actions - 50)}],
        'parts': rows,
        'rights': {'sources': [{'name': 'mini-js-games-hub', 'license': 'MIT', 'checked': '2026-11-24'}],
                   'owner_approval': approval},
    }
    (folder / 'release.evidence.json').write_text(json.dumps(evidence), encoding='utf-8')
    return folder


class ReleaseEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='release-'))
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)

    def folder(self) -> Path:
        path = self.root / 'episode'
        path.mkdir()
        return build(path)

    def rewrite(self, folder: Path, change) -> None:
        path = folder / 'release.evidence.json'
        evidence = json.loads(path.read_text(encoding='utf-8'))
        change(evidence, folder)
        path.write_text(json.dumps(evidence), encoding='utf-8')

    def assert_blocked(self, folder: Path, fragment: str) -> None:
        with self.assertRaises(ValueError) as caught:
            verify(folder)
        self.assertIn(fragment, str(caught.exception))

    # A complete artifact passes, so the gate is not a wall.

    def test_a_complete_artifact_passes_and_reports_its_numbers(self):
        result = verify(self.folder())
        self.assertEqual(result['capture_seconds'], 1200.0)
        self.assertEqual(result['parts'], 1)
        self.assertGreater(result['action_rate_per_minute'], 4.0)

    # Padding cannot buy eligibility.

    def test_a_twenty_minute_recording_with_four_minutes_of_play_is_refused(self):
        # Padding a recording adds minutes but not play. Four minutes of play in
        # twenty minutes of video must not satisfy a twenty-minute requirement.
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e.update(play_seconds=240.0))
        self.assert_blocked(folder, 'is play')

    def test_too_few_actions_for_the_minutes_is_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e.__setitem__('evidence', [{'kind': 'actions', 'count': 5},
                                                                    {'kind': 'screen_changes', 'count': 5}]))
        self.assert_blocked(folder, 'too few to be real play')

    def test_evidence_without_screen_changes_is_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e.__setitem__('evidence', [{'kind': 'actions', 'count': 400}]))
        self.assert_blocked(folder, 'screen_changes')

    def test_a_twelve_minute_recording_cannot_count_as_twenty(self):
        # "It is all play" is not an exception to the owner's rule. Otherwise a
        # twelve-minute capture would satisfy a twenty-minute requirement.
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e.update(capture_seconds=720.0, play_seconds=720.0,
                                                   parts=[dict(e['parts'][0], end_seconds=720.0,
                                                               play_seconds=720.0)]))
        self.assert_blocked(folder, 'shorter than the')

    # The subtitles must be the ones that were measured.

    def test_a_swapped_subtitle_track_is_refused(self):
        folder = self.folder()
        (folder / 'episode.ru.srt').write_text(
            '1\n00:00:00,000 --> 00:00:01,000\nДругая дорожка\n', encoding='utf-8')
        self.assert_blocked(folder, 'changed after it was measured')

    def test_claiming_more_cues_than_the_track_has_is_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e['subtitle_tracks'][0].update(cues=999))
        self.assert_blocked(folder, 'cues but has')

    def test_a_missing_subtitle_track_is_refused(self):
        folder = self.folder()
        (folder / 'episode.ru.srt').unlink()
        self.assert_blocked(folder, 'is missing')

    # Parts must account for the recording exactly once.

    def test_parts_that_do_not_cover_the_recording_are_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e['parts'][0].update(end_seconds=900.0, play_seconds=900.0))
        self.assert_blocked(folder, 'cover the recording')

    def test_a_swapped_part_video_is_refused(self):
        folder = self.folder()
        (folder / 'part1.mp4').write_bytes(b'\x01' * 4096)
        self.assert_blocked(folder, 'changed after it was measured')

    def test_a_third_part_is_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e['parts'].extend(
            [dict(e['parts'][0], number=2), dict(e['parts'][0], number=3)]))
        self.assert_blocked(folder, 'more than 2 videos')

    def test_a_part_longer_than_the_split_limit_is_refused(self):
        folder = self.root / 'long'
        folder.mkdir()
        build(folder, capture=3600.0, play=3600.0, actions=1200,
              parts=((1, 0.0, 3600.0, 3600.0),))
        self.assert_blocked(folder, 'not a usable length')

    # Rights stay a human decision, but a documented one.

    def test_rights_without_a_dated_approval_are_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e['rights'].update(owner_approval=''))
        self.assert_blocked(folder, "owner's dated approval")

    def test_rights_without_a_source_date_are_refused(self):
        folder = self.folder()
        self.rewrite(folder, lambda e, f: e['rights']['sources'][0].update(checked='soon'))
        self.assert_blocked(folder, 'check date')

    # Absence of proof must never read as proof.

    def test_a_folder_without_evidence_is_refused(self):
        folder = self.folder()
        (folder / 'release.evidence.json').unlink()
        self.assert_blocked(folder, 'so nothing is proven')

    def test_the_gate_refuses_a_missing_folder_argument(self):
        # "I did not check" must not be able to read as "checked and fine".
        with self.assertRaises(ValueError) as caught:
            require_verified_gameplay_release(None)
        self.assertIn('cannot', str(caught.exception))

    def test_the_gate_accepts_a_folder_that_proves_everything(self):
        self.assertEqual(require_verified_gameplay_release(self.folder())['parts'], 1)


class SplitTests(unittest.TestCase):
    """Recordings over thirty minutes must become two safe parts, never more."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='split-'))
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)

    def test_a_forty_minute_recording_splits_into_two_twenty_minute_parts(self):
        folder = self.root / 'forty'
        folder.mkdir()
        build(folder, capture=2400.0, play=2400.0, actions=800,
              parts=((1, 0.0, 1200.0, 1200.0), (2, 1200.0, 2400.0, 1200.0)))
        self.assertEqual(verify(folder)['parts'], 2)

    def test_exactly_thirty_minutes_stays_one_part(self):
        folder = self.root / 'thirty'
        folder.mkdir()
        build(folder, capture=1800.0, play=1800.0, actions=600,
              parts=((1, 0.0, 1800.0, 1800.0),))
        self.assertEqual(verify(folder)['parts'], 1)

    def test_beyond_two_parts_is_refused_rather_than_split_unsafely(self):
        folder = self.root / 'seventy'
        folder.mkdir()
        build(folder, capture=4200.0, play=4200.0, actions=1400,
              parts=((1, 0.0, 1800.0, 1800.0), (2, 1800.0, 3600.0, 1800.0)))
        with self.assertRaises(ValueError):
            verify(folder)


class RightsTests(unittest.TestCase):
    """Rights are the owner's decision; the builder must never invent them."""

    def setUp(self):
        import adventure_draft
        import os
        self.draft = adventure_draft
        self.os = os
        self.saved = {k: os.environ.pop(k) for k in
                      ('GAMEPLAY_RIGHTS_APPROVED_ON', 'GAMEPLAY_RIGHTS_CHECKED_ON',
                       'GAMEPLAY_SOURCE_LICENSE') if k in os.environ}

    def tearDown(self):
        for key in ('GAMEPLAY_RIGHTS_APPROVED_ON', 'GAMEPLAY_RIGHTS_CHECKED_ON',
                    'GAMEPLAY_SOURCE_LICENSE'):
            self.os.environ.pop(key, None)
        self.os.environ.update(self.saved)

    def test_an_unapproved_recording_gets_no_rights_record(self):
        # A builder that filled this in would bypass the gate that reads it.
        rights = self.draft.rights_from_environment({'source': 'https://github.com/a/b'})
        self.assertEqual(rights, {'sources': [], 'owner_approval': ''})

    def test_the_builder_never_invents_an_approval_date(self):
        import inspect
        source = inspect.getsource(self.draft.rights_from_environment)
        for invented in ('1970', '2026-', 'datetime.now', 'date.today'):
            self.assertNotIn(invented, source)

    def test_an_incomplete_approval_is_not_partial(self):
        self.os.environ['GAMEPLAY_RIGHTS_APPROVED_ON'] = '2026-11-24'
        rights = self.draft.rights_from_environment({'source': 'https://github.com/a/b'})
        self.assertEqual(rights['owner_approval'], '')

    def test_a_complete_owner_record_is_passed_through(self):
        self.os.environ.update(GAMEPLAY_RIGHTS_APPROVED_ON='2026-11-24',
                               GAMEPLAY_RIGHTS_CHECKED_ON='2026-11-20',
                               GAMEPLAY_SOURCE_LICENSE='MIT')
        rights = self.draft.rights_from_environment({'source': 'https://github.com/a/b'})
        self.assertEqual(rights['owner_approval'], '2026-11-24')
        self.assertEqual(rights['sources'][0]['license'], 'MIT')


class BuilderSplitTests(unittest.TestCase):
    """The builder must cut the files the evidence describes, not just claim them."""

    def setUp(self):
        import adventure_draft
        self.draft = adventure_draft
        self.root = Path(tempfile.mkdtemp(prefix='builder-'))
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        self.calls = []
        self._run = adventure_draft.subprocess.run
        self._probe = adventure_draft.probe_capture
        adventure_draft.subprocess.run = lambda *a, **k: self.calls.append(a)
        self.addCleanup(setattr, adventure_draft.subprocess, 'run', self._run)
        self.addCleanup(setattr, adventure_draft, 'probe_capture', self._probe)

    def parts(self, edited: float, measured: dict[str, float]):
        self.draft.probe_capture = lambda path: measured[Path(path).name]
        (self.root / 'zuza-pilot.mp4').write_bytes(b'\x00' * 1024)
        return self.draft.split_parts(
            self.root, 'zuza-pilot.mp4', edited, edited, short=False,
            game='The Lost Artifact', author='Ritaban Ghosh',
            repository_url='https://github.com/ritaban06/mini-js-games-hub')

    def test_a_short_recording_is_not_split(self):
        parts = self.parts(1200.0, {'zuza-pilot.mp4': 1200.0})
        self.assertEqual(len(parts), 1)
        self.assertEqual(parts[0][4], 'zuza-pilot.mp4')
        self.assertEqual(self.calls, [])  # nothing to cut

    def test_a_forty_minute_recording_is_cut_into_two_matching_parts(self):
        parts = self.parts(2400.0, {'zuza-pilot-part-1.mp4': 1800.0,
                                    'zuza-pilot-part-2.mp4': 600.0})
        self.assertEqual([p[0] for p in parts], [1, 2])
        self.assertEqual(sum(p[2] - p[1] for p in parts), 2400.0)
        self.assertEqual(len(self.calls), 2)  # both halves were really cut

    def test_a_short_is_never_split_even_if_long_enough(self):
        self.draft.probe_capture = lambda path: 500.0
        parts = self.draft.split_parts(self.root, 'zuza-pilot.mp4', 500.0, 500.0, short=True,
                                       game='G', author='A',
                                       repository_url='https://github.com/a/b')
        self.assertEqual(len(parts), 1)


if __name__ == '__main__':
    unittest.main()
