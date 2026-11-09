# Проверяющий всей игры — результат полного запуска

Исторический снимок: после изменений запускать проверяющий снова. Неподтверждённый пункт не обязательно является дефектом; исторические заметки не являются новым испытанием. Браузерный FPS измерен в headless-программной среде, не на GPU пользователя. Описание методики — `GAME_AUDITOR.md`.

```text
ВСЯ ИГРА: NOT_ACCEPTED
Режим: full. Алгоритмы: 0/40 подтверждены. PNG проверено: 149, проблем: 0.
Блок 1: NOT_ACCEPTED. Всего блокирующих замечаний и непроверенных пунктов: 65.
Неподтверждённое — не обязательно дефект; исторические выводы не заменяют актуальные тесты.

[500] ALG-01: полная приёмка не подтверждена — ALG-01
Флаг alg_supply: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_supply","flagState":"missing","test":"missing","historicalNotes":"`src/sim/logistics.js`: заявки, грузовики, запас; нет заказов по ящикам A→B, резервов, календарных прибытий и обеих новых подсистемных кнопок-флагов.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","requests_and_cancel","delivery_and_return","scheduled_arrivals","crew_and_limit","cargo_accounting"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[501] ALG-02: полная приёмка не подтверждена — ALG-02
Флаг alg_ballistics: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_ballistics","flagState":"missing","test":"missing","historicalNotes":"`src/sim/units.js`, `walls.js`: hitscan и шансы пробития; нет физики рикошетов, классификации кинетических/AP снарядов и отдельного RNG.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","ricochet_and_penetration","explosions","separate_rng","symmetry"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[502] ALG-03: полная приёмка не подтверждена — ALG-03
Флаг alg_construction: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_construction","flagState":"missing","test":"missing","historicalNotes":"`src/sim/build.js`: проверка места, чертежи, работа инженеров, ремонт зданий; нет полного жизненного цикла задач, доставки ящиков, ремонта техники и гарантии незапирания техники.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","placement_and_path","construction_lifecycle","materials_delivery","repair_and_cancel","no_forgotten_tasks"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[503] ALG-04: полная приёмка не подтверждена — ALG-04
Флаг pathing_v2: enabled; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"pathing_v2","flagState":"enabled","test":"missing","historicalNotes":"`src/sim/nav.js`, `units.js`, `walls.js`: flow field, обход, проёмы; общий слой, нет отдельного A*/техники и полной очереди запросов; нагрузочные остановки, см. замеры.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","u_trap_and_corners","doorways_and_columns","vehicles_and_infantry","local_rebuild","path_budget"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[504] ALG-05: полная приёмка не подтверждена — ALG-05
Флаг alg_vision: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_vision","flagState":"missing","test":"missing","historicalNotes":"`units.js` perception, `world.js` LOS, `renderer.js` туман; полная модель передачи контактов/памяти и проверка отсутствия всеведения не подтверждены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","fog_and_los","memory_and_radio","hidden_enemy_information"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[505] ALG-06: полная приёмка не подтверждена — ALG-06
Флаг firing_points_v2: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"firing_points_v2","flagState":"missing","test":"missing","historicalNotes":"`world.bestCover`, `walls.coverSpotsNear`, ИИ бойца; нет требуемого полного фильтра доступности/линии огня/своих, бронирования и гистерезиса точек.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","reachable_points","line_of_fire_and_allies","reservation_and_hysteresis"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[506] ALG-07: полная приёмка не подтверждена — ALG-07
Флаг alg_morale: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_morale","flagState":"missing","test":"missing","historicalNotes":"`ai_soldier.js`, `data/ai_weights.json`: мораль, паника, командир и укрытие; все эффекты карточки и отдельный флаг не подтверждены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","morale_thresholds","recovery_and_effects"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[507] ALG-08: полная приёмка не подтверждена — ALG-08
Флаг alg_capture: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_capture","flagState":"missing","test":"missing","historicalNotes":"`src/sim/influence.js`: прогресс, смена владельца и гистерезис; полный контракт и отдельный флаг требуют проверки.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","contested_capture","hysteresis_and_ownership"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[508] ALG-09: полная приёмка не подтверждена — ALG-09
Флаг alg_assault: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_assault","flagState":"missing","test":"missing","historicalNotes":"`ai_squad.js`, `ai_soldier.js`, флаг `assault_forts`: штурм укреплений; нет проверенной зачистки комнат и входа парами.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","breach_assault","room_clearance","pair_entry_and_retreat"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[509] ALG-10: полная приёмка не подтверждена — ALG-10
Флаг alg_defense: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_defense","flagState":"missing","test":"missing","historicalNotes":"`ai_strategic.js`, профили обороны и отступление; покрытие секторов огня, резерв и контратака не подтверждены полностью.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","fire_sectors","reserve_and_counterattack","supply_requests"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[510] ALG-11: полная приёмка не подтверждена — ALG-11
Флаг alg_influence: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_influence","flagState":"missing","test":"missing","historicalNotes":"`influence.js`: мощь секторов, влияние и фронт; нет полного набора карт расстояний/угроз по карточке и подтверждения бюджета.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","frontline_and_influence","distance_and_threat_maps","budget"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[511] ALG-12: полная приёмка не подтверждена — ALG-12
Флаг alg_strategy: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_strategy","flagState":"missing","test":"missing","historicalNotes":"`ai_strategic.js`, `ai_squad.js`, `data/strategies.json`: директивы и стадии; нет проверенной GOAP-цепочки, 20 прогонов и нужных пределов баланса.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","strategy_chains","resource_shortage","twenty_wars_balance"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[512] ALG-13: полная приёмка не подтверждена — ALG-13
Флаг alg_squads: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_squads","flagState":"missing","test":"missing","historicalNotes":"`squads.js`: отряды, формации, замена командира; перестроение в колонну у двери и автоматическое слияние не подтверждены. Обычный командир отряда — не главнокомандующий войны.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","leader_replacement","formation_and_door_column","squad_merge"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[513] ALG-14: полная приёмка не подтверждена — ALG-14
Флаг alg_medical: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_medical","flagState":"missing","test":"missing","historicalNotes":"`ai_soldier.js`, `units.js`: медик, лечение и поднятие раненых; триаж, эвакуация и полный расход локальных медикаментов не подтверждены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","triage_and_treatment","evacuation","medical_resources"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[514] ALG-15: полная приёмка не подтверждена — ALG-15
Флаг alg_economy: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_economy","flagState":"missing","test":"missing","historicalNotes":"`logistics.js`: общий запас фракции и производство; нет распределённых складских ящиков, журнала транзакций и сверки баланса.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","resource_transactions","distributed_stock","zero_accounting_difference"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[515] ALG-16: полная приёмка не подтверждена — ALG-16
Флаг alg_respawn: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_respawn","flagState":"missing","test":"missing","historicalNotes":"`game.js`: смерть/возрождение игрока и пополнение; нет требуемых очередей и общей системы прибытий/лимита.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","respawn_and_base_loss","queue_and_arrival_limit"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[516] ALG-17: полная приёмка не подтверждена — ALG-17
Флаг alg_damage: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_damage","flagState":"missing","test":"missing","historicalNotes":"`units.js`, `world.js`, `walls.js`: HP, частичные эффекты техники и разрушение стен; нет единой таблицы и зонирования грузовика/полных правил руин.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","damage_zones","building_and_wall_damage","repair_and_ruins"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[517] ALG-18: полная приёмка не подтверждена — ALG-18
Флаг alg_scheduler: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_scheduler","flagState":"missing","test":"missing","historicalNotes":"`game.thinkInterval`, LOD и пространственный хэш `src/core/spatial.js`; бюджета задач по кадрам и реального браузерного 1% low нет.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","task_budget","lod_accuracy","browser_fps_400_500"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[518] ALG-19: полная приёмка не подтверждена — ALG-19
Флаг alg_deadlock: disabled; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_deadlock","flagState":"disabled","test":"missing","historicalNotes":"`units.js`: таймер и локальный обход; дополнительный флаг считает/показывает сбросы цели и ведёт ограниченный журнал. Общего арбитража доков, встречных колонн и очередей нет.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","opposing_infantry","opposing_vehicles_and_columns","dock_arbitration","no_teleport"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[519] ALG-20: полная приёмка не подтверждена — ALG-20
Флаг alg_audio_alerts: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_audio_alerts","flagState":"missing","test":"missing","historicalNotes":"`src/core/audio.js`, `game.js`, `logistics.js`: синтез, звуки, журнал предупреждений, приглушение стен; новые события колонн и дедупликация всех типов отсутствуют/не подтверждены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","sound_events","deduplication","wall_muffling","arrival_and_loss_alerts"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[520] ALG-21: полная приёмка не подтверждена — ALG-21
Флаг alg_save: disabled; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_save","flagState":"disabled","test":"missing","historicalNotes":"`src/core/save.js`: localStorage, версия 1, точки, войска, стены; под флагом сохраняются ID, указатель игрока и состояние общего RNG. Задачи/рейсы/календарь и полное состояние игры ещё не сохраняются, полная детерминированность не подтверждена.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","old_save_migration","full_state_and_references","continuation_replay","separate_rng"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[521] ALG-22: полная приёмка не подтверждена — ALG-22
Флаг alg_sim: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_sim","flagState":"missing","test":"missing","historicalNotes":"`tools/ai-war.mjs`, `tests/symmetry.mjs`, `tests/duel.mjs`: headless-прогоны; нет приёмочного отчёта 20 войн с бухгалтерией/прибытиями и 40–60%.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","input_replay","twenty_wars","symmetry_and_balance","accounting","soak"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[522] ALG-23: полная приёмка не подтверждена — ALG-23
Флаг alg_vehicles: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_vehicles","flagState":"missing","test":"missing","historicalNotes":"`units.js`, `logistics.js`, `data/units.json`: танк и грузовик с общим HP; нет посадки/слотов, отдельных зон, пассажиров, ремонтируемых остовов.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","boarding_and_driver","cab_and_cargo","body_destruction","repairable_wreck","save_zones"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[523] ALG-24: полная приёмка не подтверждена — ALG-24
Флаг alg_production_chain: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_production_chain","flagState":"missing","test":"missing","historicalNotes":"`logistics.stepProduction`, `data/resources.json`: выпуск четырёх ресурсов; нет цепочки сырьё → рецепты → буферы → ящики.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","recipes_and_buffers","production_bottleneck","factory_repair"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[524] ALG-25: полная приёмка не подтверждена — ALG-25
Флаг alg_storage: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_storage","flagState":"missing","test":"missing","historicalNotes":"`logistics.stock` — общий запас; нет складских слотов, ящиков и атомарных резервов.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","storage_slots","atomic_reservations","expiry_and_overflow","resource_conservation"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[525] ALG-26: полная приёмка не подтверждена — ALG-26
Флаг alg_maintenance: missing; приёмочный тест: missing. Прежний аудит: нет.
Факт: {"flag":"alg_maintenance","flagState":"missing","test":"missing","historicalNotes":"Износ по времени/использованию и задания обслуживания не обнаружены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","wear_by_usage_and_time","maintenance_tasks"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[526] ALG-27: полная приёмка не подтверждена — ALG-27
Флаг alg_artillery: missing; приёмочный тест: missing. Прежний аудит: нет.
Факт: {"flag":"alg_artillery","flagState":"missing","test":"missing","historicalNotes":"Артиллерийской батареи и корректировщика не обнаружено; танковое орудие — не ALG-27.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","artillery_spotting","ammunition_and_friendly_fire","counterbattery"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[527] ALG-28: полная приёмка не подтверждена — ALG-28
Флаг alg_tiers: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_tiers","flagState":"missing","test":"missing","historicalNotes":"`game.techLevel`, уровни, зависящие от точек; нет описанной стройкой системы тиров отдельных баз.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","base_tier_up_down","construction_restrictions"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[528] ALG-29: полная приёмка не подтверждена — ALG-29
Флаг alg_roads: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_roads","flagState":"missing","test":"missing","historicalNotes":"`world.js`: генерируются дорожные тайлы; подходящего взвешенного графа маршрутов и движения колонной нет.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","road_graph","alternate_routes","convoy_and_closed_edge"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[529] ALG-30: полная приёмка не подтверждена — ALG-30
Флаг alg_supply_lines: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_supply_lines","flagState":"missing","test":"missing","historicalNotes":"`logistics.stepSupply` вычисляет снабжение по близости; связности дорог и трёх статусов нет.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","supply_connectivity","cut_and_restore","three_supply_states"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[530] ALG-31: полная приёмка не подтверждена — ALG-31
Флаг alg_fortify: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_fortify","flagState":"missing","test":"missing","historicalNotes":"`build.js`, `data/build_profiles.json`: профили, автоплан и оборонные постройки; валидации всех дорог/колонн/мин по ТЗ нет.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","fortification_profiles","road_and_vehicle_clearance","mines_and_corridors"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[531] ALG-32: полная приёмка не подтверждена — ALG-32
Флаг alg_cover: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_cover","flagState":"missing","test":"missing","historicalNotes":"`world.bestCover`, `walls.coverAt`, кэш и три луча; нет полной 8-направленной модели стойки/остовов/дыр.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","directional_cover","stance_and_wreck","breach_invalidation"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[532] ALG-33: полная приёмка не подтверждена — ALG-33
Флаг alg_suppression: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_suppression","flagState":"missing","test":"missing","historicalNotes":"`units.js`, `ai_soldier.js`: показатель подавления, спад, мораль; весь набор воздействий и симметрия требуют отдельных тестов.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","suppression_accumulation_and_decay","movement_and_morale_effects"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[533] ALG-34: полная приёмка не подтверждена — ALG-34
Флаг alg_roles: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_roles","flagState":"missing","test":"missing","historicalNotes":"`data/units.json`, `squad_templates.json`, `autopilot.js`: роли и выбор шаблона; динамического распределения по заявкам с гистерезисом нет.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","role_demand","role_reassignment_hysteresis"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[534] ALG-35: полная приёмка не подтверждена — ALG-35
Флаг alg_orders: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_orders","flagState":"missing","test":"missing","historicalNotes":"`command_api.js`, `autopilot.js`: источники приказов, задержка и отмена; приоритет всех конфликтов и DANGER не проверены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","order_priority","manual_override_and_danger","cancellation_and_delivery"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[535] ALG-36: полная приёмка не подтверждена — ALG-36
Флаг alg_victory: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_victory","flagState":"missing","test":"missing","historicalNotes":"`game.checkVictory`: захват штаба, города, sudden death и капитуляция без армии; разрушение штаба и отдельный главнокомандующий не реализованы, города/таймер противоречат принятому решению.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","hq_capture_and_destruction","commander_death","surrender","ordinary_death_not_victory","no_city_or_timer_victory"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[536] ALG-37: полная приёмка не подтверждена — ALG-37
Флаг alg_salvage: missing; приёмочный тест: missing. Прежний аудит: нет.
Факт: {"flag":"alg_salvage","flagState":"missing","test":"missing","historicalNotes":"Отдельной разборки остовов/руин с бухгалтерией не обнаружено.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","salvage_wreck","keep_as_cover","resource_accounting"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[537] ALG-38: полная приёмка не подтверждена — ALG-38
Флаг alg_ui_data: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_ui_data","flagState":"missing","test":"missing","historicalNotes":"`src/ui/hud.js`, `renderer.js`: основные панели и данные; нет общей событийной модели запросов, графика прибытий и доказанного бюджета.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","ui_state_and_refusal_reasons","supply_and_arrivals","ui_budget"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[538] ALG-39: полная приёмка не подтверждена — ALG-39
Флаг alg_walls: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"alg_walls","flagState":"missing","test":"missing","historicalNotes":"`src/sim/walls.js`, `data/outlines`, три существующих флага: сегменты/двери/LOS/урон; нет мастер-флага, полных стадий руин, ремонта сегмента инженером и требуемой локальной инкрементальной навигации; полные rebuild внутри пакета объединены.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","wall_materials_and_openings","breach_and_ruins","repair_and_save","local_navigation"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[539] ALG-40: полная приёмка не подтверждена — ALG-40
Флаг world_textures_v2: missing; приёмочный тест: missing. Прежний аудит: частично.
Факт: {"flag":"world_textures_v2","flagState":"missing","test":"missing","historicalNotes":"`assets/*.png`, `tools/gen-assets.mjs`, `renderer.js`: PNG земли и объектов; стены рисуются линиями, нужны полы/стыки/стадии/машины и лицензированный манифест.","source":"ALGORITHMS_SPEC.md (исторический аудит)"}
Требование: {"flag":"enabled","cases":["flag_off_legacy","faction_symmetry","raster_provenance","eight_prerendered_directions","wall_floor_stages","screenshot_regression"]}
Действие: Реализовать недостающее, проверить все требования и повторить приёмочный сценарий; старый аудит сам по себе не является тестом.

[592] Артовые заглушки — assets
В реестре игровые изображения помечены как PLACEHOLDER_REPLACE.
Факт: docs/ASSETS_CREDITS.md
Действие: Подготовить и проверить итоговые PNG с документированными правами.

[593] Стены рисуются линиями — assets
В игровой функции drawWalls обнаружена отрисовка линиями Canvas, а не только растровыми PNG.
Факт: src/render/renderer.js: drawWalls
Действие: Реализовать и проверить согласованные растровые стены, не меняя legacy при выключенном флаге.

[594] Не подтверждены восемь направлений моделей — assets
Текущий выбор направления основан на четырёх углах; согласованные четыре дополнительные предрисованные диагонали не подтверждены.
Факт: src/render/renderer.js: unitDir
Действие: Добавить согласованные PNG-направления под отдельным флагом и проверить обе фракции.

[597] Регрессия скриншотов не подтверждена — assets
Не подтверждено браузерное сравнение снимков с порогом 0,5% для обеих фракций.
Факт: {"status":"missing","path":"tests/acceptance/visual-regression.mjs"}
Действие: Провести реальное сравнение снимков с документированной средой.

[598] Права отдельных изображений не подтверждены — assets
Структурная проверка PNG не устанавливает происхождение и конкретную лицензию каждого ассета.
Факт: {"status":"missing","path":"tests/acceptance/asset-provenance.mjs"}
Действие: Подтвердить происхождение каждого нового ресурса и, для внешних, конкретную допустимую лицензию.

[580] Не подтверждены все интеграционные сценарии — S1-S10
Для всей игры нужны проверенные S1–S10, а не только блок 1.
Факт: {"status":"missing","path":"tests/acceptance/game-scenarios.mjs"}
Требование: все S1–S10 с проверяемыми утверждениями
Действие: Реализовать и выполнить интеграционные испытания.

[101] U-ловушка не пройдена — u_trap
U-ловушка: пройдено 8 из 18.
Факт: {"passed":8,"total":18,"failedByRole":{"truck":6,"tank":4}}
Требование: 18 из 18
Действие: Исправить маршрут и повторить все типы юнитов, стороны и seed без телепорта и регрессий.

[201] Нет интеграционных испытаний — integration
Сценарии S1, S8, S9 и S10: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-integration.mjs
Требование: существующий, выполненный сценарий
Действие: Реализовать и запустить S1, S8, S9 и S10 с проверяемыми результатами.

[202] Нет испытаний карточек — cards
Все проверки карточек ALG-04/18/19/21/22: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-cards.mjs
Требование: существующий, выполненный сценарий
Действие: Реализовать и запустить проверки карточек ALG-04/18/19/21/22.

[110] Проход или колонна не завершены — doors
column: успешно 0 из 200; все достигли цели в 89 попытках.
Факт: {"passed":0,"attempts":200,"reached":89,"factions":[{"id":0,"attempts":100,"passed":0,"reached":89},{"id":1,"attempts":100,"passed":0,"reached":0}],"failureSamples":[{"ok":false,"seed":1,"faction":0,"arrived":10,"crossed":10,"failed":0,"count":10,"teleports":0,"speedViolations":0,"wallCollisions":0,"maxStepRatio":1.201,"overlapFrames":66,"maxOverlap":16.834,"seconds":4.45},{"ok":false,"seed":2,"faction":0,"arrived":10,"crossed":10,"failed":0,"count":10,"teleports":0,"speedViolations":0,"wallCollisions":0,"maxStepRatio":1.442,"overlapFrames":70,"maxOverlap":16.453,"seconds":4.65}]}
Требование: все попытки обеих фракций
Действие: Проверить неудачные seed и фракции, устранить остановки и повторить все попытки.

[111] Наложения юнитов в проходе — doors
column: кадров с наложением — 27378.
Факт: {"overlapFrames":27378,"maxOverlap":17.942}
Требование: 0
Действие: Исправить очередность и разделение движения без телепорта и блокировки прохода.

[112] Превышен контрольный шаг движения — doors
column: превышений контрольного шага — 12.
Факт: 12
Требование: 0
Действие: Исследовать сочетание steering и выталкивания; само превышение ещё не доказывает телепорт.

[203] Нет приёмочного испытания навигации — navigation
Нагрузка и снижение застреваний не менее чем на 70%: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-navigation.mjs
Требование: существующий, выполненный сценарий
Действие: Проверить три seed и нагрузки 100/300/400 с измерением снижения застреваний.

[422] Неполное покрытие встречных пробок — deadlocks
Стенд встречных пробок пока охватывает не все обязательные типы.
Факт: {"missing":["vehicle-opposing","column-opposing","dock-opposing"],"coverageComplete":false}
Требование: ["foot-door-opposing","vehicle-opposing","column-opposing","dock-opposing"]
Действие: Добавить проверяемые испытания техники, колонн и доков, не подменяя их одиночной парой.

[420] Наложения при встречном движении — deadlocks
Встречная пара: кадров с наложением — 1200.
Факт: {"overlapFrames":1200,"maxOverlap":17.971,"failureSamples":[{"seed":1,"faction":0,"ok":false,"arrived":2,"crossed":2,"pathFailed":0,"teleports":0,"speedViolations":1,"wallCollisions":0,"overlapFrames":6,"maxOverlap":17.971,"seconds":1.6},{"seed":2,"faction":0,"ok":false,"arrived":2,"crossed":2,"pathFailed":0,"teleports":0,"speedViolations":1,"wallCollisions":0,"overlapFrames":6,"maxOverlap":17.971,"seconds":1.6}]}
Требование: 0
Действие: Обеспечить безопасный разъезд через дверь без наложения и телепорта; проверить обе фракции.

[112] Превышен контрольный шаг движения — deadlocks
Встречная пара: превышений контрольного шага — 160.
Факт: 160
Требование: 0
Действие: Исследовать сочетание steering и выталкивания; само превышение ещё не доказывает телепорт.

[205] Нет приёмочного испытания бюджета навигации — nav_budget
Локальный перестрой и бюджет навигации: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-nav-budget.mjs
Требование: существующий, выполненный сценарий
Действие: Проверить локальность, фактический бюджет и совместимость режима off.

[206] Нет испытания сохранения и продолжения — save_replay
Старый сейв и воспроизведение полного состояния: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-save-replay.mjs
Требование: существующий, выполненный сценарий
Действие: Сравнить полное состояние, старый сейв и детерминированное продолжение.

[207] Нет испытания ввода и RNG — input_replay
Запись и воспроизведение ввода и отдельных RNG: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-input-replay.mjs
Требование: существующий, выполненный сценарий
Действие: Проверить запись и повтор ввода и восстановление отдельных потоков RNG.

[301] Нагрузка браузерной сцены не соответствует цели — browser_fps
400: популяция во время замера отличается от целевой.
Факт: {"initial":400,"minAlive":402,"maxAlive":422}
Требование: 400
Действие: Обеспечить целевое число живых юнитов на протяжении измерения, не скрывая спавны или потери.

[301] Нагрузка браузерной сцены не соответствует цели — browser_fps
500: популяция во время замера отличается от целевой.
Факт: {"initial":500,"minAlive":502,"maxAlive":522}
Требование: 500
Действие: Обеспечить целевое число живых юнитов на протяжении измерения, не скрывая спавны или потери.

[302] Средний FPS при 400 ниже порога — browser_fps
average400: 17.64 FPS, требуется не менее 60.
Факт: {"fps":17.642993617626733,"browser":"Chromium 153.0.8010.0","mode":"headless software rendering"}
Требование: 60
Действие: Исследовать полный браузерный кадр и повторить замер на корректной нагрузке.

[303] 1% low при 400 ниже порога — browser_fps
low1_400: 1.49 FPS, требуется не менее 45.
Факт: {"fps":1.4876524843796486,"browser":"Chromium 153.0.8010.0","mode":"headless software rendering"}
Требование: 45
Действие: Исследовать длинные реальные интервалы кадров и повторить замер на корректной нагрузке.

[304] Средний FPS при 500 ниже порога — browser_fps
average500: 17.18 FPS, требуется не менее 45.
Факт: {"fps":17.178353646125917,"browser":"Chromium 153.0.8010.0","mode":"headless software rendering"}
Требование: 45
Действие: Исследовать полный браузерный кадр и повторить замер на корректной нагрузке.

[209] Нет 30-минутного испытания — soak
30 реальных минут и контроль утечек/застреваний: проверочный сценарий отсутствует.
Факт: tests/acceptance/block1-soak.mjs
Требование: существующий, выполненный сценарий
Действие: Выполнить реальный soak с контролем памяти, объектов и зависших задач.
```
