"""Artifact consistency tests. Mock media probes do not prove real gameplay."""
from __future__ import annotations

import hashlib
import json
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from gameplay_captions import render_srt
from gameplay_release_evidence import measure_srt, verify
from gameplay_release_gate import require_verified_gameplay_release


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def build(folder: Path, *, capture=1200.0, play=1200.0, actions=400,
          parts=((1, 0.0, 1200.0, 1200.0),), rights=None) -> Path:
    """Write synthetic data for structural tests, not a real video."""
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
        'rights': rights or {'sources': [{'name': 'our game', 'ownership': 'own'}]},
    }
    (folder / 'release.evidence.json').write_text(json.dumps(evidence), encoding='utf-8')
    return folder


class ReleaseEvidenceTests(unittest.TestCase):
    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='release-'))
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        self.probe = patch('gameplay_release_evidence._probe_part', side_effect=lambda p: json.loads((p.parent / 'release.evidence.json').read_text())['parts'][int(p.stem[4:]) - 1]['end_seconds'] - json.loads((p.parent / 'release.evidence.json').read_text())['parts'][int(p.stem[4:]) - 1]['start_seconds'])
        self.probe.start()
        self.addCleanup(self.probe.stop)

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

    # Structural validation alone is not a publication authorization.

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

    def test_our_own_game_needs_no_licence_or_approval(self):
        # Nobody should retype a licence for a game that lives in this repo.
        self.assertEqual(verify(self.folder())['parts'], 1)

    def test_an_external_game_without_a_licence_is_refused(self):
        folder = self.root / 'external'
        folder.mkdir()
        build(folder, rights={'sources': [{'name': 'someone-else/game'}]})
        self.assert_blocked(folder, 'not under an allowed licence')

    def test_an_external_game_under_a_noncommercial_licence_is_refused(self):
        folder = self.root / 'nc'
        folder.mkdir()
        build(folder, rights={'sources': [{'name': 'someone/game', 'license': 'CC-BY-NC-4.0',
                                           'license_verified': '2026-11-24'}]})
        self.assert_blocked(folder, 'not under an allowed licence')

    def test_an_external_game_under_mit_with_verification_passes(self):
        folder = self.root / 'mit'
        folder.mkdir()
        build(folder, rights={'sources': [{'name': 'someone/game', 'license': 'MIT',
                                           'license_verified': '2026-11-24'}]})
        self.assertEqual(verify(folder)['parts'], 1)

    def test_an_external_game_without_verified_licence_is_refused(self):
        folder = self.root / 'noverify'
        folder.mkdir()
        build(folder, rights={'sources': [{'name': 'someone/game', 'license': 'MIT'}]})
        self.assert_blocked(folder, 'has not been verified')

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

    def test_the_gate_still_blocks_after_diagnostics_pass(self):
        with self.assertRaisesRegex(ValueError, 'not implemented'):
            require_verified_gameplay_release(self.folder())

    def test_fake_mp4_is_rejected_by_real_probe(self):
        folder = self.folder()
        self.probe.stop()
        self.assert_blocked(folder, 'not a verifiable audio/video file')

    def test_mismatched_media_duration_is_rejected(self):
        self.probe.stop()
        with patch('gameplay_release_evidence._probe_part', return_value=30.0):
            self.assert_blocked(self.folder(), 'actual duration')

    def test_caption_cannot_extend_past_recording(self):
        with self.assertRaisesRegex(ValueError, 'exceeds'):
            measure_srt('1\n00:19:59,000 --> 00:20:01,000\nText\n', max_end=1200)


class SplitTests(unittest.TestCase):
    """Recordings over thirty minutes must become two safe parts, never more."""

    def setUp(self):
        self.root = Path(tempfile.mkdtemp(prefix='split-'))
        self.addCleanup(shutil.rmtree, self.root, ignore_errors=True)
        probe = patch('gameplay_release_evidence._probe_part', return_value=1200.0)
        self.mock_probe = probe.start()
        self.addCleanup(probe.stop)

    def test_a_forty_minute_recording_splits_into_two_twenty_minute_parts(self):
        folder = self.root / 'forty'
        folder.mkdir()
        build(folder, capture=2400.0, play=2400.0, actions=800,
              parts=((1, 0.0, 1200.0, 1200.0), (2, 1200.0, 2400.0, 1200.0)))
        self.assertEqual(verify(folder)['parts'], 2)

    def test_exactly_thirty_minutes_stays_one_part(self):
        self.mock_probe.return_value = 1800.0
        folder = self.root / 'thirty'
        folder.mkdir()
        build(folder, capture=1800.0, play=1800.0, actions=600,
              parts=((1, 0.0, 1800.0, 1800.0),))
        self.assertEqual(verify(folder)['parts'], 1)

    def test_overlapping_parts_are_refused(self):
        folder = self.root / 'overlap'
        folder.mkdir()
        build(folder, capture=2400.0, play=2400.0, actions=800,
              parts=((1, 0.0, 1200.0, 1200.0), (2, 1190.0, 2390.0, 1200.0)))
        with self.assertRaisesRegex(ValueError, 'previous part ended'):
            verify(folder)

    def test_beyond_two_parts_is_refused_rather_than_split_unsafely(self):
        folder = self.root / 'seventy'
        folder.mkdir()
        build(folder, capture=4200.0, play=4200.0, actions=1400,
              parts=((1, 0.0, 1800.0, 1800.0), (2, 1800.0, 3600.0, 1800.0)))
        with self.assertRaises(ValueError):
            verify(folder)


