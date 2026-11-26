'use strict';
// Original finite story. Every decision advances one chapter; choices affect the ending.
const chapters = [
 ['Шторм отключил маяк. В тумане идёт паром. У тебя есть время взять только один предмет со склада.', ['Взять аккумулятор', 'Взять аптечку'], ['battery', 'medkit']],
 ['Дорога к башне затоплена. На причале качается лодка, а по скалам тянется лестница.', ['Плыть к башне', 'Идти по лестнице'], ['boat', 'stairs']],
 ['Смотритель пострадал. Он слышал два сигнала с парома, но не разглядел его курс.', ['Помочь смотрителю', 'Спросить про запасные детали'], ['help', 'parts']],
 ['У щита пахнет гарью. На двери табличка: в случае затопления сначала отключить нижний контур.', ['Отключить нижний контур', 'Включить общий рубильник'], ['isolate', 'surge']],
 ['На стене старая карта. Мелом отмечен риф к западу от башни. Радио ловит слабый голос.', ['Спросить курс парома', 'Записать координаты рифа'], ['course', 'chart']],
 ['В мастерской есть резервная батарея, но её можно отсоединить только после остановки вентилятора.', ['Остановить вентилятор', 'Оставить резерв на месте'], ['backup', 'leave']],
 ['Громкая связь ожила. С парома спрашивают, где можно переждать шторм.', ['Указать восточную бухту', 'Посоветовать ждать на месте'], ['harbor', 'hold']],
 ['Фонарь дрожит: если подключить питание сразу, сломанный привод может заклинить.', ['Зафиксировать привод', 'Дать фонарю вращаться'], ['secure', 'spin']],
 ['На частоте парома слышен детский голос. Он повторяет чужие команды, но капитан их не подтверждает.', ['Попросить капитана подтвердить курс', 'Ответить на услышанный сигнал'], ['confirm', 'answer']],
 ['Шторм приближается. Можно пустить запас энергии на прожектор или оставить радио включённым.', ['Включить прожектор', 'Сохранить радиосвязь'], ['light', 'radio']],
 ['Смотритель показывает ручную сигнальную лампу. Пришла пора дать парому последнее указание.', ['Подать сигнал отхода от рифа', 'Звать паром к маяку'], ['reef', 'tower']],
 ['Последняя передача. Корабль виден на фоне волн. Нужно решить, кому сообщить координаты.', ['Передать координаты спасателям', 'Продолжить разговор с паромом'], ['rescue', 'talk']],
];
let index = 0;
const picked = new Set();
const byId = id => document.getElementById(id);
function render() {
 const story = byId('story-text'), controls = byId('choices-container');
 controls.replaceChildren();
 byId('status').textContent = `Глава ${Math.min(index + 1, chapters.length)} из ${chapters.length}`;
 if (index === chapters.length) {
  const powered = picked.has('isolate') && (picked.has('battery') || picked.has('backup'));
  const guided = picked.has('reef') && (picked.has('harbor') || picked.has('confirm'));
  const alive = guided && ((powered && picked.has('secure')) || (picked.has('radio') && picked.has('rescue')));
  const end = document.createElement('p'); end.className = 'game-end'; end.dataset.outcome = alive ? 'victory' : 'death';
  end.textContent = alive ? 'Паром миновал риф. Спасатели подтвердили, что пассажиры в безопасности.' : 'Паром потерял сигнал. Спасатели начали поиски, но подтвердить его безопасность не удалось.';
  story.replaceChildren(end); return;
 }
 const [text, labels, flags] = chapters[index];
 story.textContent = text;
 labels.forEach((label, n) => {
  const button = document.createElement('button'); button.className = 'choice-button'; button.textContent = label;
  button.onclick = () => { picked.add(flags[n]); index++; render(); }; controls.append(button);
 });
}
render();
