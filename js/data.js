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
      anim: { mode: 'pingpong', dur: 900, frames: [S({ l1: -35, k1: -40, a1: 25, f1: 25, a2: 90, f2: 95 }), S({ l1: 65, k1: 55, a1: -25, f1: -25, a2: 90, f2: 95 })] },
    },
    balancier_lateral: {
      name: 'Balancier latéral', type: 'dyn', level: 1, pos: 1, zones: ['adducteurs', 'hanches'], sides: true, flags: ['equilibre'],
      cue: 'Face à un mur, balance une jambe de côté, devant l\'autre puis vers l\'extérieur.',
      feel: 'Intérieur et extérieur de la cuisse.',
      tips: ['Bassin stable, ne te penche pas', 'Pied de la jambe d\'appui bien ancré'],
      easier: 'Mains contre le mur, petite amplitude.', harder: 'Sans appui.',
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
      anim: { mode: 'pingpong', dur: 1400, frames: [S({ a1: 90, f1: 90, a2: 90, f2: 90 }), S({ a1: 90, f1: 90, a2: 90, f2: 90, l1: 82, k1: 82, p1: 172 })] },
    },
    cosaque: {
      name: 'Squat cosaque', type: 'dyn', level: 2, pos: 1, zones: ['adducteurs', 'hanches'], sides: true,
      cue: 'Pieds très écartés, descends sur une jambe en gardant l\'autre tendue, pointe du pied vers le haut.',
      feel: 'Intérieur de la cuisse tendue.',
      tips: ['Talon de la jambe pliée au sol', 'Buste fier'],
      easier: 'Mains au sol devant toi.', harder: 'Plus bas, mains jointes devant la poitrine.',
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
      anim: { mode: 'pingpong', dur: 2600, frames: [S({ l1: -8, k1: -172, p1: 10, a1: -12, f1: -8, a2: 90, f2: 92 }), S({ l1: -14, k1: -176, p1: 6, a1: -16, f1: -12, a2: 90, f2: 92 })] },
    },
    pigeon: {
      name: 'Pigeon', type: 'stat', level: 2, pos: 2, zones: ['fessiers', 'hanches'], sides: true, flags: ['genoux'],
      cue: 'Jambe avant pliée devant toi, l\'autre tendue derrière. Bassin bien droit, penche-toi si c\'est confortable.',
      feel: 'Fessier de la jambe avant.',
      tips: ['Coussin sous la fesse avant si le bassin penche', 'Aucune douleur au genou'],
      easier: 'Figure 4 allongé.', harder: 'Buste allongé sur la jambe.',
      pnf: 'Appuie le genou avant dans le sol.',
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
      anim: { mode: 'pingpong', dur: 2800, frames: [S({ t: 176, a1: -92, f1: 180, a2: 10, f2: 10, l1: 10, k1: 0, l2: -8, k2: -4 }), S({ hip: [62, 50], t: 172, a1: -98, f1: 176, a2: 10, f2: 10, l1: 14, k1: 2, l2: -12, k2: -6 })] },
    },
    bras_croise: {
      name: 'Épaule bras croisé', type: 'stat', level: 1, pos: 1, zones: ['epaules'], sides: true,
      cue: 'Ramène un bras tendu devant la poitrine et rapproche-le avec l\'autre main au-dessus du coude.',
      feel: 'Arrière de l\'épaule.',
      tips: ['Épaule basse', 'Ne tourne pas le buste'],
      easier: 'Moins de traction.', harder: 'Bras un peu plus haut.',
      pnf: 'Pousse le bras contre ta main.',
      anim: { mode: 'pingpong', dur: 2800, frames: [F({ aL: 84, fL: 88, aR: 30, fR: -100 }), F({ aL: 80, fL: 86, aR: 26, fR: -104 })] },
    },
    triceps_tete: {
      name: 'Triceps derrière la tête', type: 'stat', level: 1, pos: 1, zones: ['epaules'], sides: true,
      cue: 'Lève un bras, plie le coude derrière la tête et appuie doucement sur le coude avec l\'autre main.',
      feel: 'Arrière du bras et sous l\'aisselle.',
      tips: ['Tête droite', 'Côtes rentrées, pas de cambrure'],
      easier: 'Sans appuyer.', harder: 'Coude plus derrière.',
      anim: { mode: 'pingpong', dur: 2800, frames: [F({ aL: 168, fL: 10, aR: 200, fR: -120 }), F({ aL: 174, fL: 14, aR: 204, fR: -124 })] },
    },
    inclinaison: {
      name: 'Inclinaison latérale', type: 'stat', level: 1, pos: 1, zones: ['flancs', 'dos'], sides: true,
      cue: 'Debout, lève un bras et penche-toi de côté, comme pour l\'allonger au-dessus de la tête.',
      feel: 'Tout le flanc du côté du bras levé.',
      tips: ['Ne bascule pas en avant', 'Pieds bien ancrés'],
      easier: 'Main sur la hanche.', harder: 'Les deux bras au-dessus de la tête.',
      anim: { mode: 'pingpong', dur: 3000, frames: [F({ hip: [62, 50], t: 196, n: 200, aR: 200, fR: 228, aL: -12, fL: -6 }), F({ hip: [64, 50], t: 204, n: 210, aR: 208, fR: 240, aL: -14, fL: -8 })] },
    },
    nuque: {
      name: 'Nuque inclinée', type: 'stat', level: 1, pos: 1, zones: ['nuque'], sides: true, flags: ['nuque'],
      cue: 'Penche doucement l\'oreille vers l\'épaule, épaule opposée relâchée vers le bas.',
      feel: 'Côté du cou.',
      tips: ['Jamais de tirage avec la main', 'Mouvement très lent'],
      easier: 'Petite inclinaison.', harder: 'Laisse le poids de la tête faire le travail.',
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
  };

  /* Zones et objectifs */
  B.ZONES = {
    ischios: 'Arrière des cuisses', hanches: 'Hanches', fessiers: 'Fessiers', adducteurs: 'Adducteurs', quadriceps: 'Quadriceps',
    mollets: 'Mollets', chevilles: 'Chevilles', dos: 'Dos', flancs: 'Flancs', epaules: 'Épaules', pectoraux: 'Pectoraux', nuque: 'Nuque', detente: 'Détente',
  };
  B.FOCUS = {
    complet: { name: 'Corps entier', zones: { ischios: 1, hanches: 1, fessiers: 0.8, adducteurs: 0.8, quadriceps: 0.7, mollets: 0.6, chevilles: 0.5, dos: 1, flancs: 0.6, epaules: 0.9, pectoraux: 0.6, nuque: 0.3 } },
    hanches: { name: 'Hanches', zones: { hanches: 1, fessiers: 1, adducteurs: 0.9, quadriceps: 0.6, ischios: 0.5 } },
    ischios: { name: 'Toucher ses pieds', zones: { ischios: 1, mollets: 0.7, dos: 0.5, hanches: 0.3 } },
    facial: { name: 'Grand écart facial', zones: { ischios: 1, hanches: 1, quadriceps: 0.9, mollets: 0.4 } },
    lateral: { name: 'Grand écart latéral', zones: { adducteurs: 1, ischios: 0.7, fessiers: 0.6, hanches: 0.6 } },
    dos: { name: 'Dos et colonne', zones: { dos: 1, flancs: 0.9, epaules: 0.6, hanches: 0.5, ischios: 0.4 } },
    epaules: { name: 'Épaules et haut du corps', zones: { epaules: 1, pectoraux: 1, dos: 0.6, nuque: 0.6, flancs: 0.5 } },
    chevilles: { name: 'Chevilles et mollets', zones: { chevilles: 1, mollets: 1, hanches: 0.4 } },
  };
  B.MOMENTS = {
    souplesse: { name: 'Séance souplesse', dyn: 0.22 },
    reveil: { name: 'Réveil', dyn: 0.5, noFlex: true },
    avant: { name: 'Avant le sport', dyn: 0.75, maxHold: 25 },
    soir: { name: 'Détente du soir', dyn: 0.12, relax: true },
  };
  B.LEVELS = { 1: { name: 'Débutant', hold: 30 }, 2: { name: 'Intermédiaire', hold: 45 }, 3: { name: 'Avancé', hold: 60 } };

  B.PREP = 6;
  B.SWITCH = 5;
  B.stepSeconds = (id, sec) => { const st = B.stretches[id]; return B.PREP + (st.sides ? sec * 2 + B.SWITCH : sec); };
  B.sessionSeconds = (s) => s.steps.reduce((a, [id, sec]) => a + B.stepSeconds(id, sec), 0);

  /* Séances prêtes (construites à la main selon docs/savoir.md) */
  B.sessions = [
    { id: 'reveil', name: 'Réveil en douceur', tag: 'Mobilité', desc: 'Pour le matin : on réveille les articulations sans forcer le dos.', steps: [['cercles_bras', 30], ['chat_vache', 40], ['fente_dynamique', 25], ['cheville_genou', 20], ['squat_profond', 40], ['charniere', 30]] },
    { id: 'hanches', name: 'Souplesse hanches et ischios', tag: 'Souplesse', desc: 'Échauffement, puis maintiens longs pour gagner en amplitude.', steps: [['balancier_jambe', 25], ['squat_profond', 40], ['fente_basse', 45], ['demi_grand_ecart', 45], ['pigeon', 45], ['ischio_allonge', 45], ['figure_quatre', 40], ['respiration', 45]] },
    { id: 'avant', name: 'Avant le sport', tag: 'Mobilité', desc: 'Du dynamique pour préparer le corps sans perdre en force.', steps: [['cercles_bras', 30], ['balancier_jambe', 20], ['balancier_lateral', 20], ['squat_profond', 30], ['fente_dynamique', 20], ['kick_controle', 15]] },
    { id: 'soir', name: 'Détente du soir', tag: 'Souplesse', desc: 'Des postures douces au sol pour relâcher avant de dormir.', steps: [['chat_vache', 40], ['posture_enfant', 60], ['papillon', 60], ['figure_quatre', 45], ['ischio_allonge', 45], ['respiration', 60]] },
  ];
})(typeof window !== 'undefined' ? window : globalThis);
