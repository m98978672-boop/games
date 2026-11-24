import io
import sys
import tempfile
import time
import unittest
from pathlib import Path
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.reflex_layer import (DECISION_BUDGET_MS, FRAME, PERCEPTION_BUDGET_MS, Perception,
                                   ReflexController, ReflexRunner, Target, detect_targets,
                                   perceive, summarise)
from gameplay.input_profiles import (InputProfileError, keyboard_profile, validate_action,
                                     virtual_joystick_profile, arrows_profile)
from gameplay.skill_memory import SkillMemory
from reflex_agent import ReflexAgent, build_agent, describe_budget
from gameplay_qwen_advisor import SlowAdvisor, AdvisorStats, build_prompt

W, H = FRAME


def frame(*, background=30, boxes=(), arc=0, shift=0):
    """Synthetic 800x600 frame: background, rectangle 'buttons', moving arc."""
    img = Image.new('RGB', (W, H), (background, background, background))
    draw = ImageDraw.Draw(img)
    for i, (x, y, w, h) in enumerate(boxes):
        shade = 90 + 40 * i
        draw.rectangle([x, y, x + w, y + h], fill=(shade, shade, shade))
        draw.text((x + 6, y + 6), 'OK', fill=(220, 220, 220))
    if arc:
        cx, cy = 400 + shift, 300
        draw.ellipse([cx - 40, cy - 40, cx + 40, cy + 40], fill=(200, 60, 60))
    out = io.BytesIO()
    img.save(out, format='PNG')
    return out.getvalue()


BUTTONS = ((40, 60, 160, 60), (560, 480, 180, 70))


