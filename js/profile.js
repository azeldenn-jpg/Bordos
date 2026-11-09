/* Bord'os — onglet Profil : niveau, Mon corps, sons, synchronisation, questionnaire */
(function () {
  const B = window.Bord, A = B.app, $ = (s) => document.querySelector(s), esc = A.esc;
  const store = A.store;
  const S = () => A.S;
  const save = () => store.save();

  const LEVEL_HINT = {
    1: 'Maintiens de 30 s, exercices accessibles. Idéal pour démarrer et installer l\'habitude.',
    2: 'Maintiens de 45 s, plus d\'exercices actifs, accès au contracter-relâcher.',
    3: 'Maintiens de 60 s, grands écarts et pont complet. À réserver si tu t\'étires déjà régulièrement.',
  };

  function renderLevel() {
    A.chips($('#set-level'), [[1, 'Débutant'], [2, 'Intermédiaire'], [3, 'Avancé']], S().level, (v) => { S().level = +v; save(); renderLevel(); A.renderComposer(); });
    $('#level-hint').textContent = LEVEL_HINT[S().level];
  }
  function renderBody() {
    const box = $('#body-list'); box.innerHTML = '';
    B.BODY.forEach((b) => {
      const l = document.createElement('label'); l.className = 'row';
      l.innerHTML = `<span>${esc(b.name)}${b.hyper ? '<small>Maintiens limités à 30 s, pas de grands écarts profonds : priorité à la stabilité.</small>' : ''}</span><input type="checkbox" class="switch" ${store.data.body[b.id] ? 'checked' : ''}>`;
      l.querySelector('input').onchange = (e) => { store.data.body[b.id] = e.target.checked; save(); A.renderComposer(); };
      box.appendChild(l);
    });
    $('#body-notes').value = store.data.body.notes || '';
  }
  $('#body-notes').oninput = (e) => { store.data.body.notes = e.target.value; save(); };

  function fillVoices() {
    const sel = $('#set-voice-name'), vs = A.frVoices();
    sel.innerHTML = vs.length ? '' : '<option value="">Aucune voix française trouvée</option>';
    vs.forEach((v) => { const o = document.createElement('option'); o.value = v.voiceURI; o.textContent = v.name + ' (' + v.lang + ')'; sel.appendChild(o); });
    const cur = A.pickVoice(); if (cur) sel.value = cur.voiceURI;
  }
  function renderSound() {
    $('#set-pnf').checked = S().pnf;
    $('#set-beeps').checked = S().beeps;
    $('#set-music').value = S().music;
    $('#set-voice').checked = S().voice;
    $('#voice-opts').hidden = !S().voice;
    $('#set-rate').value = S().rate; $('#rate-out').textContent = (+S().rate).toFixed(2);
    fillVoices();
    $('#sync-token').value = localStorage.getItem('bordos.token') || '';
  }
  $('#set-pnf').onchange = (e) => { S().pnf = e.target.checked; save(); };
  $('#set-beeps').onchange = (e) => { S().beeps = e.target.checked; save(); };
  $('#set-music').onchange = (e) => { S().music = e.target.value; save(); };
  $('#set-voice').onchange = (e) => { S().voice = e.target.checked; save(); $('#voice-opts').hidden = !S().voice; };
  $('#set-voice-name').onchange = (e) => { S().voiceURI = e.target.value; save(); };
  $('#set-rate').oninput = (e) => { S().rate = +e.target.value; $('#rate-out').textContent = S().rate.toFixed(2); save(); };
  $('#btn-test-voice').onclick = () => { A.initAudio(); A.speak('Bonjour Ethan. Fente basse, côté gauche.', true); A.beep(740, 0.1); };
  if (window.speechSynthesis) window.speechSynthesis.addEventListener('voiceschanged', () => fillVoices());

  /* ---------- Synchronisation ---------- */
  const GIST_FILE = 'bordos.json', GIST_DESC = 'Bord\'os — synchronisation';
  const status = (t) => ($('#sync-status').textContent = t);
  $('#sync-token').onchange = (e) => localStorage.setItem('bordos.token', e.target.value.trim());
  const payload = () => JSON.stringify(store.data);
  // fusion : on additionne les historiques et bilans, on garde la séance perso la plus récente, et les réglages du plus récent
  function merge(remote) {
    const d = store.data, key = (h) => h.date + '|' + h.name;
    const hist = new Map(); (remote.history || []).concat(d.history).forEach((h) => hist.set(key(h), h));
    d.history = [...hist.values()].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const tests = new Map(); (remote.tests || []).concat(d.tests).forEach((t) => tests.set(t.test + '|' + t.date, t));
    d.tests = [...tests.values()];
    const cust = new Map(); (remote.custom || []).forEach((c) => cust.set(c.id, c)); d.custom.forEach((c) => cust.set(c.id, c));
    d.custom = [...cust.values()];
    if ((remote.updatedAt || 0) > (d.updatedAt || 0)) {
      ['settings', 'body', 'gen'].forEach((k) => { if (remote[k]) d[k] = remote[k]; });
      if (remote.program !== undefined) d.program = remote.program;
    }
    A.setS(d.settings);
    save();
  }
  async function gh(path, opts = {}) {
    const token = localStorage.getItem('bordos.token');
    if (!token) throw new Error('Ajoute d\'abord ton jeton GitHub.');
    const r = await fetch('https://api.github.com' + path, Object.assign({ headers: { Authorization: 'token ' + token, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' } }, opts));
    if (r.status === 401) throw new Error('Jeton refusé : vérifie-le, avec la case « gist » cochée.');
    if (!r.ok) throw new Error('GitHub a répondu ' + r.status + '.');
    return r.json();
  }
  async function findGist() {
    let id = localStorage.getItem('bordos.gist');
    if (id) return id;
    const list = await gh('/gists?per_page=100');
    const g = list.find((x) => x.description === GIST_DESC && x.files[GIST_FILE]);
    if (g) { localStorage.setItem('bordos.gist', g.id); return g.id; }
    return null;
  }
  $('#btn-sync-up').onclick = async () => {
    status('Envoi…');
    try {
      const id = await findGist();
      if (id) { const g = await gh('/gists/' + id); const f = g.files[GIST_FILE]; if (f && f.content) merge(JSON.parse(f.content)); }
      const body = JSON.stringify({ description: GIST_DESC, public: false, files: { [GIST_FILE]: { content: payload() } } });
      const g = id ? await gh('/gists/' + id, { method: 'PATCH', body }) : await gh('/gists', { method: 'POST', body });
      localStorage.setItem('bordos.gist', g.id);
      status('Envoyé le ' + new Date().toLocaleString('fr-FR') + '. Sur l\'autre appareil, appuie sur « Récupérer ».');
      A.renderHome();
    } catch (e) { status(e.message); }
  };
  $('#btn-sync-down').onclick = async () => {
    status('Récupération…');
    try {
      const id = await findGist();
      if (!id) return status('Rien à récupérer : appuie d\'abord sur « Envoyer » depuis l\'autre appareil.');
      const g = await gh('/gists/' + id), f = g.files[GIST_FILE];
      let content = f.content;
      if (f.truncated) content = await (await fetch(f.raw_url)).text();
      merge(JSON.parse(content));
      status('Récupéré et fusionné le ' + new Date().toLocaleString('fr-FR') + '.');
      refresh(); A.renderHome();
    } catch (e) { status(e.message); }
  };
  $('#btn-export').onclick = async () => {
    const blob = new Blob([payload()], { type: 'application/json' }), name = 'bordos-' + new Date().toISOString().slice(0, 10) + '.json';
    const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Bord\'os' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click();
  };
  $('#import-input').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { merge(JSON.parse(await f.text())); A.toast('Données importées et fusionnées'); refresh(); A.renderHome(); }
    catch (err) { A.toast('Fichier illisible'); }
    e.target.value = '';
  };

  /* ---------- Questionnaire de départ ---------- */
  const OB = { q1: null, q2: null, q3: 'complet' };
  let obAnim = null;
  function openOnboard() {
    A.chips($('#ob-q1'), [[0, 'Jamais'], [1, 'De temps en temps'], [2, 'Régulièrement']], OB.q1, (v) => { OB.q1 = +v; openOnboard(); });
    A.chips($('#ob-q2'), [[0, 'Pas mes chevilles'], [1, 'Mes orteils'], [2, 'Le sol, paumes à plat']], OB.q2, (v) => { OB.q2 = +v; openOnboard(); });
    A.chips($('#ob-q3'), [['complet', 'Souplesse générale'], ['ischios', 'Toucher mes pieds'], ['facial', 'Grand écart facial'], ['lateral', 'Grand écart latéral'], ['hanches', 'Hanches'], ['dos', 'Dos']], OB.q3, (v) => { OB.q3 = v; openOnboard(); });
    if ($('#onboard').hidden) {
      obAnim = obAnim || new B.figure.Animator($('#ob-fig'));
      obAnim.set(B.stretches.cercles_bras.anim);
      $('#onboard').hidden = false;
    }
  }
  $('#btn-ob-ok').onclick = () => {
    if (OB.q1 == null || OB.q2 == null) return A.toast('Réponds aux deux premières questions');
    const sc = OB.q1 + OB.q2, lvl = sc <= 1 ? 1 : sc <= 3 ? 2 : 3;
    S().level = lvl; store.data.gen.focus = OB.q3; store.data.onboarded = true; save();
    $('#onboard').hidden = true; obAnim && obAnim.stop();
    A.toast('Niveau ' + A.LEVEL_NAMES[lvl].toLowerCase() + ' choisi'); A.renderHome(); refresh();
  };
  $('#btn-ob-later').onclick = () => { store.data.onboarded = true; save(); $('#onboard').hidden = true; obAnim && obAnim.stop(); };
  $('#btn-onboard').onclick = openOnboard;

  function refresh() { renderLevel(); renderBody(); renderSound(); }
  const prevTab = B.onTab;
  B.onTab = (t) => { if (prevTab) prevTab(t); if (t === 'profile') refresh(); };
  if (!store.data.onboarded) setTimeout(openOnboard, 400);
})();
