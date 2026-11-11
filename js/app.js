/* ═══════════════════════════════════════════════════════════════════════
   ВИТРИНА «FINWAY» — тексты из панели, плитки и разделы каталога, меню.
   Движок — от Finvoria, вёрстка своя (тёмная, по референсу клиента).

   Каталог объявлен глобальными const в data.js (или data.php на хостинге
   с PHP). const мимо window не переприсвоить, поэтому работаем с копиями:
   на адресе index.html?draft=1 вместо боевого файла подставляется черновик
   из панели управления.

   Разделы debit / credit / loans стоят в index.html сразу (якоря меню живы и
   без скрипта) — сюда только доливаются карточки. Раздел, заведённый в
   панели, скрипт достраивает сам.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var site   = typeof SITE       !== 'undefined' ? SITE       : {};
  var cats   = typeof CATEGORIES !== 'undefined' ? CATEGORIES : [];
  var offers = typeof OFFERS     !== 'undefined' ? OFFERS     : [];

  if (/[?&]draft/.test(location.search)) {
    try {
      var draftFile = localStorage.getItem('finway_admin_draft:file');
      if (draftFile) {
        var d = new Function(draftFile + '\n;return { SITE: SITE, CATEGORIES: CATEGORIES, OFFERS: OFFERS };')();
        site = d.SITE || site; cats = d.CATEGORIES || cats; offers = d.OFFERS || offers;
      }
    } catch (e) { /* битый черновик — показываем боевой каталог */ }
  }

  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── мелкие помощники ─────────────────────────────────────────────── */

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function $all(sel, box) { return Array.prototype.slice.call((box || document).querySelectorAll(sel)); }
  function txt(v) { return String(v == null ? '' : v).trim(); }

  function initials(name) {
    return String(name || '?').trim().split(/[\s,.-]+/).filter(Boolean).slice(0, 2)
      .map(function (w) { return w.charAt(0); }).join('').toUpperCase();
  }
  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
  }
  function offersWord(n) { return plural(n, 'предложение', 'предложения', 'предложений'); }

  /* Ссылка считается настоящей, только если это http(s) с доменом через
     точку: «https://» из пустого поля панели кнопкой не становится. */
  function okLink(u) { return /^https?:\/\/[^\/\s?#]+\.[^\/\s?#]{2,}/i.test(txt(u)); }

  /* Маркировка: erid печатаем, только если он похож на номер. */
  function eridOf(u) {
    var m = String(u || '').match(/[?&]erid=([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : '';
  }

  /* Плашка с инициалами: своя пара «фон — буквы» из панели остаётся, если
     читается (4.5:1); иначе — белые буквы на фоне, затемнённом до нормы. */
  function lum(hex) {
    var h = String(hex || '').replace('#', '');
    if (h.length === 3) h = h.replace(/./g, '$&$&');
    if (!/^[0-9a-f]{6}$/i.test(h)) return null;
    return [0, 2, 4].map(function (i) {
      var c = parseInt(h.substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    }).reduce(function (s, c, i) { return s + c * [0.2126, 0.7152, 0.0722][i]; }, 0);
  }
  function contrast(a, b) {
    var la = lum(a), lb = lum(b);
    if (la == null || lb == null) return 0;
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }
  function safeTone(bg) {
    var h = String(bg || '').replace('#', '');
    if (lum(h) == null) return '#16254A';
    var rgb = [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
    for (var k = 0; k < 20; k++) {
      var hex = '#' + rgb.map(function (c) { return ('0' + Math.round(c).toString(16)).slice(-2); }).join('');
      if (1.05 / (lum(hex) + 0.05) >= 4.5) return hex;
      rgb = rgb.map(function (c) { return c * 0.88; });
    }
    return '#16254A';
  }
  function tilePaint(tone) {
    if (tone && contrast(tone.bg, tone.ink) >= 4.5) return { bg: tone.bg, ink: tone.ink };
    return { bg: safeTone(tone && tone.bg), ink: '#FFFFFF' };
  }
  function lines(v) {
    if (Array.isArray(v)) return v.map(txt).filter(Boolean);
    return String(v || '').split('\n').map(txt).filter(Boolean);
  }

  /* ── данные ───────────────────────────────────────────────────────── */

  var catById = {};
  cats.forEach(function (c) { catById[c.id] = c; });

  var live = offers.filter(function (o) { return !o.hidden; }).map(function (o, i) {
    return {
      i: i,
      cat: o.cat,
      partner: txt(o.partner),
      tag: txt(o.tag),
      title: txt(o.title),
      headline: txt(o.headline),
      note: txt(o.note),
      specs: (o.specs || []).filter(function (p) { return p && (p[0] || p[1]); }).slice(0, 3),
      warn: lines((catById[o.cat] || {}).warn).concat(lines(o.warn)),
      url: okLink(o.url) ? txt(o.url) : '',
      logo: txt(o.logo),
      tone: o.tone || {}
    };
  });

  /* Карточки без ссылки уходят в конец раздела: сначала то, что уже можно
     оформить. Порядок внутри каждой группы — как в панели. */
  var byCat = {};
  live.forEach(function (o) { (byCat[o.cat] = byCat[o.cat] || []).push(o); });
  Object.keys(byCat).forEach(function (id) {
    byCat[id] = byCat[id].filter(function (o) { return o.url; })
      .concat(byCat[id].filter(function (o) { return !o.url; }));
  });
  /* Пустой раздел не показываем вовсе: заголовок без карточек — тупик. */
  var shownCats = cats.filter(function (c) { return (byCat[c.id] || []).length; });

  /* ── тексты сайта из панели ───────────────────────────────────────── */

  var brand = txt(site.brand);
  if (brand) {
    $all('[data-brand]').forEach(function (n) { n.textContent = brand; });
    document.title = brand + ' — дебетовые и кредитные карты, микрозаймы';
  }
  [['slogan', '[data-slogan]'], ['title', '[data-title]'], ['lead', '[data-lead]'], ['updated', '[data-updated]']]
    .forEach(function (p) {
      var v = txt(site[p[0]]);
      if (v) $all(p[1]).forEach(function (n) { n.textContent = v; });
    });

  /* Telegram в подвале: ник, @ник или ссылка t.me — всё приводим к ссылке. */
  var tg = txt(site.telegram)
    .replace(/^@/, '').replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '').replace(/[\/?#].*$/, '');
  $all('[data-telegram]').forEach(function (box) {
    if (!/^[A-Za-z0-9_]{4,32}$/.test(tg)) { box.hidden = true; return; }
    var a = box.querySelector('a');
    if (a) { a.href = 'https://t.me/' + tg; a.querySelector('[data-tg-name]').textContent = '@' + tg; }
    box.hidden = false;
  });

  /* ── меню: пункты разделов те же, что в каталоге ──────────────────── */

  ['nav-list', 'foot-list'].forEach(function (id) {
    var list = document.getElementById(id);
    if (!list || !cats.length) return;
    var anchor = list.querySelector('[data-nav-static]');
    $all('[data-nav-cat]', list).forEach(function (li) { li.remove(); });
    shownCats.forEach(function (c) {
      var li = document.createElement('li');
      li.setAttribute('data-nav-cat', '');
      li.innerHTML = '<a href="#' + esc(c.id) + '">' + esc(c.label) + '</a>';
      list.insertBefore(li, anchor);
    });
  });

  /* ── плитки первого экрана ────────────────────────────────────────── */

  /* Иконка плитки — по разделу; раздел, заведённый в панели, получает
     нейтральную «сетку». Нечётная последняя плитка — во всю ширину, как
     «Микрозаймы» в референсе. */
  var ICON = { debit: 'i-wallet', credit: 'i-card', loans: 'i-cash' };
  var ICO_EXT = '<svg class="ico" aria-hidden="true" focusable="false"><use href="#i-ext"/></svg>';

  var tiles = document.getElementById('tiles');
  if (tiles && cats.length) {
    tiles.innerHTML = shownCats.map(function (c, i) {
      var n = byCat[c.id].length;
      var wide = shownCats.length % 2 === 1 && i === shownCats.length - 1;
      return '' +
        '<li class="tile' + (wide ? ' tile--wide' : '') + '">' +
          '<svg class="tile__ico" aria-hidden="true" focusable="false"><use href="#' + (ICON[c.id] || 'i-grid') + '"/></svg>' +
          '<h3 class="tile__title"><a class="tile__link" href="#' + esc(c.id) + '">' + esc(c.label) + '</a></h3>' +
          '<p class="tile__count">' + n + ' ' + offersWord(n) + '</p>' +
          (txt(c.lead) ? '<p class="tile__text">' + esc(c.lead) + '</p>' : '') +
        '</li>';
    }).join('');
    tiles.hidden = !shownCats.length;
  }

  /* ── карточки ─────────────────────────────────────────────────────── */

  function cardHTML(o) {
    var cta = txt((catById[o.cat] || {}).cta) || 'Оформить';
    var product = o.title && o.title.toLowerCase() !== o.partner.toLowerCase() ? o.title : '';
    /* Подпись-тип не повторяем, если с неё и так начинается название продукта
       («Дебетовая карта ОТП» + «дебетовая карта»). */
    /* Тип продукта («дебетовая карта», «займ онлайн») на сайте не печатаем:
       карточка и так стоит в разделе с этим названием. Поле живёт в панели. */
    var tag = '';

    var paint = tilePaint(o.tone);
    var logo = o.logo
      ? '<span class="card__logo"><img src="' + esc(o.logo) + '" alt="" width="54" height="54" loading="lazy" decoding="async"></span>'
      : '<span class="card__logo card__logo--text" aria-hidden="true" style="background:' + esc(paint.bg) +
        ';color:' + esc(paint.ink) + '">' + esc(initials(o.partner)) + '</span>';

    var specs = o.specs.map(function (p) {
      return '<div><dt>' + esc(p[0]) + '</dt><dd>' + esc(p[1]) + '</dd></div>';
    }).join('');

    /* Без noreferrer: часть партнёрок считает переход по Referer.
       Видимая надпись стоит в начале имени ссылки дословно (её найдёт
       голосовое управление), скрытый хвост делает ссылки различимыми в
       списке ссылок диктора. erid — отдельной строкой, не внутри ссылки. */
    var erid = eridOf(o.url);
    var foot = o.url
      ? '<a class="btn btn--teal card__btn" href="' + esc(o.url) + '" target="_blank" rel="sponsored nofollow noopener">' +
          '<span>' + esc(cta) + '</span>' +
          '<span class="vh">: ' + esc(product || o.partner) + ', ' + esc(o.partner) + ' (откроется в новой вкладке)</span>' +
          ICO_EXT +
        '</a>' +
        '<p class="card__ad">Реклама · ' + esc(o.partner) + (erid ? ' · erid ' + esc(erid) : '') + '</p>'
      : '<p class="card__soon">Скоро появится</p>';

    return '' +
      '<li class="card' + (o.url ? '' : ' card--soon') + '">' +
        '<div class="card__head">' + logo +
          '<h3 class="card__name"><span class="card__partner">' + esc(o.partner) + '</span>' +
            (product ? '<span class="vh">: </span><span class="card__product">' + esc(product) + '</span>' : '') +
          '</h3>' +
        '</div>' +
        (tag ? '<p class="card__tag">' + esc(tag) + '</p>' : '') +
        (o.headline ? '<p class="card__headline">' + esc(o.headline) + '</p>' : '') +
        (o.note ? '<p class="card__note">' + esc(o.note) + '</p>' : '') +
        (specs ? '<dl class="card__specs">' + specs + '</dl>' : '') +
        (o.warn.length ? '<p class="card__warn">' + o.warn.map(esc).join(' ') + '</p>' : '') +
        '<div class="card__foot">' + foot + '</div>' +
      '</li>';
  }

  /* ── разделы каталога ─────────────────────────────────────────────── */

  var catalog = document.getElementById('offers');
  if (catalog && cats.length) {
    var have = {};
    $all('[data-cat]', catalog).forEach(function (s) { have[s.getAttribute('data-cat')] = s; });
    var tail = catalog.querySelector('noscript');

    shownCats.forEach(function (c) {
      var sec = have[c.id];
      if (!sec) {
        sec = document.createElement('section');
        sec.className = 'sec cat';
        sec.id = c.id;
        sec.setAttribute('data-cat', c.id);
        sec.setAttribute('aria-labelledby', c.id + '-title');
        sec.innerHTML = '<div class="wrap"><div class="sec__head">' +
          '<h2 class="h2" id="' + esc(c.id) + '-title" tabindex="-1" data-cat-title></h2>' +
          '<p class="sec__count" data-cat-count hidden></p><p class="sec__lead" data-cat-lead></p>' +
          '</div><ul class="cards" role="list" data-cat-cards></ul></div>';
      }
      delete have[c.id];
      var list = byCat[c.id];
      sec.querySelector('[data-cat-title]').textContent = c.label;
      var lead = sec.querySelector('[data-cat-lead]');
      lead.textContent = txt(c.lead); lead.hidden = !txt(c.lead);
      var count = sec.querySelector('[data-cat-count]');
      count.textContent = list.length + ' ' + offersWord(list.length); count.hidden = false;
      sec.querySelector('[data-cat-cards]').innerHTML = list.map(cardHTML).join('');
      sec.hidden = false;
      catalog.insertBefore(sec, tail);          /* порядок разделов — как в панели */
    });
    /* Раздел удалён в панели или остался без карточек — прячем целиком. */
    Object.keys(have).forEach(function (id) { have[id].hidden = true; });
  }

  /* ── банки и компании ─────────────────────────────────────────────── */

  var partners = document.getElementById('partners-list');
  if (partners) {
    var seen = {};
    var items = live.filter(function (o) {
      var k = o.partner.toLowerCase();
      if (!o.partner || seen[k] || !byCat[o.cat] || !catById[o.cat]) return false;
      seen[k] = true;
      return true;
    });
    partners.innerHTML = items.map(function (o) {
      var paint = tilePaint(o.tone);
      return '<li>' + (o.logo
        ? '<img src="' + esc(o.logo) + '" alt="" width="32" height="32" loading="lazy" decoding="async">'
        : '<img alt="" width="32" height="32" src="data:image/svg+xml,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="' + paint.bg + '"/></svg>') + '">') +
        esc(o.partner) + '</li>';
    }).join('');
    var pSec = document.getElementById('partners');
    if (pSec) pSec.hidden = !items.length;
    $all('a[href="#partners"]').forEach(function (a) { a.parentNode.hidden = !items.length; });
  }

  /* ── шапка: высота и «прилипание» ─────────────────────────────────── */

  var header = document.getElementById('hdr');
  if (header) {
    /* Высота шапки нужна и первому экрану (он уходит под неё), и отступу
       прокрутки: при зуме 200% шапка переносится в две строки. */
    var setH = function () { root.style.setProperty('--hdr-h', header.offsetHeight + 'px'); };
    setH();
    if ('ResizeObserver' in window) new ResizeObserver(setH).observe(header);
    else window.addEventListener('resize', setH);

    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── мобильное меню (раскрывашка, не диалог: фокус не запираем) ───── */

  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    var isOpen = function () { return burger.getAttribute('aria-expanded') === 'true'; };
    var setOpen = function (open, focusBack) {
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      root.classList.toggle('menu-open', open);
      if (!open && focusBack) burger.focus();
    };
    burger.addEventListener('click', function () { setOpen(!isOpen(), false); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a') && isOpen()) setOpen(false, false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) setOpen(false, true); });

    /* Фокус ушёл из меню (Tab дальше, клик мимо) — закрываем, чтобы он не
       оказался под выпавшей панелью. Нажатие внутри панели не считается:
       Safari по клику ссылку не фокусирует, и меню закрылось бы раньше,
       чем сработает переход. */
    var pressedInside = false;
    nav.addEventListener('pointerdown', function () {
      pressedInside = true; setTimeout(function () { pressedInside = false; }, 600);
    });
    var onFocusOut = function (e) {
      if (!isOpen() || pressedInside) return;
      var to = e.relatedTarget;
      if (to && (nav.contains(to) || to === burger)) return;
      if (!to && document.activeElement === burger) return;
      setOpen(false, false);
    };
    nav.addEventListener('focusout', onFocusOut);
    burger.addEventListener('focusout', onFocusOut);
    document.addEventListener('pointerdown', function (e) {
      if (isOpen() && !nav.contains(e.target) && !burger.contains(e.target)) setOpen(false, false);
    });

    /* Выросло окно — меню снова строкой в шапке, флаг сбрасываем. */
    var mq = matchMedia('(min-width: 1024px)');
    var onMq = function () { if (mq.matches) setOpen(false, false); };
    if (mq.addEventListener) mq.addEventListener('change', onMq); else if (mq.addListener) mq.addListener(onMq);
  }

  /* ── переходы к разделам ──────────────────────────────────────────── */

  /* «К предложениям» и кнопки «Выбрать продукт» ставят фокус на заголовок
     первого видимого раздела: диктор называет раздел, следующий Tab —
     первая кнопка в карточках. */
  function firstHeading() {
    var sec = $all('.cat', catalog || document).filter(function (s) { return !s.hidden; })[0];
    return sec ? sec.querySelector('.h2') : null;
  }
  $all('a[href="#offers"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var h = firstHeading();
      if (!h) return;
      e.preventDefault();
      h.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      h.focus({ preventScroll: true });
      if (history.replaceState) history.replaceState(null, '', '#offers');
    });
  });
  /* Якорные ссылки на разделы: фокус следом за прокруткой — на заголовок. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    if (!id || id === 'offers' || id === 'top') return;
    var target = document.getElementById(id);
    var h = target && (target.matches('[tabindex="-1"]') ? target : target.querySelector('h2[tabindex="-1"]'));
    if (h) setTimeout(function () { h.focus({ preventScroll: true }); }, 0);
  });

  /* Раздел из панели дорисован после загрузки — доезжаем до якоря ещё раз. */
  if (location.hash.length > 1) {
    var landed = null;
    try { landed = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch (e2) { /* кривой якорь */ }
    if (landed) landed.scrollIntoView();
  }

  /* ── появление блоков ─────────────────────────────────────────────── */

  /* Первый экран виден сразу. Ниже — мягкое появление списков; класс
     js-reveal ставится только когда наблюдатель точно есть. */
  /* Заголовки разделов не трогаем: к ним ведут якоря и skip-ссылка, и
     сдвиг на время появления увёл бы заголовок под шапку. */
  var revealEls = $all('.cat:not([hidden]) .cards, .faq__list');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });
  if (!reduce && 'IntersectionObserver' in window) {
    root.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0 });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Подстраховка: наблюдатель не сработал (печать, скрытая вкладка) —
       через 2,5 с показываем всё. */
    setTimeout(function () { revealEls.forEach(function (el) { el.classList.add('is-in'); }); }, 2500);
  }
})();
