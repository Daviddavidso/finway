/* ==========================================================================
   СХЕМА ПРОЕКТА «FINWAY» ДЛЯ ЯДРА ПАНЕЛИ (panel-core.js).

   Ядро одинаковое во всех витринах и про формат data.js ничего не знает.
   Здесь сказано только: какие у карточки поля и как разложить общий вид
   обратно в файл, который читает сайт: SITE / CATEGORIES / OFFERS.

   Порядок полей карточки = порядок полей в форме панели.
   ========================================================================== */

window.ADMIN = {
  brand: 'MONSPARK',
  dataFile: 'data.js',
  draftKey: 'finway_admin_draft',
  preview: 'index.html?draft=1',

  /* erid печатаем, только если он реально есть в ссылке: у коротких
     партнёрских ссылок его в адресе нет, и запрещать сохранение нельзя. */
  requireErid: false,

  /* Карточку без ссылки сайт показывает с плашкой «Скоро появится» —
     панель отмечает такие карточки в списке. */
  flagNoUrl: true,

  /* Блок «Логотип»: либо готовый файл, либо цветная плашка с инициалами.
     Цвет плашки сайт при необходимости затемняет сам. */
  logo: true,

  /* Карточка на сайте белая — от неё ядро считает контраст плашки. */
  surface: '#FFFFFF',
  defaultTone: { bg: '#16254A', ink: '#FFFFFF' },

  /* Готовые логотипы из img/logos. Своя картинка грузится кнопкой
     «Выбрать файл…» в карточке. */
  presets: [
    { label: 'Банки', items: [
      { name: 'Ак Барс Банк', value: 'img/logos/akbars.png' },
      { name: 'Банк Зенит', value: 'img/logos/zenit.png' },
      { name: 'ВТБ', value: 'img/logos/vtb.png' },
      { name: 'Кредит Европа Банк', value: 'img/logos/crediteurope.svg' },
      { name: 'Ozon Банк', value: 'img/logos/ozon.png' },
      { name: 'ОТП Банк', value: 'img/logos/otp.png' },
      { name: 'УБРиР', value: 'img/logos/ubrir.png' },
      { name: 'ФОРА-БАНК', value: 'img/logos/forabank.svg' }
    ] },
    { label: 'МФО и займы', items: [
      { name: 'А-Деньги', value: 'img/logos/adengi.png' },
      { name: 'Быстроденьги', value: 'img/logos/bistrodengi.png' },
      { name: 'Займер', value: 'img/logos/zaymer.png' },
      { name: 'Миг.Кредит', value: 'img/logos/migcredit.png' },
      { name: 'Рокетмэн', value: 'img/logos/rocketman.png' },
      { name: 'Свои Люди', value: 'img/logos/svoiludi.png' },
      { name: 'Срочно деньги', value: 'img/logos/srochnodengi.png' },
      { name: 'Турбозайм', value: 'img/logos/turbozaim.svg' },
      { name: 'Умные Наличные', value: 'img/logos/smartcash.svg' },
      { name: 'Max.Credit', value: 'img/logos/maxcredit.png' },
      { name: 'Money Man', value: 'img/logos/moneyman.png' },
      { name: 'OneClickMoney', value: 'img/logos/oneclickmoney.png' },
      { name: 'PLATIZA', value: 'img/logos/platiza.png' }
    ] }
  ],

  /* Только то, что сайт действительно показывает. */
  site: [
    { key: 'brand',   label: 'Название сайта', required: true,
      hint: 'Стоит в шапке, в подвале и в заголовке вкладки браузера.' },
    { key: 'slogan',  label: 'Подпись под названием',
      hint: 'Зелёная плашка в шапке: «Финансовый навигатор».' },
    { key: 'title',   label: 'Заголовок первого экрана', required: true,
      hint: 'Самая крупная надпись на сайте: «Финансовые решения. Без лишнего.»' },
    { key: 'lead',    label: 'Абзац под заголовком', type: 'textarea',
      hint: 'Одно-два предложения о том, что человек найдёт на сайте.' },
    { key: 'telegram', label: 'Telegram для связи',
      hint: 'Ник без @ или ссылка t.me/… Пусто — ссылки в подвале нет.' },
    { key: 'updated', label: 'Дата обновления условий',
      hint: 'Печатается в подвале: «Условия проверены 10.11.2026».' }
  ],

  groups: [
    { key: 'title', label: 'Название раздела', required: true,
      hint: 'Заголовок раздела, плитка на первом экране и пункт меню: «Дебетовые карты».' },
    { key: 'lead',  label: 'Подпись раздела', type: 'textarea',
      hint: 'Одно предложение — стоит на плитке и под заголовком раздела.' },
    { key: 'cta',   label: 'Кнопка в карточках', required: true,
      hint: 'Одна на все карточки раздела, ведёт на сайт банка или МФО: «Оформить карту», «Получить займ».' },
    { key: 'warn',  label: 'Предупреждение в карточках раздела', type: 'textarea',
      hint: 'Для займов и кредитов оно обязательно по закону «О рекламе» (ст. 28). Печатается в каждой карточке раздела. Для дебетовых карт оставьте пустым.' }
  ],

  card: [
    { key: 'partner',  label: 'Банк или МФО', required: true,
      hint: 'Крупная надпись рядом с логотипом: «ВТБ», «MoneyMan».' },
    { key: 'title',    label: 'Название продукта', required: true,
      hint: 'Строка под названием компании: «Кредитная карта «120 дней»». Если совпадает с названием компании — на сайте не повторяется.' },
    { key: 'tag',      label: 'Тип продукта',
      hint: 'Маленькая плашка: «дебетовая карта», «займ онлайн».' },
    { key: 'headline', label: 'Крупная строка выгоды', required: true,
      hint: 'Главное преимущество: «120 дней без процентов», «Кэшбэк рублями». Цифры ставьте только те, что подтверждены партнёркой.' },
    { key: 'note',     label: 'Подпись под крупной строкой',
      hint: 'Например «категории выбираете сами».' },
    { key: 'specs',    label: 'Условия', type: 'pairs',
      hint: 'По строке на условие, через двоеточие: «Выпуск: бесплатно». Сайт показывает первые три.' },
    { key: 'warn',     label: 'Предупреждение (для кредитных продуктов)', type: 'lines',
      hint: 'У кредитных карт обязательно по закону «О рекламе»: «Оценивайте свои финансовые возможности и риски.» и «Изучите все условия кредита (займа) на сайте кредитора.» — по строке на фразу. У дебетовых карт оставьте пустым. В разделах «Кредитные карты» и «Микрозаймы» оно уже задано на весь раздел.' },
    { key: 'url',      label: 'Партнёрская ссылка', type: 'url',
      hint: 'Вставьте ссылку из партнёрки целиком, вместе с erid и метками. Пока пусто — на карточке вместо кнопки плашка «Скоро появится», и карточка стоит в конце раздела.' }
  ],

  /* ---------------------------------------------- чтение --------------- */

  load: function () {
    var groups = CATEGORIES.map(function (c) {
      return { key: c.id, title: c.label, lead: c.lead || '', go: c.go || '', cta: c.cta || '',
               warn: Array.isArray(c.warn) ? c.warn.join('\n') : (c.warn || '') };
    });

    var seen = {};
    var cards = OFFERS.map(function (o, i) {
      /* Устойчивый ключ: в файле его нет, а ядру он нужен, чтобы не путать
         карточки при перестановке. Считаем от компании и продукта. */
      var base = ((o.partner || '') + '-' + (o.title || '')).toLowerCase()
        .replace(/[^a-zа-я0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || ('c' + i);
      var uid = base, n = 2;
      while (seen[uid]) uid = base + '-' + (n++);
      seen[uid] = true;

      return {
        uid: uid,
        group: o.cat,
        hidden: !!o.hidden,
        partner: o.partner || '',
        title: o.title || '',
        tag: o.tag || '',
        headline: o.headline || '',
        note: o.note || '',
        specs: (o.specs || []).map(function (p) { return [p[0], p[1]]; }),
        warn: Array.isArray(o.warn) ? o.warn.slice() : (o.warn ? String(o.warn).split('\n') : []),
        url: o.url || '',
        logo: o.logo || '',
        /* Цвета плашки читаем всегда: даже у карточки с логотипом они
           переживают круговорот, иначе следующее сохранение затрёт выбор. */
        tone: { bg: (o.tone && o.tone.bg) || '#16254A', ink: (o.tone && o.tone.ink) || '#FFFFFF' }
      };
    });

    return {
      SITE: JSON.parse(JSON.stringify(SITE)),
      GROUPS: groups,
      CARDS: cards
    };
  },

  /* ---------------------------------------------- сборка файла --------- */

  build: function (m) {
    function js(v) { return JSON.stringify(v, null, 2); }
    function t(v) { return String(v == null ? '' : v).trim(); }

    var categories = m.GROUPS.map(function (g) {
      return { id: g.key, label: t(g.title), lead: t(g.lead), go: t(g.go) || 'Смотреть',
               cta: t(g.cta) || 'Оформить', warn: t(g.warn) };
    });

    var offers = m.CARDS.map(function (c) {
      var o = {
        cat: c.group,
        partner: t(c.partner),
        tag: t(c.tag),
        title: t(c.title),
        logo: t(c.logo),
        tone: { bg: t(c.tone && c.tone.bg) || '#16254A', ink: t(c.tone && c.tone.ink) || '#FFFFFF' },
        headline: t(c.headline),
        note: t(c.note),
        specs: (c.specs || []).map(function (p) { return [t(p[0]), t(p[1])]; })
          .filter(function (p) { return p[0] || p[1]; }),
        warn: (c.warn || []).map(t).filter(Boolean),
        url: t(c.url)
      };
      if (c.hidden) o.hidden = true;
      return o;
    });

    return [
      '/* ═════════════════════════════════════════════════════════════════════════',
      '   КАТАЛОГ «' + (t(m.SITE.brand) || 'MONSPARK').toUpperCase() + '» — единственный файл с предложениями.',
      '   Собран панелью ' + new Date().toLocaleString('ru-RU') + '.',
      '',
      '   Правится через panel.html. Руками тоже можно, но при следующем',
      '   сохранении из панели правки будут перезаписаны.',
      '',
      '   cat      — раздел: debit | credit | loans (или новый, заведённый в панели).',
      '   url      — партнёрская ссылка. Пусто — на карточке плашка «Скоро появится».',
      '   logo     — файл логотипа. Пусто — плашка с инициалами цвета tone.bg.',
      '   headline — крупная строка выгоды, note — подпись под ней.',
      '   specs    — пары «условие: значение».',
      '   warn     — предупреждение в карточке (ч. 2.1 и 3.1 ст. 28 закона',
      '              «О рекламе»): обязательно у кредитных карт и займов.',
      '              У раздела warn печатается во всех его карточках.',
      '',
      '   ВАЖНО ПРО ЦИФРЫ: ставки, лимиты, кэшбэк и сроки ставьте только те,',
      '   что подтверждены вашей партнёркой. Цифра «на глаз» — недостоверная',
      '   реклама: партнёрка может снять оффер, а ФАС — оштрафовать.',
      '   ═════════════════════════════════════════════════════════════════════════ */',
      '',
      'const SITE = ' + js(m.SITE) + ';',
      '',
      '/* label — заголовок раздела и плитки; lead — подпись; go — кнопка на плитке;',
      '   cta — кнопка в карточках; warn — предупреждение во всех карточках раздела. */',
      'const CATEGORIES = ' + js(categories) + ';',
      '',
      'const OFFERS = ' + js(offers) + ';',
      ''
    ].join('\n');
  }
};
