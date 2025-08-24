// Leaf model and helpers
// Exports: Leaf, scaleLeaf, updateLeafsToCanvas

export class Leaf {
    constructor({ x, y, angle, length, color, dancing = false, danceRange, dancePhase = 0, baseAngle }) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.length = length;
        this.color = color.slice();
        this.dancing = dancing;
        this.danceRange = danceRange;
        this.dancePhase = dancePhase;
        this.baseAngle = baseAngle !== undefined ? baseAngle : angle;
    }
}

export function scaleLeaf(leaf, WIDTH, HEIGHT, REF_WIDTH, REF_HEIGHT) {
    return new Leaf({
        x: leaf.x / REF_WIDTH * WIDTH,
        y: leaf.y / REF_HEIGHT * HEIGHT,
        angle: leaf.angle,
        length: leaf.length * (WIDTH / REF_WIDTH),
        color: leaf.color,
        dancing: leaf.dancing || false,
        danceRange: leaf.danceRange,
        dancePhase: leaf.dancePhase || 0,
        baseAngle: leaf.baseAngle !== undefined ? leaf.baseAngle : leaf.angle,
    });
}

export function updateLeafsToCanvas(REF_LEAFS, WIDTH, HEIGHT, REF_WIDTH, REF_HEIGHT) {
    return REF_LEAFS.map(leaf => scaleLeaf(leaf, WIDTH, HEIGHT, REF_WIDTH, REF_HEIGHT));
}
