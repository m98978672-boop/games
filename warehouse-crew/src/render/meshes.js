// Библиотека мешей. Вся геометрия рождается внутри RatCore:
// engine.tools.build.fromRecipe() → запечатанный меш → engine.tools.bridge.exportMesh().
// Игра только заливает полученные буферы в контейнер Three.js, ничего не считая руками.
window.WC = window.WC || {};

WC.meshes = (function () {
  'use strict';

  var cache = new Map();
  var stats = { meshes: 0, triangles: 0, sealed: [] };

  // Рецепты в «костном пространстве»: начало координат — сустав.
  // Формат: { parts: [{ shape, size, radius, height, offset, color }] }
  var RECIPES = {
    // --- человек (R16-модель из примитивов, читаемая в 3-м лице) ---
    pelvis: { parts: [{ shape: 'box', sx: 0.32, sy: 0.22, sz: 0.23, offset: [0, -0.22, 0], color: 'pants' }] },
    torso: { parts: [{ shape: 'box', sx: 0.36, sy: 0.40, sz: 0.22, offset: [0, 0, 0], color: 'shirt' }] },
    vest: { parts: [{ shape: 'box', sx: 0.375, sy: 0.26, sz: 0.235, offset: [0, 0.09, 0], color: 'vest' }] },
    belt: { parts: [{ shape: 'box', sx: 0.335, sy: 0.055, sz: 0.235, offset: [0, -0.05, 0], color: 'boots' }] },
    neck: { parts: [{ shape: 'cylinder', radius: 0.05, height: 0.085, segments: 8, offset: [0, 0, 0], color: 'skin' }] },
    head: { parts: [{ shape: 'box', sx: 0.195, sy: 0.205, sz: 0.20, offset: [0, 0, 0], color: 'skin' }] },
    ear: { parts: [{ shape: 'sphere', radius: 0.028, segments: 10, offset: [0, 0.06, 0], color: 'skin' }] },
    hair: { parts: [{ shape: 'box', sx: 0.205, sy: 0.075, sz: 0.21, offset: [0, 0.135, 0], color: 'hair' }] },
    hairBack: { parts: [{ shape: 'box', sx: 0.20, sy: 0.13, sz: 0.045, offset: [0, 0.035, -0.09], color: 'hair' }] },
    eye: { parts: [{ shape: 'box', sx: 0.045, sy: 0.038, sz: 0.02, offset: [0, 0.056, 0.096], color: '#f6f2e9' }] },
    pupil: { parts: [{ shape: 'box', sx: 0.02, sy: 0.026, sz: 0.014, offset: [0, 0.054, 0.104], color: '#20262a' }] },
    brow: { parts: [{ shape: 'box', sx: 0.062, sy: 0.016, sz: 0.012, offset: [0, 0.092, 0.101], color: 'hair' }] },
    nose: { parts: [{ shape: 'box', sx: 0.04, sy: 0.05, sz: 0.035, offset: [0, 0.012, 0.108], color: 'skin' }] },
    mouth: { parts: [{ shape: 'box', sx: 0.055, sy: 0.013, sz: 0.012, offset: [0, -0.032, 0.101], color: '#8a5a4a' }] },
    upperArm: { parts: [{ shape: 'cylinder', radius: 0.052, height: 0.27, segments: 8, offset: [0, -0.27, 0], color: 'shirt' }] },
    forearm: { parts: [{ shape: 'cylinder', radius: 0.044, height: 0.25, segments: 8, offset: [0, -0.25, 0], color: 'skin' }] },
    hand: { parts: [{ shape: 'box', sx: 0.08, sy: 0.10, sz: 0.065, offset: [0, -0.10, 0], color: 'gloves' }] },
    thigh: { parts: [{ shape: 'box', sx: 0.145, sy: 0.38, sz: 0.16, offset: [0, -0.38, 0], color: 'pants' }] },
    shin: { parts: [{ shape: 'box', sx: 0.115, sy: 0.34, sz: 0.13, offset: [0, -0.34, 0], color: 'pantsDark' }] },
    foot: { parts: [{ shape: 'box', sx: 0.13, sy: 0.07, sz: 0.235, offset: [0, -0.07, 0.045], color: 'boots' }] },
    badge: { parts: [{ shape: 'box', sx: 0.075, sy: 0.045, sz: 0.018, offset: [0.095, 0.20, 0.116], color: '#f2ecdf' }] },
    strap: { parts: [{ shape: 'box', sx: 0.33, sy: 0.035, sz: 0.012, offset: [0, 0.145, 0.122], color: '#f4e6b8' }] },
    vestBackReflective: { parts: [{ shape: 'box', sx: 0.37, sy: 0.025, sz: 0.012, offset: [0, 0.21, -0.126], color: '#f4e6b8' }] },
    vestReflective: { parts: [{ shape: 'box', sx: 0.37, sy: 0.025, sz: 0.012, offset: [0, 0.27, 0.122], color: '#f4e6b8' }] },
    strap2: { parts: [{ shape: 'box', sx: 0.33, sy: 0.03, sz: 0.012, offset: [0, 0.20, 0.122], color: '#f4e6b8' }] },
    collar: { parts: [{ shape: 'cylinder', radius: 0.082, height: 0.05, segments: 10, offset: [0, 0.35, 0], color: 'shirtDark' }] },
    buckle: { parts: [{ shape: 'box', sx: 0.055, sy: 0.04, sz: 0.014, offset: [0, -0.045, 0.126], color: '#c9cfd4' }] },
    pocket: { parts: [{ shape: 'box', sx: 0.09, sy: 0.07, sz: 0.012, offset: [-0.105, 0.16, 0.121], color: 'vestDark' }] },
    // Суставы-шарики прячут щели между сегментами.
    // ПРИМЕЧАНИЕ: примитивы движка растут от y=0 вверх, поэтому offset.y
    // сдвигает деталь вниз на её радиус — тогда центр ложится на сустав.
    shoulderPad: { parts: [{ shape: 'sphere', radius: 0.072, segments: 10, offset: [0, -0.072, 0], color: 'shirt' }] },
    elbowPad: { parts: [{ shape: 'sphere', radius: 0.05, segments: 8, offset: [0, -0.05, 0], color: 'skin' }] },
    hipPad: { parts: [{ shape: 'sphere', radius: 0.077, segments: 8, offset: [0, -0.077, 0], color: 'pants' }] },
    kneePad: { parts: [{ shape: 'sphere', radius: 0.058, segments: 8, offset: [0, -0.058, 0], color: 'pantsDark' }] },
    anklePad: { parts: [{ shape: 'sphere', radius: 0.048, segments: 8, offset: [0, -0.048, 0], color: 'boots' }] },
    gloveSeam: { parts: [{ shape: 'box', sx: 0.065, sy: 0.012, sz: 0.012, offset: [0, -0.055, 0.036], color: '#d5c8ae' }] },
    sleeveCuff: { parts: [{ shape: 'cylinder', radius: 0.053, height: 0.035, segments: 10, offset: [0, -0.27, 0], color: 'shirtDark' }] },
    kneeGuard: { parts: [{ shape: 'box', sx: 0.11, sy: 0.11, sz: 0.025, offset: [0, -0.085, 0.065], color: 'pantsDark' }] },
    thumb: { parts: [{ shape: 'box', sx: 0.03, sy: 0.055, sz: 0.032, offset: [-0.05, -0.085, 0.03], color: 'gloves' }] },
    bootLaces: { parts: [{ shape: 'box', sx: 0.08, sy: 0.02, sz: 0.04, offset: [0, -0.02, 0.16], color: '#c3b999' }] },
    sole: { parts: [{ shape: 'box', sx: 0.14, sy: 0.032, sz: 0.25, offset: [0, -0.102, 0.05], color: 'bootsDark' }] },
    // Каска: купол, поля и лямка под подбородком
    // Купол каски лежит на макушке (голова 0..0.205), поля — по лбу.
    hardhat: { parts: [{ shape: 'sphere', radius: 0.118, segments: 14, offset: [0, 0.148, 0], color: 'hat' }] },
    hatBrim: { parts: [{ shape: 'cylinder', radius: 0.142, height: 0.016, segments: 16, offset: [0, 0.172, 0.004], color: 'hat' }] },
    hatPeak: { parts: [{ shape: 'box', sx: 0.17, sy: 0.02, sz: 0.09, offset: [0, 0.168, 0.112], color: 'hat' }] },
    hatBand: { parts: [{ shape: 'cylinder', radius: 0.108, height: 0.026, segments: 16, offset: [0, 0.166, 0], color: 'hatBand' }] },

    // --- склад ---
    floor: { parts: [{ shape: 'box', sx: 26, sy: 0.2, sz: 17, offset: [0, -0.2, 0], color: '#3c494b' }] },
    floorSeamX: { parts: [{ shape: 'box', sx: 26, sy: 0.003, sz: 0.025, offset: [0, 0, 0], color: '#364346' }] },
    floorSeamZ: { parts: [{ shape: 'box', sx: 0.025, sy: 0.003, sz: 17, offset: [0, 0, 0], color: '#364346' }] },
    floorStripe: { parts: [{ shape: 'box', sx: 26, sy: 0.02, sz: 0.18, offset: [0, 0, 0], color: '#6a5a38' }] },
    wall: { parts: [{ shape: 'box', sx: 26, sy: 3.4, sz: 0.2, offset: [0, 0, 0], color: '#34414a' }] },
    wallSide: { parts: [{ shape: 'box', sx: 0.2, sy: 3.4, sz: 17, offset: [0, 0, 0], color: '#303d45' }] },
    shelfBeam: { parts: [{ shape: 'box', sx: 0.10, sy: 2.35, sz: 0.10, offset: [0, 0, 0], color: '#456f91' }] },
    rackFoot: { parts: [{ shape: 'box', sx: 0.20, sy: 0.05, sz: 0.20, offset: [0, 0, 0], color: '#b8a059' }] },
    rackCrossbar: { parts: [{ shape: 'box', sx: 1.14, sy: 0.08, sz: 0.09, offset: [0, 0, 0], color: '#d8873f' }] },
    shelfBoard: { parts: [{ shape: 'box', sx: 1.15, sy: 0.06, sz: 11.4, offset: [0, 0, 0], color: '#7d8f9c' }] },
    shelfSlat: { parts: [{ shape: 'box', sx: 0.25, sy: 0.05, sz: 11.4, offset: [0, 0, 0], color: '#9cabb2' }] },
    shelfLip: { parts: [{ shape: 'box', sx: 0.035, sy: 0.11, sz: 11.4, offset: [0, 0, 0], color: '#d8873f' }] },
    pallet: { parts: [{ shape: 'box', sx: 1.2, sy: 0.12, sz: 1.0, offset: [0, 0, 0], color: '#8a6a41' }] },
    palletEdge: { parts: [{ shape: 'box', sx: 1.2, sy: 0.04, sz: 0.12, offset: [0, 0.12, 0.44], color: '#a5814f' }] },
    despatch: { parts: [{ shape: 'box', sx: 1.5, sy: 0.95, sz: 3.2, offset: [0, 0, 0], color: '#3c4a52' }] },
    despatchTop: { parts: [{ shape: 'box', sx: 1.62, sy: 0.07, sz: 3.3, offset: [0, 0.95, 0], color: '#93a4ad' }] },
    bench: { parts: [{ shape: 'box', sx: 1.8, sy: 0.12, sz: 0.55, offset: [0, 0.45, 0], color: '#6f5a3d' }] },
    benchLeg: { parts: [{ shape: 'box', sx: 0.1, sy: 0.45, sz: 0.1, offset: [0, 0, 0], color: '#4a3c2a' }] },
    lamp: { parts: [{ shape: 'box', sx: 1.5, sy: 0.08, sz: 0.26, offset: [0, 0, 0], color: '#ffe6b0' }] },
    cone: { parts: [{ shape: 'cone', radius: 0.16, height: 0.42, segments: 8, offset: [0, 0, 0], color: '#e2604f' }] },
    // Подсветка выбранного рабочего: тонкий блин на полу под ногами
    halo: { parts: [{ shape: 'cylinder', radius: 0.62, height: 0.015, segments: 24, offset: [0, 0, 0], color: '#e8b45a' }] },
    desk: { parts: [{ shape: 'box', sx: 1.9, sy: 0.08, sz: 0.8, offset: [0, 0.78, 0], color: '#4c5a63' }] },
    monitor: { parts: [{ shape: 'box', sx: 0.6, sy: 0.36, sz: 0.04, offset: [0, 1.10, 0], color: '#10171a' }] },
    screen: { parts: [{ shape: 'box', sx: 0.52, sy: 0.28, sz: 0.02, offset: [0, 1.14, -0.03], color: '#5aa9e6' }] },

    // --- коробки (картон + скотч + ярлык) ---
    boxSmall: { parts: [{ shape: 'box', sx: 0.42, sy: 0.30, sz: 0.34, offset: [0, 0, 0], color: '#b98a54' }] },
    boxMedium: { parts: [{ shape: 'box', sx: 0.52, sy: 0.40, sz: 0.42, offset: [0, 0, 0], color: '#ad7f4c' }] },
    boxBig: { parts: [{ shape: 'box', sx: 0.62, sy: 0.52, sz: 0.50, offset: [0, 0, 0], color: '#a2763f' }] },
    tape: { parts: [{ shape: 'box', sx: 0.10, sy: 0.012, sz: 0.44, offset: [0, 0.001, 0], color: '#e6d9bd' }] },
    label: { parts: [{ shape: 'box', sx: 0.18, sy: 0.01, sz: 0.13, offset: [0, 0.002, 0], color: '#f2ecdf' }] },

    bloodDrop: { parts: [{ shape: 'sphere', radius: 0.035, segments: 8, offset: [0, 0, 0], color: '#a52e32' }] },
    bloodPool: { parts: [{ shape: 'cylinder', radius: 0.12, height: 0.008, segments: 12, offset: [0, 0, 0], color: '#762629' }] },

    // --- анатомия для инспектора ---
    skinTorso: { parts: [{ shape: 'box', sx: 0.40, sy: 0.52, sz: 0.24, offset: [0, -0.26, 0], color: '#d9a982' }] },
    skinPelvis: { parts: [{ shape: 'box', sx: 0.34, sy: 0.22, sz: 0.24, offset: [0, -0.22, 0], color: '#c99a72' }] },
    plate: { parts: [{ shape: 'box', sx: 0.18, sy: 0.24, sz: 0.035, offset: [0, 0, 0], color: '#e3b48c' }] },
    brainOrgan: { parts: [{ shape: 'sphere', radius: 0.088, segments: 12, offset: [0, 0, 0], color: '#e7b3c7' }] },
    heartOrgan: { parts: [{ shape: 'sphere', radius: 0.058, segments: 12, offset: [0, 0, 0], color: '#c0392b' }] },
    lungOrgan: { parts: [{ shape: 'sphere', radius: 0.075, segments: 10, offset: [0, 0, 0], color: '#e08585' }] },
    stomachOrgan: { parts: [{ shape: 'sphere', radius: 0.062, segments: 10, offset: [0, 0, 0], color: '#c48a63' }] },
    liverOrgan: { parts: [{ shape: 'box', sx: 0.18, sy: 0.09, sz: 0.13, offset: [0, 0, 0], color: '#7e3f34' }] },
    kidneyOrgan: { parts: [{ shape: 'sphere', radius: 0.042, segments: 8, offset: [0, 0, 0], color: '#8e4a54' }] },
    intestine: { parts: [{ shape: 'box', sx: 0.30, sy: 0.055, sz: 0.16, offset: [0, 0, 0], color: '#c97c6b' }] },
    boneLong: { parts: [{ shape: 'box', sx: 0.045, sy: 0.34, sz: 0.045, offset: [0, 0, 0], color: '#e8e2d2' }] },
    ribBone: { parts: [{ shape: 'box', sx: 0.018, sy: 0.17, sz: 0.018, offset: [0, 0, 0], color: '#ded8c6' }] },
    vertebra: { parts: [{ shape: 'box', sx: 0.07, sy: 0.045, sz: 0.07, offset: [0, 0, 0], color: '#d6d0bf' }] },
    muscleBelly: { parts: [{ shape: 'box', sx: 0.30, sy: 0.34, sz: 0.16, offset: [0, 0, 0], color: '#a8483f' }] },
    cutPlane: { parts: [{ shape: 'box', sx: 0.44, sy: 0.78, sz: 0.26, offset: [0, -0.39, 0], color: '#e8b45a' }] },

    // --- двор и фуры (доки снаружи цеха) ---
    yard: { parts: [{ shape: 'box', sx: 42, sy: 0.2, sz: 26, offset: [0, -0.24, 0], color: '#1d2224' }] },
    yardLine: { parts: [{ shape: 'box', sx: 12, sy: 0.02, sz: 0.16, offset: [0, 0, 0], color: '#585c46' }] },
    dockPlate: { parts: [{ shape: 'box', sx: 1.5, sy: 0.06, sz: 2.6, offset: [0, 0, 0], color: '#6d7a82' }] },
    dockFrame: { parts: [{ shape: 'box', sx: 0.24, sy: 3.0, sz: 0.22, offset: [0, 0, 0], color: '#3b4a52' }] },
    dockLamp: { parts: [{ shape: 'sphere', radius: 0.13, segments: 8, offset: [0, 0, 0], color: '#e2604f' }] },
    truckTrailer: { parts: [{ shape: 'box', sx: 5.2, sy: 2.5, sz: 2.45, offset: [0, 1.95, 0], color: '#d6dade' }] },
    truckStripe: { parts: [{ shape: 'box', sx: 5.24, sy: 0.34, sz: 2.48, offset: [0, 1.05, 0], color: '#2f6f63' }] },
    truckCab: { parts: [{ shape: 'box', sx: 1.9, sy: 1.85, sz: 2.3, offset: [0, 1.42, 0], color: '#7d3b34' }] },
    truckGlass: { parts: [{ shape: 'box', sx: 0.1, sy: 0.7, sz: 1.9, offset: [0, 1.85, 0], color: '#3d5560' }] },
    truckDoor: { parts: [{ shape: 'box', sx: 0.14, sy: 2.3, sz: 2.3, offset: [0, 1.9, 0], color: '#b9c0c4' }] },
    truckWheel: { parts: [{ shape: 'cylinder', radius: 0.46, height: 0.3, segments: 12, offset: [0, 0, 0], color: '#191d1f' }] },
    truckChassis: { parts: [{ shape: 'box', sx: 6.4, sy: 0.24, sz: 2.1, offset: [0, 0.78, 0], color: '#2b3236' }] },
    truckHub: { parts: [{ shape: 'cylinder', radius: 0.22, height: 0.04, segments: 16, offset: [0, 0, 0], color: '#9babb1' }] },
    truckBumper: { parts: [{ shape: 'box', sx: 0.24, sy: 0.28, sz: 2.2, offset: [0, 0, 0], color: '#28343a' }] },
    truckGrille: { parts: [{ shape: 'box', sx: 0.035, sy: 0.32, sz: 1.18, offset: [0, 0, 0], color: '#202b30' }] },
    truckLight: { parts: [{ shape: 'box', sx: 0.045, sy: 0.16, sz: 0.31, offset: [0, 0, 0], color: '#f6e2a4' }] },
    truckMirror: { parts: [{ shape: 'box', sx: 0.18, sy: 0.25, sz: 0.10, offset: [0, 0, 0], color: '#223238' }] },
    truckSideWindow: { parts: [{ shape: 'box', sx: 0.85, sy: 0.55, sz: 0.025, offset: [0, 0, 0], color: '#526f7a' }] },
    truckHandle: { parts: [{ shape: 'box', sx: 0.25, sy: 0.045, sz: 0.025, offset: [0, 0, 0], color: '#bbc5c7' }] },
    truckTailLight: { parts: [{ shape: 'box', sx: 0.04, sy: 0.16, sz: 0.24, offset: [0, 0, 0], color: '#b32f29' }] },
    truckStep: { parts: [{ shape: 'box', sx: 0.70, sy: 0.07, sz: 0.18, offset: [0, 0, 0], color: '#69777c' }] },
    truckRail: { parts: [{ shape: 'box', sx: 4.9, sy: 0.08, sz: 0.06, offset: [0, 0, 0], color: '#e4aa4e' }] },
    forkliftWheelControl: { parts: [{ shape: 'cylinder', radius: 0.18, height: 0.035, segments: 16, offset: [0, 0, 0], color: '#252a2b' }] },
    forkliftColumn: { parts: [{ shape: 'box', sx: 0.08, sy: 0.42, sz: 0.08, offset: [0, 0, 0], color: '#30383a' }] },
    forkliftRoof: { parts: [{ shape: 'box', sx: 1.25, sy: 0.09, sz: 1.05, offset: [0, 0, 0], color: '#3d4246' }] },
    forkliftHub: { parts: [{ shape: 'cylinder', radius: 0.13, height: 0.04, segments: 12, offset: [0, 0, 0], color: '#a7b2b4' }] },
    forkliftLamp: { parts: [{ shape: 'box', sx: 0.08, sy: 0.12, sz: 0.18, offset: [0, 0, 0], color: '#fff0c0' }] },
    forkliftHydraulic: { parts: [{ shape: 'box', sx: 0.10, sy: 1.4, sz: 0.10, offset: [0, 0, 0], color: '#96a8ad' }] },
    cargoStack: { parts: [{ shape: 'box', sx: 1.0, sy: 0.9, sz: 1.6, offset: [0, 1.1, 0], color: '#9d7240' }] },

    // --- улица за южной стеной ---
    streetSlab: { parts: [{ shape: 'box', sx: 21.6, sy: 0.08, sz: 5.3, offset: [0, -0.08, 0], color: '#2f3538' }] },
    sidewalk: { parts: [{ shape: 'box', sx: 21.6, sy: 0.16, sz: 1.15, offset: [0, 0, 0], color: '#5f6669' }] },
    curb: { parts: [{ shape: 'box', sx: 21.6, sy: 0.2, sz: 0.18, offset: [0, -0.02, 0], color: '#8b9195' }] },
    roadDash: { parts: [{ shape: 'box', sx: 1.1, sy: 0.02, sz: 0.12, offset: [0, 0.005, 0], color: '#d8cf9a' }] },
    lampPost: { parts: [{ shape: 'cylinder', radius: 0.07, height: 3.6, segments: 8, offset: [0, 0, 0], color: '#3a4247' }] },
    lampHead: { parts: [{ shape: 'box', sx: 0.52, sy: 0.12, sz: 0.3, offset: [0, 0, 0], color: '#f6e3b0' }] },
    kioskBody: { parts: [{ shape: 'box', sx: 1.7, sy: 2.0, sz: 1.5, offset: [0, 0, 0], color: '#4a6f5e' }] },
    kioskGlass: { parts: [{ shape: 'box', sx: 1.2, sy: 0.9, sz: 0.06, offset: [0, 1.15, 0.76], color: '#7fb6c6' }] },
    kioskSign: { parts: [{ shape: 'box', sx: 1.4, sy: 0.3, sz: 0.06, offset: [0, 2.1, 0.78], color: '#f0d9a7' }] },
    gateFrame: { parts: [{ shape: 'box', sx: 0.18, sy: 2.6, sz: 0.22, offset: [0, 0, 0], color: '#4a555c' }] },
    fencePost: { parts: [{ shape: 'box', sx: 0.08, sy: 1.5, sz: 0.08, offset: [0, 0, 0], color: '#3d464b' }] },
    fenceBar: { parts: [{ shape: 'box', sx: 1.6, sy: 0.05, sz: 0.05, offset: [0, 0, 0], color: '#4a555c' }] },

    // --- туалет: отдельная комната и санитарное оборудование ---
    toiletSide: { parts: [{ shape: 'box', sx: 0.08, sy: 2.5, sz: 2.0, offset: [0, 0, 0], color: '#9ba9a4' }] },
    toiletBack: { parts: [{ shape: 'box', sx: 2.8, sy: 2.5, sz: 0.08, offset: [0, 0, 0], color: '#9ba9a4' }] },
    toiletFront: { parts: [{ shape: 'box', sx: 0.6, sy: 2.5, sz: 0.08, offset: [0, 0, 0], color: '#899b97' }] },
    toiletDoor: { parts: [{ shape: 'box', sx: 1.55, sy: 2.1, sz: 0.07, offset: [0, 0, 0], color: '#54716d' }] },
    toiletHandle: { parts: [{ shape: 'sphere', radius: 0.045, segments: 10, offset: [0, 0, 0], color: '#e5dbb8' }] },
    toiletFloor: { parts: [{ shape: 'box', sx: 2.65, sy: 0.025, sz: 1.85, offset: [0, 0, 0], color: '#c0c9bf' }] },
    toiletBowl: { parts: [{ shape: 'cylinder', radius: 0.25, height: 0.34, segments: 16, offset: [0, 0, 0], color: '#eef0df' }] },
    toiletTank: { parts: [{ shape: 'box', sx: 0.40, sy: 0.40, sz: 0.17, offset: [0, 0, 0], color: '#e8ece1' }] },
    toiletSeat: { parts: [{ shape: 'cylinder', radius: 0.23, height: 0.05, segments: 16, offset: [0, 0, 0], color: '#536b6a' }] },
    toiletFaucet: { parts: [{ shape: 'box', sx: 0.055, sy: 0.19, sz: 0.055, offset: [0, 0, 0], color: '#718887' }] },
    toiletSink: { parts: [{ shape: 'box', sx: 0.46, sy: 0.12, sz: 0.34, offset: [0, 0, 0], color: '#e8ece1' }] },

    // --- отдел тяжёлого груза и техника ---
    heavyPad: { parts: [{ shape: 'box', sx: 4.6, sy: 0.03, sz: 3.0, offset: [0, 0, 0], color: '#3a4144' }] },
    heavyStripe: { parts: [{ shape: 'box', sx: 4.6, sy: 0.02, sz: 0.14, offset: [0, 0.04, 0], color: '#c9a13f' }] },
    heavyPallet: { parts: [{ shape: 'box', sx: 1.25, sy: 0.14, sz: 1.05, offset: [0, 0, 0], color: '#7d5f38' }] },
    forkliftBody: { parts: [{ shape: 'box', sx: 1.55, sy: 0.62, sz: 0.95, offset: [0, 0.42, 0], color: '#d8a13a' }] },
    forkliftCounter: { parts: [{ shape: 'box', sx: 0.62, sy: 0.55, sz: 0.9, offset: [0, 0.44, 0], color: '#8f6a24' }] },
    forkliftMast: { parts: [{ shape: 'box', sx: 0.14, sy: 1.9, sz: 0.86, offset: [0, 0.95, 0], color: '#4b5054' }] },
    forkliftFork: { parts: [{ shape: 'box', sx: 0.95, sy: 0.07, sz: 0.14, offset: [0, 0.12, 0], color: '#5c6165' }] },
    forkliftWheel: { parts: [{ shape: 'cylinder', radius: 0.28, height: 0.2, segments: 12, offset: [0, 0, 0], color: '#1b1f21' }] },
    forkliftSeat: { parts: [{ shape: 'box', sx: 0.5, sy: 0.34, sz: 0.14, offset: [0, 0.42, 0.3], color: '#2b3033' }] },
    forkliftCage: { parts: [{ shape: 'box', sx: 0.06, sy: 1.1, sz: 0.06, offset: [0, 1.0, 0], color: '#3d4246' }] },
    forkliftBeacon: { parts: [{ shape: 'sphere', radius: 0.09, segments: 8, offset: [0, 0, 0], color: '#f0b13a' }] },
    palletStack: { parts: [{ shape: 'box', sx: 1.15, sy: 0.9, sz: 1.0, offset: [0, 0, 0], color: '#8a6a41' }] },

    // --- метки A / B / C под коробками ---
    markA: { parts: [{ shape: 'cylinder', radius: 0.3, height: 0.02, segments: 18, offset: [0, 0, 0], color: '#4fbf7a' }] },
    markB: { parts: [{ shape: 'cylinder', radius: 0.3, height: 0.02, segments: 18, offset: [0, 0, 0], color: '#4f8fdb' }] },
    markC: { parts: [{ shape: 'cylinder', radius: 0.36, height: 0.02, segments: 18, offset: [0, 0, 0], color: '#e8b45a' }] },
    dash: { parts: [{ shape: 'box', sx: 0.24, sy: 0.015, sz: 0.07, offset: [0, 0, 0], color: '#e8c88a' }] },
  };

  var FALLBACK = { hat: '#e8b45a', hatBand: '#f6f2e9', bootSole: '#15181a' };

  function resolveColor(name, palette) {
    if (!palette) return FALLBACK[name] || name;
    if (palette[name]) return palette[name];
    if (name === 'pantsDark') return WC.util.shade(palette.pants, 0.78);
    if (name === 'bootsDark') return WC.util.shade(palette.boots, 0.72);
    if (name === 'shirtDark') return WC.util.shade(palette.shirt, 0.82);
    if (name === 'vestDark') return WC.util.shade(palette.vest, 0.8);
    if (name === 'hatBand') return WC.util.shade(palette.hat || FALLBACK.hat, 0.82);
    return FALLBACK[name] || name;
  }

  function recipeKey(name, palette) {
    return name + '|' + (palette ? palette.shirt + palette.skin + (palette.hat || '') : 'neutral');
  }

  function toOps(name, palette) {
    var recipe = RECIPES[name];
    if (!recipe) throw new Error('Нет рецепта меша: ' + name);
    return recipe.parts.map(function (part) {
      var args = {
        shape: part.shape,
        sx: part.sx, sy: part.sy, sz: part.sz,
        radius: part.radius, height: part.height,
        segments: part.segments,
        color: resolveColor(part.color, palette),
      };
      Object.keys(args).forEach(function (key) { if (args[key] == null) delete args[key]; });
      return { tool: 'build.primitive', args: args, offset: part.offset || [0, 0, 0] };
    });
  }

  function geometryFromPayload(payload) {
    // Контейнер — Three.PlaneGeometry (правила RatCore запрещают создавать
    // BufferGeometry/BoxGeometry напрямую); вершины берём ТОЛЬКО из моста движка.
    var geom = new THREE.PlaneGeometry(1, 1);
    geom.setAttribute('position', new THREE.Float32BufferAttribute(payload.positions, 3));
    if (payload.normals) geom.setAttribute('normal', new THREE.Float32BufferAttribute(payload.normals, 3));
    if (payload.colors) geom.setAttribute('color', new THREE.Float32BufferAttribute(payload.colors, 4));
    geom.setIndex(payload.index);
    geom.computeBoundingSphere();
    geom.computeBoundingBox();
    return geom;
  }

  function buildOne(engine, name, palette, THREE_NS) {
    var key = recipeKey(name, palette);
    if (cache.has(key)) return cache.get(key);
    var recipe = toOps(name, palette);
    // fromRecipe применяет offset только при объединении нескольких примитивов,
    // поэтому для рецепта из одной детали смещение переносим на сам объект.
    var singleOffset = recipe.length === 1 ? recipe[0].offset : null;
    var built = engine.tools.build.fromRecipe({ modelId: 'wc-' + name, ops: recipe });
    if (!built.ok) throw new Error('fromRecipe(' + name + '): ' + built.error.message);
    var exported = engine.tools.bridge.exportMesh({ mesh: built.data, format: 'threejs', name: name });
    if (!exported.ok) throw new Error('bridge.exportMesh(' + name + '): ' + exported.error.message);
    var entry = {
      name: name,
      key: key,
      geometry: geometryFromPayload(exported.data.payload),
      triCount: exported.data.triCount,
      meshId: exported.data.meshId,
      vertexCount: exported.data.vertexCount,
      bounds: exported.data.bounds,
      offset: singleOffset,
      palette: palette ? palette.shirt : null,
    };
    cache.set(key, entry);
    stats.meshes += 1;
    stats.triangles += exported.data.triCount;
    stats.sealed.push({ name: name, meshId: exported.data.meshId, triCount: exported.data.triCount });
    return entry;
  }

  function makeMaterial(opts) {
    opts = opts || {};
    return new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: opts.roughness == null ? 0.82 : opts.roughness,
      metalness: opts.metalness == null ? 0.06 : opts.metalness,
      emissive: opts.emissive ? new THREE.Color(opts.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: opts.emissiveIntensity || 0,
      side: opts.side || THREE.FrontSide,
      transparent: Boolean(opts.transparent),
      opacity: opts.opacity == null ? 1 : opts.opacity,
      depthWrite: opts.depthWrite == null ? true : opts.depthWrite,
    });
  }

  // Создаёт THREE.Mesh из меша движка
  function mesh(engine, name, palette, opts) {
    lastEngine = engine || lastEngine;
    opts = opts || {};
    var entry = buildOne(engine, name, palette || null);
    var m = new THREE.Mesh(entry.geometry, opts.material || makeMaterial(opts));
    if (entry.offset) m.position.set(entry.offset[0], entry.offset[1], entry.offset[2]);
    m.castShadow = opts.castShadow !== false;
    m.receiveShadow = opts.receiveShadow !== false;
    m.userData.meshId = entry.meshId;
    m.userData.triCount = entry.triCount;
    return m;
  }

  function buildAll(engine, palettes) {
    var names = Object.keys(RECIPES).filter(function (n) { return n.indexOf('box') !== 0 && n !== 'tape' && n !== 'label'; });
    names.forEach(function (name) { buildOne(engine, name, null); });
    ['boxSmall', 'boxMedium', 'boxBig', 'tape', 'label'].forEach(function (name) { buildOne(engine, name, null); });
    Object.keys(palettes || {}).forEach(function (id) {
      var palette = palettes[id];
      ['pelvis', 'torso', 'vest', 'belt', 'strap', 'strap2', 'collar', 'buckle', 'pocket', 'neck', 'head', 'ear', 'hair', 'hairBack', 'eye', 'pupil', 'brow', 'nose', 'mouth', 'upperArm', 'forearm', 'hand', 'thumb', 'thigh', 'shin', 'foot', 'sole', 'badge', 'shoulderPad', 'elbowPad', 'hipPad', 'kneePad', 'anklePad', 'hardhat', 'hatBrim', 'hatPeak', 'hatBand'].forEach(function (name) {
        buildOne(engine, name, palette);
      });
    });
    return stats;
  }

  var lastEngine = null;

  return {
    engineRef: function () { return lastEngine; },
    RECIPES: RECIPES,
    stats: stats,
    mesh: mesh,
    makeMaterial: makeMaterial,
    buildAll: buildAll,
    get: function (name, palette) { return cache.get(recipeKey(name, palette || null)); },
    clear: function () { cache.clear(); stats.meshes = 0; stats.triangles = 0; stats.sealed.length = 0; },
  };
})();
