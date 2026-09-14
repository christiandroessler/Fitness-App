// Strichfiguren-Animationen der Startbibliothek (Lastenheft Abschnitt 8): pro Figur
// 2–4 Schlüsselstellungen, die StickFigure.tsx als Loop abspielt und bei Bedarf
// spiegelt. Koordinatenraum: 100 (Breite) × 150 (Höhe), y wächst nach unten.
export interface Point {
  x: number;
  y: number;
}

export interface Pose {
  head: Point;
  neck: Point;
  hipC: Point;
  elbowL: Point;
  elbowR: Point;
  handL: Point;
  handR: Point;
  kneeL: Point;
  kneeR: Point;
  ankleL: Point;
  ankleR: Point;
}

type Pt = [number, number];
type RawPose = { [K in keyof Pose]: Pt };

function toPose(r: RawPose): Pose {
  const c = (t: Pt): Point => ({ x: t[0], y: t[1] });
  return {
    head: c(r.head),
    neck: c(r.neck),
    hipC: c(r.hipC),
    elbowL: c(r.elbowL),
    elbowR: c(r.elbowR),
    handL: c(r.handL),
    handR: c(r.handR),
    kneeL: c(r.kneeL),
    kneeR: c(r.kneeR),
    ankleL: c(r.ankleL),
    ankleR: c(r.ankleR)
  };
}

function m(base: RawPose, overrides: Partial<RawPose>): Pose {
  return toPose({ ...base, ...overrides });
}

// ---- Basisstellungen ----

const STAND: RawPose = {
  head: [50, 14],
  neck: [50, 24],
  hipC: [50, 72],
  elbowL: [42, 48],
  elbowR: [58, 48],
  handL: [38, 64],
  handR: [62, 64],
  kneeL: [46, 102],
  kneeR: [54, 102],
  ankleL: [46, 132],
  ankleR: [54, 132]
};

const LYING: RawPose = {
  head: [12, 108],
  neck: [24, 108],
  hipC: [55, 108],
  elbowL: [24, 92],
  elbowR: [24, 124],
  handL: [12, 82],
  handR: [12, 134],
  kneeL: [75, 98],
  kneeR: [75, 120],
  ankleL: [95, 92],
  ankleR: [95, 126]
};

const LYING_SIDE: RawPose = {
  head: [14, 98],
  neck: [25, 99],
  hipC: [55, 100],
  elbowL: [22, 116],
  elbowR: [30, 84],
  handL: [14, 126],
  handR: [20, 70],
  kneeL: [72, 108],
  kneeR: [70, 88],
  ankleL: [92, 112],
  ankleR: [88, 84]
};

const QUADRUPED: RawPose = {
  head: [16, 66],
  neck: [30, 70],
  hipC: [68, 70],
  elbowL: [32, 92],
  elbowR: [29, 89],
  handL: [34, 112],
  handR: [31, 109],
  kneeL: [66, 96],
  kneeR: [70, 93],
  ankleL: [64, 112],
  ankleR: [72, 110]
};

const SEATED: RawPose = {
  head: [50, 58],
  neck: [50, 67],
  hipC: [50, 100],
  elbowL: [40, 84],
  elbowR: [60, 84],
  handL: [35, 99],
  handR: [65, 99],
  kneeL: [33, 100],
  kneeR: [67, 100],
  ankleL: [24, 115],
  ankleR: [76, 115]
};

const HALF_KNEEL: RawPose = {
  head: [56, 44],
  neck: [56, 54],
  hipC: [54, 90],
  elbowL: [44, 70],
  elbowR: [62, 70],
  handL: [42, 88],
  handR: [64, 88],
  kneeL: [42, 112],
  kneeR: [66, 100],
  ankleL: [38, 132],
  ankleR: [68, 126]
};

const PLANK: RawPose = {
  head: [14, 54],
  neck: [24, 57],
  hipC: [60, 62],
  elbowL: [27, 78],
  elbowR: [24, 75],
  handL: [27, 92],
  handR: [24, 89],
  kneeL: [80, 66],
  kneeR: [80, 70],
  ankleL: [95, 68],
  ankleR: [95, 73]
};

// ---- Figuren der Startbibliothek ----

