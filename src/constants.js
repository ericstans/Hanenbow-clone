// Configuration and constants for Hanenbow
// Exports: LEAF_COLORS, REF_WIDTH, REF_HEIGHT, REF_LEAFS

export const LEAF_COLORS = [
    { color: [60, 200, 60], type: 'triangle' },   // green
    { color: [200, 60, 60], type: 'sine' },       // red
    { color: [60, 120, 200], type: 'square' },    // blue
    { color: [220, 200, 60], type: 'sawtooth' },  // yellow
    { color: [180, 180, 180], type: 'noise' },    // gray (noise)
];

export const REF_WIDTH = 800;
export const REF_HEIGHT = 600;

export const REF_LEAFS = [
    { x: 200, y: 350, angle: 0.5, length: 120, color: LEAF_COLORS[0].color },
    { x: 300, y: 450, angle: 0.7, length: 100, color: LEAF_COLORS[0].color },
    { x: 400, y: 300, angle: -0.5, length: 110, color: LEAF_COLORS[0].color },
    { x: 500, y: 400, angle: 0.3, length: 130, color: LEAF_COLORS[0].color },
    { x: 600, y: 250, angle: -0.8, length: 140, color: LEAF_COLORS[0].color }

];
