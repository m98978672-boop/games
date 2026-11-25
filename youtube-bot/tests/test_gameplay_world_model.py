import io
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from gameplay.screen_recognizer import classify, preferred_intents
from gameplay.tracker import Tracker, describe
from gameplay.world_model import MAX_DEPTH, Plan, WorldModel
from gameplay.input_profiles import keyboard_profile, virtual_joystick_profile
from gameplay.reflex_layer import Target, perceive
from reflex_agent import ReflexAgent

A, B, C, D = ('a' * 16, 'b' * 16, 'c' * 16, 'd' * 16)
INTENTS = ('FORWARD', 'JUMP', 'INTERACT')


def frame(shade=30, boxes=(), arc=None):
    img = Image.new('RGB', (800, 600), (shade, shade, shade))
    if boxes:
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        for i, (x, y, w, h) in enumerate(boxes):
            draw.rectangle([x, y, x + w, y + h], fill=(80 + i * 20, 80, 90))
            draw.text((x + 6, y + 6), 'ok', fill=(240, 240, 240))
    if arc:
        from PIL import ImageDraw
        draw = ImageDraw.Draw(img)
        draw.ellipse([arc[0], arc[1], arc[0] + 80, arc[1] + 80], fill=(200, 60, 60))
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    return buffer.getvalue()


