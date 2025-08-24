// Spawner model and helpers
// Exports: Spawner, createSpawner

export class Spawner {
    constructor({ x, y, angle, velocity, spawnRate }) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.velocity = velocity;
        this.spawnRate = spawnRate;
    }
}

export function createSpawner(WIDTH, HEIGHT) {
    return new Spawner({
        x: WIDTH / 2,
        y: HEIGHT / 4,
        angle: -Math.PI / 2,
        velocity: 10,
        spawnRate: 1200
    });
}
