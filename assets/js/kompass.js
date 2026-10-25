(function () {
  var OPTIONS = [
    [1, '1 Oviktigt'],
    [2, '2 Mindre viktigt'],
    [3, '3 Ganska viktigt'],
    [4, '4 Viktigt'],
    [5, '5 Mycket viktigt']
  ];
  var YESNO = [['ja', 'Ja'], ['nej', 'Nej']];
  var UNSURE = ['vetinte', 'Vet inte'];
  var YESNO_VALUE = { ja: 5, nej: 1 };
  var MIN_ANSWERS = 3;

  // Vikt = viktighet - 1, så att "oviktigt" (1) inte påverkar resultatet alls.
  function weight(importance) { return importance - 1; }

  function score(data, answers, distro) {
    var num = 0, den = 0;
    data.statements.forEach(function (s) {
      var u = answers[s.key];
      if (u === undefined) return;
      num += weight(u) * distro.scores[s.key];
      den += weight(u) * 4;
    });
    return den ? num / den : 0;
  }

  function reasons(data, answers, distro) {
    return data.statements
      .map(function (s) {
        var u = answers[s.key], d = distro.scores[s.key];
        if (u === undefined || u < 3 || d < 3) return null;
        return { s: s, strength: weight(u) * d };
      })
      .filter(Boolean)
      .sort(function (a, b) { return b.strength - a.strength; })
      .slice(0, 2)
      .map(function (r) {
        var note = distro.notes ? distro.notes[r.s.key] : '';
        return r.s.reason + '.' + (note ? ' ' + note : '');
      });
  }

  function rank(data, answers) {
    return data.distros
      .map(function (d) { return { distro: d, match: score(data, answers, d) }; })
      .sort(function (a, b) { return b.match - a.match; })
      .slice(0, 3)
      .map(function (r) {
        return { distro: r.distro, percent: Math.round(r.match * 100), why: reasons(data, answers, r.distro) };
      });
  }

  if (typeof module !== 'undefined') module.exports = { score: score, reasons: reasons, rank: rank };
  if (typeof document === 'undefined') return;

  var dataEl = document.getElementById('kompass-data');
  var form = document.getElementById('kompass-form');
  var out = document.getElementById('kompass-result');
  if (!dataEl || !form || !out) return;
  var data = JSON.parse(dataEl.dataset.json);

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  data.statements.forEach(function (s, i) {
    var fs = el('fieldset', 'kompass-q');
    var yesno = s.type === 'yesno';
    fs.appendChild(el('legend', null, (i + 1) + '. ' + (yesno ? s.question : 'Hur viktigt är det för dig: ' + s.text.charAt(0).toLowerCase() + s.text.slice(1) + '?')));
    if (s.hint) fs.appendChild(el('p', 'meta kompass-hint', s.hint));
    var row = el('div', 'kompass-opts');
    (yesno ? (s.unsure ? YESNO.concat([UNSURE]) : YESNO) : OPTIONS).forEach(function (o) {
      var label = el('label');
      var input = el('input');
      input.type = 'radio';
      input.name = s.key;
      input.value = o[0];
      label.appendChild(input);
      label.appendChild(el('span', null, o[1]));
      row.appendChild(label);
    });
    fs.appendChild(row);
    form.appendChild(fs);
  });
  var help = el('p', 'meta', 'Hoppa över det som inte passar. Svara på minst ' + MIN_ANSWERS + ' punkter.');
  var submit = el('button', 'kompass-btn', 'Visa mina förslag');
  submit.type = 'submit';
  var msg = el('p', 'kompass-msg');
  msg.setAttribute('role', 'alert');
  form.appendChild(help);
  form.appendChild(submit);
  form.appendChild(msg);
  form.hidden = false;

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var answers = {}, n = 0;
    data.statements.forEach(function (s) {
      var c = form.querySelector('input[name="' + s.key + '"]:checked');
      if (!c) return;
      var v = s.type === 'yesno' ? YESNO_VALUE[c.value] : parseInt(c.value, 10);
      if (v !== undefined) { answers[s.key] = v; n++; }
    });
    if (n < MIN_ANSWERS) {
      msg.textContent = 'Svara på minst ' + MIN_ANSWERS + ' punkter för att få förslag.';
      return;
    }
    if (!data.statements.some(function (s) { return answers[s.key] > 1; })) {
      msg.textContent = 'Du har markerat allt som oviktigt eller nej. Svara ja eller ge minst en punkt 2 eller högre.';
      return;
    }
    msg.textContent = '';
    show(rank(data, answers));
  });

  function show(top) {
    out.textContent = '';
    out.appendChild(el('h2', null, 'Dina tre bästa matchningar'));
    var ol = el('ol', 'kompass-top');
    top.forEach(function (r) {
      var li = el('li');
      var head = el('h3');
      head.appendChild(document.createTextNode(r.distro.name + ' '));
      head.appendChild(el('span', 'kompass-pct', r.percent + ' % match'));
      li.appendChild(head);
      li.appendChild(el('p', null, r.distro.summary));
      if (r.why.length) {
        li.appendChild(el('p', 'meta', 'Därför passar den dig:'));
        var ul = el('ul');
        r.why.forEach(function (w) { ul.appendChild(el('li', null, w)); });
        li.appendChild(ul);
      }
      var p = el('p');
      var a = el('a', null, 'Läs mer och ladda ner');
      a.href = r.distro.url;
      a.rel = 'noopener';
      p.appendChild(a);
      li.appendChild(p);
      ol.appendChild(li);
    });
    out.appendChild(ol);
    var again = el('button', 'kompass-btn kompass-btn-alt', 'Börja om');
    again.type = 'button';
    again.addEventListener('click', function () {
      form.reset();
      out.textContent = '';
      form.scrollIntoView();
    });
    out.appendChild(again);
    out.scrollIntoView();
  }
})();
