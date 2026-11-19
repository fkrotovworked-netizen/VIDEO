/* Дополнения после созвона 19.11: форма заявки → ВКонтакте, переход из «Направлений» в расписание. */
(function () {
  var VK_CHAT = 'https://vk.me/spartakfitnes';

  /* ---------- Направления → фильтр расписания ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-dir-go]');
    if (!a) return;
    var dir = a.getAttribute('data-dir-go');
    var chips = document.querySelectorAll('[data-dirs] .chip');
    for (var i = 0; i < chips.length; i++) {
      if (chips[i].getAttribute('data-dir') === dir) {
        if (chips[i].getAttribute('aria-pressed') !== 'true') chips[i].click();
        break;
      }
    }
  });

  /* ---------- Форма заявки ---------- */
  var form = document.querySelector('[data-lead]');
  if (!form) return;
  var err = form.querySelector('[data-lead-err]');
  var hint = document.querySelector('[data-sheet-hint]');
  var phone = form.elements.phone;
  var sheet = document.querySelector('[data-sheet]');
  var hintDefault = hint ? hint.innerHTML : '';

  function digits(v) {
    var d = v.replace(/\D/g, '');
    if (d[0] === '8') d = '7' + d.slice(1);
    if (d && d[0] !== '7') d = '7' + d;
    return d.slice(0, 11);
  }
  function fmt(d) {
    if (!d) return '';
    var s = '+7';
    if (d.length > 1) s += ' (' + d.slice(1, 4);
    if (d.length >= 4) s += ')';
    if (d.length > 4) s += ' ' + d.slice(4, 7);
    if (d.length > 7) s += '-' + d.slice(7, 9);
    if (d.length > 9) s += '-' + d.slice(9, 11);
    return s;
  }
  phone.addEventListener('input', function () {
    var d = digits(phone.value);
    phone.value = fmt(d);
  });

  function showErr(text, field) {
    err.textContent = text;
    err.hidden = false;
    if (field) field.focus();
  }

  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacy(text); });
    }
    return Promise.resolve(legacy(text));
  }
  function legacy(text) {
    try {
      var t = document.createElement('textarea');
      t.value = text;
      t.setAttribute('readonly', '');
      t.style.position = 'fixed';
      t.style.opacity = '0';
      form.appendChild(t);
      t.select();
      var ok = document.execCommand('copy');
      t.remove();
      return ok;
    } catch (e) { return false; }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    var name = form.elements.name.value.trim();
    var d = digits(phone.value);
    if (!name) return showErr('Укажите, как к вам обращаться.', form.elements.name);
    if (d.length !== 11) return showErr('Проверьте номер телефона: нужно 11 цифр.', phone);
    if (!form.elements.consent.checked) return showErr('Отметьте согласие на обработку персональных данных.', form.elements.consent);

    var base = window.spMsg || 'Здравствуйте! Хочу записаться на пробную тренировку.';
    var text = base + '\n\nИмя: ' + name + '\nТелефон: ' + fmt(d) + '\n(заявка с сайта)';

    // окно открываем синхронно, пока действует жест пользователя
    var w = window.open(VK_CHAT, '_blank');
    if (w) w.opener = null;
    copy(text).then(function (ok) {
      if (!hint) return;
      if (ok) {
        hint.innerHTML = '<b>Заявка скопирована.</b> В открывшемся чате ВКонтакте вставьте её и нажмите «Отправить».' +
          (w ? '' : ' Если чат не открылся — <a href="' + VK_CHAT + '" target="_blank" rel="noopener">откройте его здесь</a>.');
      } else {
        hint.textContent = 'Скопируйте и отправьте в чат клуба: ' + text;
      }
    });
  });

  if (sheet) sheet.addEventListener('close', function () {
    err.hidden = true;
    if (hint) hint.innerHTML = hintDefault;
  });
})();
