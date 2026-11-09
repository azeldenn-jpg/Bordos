/* Bord'os — bibliothèque d'étirements et séances */
(function (G) {
  const B = (G.Bord = G.Bord || {});
  const S = { hip: [60, 50] }; // debout
  const P = (o) => Object.assign({}, S, o);

  // type : 'dyn' (mobilité, en mouvement) ou 'stat' (souplesse, maintien)
  // sides : true = à faire côté gauche puis côté droit
  B.stretches = {
    cercles_bras: {
      name: 'Grands cercles de bras', type: 'dyn', zone: 'Épaules',
      cue: 'Debout, bras tendus, dessine de grands cercles lents vers l\'arrière.',
      tips: ['Garde le ventre gainé', 'Ne cambre pas le bas du dos'],
      anim: { mode: 'cycle', linear: true, dur: 700, frames: [0, 90, 180, 270, 360].map((a) => P({ a1: a, f1: a, a2: a + 20, f2: a + 20 })) },
    },
    balancier_jambe: {
      name: 'Balancier de jambe', type: 'dyn', zone: 'Hanches', sides: true,
      cue: 'Debout sur une jambe, balance l\'autre d\'avant en arrière, sans forcer.',
      tips: ['Tiens-toi à un mur si besoin', 'Augmente l\'amplitude petit à petit'],
      anim: { mode: 'pingpong', dur: 900, frames: [P({ l1: -35, k1: -40, a1: 25, f1: 25, a2: 90, f2: 95 }), P({ l1: 65, k1: 55, a1: -25, f1: -25, a2: 90, f2: 95 })] },
    },
    squat_profond: {
      name: 'Squat profond', type: 'dyn', zone: 'Hanches, chevilles',
      cue: 'Pieds un peu plus larges que les hanches, descends lentement en squat profond, puis remonte.',
      tips: ['Talons au sol', 'Genoux dans l\'axe des pieds'],
      anim: { mode: 'pingpong', dur: 1600, frames: [P({ a1: 90, f1: 90, a2: 90, f2: 90 }), { hip: [54, 78], t: 150, n: 158, a1: 90, f1: 90, a2: 90, f2: 90, l1: 105, k1: -22, l2: 100, k2: -33 }] },
    },
    pince_debout: {
      name: 'Pince debout', type: 'stat', zone: 'Ischios, dos',
      cue: 'Debout, jambes tendues, enroule le dos vers l\'avant et laisse pendre les mains vers les pieds.',
      tips: ['Fléchis un peu les genoux si ça tire trop', 'Relâche la nuque'],
      anim: { mode: 'pingpong', dur: 2600, frames: [{ hip: [55, 50], t: 44, n: 24, a1: -26, f1: -72, a2: -22, f2: -68, tail: -40, curl: -14 }, { hip: [54, 50], t: 38, n: 18, a1: -30, f1: -80, a2: -26, f2: -76, tail: -40, curl: -14 }] },
    },
    quadriceps_debout: {
      name: 'Quadriceps debout', type: 'stat', zone: 'Cuisses', sides: true,
      cue: 'Debout, attrape ta cheville et ramène le talon vers les fesses, genoux serrés.',
      tips: ['Bassin légèrement basculé vers l\'avant', 'Tiens-toi à un mur pour l\'équilibre'],
      anim: { mode: 'pingpong', dur: 2600, frames: [P({ l1: -8, k1: -172, p1: 10, a1: -12, f1: -8, a2: 90, f2: 92 }), P({ l1: -14, k1: -176, p1: 6, a1: -16, f1: -12, a2: 90, f2: 92 })] },
    },
    fente_basse: {
      name: 'Fente basse', type: 'stat', zone: 'Fléchisseurs de hanche', sides: true,
      cue: 'Un genou au sol, l\'autre pied devant. Avance doucement le bassin vers l\'avant.',
      tips: ['Buste droit', 'Coussin sous le genou si besoin'],
      anim: { mode: 'pingpong', dur: 2800, frames: [
        { hip: [52, 70], t: 180, n: 180, a1: 22, f1: 42, a2: 18, f2: 38, l1: 75, k1: 36, l2: -25, k2: -90, p2: -90 },
        { hip: [55, 72], t: 183, n: 182, a1: 22, f1: 42, a2: 18, f2: 38, l1: 82, k1: 28, l2: -36, k2: -90, p2: -90 },
      ] },
    },
    posture_enfant: {
      name: 'Posture de l\'enfant', type: 'stat', zone: 'Dos, hanches',
      cue: 'À genoux, assieds-toi sur les talons et allonge le buste vers l\'avant, bras tendus devant toi.',
      tips: ['Écarte les genoux pour plus de confort', 'Respire dans le dos'],
      anim: { mode: 'pingpong', dur: 3200, frames: [
        { hip: [46, 74], t: 64, n: 93, a1: 84, f1: 88, a2: 82, f2: 86, l1: 40, k1: -90, p1: -90, l2: 40, k2: -90, p2: -90 },
        { hip: [45, 75], t: 67, n: 96, a1: 86, f1: 89, a2: 84, f2: 88, l1: 41, k1: -90, p1: -90, l2: 41, k2: -90, p2: -90 },
      ] },
    },
    pince_assise: {
      name: 'Pince assise', type: 'stat', zone: 'Ischios, mollets',
      cue: 'Assis, jambes tendues devant toi. Penche-toi vers l\'avant en gardant le dos long.',
      tips: ['Pars des hanches, pas du dos', 'Flexion des genoux autorisée'],
      anim: { mode: 'pingpong', dur: 3000, frames: [
        { hip: [36, 87], t: 132, n: 122, a1: 112, f1: 104, a2: 110, f2: 102, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180, tail: -82, curl: -7 },
        { hip: [36, 87], t: 122, n: 114, a1: 106, f1: 100, a2: 104, f2: 98, l1: 90, k1: 90, p1: 180, l2: 90, k2: 90, p2: 180, tail: -82, curl: -7 },
      ] },
    },
  };

  // Séances : liste d'étapes [id, secondes (par côté)]
  B.sessions = [
    { id: 'test', name: 'Test express', tag: 'Essai', desc: 'Pour tester la voix et l\'écran.', steps: [['cercles_bras', 20], ['pince_debout', 20], ['posture_enfant', 20]] },
    { id: 'reveil', name: 'Réveil mobilité', tag: 'Mobilité', desc: 'Réveille les articulations en douceur.', steps: [['cercles_bras', 40], ['balancier_jambe', 30], ['squat_profond', 40], ['quadriceps_debout', 30], ['pince_debout', 40]] },
    { id: 'hanches', name: 'Souplesse hanches et ischios', tag: 'Souplesse', desc: 'Des maintiens longs pour gagner en amplitude.', steps: [['fente_basse', 45], ['pince_assise', 60], ['quadriceps_debout', 40], ['posture_enfant', 60], ['pince_debout', 45]] },
  ];

  B.PREP = 6;     // secondes de préparation avant un exercice
  B.SWITCH = 5;   // secondes pour changer de côté

  B.sessionSeconds = function (s) {
    return s.steps.reduce((acc, [id, sec]) => {
      const st = B.stretches[id];
      return acc + B.PREP + (st.sides ? sec * 2 + B.SWITCH : sec);
    }, 0);
  };
})(typeof window !== 'undefined' ? window : globalThis);