class RightsTests(unittest.TestCase):
    """Rights are derived from where the assets came from, not typed in by hand."""

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

    def test_our_own_game_is_recognised_without_any_configuration(self):
        # "Последний сигнал" is three files in this repository: there is no
        # external licence to confirm and nobody should have to configure one.
        rights = self.draft.rights_from_environment(
            {'source': 'https://github.com/m98978672-boop/games/tree/main/collection/lighthouse-relay'})
        self.assertEqual(rights, {'sources': [{'name': 'https://github.com/m98978672-boop/games/'
                                               'tree/main/collection/lighthouse-relay',
                                               'ownership': 'own'}]})

    def test_an_external_game_is_not_assumed_to_be_ours(self):
        rights = self.draft.rights_from_environment(
            {'source': 'https://github.com/ritaban06/mini-js-games-hub'})
        self.assertNotEqual(rights['sources'][0].get('ownership'), 'own')
        self.assertNotIn('license', rights['sources'][0])

    def test_the_builder_never_invents_an_approval_date(self):
        import inspect
        for name in ('rights_from_environment',):
            source = inspect.getsource(getattr(self.draft, name))
            for invented in ('1970', 'datetime.now', 'date.today'):
                self.assertNotIn(invented, source)

    def test_an_external_game_without_licence_stays_unlicensed(self):
        rights = self.draft.rights_from_environment(
            {'source': 'https://github.com/someone/game'})
        self.assertEqual(rights['sources'][0].get('license'), None)

    def test_a_verified_licence_is_carried_into_the_record(self):
        self.os.environ.update(GAMEPLAY_SOURCE_LICENSE='MIT',
                               GAMEPLAY_RIGHTS_CHECKED_ON='2026-11-24')
        rights = self.draft.rights_from_environment(
            {'source': 'https://github.com/someone/game'})
        self.assertEqual(rights['sources'][0]['license'], 'MIT')
        self.assertEqual(rights['sources'][0]['license_verified'], '2026-11-24')

    def test_the_licence_is_read_from_github_not_guessed(self):
        # The repository's own licence file is the source of truth. A runner
        # without network access skips rather than pretending either way.
        try:
            licence = self.draft.verified_license('https://github.com/ritaban06/mini-js-games-hub')
        except Exception:
            self.skipTest('no network access to the GitHub API here')
        self.assertEqual(licence, 'MIT')


class LicenseStepTests(unittest.TestCase):
    """The workflow must read a fact, and a failure must not read as a licence."""

    def facts(self, trace, today='2026-11-24'):
        from read_game_license import facts
        return facts(trace, today=today)

    def test_our_own_game_reports_nothing_to_license(self):
        result = self.facts({'source': 'https://github.com/m98978672-boop/games/tree/main/collection/lighthouse-relay'})
        self.assertEqual(result, {'checked': '', 'license': ''})

    def test_an_external_game_reports_its_real_licence(self):
        # This reads the actual repository licence over the network.
        result = self.facts({'source': 'https://github.com/ritaban06/mini-js-games-hub'})
        if not result['license']:
            self.skipTest('no network access to the GitHub API here')
        self.assertEqual(result['license'], 'MIT')
        self.assertEqual(result['checked'], '2026-11-24')

    def test_an_unreadable_source_is_unlicensed_rather_than_permitted(self):
        result = self.facts({'source': 'https://github.com/definitely-not-a-real-owner-xyz/nope'})
        self.assertEqual(result['license'], '')

    def test_a_capture_without_a_source_is_unlicensed(self):
        self.assertEqual(self.facts({})['license'], '')

    def test_the_cli_writes_key_value_lines(self):
        import tempfile
        from read_game_license import main
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            (root / 'trace.json').write_text(
                json.dumps({'source': 'https://github.com/m98978672-boop/games/tree/main/collection/lighthouse-relay'}),
                encoding='utf-8')
            self.assertEqual(main([str(root / 'trace.json'), str(root / 'out.txt')]), 0)
            self.assertIn('license=', (root / 'out.txt').read_text(encoding='utf-8'))


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

    def test_builder_keeps_zero_screen_changes(self):
        (self.root / 'episode.ru.srt').write_text(
            '1\n00:00:00,000 --> 00:00:01,000\nПривет.\n', encoding='utf-8')
        (self.root / 'video.mp4').write_bytes(b'fixture')
        result = self.draft.write_release_evidence(
            self.root, {'actions': [{'screen_unchanged': True}]},
            capture_seconds=1, play_seconds=1,
            parts=[(1, 0, 1, 1, 'video.mp4')], subtitle='episode.ru.srt')
        self.assertEqual(result['evidence'][1]['count'], 0)

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
