/* Bord'os — application (v0.3) */
(function () {
  const B = window.Bord;
  const $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const cover = (st) => st.anim.frames[Math.floor(st.anim.frames.length / 2)];
  const fmtMin = (s) => Math.max(1, Math.round(s / 60)) + ' min';
  const dots = (n) => '●'.repeat(n) + '○'.repeat(3 - n);
  const LEVEL_NAMES = { 1: 'Débutant', 2: 'Intermédiaire', 3: 'Avancé' };
  const FLAG_TEXT = {
    lombaires: 'Flexion du dos : à éviter le matin au réveil, en cas de hernie discale ou d\'ostéoporose.',
    extension: 'Cambrure du dos : ne monte pas s\'il y a une douleur dans le bas du dos.',
    genoux: 'Genoux sollicités : coussin sous le genou, aucune douleur articulaire.',
    poignets: 'Appui sur les poignets : sur les poings ou les avant-bras si ça gêne.',
    equilibre: 'Équilibre : tiens-toi à un mur si besoin.',
    nuque: 'Nuque : mouvement doux uniquement, jamais de traction.',
    nerf: 'Si tu sens des fourmillements ou une douleur qui descend dans la jambe, plie le genou ou arrête : c\'est le nerf, pas le muscle.',
  };

  /* ---------- Stockage ---------- */
  const KEY = 'bordos.v1';
  const store = (() => {
    let d = {};
    try { d = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { d = {}; }
    d.settings = Object.assign({ voice: false, voiceURI: '', rate: 1, beeps: true, music: 'ambient', level: 1, pnf: false }, d.settings);
    if (!d.settings.v2) { d.settings.voice = false; d.settings.v2 = true; }
    d.gen = Object.assign({ min: 10, focus: 'complet', moment: 'souplesse' }, d.gen);
    d.history = d.history || [];
    d.custom = d.custom || [];
    return { get data() { return d; }, save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} } };
  })();
  const S = store.data.settings;

  /* ---------- Navigation ---------- */
  const views = ['home', 'detail', 'player', 'done', 'library', 'builder'];
  function show(name) {
    views.forEach((v) => $('#view-' + v).classList.toggle('active', v === name));
    window.scrollTo(0, 0);
  }
  let toastT = 0;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), 1800);
  }

  /* ---------- Audio ---------- */
  let ctx = null;
  function initAudio() {
    try { if ('audioSession' in navigator && S.music !== 'auto') navigator.audioSession.type = S.music; } catch (e) {}
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) { ctx = null; }
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
  const pickVoice = () => { const vs = frVoices(); return vs.find((v) => v.voiceURI === S.voiceURI) || vs[0] || null; };
  function speak(text, interrupt) {
    if (!S.voice || !synth) return;
    if (interrupt) synth.cancel();
    const u = new SpeechSynthesisUtterance(text), v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'fr-FR'; u.rate = S.rate;
    synth.speak(u);
  }

  /* ---------- Écran allumé ---------- */
  let lock = null, awakeMode = '';
  async function keepAwake() {
    try {
      if ('wakeLock' in navigator) {
        lock = await navigator.wakeLock.request('screen'); awakeMode = 'lock';
        lock.addEventListener('release', () => { if (awakeMode === 'lock') awakeMode = ''; renderAwake(); });
        return renderAwake();
      }
    } catch (e) {}
    try { await $('#awake-video').play(); awakeMode = 'video'; } catch (e) { awakeMode = ''; }
    renderAwake();
  }
  function releaseAwake() { try { lock && lock.release(); } catch (e) {} lock = null; awakeMode = ''; $('#awake-video').pause(); }
  function renderAwake() { $('#awake').textContent = awakeMode ? '● Écran maintenu allumé' : '○ Écran : désactive le verrouillage auto si besoin'; }

  /* ================= GÉNÉRATEUR DE SÉANCE ================= */
  // Règles : docs/savoir.md §3, §5 et §9
  function generate(opts) {
    const total = opts.min * 60, level = S.level, M = B.MOMENTS[opts.moment], FW = B.FOCUS[opts.focus].zones;
    let hold = B.LEVELS[level].hold;
    if (M.maxHold) hold = Math.min(hold, M.maxHold);
    const ok = (id) => { const e = B.stretches[id]; return e.level <= level && !e.relax && !(M.noFlex && (e.flags || []).includes('lombaires')); };
    const score = (e) => e.zones.reduce((a, z, i) => a + (FW[z] || 0) * (i === 0 ? 1 : 0.55), 0) * (0.8 + Math.random() * 0.4);
    const ids = Object.keys(B.stretches).filter(ok);
    const rank = (type) => ids.filter((id) => B.stretches[id].type === type).map((id) => ({ id, s: score(B.stretches[id]) })).filter((x) => x.s > 0.05).sort((a, b) => b.s - a.s);

    const steps = [];
    let used = 0;
    // 1. Échauffement / mobilité
    const dynTarget = total * M.dyn, minDyn = total >= 420 ? 2 : 1;
    for (const { id } of rank('dyn')) {
      const e = B.stretches[id], sec = e.sides ? (opts.moment === 'avant' ? 20 : 25) : level >= 3 ? 40 : 30;
      const c = B.stepSeconds(id, sec);
      const dynCount = steps.length;
      if (dynCount >= minDyn && used + c > dynTarget + 10) continue;
      if (used + c > total) continue;
      steps.push({ id, sec, dyn: true }); used += c;
      if (used >= dynTarget && steps.length >= minDyn) break;
    }
    // 2. Bloc principal statique (≤ 4 min par zone principale)
    const relax = M.relax || (opts.moment === 'souplesse' && total >= 600);
    const reserve = relax ? B.stepSeconds('respiration', 45) : 0;
    const zoneTime = {};
    const stat = rank('stat');
    // On vise ~60 s d'étirement par exercice (et par côté) : moins d'exercices, mieux dosés (docs/savoir.md §3)
    const target = Math.max(hold, 60), estCost = (id) => B.stepSeconds(id, target);
    let est = used;
    for (const { id } of stat) {
      const e = B.stretches[id], z = e.zones[0], per = e.sides ? 2 : 1;
      if ((zoneTime[z] || 0) + hold * per > 240 * per) continue;
      if (est + estCost(id) + reserve > total + 15) continue;
      steps.push({ id, sec: hold }); used += B.stepSeconds(id, hold); est += estCost(id); zoneTime[z] = (zoneTime[z] || 0) + hold * per;
    }
    // 3. Temps restant : on allonge les maintiens utiles (max 90 s, ou la limite du moment), puis la mobilité (max 60 s)
    const statCap = M.maxHold || { 1: 60, 2: 75, 3: 90 }[level];
    let guard = 0;
    while (total - reserve - used >= 15 && guard++ < 120) {
      const fits = (s) => used + 10 * (B.stretches[s.id].sides ? 2 : 1) + reserve <= total + 10;
      let cand = steps.filter((s) => !s.dyn && s.sec < statCap && (zoneTime[B.stretches[s.id].zones[0]] || 0) < 240 * (B.stretches[s.id].sides ? 2 : 1) && fits(s));
      if (!cand.length) cand = steps.filter((s) => s.dyn && s.sec < 60 && fits(s));
      if (!cand.length) break;
      const s = cand[guard % cand.length], e = B.stretches[s.id], add = s.dyn ? 10 : 15, per = e.sides ? 2 : 1;
      const step = Math.min(add, (s.dyn ? 60 : statCap) - s.sec);
      if (step <= 0 || used + step * per + reserve > total + 10) break;
      s.sec += step; used += step * per;
      if (!s.dyn) zoneTime[e.zones[0]] = (zoneTime[e.zones[0]] || 0) + step * per;
    }
    // 3 bis. Toujours du temps libre (objectif très ciblé ou séance longue) : on complète avec d'autres exercices utiles
    const usedIds = new Set(steps.map((s) => s.id));
    // d'abord une 2e série des étirements les plus ciblés (l'ACSM conseille 2 à 4 répétitions)
    if (M.dyn < 0.5) {
      const reps = steps.filter((s) => !s.dyn && score(B.stretches[s.id]) >= 0.6).sort((a, b) => score(B.stretches[b.id]) - score(B.stretches[a.id]));
      for (const r of reps) {
        const e = B.stretches[r.id], per = e.sides ? 2 : 1, c = B.stepSeconds(r.id, hold);
        if (total - reserve - used < 40) break;
        if ((zoneTime[e.zones[0]] || 0) + hold * per > 240 * per || used + c + reserve > total + 10) continue;
        steps.push({ id: r.id, sec: hold }); used += c; zoneTime[e.zones[0]] = (zoneTime[e.zones[0]] || 0) + hold * per;
      }
    }
    const prefer = M.dyn >= 0.5 ? ['dyn', 'stat'] : ['stat', 'dyn'];
    for (const type of prefer) {
      const extra = ids.filter((id) => B.stretches[id].type === type && !usedIds.has(id)).map((id) => ({ id, s: score(B.stretches[id]) + 0.01 })).sort((a, b) => b.s - a.s);
      for (const { id } of extra) {
        if (total - reserve - used < 40) break;
        const e = B.stretches[id], sec = type === 'dyn' ? (e.sides ? 25 : 30) : hold, c = B.stepSeconds(id, sec);
        if (used + c + reserve > total + 10) continue;
        steps.push({ id, sec, dyn: type === 'dyn' }); usedIds.add(id); used += c;
      }
    }
    // 4. Ordre : par hauteur (réveil/avant : du sol vers debout ; sinon de debout vers le sol)
    const up = opts.moment === 'reveil' || opts.moment === 'avant';
    const byPos = (a, b) => (up ? B.stretches[b.id].pos - B.stretches[a.id].pos : B.stretches[a.id].pos - B.stretches[b.id].pos);
    const dyn = steps.filter((s) => s.dyn).sort(byPos), st = steps.filter((s) => !s.dyn).sort(byPos);
    const out = dyn.concat(st).map((s) => [s.id, s.sec]);
    if (relax) out.push(['respiration', 45]);
    return {
      id: 'gen', generated: true, params: Object.assign({}, opts),
      name: B.FOCUS[opts.focus].name, tag: M.name,
      desc: (opts.moment === 'avant' ? 'Surtout du dynamique, maintiens courts pour garder ta force. ' : opts.moment === 'reveil' ? 'Du sol vers debout, sans flexion profonde du dos au réveil. ' : 'Échauffement dynamique, puis maintiens ciblés. ') + 'Niveau ' + LEVEL_NAMES[level].toLowerCase() + '.',
      steps: out,
    };
  }

  /* ================= ACCUEIL ================= */
  function chips(el, items, cur, onPick) {
    el.innerHTML = '';
    items.forEach(([val, label]) => {
      const b = document.createElement('button');
      b.className = 'chip-btn' + (String(val) === String(cur) ? ' on' : ''); b.textContent = label;
      b.onclick = () => { onPick(val); };
      el.appendChild(b);
    });
  }
  function renderComposer() {
    const g = store.data.gen;
    chips($('#g-min'), [5, 10, 15, 20, 30].map((m) => [m, String(m)]), g.min, (v) => { g.min = +v; store.save(); renderComposer(); });
    chips($('#g-focus'), Object.entries(B.FOCUS).map(([k, f]) => [k, f.name]), g.focus, (v) => { g.focus = v; store.save(); renderComposer(); });
    chips($('#g-moment'), Object.entries(B.MOMENTS).map(([k, m]) => [k, m.name]), g.moment, (v) => { g.moment = v; store.save(); renderComposer(); });
    $('#g-level').textContent = 'Niveau ' + LEVEL_NAMES[S.level].toLowerCase() + ' · maintiens de ' + B.LEVELS[S.level].hold + ' s · modifiable dans les réglages';
  }
  function card(s, onClick) {
    const first = B.stretches[s.steps[s.steps.length > 1 ? 1 : 0][0]];
    const el = document.createElement('button');
    el.className = 'card';
    el.innerHTML = `<div><span class="chip ${s.tag === 'Mobilité' ? 'dyn' : ''}">${esc(s.tag || 'Perso')} · ${fmtMin(B.sessionSeconds(s))}</span><h3>${esc(s.name)}</h3><p>${esc(s.desc || s.steps.length + ' exercices')}</p></div><div class="fig-wrap"></div>`;
    el.querySelector('.fig-wrap').innerHTML = B.figure.svgFor(cover(first));
    el.onclick = onClick;
    return el;
  }
  function renderHome() {
    const h = new Date().getHours();
    $('#hello').textContent = h >= 18 || h < 5 ? 'Bonsoir Ethan' : 'Bonjour Ethan';
    const last = store.data.history[store.data.history.length - 1];
    $('#last-session').textContent = last ? 'Dernière séance : ' + last.name + ', ' + new Date(last.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : '';
    renderComposer();
    const cl = $('#custom-list'); cl.innerHTML = '';
    if (!store.data.custom.length) cl.innerHTML = '<p class="empty">Crée ta propre séance en choisissant tes exercices, ou garde une séance composée.</p>';
    store.data.custom.forEach((s) => cl.appendChild(card(s, () => openDetail(s))));
    const list = $('#session-list'); list.innerHTML = '';
    B.sessions.forEach((s) => list.appendChild(card(s, () => openDetail(s))));
    $('#lib-count').textContent = Object.keys(B.stretches).length + ' exercices expliqués';
    $('#lib-fig').innerHTML = B.figure.svgFor(cover(B.stretches.grand_ecart_lateral));
  }

  /* ================= DÉTAIL ================= */
  let current = null;
  function stepLi(id, sec) {
    const st = B.stretches[id];
    const li = document.createElement('li');
    li.innerHTML = `<div class="fig-wrap"></div><div><b>${esc(st.name)}</b><small>${st.type === 'dyn' ? 'Mobilité' : 'Souplesse'} · ${esc(B.ZONES[st.zones[0]])}${st.sides ? ' · chaque côté' : ''}</small></div><span class="dur">${sec} s${st.sides ? ' ×2' : ''}</span>`;
    li.querySelector('.fig-wrap').innerHTML = B.figure.svgFor(cover(st));
    li.onclick = () => openExercise(id);
    return li;
  }
  function openDetail(s) {
    current = s;
    const custom = store.data.custom.some((c) => c.id === s.id);
    $('#detail-tag').textContent = s.tag || 'Perso';
    $('#detail-tag').className = 'chip' + (s.tag === 'Mobilité' ? ' dyn' : '');
    $('#detail-name').textContent = s.name;
    $('#detail-meta').textContent = fmtMin(B.sessionSeconds(s)) + ' · ' + s.steps.length + ' exercices';
    $('#detail-desc').textContent = s.desc || '';
    $('#btn-regen').hidden = !s.generated;
    $('#btn-save-gen').hidden = !s.generated;
    $('#btn-edit').hidden = !custom;
    $('#btn-delete').hidden = !custom;
    const ol = $('#detail-steps'); ol.innerHTML = '';
    s.steps.forEach(([id, sec]) => ol.appendChild(stepLi(id, sec)));
    show('detail');
  }

  /* ================= FICHE EXERCICE ================= */
  let exAnim = null, pickMode = null;
  function openExercise(id) {
    const e = B.stretches[id];
    $('#ex-chip').textContent = (e.type === 'dyn' ? 'Mobilité' : 'Souplesse') + ' · ' + LEVEL_NAMES[e.level];
    $('#ex-chip').className = 'chip' + (e.type === 'dyn' ? ' dyn' : '');
    $('#ex-title').textContent = e.name;
    $('#ex-meta').textContent = e.zones.map((z) => B.ZONES[z]).join(' · ') + (e.sides ? ' · chaque côté' : '');
    const sec = (t, h) => (h ? `<div class="ex-sec"><h4>${t}</h4>${h}</div>` : '');
    let html = sec('Comment faire', `<p>${esc(e.cue)}</p>`) + sec('Ce que tu dois sentir', `<p>${esc(e.feel || '')}</p>`) +
      sec('Points clés', `<ul>${(e.tips || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`) +
      sec('Plus facile', e.easier ? `<p>${esc(e.easier)}</p>` : '') + sec('Plus difficile', e.harder ? `<p>${esc(e.harder)}</p>` : '') +
      sec('Contracter-relâcher', e.pnf ? `<p>${esc(e.pnf)} 5 s à environ 30 % de ta force, puis relâche et va un peu plus loin.</p>` : '');
    const flags = (e.flags || []).map((f) => FLAG_TEXT[f]).filter(Boolean);
    if (flags.length) html += `<div class="ex-warn">${flags.map(esc).join('<br>')}</div>`;
    html += `<div class="ex-warn">Tension de 5 à 7 sur 10, jamais de douleur vive. Respire lentement.</div>`;
    $('#ex-body').innerHTML = html;
    $('#btn-ex-add').hidden = !pickMode;
    $('#btn-ex-add').onclick = () => { pickMode && pickMode(id); closeExercise(); };
    exAnim = exAnim || new B.figure.Animator($('#ex-fig'));
    exAnim.set(e.anim, false);
    $('#exsheet').hidden = false;
    if (P.timer && !P.paused) { P.autoPaused = true; setPaused(true); }
  }
  function closeExercise() {
    $('#exsheet').hidden = true; exAnim && exAnim.stop();
    if (P.autoPaused) { P.autoPaused = false; setPaused(false); }
  }

  /* ================= BIBLIOTHÈQUE ================= */
  const LIB = { zone: 'all', type: 'all', back: 'home' };
  function openLibrary(opts) {
    Object.assign(LIB, { zone: 'all', type: 'all' }, opts || {});
    $('#lib-title').textContent = pickMode ? 'Ajouter' : 'Bibliothèque';
    renderLibrary();
    show('library');
  }
  function renderLibrary() {
    const zones = [['all', 'Toutes']].concat(Object.entries(B.ZONES).filter(([z]) => z !== 'detente'));
    chips($('#lib-zones'), zones, LIB.zone, (v) => { LIB.zone = v; renderLibrary(); });
    chips($('#lib-types'), [['all', 'Tout'], ['dyn', 'Mobilité'], ['stat', 'Souplesse']], LIB.type, (v) => { LIB.type = v; renderLibrary(); });
    const ul = $('#lib-list'); ul.innerHTML = '';
    Object.entries(B.stretches)
      .filter(([, e]) => (LIB.zone === 'all' || e.zones.includes(LIB.zone)) && (LIB.type === 'all' || e.type === LIB.type))
      .sort((a, b) => a[1].level - b[1].level || a[1].pos - b[1].pos)
      .forEach(([id, e]) => {
        const li = document.createElement('li');
        li.innerHTML = `<div class="fig-wrap"></div><div><b>${esc(e.name)}</b><small>${e.type === 'dyn' ? 'Mobilité' : 'Souplesse'} · ${esc(B.ZONES[e.zones[0]])} · <span class="level-dots">${dots(e.level)}</span></small></div>${pickMode ? '<span class="add">+</span>' : ''}`;
        li.querySelector('.fig-wrap').innerHTML = B.figure.svgFor(cover(e));
        li.onclick = (ev) => { if (pickMode && ev.target.classList.contains('add')) { pickMode(id); } else openExercise(id); };
        ul.appendChild(li);
      });
  }

  /* ================= CONSTRUCTEUR ================= */
  let draft = null;
  function openBuilder(s) {
    draft = s ? JSON.parse(JSON.stringify(s)) : { id: 'c' + Date.now(), name: '', tag: 'Perso', steps: [] };
    delete draft.generated; delete draft.params;
    draft.tag = 'Perso';
    $('#b-name').value = draft.name;
    renderBuilder();
    show('builder');
  }
  function renderBuilder() {
    const ol = $('#b-list'); ol.innerHTML = '';
    draft.steps.forEach(([id, sec], i) => {
      const e = B.stretches[id];
      const li = document.createElement('li');
      li.innerHTML = `<div class="fig-wrap"></div><div><b>${esc(e.name)}</b><div class="moves"><button data-a="up">↑</button><button data-a="down">↓</button><button data-a="del">Retirer</button></div></div>` +
        `<div class="ctrl"><button class="mini" data-a="minus">−</button><span class="sec">${sec} s${e.sides ? '<br><small>×2</small>' : ''}</span><button class="mini" data-a="plus">+</button></div>`;
      li.querySelector('.fig-wrap').innerHTML = B.figure.svgFor(cover(e));
      li.querySelector('.fig-wrap').onclick = () => openExercise(id);
      li.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => {
        const a = b.dataset.a, st = draft.steps;
        if (a === 'plus') st[i][1] = Math.min(180, st[i][1] + 5);
        if (a === 'minus') st[i][1] = Math.max(10, st[i][1] - 5);
        if (a === 'up' && i > 0) [st[i - 1], st[i]] = [st[i], st[i - 1]];
        if (a === 'down' && i < st.length - 1) [st[i + 1], st[i]] = [st[i], st[i + 1]];
        if (a === 'del') st.splice(i, 1);
        renderBuilder();
      }));
      ol.appendChild(li);
    });
    const tot = draft.steps.length ? B.sessionSeconds(draft) : 0;
    $('#b-total').textContent = draft.steps.length ? fmtMin(tot) + ' · ' + draft.steps.length + ' exercices' : 'Ajoute des exercices pour commencer.';
    // conseils d'expert sur la construction
    const adv = [];
    const st = draft.steps.map(([id]) => B.stretches[id]);
    const firstStat = st.findIndex((e) => e.type === 'stat'), firstDyn = st.findIndex((e) => e.type === 'dyn');
    if (firstStat === 0 && st.some((e) => e.type === 'stat' && e.level >= 2)) adv.push('Commence par un ou deux exercices de mobilité pour échauffer avant les maintiens profonds.');
    if (firstDyn > firstStat && firstStat >= 0 && firstDyn >= 0) adv.push('Place plutôt la mobilité au début de la séance.');
    if (draft.steps.some(([, s], i) => st[i].type === 'stat' && s < 20)) adv.push('Un maintien de souplesse est plus efficace à partir de 20 à 30 s.');
    $('#b-advice').textContent = adv.join(' ');
  }
  function saveDraft() {
    draft.name = $('#b-name').value.trim() || 'Ma séance';
    if (!draft.steps.length) return toast('Ajoute au moins un exercice');
    const list = store.data.custom, i = list.findIndex((c) => c.id === draft.id);
    if (i >= 0) list[i] = draft; else list.unshift(draft);
    store.save(); toast('Séance enregistrée');
    openDetail(draft);
  }

  /* ================= LECTEUR ================= */
  let peekAnim = null;
  const P = { phases: [], i: 0, start: 0, pausedAt: 0, paused: false, timer: 0, lastSec: -1, half: false, anim: null, total: 0, pnf: false };

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
    initAudio(); keepAwake();
    P.phases = buildPhases(current);
    P.total = P.phases.reduce((a, p) => a + p.sec, 0);
    P.pnf = !!S.pnf;
    P.anim = P.anim || new B.figure.Animator($('#fig'));
    show('player');
    enterPhase(0);
    clearInterval(P.timer); P.timer = setInterval(tick, 200);
  }
  function pnfStage(ph, t) {
    const ex = B.stretches[ph.id];
    if (!P.pnf || !ex.pnf || ph.kind !== 'work' || ph.sec < 30) return 0;
    const a = Math.round(ph.sec * 0.4);
    return t < a ? 1 : t < a + 5 ? 2 : 3;
  }
  function phaseLabel(ph, ex, stage) {
    const sideTxt = ph.side ? 'Côté ' + ph.side : '';
    if (ph.kind === 'prep') return 'Prépare-toi' + (sideTxt ? ' · ' + sideTxt.toLowerCase() : '');
    if (ph.kind === 'switch') return 'Change de côté';
    if (stage === 2) return 'Contracte doucement';
    if (stage === 3) return 'Relâche, va plus loin';
    return sideTxt || (ex.type === 'dyn' ? 'En mouvement' : 'Maintiens');
  }
  function enterPhase(i) {
    P.i = i; P.start = performance.now(); P.lastSec = -1; P.half = false; P.stage = 0; P.ten = false;
    if (P.paused) P.pausedAt = P.start;
    const ph = P.phases[i], ex = B.stretches[ph.id];
    $('#counter').textContent = ph.step + 1 + '/' + current.steps.length;
    $('#ex-name').textContent = ex.name;
    $('#ex-zone').textContent = ex.zones.slice(0, 2).map((z) => B.ZONES[z]).join(' · ') + (ex.type === 'dyn' ? ' · mobilité' : ' · souplesse');
    $('#cue').textContent = ex.cue;
    $('#phase').textContent = phaseLabel(ph, ex, 0);
    $('#phase').classList.remove('pnf');
    $('#view-player').classList.toggle('prep', ph.kind !== 'work');
    const nxt = current.steps[ph.step + 1];
    $('#next-up').textContent = nxt ? 'Ensuite : ' + B.stretches[nxt[0]].name : 'Dernier exercice';
    P.anim.set(ex.anim, ph.side === 'droit'); P.anim.pause(P.paused);
    $('#peek').hidden = true; P.peek = false;
    $('#banner').hidden = ph.kind !== 'switch';
    const stage = $('.stage'); stage.classList.remove('flash'); void stage.offsetWidth; stage.classList.add('flash');
    if (ph.kind === 'prep') speak((ph.side ? 'Côté ' + ph.side + '. ' : '') + ex.name + '. ' + ex.cue, true);
    else if (ph.kind === 'switch') { speak('Change de côté.', true); beep(660, 0.15); }
    else beep(990, 0.35, 0.3);
    renderTime(ph.sec);
  }
  const elapsed = () => ((P.paused ? P.pausedAt : performance.now()) - P.start) / 1000;
  function tick() {
    const ph = P.phases[P.i];
    if (!ph) return;
    const t = elapsed(), left = Math.max(0, ph.sec - t), sec = Math.ceil(left), ex = B.stretches[ph.id];
    // contracter-relâcher
    const stg = pnfStage(ph, t);
    if (stg !== P.stage) {
      if (stg >= 2 && !P.paused) {
        $('#phase').textContent = phaseLabel(ph, ex, stg); $('#phase').classList.add('pnf');
        $('#cue').textContent = stg === 2 ? ex.pnf + ' Sans bouger, environ 30 % de ta force.' : 'Relâche complètement, expire, et avance doucement dans l\'étirement.';
        beep(stg === 2 ? 520 : 780, 0.2); speak(stg === 2 ? 'Contracte doucement.' : 'Relâche, et va un peu plus loin.', true);
      }
      P.stage = stg;
    }
    if (sec !== P.lastSec) {
      P.lastSec = sec;
      if (!P.paused && sec <= 3 && sec >= 1) beep(ph.kind === 'work' ? 740 : 600, 0.1);
      if (!P.paused && ph.kind === 'work' && !P.half && ph.sec >= 30 && left <= ph.sec / 2 && !stg) {
        P.half = true; speak(ex.type === 'stat' ? 'Respire profondément, relâche.' : 'Continue, à mi-parcours.');
      }
      if (!P.paused && ph.kind === 'work' && ph.sec >= 30 && sec === 10 && !P.ten) { P.ten = true; speak('Encore dix secondes.'); }
    }
    const nx = P.phases[P.i + 1];
    if (ph.kind === 'work' && nx && left <= 5 && !P.peek) {
      P.peek = true;
      const nex = B.stretches[nx.id];
      $('#peek-label').textContent = nx.id === ph.id ? 'Ensuite · côté ' + nx.side : 'Ensuite';
      $('#peek').hidden = false;
      peekAnim = peekAnim || new B.figure.Animator($('#peek-fig'));
      peekAnim.set(nex.anim, nx.side === 'droit'); peekAnim.pause(P.paused);
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
  function next() { if (P.i + 1 >= P.phases.length) return finish(); enterPhase(P.i + 1); }
  function prev() {
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
    P.anim && P.anim.pause(p); peekAnim && peekAnim.pause(p);
    $('#view-player').classList.toggle('paused', p);
    $('#ico-pause').hidden = p; $('#ico-play').hidden = !p;
    $('#btn-play').setAttribute('aria-label', p ? 'Reprendre' : 'Pause');
  }
  function stopSession() {
    clearInterval(P.timer); P.timer = 0;
    synth && synth.cancel();
    P.anim && P.anim.stop(); peekAnim && peekAnim.stop();
    releaseAwake(); setPaused(false);
  }
  function finish() {
    const secs = Math.round(P.total);
    stopSession();
    store.data.history.push({ date: new Date().toISOString(), id: current.id, name: current.name, seconds: secs, steps: current.steps });
    store.save();
    speak('Séance terminée. Bravo !', true);
    beep(880, 0.15); setTimeout(() => beep(1175, 0.3), 180);
    $('#done-meta').textContent = current.name + ' · ' + fmtMin(secs) + ' · ' + current.steps.length + ' exercices';
    $('#done-fig').innerHTML = B.figure.svgFor({ hip: [60, 50], a1: 145, f1: 160, a2: 215, f2: 200 });
    show('done');
  }

  /* ================= RÉGLAGES ================= */
  function fillVoices() {
    const sel = $('#set-voice-name'), vs = frVoices();
    sel.innerHTML = vs.length ? '' : '<option value="">Aucune voix française trouvée</option>';
    vs.forEach((v) => { const o = document.createElement('option'); o.value = v.voiceURI; o.textContent = v.name + ' (' + v.lang + ')'; sel.appendChild(o); });
    const cur = pickVoice(); if (cur) sel.value = cur.voiceURI;
  }
  const LEVEL_HINT = {
    1: 'Maintiens de 30 s, exercices accessibles. Idéal pour démarrer et installer l\'habitude.',
    2: 'Maintiens de 45 s, plus d\'exercices actifs, accès au contracter-relâcher.',
    3: 'Maintiens de 60 s, grands écarts et pont complet. À réserver si tu t\'étires déjà régulièrement.',
  };
  function renderLevel() {
    chips($('#set-level'), [[1, 'Débutant'], [2, 'Intermédiaire'], [3, 'Avancé']], S.level, (v) => { S.level = +v; store.save(); renderLevel(); renderComposer(); });
    $('#level-hint').textContent = LEVEL_HINT[S.level];
  }
  function openSettings() {
    renderLevel();
    $('#set-pnf').checked = S.pnf;
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
    $('#set-pnf').onchange = (e) => { S.pnf = e.target.checked; save(); };
    $('#set-voice').onchange = (e) => { S.voice = e.target.checked; save(); };
    $('#set-voice-name').onchange = (e) => { S.voiceURI = e.target.value; save(); };
    $('#set-rate').oninput = (e) => { S.rate = +e.target.value; $('#rate-out').textContent = S.rate.toFixed(2); save(); };
    $('#set-beeps').onchange = (e) => { S.beeps = e.target.checked; save(); };
    $('#set-music').onchange = (e) => { S.music = e.target.value; save(); };
    $('#btn-test-voice').onclick = () => {
      initAudio(); const was = S.voice; S.voice = true;
      speak('Bonjour Ethan. Fente basse, côté gauche. Avance doucement le bassin vers l\'avant.', true);
      S.voice = was; beep(740, 0.1);
    };
    if (synth) synth.onvoiceschanged = () => { if (!$('#settings').hidden) fillVoices(); };
  }

  /* ================= ÉVÉNEMENTS ================= */
  $('#btn-generate').onclick = () => openDetail(generate(store.data.gen));
  $('#btn-regen').onclick = () => openDetail(generate(current.params));
  $('#btn-save-gen').onclick = () => {
    const c = JSON.parse(JSON.stringify(current));
    c.id = 'c' + Date.now(); delete c.generated; delete c.params; c.tag = 'Perso';
    c.name = current.name + ' ' + current.params.min + ' min';
    store.data.custom.unshift(c); store.save(); toast('Ajoutée à tes séances'); openDetail(c);
  };
  $('#btn-edit').onclick = () => openBuilder(current);
  $('#btn-delete').onclick = () => {
    store.data.custom = store.data.custom.filter((c) => c.id !== current.id); store.save();
    toast('Séance supprimée'); renderHome(); show('home');
  };
  $('#btn-new').onclick = () => openBuilder(null);
  $('#btn-library').onclick = () => { pickMode = null; openLibrary(); };
  $('#btn-lib-back').onclick = () => { if (pickMode) { pickMode = null; renderBuilder(); show('builder'); } else { renderHome(); show('home'); } };
  $('#btn-b-back').onclick = () => { renderHome(); show('home'); };
  $('#btn-b-add').onclick = () => {
    draft.name = $('#b-name').value;
    pickMode = (id) => { const e = B.stretches[id]; draft.steps.push([id, e.type === 'dyn' ? (e.sides ? 25 : 30) : B.LEVELS[S.level].hold]); toast(e.name + ' ajouté'); };
    openLibrary();
  };
  $('#btn-b-save').onclick = saveDraft;
  $('#btn-ex-close').onclick = closeExercise;
  $('#exsheet').onclick = (e) => { if (e.target.id === 'exsheet') closeExercise(); };
  $('#ex-name').onclick = () => { const ph = P.phases[P.i]; if (ph) openExercise(ph.id); };

  $('#btn-start').onclick = startSession;
  $('#btn-play').onclick = () => setPaused(!P.paused);
  $('#btn-next').onclick = () => { if (P.phases[P.i]) next(); };
  $('#btn-prev').onclick = prev;
  const quit = () => { $('#confirm').hidden = true; stopSession(); renderHome(); show('home'); };
  $('#btn-close').onclick = () => {
    if (P.i < 2) return quit();
    P.wasPaused = P.paused; setPaused(true); $('#confirm').hidden = false;
  };
  $('#btn-confirm-quit').onclick = quit;
  $('#btn-confirm-stay').onclick = () => { $('#confirm').hidden = true; if (!P.wasPaused) setPaused(false); };
  document.querySelectorAll('[data-back]').forEach((b) => (b.onclick = () => { renderHome(); show('home'); }));
  document.querySelectorAll('[data-home]').forEach((b) => (b.onclick = () => { renderHome(); show('home'); }));

  document.addEventListener('visibilitychange', () => {
    if (!P.timer) return;
    if (document.hidden) setPaused(true);
    else { keepAwake(); P.anim && P.anim.start(); }
  });

  bindSettings();
  renderHome();
  if (synth) synth.getVoices();
  window.BordApp = { generate }; // pour les tests
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