export const POSES: Record<string, Pose[]> = {
  // A.3 Erwärmung
  'fig-jumping-jack': [
    m(STAND, {}),
    m(STAND, {
      elbowL: [26, 20], elbowR: [74, 20], handL: [16, 4], handR: [84, 4],
      kneeL: [32, 102], kneeR: [68, 102], ankleL: [22, 132], ankleR: [78, 132]
    })
  ],
  'fig-run-in-place': [
    m(STAND, { kneeL: [38, 88], ankleL: [40, 118], kneeR: [56, 105], ankleR: [66, 128], elbowL: [56, 42], elbowR: [46, 55], handL: [60, 28], handR: [42, 66] }),
    m(STAND, { kneeR: [62, 88], ankleR: [60, 118], kneeL: [44, 105], ankleL: [34, 128], elbowR: [44, 42], elbowL: [54, 55], handR: [40, 28], handL: [58, 66] })
  ],
  'fig-high-knee-march': [
    m(STAND, { kneeL: [40, 70], ankleL: [42, 100], elbowR: [50, 40], handR: [55, 26] }),
    m(STAND, { kneeR: [60, 70], ankleR: [58, 100], elbowL: [50, 40], handL: [45, 26] })
  ],
  'fig-heel-flick': [
    m(STAND, { kneeL: [46, 96], ankleL: [40, 96] }),
    m(STAND, { kneeR: [54, 96], ankleR: [60, 96] })
  ],
  'fig-arm-circle': [
    m(STAND, { elbowL: [30, 30], elbowR: [70, 30], handL: [18, 14], handR: [82, 14] }),
    m(STAND, { elbowL: [30, 60], elbowR: [70, 60], handL: [18, 76], handR: [82, 76] })
  ],
  'fig-carioca': [
    m(STAND, { hipC: [54, 72], kneeL: [64, 100], kneeR: [46, 105], ankleL: [70, 130], ankleR: [40, 130], elbowL: [64, 45], elbowR: [40, 50] }),
    m(STAND, { hipC: [46, 72], kneeR: [36, 100], kneeL: [54, 105], ankleR: [30, 130], ankleL: [60, 130], elbowR: [36, 45], elbowL: [60, 50] })
  ],

  // A.4 Aktivierung
  'fig-glute-bridge': [
    m(LYING, {}),
    m(LYING, { hipC: [55, 92], kneeL: [75, 88], kneeR: [75, 104], ankleL: [95, 90], ankleR: [95, 106] })
  ],
  'fig-glute-bridge-sl': [
    m(LYING, { kneeR: [85, 70], ankleR: [100, 60] }),
    m(LYING, { hipC: [55, 92], kneeL: [75, 88], ankleL: [95, 90], kneeR: [92, 70], ankleR: [108, 62] })
  ],
  'fig-monster-walk': [
    m(STAND, { hipC: [46, 78], kneeL: [34, 104], kneeR: [58, 108], ankleL: [26, 132], ankleR: [62, 132] }),
    m(STAND, { hipC: [54, 78], kneeR: [66, 104], kneeL: [42, 108], ankleR: [74, 132], ankleL: [38, 132] })
  ],
  'fig-clamshell': [
    m(LYING_SIDE, { kneeR: [66, 92] }),
    m(LYING_SIDE, { kneeR: [78, 76] })
  ],
  'fig-single-leg-stance': [
    m(STAND, { elbowL: [26, 45], elbowR: [74, 45], handL: [16, 45], handR: [84, 45] }),
    m(STAND, {
      neck: [50, 40], hipC: [50, 82], head: [50, 30],
      kneeR: [70, 78], ankleR: [88, 76], kneeL: [46, 108], ankleL: [46, 134],
      elbowL: [20, 55], elbowR: [78, 55], handL: [8, 60], handR: [92, 60]
    })
  ],
  'fig-dead-bug': [
    m(LYING, { kneeL: [72, 92], kneeR: [72, 124], ankleL: [90, 88], ankleR: [90, 128], elbowL: [22, 88], elbowR: [22, 128], handL: [10, 78], handR: [10, 136] }),
    m(LYING, { kneeL: [88, 96], ankleL: [108, 100], elbowL: [8, 92], handL: [-4, 96], kneeR: [72, 124], ankleR: [90, 128], elbowR: [22, 128], handR: [10, 136] })
  ],
  'fig-band-row': [
    m(STAND, { elbowL: [30, 46], elbowR: [70, 46], handL: [18, 46], handR: [82, 46] }),
    m(STAND, { elbowL: [40, 46], elbowR: [60, 46], handL: [58, 44], handR: [42, 44] })
  ],
  'fig-calf-bounce': [
    m(STAND, {}),
    m(STAND, { ankleL: [46, 126], ankleR: [54, 126], hipC: [50, 68], neck: [50, 20], head: [50, 10] })
  ],

  // A.5 Mobilisation
  'fig-9090-switch': [
    m(SEATED, { kneeL: [30, 96], ankleL: [16, 100], kneeR: [70, 108], ankleR: [86, 100] }),
    m(SEATED, { kneeR: [70, 96], ankleR: [84, 100], kneeL: [30, 108], ankleL: [14, 100] })
  ],
  'fig-adductor-rockback': [
    m(QUADRUPED, { kneeR: [86, 78], ankleR: [98, 70] }),
    m(QUADRUPED, { hipC: [58, 74], kneeR: [90, 92], ankleR: [102, 96] })
  ],
  'fig-leg-swing-front': [
    m(STAND, { hipC: [46, 72], elbowL: [30, 60], handL: [24, 76], kneeR: [64, 90], ankleR: [76, 78] }),
    m(STAND, { hipC: [46, 72], elbowL: [30, 60], handL: [24, 76], kneeR: [40, 100], ankleR: [30, 118] })
  ],
  'fig-leg-swing-side': [
    m(STAND, { hipC: [46, 72], elbowL: [30, 60], handL: [24, 76], kneeR: [70, 100], ankleR: [82, 128] }),
    m(STAND, { hipC: [46, 72], elbowL: [30, 60], handL: [24, 76], kneeR: [30, 100], ankleR: [18, 128] })
  ],
  'fig-cat-cow': [
    m(QUADRUPED, {}),
    m(QUADRUPED, { neck: [30, 82], head: [15, 90], hipC: [68, 58] })
  ],
  'fig-open-book': [
    m(LYING_SIDE, { elbowR: [30, 84], handR: [20, 70] }),
    m(LYING_SIDE, { elbowR: [40, 60], handR: [46, 40] })
  ],
  'fig-thread-needle': [
    m(QUADRUPED, { elbowR: [29, 89], handR: [31, 109] }),
    m(QUADRUPED, { elbowR: [50, 78], handR: [72, 84] })
  ],
  'fig-worlds-greatest': [
    m(HALF_KNEEL, { elbowR: [60, 92], handR: [58, 108] }),
    m(HALF_KNEEL, { elbowR: [72, 40], handR: [80, 20] })
  ],

  // A.6 Potentiate
  'fig-cmj': [
    m(STAND, { hipC: [50, 90], neck: [50, 42], head: [50, 32], kneeL: [42, 108], kneeR: [58, 108], ankleL: [42, 132], ankleR: [58, 132], elbowL: [34, 70], elbowR: [66, 70], handL: [30, 88], handR: [70, 88] }),
    m(STAND, { hipC: [50, 56], neck: [50, 8], head: [50, -2], ankleL: [46, 140], ankleR: [54, 140], elbowL: [30, 30], elbowR: [70, 30], handL: [22, 10], handR: [78, 10] })
  ],
  'fig-pogo': [
    m(STAND, { ankleL: [46, 130], ankleR: [54, 130] }),
    m(STAND, { hipC: [50, 60], neck: [50, 12], head: [50, 2], ankleL: [46, 140], ankleR: [54, 140] })
  ],
  'fig-skater-hop': [
    m(STAND, { hipC: [40, 76], kneeL: [30, 106], ankleL: [24, 132], kneeR: [56, 90], ankleR: [70, 82], elbowR: [70, 55], handR: [80, 40] }),
    m(STAND, { hipC: [60, 76], kneeR: [70, 106], ankleR: [76, 132], kneeL: [44, 90], ankleL: [30, 82], elbowL: [30, 55], handL: [20, 40] })
  ],
  'fig-hop-sl': [
    m(STAND, { kneeR: [66, 80], ankleR: [78, 74], ankleL: [46, 130] }),
    m(STAND, { kneeR: [66, 80], ankleR: [78, 74], hipC: [50, 62], neck: [50, 14], head: [50, 4], ankleL: [46, 138] })
  ],
  'fig-drop-jump': [
    m(STAND, { hipC: [50, 66], ankleL: [46, 120], ankleR: [54, 120], kneeL: [46, 94], kneeR: [54, 94] }),
    m(STAND, { hipC: [50, 92], neck: [50, 44], head: [50, 34], kneeL: [40, 110], kneeR: [60, 110], ankleL: [38, 132], ankleR: [62, 132], elbowL: [30, 70], elbowR: [70, 70] })
  ],
  'fig-broad-jump': [
    m(STAND, { hipC: [50, 92], neck: [50, 46], head: [50, 36], kneeL: [40, 110], kneeR: [60, 110], ankleL: [38, 132], ankleR: [62, 132], elbowL: [26, 74], elbowR: [74, 74], handL: [18, 92], handR: [82, 92] }),
    m(STAND, { hipC: [70, 88], neck: [66, 40], head: [64, 30], kneeL: [58, 108], kneeR: [78, 108], ankleL: [52, 132], ankleR: [86, 132], elbowL: [58, 40], elbowR: [86, 60], handL: [66, 22], handR: [96, 46] })
  ],

  // A.7 Kraft, kniedominant
  'fig-split-squat': [
    m(STAND, { hipC: [55, 62], kneeL: [40, 92], ankleL: [38, 130], kneeR: [68, 98], ankleR: [78, 128] }),
    m(STAND, { hipC: [55, 88], neck: [55, 42], head: [55, 32], kneeL: [38, 102], ankleL: [36, 130], kneeR: [72, 112], ankleR: [80, 128] })
  ],
  'fig-bss': [
    m(STAND, { hipC: [52, 62], kneeL: [38, 92], ankleL: [36, 130], kneeR: [70, 96], ankleR: [82, 104] }),
    m(STAND, { hipC: [52, 88], neck: [52, 42], head: [52, 32], kneeL: [36, 104], ankleL: [34, 130], kneeR: [74, 108], ankleR: [86, 104] })
  ],
  'fig-bss-db': [
    m(STAND, { hipC: [52, 62], kneeL: [38, 92], ankleL: [36, 130], kneeR: [70, 96], ankleR: [82, 104], elbowL: [40, 60], elbowR: [64, 60], handL: [38, 76], handR: [66, 76] }),
    m(STAND, { hipC: [52, 88], neck: [52, 42], head: [52, 32], kneeL: [36, 104], ankleL: [34, 130], kneeR: [74, 108], ankleR: [86, 104], elbowL: [38, 66], elbowR: [66, 66], handL: [36, 82], handR: [68, 82] })
  ],
  'fig-bss-pause': [
    m(STAND, { hipC: [52, 88], neck: [52, 42], head: [52, 32], kneeL: [36, 104], ankleL: [34, 130], kneeR: [74, 108], ankleR: [86, 104], elbowL: [38, 66], elbowR: [66, 66], handL: [36, 82], handR: [68, 82] }),
    m(STAND, { hipC: [52, 89], neck: [52, 43], head: [52, 33], kneeL: [36, 104], ankleL: [34, 130], kneeR: [74, 108], ankleR: [86, 104], elbowL: [38, 66], elbowR: [66, 66], handL: [36, 82], handR: [68, 82] })
  ],
  'fig-step-up': [
    m(STAND, { hipC: [54, 84], ankleL: [40, 104], kneeL: [42, 92], ankleR: [66, 130], kneeR: [58, 108] }),
    m(STAND, { hipC: [46, 66], neck: [46, 20], head: [46, 10], ankleL: [40, 104], kneeL: [42, 90], kneeR: [58, 90], ankleR: [66, 104] })
  ],
  'fig-pistol-to-box': [
    m(STAND, { elbowL: [26, 55], elbowR: [74, 55], handL: [16, 42], handR: [84, 42], kneeR: [70, 80], ankleR: [86, 76] }),
    m(STAND, { hipC: [50, 100], neck: [50, 55], head: [50, 45], kneeL: [42, 112], ankleL: [40, 132], kneeR: [72, 108], ankleR: [88, 100], elbowL: [22, 78], elbowR: [78, 78], handL: [14, 92], handR: [86, 92] })
  ],

  // A.8 Kraft, hüftdominant
  'fig-hip-thrust-sl': [
    m(LYING, { ankleL: [90, 88], kneeL: [72, 92], kneeR: [88, 74] }),
    m(LYING, { hipC: [55, 90], ankleL: [90, 72], kneeL: [72, 78], kneeR: [96, 56] })
  ],
  'fig-rdl-sl': [
    m(STAND, { elbowL: [40, 50], elbowR: [60, 50] }),
    m(STAND, {
      head: [30, 48], neck: [35, 56], hipC: [55, 74],
      kneeL: [55, 104], ankleL: [55, 132],
      kneeR: [76, 68], ankleR: [94, 58],
      elbowL: [30, 68], handL: [25, 86], elbowR: [38, 64], handR: [33, 82]
    })
  ],
  'fig-rdl-sl-db': [
    m(STAND, { elbowL: [40, 55], handL: [38, 72], elbowR: [60, 50] }),
    m(STAND, {
      head: [30, 48], neck: [35, 56], hipC: [55, 74],
      kneeL: [55, 104], ankleL: [55, 132],
      kneeR: [76, 68], ankleR: [94, 58],
      elbowL: [26, 74], handL: [22, 94], elbowR: [38, 64], handR: [33, 82]
    })
  ],
  'fig-rdl-sl-bb': [
    m(STAND, { elbowL: [36, 55], handL: [34, 72], elbowR: [64, 55], handR: [66, 72] }),
    m(STAND, {
      head: [30, 48], neck: [35, 56], hipC: [55, 74],
      kneeL: [55, 104], ankleL: [55, 132],
      kneeR: [76, 68], ankleR: [94, 58],
      elbowL: [26, 76], handL: [24, 96], elbowR: [30, 78], handR: [28, 98]
    })
  ],
  'fig-nordic-assisted': [
    m(SEATED, { hipC: [50, 96], neck: [50, 60], head: [50, 50], kneeL: [30, 100], kneeR: [70, 100], ankleL: [20, 118], ankleR: [80, 118], elbowL: [42, 78], elbowR: [58, 78], handL: [38, 92], handR: [62, 92] }),
    m(SEATED, { hipC: [58, 92], neck: [78, 60], head: [88, 52], kneeL: [30, 100], kneeR: [70, 100], ankleL: [20, 118], ankleR: [80, 118], elbowL: [66, 66], elbowR: [82, 60], handL: [80, 78], handR: [94, 68] })
  ],
  'fig-nordic': [
    m(SEATED, { hipC: [50, 96], neck: [50, 60], head: [50, 50], kneeL: [30, 100], kneeR: [70, 100], ankleL: [20, 118], ankleR: [80, 118], elbowL: [42, 78], elbowR: [58, 78], handL: [38, 92], handR: [62, 92] }),
    m(SEATED, { hipC: [62, 90], neck: [88, 66], head: [98, 60], kneeL: [30, 100], kneeR: [70, 100], ankleL: [20, 118], ankleR: [80, 118], elbowL: [78, 66], elbowR: [90, 62], handL: [92, 78], handR: [100, 74] })
  ],
  'fig-hip-thrust-bb': [
    m(LYING, { elbowL: [30, 96], elbowR: [30, 120], handL: [40, 100], handR: [40, 116] }),
    m(LYING, { hipC: [55, 90], kneeL: [75, 88], kneeR: [75, 104], ankleL: [95, 90], ankleR: [95, 106], elbowL: [32, 78], elbowR: [32, 102], handL: [42, 82], handR: [42, 98] })
  ],

  // A.9 Kraft, Wade
  'fig-calf-raise-sl': [
    m(STAND, { hipC: [50, 74], kneeR: [66, 80], ankleR: [78, 74], ankleL: [46, 130] }),
    m(STAND, { hipC: [50, 68], kneeR: [66, 80], ankleR: [78, 74], neck: [50, 18], head: [50, 8], ankleL: [46, 126] })
  ],
  'fig-calf-raise-sl-db': [
    m(STAND, { hipC: [50, 74], kneeR: [66, 80], ankleR: [78, 74], ankleL: [46, 130], elbowR: [64, 58], handR: [66, 74] }),
    m(STAND, { hipC: [50, 68], kneeR: [66, 80], ankleR: [78, 74], neck: [50, 18], head: [50, 8], ankleL: [46, 126], elbowR: [64, 58], handR: [66, 74] })
  ],
  'fig-calf-raise-seated': [
    m(SEATED, { ankleL: [30, 118], ankleR: [70, 118], elbowL: [42, 90], elbowR: [58, 90], handL: [34, 98], handR: [66, 98] }),
    m(SEATED, { ankleL: [30, 110], ankleR: [70, 110], kneeL: [33, 96], kneeR: [67, 96], elbowL: [42, 90], elbowR: [58, 90], handL: [34, 98], handR: [66, 98] })
  ],

  // A.10 Isometrie
  'fig-iso-squat-pull': [
    m(STAND, { hipC: [50, 92], neck: [50, 46], head: [50, 36], kneeL: [40, 108], kneeR: [60, 108], ankleL: [38, 132], ankleR: [62, 132], elbowL: [40, 76], elbowR: [60, 76], handL: [40, 96], handR: [60, 96] }),
    m(STAND, { hipC: [50, 90], neck: [50, 44], head: [50, 34], kneeL: [40, 108], kneeR: [60, 108], ankleL: [38, 132], ankleR: [62, 132], elbowL: [40, 74], elbowR: [60, 74], handL: [40, 92], handR: [60, 92] })
  ],
  'fig-iso-hip-ext': [
    m(STAND, { hipC: [46, 72], elbowL: [30, 50], handL: [22, 40], kneeR: [64, 90], ankleR: [76, 82] }),
    m(STAND, { hipC: [46, 72], elbowL: [30, 50], handL: [22, 40], kneeR: [66, 92], ankleR: [80, 86] })
  ],
  'fig-iso-knee-ext': [
    m(SEATED, { hipC: [50, 96], neck: [50, 55], head: [50, 45] }),
    m(SEATED, { hipC: [50, 96], neck: [50, 55], head: [50, 45], ankleL: [22, 113], ankleR: [78, 113] })
  ],
  'fig-iso-calf': [
    m(STAND, { hipC: [50, 72], ankleL: [46, 130], ankleR: [54, 130] }),
    m(STAND, { hipC: [50, 70], ankleL: [46, 128], ankleR: [54, 128] })
  ],
  'fig-wall-sit': [
    m(SEATED, { neck: [50, 60], head: [50, 50] }),
    m(SEATED, { neck: [50, 61], head: [50, 51] })
  ],
  'fig-wall-sit-sl': [
    m(SEATED, { neck: [50, 60], head: [50, 50], kneeR: [70, 80], ankleR: [84, 74] }),
    m(SEATED, { neck: [50, 61], head: [50, 51], kneeR: [70, 80], ankleR: [84, 74] })
  ],
  'fig-spanish-squat': [
    m(SEATED, { hipC: [50, 94], neck: [56, 52], head: [58, 42], elbowL: [40, 76], elbowR: [62, 78], handL: [36, 60], handR: [66, 62] }),
    m(SEATED, { hipC: [50, 95], neck: [56, 53], head: [58, 43], elbowL: [40, 76], elbowR: [62, 78], handL: [36, 60], handR: [66, 62] })
  ],

  // A.11 Rumpf, Sagittalebene
  'fig-mcgill-curlup': [
    m(LYING, { kneeR: [76, 130], ankleR: [96, 130], elbowL: [26, 100], handL: [20, 100] }),
    m(LYING, { neck: [30, 100], head: [18, 96], kneeR: [76, 130], ankleR: [96, 130], elbowL: [26, 100], handL: [20, 100] })
  ],
  'fig-bird-dog': [
    m(QUADRUPED, {}),
    m(QUADRUPED, { elbowR: [10, 74], handR: [-6, 76], kneeR: [90, 100], ankleR: [108, 104] })
  ],
  'fig-bird-dog-adv': [
    m(QUADRUPED, { elbowR: [8, 68], handR: [-8, 60] }),
    m(QUADRUPED, { elbowR: [8, 80], handR: [-8, 96], kneeR: [90, 100], ankleR: [108, 104] })
  ],
  'fig-plank': [
    m(PLANK, {}),
    m(PLANK, { hipC: [60, 60] })
  ],
  'fig-plank-leg-lift': [
    m(PLANK, {}),
    m(PLANK, { kneeR: [82, 60], ankleR: [98, 56] })
  ],
  'fig-dead-bug-ext': [
    m(LYING, { kneeL: [80, 90], kneeR: [80, 126], ankleL: [102, 84], ankleR: [102, 132] }),
    m(LYING, { kneeL: [92, 96], kneeR: [80, 126], ankleL: [112, 106], ankleR: [102, 132] })
  ],
  'fig-superman': [
    m(LYING, { elbowL: [8, 88], handL: [-6, 82], elbowR: [8, 128], handR: [-6, 134], kneeL: [80, 92], kneeR: [80, 124], ankleL: [102, 88], ankleR: [102, 128] }),
    m(LYING, { elbowL: [10, 82], handL: [-2, 74], elbowR: [10, 134], handR: [-2, 142], kneeL: [82, 88], kneeR: [82, 128], ankleL: [106, 82], ankleR: [106, 134] })
  ],

  // A.12 Rumpf, Frontalebene
  'fig-side-plank-knee': [
    m(LYING_SIDE, { neck: [26, 78], head: [16, 72], elbowL: [24, 96], handL: [30, 90] }),
    m(LYING_SIDE, { neck: [26, 72], head: [16, 66], elbowL: [24, 96], handL: [30, 90], hipC: [55, 90] })
  ],
  'fig-side-plank': [
    m(LYING_SIDE, { neck: [26, 70], head: [16, 64], elbowL: [22, 88], handL: [26, 100], kneeL: [80, 104], ankleL: [102, 106], kneeR: [78, 88], ankleR: [98, 82] }),
    m(LYING_SIDE, { neck: [26, 64], head: [16, 58], elbowL: [22, 82], handL: [26, 94], kneeL: [80, 98], ankleL: [102, 100], kneeR: [78, 82], ankleR: [98, 76], hipC: [55, 92] })
  ],
  'fig-side-plank-abd': [
    m(LYING_SIDE, { neck: [26, 68], head: [16, 62], elbowL: [22, 86], handL: [26, 98], kneeL: [80, 102], ankleL: [102, 104], kneeR: [78, 86], ankleR: [98, 80] }),
    m(LYING_SIDE, { neck: [26, 68], head: [16, 62], elbowL: [22, 86], handL: [26, 98], kneeL: [80, 102], ankleL: [102, 104], kneeR: [76, 62], ankleR: [96, 44] })
  ],
  'fig-copenhagen-short': [
    m(LYING_SIDE, { neck: [26, 70], head: [16, 64], elbowL: [22, 88], handL: [26, 100], kneeR: [72, 78], ankleR: [78, 60], kneeL: [80, 104], ankleL: [102, 106] }),
    m(LYING_SIDE, { neck: [26, 64], head: [16, 58], elbowL: [22, 82], handL: [26, 94], kneeR: [72, 78], ankleR: [78, 60], hipC: [55, 90], kneeL: [80, 98], ankleL: [102, 100] })
  ],
  'fig-copenhagen-long': [
    m(LYING_SIDE, { neck: [26, 70], head: [16, 64], elbowL: [22, 88], handL: [26, 100], kneeR: [78, 62], ankleR: [98, 52], kneeL: [80, 104], ankleL: [102, 106] }),
    m(LYING_SIDE, { neck: [26, 64], head: [16, 58], elbowL: [22, 82], handL: [26, 94], kneeR: [78, 62], ankleR: [98, 52], hipC: [55, 90], kneeL: [80, 98], ankleL: [102, 100] })
  ],
  'fig-suitcase-hold': [
    m(STAND, { elbowL: [38, 58], handL: [36, 78], elbowR: [58, 48] }),
    m(STAND, { hipC: [52, 74], neck: [48, 24], elbowL: [40, 58], handL: [38, 78], elbowR: [56, 48] })
  ],
  'fig-side-leg-raise': [
    m(LYING_SIDE, {}),
    m(LYING_SIDE, { kneeR: [80, 78], ankleR: [98, 68] })
  ],

  // A.13 Nacken
  'fig-chin-tuck': [
    m(STAND, {}),
    m(STAND, { head: [50, 17], neck: [50, 25] })
  ],
  'fig-neck-iso-flex': [
    m(STAND, { elbowL: [40, 40], handL: [48, 22] }),
    m(STAND, { elbowL: [40, 40], handL: [48, 22], head: [51, 15] })
  ],
  'fig-neck-iso-ext': [
    m(STAND, { elbowL: [56, 32], handL: [50, 18] }),
    m(STAND, { elbowL: [56, 32], handL: [50, 18], head: [49, 13] })
  ],
  'fig-neck-iso-lat': [
    m(STAND, { elbowR: [64, 36], handR: [58, 18] }),
    m(STAND, { elbowR: [64, 36], handR: [58, 18], head: [56, 16] })
  ],
  'fig-neck-prone-hold': [
    m(LYING, { elbowL: [16, 96], handL: [10, 84], elbowR: [16, 120], handR: [10, 132] }),
    m(LYING, { head: [10, 100], neck: [22, 104], elbowL: [16, 96], handL: [10, 84], elbowR: [16, 120], handR: [10, 132] })
  ],
  'fig-neck-band': [
    m(STAND, {}),
    m(STAND, { head: [50, 12], neck: [50, 22] })
  ],

  // A.14 Hüfte und Gesäß
  'fig-crab-walk': [
    m(STAND, { hipC: [42, 82], kneeL: [32, 106], kneeR: [56, 108], ankleL: [24, 132], ankleR: [64, 132] }),
    m(STAND, { hipC: [58, 82], kneeR: [68, 106], kneeL: [44, 108], ankleR: [76, 132], ankleL: [36, 132] })
  ],
  'fig-airplane-db': [
    m(STAND, { elbowL: [26, 45], elbowR: [74, 45], handL: [14, 45], handR: [86, 45] }),
    m(STAND, {
      neck: [50, 40], hipC: [50, 82], head: [50, 30],
      kneeR: [70, 78], ankleR: [88, 76], kneeL: [46, 108], ankleL: [46, 134],
      elbowL: [16, 55], elbowR: [82, 55], handL: [2, 60], handR: [96, 60]
    })
  ],
  'fig-hip-abd-band': [
    m(STAND, { hipC: [46, 72], elbowL: [30, 55], handL: [24, 70] }),
    m(STAND, { hipC: [46, 72], elbowL: [30, 55], handL: [24, 70], kneeR: [72, 92], ankleR: [86, 92] })
  ],
  'fig-bridge-band': [
    m(LYING, {}),
    m(LYING, { hipC: [55, 92], kneeL: [70, 84], kneeR: [70, 108], ankleL: [95, 90], ankleR: [95, 106] })
  ],
  'fig-pelvic-drop': [
    m(STAND, { hipC: [50, 74], kneeR: [66, 80], ankleR: [78, 74] }),
    m(STAND, { hipC: [54, 80], kneeR: [66, 80], ankleR: [78, 74], ankleL: [44, 132] })
  ],

  // A.15 Beweglichkeit
  'fig-kneeling-hipflexor': [
    m(HALF_KNEEL, {}),
    m(HALF_KNEEL, { hipC: [56, 84], neck: [58, 48], head: [58, 38], kneeL: [40, 116], ankleL: [36, 134] })
  ],
  'fig-couch-stretch': [
    m(HALF_KNEEL, { kneeL: [44, 112], ankleL: [46, 134] }),
    m(HALF_KNEEL, { hipC: [56, 86], neck: [58, 48], head: [58, 38], kneeL: [44, 112], ankleL: [46, 134] })
  ],
  'fig-pigeon': [
    m(SEATED, { kneeL: [26, 100], ankleL: [46, 104], kneeR: [72, 106], ankleR: [86, 120] }),
    m(SEATED, { hipC: [50, 100], neck: [42, 78], head: [34, 70], kneeL: [26, 100], ankleL: [46, 104], kneeR: [72, 106], ankleR: [86, 120], elbowL: [32, 88], elbowR: [50, 88] })
  ],
  'fig-hamstring-step': [
    m(STAND, { ankleL: [40, 104], kneeL: [42, 96], hipC: [52, 76] }),
    m(STAND, { hipC: [52, 92], neck: [48, 46], head: [46, 36], ankleL: [40, 104], kneeL: [42, 98], elbowL: [30, 70], elbowR: [40, 78], handL: [24, 88], handR: [30, 96] })
  ],
  'fig-adductor-seated': [
    m(SEATED, { kneeL: [24, 108], kneeR: [76, 108], ankleL: [40, 112], ankleR: [60, 112], elbowL: [38, 96], elbowR: [62, 96] }),
    m(SEATED, { neck: [50, 74], head: [50, 64], kneeL: [22, 108], kneeR: [78, 108], ankleL: [40, 112], ankleR: [60, 112], elbowL: [36, 100], elbowR: [64, 100] })
  ],
  'fig-tspine-ext-chair': [
    m(SEATED, { hipC: [50, 104], kneeL: [30, 104], kneeR: [70, 104], neck: [50, 76], head: [50, 66], elbowL: [38, 92], elbowR: [62, 92] }),
    m(SEATED, { hipC: [50, 104], kneeL: [30, 104], kneeR: [70, 104], neck: [55, 86], head: [60, 92], elbowL: [40, 78], elbowR: [64, 78] })
  ],
  'fig-pec-doorway': [
    m(STAND, { elbowL: [26, 40], handL: [24, 22] }),
    m(STAND, { hipC: [54, 72], neck: [56, 24], head: [58, 14], elbowL: [26, 40], handL: [24, 22] })
  ],
  'fig-calf-stretch': [
    m(STAND, { hipC: [46, 72], kneeR: [66, 100], ankleR: [80, 128], elbowL: [30, 50], handL: [22, 36], elbowR: [40, 50], handR: [36, 36] }),
    m(STAND, { hipC: [44, 76], kneeR: [66, 100], ankleR: [80, 128], elbowL: [30, 50], handL: [22, 36], elbowR: [40, 50], handR: [36, 36] })
  ],
  'fig-childs-pose': [
    m(SEATED, { hipC: [55, 108], neck: [30, 92], head: [18, 88], elbowL: [30, 100], elbowR: [30, 78], handL: [14, 96], handR: [14, 76] }),
    m(SEATED, { hipC: [55, 108], neck: [30, 92], head: [18, 88], elbowL: [26, 108], elbowR: [26, 70], handL: [8, 112], handR: [8, 64] })
  ]
};

export function getPoseFrames(figurId: string | undefined): Pose[] | undefined {
  if (!figurId) return undefined;
  return POSES[figurId];
}
