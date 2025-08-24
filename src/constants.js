// Configuration and constants for Hanenbow
// Exports: LEAF_COLORS, REF_WIDTH, REF_HEIGHT, REF_LEAFS

export const LEAF_COLORS = [
    { color: [60, 200, 60], type: 'triangle', velocityScale: 1 },     // green
    { color: [200, 60, 60], type: 'sine', velocityScale: 1.2 },       // red
    { color: [60, 120, 200], type: 'square', velocityScale: 0.5 },    // blue
    { color: [220, 200, 60], type: 'sawtooth', velocityScale: 0.7 },  // yellow
    { color: [180, 180, 180], type: 'noise', velocityScale: 0.6 },    // gray (noise)
];

export const REF_WIDTH = 800;
export const REF_HEIGHT = 600;

export const REF_LEAFS = [
    { x: 150, y: 250, angle: 0.5, length: 240, color: LEAF_COLORS[0].color },
    { x: 300, y: 450, angle: 0.7, length: 200, color: LEAF_COLORS[0].color },
    { x: 400, y: 300, angle: -0.1, length: 50, color: LEAF_COLORS[0].color },
    { x: 500, y: 400, angle: 0.3, length: 200, color: LEAF_COLORS[0].color },
    { x: 700, y: 250, angle: -0.8, length: 250, color: LEAF_COLORS[0].color }

];