class PerceptionTests(unittest.TestCase):
    def test_perception_stays_inside_budget(self):
        png = frame(boxes=BUTTONS)
        started = time.perf_counter()
        result = perceive(png, None)
        elapsed = (time.perf_counter() - started) * 1000
        self.assertLess(result.elapsed_ms, PERCEPTION_BUDGET_MS)
        self.assertLess(elapsed, PERCEPTION_BUDGET_MS * 2, 'budget is per frame on this host')
        self.assertFalse(result.degraded)
        self.assertEqual(result.size, FRAME)

    def test_button_like_rectangles_are_found_first(self):
        result = perceive(frame(boxes=BUTTONS), None)
        self.assertGreaterEqual(len(result.targets), 2)
        top = result.targets[0]
        self.assertTrue(any(abs(top.center[0] - (b[0] + b[2] // 2)) < 60
                            and abs(top.center[1] - (b[1] + b[3] // 2)) < 60 for b in BUTTONS))
        for target in result.targets:
            self.assertTrue(0 <= target.x < W and 0 <= target.y < H)

    def test_change_between_frames_is_localised(self):
        first = perceive(frame(boxes=BUTTONS), None)
        same = perceive(frame(boxes=BUTTONS), first)
        self.assertFalse(same.changed)
        moved = perceive(frame(boxes=BUTTONS, arc=1, shift=0), first)
        self.assertTrue(moved.changed)
        x1, y1, x2, y2 = moved.roi
        self.assertLess(abs((x1 + x2) / 2 - 400), 80)
        self.assertLess(abs((y1 + y2) / 2 - 300), 80)

    def test_rejects_foreign_images(self):
        with self.assertRaises(ValueError):
            perceive(b'not a png')
        small = io.BytesIO()
        Image.new('RGB', (400, 300), (0, 0, 0)).save(small, format='PNG')
        with self.assertRaises(ValueError):
            perceive(small.getvalue())


class DecisionTests(unittest.TestCase):
    def test_slow_advisor_cannot_break_the_deadline(self):
        def slow_advisor(_perception, _step):
            time.sleep(0.6)   # a model call that would overrun a 300 ms budget
            return 'FORWARD'

        controller = ReflexController('EXPLORE', budget_ms=300)
        perception = perceive(frame(boxes=BUTTONS), None)
        started = time.perf_counter()
        decision = controller.decide(perception, 0, advisor=slow_advisor)
        wall_ms = (time.perf_counter() - started) * 1000
        self.assertLessEqual(decision.latency_ms, 300)
        self.assertLess(wall_ms, 450)
        self.assertNotEqual(decision.source, 'advisor')
        self.assertEqual(controller.advisor_timeouts, 1)

    def test_fast_advisor_within_budget_is_accepted(self):
        controller = ReflexController('EXPLORE')
        perception = perceive(frame(boxes=BUTTONS), None)
        decision = controller.decide(perception, 0, advisor=lambda p, s: 'FORWARD')
        self.assertEqual((decision.intent, decision.source), ('FORWARD', 'advisor'))
        self.assertTrue(decision.deadline_met)

    def test_memory_shortcut_avoids_the_advisor(self):
        memory = SkillMemory()
        memory.record('a' * 16, 'INTERACT', True)
        memory.record('a' * 16, 'INTERACT', True)
        controller = ReflexController('EXPLORE', memory=memory)
        called = []
        perception = Perception(signature='a' * 16, changed=True, change_ratio=0.1, roi=None)
        decision = controller.decide(perception, 1, advisor=lambda p, s: called.append(s) or 'FORWARD')
        self.assertEqual(decision.intent, 'INTERACT')
        self.assertEqual(decision.source, 'memory')
        self.assertEqual(called, [])

    def test_runner_overlaps_perception_with_movement(self):
        frames = [frame(boxes=BUTTONS, arc=1, shift=i * 5) for i in range(4)]
        profile = keyboard_profile()
        actions = []
        delay = 0.0

        def act(action):
            validate_action(action)
            actions.append(action)
            time.sleep(0.01)  # stands in for duration_ms of held keys

        controller = ReflexController('EXPLORE')
        runner = ReflexRunner(controller, profile)
        started = time.perf_counter()
        ticks = runner.run(frames, act)
        wall = (time.perf_counter() - started) * 1000
        self.assertEqual(len(ticks), 4)
        self.assertEqual(len(actions), 4)
        for tick in ticks:
            self.assertLess(tick.perception_ms, PERCEPTION_BUDGET_MS)
            self.assertLess(tick.decision_ms, DECISION_BUDGET_MS)
        self.assertLess(wall, len(frames) * DECISION_BUDGET_MS)
        stats = summarise(ticks)
        self.assertGreaterEqual(stats['perception_p95_ms'], 0)
        self.assertIn('sources', stats)
        _ = delay

    def test_summary_counts_sources(self):
        ticks = [type('T', (), {'perception_ms': 10.0, 'decision_ms': 1.0, 'source': 'reflex',
                                'perception_started_before_action_finished': True}) for _ in range(3)]
        stats = summarise(ticks)
        self.assertEqual(stats['ticks'], 3)
        self.assertEqual(stats['sources']['reflex'], 3)
        self.assertEqual(stats['overlapped_ticks'], 3)


class TargetTests(unittest.TestCase):
    def test_center_and_dict_are_bridge_safe(self):
        target = Target(10, 20, 100, 40, 0.5)
        self.assertEqual(target.center, (60, 40))
        payload = target.as_dict()
        self.assertEqual(payload['cx'], 60)
        self.assertTrue(0 <= payload['cx'] < W)


class ProfileTests(unittest.TestCase):
    def test_keyboard_actions_pass_the_bridge_contract(self):
        profile = keyboard_profile()
        for intent in profile.intents():
            validate_action(profile.action(intent))

    def test_joystick_profile_follows_the_detected_button(self):
        profile = virtual_joystick_profile()
        validate_action(profile.action('FORWARD'))
        aimed = profile.action('INTERACT', target=Target(600, 500, 40, 20, 0.9))
        self.assertEqual(aimed['click'], [620, 510])

    def test_arrow_profile(self):
        self.assertEqual(arrows_profile().action('LEFT')['keys'], ['ArrowLeft'])

    def test_invalid_inputs_are_refused(self):
        for bad in ({'keys': ['KeyW', 'KeyW']}, {'keys': ['F13']}, {'click': [900, 10]},
                    {'click': [10.5, 10]}, {'look': [500, 0]}, {'duration_ms': 5},
                    {'hold_ms': 9000}, {'nope': 1}, {'keys': ['a; rm -rf']}):
            with self.assertRaises(InputProfileError):
                validate_action(bad)
        with self.assertRaises(InputProfileError):
            keyboard_profile().action('TELEPORT')


class MemoryTests(unittest.TestCase):
    def test_memory_is_bounded_and_persistent(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'skills.sqlite3'
            memory = SkillMemory(path)
            memory.record('b' * 16, 'FORWARD', True)
            memory.record('b' * 16, 'FORWARD', True)
            memory.record('b' * 16, 'JUMP', False)
            self.assertEqual(memory.recall('b' * 16), 'FORWARD')
            self.assertIsNone(memory.recall('c' * 16))
            reopened = SkillMemory(path)
            self.assertEqual(reopened.recall('b' * 16), 'FORWARD')
            snapshot = reopened.export(Path(tmp) / 'skills.json')
            self.assertIn('FORWARD', snapshot.read_text(encoding='utf-8'))

    def test_only_known_outcomes_are_stored(self):
        memory = SkillMemory()
        with self.assertRaises(ValueError):
            memory.record('Z' * 16, 'FORWARD', True)
        with self.assertRaises(ValueError):
            memory.record('d' * 16, 'FORWARD', 1)
        memory.record('d' * 16, 'FORWARD', False)
        self.assertEqual(memory.best('d' * 16, min_confidence=0.0).misses, 1)

    def test_unseen_or_unreliable_screens_do_not_shortcut(self):
        memory = SkillMemory(min_confidence=0.9)
        memory.record('e' * 16, 'MINE', True)
        memory.record('e' * 16, 'MINE', False)
        self.assertIsNone(memory.recall('e' * 16))


class AgentTests(unittest.TestCase):
    def test_agent_returns_bridge_actions_for_every_step(self):
        agent = ReflexAgent('keyboard')
        out = []
        for step in range(3):
            action = agent(png=frame(boxes=BUTTONS, arc=1, shift=step * 10), step=step)
            validate_action(action)
            out.append(action)
        self.assertEqual(len(out), 3)
        summary = agent.stats.summary()
        self.assertEqual(summary['ticks'], 3)
        self.assertLess(summary['perception_p95_ms'], PERCEPTION_BUDGET_MS)

    def test_agent_ignores_advisor_results_it_cannot_use(self):
        agent = ReflexAgent('arrows', advisor=lambda p, s: 'FLY')
        action = agent(png=frame(boxes=BUTTONS), step=0)
        validate_action(action)
        self.assertIn('keys', action)
        self.assertLessEqual(agent.stats.summary()['advisor_skipped_for_budget'], 1)

    def test_budget_is_declared(self):
        budget = describe_budget()
        self.assertEqual(budget['perception_budget_ms'], 300.0)
        self.assertEqual(budget['decision_budget_ms'], 2000.0)

    def test_step_over_two_seconds_raises(self):
        # The advisor path is already capped at 2 s by the controller budget, so
        # the hard guard is exercised with a pathologically slow perception (the
        # case that would otherwise stall a recording without any error).
        agent = ReflexAgent('keyboard')
        original = agent.controller.observe

        def slow_observe(*args, **kwargs):
            time.sleep(2.2)
            return original(*args, **kwargs)

        agent.controller.observe = slow_observe
        with self.assertRaises(RuntimeError):
            agent(png=frame(boxes=BUTTONS), step=0)

    def test_agent_ticks_record_real_overlap(self):
        agent = ReflexAgent('keyboard')
        agent(png=frame(boxes=BUTTONS, arc=1), step=0)
        agent(png=frame(boxes=BUTTONS, arc=1, shift=8), step=1)
        first, second = agent.stats.ticks
        self.assertGreater(second.overlap_ms, 0, 'previous action window was still open')
        self.assertFalse(first.perception_started_before_action_finished)
        self.assertEqual(agent.stats.summary()['ticks_over_perception_budget'], 0)

    def test_agent_rejects_tampered_screenshot(self):
        agent = ReflexAgent('keyboard')
        with self.assertRaises(ValueError):
            agent(png=b'\x89PNG\r\n\x1a\nbroken', step=0)


class AdvisorTests(unittest.TestCase):
    def _perception(self):
        perception = perceive(frame(boxes=BUTTONS, arc=1), None)
        perception.unfamiliar = True
        return perception

    def test_slow_model_answer_is_rejected_and_asked_less_often(self):
        ticks = {'n': 0.0}

        def clock():
            ticks['n'] += 0.9   # a 900 ms model call on a 300 ms budget
            return ticks['n']

        advisor = SlowAdvisor('reach the castle', ('FORWARD', 'INTERACT'), budget_ms=300,
                              generator=lambda image, prompt: 'FORWARD', clock=clock)
        self.assertIsNone(advisor(self._perception(), 0))
        self.assertEqual(advisor.stats.rejected_budget, 1)
        self.assertEqual(advisor.every, 6, 'cadence must shrink load, not grow it')
        self.assertEqual(advisor.stats.summary()['accepted'], 0)

    def test_fast_model_answer_is_parsed_strictly(self):
        advisor = SlowAdvisor('reach the castle', ('FORWARD', 'INTERACT'),
                              generator=lambda image, prompt: ' interact ')
        self.assertEqual(advisor(self._perception(), 0), 'INTERACT')
        self.assertEqual(advisor.stats.accepted, 1)
        bad = SlowAdvisor('reach the castle', ('FORWARD',), generator=lambda i, p: 'FORWARD; RM -RF /')
        self.assertIsNone(bad(self._perception(), 0))
        self.assertEqual(bad.stats.rejected_output, 1)

    def test_generator_errors_never_escape(self):
        def boom(_image, _prompt):
            raise RuntimeError('CUDA out of memory')
        advisor = SlowAdvisor('reach the castle', ('FORWARD',), generator=boom)
        self.assertIsNone(advisor(self._perception(), 0))
        self.assertEqual(advisor.stats.calls, 1)

    def test_cadence_skips_steps_for_familiar_screens(self):
        advisor = SlowAdvisor('reach the castle', ('FORWARD',), every=5,
                              generator=lambda i, p: 'FORWARD')
        perception = self._perception()
        perception.unfamiliar = False
        self.assertEqual([advisor(perception, s) for s in range(6)],
                         ['FORWARD', None, None, None, None, 'FORWARD'])

    def test_prompt_is_bounded_and_marks_untrusted_text(self):
        perception = self._perception()
        prompt = build_prompt(perception, 'reach the castle', ('FORWARD', 'INTERACT'),
                              ['hint[Gamepad]: ' + 'x' * 500])
        self.assertLessEqual(len(prompt), 1200)
        self.assertIn('untrusted', prompt)
        self.assertNotIn('x' * 200, prompt)

    def test_help_hints_reach_the_prompt(self):
        from gameplay.help_lookup import HelpDesk
        desk = HelpDesk(allow_network=True, fetcher=lambda url: '<a href="/wiki/Controls">Controls</a>')
        advisor = SlowAdvisor('reach the castle', ('FORWARD',), generator=lambda i, p: 'FORWARD',
                              help_desk=desk, game='voxel')
        self.assertEqual(advisor(self._perception(), 0), 'FORWARD')
        self.assertTrue(desk.cache)

    def test_build_agent_wires_everything_offline(self):
        agent = build_agent('joystick', objective='collect wood', game='voxel')
        action = agent(png=frame(boxes=BUTTONS, arc=1), step=0)
        validate_action(action)
        self.assertIn(action['click'][0], range(0, W))
        self.assertEqual(agent.controller.memory, None)

    def test_stats_summary_shape(self):
        stats = AdvisorStats()
        stats.record(120.0, True)
        stats.record(2000.0, False, 'budget')
        summary = stats.summary()
        self.assertEqual(summary['calls'], 2)
        self.assertEqual(summary['latency_max_ms'], 2000.0)


if __name__ == '__main__':
    unittest.main()
