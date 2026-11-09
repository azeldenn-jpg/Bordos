/* Bord'os — moteur du personnage (petit dragon humanoïde, SVG, vue de profil) */
(function (G) {
  const B = (G.Bord = G.Bord || {});

  // Squelette (unités du viewBox). Angle a : 0 = bas, 90 = avant, 180 = haut, -90 = arrière
  const L = { torso: 30, ua: 15, fa: 14, th: 21, sh: 21, foot: 6 };
  const GROUND = 92;
  const VIEW = '0 -14 120 114';

  const dir = (a) => { const r = (a * Math.PI) / 180; return [Math.sin(r), Math.cos(r)]; };
  const step = (p, a, len) => { const d = dir(a); return [p[0] + d[0] * len, p[1] + d[1] * len]; };
  const add = (p, a, k) => { const d = dir(a); return [p[0] + d[0] * k, p[1] + d[1] * k]; };
  const f = (n) => n.toFixed(1);

  const DEFAULT = { hip: [60, 50], t: 180, n: 180, a1: 0, f1: 0, a2: 0, f2: 0, l1: 0, k1: 0, l2: 0, k2: 0, p1: 90, p2: 90, arch: 0 };

  // Couleurs (variables CSS, voir style.css)
  const C = { body: 'var(--dr)', shade: 'var(--dr2)', belly: 'var(--drb)', horn: 'var(--drh)', wing: 'var(--drw)', wing2: 'var(--drw2)', eye: 'var(--dre)', blush: 'var(--drk)' };

  const line = (a, b, w, c) => `<line x1="${f(a[0])}" y1="${f(a[1])}" x2="${f(b[0])}" y2="${f(b[1])}" style="stroke:${c};stroke-width:${w}" stroke-linecap="round"/>`;
  const dot = (p, r, c) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="${r}" style="fill:${c}"/>`;
  // Groupe orienté : le « haut » local suit la direction a
  const at = (p, a, inner) => `<g transform="translate(${f(p[0])} ${f(p[1])}) rotate(${f(180 - a)})">${inner}</g>`;

  const HEAD = (blink) =>
    // cornes
    `<path d="M-3 -7.5 C-5 -12 -8 -15 -12 -16 C-9.5 -13 -8 -10 -7.5 -6 Z" style="fill:${C.horn}"/>` +
    `<path d="M1 -8.5 C0 -13 -2 -16 -5 -18 C-3.5 -14.5 -3 -11 -3 -7.5 Z" style="fill:${C.horn}"/>` +
    // crête
    `<path d="M-8.6 -3 L-12 -1 L-8.8 1 Z M-7.5 2.5 L-10.5 5 L-7 5.5 Z" style="fill:${C.shade}"/>` +
    // crâne + museau
    `<circle r="9" style="fill:${C.body}"/>` +
    `<ellipse cx="7.5" cy="3" rx="6.5" ry="4.8" style="fill:${C.body}"/>` +
    `<ellipse cx="7.5" cy="5.6" rx="5" ry="2.2" style="fill:${C.belly}"/>` +
    `<circle cx="11.8" cy="1.3" r="0.8" style="fill:${C.eye}"/>` +
    // joue + œil
    `<ellipse cx="2" cy="4.5" rx="2.1" ry="1.3" style="fill:${C.blush}" opacity=".7"/>` +
    (blink
      ? `<path d="M1.2 -1.5 Q3 -0.2 4.8 -1.5" style="stroke:${C.eye};stroke-width:1;fill:none" stroke-linecap="round"/>`
      : `<ellipse cx="3" cy="-1.5" rx="2.1" ry="2.6" style="fill:${C.eye}"/><circle cx="3.8" cy="-2.5" r="0.85" fill="#fff"/>`);

  const WING = `<path d="M0 0 C-2 -9 -9 -15 -17 -15 C-15 -12 -15 -10 -13 -8 C-15 -7 -15 -5 -13 -3 C-15 -2 -14 0 -11 1 Z"/>`;
  const SPIKE = `<path d="M0 -2.2 L-3.8 0 L0 2.2 Z" style="fill:${C.shade}"/>`;
  const TIP = `<path d="M0 -4.5 L3.2 0.8 L0 -0.4 L-3.2 0.8 Z" style="fill:${C.shade}"/>`;

  function svgInner(pose, time) {
    if (pose.view === 'front') return svgFront(pose, time || 0);
    const P = Object.assign({}, DEFAULT, pose);
    const T = time || 0;
    const fw = P.t - 90, bk = P.t + 90; // avant / arrière du buste
    const hip = P.hip, sho = step(hip, P.t, L.torso);
    const head = step(sho, P.n, 13);
    const e1 = step(sho, P.a1, L.ua), h1 = step(e1, P.f1, L.fa);
    const e2 = step(sho, P.a2, L.ua), h2 = step(e2, P.f2, L.fa);
    const kn1 = step(hip, P.l1, L.th), an1 = step(kn1, P.k1, L.sh), to1 = step(an1, P.p1, L.foot);
    const kn2 = step(hip, P.l2, L.th), an2 = step(kn2, P.k2, L.sh), to2 = step(an2, P.p2, L.foot);
    let s = '';

    // Queue (balancement léger)
    let ang = P.tail != null ? P.tail : P.t + 140, p = add(hip, bk, 4);
    const curl = P.curl != null ? P.curl : -12;
    for (let i = 0; i < 8; i++) {
      ang += curl + 5 * Math.sin(T / 650 + i * 0.6);
      const q = step(p, ang, 4.6);
      s += line(p, q, 9 - i * 0.95, C.body);
      p = q;
    }
    s += at(p, ang, TIP);

    // Ailes (derrière le buste, petit battement)
    const wb = add(add(hip, P.t, 21), bk, 5);
    const flap = 6 * Math.sin(T / 420);
    s += `<g style="fill:${C.wing2}">${at(add(wb, P.t, 2), P.t + 18 + flap, WING)}</g>`;
    s += `<g style="fill:${C.wing}">${at(wb, P.t + flap, WING)}</g>`;

    // Membres du côté éloigné
    s += line(sho, e2, 6.5, C.shade) + line(e2, h2, 5.4, C.shade) + dot(h2, 3, C.shade);
    s += line(hip, kn2, 10, C.shade) + line(kn2, an2, 7.5, C.shade) + line(an2, to2, 6, C.shade);

    // Buste (courbe si le dos s'arrondit ou se creuse) + ventre + piquants
    const arch = P.arch || 0;
    const mid = add(add(hip, P.t, L.torso / 2), bk, arch);
    const ctrl = [2 * mid[0] - (hip[0] + sho[0]) / 2, 2 * mid[1] - (hip[1] + sho[1]) / 2];
    const qp = (u) => [(1 - u) * (1 - u) * hip[0] + 2 * u * (1 - u) * ctrl[0] + u * u * sho[0], (1 - u) * (1 - u) * hip[1] + 2 * u * (1 - u) * ctrl[1] + u * u * sho[1]];
    const curve = (o, w, c) => { const a = add(hip, fw, o), b = add(sho, fw, o * 0.9), k = add(ctrl, fw, o); return `<path d="M${f(a[0])} ${f(a[1])} Q${f(k[0])} ${f(k[1])} ${f(b[0])} ${f(b[1])}" style="stroke:${c};stroke-width:${w};fill:none" stroke-linecap="round"/>`; };
    s += curve(0, 17, C.body);
    s += curve(4, 8, C.belly);
    for (let i = 1; i <= 3; i++) {
      const m = qp(i / 4);
      s += line(add(m, fw, 0.8), add(m, fw, 6.5), 0.8, C.shade);
      s += at(add(m, bk, 8), P.t, SPIKE);
    }

    // Tête (clignement de temps en temps)
    s += at(head, P.n, HEAD(T % 4200 < 140));

    // Membres du côté proche
    s += line(hip, kn1, 10, C.body) + line(kn1, an1, 7.5, C.body) + line(an1, to1, 6, C.body);
    s += dot(add(to1, P.p1, 1.5), 1.3, C.horn);
    if (P.strap) s += line(h1, an1, 1.4, C.horn);
    s += line(sho, e1, 6.5, C.body) + line(e1, h1, 5.4, C.body) + dot(h1, 3.1, C.body) + dot(add(h1, P.f1, 3), 1.1, C.horn);
    return s;
  }


  /* ---------- Vue de face ---------- */
  const FDEF = { hip: [60, 50], t: 180, n: 180, aL: -14, fL: -10, aR: 14, fR: 10, lL: -4, kL: -2, lR: 4, kR: 2, tl: 1 };
  const HEAD_F = (blink) =>
    `<path d="M-5 -7 C-7 -12 -10 -15 -13 -17 C-11.5 -13 -10.5 -10 -8.5 -5.5 Z M5 -7 C7 -12 10 -15 13 -17 C11.5 -13 10.5 -10 8.5 -5.5 Z" style="fill:${C.horn}"/>` +
    `<path d="M-8.8 -1 L-12.5 1 L-8.8 3 Z M8.8 -1 L12.5 1 L8.8 3 Z" style="fill:${C.shade}"/>` +
    `<circle r="9" style="fill:${C.body}"/>` +
    `<ellipse cy="4.2" rx="5.6" ry="4" style="fill:${C.body}"/><ellipse cy="6.4" rx="4" ry="1.8" style="fill:${C.belly}"/>` +
    `<circle cx="-1.7" cy="3" r="0.7" style="fill:${C.eye}"/><circle cx="1.7" cy="3" r="0.7" style="fill:${C.eye}"/>` +
    `<ellipse cx="-6" cy="3.6" rx="1.8" ry="1.1" style="fill:${C.blush}" opacity=".7"/><ellipse cx="6" cy="3.6" rx="1.8" ry="1.1" style="fill:${C.blush}" opacity=".7"/>` +
    (blink
      ? `<path d="M-5.4 -1.5 Q-3.6 -0.3 -1.8 -1.5 M1.8 -1.5 Q3.6 -0.3 5.4 -1.5" style="stroke:${C.eye};stroke-width:1;fill:none" stroke-linecap="round"/>`
      : `<ellipse cx="-3.6" cy="-1.5" rx="1.9" ry="2.4" style="fill:${C.eye}"/><ellipse cx="3.6" cy="-1.5" rx="1.9" ry="2.4" style="fill:${C.eye}"/><circle cx="-3" cy="-2.4" r="0.75" fill="#fff"/><circle cx="4.2" cy="-2.4" r="0.75" fill="#fff"/>`);

  function svgFront(pose, T) {
    const P = Object.assign({}, FDEF, pose);
    const lft = P.t + 90, rgt = P.t - 90;
    const hip = P.hip, sho = step(hip, P.t, 28 * P.tl);
    const hipL = add(hip, lft, 5.5), hipR = add(hip, rgt, 5.5);
    const shL = add(sho, lft, 8), shR = add(sho, rgt, 8);
    const head = step(sho, P.n, 12 + 2 * P.tl);
    const eL = step(shL, P.aL, L.ua), hL = step(eL, P.fL, L.fa), eR = step(shR, P.aR, L.ua), hR = step(eR, P.fR, L.fa);
    const kL = step(hipL, P.lL, L.th), anL = step(kL, P.kL, L.sh), kR = step(hipR, P.lR, L.th), anR = step(kR, P.kR, L.sh);
    let s = '';
    // queue qui dépasse derrière
    let ang = P.tail != null ? P.tail : P.t - 150, p = add(hip, P.t, -2);
    for (let i = 0; i < 7; i++) { ang += 14 + 5 * Math.sin(T / 650 + i * 0.6); const q = step(p, ang, 4.4); s += line(p, q, 7.5 - i * 0.85, C.shade); p = q; }
    s += at(p, ang, TIP);
    // ailes
    const flap = 6 * Math.sin(T / 420), wy = add(sho, P.t, -6);
    s += `<g style="fill:${C.wing}">${at(add(wy, lft, 4), P.t + 30 + flap, WING)}${at(add(wy, rgt, 4), P.t - 30 - flap, '<g transform="scale(-1 1)">' + WING + '</g>')}</g>`;
    // jambes
    const leg = (h, k, a, side) => line(h, k, 10, C.body) + line(k, a, 7.5, C.body) + line(a, add(a, side < 0 ? P.kL - 75 : P.kR + 75, 3.5), 6.5, C.body) + dot(add(a, side < 0 ? P.kL - 75 : P.kR + 75, 5.5), 1.2, C.horn);
    s += leg(hipL, kL, anL, -1) + leg(hipR, kR, anR, 1);
    // buste
    s += line(hip, sho, 21, C.body);
    s += line(add(hip, P.t, 1), add(sho, P.t, -2), 10, C.belly);
    for (let i = 1; i <= 3; i++) { const m = add(hip, P.t, (28 * P.tl * i) / 4); s += line(add(m, lft, 4.5), add(m, rgt, 4.5), 0.8, C.shade); }
    // tête
    s += at(head, P.n, HEAD_F(T % 4200 < 140));
    // bras
    s += line(shL, eL, 6.5, C.body) + line(eL, hL, 5.4, C.body) + dot(hL, 3.1, C.body);
    s += line(shR, eR, 6.5, C.body) + line(eR, hR, 5.4, C.body) + dot(hR, 3.1, C.body);
    return s;
  }

  // Interpolation entre deux poses (toutes les clés numériques)
  function lerpPose(A0, B0, u) {
    const D = A0.view === 'front' ? FDEF : DEFAULT;
    const A = Object.assign({}, D, A0), Bp = Object.assign({}, D, B0);
    const o = Object.assign({}, A);
    for (const k in Bp) {
      const a = A[k], b = Bp[k];
      if (Array.isArray(b) && Array.isArray(a)) o[k] = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
      else if (typeof b === 'number' && typeof a === 'number') o[k] = a + (b - a) * u;
      else if (a === undefined) o[k] = b;
    }
    return o;
  }
  const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);

  function poseAt(anim, t) {
    const fr = anim.frames, n = fr.length;
    t = Math.max(0, t || 0);
    if (n === 1) return fr[0];
    const d = anim.dur || 1500;
    if (anim.mode === 'cycle') {
      const total = (n - 1) * d, x = t % total, i = Math.floor(x / d);
      return lerpPose(fr[i], fr[i + 1], anim.linear ? (x % d) / d : ease((x % d) / d));
    }
    const total = (n - 1) * 2 * d, x = t % total;
    let i = Math.floor(x / d);
    const u = ease((x % d) / d);
    if (i < n - 1) return lerpPose(fr[i], fr[i + 1], u);
    i -= n - 1;
    return lerpPose(fr[n - 1 - i], fr[n - 2 - i], u);
  }

  function svgFor(pose, mirror, time) {
    const tr = mirror ? ' transform="translate(120 0) scale(-1 1)"' : '';
    return `<svg viewBox="${VIEW}" class="figure" aria-hidden="true"><line class="fig-ground" x1="6" y1="${GROUND + 4}" x2="114" y2="${GROUND + 4}"/><g${tr}>${svgInner(pose, time == null ? 1000 : time)}</g></svg>`;
  }

  // Animateur : ~30 i/s, s'arrête hors écran, se met en pause
  class Animator {
    constructor(el) { this.el = el; this.anim = null; this.raf = 0; this.last = 0; this.clock = 0; this.prev = 0; this.paused = false; }
    set(anim, mirror) {
      this.anim = anim; this.mirror = !!mirror; this.clock = 0; this.prev = performance.now();
      this.el.innerHTML = svgFor(anim.frames[0], this.mirror, 0);
      this.g = this.el.querySelector('svg > g');
      this.draw();
      this.start();
    }
    draw() { this.g.innerHTML = svgInner(poseAt(this.anim, this.clock), this.clock); }
    pause(p) { this.paused = p; if (!p) { this.prev = performance.now(); this.start(); } }
    start() { if (!this.raf && this.anim && !this.paused) { this.prev = performance.now(); this.raf = requestAnimationFrame(this.tick.bind(this)); } }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
    tick(now) {
      this.raf = 0;
      if (!this.el.isConnected || document.hidden || this.paused) return;
      this.clock += Math.max(0, now - this.prev); this.prev = now;
      if (now - this.last > 32) { this.last = now; this.draw(); }
      this.raf = requestAnimationFrame(this.tick.bind(this));
    }
  }

  B.figure = { svgFor, poseAt, Animator, GROUND };
})(typeof window !== 'undefined' ? window : globalThis);
