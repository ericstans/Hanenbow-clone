import p5 from "p5";


const sketch = (p) => {
    // Canvas and game constants
    const WIDTH = 800;
    const HEIGHT = 600;
    const LEAFS = [
        { x: 400, y: 300, angle: -0.5, length: 120 },
        { x: 500, y: 400, angle: 0.3, length: 120 },
        { x: 300, y: 450, angle: 0.7, length: 120 },
        { x: 600, y: 250, angle: -0.8, length: 120 },
        { x: 200, y: 350, angle: 0.5, length: 120 },
    ];
    let draggingLeaf = null;
    let dragMode = null; // 'move', 'rotate', 'resize'
    let dragOffset = { x: 0, y: 0, angle: 0, length: 0 };
    let droplets = [];
    let launching = false;
    let launchStart = null;

    p.setup = () => {
        p.createCanvas(WIDTH, HEIGHT);
        p.background(34);
    };

    p.draw = () => {
        p.background(34);
        // Draw leaves
        for (const [i, leaf] of LEAFS.entries()) {
            p.push();
            p.translate(leaf.x, leaf.y);
            p.rotate(leaf.angle);
            p.fill(60, 200, 60);
            p.ellipse(0, 0, leaf.length, 20);
            // Draw handles if dragging or hovered
            if (draggingLeaf === i || isMouseOverLeaf(leaf)) {
                // Move handle (center)
                p.stroke(255, 255, 0);
                p.strokeWeight(2);
                p.noFill();
                p.ellipse(0, 0, 28, 28);
                // Rotate handle (right end)
                p.stroke(0, 255, 255);
                p.ellipse(leaf.length / 2, 0, 18, 18);
                // Resize handle (left end)
                p.stroke(255, 100, 255);
                p.ellipse(-leaf.length / 2, 0, 18, 18);
                p.noStroke();
            }
            p.pop();
        }
        // Draw droplets
        for (const d of droplets) {
            p.fill(100, 180, 255);
            p.ellipse(d.x, d.y, 16, 16);
        }
        // Draw launch vector
        if (launching && launchStart) {
            p.stroke(255, 100, 100);
            p.line(launchStart.x, launchStart.y, p.mouseX, p.mouseY);
            p.noStroke();
        }
        // Update droplets
        for (const d of droplets) {
            d.x += d.vx;
            d.y += d.vy;
            d.vy += 0.15; // gravity
            // Collide with leaves
            for (const leaf of LEAFS) {
                if (collideLeaf(d, leaf)) {
                    bounceOffLeaf(d, leaf);
                    // Play sound: pitch based on leaf length (longer = lower)
                    const minFreq = 220;
                    const maxFreq = 880;
                    const freq = maxFreq - (leaf.length - 40) / (200 - 40) * (maxFreq - minFreq);
                    playBounceSound(freq);
                }
            }
        }
        // Remove offscreen droplets
        droplets = droplets.filter(d => d.x > -20 && d.x < WIDTH + 20 && d.y < HEIGHT + 20);
    };

    p.mousePressed = () => {
        // Check if clicking a leaf handle
        for (let i = 0; i < LEAFS.length; i++) {
            const leaf = LEAFS[i];
            const local = toLeafLocal(leaf, p.mouseX, p.mouseY);
            // Move handle (center)
            if (dist(local.x, local.y, 0, 0) < 16) {
                draggingLeaf = i;
                dragMode = 'move';
                dragOffset.x = p.mouseX - leaf.x;
                dragOffset.y = p.mouseY - leaf.y;
                return;
            }
            // Rotate handle (right end)
            if (dist(local.x, local.y, leaf.length / 2, 0) < 10) {
                draggingLeaf = i;
                dragMode = 'rotate';
                dragOffset.angle = Math.atan2(p.mouseY - leaf.y, p.mouseX - leaf.x) - leaf.angle;
                return;
            }
            // Resize handle (left end)
            if (dist(local.x, local.y, -leaf.length / 2, 0) < 10) {
                draggingLeaf = i;
                dragMode = 'resize';
                dragOffset.length = leaf.length + (leaf.x - p.mouseX) * Math.cos(leaf.angle) + (leaf.y - p.mouseY) * Math.sin(leaf.angle);
                return;
            }
        }
        // Otherwise, launch droplet
        if (p.mouseY > 0 && p.mouseY < HEIGHT) {
            launching = true;
            launchStart = { x: p.mouseX, y: p.mouseY };
        }
    };

    p.mouseReleased = () => {
        draggingLeaf = null;
        dragMode = null;
        // Only launch droplet if not dragging a leaf
        if (launching && launchStart) {
            const dx = p.mouseX - launchStart.x;
            const dy = p.mouseY - launchStart.y;
            droplets.push({
                x: launchStart.x,
                y: launchStart.y,
                vx: dx * 0.08,
                vy: dy * 0.08,
            });
        }
        launching = false;
        launchStart = null;
    };
    p.mouseDragged = () => {
        if (draggingLeaf !== null) {
            const leaf = LEAFS[draggingLeaf];
            if (dragMode === 'move') {
                leaf.x = p.mouseX - dragOffset.x;
                leaf.y = p.mouseY - dragOffset.y;
            } else if (dragMode === 'rotate') {
                leaf.angle = Math.atan2(p.mouseY - leaf.y, p.mouseX - leaf.x) - dragOffset.angle;
            } else if (dragMode === 'resize') {
                // Project mouse position onto leaf's axis
                const dx = p.mouseX - leaf.x;
                const dy = p.mouseY - leaf.y;
                const proj = dx * Math.cos(leaf.angle) + dy * Math.sin(leaf.angle);
                leaf.length = Math.max(40, Math.abs(proj) * 2);
            }
        }
    };
    function toLeafLocal(leaf, x, y) {
        // Transform (x, y) to leaf's local space
        const dx = x - leaf.x;
        const dy = y - leaf.y;
        const localX = dx * Math.cos(-leaf.angle) - dy * Math.sin(-leaf.angle);
        const localY = dx * Math.sin(-leaf.angle) + dy * Math.cos(-leaf.angle);
        return { x: localX, y: localY };
    }

    function isMouseOverLeaf(leaf) {
        const local = toLeafLocal(leaf, p.mouseX, p.mouseY);
        return Math.abs(local.x) < leaf.length / 2 && Math.abs(local.y) < 12;
    }

    function dist(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    function collideLeaf(d, leaf) {
        // Simple ellipse collision, using leaf.length
        const lx = leaf.x;
        const ly = leaf.y;
        const angle = leaf.angle;
        // Transform droplet to leaf's local space
        const dx = d.x - lx;
        const dy = d.y - ly;
        const localX = dx * Math.cos(-angle) - dy * Math.sin(-angle);
        const localY = dx * Math.sin(-angle) + dy * Math.cos(-angle);
        return Math.abs(localX) < leaf.length / 2 && Math.abs(localY) < 12;
    }

    function bounceOffLeaf(d, leaf) {
        // Reflect velocity vector over the leaf's normal
        const angle = leaf.angle;
        // Leaf's normal vector
        const nx = Math.sin(angle);
        const ny = -Math.cos(angle);
        // Dot product of velocity and normal
        const dot = d.vx * nx + d.vy * ny;
        // Reflect velocity
        d.vx = d.vx - 2 * dot * nx;
        d.vy = d.vy - 2 * dot * ny;
        // Dampen speed a bit
        d.vx *= 0.9;
        d.vy *= 0.9;
        // Move droplet out of collision
        d.x += d.vx * 2;
        d.y += d.vy * 2;
        // Play sound: pitch based on leaf length (longer = lower)
        const minFreq = 220;
        const maxFreq = 880;
        const freq = maxFreq - (leaf.length - 40) / (200 - 40) * (maxFreq - minFreq);
        playBounceSound(freq);
    }

// Web Audio API bounce sound
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playBounceSound(freq) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.2;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.15);
    osc.stop(audioCtx.currentTime + 0.15);
}
}
new p5(sketch, document.getElementById("game-container"));
