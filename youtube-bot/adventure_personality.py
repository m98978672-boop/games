"""A curious play style and event-grounded editorial jokes for a private Short."""

SHORT_SECONDS = 180
CURIOUS_OBJECTIVE = (
    'Read the scene and enabled choices. Explore one interesting unfamiliar detail '
    'if it is safe; never repeat an unproductive choice. Then pursue the artifact. '
    'Choose a button based on what is visible, not just the shortest route.'
)
ACTIONS = {
    'Go North, toward the faint light.': 'Иду на север, к свету.',
    'Go East, toward the deeper shadows.': 'Посмотрю, что в восточном проходе.',
    'Check your pockets.': 'Сначала проверю карманы. Вдруг у меня есть что-то полезное?',
    'Take the Key.': 'Беру ключ.',
    'Try to sneak past the Troll (requires Key).': 'Попробую прокрасться мимо тролля. Главное — не храпеть громче него.',
    'Go Back (South).': 'Возвращаюсь к развилке.',
    'Take the Dagger.': 'На всякий случай беру кинжал.',
    'Go Back (West).': 'Возвращаюсь на запад.',
    'Continue...': 'Иду дальше.',
}


def short_comment(event, ordinal):
    before = ACTIONS.get(event.get('choice_label')) or f'Выбираю {ordinal} вариант.'
    if event.get('analyzing_stall'):
        before = 'Прошлый выбор не помог. ' + before
    # Joke only when the game's actual dialog confirms the setup.
    after = ('Карманный инвентарь: ворс. Как щедро.'
             if event.get('game_dialog') == 'You find nothing but lint and despair.' else '')
    return before, after
