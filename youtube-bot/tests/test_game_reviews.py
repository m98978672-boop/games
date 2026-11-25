import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from game_reviews import build_review_messages, generate_game_review, generate_long_narration, load_game_catalog, validate_review, youtube_description
from schedule_policy import next_publish_slot


class GameCatalogTests(unittest.TestCase):
    def test_spoken_source_excerpt_does_not_read_an_incomplete_cutoff(self):
        from game_reviews import spoken_source_excerpt, review_opening, steam_release_note
        self.assertEqual(spoken_source_excerpt('Слово ' * 50, 40, 'Полный запасной текст.'), 'Полный запасной текст.')
        self.assertEqual(spoken_source_excerpt('Первое полное предложение. Следующее длинное предложение.', 35, 'Запасной текст.'), 'Первое полное предложение.')
        self.assertIn('Сегодня в обзоре', review_opening('Игра'))
        self.assertNotIn('…', steam_release_note({'source_facts': {'release_date': 'а' * 70, 'release_coming_soon': True}}))

    def test_titles_are_bounded_sanitized_and_not_cut_mid_suffix(self):
        from game_reviews import make_review_title
        title = make_review_title('Игра 😀 ' * 50, video_format='long')
        self.assertLessEqual(len(title.encode('utf-16-le')) // 2, 100)
        self.assertTrue(title.endswith('…'))
        self.assertNotIn('\n', make_review_title('Первая\nВторая'))
        with self.assertRaises(ValueError):
            make_review_title('https://example.com')

    def test_rare_question_is_stable(self):
        from game_reviews import occasionally_ask_viewers
        results = [occasionally_ask_viewers(str(i)) for i in range(1000)]
        self.assertTrue(50 < sum(results) < 150)
        self.assertEqual(results, [occasionally_ask_viewers(str(i)) for i in range(1000)])

    def test_description_preserves_official_game_link_under_length_limit(self):
        review = {'game_id': '123456', 'game_title': 'Игра' * 100, 'game_version': 'v' * 300,
                  'pros': ['факт' * 3000, 'факт' * 3000], 'possible_minus': 'Возможно, не всем.',
                  'sources': [{'name': 'Steam', 'url': 'https://store.steampowered.com/app/123456/'},
                              {'name': 'bad', 'url': 'https://[broken'}]}
        description = youtube_description(review)
        self.assertLessEqual(len(description), 5000)
        self.assertIn('https://store.steampowered.com/app/123456/', description)
        self.assertEqual(description.count('https://store.steampowered.com/app/123456/'), 1)
        self.assertNotIn('https://[broken', description)

    def test_price_note_does_not_invent_free_or_other_region_price(self):
        from game_reviews import steam_price_note
        self.assertIn("не подтверждена", steam_price_note({}))
        paid = {"source_facts": {"price": {"kind": "paid", "minor_units": 1999, "currency": "EUR", "region": "NL", "checked_at": "2026-11-22"}}}
        self.assertIn("19 евро 99 центов", steam_price_note(paid))
        paid["source_facts"]["price"]["region"] = "US"
        self.assertIn("не подтверждена", steam_price_note(paid))
        free = {"source_facts": {"price": {"kind": "free_to_play", "region": "NL", "checked_at": "2026-11-22"}}}
        self.assertIn("дополнительные покупки", steam_price_note(free))

    def test_spoken_store_context_marks_region_and_unreleased_dates(self):
        from game_reviews import steam_release_note, with_store_context
        review = {'game_title': 'Пример', 'source_facts': {'release_date': '12 окт. 2027', 'release_coming_soon': True,
                  'price': {'kind': 'paid', 'minor_units': 1999, 'currency': 'EUR', 'region': 'NL', 'checked_at': '2026-11-22'}}}
        self.assertIn('выход ожидается', steam_release_note(review))
        scenes = with_store_context([{'dialogue': 'Вступление.'}, {'dialogue': 'Особенности.'}], review)
        self.assertIn('2027', scenes[0]['dialogue'])
        self.assertIn('19 евро 99 центов', scenes[1]['dialogue'])
        self.assertIn('Нидерланд', scenes[1]['dialogue'])
        review['source_facts']['release_coming_soon'] = False
        self.assertIn('Дата выхода', steam_release_note(review))
        review['source_facts']['release_date'] = 'https://evil.invalid'
        self.assertIn('не подтверждена', steam_release_note(review))
        self.assertIn('не подтверждена', steam_release_note({}))

    def test_catalog_is_loaded_from_repo_and_has_public_links(self):
        games = load_game_catalog()
        self.assertGreaterEqual(len(games), 5)
        self.assertTrue(all(game["features"] for game in games))
        self.assertTrue(all(game["public_url"].startswith("https://m98978672-boop.github.io/games/") for game in games))

    def test_bad_or_empty_catalog_is_rejected(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "catalog.json"
            path.write_text("{}", encoding="utf-8")
            with self.assertRaises(ValueError):
                load_game_catalog(path)

    def test_prompt_contains_catalog_facts_and_recent_ids_not_freeform_user_text(self):
        games = load_game_catalog()
        messages = build_review_messages(games, recent_game_ids=[games[0]["id"]], seed="weekly run")
        request = json.loads(messages[1]["content"])
        self.assertEqual(messages[0]["role"], "system")
        self.assertEqual(request["recent_game_ids"], [games[0]["id"]])
        self.assertTrue(request["catalog"][0]["features"][0]["feature_id"].endswith("-f1"))
        self.assertIn("Не выдумывай игровой процесс", messages[0]["content"])

    def test_score_prompt_is_not_anchored_to_seven(self):
        prompt = build_review_messages(load_game_catalog())[0]['content']
        self.assertIn('весь диапазон', prompt)
        self.assertNotIn('"idea_score":7', prompt)

    def test_review_rejects_repeat_even_without_alternatives(self):
        game = load_game_catalog()[0]
        gid = game['id']
        data = {'schema_version': 1, 'game_id': gid, 'selected_feature_ids': [f'{gid}-f1', f'{gid}-f2'],
                'possible_minus': 'Возможно, этот формат подойдёт не всем.', 'minus_feature_id': f'{gid}-f1',
                'idea_score': 7, 'hook': 'Что интересного предлагает игра?'}
        with self.assertRaisesRegex(ValueError, 'repeated'):
            validate_review(data, [game], recent_game_ids=[gid])

    def test_each_valid_rating_is_preserved(self):
        game = load_game_catalog()[0]
        gid = game['id']
        for score in (1, 4, 7, 10):
            data = {'schema_version': 1, 'game_id': gid, 'selected_feature_ids': [f'{gid}-f1', f'{gid}-f2'],
                    'possible_minus': 'Возможно, этот формат подойдёт не всем.', 'minus_feature_id': f'{gid}-f1',
                    'idea_score': score, 'hook': 'Что интересного предлагает игра?'}
            with self.subTest(score=score):
                result = validate_review(data, [game])
                self.assertEqual(result['idea_score'], score)
                self.assertIn(f'{score} из 10', result['scenes'][-1]['dialogue'])

    def test_spoken_source_labels_and_foreign_title(self):
        from game_reviews import spoken_feature, review_opening
        self.assertEqual(spoken_feature('Описание Steam: Кооперативная игра.'), 'Кооперативная игра.')
        self.assertEqual(spoken_feature('Жанры, указанные в Steam: Головоломки'), 'Жанры игры: Головоломки')
        self.assertIn('разбираем игру', review_opening('PERI.CO'))
        self.assertIn('Борис', review_opening('Борис'))

    def test_review_prompt_supplies_source_price_and_date_without_inventing_them(self):
        game = dict(load_game_catalog()[0])
        game['source_facts'] = {'release_date': '12 окт. 2027', 'release_coming_soon': True,
            'price': {'kind': 'paid', 'minor_units': 1999, 'currency': 'EUR', 'region': 'NL', 'checked_at': '2026-11-22'}}
        request = json.loads(build_review_messages([game])[1]['content'])
        self.assertIn('19 евро 99 центов', request['catalog'][0]['price_context'])
        self.assertIn('выход ожидается', request['catalog'][0]['release_context'])
        self.assertIn('не выдумывай', request['instructions'])

    def test_missing_or_invalid_model_rating_is_not_fabricated(self):
        games = load_game_catalog()
        with patch('game_reviews.generate_with_qwen', return_value='{}'):
            with self.assertRaisesRegex(ValueError, 'refusing to invent'):
                generate_game_review(games)
        game = games[0]
        data = {'schema_version': 1, 'game_id': game['id'], 'selected_feature_ids': [f"{game['id']}-f1", f"{game['id']}-f2"],
                'possible_minus': 'Возможно, не подойдёт каждому.', 'minus_feature_id': f"{game['id']}-f1",
                'hook': 'Что интересного предлагает игра?'}
        for score in (True, 7.9, None, 11):
            with self.subTest(score=score), self.assertRaises(ValueError):
                validate_review({**data, 'idea_score': score}, games)

    def test_review_is_canonicalized_from_cited_catalog_features(self):
        games = load_game_catalog()
        game = games[0]
        feature_ids = [f"{game['id']}-f1", f"{game['id']}-f2"]
        raw = {
            "schema_version": 1,
            "game_id": game["id"],
            "selected_feature_ids": feature_ids,
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": feature_ids[0],
            "idea_score": 8,
            "hook": "Что интересного в этом игровом проекте?",
        }
        review = validate_review(raw, games)
        self.assertEqual(review["pros"], game["features"][:2])
        self.assertEqual(review["minus_evidence"], game["features"][0])
        self.assertEqual(review["format"], "game-review")
        self.assertIn("не личное прохождение", youtube_description(review))
        self.assertIn("https://m98978672-boop.github.io/games/", youtube_description(review))
        self.assertEqual(len(review["scenes"]), 5)
        self.assertTrue(review["scenes"][0]["dialogue"].startswith("Привет! Сегодня в обзоре"))
        self.assertIn(game["title"], review["scenes"][0]["dialogue"])
        self.assertIn("О чём игра?", review["scenes"][1]["dialogue"])
        self.assertEqual(review["scenes"][-1]["label"], "ИТОГ")
        self.assertIn("8 из 10", review["scenes"][-1]["dialogue"])
        self.assertIn("Я ещё не играла", review["scenes"][-1]["dialogue"])

    def test_long_catalog_text_is_bounded_for_narration_without_changing_evidence(self):
        game = dict(load_game_catalog()[0])
        game["features"] = ["Сильная сторона " + "подробное описание " * 18, "Вторая сторона " + "ещё деталей " * 18]
        long_title = "Очень длинное название игрового проекта " * 3
        game["title"] = long_title
        game["version"] = "1.0"
        feature_ids = [f"{game['id']}-f1", f"{game['id']}-f2"]
        review = validate_review({
            "schema_version": 1, "game_id": game["id"], "selected_feature_ids": feature_ids,
            "possible_minus": "Возможно, подробная концепция подойдёт не каждому игроку.",
            "minus_feature_id": feature_ids[0], "idea_score": 7,
            "hook": "Как устроен этот проект и чем он может заинтересовать зрителя?",
        }, [game])
        self.assertEqual(review["pros"], game["features"][:2])
        self.assertTrue(all(len(scene["dialogue"]) <= 130 for scene in review["scenes"]))
        self.assertIn(long_title, review["game_title"])

    def test_english_source_text_is_blocked_before_tts(self):
        game = dict(load_game_catalog()[0])
        game["features"] = ["Online multiplayer combat with strategic missions", "Thousands of weapons and seasonal events"]
        payload = {
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Возможно, большой набор функций подойдёт не всем.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Короткий обзор этой игры на русском языке.",
        }
        with self.assertRaisesRegex(ValueError, "cannot be safely narrated in Russian"):
            validate_review(payload, [game])

    def test_rejects_unknown_feature_repeated_game_and_unmarked_negative_claim(self):
        games = load_game_catalog()
        game = games[0]
        good = {
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Короткий разбор игрового проекта Games!",
        }
        bad = dict(good, selected_feature_ids=["made-up", f"{game['id']}-f2"])
        with self.assertRaises(ValueError):
            validate_review(bad, games)
        with self.assertRaises(ValueError):
            validate_review(good, games, recent_game_ids=[game["id"]])
        bad = dict(good, possible_minus="Управление ужасное и точно сломано.")
        with self.assertRaises(ValueError):
            validate_review(bad, games)

    def test_generation_retries_with_exact_feature_ids(self):
        games = load_game_catalog()
        game = games[0]
        base = {
            "schema_version": 1,
            "game_id": game["id"],
            "selected_feature_ids": ["not-a-real-feature", "also-invalid"],
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": f"{game['id']}-f1",
            "idea_score": 7,
            "hook": "Короткий разбор игрового проекта Games!",
        }
        corrected = dict(
            base,
            selected_feature_ids=[f"{game['id']}-f1", f"{game['id']}-f2"],
        )
        with patch("game_reviews.generate_with_qwen", side_effect=[json.dumps(base), json.dumps(corrected)]) as generate:
            review = generate_game_review(games)
        self.assertEqual(generate.call_count, 2)
        self.assertEqual(review["pros"], game["features"][:2])

    def test_long_form_script_requires_source_ids_russian_and_minimum_length(self):
        games = load_game_catalog()
        game = games[0]
        review = validate_review({
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Возможно, такой акцент подойдёт не каждому игроку.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Что интересного в этом игровом проекте?",
        }, games)
        line = "По моему впечатлению от опубликованного описания, этот факт помогает понять особенности проекта и оценить, кому может быть интересен такой игровой опыт."
        line = (line * 3)[:260].rstrip()
        while len(line) < 220:
            line += " Это оценка только по источнику."
        payload = {"scenes": [
            {"fact_id": f"{game['id']}-f1", "dialogue": line[:320], "visual": "Показываем подтверждённый факт из источника"}
            for _ in range(10)
        ]}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps(payload, ensure_ascii=False)):
            scenes = generate_long_narration(review)
        self.assertEqual(len(scenes), 10)
        self.assertGreaterEqual(sum(len(scene["dialogue"]) for scene in scenes), 2400)
        self.assertTrue(all("fact_id" in scene for scene in scenes))
        self.assertIn("Итог по источникам:", scenes[-1]["dialogue"])
        self.assertIn("7 из 10", scenes[-1]["dialogue"])
        self.assertIn("Лично я не играл", scenes[-1]["dialogue"])
        self.assertEqual(scenes[-1]["visual"], "ИТОГ ПО ИСТОЧНИКАМ · 7/10")

    def test_long_review_retries_chapters_individually_after_count_error(self):
        games = load_game_catalog()
        game = games[0]
        review = validate_review({
            "schema_version": 1, "game_id": game["id"],
            "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
            "possible_minus": "Возможно, такой акцент подойдёт не каждому игроку.",
            "minus_feature_id": f"{game['id']}-f1", "idea_score": 7,
            "hook": "Что интересного в этом игровом проекте?",
        }, games)
        text = ("По опубликованному описанию можно составить впечатление о проекте. "
                "Эта особенность помогает оценить представленную идею, но без личного прохождения "
                "нельзя судить о качестве исполнения или делать выводы о впечатлениях других игроков. "
                "Посмотрите первоисточник и решите, подходит ли вам предложенная концепция.")
        chapter = {"fact_id": f"{game['id']}-f1", "dialogue": text, "visual": "Описание из источника"}
        chapters = [dict(chapter, fact_id=list(review['evidence'])[i % len(review['evidence'])]) for i in range(10)]
        with patch("game_reviews.generate_with_qwen", side_effect=[json.dumps({"scenes": []})] + [json.dumps(c) for c in chapters]) as generate:
            scenes = generate_long_narration(review)
        self.assertEqual(generate.call_count, 11)
        self.assertEqual(len(scenes), 10)
        self.assertIn("Итог по источникам:", scenes[-1]["dialogue"])

    def test_long_chapters_trim_only_at_complete_sentence(self):
        from game_reviews import fit_complete_chapter
        sentence = 'В игре исследуют открытый мир и решают непростые задачи. '
        original = sentence * 9
        trimmed = fit_complete_chapter(original)
        self.assertTrue(220 <= len(trimmed) <= 320)
        self.assertTrue(trimmed.endswith('.'))
        self.assertTrue(original.startswith(trimmed))
        with self.assertRaisesRegex(ValueError, 'no safe sentence boundary'):
            fit_complete_chapter('Длинная незаконченная фраза ' * 20)
        with self.assertRaisesRegex(ValueError, 'no safe sentence boundary'):
            fit_complete_chapter('Незаконченная фраза ' * 12)
        partial = sentence * 5 + 'Незавершённая мысль'
        self.assertEqual(fit_complete_chapter(partial), (sentence * 5).strip())

    def test_plain_chapters_are_bound_only_to_the_supplied_source(self):
        from game_reviews import _generate_long_in_batches
        review = {'evidence': {'a':'В игре есть головоломки.', 'b':'В карточке указан одиночный режим.'},
                  'game_title':'Пример', 'idea_score':7, 'pros':['Головоломки','Одиночный режим']}
        text = ('По описанию игроку предстоит знакомство с правилами и поиск решения. '
                'Здесь интересно рассматривать каждое действие в контексте заявленной задачи. '
                'Это впечатление от карточки, а не вывод после личного прохождения; '
                'чтобы оценить исполнение, понадобится попробовать игру самостоятельно.')
        with patch('game_reviews.generate_with_qwen', return_value=text) as generate:
            scenes = _generate_long_in_batches(review)
        self.assertEqual([s['fact_id'] for s in scenes], ['a','b']*5)
        self.assertTrue(scenes[-1]['dialogue'].startswith(text))
        self.assertIn('Итог по источникам:', scenes[-1]['dialogue'])
        prompt = json.loads(generate.call_args_list[0].args[0][1]['content'])
        self.assertEqual(prompt['source_fact'],review['evidence']['a'])
        self.assertNotIn('sources',prompt)

    def test_individual_chapter_retries_long_unpunctuated_output(self):
        from game_reviews import _generate_long_in_batches
        review = {'evidence': {'a': 'В игре есть головоломки.', 'b': 'В карточке указан одиночный режим.'},
                  'game_title': 'Пример', 'idea_score': 7, 'pros': ['Головоломки', 'Одиночный режим']}
        text = ('По описанию игроку предстоит знакомство с правилами и поиск решения. '
                'Здесь интересно рассматривать каждое действие в контексте заявленной задачи. '
                'Это впечатление от карточки, а не вывод после личного прохождения; '
                'чтобы оценить исполнение, понадобится попробовать игру самостоятельно.')
        with patch('game_reviews.generate_with_qwen', side_effect=['Слишком длинная мысль ' * 40] * 3 + [text] * 10) as gen:
            scenes = _generate_long_in_batches(review)
        self.assertEqual(len(scenes), 10)
        self.assertEqual(gen.call_count, 13)
        self.assertIn('4 коротких', gen.call_args_list[1].args[0][-1]['content'])

    def test_long_review_rejects_invalid_individual_chapters(self):
        review = {"evidence": {"a": "Один факт", "b": "Другой факт"}, "game_title": "Test", "idea_score": 7,
                  "hook": "Что предлагает игра?", "pros": ["Один факт", "Другой факт"], "possible_minus": "Возможно, не для всех."}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps({"scenes": []})):
            with self.assertRaisesRegex(ValueError, "requires two Russian source facts"):
                generate_long_narration(review)

    def test_editorial_gate_rejects_template_and_repeated_chapters(self):
        from game_reviews import ensure_editorial_quality
        repeated = [{'dialogue': 'Подробное объяснение игровой механики и цели. ' * 5} for _ in range(10)]
        with self.assertRaisesRegex(ValueError, 'repetitive'):
            ensure_editorial_quality(repeated)
        repeated[0]['generation'] = 'source-template'
        with self.assertRaisesRegex(ValueError, 'fallback'):
            ensure_editorial_quality(repeated)

    def test_long_fallback_uses_only_bounded_source_facts_and_identifies_template(self):
        review = {"evidence": {"a": "В описании упомянуты логические задачи.", "b": "В карточке указан одиночный режим."},
                  "game_title": "Игра", "idea_score": 7, "hook": "Что предлагает игра?",
                  "pros": ["В описании упомянуты логические задачи.", "В карточке указан одиночный режим."],
                  "possible_minus": "Возможно, это не для всех."}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps({"scenes": []})):
            scenes = generate_long_narration(review)
        self.assertEqual(len(scenes), 10)
        self.assertGreaterEqual(sum(len(scene["dialogue"]) for scene in scenes), 3000)
        self.assertTrue(all(scene["generation"] == "source-template" for scene in scenes))
        self.assertTrue(all(scene["fact_id"] in review["evidence"] for scene in scenes))
        self.assertIn("Лично я не играл", scenes[-1]["dialogue"])

    def test_plan_fallback_repairs_non_russian_and_contact_fields(self):
        games = load_game_catalog()
        game = games[0]
        invalid = {"schema_version": 1, "game_id": game["id"],
                   "selected_feature_ids": [f"{game['id']}-f1", f"{game['id']}-f2"],
                   "minus_feature_id": f"{game['id']}-f1", "idea_score": 5,
                   "hook": "English-only introduction", "possible_minus": "Возможно, visit www.example.com"}
        with patch("game_reviews.generate_with_qwen", return_value=json.dumps(invalid)):
            with self.assertRaisesRegex(ValueError, 'targeted retries'):
                generate_game_review(games)

    def test_targeted_limitation_repair_preserves_game_score_and_source(self):
        game = dict(load_game_catalog()[0]); gid = game['id']
        draft = {'schema_version':1, 'game_id':gid, 'selected_feature_ids':[f'{gid}-f1', f'{gid}-f2'],
                 'minus_feature_id':f'{gid}-f1', 'idea_score':7, 'hook':'Что предлагает этот проект?',
                 'possible_minus':'Недостаток неизвестен'}
        correction = {'possible_minus':'Возможно, такой игровой формат подойдёт не каждому.', 'minus_feature_id':f'{gid}-f2'}
        with patch('game_reviews.generate_with_qwen', side_effect=[json.dumps(draft),json.dumps(draft),json.dumps(correction)]) as gen:
            review = generate_game_review([game])
        self.assertEqual(gen.call_count,3)
        self.assertEqual(review['game_id'],gid); self.assertEqual(review['idea_score'],7)
        self.assertEqual(review['possible_minus'],correction['possible_minus'])
        self.assertEqual(review['minus_evidence'],game['features'][1])
        self.assertIn('source_facts',json.loads(gen.call_args.args[0][1]['content']))

    def test_targeted_repair_rejects_wrong_fact_and_unsupported_text(self):
        game = dict(load_game_catalog()[0]); gid = game['id']
        draft = {'game_id':gid, 'idea_score':6, 'possible_minus':'Нет', 'hook':'Что предлагает игра?'}
        wrong = {'possible_minus':'Возможно, формат подойдёт не каждому.', 'minus_feature_id':'other-f1'}
        unsupported = {'possible_minus':'Игра сломана!', 'minus_feature_id':f'{gid}-f1'}
        with patch('game_reviews.generate_with_qwen', side_effect=[json.dumps(draft),json.dumps(draft),json.dumps(wrong),json.dumps(unsupported)]+["Нет"]*3):
            with self.assertRaisesRegex(ValueError,'targeted retries'):
                generate_game_review([game])

    def test_single_fact_repair_binds_source_without_model_id(self):
        game = dict(load_game_catalog()[0]); gid = game['id']
        draft = {'game_id': gid, 'idea_score': 6, 'possible_minus': 'Нет', 'hook': 'Что предлагает игра?'}
        with patch('game_reviews.generate_with_qwen', side_effect=[json.dumps(draft)] * 2 + ['{}'] * 2 +
                   ['Возможно, такой формат подойдёт не каждому игроку.']) as gen:
            result = generate_game_review([game])
        self.assertEqual(result['limitation_generation'], 'single_fact_model_repair')
        self.assertEqual(result['minus_evidence'], game['features'][0])
        self.assertEqual(json.loads(gen.call_args.args[0][1]['content'])['факт'], game['features'][0])
        self.assertEqual(result['idea_score'], 6)

    def test_platform_fallback_requires_explicit_platform_evidence(self):
        game=dict(load_game_catalog()[0]); gid=game['id']
        game['features']=list(game['features'])+['Карточка Steam не отмечает поддержку Linux']
        game['source_facts']={'platforms_not_marked_supported':['Linux']}
        draft={'game_id':gid,'idea_score':7,'possible_minus':'Нет','hook':'Что предлагает игра?'}
        invalid={'possible_minus':'Нет','minus_feature_id':f'{gid}-f1'}
        with patch('game_reviews.generate_with_qwen',side_effect=[json.dumps(draft)]*2+[json.dumps(invalid)]*2+["Нет"]*3):
            review=generate_game_review([game])
        self.assertEqual(review['minus_evidence'],'Карточка Steam не отмечает поддержку Linux')
        self.assertEqual(review['limitation_generation'],'explicit_steam_platform_flag_template')
        self.assertIn('Linux',review['possible_minus'])
        game['source_facts']={}
        with patch('game_reviews.generate_with_qwen',side_effect=[json.dumps(draft)]*2+[json.dumps(invalid)]*2+["Нет"]*3):
            with self.assertRaisesRegex(ValueError,'targeted retries'): generate_game_review([game])

    def test_missing_score_is_recovered_for_same_game_only(self):
        game = dict(load_game_catalog()[0]); gid = game['id']
        draft = {'schema_version': 1, 'game_id': gid, 'selected_feature_ids': [f'{gid}-f1', f'{gid}-f2'],
                 'minus_feature_id': f'{gid}-f1', 'possible_minus': 'Возможно, такой формат подойдёт не всем.',
                 'hook': 'Что предлагает эта игра?'}
        with patch('game_reviews.generate_with_qwen', side_effect=[json.dumps(draft)] * 2 + ['4']) as generator:
            review = generate_game_review([game])
        self.assertEqual(review['idea_score'], 4)
        self.assertEqual(review['game_id'], gid)
        self.assertEqual(json.loads(generator.call_args.args[0][1]['content'])['game'], game['title'])
        for invalid in ('8/10', 'три'):
            with patch('game_reviews.generate_with_qwen', side_effect=[json.dumps(draft)] * 2 + [invalid] * 2):
                with self.assertRaisesRegex(ValueError, 'unambiguous score'):
                    generate_game_review([game])

    def test_malformed_json_recovers_only_unambiguous_model_score(self):
        game=dict(load_game_catalog()[0]); gid=game['id']
        game['features']=list(game['features'])+['Карточка Steam не отмечает поддержку Linux']
        game['source_facts']={'platforms_not_marked_supported':['Linux']}
        with patch('game_reviews.generate_with_qwen',side_effect=['{broken','{broken','8','{}','{}']+['Нет']*3):
            review=generate_game_review([game])
        self.assertEqual(review['idea_score'],8)
        self.assertEqual(review['selection_method'],'first_eligible_catalog_candidate_after_invalid_json')
        self.assertIn('Linux',review['minus_evidence'])
        for bad in ('Оценка: 8','11','8/10'):
            with self.subTest(bad=bad),patch('game_reviews.generate_with_qwen',side_effect=['{broken','{broken',bad,bad]):
                with self.assertRaisesRegex(ValueError,'unambiguous score'):
                    generate_game_review([game])

    def test_generation_uses_catalog_only_fallback_after_invalid_feature_ids(self):
        games = load_game_catalog()
        game = games[0]
        invalid = {
            "schema_version": 1,
            "game_id": game["id"],
            "selected_feature_ids": ["made-up", f"{game['id']}-f2"],
            "possible_minus": "Может потребовать привыкания к управлению.",
            "minus_feature_id": f"{game['id']}-f1",
            "idea_score": 8,
            "hook": "Короткий разбор игрового проекта Games!",
        }
        with patch("game_reviews.generate_with_qwen", side_effect=[json.dumps(invalid), json.dumps(invalid)]) as generate:
            review = generate_game_review(games)
        self.assertEqual(generate.call_count, 2)
        self.assertEqual(review["pros"], game["features"][:2])
        self.assertEqual(review["minus_evidence"], game["features"][0])