class WorldModelTests(unittest.TestCase):
    def test_unknown_screen_picks_the_least_tried_intent(self):
        model = WorldModel()
        plan = model.plan(A, INTENTS)
        self.assertEqual(plan.intent, 'FORWARD')
        self.assertEqual(plan.source, 'curiosity')
        model.record(A, 'FORWARD', A)
        model.record(A, 'FORWARD', A)
        self.assertEqual(model.plan(A, INTENTS).intent, 'JUMP', 'try something new')

    def test_bfs_finds_a_route_to_an_unexplored_screen(self):
        model = WorldModel()
        # A -FORWARD-> B -JUMP-> C, and C is only barely visited: that is the goal.
        model.record(A, 'FORWARD', B)
        model.record(B, 'JUMP', C)
        plan = model.plan(A, INTENTS)
        self.assertEqual(plan.source, 'frontier')
        self.assertEqual(plan.intent, 'FORWARD', 'the first step of the route, not the last')
        self.assertEqual(plan.depth, 2)
        self.assertEqual(plan.target_state, C)

    def test_no_frontier_falls_back_to_least_visited_neighbour(self):
        model = WorldModel()
        for _ in range(3):
            model.record(A, 'FORWARD', B)
        model.record(A, 'JUMP', C)
        plan = model.plan(A, INTENTS)
        self.assertIn(plan.intent, ('FORWARD', 'JUMP'))
        self.assertIn(plan.source, ('frontier', 'least-visited'))

    def test_depth_is_bounded(self):
        model = WorldModel(max_depth=3)
        chain = [('%016x' % i) for i in range(20)]
        for i in range(len(chain) - 1):
            model.record(chain[i], 'FORWARD', chain[i + 1])
            model.record(chain[i + 1], 'FORWARD', chain[i + 2] if i + 2 < len(chain) else chain[i])
        plan = model.plan(chain[0], ('FORWARD',))
        self.assertLessEqual(plan.depth, MAX_DEPTH)
        self.assertLessEqual(plan.depth, 3)

    def test_transitions_persist_and_validate(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'world.json'
            model = WorldModel(path)
            model.record(A, 'FORWARD', B)
            model.save()
            reopened = WorldModel(path)
            self.assertEqual(reopened.next_states(A, 'FORWARD'), {B: 1})
            self.assertGreaterEqual(reopened.stats()['transitions'], 1)
            with self.assertRaises(ValueError):
                model.record('nope', 'FORWARD', B)
            with self.assertRaises(ValueError):
                model.record(A, '', B)

    def test_state_count_is_bounded(self):
        model = WorldModel(max_states=5)
        for i in range(50):
            model.record('%016x' % i, 'FORWARD', '%016x' % (i + 1))
        self.assertLessEqual(model.stats()['states'], 6)

    def test_empty_intent_list_is_refused(self):
        with self.assertRaises(ValueError):
            WorldModel().plan(A, ())


class TrackerTests(unittest.TestCase):
    def target(self, x, y, w=40, h=40):
        return Target(x, y, w, h, 0.9)

    def test_velocity_direction_and_lead(self):
        tracker = Tracker()
        now = 1000.0
        for i in range(5):
            tracker.update([self.target(100 + i * 20, 200)], now=now + i * 0.1)
        best = tracker.best_target()
        self.assertIsNotNone(best)
        self.assertEqual(best.direction, 'right')
        self.assertGreater(best.vx, 100)
        lead_x, _lead_y = best.lead(0.5)
        self.assertGreater(lead_x, best.center[0])
        self.assertIn('moving right', best.prompt_line())

    def test_single_flicker_is_not_an_object(self):
        tracker = Tracker()
        self.assertEqual(tracker.update([self.target(10, 10)], now=1.0), [])
        self.assertEqual(tracker.update([], now=1.1), [])

    def test_persistence_survives_a_missing_frame(self):
        tracker = Tracker()
        now = 10.0
        for i in range(4):
            tracker.update([self.target(50 + i * 10, 60)], now=now + i * 0.1)
        tracker.update([], now=now + 0.5)
        confirmed = tracker.update([self.target(90, 60)], now=now + 0.6)
        self.assertTrue(confirmed, 'the track must be re-acquired, not duplicated')
        self.assertEqual(len(tracker.tracks), 1)

    def test_two_objects_swap_is_not_confused(self):
        tracker = Tracker()
        now = 0.0
        for i in range(4):
            tracker.update([self.target(100 + i * 30, 100), self.target(500 - i * 30, 100)],
                           now=now + i * 0.1)
        directions = sorted(t.direction for t in tracker.confirmed())
        self.assertEqual(directions, ['left', 'right'])
        self.assertIn('moving', describe(tracker.confirmed()))

    def test_scene_change_clears_tracks(self):
        tracker = Tracker(max_missed=1)
        now = 0.0
        for i in range(3):
            tracker.update([self.target(10 + i, 10)], now=now + i * 0.1)
        for i in range(4):
            tracker.update([], now=now + 1 + i * 0.1)
        self.assertEqual(tracker.confirmed(), [])


class RecognizerTests(unittest.TestCase):
    def test_menu_like_screen_with_several_buttons(self):
        png = frame(boxes=[(40, 40, 160, 60), (300, 40, 160, 60), (560, 40, 160, 60)])
        # The first frame of any session has no predecessor, so "change" is 1.0;
        # a menu is recognised when the screen is *stable* (second frame).
        first = perceive(png, None)
        perception = perceive(png, first)
        self.assertLessEqual(perception.change_ratio, 0.25)
        kind = classify(perception)
        self.assertEqual(kind.label, 'menu')
        self.assertGreater(kind.confidence, 0.5)
        self.assertIn('INTERACT', preferred_intents(kind, keyboard_profile()))

    def test_changing_screen_is_gameplay(self):
        base = frame(boxes=[(40, 40, 160, 60)])
        first = perceive(base, None)
        second = perceive(base, first)
        moving = perceive(frame(boxes=[(40, 40, 160, 60)], arc=(100, 100)), second)
        self.assertTrue(moving.changed)
        self.assertEqual(classify(moving).label, 'gameplay')

    def test_empty_screen_is_quiet(self):
        perception = perceive(frame(boxes=()), None)
        self.assertIn(classify(perception).label, ('quiet', 'text'))

    def test_preferred_intents_never_empty_and_never_invented(self):
        profile = virtual_joystick_profile()
        perception = perceive(frame(boxes=[(40, 40, 160, 60)] * 1), None)
        for label in ('menu', 'gameplay', 'text', 'quiet'):
            kind = type('K', (), {'label': label})()
            chosen = preferred_intents(kind, profile)
            self.assertTrue(chosen)
            self.assertTrue(set(chosen) <= set(profile.intents()))


class AgentTests(unittest.TestCase):
    def test_agent_uses_the_world_model_to_keep_exploring(self):
        model = WorldModel()
        agent = ReflexAgent('keyboard', world_model=model)
        for step in range(6):
            action = agent(frame(20 + step * 4), step)
            self.assertIn('keys', action)
        self.assertGreaterEqual(model.stats()['transitions'], 1)
        self.assertIsNotNone(agent.screen)
        self.assertIn(agent.screen.label, ('menu', 'gameplay', 'text', 'quiet'))

    def test_agent_tracks_objects_across_frames(self):
        agent = ReflexAgent('keyboard')
        frames = [frame(arc=(120 + step * 25, 200)) for step in range(5)]
        for step, png in enumerate(frames):
            agent(png, step)
        confirmed = agent.tracker.confirmed()
        self.assertTrue(confirmed, 'a moving sprite should be tracked')
        self.assertGreaterEqual(confirmed[0].seen, 2)
        self.assertGreater(confirmed[0].vx, 0, 'it moves to the right')

    def test_plan_is_not_applied_to_memory_or_advisor_answers(self):
        agent = ReflexAgent('keyboard', world_model=WorldModel())
        decision = type('D', (), {'intent': 'MINE', 'source': 'advisor',
                                  'latency_ms': 1.0, 'target': None})()
        perception = perceive(frame(), None)
        self.assertEqual(agent._plan(perception, decision).intent, 'MINE')

    def test_plan_result_is_a_decision_with_a_source(self):
        agent = ReflexAgent('keyboard', world_model=WorldModel())
        perception = perceive(frame(), None)
        decision = type('D', (), {'intent': 'WAIT', 'source': 'reflex',
                                  'latency_ms': 1.0, 'target': None})()
        planned = agent._plan(perception, decision)
        self.assertTrue(planned.source.startswith(('plan:', 'screen')) or planned.source == 'reflex')


class PlannerPayoffTests(unittest.TestCase):
    """Planning must be measurably better than probing at random, not just plausible."""

    @staticmethod
    def _explore(use_model: bool, steps: int = 150) -> tuple[int, int | None]:
        import random

        rng = random.Random(20261124)
        intents = ('FORWARD', 'JUMP', 'INTERACT', 'BACK')
        screens = ['%016x' % (i + 1) for i in range(60)]
        world = {s: {i: rng.choice(screens) for i in intents} for s in screens}
        brain = WorldModel() if use_model else None
        walker = random.Random(7)
        state, seen, reached = screens[0], {screens[0]}, None
        for step in range(1, steps + 1):
            intent = (brain.plan(state, list(intents)).intent if brain is not None
                      else walker.choice(intents))
            nxt = world[state][intent]
            if brain is not None:
                brain.record(state, intent, nxt)
            seen.add(nxt)
            state = nxt
            if reached is None and len(seen) >= 48:
                reached = step
        return len(seen), reached

    def test_planned_exploration_finds_more_screens_sooner(self):
        planned, planned_at = self._explore(True)
        walked, walked_at = self._explore(False)
        self.assertGreaterEqual(planned, walked, 'planning should not discover less')
        self.assertIsNotNone(planned_at)
        self.assertLess(planned_at, walked_at, 'planning should get there sooner')

    def test_intelligence_layer_costs_well_under_a_millisecond(self):
        import time

        from gameplay.screen_recognizer import classify, preferred_intents
        from gameplay.tracker import Tracker

        # Perception itself is measured separately; this is the *added* brain:
        # screen classification + intent choice + tracking, per frame.
        tracker = Tracker()
        frames = [perceive(frame(arc=(120 + step * 9, 200)), None) for step in range(20)]
        started = time.perf_counter()
        for perception in frames:
            kind = classify(perception)
            preferred_intents(kind, keyboard_profile())
            tracker.update(perception.targets)
        per_tick = (time.perf_counter() - started) / len(frames) * 1000.0
        self.assertLess(per_tick, 1.0, f'{per_tick:.3f} ms per tick is too slow')


if __name__ == '__main__':
    unittest.main()
