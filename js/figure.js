/* Bord'os — moteur de silhouette animée (SVG, vue de profil) */
(function (G) {
  const B = (G.Bord = G.Bord || {});

  // Longueurs des segments (unités du viewBox 0 0 120 100)
  const L = { torso: 30, neck: 5, head: 7, ua: 15, fa: 14, th: 21, sh: 21, foot: 6 };
  const GROUND = 92;

  // Angle a (degrés) : 0 = vers le bas, 90 = vers l'avant (droite), 180 = vers le haut, -90 = vers l'arrière
  const dir = (a) => {
    const r = (a * Math.PI) / 180;
    return [Math.sin(r), Math.cos(r)];
  };
  const step = (p, a, len) => {
    const d = dir(a);
    return [p[0] + d[0] * len, p[1] + d[1] * len];
  };

  const DEFAULT = { hip: [60, 50], t: 180, n: 180, a1: 0, f1: 0, a2: 0, f2: 0, l1: 0, k1: 0, l2: 0, k2: 0, p1: 90, p2: 90 };

  function joints(pose) {
    const P = Object.assign({}, DEFAULT, pose);
    const hip = P.hip;
    const sho = step(hip, P.t, L.torso);
    const neck = step(sho, P.n, L.neck);
    const head = step(neck, P.n, L.head);
    const e1 = step(sho, P.a1, L.ua), h1 = step(e1, P.f1, L.fa);
    const e2 = step(sho, P.a2, L.ua), h2 = step(e2, P.f2, L.fa);
    const kn1 = step(hip, P.l1, L.th), an1 = step(kn1, P.k1, L.sh), to1 = step(an1, P.p1, L.foot);
    const kn2 = step(hip, P.l2, L.th), an2 = step(kn2, P.k2, L.sh), to2 = step(an2, P.p2, L.foot);
    return { hip, sho, neck, head, e1, h1, e2, h2, kn1, an1, to1, kn2, an2, to2 };
  }

  const pts = (...ps) => ps.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

  function svgInner(pose) {
    const j = joints(pose);
    const far = `<g class="fig-far"><polyline points="${pts(j.sho, j.e2, j.h2)}"/><polyline points="${pts(j.hip, j.kn2, j.an2, j.to2)}"/></g>`;
    const body = `<g class="fig-near"><polyline points="${pts(j.hip, j.sho, j.neck)}"/><circle cx="${j.head[0].toFixed(1)}" cy="${j.head[1].toFixed(1)}" r="${L.head}"/>` +
      `<polyline points="${pts(j.hip, j.kn1, j.an1, j.to1)}"/><polyline points="${pts(j.sho, j.e1, j.h1)}"/></g>`;
    return far + body;
  }

  // Interpolation entre deux poses
  function lerpPose(A, Bp, u) {
    const a = Object.assign({}, DEFAULT, A), b = Object.assign({}, DEFAULT, Bp), o = {};
    for (const k in a) {
      if (k === 'hip') o.hip = [a.hip[0] + (b.hip[0] - a.hip[0]) * u, a.hip[1] + (b.hip[1] - a.hip[1]) * u];
      else o[k] = a[k] + (b[k] - a[k]) * u;
    }
    return o;
  }
  const ease = (u) => 0.5 - 0.5 * Math.cos(Math.PI * u);

  // Pose à l'instant t (ms) pour une animation { frames, dur, mode }
  function poseAt(anim, t) {
    const fr = anim.frames, n = fr.length;
    if (n === 1) return fr[0];
    const d = anim.dur || 1500;
    if (anim.mode === 'cycle') {
      const segs = n - 1, total = segs * d, x = t % total, i = Math.floor(x / d);
      return lerpPose(fr[i], fr[i + 1], anim.linear ? (x % d) / d : ease((x % d) / d));
    }
    // pingpong : 0 → n-1 → 0
    const segs = (n - 1) * 2, total = segs * d, x = t % total;
    let i = Math.floor(x / d), u = ease((x % d) / d);
    if (i < n - 1) return lerpPose(fr[i], fr[i + 1], u);
    i = i - (n - 1);
    return lerpPose(fr[n - 1 - i], fr[n - 2 - i], u);
  }

  function svgFor(pose, mirror) {
    const tr = mirror ? ' transform="translate(120 0) scale(-1 1)"' : '';
    return `<svg viewBox="0 0 120 100" class="figure" aria-hidden="true"><line class="fig-ground" x1="6" y1="${GROUND + 3}" x2="114" y2="${GROUND + 3}"/><g${tr}>${svgInner(pose)}</g></svg>`;
  }

  // Animateur : ne tourne que si visible, ~30 i/s
  class Animator {
    constructor(el) { this.el = el; this.anim = null; this.raf = 0; this.last = 0; this.t0 = 0; this.mirror = false; }
    set(anim, mirror) {
      this.anim = anim; this.mirror = !!mirror; this.t0 = performance.now();
      this.el.innerHTML = svgFor(anim.frames[0], this.mirror);
      this.g = this.el.querySelector('svg > g');
      this.start();
    }
    start() { if (!this.raf && this.anim && this.anim.frames.length > 1) this.raf = requestAnimationFrame(this.tick.bind(this)); }
    stop() { cancelAnimationFrame(this.raf); this.raf = 0; }
    tick(now) {
      this.raf = 0;
      if (!this.el.isConnected || document.hidden) return;
      if (now - this.last > 32) {
        this.last = now;
        this.g.innerHTML = svgInner(poseAt(this.anim, now - this.t0));
      }
      this.raf = requestAnimationFrame(this.tick.bind(this));
    }
  }

  B.figure = { svgFor, poseAt, Animator, GROUND };
})(typeof window !== 'undefined' ? window : globalThis);
