/* Bord'os — application (étape 1 : mode séance) */
(function () {
  const B = window.Bord;
  const $ = (s) => document.querySelector(s);
  const cover = (st) => st.anim.frames[Math.floor(st.anim.frames.length / 2)];
  const fmtMin = (s) => Math.max(1, Math.round(s / 60)) + ' min';

  /* ---------- Stockage ---------- */
  const KEY = 'bordos.v1';
  const store = (() => {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { d = {}; }
    d.settings = Object.assign({ voice: false, voiceURI: '', rate: 1, beeps: true, music: 'ambient' }, d.settings);
    if (!d.settings.v2) { d.settings.voice = false; d.settings.v2 = true; } // v0.2 : voix coupée par défaut
    d.history = d.history || [];
    return {
      get data() { return d; },
      save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} },
    };
  })();
  const S = store.data.settings;

  /* ---------- Navigation ---------- */
  const views = ['home', 'detail', 'player', 'done'];
  function show(name) {
    views.forEach((v) => $('#view-' + v).classList.toggle('active', v === name));
    window.scrollTo(0, 0);
  }

  /* ---------- Audio : bips + session audio ---------- */
  let ctx = null;
  function initAudio() {
    try {
      if ('audioSession' in navigator && S.music !== 'auto') navigator.audioSession.type = S.music;
    } catch (e) {}
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }
  function beep(freq = 880, dur = 0.12, vol = 0.25) {
    if (!S.beeps || !ctx) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  }

  /* ---------- Voix ---------- */
  const synth = window.speechSynthesis;
  function frVoices() {
    if (!synth) return [];
    const score = (v) => (/premium/i.test(v.name) ? 4 : 0) + (/enhanced|amélior/i.test(v.name) ? 3 : 0) + (/fr-FR/i.test(v.lang) ? 1 : 0);
    return synth.getVoices().filter((v) => /^fr/i.test(v.lang)).sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name));
  }
  function pickVoice() {
    const vs = frVoices();
    return vs.find((v) => v.voiceURI === S.voiceURI) || vs[0] || null;
  }
  function speak(text, interrupt) {
    if (!S.voice || !synth) return;
    if (interrupt) synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'fr-FR';
    u.rate = S.rate;
    synth.speak(u);
  }

  /* ---------- Écran allumé ---------- */
  let lock = null, awakeMode = '';
  async function keepAwake() {
    const vid = $('#awake-video');
    try {
      if ('wakeLock' in navigator) {
        lock = await navigator.wakeLock.request('screen');
        awakeMode = 'lock';
        lock.addEventListener('release', () => { if (awakeMode === 'lock') awakeMode = ''; renderAwake(); });
        renderAwake();
        return;
      }
    } catch (e) {}
    try { await vid.play(); awakeMode = 'video'; } catch (e) { awakeMode = ''; }
    renderAwake();
  }
  function releaseAwake() {
    try { lock && lock.release(); } catch (e) {}
    lock = null; awakeMode = '';
    $('#awake-video').pause();
  }
  function renderAwake() {
    $('#awake').textContent = awakeMode ? '● Écran maintenu allumé' : '○ Écran : pense à désactiver le verrouillage auto si besoin';
  }

  /* ---------- Accueil ---------- */
  function renderHome() {
    const h = new Date().getHours();
    $('#hello').textContent = h >= 18 || h < 5 ? 'Bonsoir Ethan' : 'Bonjour Ethan';
    const last = store.data.history[store.data.history.length - 1];
    $('#last-session').textContent = last ? 'Dernière séance : ' + last.name + ', ' + new Date(last.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    const list = $('#session-list');
    list.innerHTML = '';
    B.sessions.forEach((s) => {
      const first = B.stretches[s.steps[0][0]];
      const dyn = s.tag === 'Mobilité';
      const el = document.createElement('button');
      el.className = 'card';
      el.innerHTML = `<div><span class="chip ${dyn ? 'dyn' : ''}">${s.tag} · ${fmtMin(B.sessionSeconds(s))}</span><h3>${s.name}</h3><p>${s.desc}</p></div><div class="fig-wrap"></div>`;
      el.querySelector('.fig-wrap').innerHTML = B.figure.svgFor(cover(first));
      el.onclick = () => openDetail(s);
      list.appendChild(el);
    });
  }

  /* ---------- Détail ---------- */
  let current = null;
  function openDetail(s) {
    current = s;
    $('#detail-tag').textContent = s.tag;
    $('#detail-tag').className = 'chip' + (s.tag === 'Mobilité' ? ' dyn' : '');
    $('#detail-name').textContent = s.name;
    $('#detail-meta').textContent = fmtMin(B.sessionSeconds(s)) + ' · ' + s.steps.length + ' exercices';
    $('#detail-desc').textContent = s.desc;
    const ol = $('#detail-steps');
    ol.innerHTML = '';
    s.steps.forEach(([id, sec]) => {
      const st = B.stretches[id];
      const li = document.createElement('li');
      li.innerHTML = `<div class="fig-wrap"></div><div><b>${st.name}</b><small>${st.zone}${st.sides ? ' · chaque côté' : ''}</small></div><span class="dur">${sec} s${st.sides ? ' ×2' : ''}</span>`;
      li.querySelector('.fig-wrap').innerHTML = B.figure.svgFor(cover(st));
      ol.appendChild(li);
    });
    show('detail');
  }

  /* ---------- Lecteur ---------- */
  let peekAnim = null;
  const P = { phases: [], i: 0, start: 0, pausedAt: 0, paused: false, timer: 0, lastSec: -1, half: false, anim: null, total: 0 };

  function buildPhases(s) {
    const out = [];
    s.steps.forEach(([id, sec], idx) => {
      const ex = B.stretches[id];
      if (ex.sides) {
        out.push({ kind: 'prep', id, side: 'gauche', sec: B.PREP, step: idx });
        out.push({ kind: 'work', id, side: 'gauche', sec, step: idx });
        out.push({ kind: 'switch', id, side: 'droit', sec: B.SWITCH, step: idx });
        out.push({ kind: 'work', id, side: 'droit', sec, step: idx });
      } else {
        out.push({ kind: 'prep', id, side: null, sec: B.PREP, step: idx });
        out.push({ kind: 'work', id, side: null, sec, step: idx });
      }
    });
    return out;
  }

  function startSession() {
    initAudio();
    keepAwake();
    P.phases = buildPhases(current);
    P.total = P.phases.reduce((a, p) => a + p.sec, 0);
    P.anim = P.anim || new B.figure.Animator($('#fig'));
    show('player');
    enterPhase(0); // appel synchrone : débloque la voix sur iOS
    clearInterval(P.timer);
    P.timer = setInterval(tick, 200);
  }

  function enterPhase(i) {
    P.i = i; P.start = performance.now(); P.lastSec = -1; P.half = false;
    if (P.paused) { P.pausedAt = P.start; }
    const ph = P.phases[i], ex = B.stretches[ph.id];
    const n = current.steps.length;
    $('#counter').textContent = ph.step + 1 + '/' + n;
    $('#ex-name').textContent = ex.name;
    $('#ex-zone').textContent = ex.zone + (ex.type === 'dyn' ? ' · mobilité' : ' · souplesse');
    $('#cue').textContent = ex.cue;
    const sideTxt = ph.side ? 'Côté ' + ph.side : '';
    $('#phase').textContent = ph.kind === 'prep' ? 'Prépare-toi' + (sideTxt ? ' · ' + sideTxt.toLowerCase() : '') : ph.kind === 'switch' ? 'Change de côté' : sideTxt || (ex.type === 'dyn' ? 'En mouvement' : 'Maintiens');
    $('#view-player').classList.toggle('prep', ph.kind !== 'work');
    // suivant
    const nxt = current.steps[ph.step + 1];
    $('#next-up').textContent = nxt ? 'Ensuite : ' + B.stretches[nxt[0]].name : 'Dernier exercice';
    // personnage animé dès la préparation ; repères visuels de transition
    P.anim.set(ex.anim, ph.side === 'droit');
    P.anim.pause(P.paused);
    $('#peek').hidden = true; P.peek = false;
    $('#banner').hidden = ph.kind !== 'switch';
    const stage = $('.stage');
    stage.classList.remove('flash'); void stage.offsetWidth; stage.classList.add('flash');
    // annonces
    if (ph.kind === 'prep') speak((ph.side ? 'Côté ' + ph.side + '. ' : '') + ex.name + '. ' + ex.cue, true);
    else if (ph.kind === 'switch') { speak('Change de côté.', true); beep(660, 0.15); }
    else { beep(990, 0.35, 0.3); if (ph.sec >= 30 && ex.type === 'stat') {} }
    renderTime(ph.sec);
  }

  function elapsed() {
    return ((P.paused ? P.pausedAt : performance.now()) - P.start) / 1000;
  }

  function tick() {
    const ph = P.phases[P.i];
    if (!ph) return;
    const left = Math.max(0, ph.sec - elapsed());
    const sec = Math.ceil(left);
    if (sec !== P.lastSec) {
      P.lastSec = sec;
      if (!P.paused && sec <= 3 && sec >= 1) beep(ph.kind === 'work' ? 740 : 600, 0.1);
      if (!P.paused && ph.kind === 'work' && !P.half && ph.sec >= 30 && left <= ph.sec / 2) {
        P.half = true;
        speak(B.stretches[ph.id].type === 'stat' ? 'Respire profondément, relâche.' : 'Continue, à mi-parcours.');
      }
      if (!P.paused && ph.kind === 'work' && ph.sec >= 30 && sec === 10) speak('Encore dix secondes.');
    }
    // aperçu animé de la suite pendant les 5 dernières secondes
    const nx = P.phases[P.i + 1];
    if (ph.kind === 'work' && nx && left <= 5 && !P.peek) {
      P.peek = true;
      const nex = B.stretches[nx.id];
      $('#peek-label').textContent = nx.id === ph.id ? 'Ensuite · côté ' + nx.side : 'Ensuite';
      $('#peek').hidden = false;
      peekAnim = peekAnim || new B.figure.Animator($('#peek-fig'));
      peekAnim.set(nex.anim, nx.side === 'droit');
      peekAnim.pause(P.paused);
    }
    renderTime(left);
    if (left <= 0 && !P.paused) next();
  }

  function renderTime(left) {
    const ph = P.phases[P.i];
    $('#time').textContent = Math.ceil(left);
    $('#ring').style.strokeDashoffset = (326.7 * (1 - left / ph.sec)).toFixed(1);
    const doneSec = P.phases.slice(0, P.i).reduce((a, p) => a + p.sec, 0) + (ph.sec - left);
    $('#progress').style.width = Math.min(100, (doneSec / P.total) * 100) + '%';
  }

  function next() {
    if (P.i + 1 >= P.phases.length) return finish();
    enterPhase(P.i + 1);
  }
  function prev() {
    // revenir au début de l'exercice courant, ou au précédent si on vient d'y arriver
    const startOf = (step) => P.phases.findIndex((p) => p.step === step);
    const step = P.phases[P.i].step;
    let i = startOf(step);
    if (i === P.i && elapsed() < 2 && step > 0) i = startOf(step - 1);
    enterPhase(i);
  }
  function setPaused(p) {
    if (p === P.paused) return;
    if (p) { P.pausedAt = performance.now(); synth && synth.cancel(); }
    else { P.start += performance.now() - P.pausedAt; initAudio(); }
    P.paused = p;
    P.anim && P.anim.pause(p);
    peekAnim && peekAnim.pause(p);
    $('#view-player').classList.toggle('paused', p);
    $('#ico-pause').hidden = p; $('#ico-play').hidden = !p;
    $('#btn-play').setAttribute('aria-label', p ? 'Reprendre' : 'Pause');
  }
  function stopSession() {
    clearInterval(P.timer); P.timer = 0;
    synth && synth.cancel();
    P.anim && P.anim.stop();
    peekAnim && peekAnim.stop();
    releaseAwake();
    setPaused(false);
  }
  function finish() {
    const secs = Math.round(P.total);
    stopSession();
    store.data.history.push({ date: new Date().toISOString(), id: current.id, name: current.name, seconds: secs });
    store.save();
    speak('Séance terminée. Bravo !', true);
    beep(880, 0.15); setTimeout(() => beep(1175, 0.3), 180);
    $('#done-meta').textContent = current.name + ' · ' + fmtMin(secs) + ' · ' + current.steps.length + ' exercices';
    $('#done-fig').innerHTML = B.figure.svgFor({ hip: [60, 50], a1: 145, f1: 160, a2: 215, f2: 200 });
    show('done');
  }

  /* ---------- Réglages ---------- */
  function fillVoices() {
    const sel = $('#set-voice-name'), vs = frVoices();
    sel.innerHTML = vs.length ? '' : '<option value="">Aucune voix française trouvée</option>';
    vs.forEach((v) => {
      const o = document.createElement('option');
      o.value = v.voiceURI; o.textContent = v.name + ' (' + v.lang + ')';
      sel.appendChild(o);
    });
    const cur = pickVoice();
    if (cur) sel.value = cur.voiceURI;
  }
  function openSettings() {
    $('#set-voice').checked = S.voice;
    $('#set-rate').value = S.rate; $('#rate-out').textContent = (+S.rate).toFixed(2);
    $('#set-beeps').checked = S.beeps;
    $('#set-music').value = S.music;
    fillVoices();
    $('#settings').hidden = false;
  }
  function bindSettings() {
    const save = () => store.save();
    $('#btn-settings').onclick = openSettings;
    $('#btn-settings-close').onclick = () => ($('#settings').hidden = true);
    $('#settings').onclick = (e) => { if (e.target.id === 'settings') $('#settings').hidden = true; };
    $('#set-voice').onchange = (e) => { S.voice = e.target.checked; save(); };
    $('#set-voice-name').onchange = (e) => { S.voiceURI = e.target.value; save(); };
    $('#set-rate').oninput = (e) => { S.rate = +e.target.value; $('#rate-out').textContent = S.rate.toFixed(2); save(); };
    $('#set-beeps').onchange = (e) => { S.beeps = e.target.checked; save(); };
    $('#set-music').onchange = (e) => { S.music = e.target.value; save(); };
    $('#btn-test-voice').onclick = () => {
      initAudio();
      const was = S.voice; S.voice = true;
      speak('Bonjour Ethan. Fente basse, côté gauche. Avance doucement le bassin vers l\'avant.', true);
      S.voice = was;
      beep(740, 0.1);
    };
    if (synth) synth.onvoiceschanged = () => { if (!$('#settings').hidden) fillVoices(); };
  }

  /* ---------- Événements ---------- */
  $('#btn-start').onclick = startSession;
  $('#btn-play').onclick = () => setPaused(!P.paused);
  $('#btn-next').onclick = () => { if (P.phases[P.i]) next(); };
  $('#btn-prev').onclick = prev;
  const quit = () => { $('#confirm').hidden = true; stopSession(); renderHome(); show('home'); };
  $('#btn-close').onclick = () => {
    if (P.i < 2) return quit();
    P.wasPaused = P.paused; setPaused(true);
    $('#confirm').hidden = false;
  };
  $('#btn-confirm-quit').onclick = quit;
  $('#btn-confirm-stay').onclick = () => { $('#confirm').hidden = true; if (!P.wasPaused) setPaused(false); };
  document.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => show('home')));
  document.querySelectorAll('[data-home]').forEach((b) => (b.onclick = () => { renderHome(); show('home'); }));

  // Si l'appli passe en arrière-plan : pause automatique ; au retour, on réactive l'écran allumé
  document.addEventListener('visibilitychange', () => {
    if (!P.timer) return;
    if (document.hidden) setPaused(true);
    else { keepAwake(); P.anim && P.anim.start(); }
  });

  bindSettings();
  renderHome();
  if (synth) synth.getVoices();

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
