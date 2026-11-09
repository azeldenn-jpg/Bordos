/* Bord'os — onglet Progrès : régularité, bilan de mobilité, volume, photos, historique */
(function () {
  const B = window.Bord, A = B.app, $ = (s) => document.querySelector(s), esc = A.esc;
  const store = A.store, DAY = 86400000;
  const monday = (d = new Date()) => { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };

  /* ---------- Semaine ---------- */
  function renderWeek() {
    const m = monday(), hist = store.data.history, days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let html = '', secs = 0, n = 0;
    for (let i = 0; i < 7; i++) {
      const d0 = m.getTime() + i * DAY, d1 = d0 + DAY;
      const on = hist.some((h) => { const t = Date.parse(h.date); return t >= d0 && t < d1; });
      html += `<div>${days[i]}<i class="${on ? 'on' : ''} ${d0 === today.getTime() ? 'today' : ''}"></i></div>`;
    }
    hist.forEach((h) => { if (Date.parse(h.date) >= m.getTime()) { secs += h.seconds || 0; n++; } });
    $('#week').innerHTML = html;
    // régularité sur 4 semaines
    const since = Date.now() - 28 * DAY, active = new Set(hist.filter((h) => Date.parse(h.date) >= since).map((h) => h.date.slice(0, 10))).size;
    $('#week-sum').textContent = (n ? n + ' séance' + (n > 1 ? 's' : '') + ' · ' + Math.round(secs / 60) + ' min cette semaine' : 'Pas encore de séance cette semaine') + ' · ' + active + ' jour' + (active > 1 ? 's' : '') + ' actif' + (active > 1 ? 's' : '') + ' sur les 4 dernières semaines (idéal : 5 par semaine).';
  }

  /* ---------- Volume par zone (étirements statiques, docs/savoir.md §3) ---------- */
  function renderVolume() {
    const m = monday().getTime(), vol = {};
    store.data.history.filter((h) => Date.parse(h.date) >= m && h.steps).forEach((h) => h.steps.forEach(([id, sec]) => {
      const e = B.stretches[id]; if (!e || e.type !== 'stat' || e.relax) return;
      e.zones.forEach((z, i) => (vol[z] = (vol[z] || 0) + sec * (i === 0 ? 1 : 0.5)));
    }));
    const zones = Object.keys(B.ZONES).filter((z) => z !== 'detente');
    const rows = zones.map((z) => [z, vol[z] || 0]).sort((a, b) => b[1] - a[1]);
    $('#volume').innerHTML = rows.map(([z, v]) => {
      const pct = Math.min(100, (v / 600) * 100);
      return `<div class="bar-row"><span>${esc(B.ZONES[z])}</span><div class="bar"><b class="${pct >= 100 ? 'full' : ''}" style="width:${pct}%"></b></div><span>${Math.round(v / 60)}/10</span></div>`;
    }).join('');
  }

  /* ---------- Bilan de mobilité ---------- */
  function spark(values) {
    if (values.length < 2) return '';
    const w = 46, h = 18, mn = Math.min(...values), mx = Math.max(...values), r = mx - mn || 1;
    const pts = values.map((v, i) => `${((i / (values.length - 1)) * (w - 4) + 2).toFixed(1)},${(h - 2 - ((v - mn) / r) * (h - 4)).toFixed(1)}`).join(' ');
    return `<svg class="spark" viewBox="0 0 ${w} ${h}"><polyline points="${pts}"/></svg>`;
  }
  function renderScores() {
    const tests = store.data.tests;
    if (!tests.length) {
      $('#scores').innerHTML = '<p class="muted">Fais ton premier bilan : 10 minutes, 7 petits tests. Il sert de point de départ, et l\'objectif « Mes points faibles » s\'en servira pour composer tes séances.</p>';
      $('#test-when').textContent = '';
      return;
    }
    const sc = A.lastScores(), zs = Object.keys(sc);
    const global = Math.round(zs.reduce((a, z) => a + sc[z], 0) / zs.length);
    const last = Math.max(...tests.map((t) => t.date)), days = Math.floor((Date.now() - last) / DAY);
    $('#test-when').textContent = 'Dernier bilan ' + (days === 0 ? 'aujourd\'hui' : 'il y a ' + days + ' jour' + (days > 1 ? 's' : '')) + (days >= 14 ? ' · c\'est le bon moment pour en refaire un.' : ' · refais-le toutes les 2 à 4 semaines.');
    let html = `<div class="score-head"><b>${global}</b><span class="muted">score global sur 100</span></div>`;
    zs.sort((a, b) => sc[a] - sc[b]).forEach((z) => {
      // évolution : score moyen de la zone à chaque date de bilan
      const dates = [...new Set(tests.filter((t) => B.TESTS.find((x) => x.id === t.test).zone === z).map((t) => t.day))].sort();
      const series = dates.map((d) => { const r = tests.filter((t) => t.day === d && B.TESTS.find((x) => x.id === t.test).zone === z); return r.reduce((a, b) => a + b.score, 0) / r.length; });
      html += `<div class="bar-row"><span>${esc(B.TEST_ZONES[z])}</span><div class="bar"><b style="width:${sc[z]}%"></b></div><span>${sc[z]} ${spark(series)}</span></div>`;
      // asymétrie gauche / droite (> 15 %)
      B.TESTS.filter((t) => t.zone === z && t.sides).forEach((t) => {
        const r = tests.filter((x) => x.test === t.id).sort((a, b) => b.date - a.date)[0];
        if (r && r.left != null && r.right != null) {
          const a = Math.abs(r.left - r.right), ref = Math.max(r.left, r.right, 1);
          if (a / ref > 0.15 && a >= 2) html += `<p class="asym">Écart gauche/droite : ${r.left} / ${r.right} ${t.unit}. Insiste un peu plus sur le côté le moins souple.</p>`;
        }
      });
    });
    $('#scores').innerHTML = html;
  }
  function openTests() {
    const form = $('#test-form'); form.innerHTML = '';
    B.TESTS.forEach((t) => {
      const prev = store.data.tests.filter((x) => x.test === t.id).sort((a, b) => b.date - a.date)[0];
      const card = document.createElement('div'); card.className = 'test-card'; card.dataset.id = t.id;
      let input = '';
      if (t.choices) input = `<div class="chips">${t.choices.map(([l, v]) => `<button class="chip-btn" data-v="${v}">${esc(l)}</button>`).join('')}</div>`;
      else if (t.sides) input = `<div class="num-in">Gauche <input inputmode="decimal" data-side="left" placeholder="${prev && prev.left != null ? prev.left : '–'}"> Droite <input inputmode="decimal" data-side="right" placeholder="${prev && prev.right != null ? prev.right : '–'}"> ${t.unit}</div>`;
      else input = `<div class="num-in"><input inputmode="decimal" data-side="one" placeholder="${prev ? prev.value : '–'}"> ${t.unit}</div>`;
      card.innerHTML = `<div class="t-head"><div class="fig-wrap">${B.figure.svgFor(A.cover(B.stretches[t.pose]))}</div><div><b>${esc(t.name)}</b><br><small class="muted">${esc(B.TEST_ZONES[t.zone])}${prev ? ' · dernier : ' + prev.score + '/100' : ''}</small></div></div><p>${esc(t.how)}</p><p class="ref">${esc(t.ref)}</p>${input}`;
      card.querySelectorAll('.chip-btn').forEach((b) => (b.onclick = () => { card.querySelectorAll('.chip-btn').forEach((x) => x.classList.remove('on')); b.classList.add('on'); }));
      form.appendChild(card);
    });
    $('#testsheet').hidden = false;
  }
  function saveTests() {
    const now = Date.now(), day = new Date().toISOString().slice(0, 10);
    let n = 0;
    document.querySelectorAll('#test-form .test-card').forEach((card) => {
      const t = B.TESTS.find((x) => x.id === card.dataset.id);
      const rec = { test: t.id, date: now, day };
      if (t.choices) {
        const on = card.querySelector('.chip-btn.on'); if (!on) return;
        rec.value = +on.dataset.v; rec.score = rec.value;
      } else {
        const num = (sel) => { const el = card.querySelector(sel); const v = el && el.value.trim().replace(',', '.'); return v === '' || v == null || isNaN(+v) ? null : +v; };
        if (t.sides) {
          rec.left = num('[data-side=left]'); rec.right = num('[data-side=right]');
          const vals = [rec.left, rec.right].filter((v) => v != null); if (!vals.length) return;
          rec.value = vals.reduce((a, b) => a + b, 0) / vals.length;
        } else { rec.value = num('[data-side=one]'); if (rec.value == null) return; }
        rec.score = B.testScore(t, rec.value);
      }
      store.data.tests.push(rec); n++;
    });
    if (!n) return A.toast('Remplis au moins un test');
    store.save(); $('#testsheet').hidden = true; A.toast('Bilan enregistré'); render(); A.renderComposer();
  }

  /* ---------- Photos (IndexedDB, restent sur l'appareil) ---------- */
  let dbp = null;
  const db = () => dbp || (dbp = new Promise((res, rej) => { const r = indexedDB.open('bordos-photos', 1); r.onupgradeneeded = () => r.result.createObjectStore('p', { keyPath: 'id' }); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }));
  const tx = async (mode, fn) => { const d = await db(); return new Promise((res, rej) => { const t = d.transaction('p', mode), st = t.objectStore('p'), out = fn(st); t.oncomplete = () => res(out && out.result); t.onerror = () => rej(t.error); }); };
  let urls = [], sel = [];
  async function renderPhotos() {
    urls.forEach((u) => URL.revokeObjectURL(u)); urls = [];
    let list = [];
    try { list = (await tx('readonly', (st) => st.getAll())) || []; } catch (e) { $('#photos').innerHTML = '<p class="muted">Photos indisponibles sur ce navigateur.</p>'; return; }
    list.sort((a, b) => b.date - a.date);
    const box = $('#photos'); box.innerHTML = '';
    if (!list.length) box.innerHTML = '<p class="muted" style="grid-column:1/-1">Prends une photo dans la même posture, au même endroit, toutes les 2 à 4 semaines.</p>';
    list.forEach((p) => {
      const u = URL.createObjectURL(p.blob); urls.push(u);
      const b = document.createElement('button'); b.dataset.id = p.id;
      b.innerHTML = `<img src="${u}" alt=""><span>${new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>`;
      b.onclick = () => {
        sel = sel.includes(p.id) ? sel.filter((x) => x !== p.id) : sel.concat(p.id).slice(-2);
        box.querySelectorAll('button').forEach((x) => x.classList.toggle('sel', sel.includes(+x.dataset.id)));
        if (sel.length === 2 || (sel.length === 1 && list.length === 1)) openCompare(list);
      };
      box.appendChild(b);
    });
  }
  function openCompare(list) {
    const ps = sel.map((id) => list.find((p) => p.id === id)).filter(Boolean).sort((a, b) => a.date - b.date);
    $('#compare').innerHTML = ps.map((p) => `<figure><img src="${URL.createObjectURL(p.blob)}" alt=""><figcaption>${new Date(p.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</figcaption></figure>`).join('');
    $('#btn-photo-del').onclick = async () => { const id = sel[sel.length - 1]; await tx('readwrite', (st) => st.delete(id)); sel = []; $('#photosheet').hidden = true; renderPhotos(); };
    $('#photosheet').hidden = false;
  }
  $('#photo-input').onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    const blob = await shrink(f);
    await tx('readwrite', (st) => st.put({ id: Date.now(), date: Date.now(), blob }));
    e.target.value = ''; A.toast('Photo ajoutée'); renderPhotos();
  };
  // réduit la photo (≈1200 px) pour ne pas remplir le téléphone
  function shrink(file) {
    return new Promise((res) => {
      const img = new Image(), u = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 1200 / Math.max(img.width, img.height)), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
        c.toBlob((b) => res(b || file), 'image/jpeg', 0.82);
      };
      img.onerror = () => res(file);
      img.src = u;
    });
  }
  $('#btn-photo-close').onclick = () => { $('#photosheet').hidden = true; sel = []; document.querySelectorAll('#photos button').forEach((x) => x.classList.remove('sel')); };

  /* ---------- Historique ---------- */
  function renderHistory() {
    const h = store.data.history.slice(-12).reverse();
    $('#history').innerHTML = h.length ? h.map((x) => `<li><span>${esc(x.name)}</span><small>${new Date(x.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })} · ${Math.max(1, Math.round((x.seconds || 0) / 60))} min</small></li>`).join('') : '<li><small>Tes séances terminées apparaîtront ici.</small></li>';
  }

  function render() { renderWeek(); renderScores(); renderVolume(); renderHistory(); renderPhotos(); }
  $('#btn-test').onclick = openTests;
  $('#btn-test-close').onclick = () => ($('#testsheet').hidden = true);
  $('#btn-test-save').onclick = saveTests;
  const prevTab = B.onTab;
  B.onTab = (t) => { if (prevTab) prevTab(t); if (t === 'progress') render(); };
  B.progress = { render };
})();