class ScheduleTests(unittest.TestCase):
    def test_shorts_have_two_daily_moscow_slots_in_winter_and_summer(self):
        from datetime import datetime, timezone
        for month in (1, 7, 11):
            morning = next_publish_slot(datetime(2026, month, 23, 1, 0, tzinfo=timezone.utc))
            noon = next_publish_slot(datetime(2026, month, 23, 5, 0, tzinfo=timezone.utc))
            self.assertEqual(morning.isoformat(), f"2026-{month:02d}-23T05:00:00+00:00")
            self.assertEqual(noon.isoformat(), f"2026-{month:02d}-23T09:00:00+00:00")

    def test_long_video_schedule_is_daily_at_06_moscow(self):
        from datetime import datetime, timezone
        from schedule_policy import long_video_is_due
        # 22:00 UTC on the preceding day is 01:00 on the Moscow due date.
        due_day = datetime(2026, 11, 23, 22, 0, tzinfo=timezone.utc)
        off_day = datetime(2026, 11, 24, 22, 0, tzinfo=timezone.utc)
        self.assertTrue(long_video_is_due(due_day))
        self.assertTrue(long_video_is_due(off_day))
        self.assertEqual(next_publish_slot(due_day, video_format="long").isoformat(), "2026-11-24T03:00:00+00:00")
        self.assertEqual(next_publish_slot(off_day, video_format="long").isoformat(), "2026-11-25T03:00:00+00:00")

    def test_schedule_moves_forward_when_slot_is_too_close(self):
        from datetime import datetime, timezone
        now = datetime(2026, 11, 24, 4, 30, tzinfo=timezone.utc)
        self.assertEqual(next_publish_slot(now).isoformat(), "2026-11-24T09:00:00+00:00")
        now = datetime(2026, 11, 24, 9, 0, tzinfo=timezone.utc)
        self.assertEqual(next_publish_slot(now).isoformat(), "2026-11-25T05:00:00+00:00")

    def test_manual_moscow_time_is_converted_and_does_not_change_schedule(self):
        from datetime import datetime, timezone
        from schedule_policy import manual_publish_time
        now = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)
        self.assertEqual(manual_publish_time("2026-11-22 18:30", now=now).isoformat(), "2026-11-22T15:30:00+00:00")
        self.assertEqual(next_publish_slot(now).isoformat(), "2026-11-23T05:00:00+00:00")

    def test_manual_time_rejects_past_near_invalid_and_timezone_suffix(self):
        from datetime import datetime, timezone
        from schedule_policy import manual_publish_time
        now = datetime(2026, 11, 22, 12, 0, tzinfo=timezone.utc)
        for value in ("2026-11-22 15:44", "2026-11-21 18:00", "2026-02-30 18:00", "2026-11-22T18:00", "2026-11-22 18:00+03:00"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                manual_publish_time(value, now=now)
        self.assertEqual(manual_publish_time("2026-11-22 15:45", now=now).isoformat(), "2026-11-22T12:45:00+00:00")

    def test_post_render_manual_slot_keeps_or_delays_once(self):
        from datetime import datetime, timezone
        from schedule_policy import resolve_manual_after_render
        now = datetime(2026, 11, 22, 12, 10, 10, tzinfo=timezone.utc)
        chosen = datetime(2026, 11, 22, 13, 0, tzinfo=timezone.utc)
        self.assertEqual(resolve_manual_after_render(chosen, now=now), (chosen, False))
        delayed, changed = resolve_manual_after_render(chosen, now=datetime(2026, 11, 22, 12, 30, 10, tzinfo=timezone.utc))
        self.assertTrue(changed)
        self.assertEqual(delayed.isoformat(), "2026-11-22T13:31:00+00:00")
        with self.assertRaises(ValueError):
            resolve_manual_after_render(datetime(2026, 11, 22, 13), now=now)

    def test_naive_datetime_is_rejected(self):
        from datetime import datetime
        with self.assertRaises(ValueError):
            next_publish_slot(datetime(2026, 11, 23, 12, 0))


if __name__ == "__main__":
    unittest.main()
