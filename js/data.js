/* Bord'os — bibliothèque d'exercices (voir docs/savoir.md pour les sources) */
(function (G) {
  const B = (G.Bord = G.Bord || {});
  const S = (o) => Object.assign({ hip: [60, 50] }, o); // debout, de profil
  const F = (o) => Object.assign({ view: 'front', hip: [60, 50] }, o); // de face
  const LIE = { hip: [62, 86], t: -90, n: -90 }; // allongé sur le dos, tête à gauche
  const L = (o) => Object.assign({}, LIE, o);

  /*
   * type   : 'dyn' (mobilité, en mouvement) · 'stat' (souplesse, maintien)
   * level  : 1 débutant · 2 intermédiaire · 3 avancé
   * pos    : 1 debout · 2 à genoux · 3 assis · 4 allongé (ordre des séances)
   * zones  : zones travaillées (la première est la principale)
   * flags  : précautions — lombaires (flexion du dos), extension (cambrure), genoux, poignets, equilibre, nuque, nerf
   * sides  : à faire à gauche puis à droite
   * feel   : où l'on doit sentir l'étirement
   * pnf    : consigne de contraction pour le mode contracter-relâcher
   */
  B.stretches = {
    /* ---------------- MOBILITÉ ---------------- */
    cercles_bras: {
      name: 'Grands cercles de bras', type: 'dyn', level: 1, pos: 1, zones: ['epaules'],
      cue: 'Debout, bras tendus, dessine de grands cercles lents vers l\'arrière.',
      feel: 'Les épaules se réchauffent, sans pincement.',
      tips: ['Ventre gainé, ne cambre pas', 'Amplitude progressive'],
      easier: 'Petits cercles, coudes pliés.', harder: 'Cercles plus lents en tenant 2 s en haut.',
      anim: { mode: 'cycle', linear: true, dur: 700, frames: [0, 90, 180, 270, 360].map((a) => S({ a1: a, f1: a, a2: a + 20, f2: a + 20 })) },
    },
    balancier_jambe: {
      name: 'Balancier de jambe', type: 'dyn', level: 1, pos: 1, zones: ['ischios', 'hanches'], sides: true, flags: ['equilibre'],
      cue: 'Debout sur une jambe, balance l\'autre d\'avant en arrière, souple et contrôlé.',
      feel: 'Arrière de cuisse à l\'avant, devant de hanche à l\'arrière.',
      tips: ['Buste droit', 'Augmente l\'amplitude petit à petit'],
      easier: 'Tiens-toi à un mur.', harder: 'Sans appui, amplitude maximale contrôlée.',
      sideHint: 'la jambe qui balance',
      anim: { mode: 'pingpong', dur: 900, frames: [S({ l1: -35, k1: -40, a1: 25, f1: 25, a2: 90, f2: 95 }), S({ l1: 65, k1: 55, a1: -25, f1: -25, a2: 90, f2: 95 })] },
    },
    balancier_lateral: {
      name: 'Balancier latéral', type: 'dyn', level: 1, pos: 1, zones: ['adducteurs', 'hanches'], sides: true, flags: ['equilibre'],
      cue: 'Face à un mur, balance une jambe de côté, devant l\'autre puis vers l\'extérieur.',
      feel: 'Intérieur et extérieur de la cuisse.',
      tips: ['Bassin stable, ne te penche pas', 'Pied de la jambe d\'appui bien ancré'],
      easier: 'Mains contre le mur, petite amplitude.', harder: 'Sans appui.',
      sideHint: 'la jambe qui balance',
      anim: { mode: 'pingpong', dur: 900, frames: [F({ lR: -14, kR: -14, aL: -60, fL: -70, aR: 60, fR: 70 }), F({ hip: [57, 50], lR: 45, kR: 45, aL: -60, fL: -70, aR: 60, fR: 70 })] },
    },
    squat_profond: {
      name: 'Squat profond', type: 'dyn', level: 1, pos: 1, zones: ['hanches', 'chevilles', 'adducteurs'],
      cue: 'Pieds un peu plus larges que les hanches, descends lentement en squat profond, puis remonte.',
      feel: 'Hanches, chevilles et intérieur des cuisses.',
      tips: ['Talons au sol', 'Genoux dans l\'axe des pieds'],
      easier: 'Talons surélevés (livre, cale).', harder: 'Reste 3 s en bas à chaque répétition.',
      anim: { mode: 'pingpong', dur: 1600, frames: [S({ a1: 90, f1: 90, a2: 90, f2: 90 }), { hip: [54, 78], t: 150, n: 158, a1: 90, f1: 90, a2: 90, f2: 90, l1: 105, k1: -22, l2: 100, k2: -33 }] },
    },
    chat_vache: {
      name: 'Chat-vache', type: 'dyn', level: 1, pos: 2, zones: ['dos'], flags: ['poignets'],
      cue: 'À quatre pattes, arrondis le dos en rentrant le menton, puis creuse doucement en regardant devant.',
      feel: 'Toute la colonne bouge, vertèbre par vertèbre.',
      tips: ['Mouvement lent, calé sur la respiration', 'Mains sous les épaules, genoux sous les hanches'],
      easier: 'Petite amplitude.', harder: 'Marque une pause aux extrémités.',
      anim: { mode: 'pingpong', dur: 2200, frames: [
        { tail: -55, curl: -10, hip: [44, 71], t: 104, n: 30, arch: 6, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
        { tail: -55, curl: -10, hip: [44, 70], t: 107, n: 150, arch: -5, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
      ] },
    },
    fente_dynamique: {
      name: 'Fente qui bascule', type: 'dyn', level: 1, pos: 2, zones: ['hanches', 'quadriceps'], sides: true, flags: ['genoux'],
      cue: 'Un genou au sol, l\'autre pied devant. Avance et recule le bassin en rythme.',
      feel: 'Devant de la hanche de la jambe arrière.',
      tips: ['Buste droit', 'Serre la fesse de la jambe arrière'],
      easier: 'Coussin sous le genou.', harder: 'Bras levés au-dessus de la tête.',
      sideHint: 'le genou au sol',
      anim: { mode: 'pingpong', dur: 1300, frames: [
        { tail: -70, curl: -8, hip: [50, 70], t: 180, a1: 25, f1: 45, a2: 20, f2: 40, l1: 72, k1: 38, l2: -20, k2: -90, p2: -90 },
        { tail: -70, curl: -8, hip: [56, 73], t: 182, a1: 25, f1: 45, a2: 20, f2: 40, l1: 85, k1: 25, l2: -40, k2: -90, p2: -90 },
      ] },
    },
    cheville_genou: {
      name: 'Genou au-dessus des orteils', type: 'dyn', level: 1, pos: 2, zones: ['chevilles'], sides: true, flags: ['genoux'],
      cue: 'Un genou au sol. Avance le genou de devant au-dessus des orteils, talon collé au sol, puis reviens.',
      feel: 'Mollet et devant de la cheville.',
      tips: ['Le talon ne décolle jamais', 'Genou dans l\'axe du 2e orteil'],
      easier: 'Petite amplitude.', harder: 'Avance un peu le pied avant, ou appuie la main sur la cuisse.',
      sideHint: 'le pied devant',
      anim: { mode: 'pingpong', dur: 1300, frames: [
        { tail: -70, curl: -8, hip: [46, 69], a1: 40, f1: 70, a2: 35, f2: 65, l1: 85, k1: 2, l2: -13, k2: -90, p2: -90 },
        { tail: -70, curl: -8, hip: [55, 70], a1: 40, f1: 70, a2: 35, f2: 65, l1: 79, k1: -25, l2: -22, k2: -90, p2: -90 },
      ] },
    },
    charniere: {
      name: 'Charnière de hanche', type: 'dyn', level: 1, pos: 1, zones: ['ischios', 'dos'],
      cue: 'Debout, genoux souples, penche le buste en poussant les fesses en arrière, dos bien plat, puis remonte.',
      feel: 'Arrière des cuisses, pas le bas du dos.',
      tips: ['Dos plat du début à la fin', 'Le mouvement vient des hanches'],
      easier: 'Plus petite amplitude.', harder: 'Sur une jambe.',
      anim: { mode: 'pingpong', dur: 1600, frames: [S({}), S({ hip: [54, 51], t: 100, n: 98, l1: -6, k1: 6, l2: -6, k2: 6 })] },
    },
    pont_fessier: {
      name: 'Pont fessier', type: 'dyn', level: 1, pos: 4, zones: ['hanches', 'fessiers'],
      cue: 'Allongé, genoux pliés, pousse dans les talons pour monter le bassin, puis redescends lentement.',
      feel: 'Fessiers qui travaillent, devant de hanche qui s\'ouvre.',
      tips: ['Ne cambre pas en haut : serre les fessiers', 'Genoux dans l\'axe'],
      easier: 'Petite montée.', harder: 'Tiens 3 s en haut.',
      anim: { mode: 'pingpong', dur: 1600, frames: [
        L({ a1: 92, f1: 92, a2: 92, f2: 92, l1: 140, k1: 18, l2: 136, k2: 20 }),
        L({ hip: [62, 72], t: -64, n: -100, a1: 95, f1: 95, a2: 95, f2: 95, l1: 98, k1: -2, l2: 95, k2: 0 }),
      ] },
    },
    kick_controle: {
      name: 'Montée de jambe contrôlée', type: 'dyn', level: 2, pos: 1, zones: ['ischios', 'hanches'], sides: true, flags: ['equilibre'],
      cue: 'Debout, monte la jambe tendue devant toi le plus haut possible avec tes muscles, puis redescends lentement.',
      feel: 'Arrière de la cuisse levée, devant de la hanche qui travaille.',
      tips: ['Jambe d\'appui tendue', 'Ne te penche pas en arrière'],
      easier: 'Tiens-toi à un mur.', harder: 'Tiens 2 s en haut.',
      sideHint: 'la jambe qui monte',
      anim: { mode: 'pingpong', dur: 1400, frames: [S({ a1: 90, f1: 90, a2: 90, f2: 90 }), S({ a1: 90, f1: 90, a2: 90, f2: 90, l1: 82, k1: 82, p1: 172 })] },
    },
    cosaque: {
      name: 'Squat cosaque', type: 'dyn', level: 2, pos: 1, zones: ['adducteurs', 'hanches'], sides: true,
      cue: 'Pieds très écartés, descends sur une jambe en gardant l\'autre tendue, pointe du pied vers le haut.',
      feel: 'Intérieur de la cuisse tendue.',
      tips: ['Talon de la jambe pliée au sol', 'Buste fier'],
      easier: 'Mains au sol devant toi.', harder: 'Plus bas, mains jointes devant la poitrine.',
      sideHint: 'la jambe tendue',
      anim: { mode: 'pingpong', dur: 1700, frames: [
        F({ hip: [60, 58], lL: -40, kL: -40, lR: 40, kR: 40, aL: -10, fL: 30, aR: 10, fR: -30 }),
        F({ hip: [44, 74], t: 186, lL: -70, kL: 59, lR: 65, kR: 65, aL: -10, fL: 30, aR: 10, fR: -30 }),
      ] },
    },
    cavalier: {
      name: 'Posture du cavalier', type: 'dyn', level: 2, pos: 1, zones: ['adducteurs', 'hanches'],
      cue: 'Pieds très écartés, descends en gardant le buste droit et les genoux bien ouverts, puis remonte.',
      feel: 'Intérieur des cuisses et fessiers.',
      tips: ['Genoux au-dessus des pieds', 'Dos droit'],
      easier: 'Descends moins bas.', harder: 'Tiens la position basse 5 s.',
      anim: { mode: 'pingpong', dur: 1600, frames: [
        F({ hip: [60, 54], lL: -30, kL: -30, lR: 30, kR: 30, aL: 20, fL: 110, aR: -20, fR: -110 }),
        F({ hip: [60, 72], lL: -100, kL: 0, lR: 100, kR: 0, aL: 20, fL: 110, aR: -20, fR: -110 }),
      ] },
    },

    /* ---------------- SOUPLESSE ---------------- */
    pince_debout: {
      name: 'Pince debout', type: 'stat', level: 1, pos: 1, zones: ['ischios', 'dos'], flags: ['lombaires', 'nerf'],
      cue: 'Debout, jambes tendues, enroule le dos vers l\'avant et laisse pendre les mains vers les pieds.',
      feel: 'Arrière des cuisses et bas du dos.',
      tips: ['Genoux légèrement fléchis si ça tire trop', 'Relâche la nuque'],
      easier: 'Mains sur les tibias, genoux pliés.', harder: 'Attrape tes chevilles et rapproche le buste.',
      pnf: 'Appuie les talons dans le sol, comme pour les tirer vers l\'arrière.',
      anim: { mode: 'pingpong', dur: 2600, frames: [
        { hip: [55, 50], t: 44, n: 24, arch: 4, a1: -26, f1: -72, a2: -22, f2: -68, tail: -40, curl: -14 },
        { hip: [54, 50], t: 38, n: 18, arch: 5, a1: -30, f1: -80, a2: -26, f2: -76, tail: -40, curl: -14 },
      ] },
    },
    pince_assise: {
      name: 'Pince assise', type: 'stat', level: 1, pos: 3, zones: ['ischios', 'mollets', 'dos'], flags: ['lombaires', 'nerf'],
      cue: 'Assis, jambes tendues devant toi. Penche-toi vers l\'avant en gardant le dos long.',
      feel: 'Arrière des cuisses (pas le mollet ni le pied).',
      tips: ['Pars des hanches, pas du dos', 'Genoux légèrement fléchis autorisés'],
      easier: 'Assieds-toi sur un coussin.', harder: 'Attrape tes pieds.',
      pnf: 'Appuie les talons dans le sol.',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        { hip: [38, 87], t: 132, n: 122, arch: 2, a1: 112, f1: 104, a2: 110, f2: 102, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180, tail: -82, curl: -7 },
        { hip: [38, 87], t: 122, n: 114, arch: 3, a1: 106, f1: 100, a2: 104, f2: 98, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180, tail: -82, curl: -7 },
      ] },
    },
    ischio_allonge: {
      name: 'Ischios allongé avec sangle', type: 'stat', level: 1, pos: 4, zones: ['ischios', 'mollets'], sides: true, flags: ['nerf'],
      cue: 'Allongé sur le dos, monte une jambe tendue en tenant une sangle ou une serviette autour du pied.',
      feel: 'Arrière de la cuisse levée. Le dos reste au sol.',
      tips: ['Bassin bien à plat', 'L\'autre jambe reste tendue au sol'],
      easier: 'Genou de la jambe levée un peu fléchi.', harder: 'Rapproche la jambe vers toi.',
      pnf: 'Pousse doucement la jambe vers le sol contre la sangle.',
      sideHint: 'la jambe levée',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        L({ a1: 150, f1: 155, a2: 145, f2: 152, l1: 172, k1: 172, p1: -95, l2: 90, k2: 90, p2: 180, strap: 1 }),
        L({ a1: 150, f1: 160, a2: 145, f2: 156, l1: 184, k1: 184, p1: -85, l2: 90, k2: 90, p2: 180, strap: 1 }),
      ] },
    },
    demi_grand_ecart: {
      name: 'Demi grand écart', type: 'stat', level: 1, pos: 2, zones: ['ischios', 'mollets'], sides: true, flags: ['genoux', 'nerf'],
      cue: 'Un genou au sol, l\'autre jambe tendue devant, talon au sol. Recule le bassin et penche le buste, dos long.',
      feel: 'Arrière de la cuisse tendue.',
      tips: ['Bassin face à l\'avant', 'Pointe du pied vers toi pour plus d\'intensité'],
      easier: 'Mains sur des livres ou des briques.', harder: 'Buste plus proche de la jambe.',
      pnf: 'Appuie le talon avant dans le sol.',
      sideHint: 'la jambe tendue devant',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        { tail: -70, curl: -8, hip: [44, 71], t: 118, n: 112, a1: 2, f1: 2, a2: 0, f2: 0, l1: 60, k1: 60, p1: 180, l2: 0, k2: -90, p2: -90 },
        { tail: -70, curl: -8, hip: [44, 71], t: 108, n: 102, arch: 2, a1: 6, f1: 6, a2: 4, f2: 4, l1: 60, k1: 60, p1: 180, l2: 0, k2: -90, p2: -90 },
      ] },
    },
    grand_ecart_facial: {
      name: 'Grand écart facial', type: 'stat', level: 3, pos: 3, zones: ['ischios', 'hanches', 'quadriceps'], sides: true, flags: ['genoux', 'nerf'],
      cue: 'Glisse une jambe devant, l\'autre derrière, bassin face à l\'avant. Mains au sol ou sur des briques.',
      feel: 'Arrière de la cuisse avant et devant de la hanche arrière.',
      tips: ['Ne force jamais la descente', 'Coussins ou briques sous le bassin au début'],
      easier: 'Demi grand écart et fente basse séparément.', harder: 'Buste penché sur la jambe avant.',
      pnf: 'Appuie le talon avant et le genou arrière dans le sol, comme pour les rapprocher.',
      sideHint: 'la jambe devant',
      anim: { mode: 'pingpong', dur: 3200, frames: [
        { tail: -75, curl: -6, hip: [56, 84], t: 178, n: 178, a1: 12, f1: 4, a2: -8, f2: -4, l1: 88, k1: 88, p1: 180, l2: -86, k2: -86, p2: -90 },
        { tail: -75, curl: -6, hip: [56, 86], t: 182, n: 180, a1: 12, f1: 4, a2: -8, f2: -4, l1: 89, k1: 89, p1: 180, l2: -88, k2: -88, p2: -90 },
      ] },
    },
    fente_basse: {
      name: 'Fente basse', type: 'stat', level: 1, pos: 2, zones: ['hanches', 'quadriceps'], sides: true, flags: ['genoux'],
      cue: 'Un genou au sol, l\'autre pied devant. Avance doucement le bassin vers l\'avant.',
      feel: 'Devant de la hanche de la jambe arrière.',
      tips: ['Buste droit, ne cambre pas', 'Serre la fesse arrière'],
      easier: 'Coussin sous le genou.', harder: 'Bras tendus au-dessus de la tête.',
      pnf: 'Tire le genou arrière vers l\'avant contre le sol, sans bouger.',
      sideHint: 'le genou au sol',
      anim: { mode: 'pingpong', dur: 2800, frames: [
        { tail: -70, curl: -8, hip: [52, 70], t: 180, n: 180, a1: 22, f1: 42, a2: 18, f2: 38, l1: 75, k1: 36, l2: -25, k2: -90, p2: -90 },
        { tail: -70, curl: -8, hip: [55, 72], t: 183, n: 182, a1: 22, f1: 42, a2: 18, f2: 38, l1: 82, k1: 28, l2: -36, k2: -90, p2: -90 },
      ] },
    },
    fente_quadri: {
      name: 'Fente basse, pied attrapé', type: 'stat', level: 2, pos: 2, zones: ['quadriceps', 'hanches'], sides: true, flags: ['genoux'],
      cue: 'En fente basse, attrape le pied arrière et rapproche-le doucement de la fesse.',
      feel: 'Devant de la cuisse arrière et de la hanche.',
      tips: ['Pousse les hanches vers l\'avant en rentrant le bassin, sans cambrer', 'Coussin sous le genou'],
      easier: 'Sangle autour du pied.', harder: 'Bassin plus bas.',
      pnf: 'Pousse le pied dans ta main, sans bouger.',
      sideHint: 'le pied attrapé',
      anim: { mode: 'pingpong', dur: 2800, frames: [
        { tail: -70, curl: -8, hip: [52, 72], t: 180, a1: 22, f1: 42, a2: -20, f2: -20, l1: 75, k1: 36, l2: -15, k2: -165, p2: -75 },
        { tail: -70, curl: -8, hip: [54, 73], t: 182, a1: 22, f1: 42, a2: -22, f2: -24, l1: 80, k1: 30, l2: -22, k2: -168, p2: -78 },
      ] },
    },
    quadriceps_debout: {
      name: 'Quadriceps debout', type: 'stat', level: 1, pos: 1, zones: ['quadriceps'], sides: true, flags: ['equilibre', 'genoux'],
      cue: 'Debout, attrape ta cheville et ramène le talon vers la fesse, genoux côte à côte.',
      feel: 'Devant de la cuisse.',
      tips: ['Rentre le bassin (fesses serrées), sans cambrer', 'Tiens-toi à un mur'],
      easier: 'Sangle autour du pied.', harder: 'Recule le genou derrière l\'autre.',
      pnf: 'Pousse le pied dans ta main.',
      sideHint: 'le pied attrapé',
      anim: { mode: 'pingpong', dur: 2600, frames: [S({ l1: -8, k1: -172, p1: 10, a1: -12, f1: -8, a2: 90, f2: 92 }), S({ l1: -14, k1: -176, p1: 6, a1: -16, f1: -12, a2: 90, f2: 92 })] },
    },
    pigeon: {
      name: 'Pigeon', type: 'stat', level: 2, pos: 2, zones: ['fessiers', 'hanches'], sides: true, flags: ['genoux'],
      cue: 'Jambe avant pliée devant toi, l\'autre tendue derrière. Bassin bien droit, penche-toi si c\'est confortable.',
      feel: 'Fessier de la jambe avant.',
      tips: ['Coussin sous la fesse avant si le bassin penche', 'Aucune douleur au genou'],
      easier: 'Figure 4 allongé.', harder: 'Buste allongé sur la jambe.',
      pnf: 'Appuie le genou avant dans le sol.',
      sideHint: 'la jambe pliée devant',
      anim: { mode: 'pingpong', dur: 3200, frames: [
        { tail: -80, curl: -4, hip: [52, 82], t: 178, n: 178, a1: 8, f1: 8, a2: 4, f2: 4, l1: 82, k1: -100, p1: -90, l2: -86, k2: -88, p2: -90 },
        { tail: -80, curl: -4, hip: [52, 83], t: 118, n: 108, arch: 2, a1: 84, f1: 88, a2: 82, f2: 86, l1: 82, k1: -100, p1: -90, l2: -86, k2: -88, p2: -90 },
      ] },
    },
    figure_quatre: {
      name: 'Figure 4 allongé', type: 'stat', level: 1, pos: 4, zones: ['fessiers', 'hanches'], sides: true,
      cue: 'Allongé, pose une cheville sur le genou opposé et tire doucement la jambe d\'appui vers toi.',
      feel: 'Fessier de la jambe croisée.',
      tips: ['Tête et épaules au sol', 'Pied de la jambe croisée fléchi'],
      easier: 'Pied d\'appui au sol.', harder: 'Tire plus la cuisse vers la poitrine.',
      pnf: 'Pousse le genou croisé contre ta main.',
      sideHint: 'la cheville posée sur le genou',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        L({ a1: 125, f1: 150, a2: 120, f2: 145, l1: 120, k1: -124, p1: 150, l2: 170, k2: 90 }),
        L({ a1: 128, f1: 155, a2: 123, f2: 150, l1: 128, k1: -118, p1: 150, l2: 178, k2: 95 }),
      ] },
    },
    posture_enfant: {
      name: 'Posture de l\'enfant', type: 'stat', level: 1, pos: 2, zones: ['dos', 'hanches'], flags: ['genoux'],
      cue: 'À genoux, assieds-toi sur les talons et allonge le buste vers l\'avant, bras tendus devant toi.',
      feel: 'Le dos s\'allonge, les hanches se relâchent.',
      tips: ['Écarte les genoux pour plus de confort', 'Respire dans le dos'],
      easier: 'Coussin entre fesses et talons.', harder: 'Marche les mains d\'un côté puis de l\'autre.',
      anim: { mode: 'pingpong', dur: 3600, frames: [
        { tail: -75, curl: -8, hip: [46, 74], t: 64, n: 93, arch: 3, a1: 84, f1: 88, a2: 82, f2: 86, l1: 40, k1: -90, p1: -90, l2: 40, k2: -90, p2: -90 },
        { tail: -75, curl: -8, hip: [45, 75], t: 67, n: 96, arch: 4, a1: 86, f1: 89, a2: 84, f2: 88, l1: 41, k1: -90, p1: -90, l2: 41, k2: -90, p2: -90 },
      ] },
    },
    chiot: {
      name: 'Posture du chiot', type: 'stat', level: 2, pos: 2, zones: ['epaules', 'dos'], flags: ['genoux'],
      cue: 'À quatre pattes, avance les mains loin devant et descends la poitrine vers le sol, hanches au-dessus des genoux.',
      feel: 'Sous les bras et le long du dos.',
      tips: ['Ne force pas la cambrure', 'Front posé ou sur un coussin'],
      easier: 'Mains sur une chaise.', harder: 'Poitrine plus près du sol.',
      anim: { mode: 'pingpong', dur: 3200, frames: [
        { tail: -60, curl: -10, hip: [48, 71], t: 68, n: 78, arch: -3, a1: 86, f1: 89, a2: 84, f2: 88, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
        { tail: -60, curl: -10, hip: [48, 71], t: 64, n: 74, arch: -5, a1: 88, f1: 90, a2: 86, f2: 89, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
      ] },
    },
    sphinx: {
      name: 'Sphinx', type: 'stat', level: 1, pos: 4, zones: ['dos'], flags: ['extension'],
      cue: 'Allongé sur le ventre, appuie-toi sur les avant-bras et laisse la poitrine s\'ouvrir.',
      feel: 'Le dos s\'étend en douceur, le ventre s\'étire.',
      tips: ['Épaules loin des oreilles', 'Fessiers relâchés'],
      easier: 'Coudes plus en avant.', harder: 'Cobra, bras tendus.',
      anim: { mode: 'pingpong', dur: 3400, frames: [
        { tail: -88, curl: -3, hip: [46, 87], t: 112, n: 160, arch: -2, a1: 0, f1: 90, a2: 2, f2: 90, l1: -90, k1: -90, p1: -90, l2: -90, k2: -90, p2: -90 },
        { tail: -88, curl: -3, hip: [46, 87], t: 118, n: 165, arch: -3, a1: 0, f1: 90, a2: 2, f2: 90, l1: -90, k1: -90, p1: -90, l2: -90, k2: -90, p2: -90 },
      ] },
    },
    cobra: {
      name: 'Cobra', type: 'stat', level: 2, pos: 4, zones: ['dos'], flags: ['extension', 'poignets'],
      cue: 'Allongé sur le ventre, mains sous les épaules, pousse pour décoller la poitrine, bassin au sol.',
      feel: 'Le long du dos et sur le devant du corps.',
      tips: ['Monte seulement tant que le bassin reste au sol', 'Aucune douleur dans le bas du dos'],
      easier: 'Sphinx.', harder: 'Bras plus tendus.',
      anim: { mode: 'pingpong', dur: 3400, frames: [
        { tail: -88, curl: -3, hip: [46, 87], t: 128, n: 165, arch: -4, a1: 4, f1: 4, a2: 6, f2: 6, l1: -90, k1: -90, p1: -90, l2: -90, k2: -90, p2: -90 },
        { tail: -88, curl: -3, hip: [46, 87], t: 136, n: 170, arch: -6, a1: 6, f1: 6, a2: 8, f2: 8, l1: -90, k1: -90, p1: -90, l2: -90, k2: -90, p2: -90 },
      ] },
    },
    mollet_mur: {
      name: 'Mollet au mur', type: 'stat', level: 1, pos: 1, zones: ['mollets', 'chevilles'], sides: true,
      cue: 'Mains contre un mur, une jambe tendue derrière, talon au sol. Avance le bassin.',
      feel: 'Haut du mollet de la jambe arrière.',
      tips: ['Pied arrière bien droit', 'Talon collé au sol'],
      easier: 'Pied arrière plus près.', harder: 'Pied arrière plus loin.',
      pnf: 'Appuie la pointe du pied arrière dans le sol.',
      sideHint: 'la jambe arrière',
      anim: { mode: 'pingpong', dur: 2800, frames: [
        S({ hip: [58, 52], t: 162, n: 168, a1: 112, f1: 100, a2: 108, f2: 98, l1: -25, k1: -25, l2: 20, k2: -10 }),
        S({ hip: [61, 53], t: 158, n: 165, a1: 108, f1: 96, a2: 104, f2: 94, l1: -30, k1: -30, l2: 26, k2: -8 }),
      ] },
    },
    soleaire: {
      name: 'Mollet genou plié', type: 'stat', level: 1, pos: 1, zones: ['mollets', 'chevilles'], sides: true,
      cue: 'Comme le mollet au mur, mais plie le genou arrière en gardant le talon au sol.',
      feel: 'Bas du mollet, près du talon.',
      tips: ['Talon collé au sol', 'Descends le bassin plutôt que l\'avancer'],
      easier: 'Petite flexion.', harder: 'Plus de flexion du genou.',
      sideHint: 'la jambe arrière',
      anim: { mode: 'pingpong', dur: 2800, frames: [
        S({ hip: [58, 55], t: 165, n: 170, a1: 112, f1: 100, a2: 108, f2: 98, l1: -8, k1: -32, l2: 24, k2: -8 }),
        S({ hip: [58, 57], t: 165, n: 170, a1: 112, f1: 100, a2: 108, f2: 98, l1: -2, k1: -36, l2: 28, k2: -10 }),
      ] },
    },
    pectoraux: {
      name: 'Pectoraux à la porte', type: 'stat', level: 1, pos: 1, zones: ['pectoraux', 'epaules'], sides: true,
      cue: 'Avant-bras contre un cadre de porte, coude à hauteur d\'épaule. Avance doucement le buste.',
      feel: 'Poitrine et devant de l\'épaule.',
      tips: ['Épaule basse, loin de l\'oreille', 'Ne cambre pas'],
      easier: 'Coude plus bas.', harder: 'Avance un peu plus.',
      pnf: 'Pousse l\'avant-bras contre le cadre de porte.',
      sideHint: 'le bras contre la porte',
      anim: { mode: 'pingpong', dur: 2800, frames: [S({ t: 176, a1: -92, f1: 180, a2: 10, f2: 10, l1: 10, k1: 0, l2: -8, k2: -4 }), S({ hip: [62, 50], t: 172, a1: -98, f1: 176, a2: 10, f2: 10, l1: 14, k1: 2, l2: -12, k2: -6 })] },
    },
    bras_croise: {
      name: 'Épaule bras croisé', type: 'stat', level: 1, pos: 1, zones: ['epaules'], sides: true,
      cue: 'Ramène un bras tendu devant la poitrine et rapproche-le avec l\'autre main au-dessus du coude.',
      feel: 'Arrière de l\'épaule.',
      tips: ['Épaule basse', 'Ne tourne pas le buste'],
      easier: 'Moins de traction.', harder: 'Bras un peu plus haut.',
      pnf: 'Pousse le bras contre ta main.',
      sideHint: 'le bras tendu',
      anim: { mode: 'pingpong', dur: 2800, frames: [F({ aL: 84, fL: 88, aR: 30, fR: -100 }), F({ aL: 80, fL: 86, aR: 26, fR: -104 })] },
    },
    triceps_tete: {
      name: 'Triceps derrière la tête', type: 'stat', level: 1, pos: 1, zones: ['epaules'], sides: true,
      cue: 'Lève un bras, plie le coude derrière la tête et appuie doucement sur le coude avec l\'autre main.',
      feel: 'Arrière du bras et sous l\'aisselle.',
      tips: ['Tête droite', 'Côtes rentrées, pas de cambrure'],
      easier: 'Sans appuyer.', harder: 'Coude plus derrière.',
      sideHint: 'le coude plié',
      anim: { mode: 'pingpong', dur: 2800, frames: [F({ aL: 186, fL: 30, behindL: 1, aR: 205, fR: -128 }), F({ aL: 190, fL: 34, behindL: 1, aR: 208, fR: -132 })] },
    },
    inclinaison: {
      name: 'Inclinaison latérale', type: 'stat', level: 1, pos: 1, zones: ['flancs', 'dos'], sides: true,
      cue: 'Debout, lève un bras et penche-toi de côté, comme pour l\'allonger au-dessus de la tête.',
      feel: 'Tout le flanc du côté du bras levé.',
      tips: ['Ne bascule pas en avant', 'Pieds bien ancrés'],
      easier: 'Main sur la hanche.', harder: 'Les deux bras au-dessus de la tête.',
      sideHint: 'le bras levé',
      anim: { mode: 'pingpong', dur: 3000, frames: [F({ hip: [62, 50], t: 196, n: 200, aR: 200, fR: 228, aL: -12, fL: -6 }), F({ hip: [64, 50], t: 204, n: 210, aR: 208, fR: 240, aL: -14, fL: -8 })] },
    },
    nuque: {
      name: 'Nuque inclinée', type: 'stat', level: 1, pos: 1, zones: ['nuque'], sides: true, flags: ['nuque'],
      cue: 'Penche doucement l\'oreille vers l\'épaule, épaule opposée relâchée vers le bas.',
      feel: 'Côté du cou.',
      tips: ['Jamais de tirage avec la main', 'Mouvement très lent'],
      easier: 'Petite inclinaison.', harder: 'Laisse le poids de la tête faire le travail.',
      sideHint: 'le côté du cou étiré (l\'oreille part vers l\'autre épaule)',
      anim: { mode: 'pingpong', dur: 3000, frames: [F({ n: 162 }), F({ n: 152 })] },
    },
    papillon: {
      name: 'Papillon', type: 'stat', level: 1, pos: 3, zones: ['adducteurs', 'hanches'], flags: ['genoux'],
      cue: 'Assis, plantes de pieds collées, laisse les genoux descendre de chaque côté. Dos long.',
      feel: 'Intérieur des cuisses.',
      tips: ['Ne force pas sur les genoux', 'Penche-toi seulement dos droit'],
      easier: 'Pieds plus loin de toi, coussin sous les fesses.', harder: 'Penche le buste vers l\'avant.',
      pnf: 'Pousse les genoux vers le haut contre tes mains.',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        F({ hip: [60, 80], lL: -66, kL: 84, lR: 66, kR: -84, aL: -18, fL: 22, aR: 18, fR: -22 }),
        F({ hip: [60, 80], tl: 0.85, n: 180, lL: -72, kL: 82, lR: 72, kR: -82, aL: -14, fL: 26, aR: 14, fR: -26 }),
      ] },
    },
    straddle: {
      name: 'Jambes écartées assis', type: 'stat', level: 2, pos: 3, zones: ['adducteurs', 'ischios'], flags: ['lombaires', 'nerf'],
      cue: 'Assis, jambes tendues et écartées, genoux vers le plafond. Penche-toi vers l\'avant en partant des hanches.',
      feel: 'Intérieur et arrière des cuisses.',
      tips: ['Bascule le bassin vers l\'avant', 'Coussin sous les fesses si le dos s\'arrondit'],
      easier: 'Reste droit, mains derrière toi.', harder: 'Pancake : poitrine vers le sol.',
      pnf: 'Appuie les talons dans le sol, comme pour fermer les jambes.',
      anim: { mode: 'pingpong', dur: 3200, frames: [
        F({ hip: [60, 82], lL: -74, kL: -74, lR: 74, kR: 74, aL: -8, fL: -6, aR: 8, fR: 6 }),
        F({ hip: [60, 82], tl: 0.7, n: 180, lL: -76, kL: -76, lR: 76, kR: 76, aL: -4, fL: -2, aR: 4, fR: 2 }),
      ] },
    },
    grand_ecart_lateral: {
      name: 'Grand écart latéral', type: 'stat', level: 3, pos: 3, zones: ['adducteurs', 'ischios'], flags: ['genoux'],
      cue: 'Mains au sol, écarte les jambes de chaque côté jusqu\'à une tension franche, bassin dans l\'axe.',
      feel: 'Intérieur des cuisses. Si ça bloque sur le côté de la hanche, arrête.',
      tips: ['Bascule le bassin vers l\'avant', 'Genoux et orteils vers le plafond ou l\'avant'],
      easier: 'Mains sur des briques, bassin plus haut.', harder: 'Descends sur les avant-bras.',
      pnf: 'Serre les jambes contre le sol, comme pour les rapprocher, sans bouger.',
      anim: { mode: 'pingpong', dur: 3400, frames: [
        F({ hip: [60, 82], lL: -82, kL: -82, lR: 82, kR: 82, aL: -4, fL: -2, aR: 4, fR: 2 }),
        F({ hip: [60, 85], lL: -86, kL: -86, lR: 86, kR: 86, aL: -6, fL: -4, aR: 6, fR: 4 }),
      ] },
    },
    pont_complet: {
      name: 'Pont complet', type: 'stat', level: 3, pos: 4, zones: ['dos', 'epaules', 'hanches'], flags: ['extension', 'poignets'],
      cue: 'Allongé, mains près des oreilles, pousse dans les mains et les pieds pour monter en pont.',
      feel: 'Devant du corps, épaules et dos qui s\'étendent.',
      tips: ['Pousse les épaules au-dessus des mains', 'Redescends en douceur'],
      easier: 'Pont fessier ou sphinx.', harder: 'Rapproche les mains des pieds.',
      anim: { mode: 'pingpong', dur: 3400, frames: [
        { hip: [64, 57], t: -72, n: -20, arch: -6, a1: -8, f1: -8, a2: -6, f2: -6, l1: 46, k1: 14, l2: 44, k2: 16 },
        { hip: [64, 55], t: -74, n: -16, arch: -7, a1: -6, f1: -6, a2: -4, f2: -4, l1: 48, k1: 12, l2: 46, k2: 14 },
      ] },
    },
    respiration: {
      name: 'Respiration allongée', type: 'stat', level: 1, pos: 4, zones: ['detente'], relax: true,
      cue: 'Allongé sur le dos, inspire par le nez en gonflant le ventre, souffle lentement par la bouche.',
      feel: 'Le corps se relâche à chaque expiration.',
      tips: ['Expiration plus longue que l\'inspiration', 'Laisse les épaules lourdes'],
      easier: 'Genoux pliés.', harder: 'Inspire 4 s, expire 6 à 8 s.',
      anim: { mode: 'pingpong', dur: 4000, frames: [L({ arch: -1, a1: 94, f1: 94, a2: 94, f2: 94, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180 }), L({ arch: -3, a1: 94, f1: 94, a2: 94, f2: 94, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180 })] },
    },
    /* ---------------- v0.4 : rotations, poignets, nuque, souplesse active ---------------- */
    rotation_thoracique: {
      name: 'Rotation thoracique', type: 'dyn', level: 1, pos: 2, zones: ['dos', 'epaules'], sides: true, flags: ['poignets'],
      cue: 'À quatre pattes, passe un bras sous le buste, puis ouvre-le vers le plafond en suivant la main du regard.',
      feel: 'Le haut du dos tourne, entre les omoplates.',
      tips: ['Le bassin reste immobile', 'Expire en ouvrant'],
      easier: 'Main derrière la tête, coude qui tourne.', harder: 'Tiens 2 s en haut.',
      sideHint: 'le bras qui tourne',
      anim: { mode: 'pingpong', dur: 1800, frames: [
        { tail: -55, curl: -10, hip: [44, 71], t: 104, n: 70, a1: -50, f1: -70, a2: 0, f2: 0, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
        { tail: -55, curl: -10, hip: [44, 71], t: 106, n: 165, a1: 172, f1: 176, a2: 0, f2: 0, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
      ] },
    },
    livre_ouvert: {
      name: 'Livre ouvert', type: 'dyn', level: 1, pos: 4, zones: ['dos', 'pectoraux'], sides: true,
      cue: 'Allongé sur le côté, genoux pliés, bras tendus devant. Ouvre le bras du dessus vers l\'arrière comme une page, puis reviens.',
      feel: 'Rotation du haut du dos et ouverture de la poitrine.',
      tips: ['Les genoux restent collés au sol', 'Le regard suit la main'],
      easier: 'Petite ouverture.', harder: 'Pause de 3 s ouvert, en expirant.',
      sideHint: 'le bras qui s\'ouvre',
      anim: { mode: 'pingpong', dur: 1800, frames: [
        L({ a1: 95, f1: 95, a2: 92, f2: 92, l1: 135, k1: 15, l2: 132, k2: 18 }),
        L({ a1: 180, f1: 180, a2: 92, f2: 92, l1: 135, k1: 15, l2: 132, k2: 18 }),
        L({ n: -110, a1: 262, f1: 262, a2: 92, f2: 92, l1: 135, k1: 15, l2: 132, k2: 18 }),
      ] },
    },
    quatre_vingt_dix: {
      name: 'Posture 90/90', type: 'stat', level: 1, pos: 3, zones: ['hanches', 'fessiers'], sides: true, flags: ['genoux'],
      cue: 'Assis, une jambe pliée devant à 90°, l\'autre pliée sur le côté à 90°. Buste droit, penche-toi au-dessus du tibia avant.',
      feel: 'Fessier de la jambe avant, rotation de la hanche arrière.',
      tips: ['Les deux fesses près du sol', 'Penche-toi dos long'],
      easier: 'Mains au sol derrière toi.', harder: 'Buste plus bas, sans les mains.',
      pnf: 'Appuie le genou avant dans le sol.',
      sideHint: 'la jambe pliée devant',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        F({ hip: [62, 84], lL: -80, kL: 95, lR: 80, kR: 100, aL: -30, fL: -20, aR: 30, fR: 20 }),
        F({ hip: [62, 84], tl: 0.82, n: 182, lL: -80, kL: 95, lR: 80, kR: 100, aL: -18, fL: -10, aR: 22, fR: 12 }),
      ] },
    },
    essuie_glaces: {
      name: 'Essuie-glaces', type: 'dyn', level: 1, pos: 3, zones: ['hanches'],
      cue: 'Assis, pieds écartés au sol, genoux pliés. Laisse tomber les deux genoux d\'un côté, puis de l\'autre.',
      feel: 'Rotation des hanches, à l\'intérieur et à l\'extérieur.',
      tips: ['Mains au sol derrière toi', 'Mouvement lent et contrôlé'],
      easier: 'Petite amplitude.', harder: 'Sans les mains, buste droit.',
      anim: { mode: 'pingpong', dur: 1500, frames: [
        F({ hip: [60, 84], lL: -112, kL: 6, lR: -168, kR: 36, aL: -40, fL: -30, aR: 40, fR: 30 }),
        F({ hip: [60, 84], lL: -150, kL: -17, lR: 150, kR: 17, aL: -40, fL: -30, aR: 40, fR: 30 }),
        F({ hip: [60, 84], lL: 168, kL: -36, lR: 112, kR: -6, aL: -40, fL: -30, aR: 40, fR: 30 }),
      ] },
    },
    glisses_mur: {
      name: 'Glissés au mur', type: 'dyn', level: 1, pos: 1, zones: ['epaules', 'dos'],
      cue: 'Dos au mur, bras en W contre le mur. Fais glisser les bras vers le haut en Y, puis redescends.',
      feel: 'Épaules et haut du dos qui travaillent.',
      tips: ['Bas du dos contre le mur', 'Coudes et poignets au contact si possible'],
      easier: 'Un pas devant le mur.', harder: 'Tiens 3 s en haut.',
      anim: { mode: 'pingpong', dur: 1800, frames: [F({ aL: -112, fL: 178, aR: 112, fR: -178 }), F({ aL: -152, fL: -162, aR: 152, fR: 162 })] },
    },
    poignets: {
      name: 'Étirement des poignets', type: 'stat', level: 1, pos: 2, zones: ['poignets'], flags: ['poignets'],
      cue: 'À genoux, mains au sol doigts tournés vers les genoux. Recule doucement le bassin.',
      feel: 'Intérieur des avant-bras et poignets.',
      tips: ['Paumes à plat', 'Va doucement, c\'est une petite articulation'],
      easier: 'Moins de poids sur les mains.', harder: 'Recule davantage.',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        { tail: -60, curl: -8, hip: [44, 71], t: 102, n: 115, a1: 6, f1: 6, a2: 4, f2: 4, l1: 0, k1: -90, p1: -90, l2: 0, k2: -90, p2: -90 },
        { tail: -60, curl: -8, hip: [40, 72], t: 98, n: 110, a1: 22, f1: 22, a2: 20, f2: 20, l1: -10, k1: -90, p1: -90, l2: -10, k2: -90, p2: -90 },
      ] },
    },
    hochements: {
      name: 'Hochements de tête', type: 'dyn', level: 1, pos: 1, zones: ['nuque'], flags: ['nuque'],
      cue: 'Debout ou assis, baisse lentement le menton vers la poitrine, puis regarde doucement vers le haut.',
      feel: 'Arrière puis devant du cou, sans pincement.',
      tips: ['Très lent', 'Épaules relâchées'],
      easier: 'Petite amplitude.', harder: 'Ajoute une petite rotation à chaque passage.',
      anim: { mode: 'pingpong', dur: 2200, frames: [S({ n: 150 }), S({ n: 200 })] },
    },
    cercles_hanche: {
      name: 'Cercles de hanche', type: 'dyn', level: 1, pos: 1, zones: ['hanches'], sides: true, flags: ['equilibre'],
      cue: 'Debout, monte le genou devant, ouvre-le sur le côté, puis passe la jambe derrière en dessinant un grand cercle.',
      feel: 'Toute l\'articulation de la hanche.',
      tips: ['Le bassin bouge le moins possible', 'Lent et contrôlé'],
      easier: 'Tiens-toi à un mur.', harder: 'Plus lent, plus grand.',
      sideHint: 'la jambe qui tourne',
      anim: { mode: 'cycle', dur: 900, frames: [S({ a2: 90, f2: 90 }), S({ l1: 95, k1: -5, a2: 90, f2: 90 }), S({ l1: 55, k1: -45, a2: 90, f2: 90 }), S({ l1: -20, k1: -75, a2: 90, f2: 90 }), S({ a2: 90, f2: 90 })] },
    },
    cercles_cheville: {
      name: 'Cercles de cheville', type: 'dyn', level: 1, pos: 1, zones: ['chevilles'], sides: true, flags: ['equilibre'],
      cue: 'Sur une jambe, décolle l\'autre pied et dessine de grands cercles avec la pointe, dans un sens puis dans l\'autre.',
      feel: 'Toute la cheville.',
      tips: ['Le genou ne bouge pas', 'Cercles les plus grands possibles'],
      easier: 'Assis, la jambe croisée.', harder: 'Les yeux fermés pour l\'équilibre.',
      sideHint: 'la cheville qui tourne',
      anim: { mode: 'pingpong', dur: 1100, frames: [S({ l1: 28, k1: 12, p1: 40, a2: 90, f2: 90 }), S({ l1: 28, k1: 12, p1: 165, a2: 90, f2: 90 })] },
    },
    compression_assise: {
      name: 'Levée de jambe assise', type: 'dyn', level: 2, pos: 3, zones: ['hanches', 'ischios'], sides: true,
      cue: 'Assis jambes tendues, buste penché vers l\'avant, mains au sol. Lève une jambe tendue de quelques centimètres, sans aide, puis repose.',
      feel: 'Devant de la hanche qui travaille, arrière de cuisse qui s\'étire.',
      tips: ['Jambe bien tendue', 'Même 2 cm, c\'est déjà bien'],
      easier: 'Buste plus droit.', harder: 'Tiens 3 s en l\'air.',
      sideHint: 'la jambe qui monte',
      anim: { mode: 'pingpong', dur: 1400, frames: [
        { tail: -82, curl: -7, hip: [38, 87], t: 125, n: 118, a1: 30, f1: 10, a2: 26, f2: 8, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180 },
        { tail: -82, curl: -7, hip: [38, 87], t: 125, n: 118, a1: 30, f1: 10, a2: 26, f2: 8, l1: 104, k1: 104, p1: 194, l2: 90, k2: 90, p2: 180 },
      ] },
    },
    levee_laterale: {
      name: 'Levée latérale contrôlée', type: 'dyn', level: 2, pos: 1, zones: ['adducteurs', 'hanches'], sides: true, flags: ['equilibre'],
      cue: 'Debout, monte une jambe tendue sur le côté le plus haut possible avec tes muscles, tiens 2 s, puis redescends lentement.',
      feel: 'Extérieur de la hanche qui travaille, intérieur de la cuisse qui s\'étire.',
      tips: ['Buste droit, ne te penche pas', 'Pointe du pied vers l\'avant'],
      easier: 'Main au mur.', harder: 'Tiens 5 s en haut.',
      sideHint: 'la jambe qui monte',
      anim: { mode: 'pingpong', dur: 1500, frames: [F({ aL: -70, fL: -80, aR: 70, fR: 80 }), F({ hip: [57, 50], t: 186, lR: 52, kR: 52, aL: -70, fL: -80, aR: 70, fR: 80 })] },
    },
    torsion_assise: {
      name: 'Torsion assise', type: 'stat', level: 1, pos: 3, zones: ['dos', 'flancs'], sides: true,
      cue: 'Assis jambes croisées, grandis-toi puis tourne le buste : une main sur le genou opposé, l\'autre au sol derrière toi.',
      feel: 'Le long de la colonne et sur le côté du buste.',
      tips: ['Grandis-toi avant de tourner', 'Tourne en expirant, sans forcer'],
      easier: 'Petite rotation.', harder: 'Regarde loin derrière ton épaule.',
      sideHint: 'le côté vers lequel tu tournes',
      anim: { mode: 'pingpong', dur: 3000, frames: [
        F({ hip: [60, 82], lL: -66, kL: 88, lR: 66, kR: -88, aL: -45, fL: -35, behindL: 1, aR: -40, fR: -95 }),
        F({ hip: [60, 82], n: 172, lL: -66, kL: 88, lR: 66, kR: -88, aL: -55, fL: -45, behindL: 1, aR: -50, fR: -100 }),
      ] },
    },
  };

  /* Zones et objectifs */
  B.ZONES = {
    ischios: 'Arrière des cuisses', hanches: 'Hanches', fessiers: 'Fessiers', adducteurs: 'Adducteurs', quadriceps: 'Quadriceps',
    mollets: 'Mollets', chevilles: 'Chevilles', poignets: 'Poignets', dos: 'Dos', flancs: 'Flancs', epaules: 'Épaules', pectoraux: 'Pectoraux', nuque: 'Nuque', detente: 'Détente',
  };
  B.FOCUS = {
    complet: { name: 'Corps entier', zones: { ischios: 1, hanches: 1, fessiers: 0.8, adducteurs: 0.8, quadriceps: 0.7, mollets: 0.6, chevilles: 0.5, dos: 1, flancs: 0.6, epaules: 0.9, pectoraux: 0.6, nuque: 0.3, poignets: 0.3 } },
    hanches: { name: 'Hanches', zones: { hanches: 1, fessiers: 1, adducteurs: 0.9, quadriceps: 0.6, ischios: 0.5 } },
    ischios: { name: 'Toucher ses pieds', zones: { ischios: 1, mollets: 0.7, dos: 0.5, hanches: 0.3 } },
    facial: { name: 'Grand écart facial', zones: { ischios: 1, hanches: 1, quadriceps: 0.9, mollets: 0.4 } },
    lateral: { name: 'Grand écart latéral', zones: { adducteurs: 1, ischios: 0.7, fessiers: 0.6, hanches: 0.6 } },
    dos: { name: 'Dos et colonne', zones: { dos: 1, flancs: 0.9, epaules: 0.6, hanches: 0.5, ischios: 0.4 } },
    epaules: { name: 'Épaules et haut du corps', zones: { epaules: 1, pectoraux: 1, dos: 0.6, nuque: 0.6, flancs: 0.5, poignets: 0.4 } },
    chevilles: { name: 'Chevilles et mollets', zones: { chevilles: 1, mollets: 1, hanches: 0.4 } },
  };
  B.MOMENTS = {
    souplesse: { name: 'Séance souplesse', dyn: 0.22 },
    reveil: { name: 'Réveil', dyn: 0.5, noFlex: true },
    avant: { name: 'Avant le sport', dyn: 0.75, maxHold: 25 },
    soir: { name: 'Détente du soir', dyn: 0.12, relax: true },
  };
  B.LEVELS = { 1: { name: 'Débutant', hold: 30 }, 2: { name: 'Intermédiaire', hold: 45 }, 3: { name: 'Avancé', hold: 60 } };


  /* ---------------- Bilan de mobilité (docs/savoir.md §8) ---------------- */
  const clamp = (x) => Math.max(0, Math.min(100, Math.round(x)));
  B.TESTS = [
    { id: 'genou_mur', zone: 'chevilles', name: 'Genou au mur', unit: 'cm', sides: true, pose: 'cheville_genou',
      how: 'Face à un mur, pied à plat. Avance le genou jusqu\'à toucher le mur sans décoller le talon. Recule le pied tant que c\'est possible, puis mesure la distance gros orteil–mur.',
      ref: '10 cm ou plus : normal · moins de 5 cm : limité · un écart de 2 cm entre deux bilans est un vrai progrès.', score: (v) => clamp((v / 14) * 100) },
    { id: 'flexion_avant', zone: 'ischios', name: 'Flexion avant debout', choices: [['Mains aux genoux', 20], ['Mi-tibias', 40], ['Chevilles', 60], ['Doigts au sol', 80], ['Paumes au sol', 100]], pose: 'pince_debout',
      how: 'Jambes tendues, pieds joints, descends lentement sans élan. Fais ce test plutôt le soir, et toujours à la même heure.',
      ref: 'La souplesse est plus faible le matin : compare des bilans faits au même moment de la journée.' },
    { id: 'ecart_facial', zone: 'facial', name: 'Grand écart facial', unit: 'cm', sides: true, lower: true, pose: 'grand_ecart_facial',
      how: 'Après un échauffement, descends en grand écart facial sans forcer, mains au sol. Mesure la distance entre le pli de la fesse et le sol.',
      ref: '0 cm = grand écart complet. Ne force jamais pour gagner un centimètre.', score: (v) => clamp(100 - (v / 45) * 100) },
    { id: 'ecart_lateral', zone: 'adducteurs', name: 'Grand écart latéral', unit: 'cm', lower: true, pose: 'grand_ecart_lateral',
      how: 'Après un échauffement, mains au sol, écarte les jambes de chaque côté jusqu\'à une tension franche. Mesure la distance entre le bassin et le sol.',
      ref: 'Si ça bloque sur le côté de la hanche, c\'est sans doute l\'os : n\'insiste pas.', score: (v) => clamp(100 - (v / 55) * 100) },
    { id: 'epaules_mur', zone: 'epaules', name: 'Bras au mur', choices: [['Bras loin du mur', 25], ['Pouces à 10 cm du mur', 50], ['Pouces au mur, dos décollé', 75], ['Pouces au mur, bas du dos collé', 100]], pose: 'glisses_mur',
      how: 'Dos au mur, pieds à 20 cm, bas du dos collé. Lève les bras tendus devant toi jusqu\'au-dessus de la tête et essaie de toucher le mur avec les pouces.',
      ref: 'Le bas du dos doit rester collé au mur pendant tout le test.' },
    { id: 'hanches_9090', zone: 'hanches', name: 'Assis en 90/90', choices: [['Impossible de tenir', 20], ['Possible avec les mains', 45], ['Buste droit sans les mains', 75], ['Changer de côté sans les mains', 100]], pose: 'quatre_vingt_dix',
      how: 'Assieds-toi en 90/90 (une jambe pliée devant, l\'autre sur le côté), puis essaie de te tenir droit et de passer de l\'autre côté.',
      ref: 'Ce test regarde la rotation des deux hanches en même temps.' },
    { id: 'squat', zone: 'chevilles', name: 'Squat profond', choices: [['Les talons décollent', 30], ['Talons au sol avec appui', 60], ['Talons au sol, 30 s sans appui', 100]], pose: 'squat_profond',
      how: 'Pieds largeur de hanches, descends le plus bas possible en gardant les talons au sol.',
      ref: 'Un bon squat profond demande des chevilles et des hanches mobiles.' },
  ];
  B.TEST_ZONES = { chevilles: 'Chevilles', ischios: 'Arrière des cuisses', facial: 'Grand écart facial', adducteurs: 'Grand écart latéral', epaules: 'Épaules', hanches: 'Hanches' };
  // Quelle zone d'exercices travaille quelle zone de test (pour l'objectif « Mes points faibles »)
  B.TEST_TO_ZONES = { chevilles: { chevilles: 1, mollets: 1 }, ischios: { ischios: 1, mollets: 0.4 }, facial: { ischios: 0.7, hanches: 0.8, quadriceps: 0.8 }, adducteurs: { adducteurs: 1, ischios: 0.4 }, epaules: { epaules: 1, pectoraux: 0.8, dos: 0.4 }, hanches: { hanches: 1, fessiers: 0.9 } };
  B.testScore = (t, v) => (t.choices ? v : t.score(v));

  /* ---------------- Programmes (volontairement simples) ---------------- */
  B.PROGRAMS = [
    { id: 'facial', name: 'Grand écart facial', weeks: 6, perWeek: 4, focus: 'facial', minutes: [10, 10, 15, 15, 20, 20], desc: 'Ischios, fléchisseurs de hanche et quadriceps, avec des maintiens qui s\'allongent.' },
    { id: 'lateral', name: 'Grand écart latéral', weeks: 6, perWeek: 4, focus: 'lateral', minutes: [10, 10, 15, 15, 20, 20], desc: 'Adducteurs et hanches, avec du renforcement en amplitude.' },
    { id: 'pieds', name: 'Toucher ses pieds', weeks: 4, perWeek: 5, focus: 'ischios', minutes: [10, 10, 15, 15], desc: 'Arrière des cuisses et mollets, un peu chaque jour.' },
    { id: 'mobilite', name: 'Mobilité au quotidien', weeks: 4, perWeek: 5, focus: 'complet', minutes: [10, 10, 15, 15], desc: 'Tout le corps, en alternant réveil et souplesse.' },
  ];

  /* ---------------- Mon corps : précautions qui filtrent les exercices ---------------- */
  B.BODY = [
    { id: 'dos', name: 'Bas du dos sensible', excl: ['lombaires', 'extension'] },
    { id: 'genoux', name: 'Genoux sensibles', excl: ['genoux'] },
    { id: 'poignets', name: 'Poignets sensibles', excl: ['poignets'] },
    { id: 'nuque', name: 'Nuque sensible', excl: ['nuque'] },
    { id: 'nerf', name: 'Sciatique ou fourmillements dans les jambes', excl: ['nerf'] },
    { id: 'equilibre', name: 'Équilibre fragile', excl: ['equilibre'] },
    { id: 'hyper', name: 'Hypermobilité (articulations très souples)', excl: [], hyper: true },
  ];

  B.PREP = 6;
  B.SWITCH = 5;
  B.stepSeconds = (id, sec) => { const st = B.stretches[id]; return B.PREP + (st.sides ? sec * 2 + B.SWITCH : sec); };
  // Préparation : plus longue au début et quand on change de position (debout → sol…)
  B.prepFor = (prevId, id, idx) => B.PREP + (idx === 0 ? 4 : 0) + (prevId && B.stretches[prevId].pos !== B.stretches[id].pos ? 6 : 0);
  B.sessionSeconds = (s) => s.steps.reduce((a, [id, sec], i) => a + B.stepSeconds(id, sec) - B.PREP + B.prepFor(i ? s.steps[i - 1][0] : null, id, i), 0);

  /* Séances prêtes (construites à la main selon docs/savoir.md) */
  B.sessions = [
    { id: 'reveil', name: 'Réveil en douceur', tag: 'Mobilité', desc: 'Pour le matin : on réveille les articulations sans forcer le dos.', steps: [['cercles_bras', 30], ['chat_vache', 40], ['fente_dynamique', 25], ['cheville_genou', 20], ['squat_profond', 40], ['charniere', 30]] },
    { id: 'hanches', name: 'Souplesse hanches et ischios', tag: 'Souplesse', desc: 'Échauffement, puis maintiens longs pour gagner en amplitude.', steps: [['balancier_jambe', 25], ['squat_profond', 40], ['fente_basse', 45], ['demi_grand_ecart', 45], ['pigeon', 45], ['ischio_allonge', 45], ['figure_quatre', 40], ['respiration', 45]] },
    { id: 'avant', name: 'Avant le sport', tag: 'Mobilité', desc: 'Du dynamique pour préparer le corps sans perdre en force.', steps: [['cercles_bras', 30], ['balancier_jambe', 20], ['balancier_lateral', 20], ['squat_profond', 30], ['fente_dynamique', 20], ['kick_controle', 15]] },
    { id: 'soir', name: 'Détente du soir', tag: 'Souplesse', desc: 'Des postures douces au sol pour relâcher avant de dormir.', steps: [['chat_vache', 40], ['posture_enfant', 60], ['papillon', 60], ['figure_quatre', 45], ['ischio_allonge', 45], ['respiration', 60]] },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
