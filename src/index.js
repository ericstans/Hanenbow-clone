// Sound velocity mode: 'speed', 'fixed'
let velocityMode = 'speed';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const vselect = document.getElementById('velocity-mode');
        if (vselect) {
            vselect.addEventListener('change', e => {
                velocityMode = vselect.value;
            });
        }
    });
}
// ASDR envelope values (seconds)
let envAttack = 0.01;
let envDecay = 0.05;
let envSustain = 0.2;
let envRelease = 0.15;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const a = document.getElementById('attack-slider');
        const d = document.getElementById('decay-slider');
        const s = document.getElementById('sustain-slider');
        const r = document.getElementById('release-slider');
        if (a) a.addEventListener('input', () => { envAttack = parseFloat(a.value); });
        if (d) d.addEventListener('input', () => { envDecay = parseFloat(d.value); });
        if (s) s.addEventListener('input', () => { envSustain = parseFloat(s.value); });
        if (r) r.addEventListener('input', () => { envRelease = parseFloat(r.value); });
    });
}
// Pitch quantization mode: 'none', 'major', 'minor', 'fifths', 'chromatic', 'octaves'
let quantizeMode = 'none';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('pitch-mode');
        if (select) {
            select.addEventListener('change', e => {
                pitchMode = select.value;
            });
        }
        const qselect = document.getElementById('quantize-mode');
        if (qselect) {
            qselect.addEventListener('change', e => {
                quantizeMode = qselect.value;
            });
        }
    });
}
// Sound pitch mode: 'length', 'angle', 'speed', 'bounce'
let pitchMode = 'length';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('pitch-mode');
        if (select) {
            select.addEventListener('change', e => {
                pitchMode = select.value;
            });
        }
    });
}
import p5 from "p5";


const sketch = (p) => {
    // Canvas and game constants
    let WIDTH = window.innerWidth;
    let HEIGHT = getAvailableHeight();

    // Add Leaf button logic
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            const addLeafBtn = document.getElementById('add-leaf-btn');
            if (addLeafBtn) {
                addLeafBtn.addEventListener('click', () => {
                    // Add a new leaf at a default position and color
                    const defaultColor = [60, 200, 60];
                    const newLeaf = {
                        x: WIDTH / 2,
                        y: HEIGHT / 2,
                        angle: 0,
                        length: 120,
                        color: defaultColor.slice(),
                    };
                    LEAFS.push(newLeaf);
                });
            }
        });
    }

    function getAvailableHeight() {
        // Subtract the height of controls/header from window.innerHeight
        const header = document.querySelector('h1');
        const panel = document.querySelector('.control-panel');
        const spawnerUI = document.getElementById('spawner-ui-container');
        let used = 0;
        if (header) used += header.offsetHeight;
        if (panel) used += panel.offsetHeight;
        if (spawnerUI) used += spawnerUI.offsetHeight;
        // Add a little margin
        return Math.max(200, window.innerHeight - used - 32);
    }
    // Five preset colors mapped to oscillator types (last is noise)
    const LEAF_COLORS = [
        { color: [60, 200, 60], type: 'triangle' },   // green
        { color: [200, 60, 60], type: 'sine' },       // red
        { color: [60, 120, 200], type: 'square' },    // blue
        { color: [220, 200, 60], type: 'sawtooth' },  // yellow
        { color: [180, 180, 180], type: 'noise' },    // gray (noise)
    ];
    // Reference size for default arrangement
    const REF_WIDTH = 800;
    const REF_HEIGHT = 600;
    const REF_LEAFS = [
        { x: 400, y: 300, angle: -0.5, length: 120, color: LEAF_COLORS[0].color },
        { x: 500, y: 400, angle: 0.3, length: 120, color: LEAF_COLORS[0].color },
        { x: 300, y: 450, angle: 0.7, length: 120, color: LEAF_COLORS[0].color },
        { x: 600, y: 250, angle: -0.8, length: 120, color: LEAF_COLORS[0].color },
        { x: 200, y: 350, angle: 0.5, length: 120, color: LEAF_COLORS[0].color },
    ];
    let LEAFS = [];
    let draggingLeaf = null;
    let dragMode = null; // 'move', 'rotate', 'resize', 'spawner-move', 'spawner-angle', 'spawner-velocity'
    let dragOffset = { x: 0, y: 0, angle: 0, length: 0 };
    let droplets = [];
    let launching = false;
    let launchStart = null;
    // Spawner state
    let spawners = [];
    let spawnerIntervals = [];
    // Add spawner button logic
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('add-spawner-btn');
            const spawnerOverlay = document.getElementById('spawner-ui-overlay');
            // Helper to create or update overlays
            function updateSpawnerOverlay() {
                if (!spawnerOverlay) return;
                spawnerOverlay.innerHTML = '';
                // Get canvas position for absolute overlay placement
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                spawners.forEach((spawner, i) => {
                    // Project spawner position to page coordinates
                    const x = rect.left + spawner.x;
                    const y = rect.top + spawner.y + 36; // 36px below spawner
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    wrapper.style.left = `${x - 40}px`;
                    wrapper.style.top = `${y}px`;
                    wrapper.style.pointerEvents = 'auto';
                    wrapper.style.background = 'rgba(34,34,34,0.85)';
                    wrapper.style.borderRadius = '8px';
                    wrapper.style.padding = '2px 7px 2px 7px';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.boxShadow = '0 2px 8px #0006';
                    wrapper.style.zIndex = '100';
                    const label = document.createElement('label');
                    label.textContent = `Rate:`;
                    label.style.color = '#6cf6ff';
                    label.style.fontWeight = '600';
                    label.style.fontSize = '0.95em';
                    label.style.marginRight = '0.3em';
                    const slider = document.createElement('input');
                    slider.type = 'range';
                    slider.min = '200';
                    slider.max = '3000';
                    slider.step = '10';
                    slider.value = spawner.spawnRate || 1200;
                    slider.style.width = '60px';
                    slider.style.height = '18px';
                    slider.style.margin = '0 0.3em 0 0';
                    const valueSpan = document.createElement('span');
                    valueSpan.textContent = `${Math.round((slider.value / 1000) * 100) / 100}s`;
                    valueSpan.style.fontSize = '0.95em';
                    valueSpan.style.color = '#fff';
                    slider.addEventListener('input', () => {
                        spawner.spawnRate = parseInt(slider.value);
                        valueSpan.textContent = `${Math.round((slider.value / 1000) * 100) / 100}s`;
                        // Reset interval for this spawner
                        clearInterval(spawnerIntervals[i]);
                        spawnerIntervals[i] = setInterval(() => {
                            droplets.push({
                                x: spawner.x,
                                y: spawner.y,
                                vx: spawner.velocity * Math.cos(spawner.angle),
                                vy: spawner.velocity * Math.sin(spawner.angle)
                            });
                        }, spawner.spawnRate);
                    });
                    wrapper.appendChild(label);
                    wrapper.appendChild(slider);
                    wrapper.appendChild(valueSpan);
                    spawnerOverlay.appendChild(wrapper);
                });
            }
            if (btn) {
                btn.addEventListener('click', () => {
                    // Add a new spawner at default position
                    const newSpawner = {
                        x: WIDTH / 2,
                        y: HEIGHT / 4,
                        angle: -Math.PI / 2,
                        velocity: 10,
                        spawnRate: 1200
                    };
                    spawners.push(newSpawner);
                    // Start interval for this spawner
                    const interval = setInterval(() => {
                        droplets.push({
                            x: newSpawner.x,
                            y: newSpawner.y,
                            vx: newSpawner.velocity * Math.cos(newSpawner.angle),
                            vy: newSpawner.velocity * Math.sin(newSpawner.angle)
                        });
                    }, newSpawner.spawnRate);
                    spawnerIntervals.push(interval);
                    updateSpawnerOverlay();
                });
            }
            // Update overlay on window resize or scroll
            window.addEventListener('resize', updateSpawnerOverlay);
            window.addEventListener('scroll', updateSpawnerOverlay);
            // Update overlay after each draw (to follow spawner movement)
            setInterval(updateSpawnerOverlay, 40);
            updateSpawnerOverlay();
        });
    }

    function scaleLeaf(leaf) {
        return {
            x: leaf.x / REF_WIDTH * WIDTH,
            y: leaf.y / REF_HEIGHT * HEIGHT,
            angle: leaf.angle,
            length: leaf.length * (WIDTH / REF_WIDTH),
            color: leaf.color.slice(),
        };
    }
    function updateLeafsToCanvas() {
        LEAFS = REF_LEAFS.map(scaleLeaf);
    }
    p.setup = () => {
        WIDTH = window.innerWidth;
        HEIGHT = getAvailableHeight();
        p.createCanvas(WIDTH, HEIGHT);
        p.background(34);
        updateLeafsToCanvas();
    };
    p.windowResized = () => {
        WIDTH = window.innerWidth;
        HEIGHT = getAvailableHeight();
        p.resizeCanvas(WIDTH, HEIGHT);
        updateLeafsToCanvas();
    };

    p.windowResized = () => {
        WIDTH = window.innerWidth;
        HEIGHT = window.innerHeight;
        p.resizeCanvas(WIDTH, HEIGHT);
    };

    p.draw = () => {
        p.background(34);
        // Draw all spawners
        for (const spawner of spawners) {
            p.push();
            p.translate(spawner.x, spawner.y);
            p.rotate(spawner.angle);
            // Draw spawner body
            p.stroke(80, 255, 120);
            p.strokeWeight(3);
            p.fill(80, 255, 120, 80);
            p.ellipse(0, 0, 36, 36);
            // Draw angle handle (arrow)
            p.stroke(255, 200, 0);
            p.strokeWeight(3);
            p.line(0, 0, 40, 0);
            p.fill(255, 200, 0);
            p.triangle(40, 0, 32, -7, 32, 7);
            // Draw velocity handle (circle at end of arrow)
            p.noFill();
            p.stroke(0, 200, 255);
            p.ellipse(40 + spawner.velocity * 3, 0, 18, 18);
            p.pop();
        }
        // Draw leaves
        const t = p.millis() / 1000;
        for (const [i, leaf] of LEAFS.entries()) {
            p.push();
            p.translate(leaf.x, leaf.y);
            // Animate angle if dancing
            let danceAngle = 0;
            if (leaf.dance && leaf.dance > 0) {
                if (!leaf.dancePhase) leaf.dancePhase = Math.random() * Math.PI * 2;
                danceAngle = Math.sin(t * 2.2 + leaf.dancePhase) * leaf.dance;
            }
            p.rotate(leaf.angle + danceAngle);
            p.fill(...leaf.color);
            // Double-click handler for color change or delete
            p.doubleClicked = () => {
                for (let i = 0; i < LEAFS.length; i++) {
                    const leaf = LEAFS[i];
                    const local = toLeafLocal(leaf, p.mouseX, p.mouseY);
                    // Double-click on MOVE handle (center)
                    if (dist(local.x, local.y, 0, 0) < 16) {
                        if (window.event && (window.event.ctrlKey || window.event.metaKey)) {
                            // Delete leaf if ctrl (or cmd) is held
                            LEAFS.splice(i, 1);
                        } else if (window.event && window.event.shiftKey) {
                            // Shift+double-click: toggle dancing
                            if (leaf.dance && leaf.dance > 0) {
                                leaf.dance = 0;
                            } else {
                                leaf.dance = 0.18;
                                leaf.dancePhase = Math.random() * Math.PI * 2;
                            }
                        } else {
                            // Cycle to next color in LEAF_COLORS
                            let idx = LEAF_COLORS.findIndex(c => arraysEqual(c.color, leaf.color));
                            idx = (idx + 1) % LEAF_COLORS.length;
                            leaf.color = LEAF_COLORS[idx].color;
                        }
                        return;
                    }
                }
            };

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
        // Spawner handles for all spawners
        for (let s = 0; s < spawners.length; s++) {
            const spawner = spawners[s];
            // Transform mouse to spawner local space
            const dx = p.mouseX - spawner.x;
            const dy = p.mouseY - spawner.y;
            const localX = dx * Math.cos(-spawner.angle) - dy * Math.sin(-spawner.angle);
            const localY = dx * Math.sin(-spawner.angle) + dy * Math.cos(-spawner.angle);
            // Move handle (center)
            if (Math.sqrt(localX * localX + localY * localY) < 20) {
                dragMode = 'spawner-move';
                dragOffset.x = p.mouseX - spawner.x;
                dragOffset.y = p.mouseY - spawner.y;
                dragOffset.spawnerIndex = s;
                return;
            }
            // Angle handle (arrow)
            if (Math.abs(localY) < 12 && localX > 28 && localX < 52) {
                dragMode = 'spawner-angle';
                dragOffset.angle = Math.atan2(p.mouseY - spawner.y, p.mouseX - spawner.x) - spawner.angle;
                dragOffset.spawnerIndex = s;
                return;
            }
            // Velocity handle (circle at end)
            const velHandleX = 40 + spawner.velocity * 3;
            if (Math.abs(localY) < 12 && Math.abs(localX - velHandleX) < 12) {
                dragMode = 'spawner-velocity';
                dragOffset.velocity = spawner.velocity - (localX - 40) / 3;
                dragOffset.spawnerIndex = s;
                return;
            }
        }
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
        if (dragMode && dragMode.startsWith('spawner')) dragMode = null;
        else dragMode = null;
        // Only launch droplet if not dragging a leaf or spawner
        if (launching && launchStart && !dragMode) {
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
        } else if (dragMode && dragMode.startsWith('spawner')) {
            const s = dragOffset.spawnerIndex;
            if (s !== undefined && spawners[s]) {
                const spawner = spawners[s];
                if (dragMode === 'spawner-move') {
                    spawner.x = p.mouseX - dragOffset.x;
                    spawner.y = p.mouseY - dragOffset.y;
                } else if (dragMode === 'spawner-angle') {
                    spawner.angle = Math.atan2(p.mouseY - spawner.y, p.mouseX - spawner.x) - dragOffset.angle;
                } else if (dragMode === 'spawner-velocity') {
                    // Project mouse position onto spawner's axis
                    const dx = p.mouseX - spawner.x;
                    const dy = p.mouseY - spawner.y;
                    const localX = dx * Math.cos(-spawner.angle) - dy * Math.sin(-spawner.angle);
                    spawner.velocity = Math.max(2, Math.min(30, (localX - 40) / 3));
                }
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
        // Play sound: pitch based on selected mode
        playBounceSound({
            leaf,
            droplet: d,
            nx,
            ny,
        });
    }

    // Web Audio API bounce sound
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playBounceSound({leaf, droplet, nx, ny}) {
        if (!leaf || !droplet) return;
        const minFreq = 220;
        const maxFreq = 880;
        let freq;
        switch (pitchMode) {
            case 'length':
                freq = maxFreq - (leaf.length - 40) / (200 - 40) * (maxFreq - minFreq);
                break;
            case 'angle':
                freq = minFreq + ((leaf.angle + Math.PI) / (2 * Math.PI)) * (maxFreq - minFreq);
                break;
            case 'speed':
                const speed = Math.sqrt(droplet.vx * droplet.vx + droplet.vy * droplet.vy);
                freq = Math.max(minFreq, Math.min(maxFreq, minFreq + (speed * 60)));
                break;
            case 'bounce':
                const vlen = Math.sqrt(droplet.vx * droplet.vx + droplet.vy * droplet.vy);
                let dot = 0;
                if (vlen > 0) {
                    dot = (droplet.vx * nx + droplet.vy * ny) / vlen;
                }
                freq = minFreq + ((dot + 1) / 2) * (maxFreq - minFreq);
                break;
            default:
                freq = minFreq;
        }
        freq = quantizeFreq(freq, minFreq, maxFreq);
        // Map color to oscillator type
        let oscType = 'triangle';
        for (const c of LEAF_COLORS) {
            if (arraysEqual(leaf.color, c.color)) {
                oscType = c.type;
                break;
            }
        }
        // Determine gain based on velocity mode
        let velocity = 0.2;
        if (velocityMode === 'speed') {
            const speed = Math.sqrt(droplet.vx * droplet.vx + droplet.vy * droplet.vy);
            velocity = Math.max(0.05, Math.min(0.5, speed * 0.05));
        }
        const gain = audioCtx.createGain();
        gain.connect(audioCtx.destination);
        const now = audioCtx.currentTime;
        gain.gain.cancelScheduledValues(now);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(velocity, now + envAttack);
        gain.gain.linearRampToValueAtTime(envSustain * velocity, now + envAttack + envDecay);
        gain.gain.linearRampToValueAtTime(0, now + envAttack + envDecay + envRelease);
        if (oscType === 'noise') {
            // Create white noise buffer
            const bufferSize = audioCtx.sampleRate * (envAttack + envDecay + envRelease);
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            noise.connect(gain);
            noise.start(now);
            noise.stop(now + envAttack + envDecay + envRelease);
        } else {
            const osc = audioCtx.createOscillator();
            osc.type = oscType;
            osc.frequency.value = freq;
            osc.connect(gain);
            osc.start(now);
            osc.stop(now + envAttack + envDecay + envRelease);
        }
    }

    // Quantize frequency to scale
    function quantizeFreq(freq, minFreq, maxFreq) {
        if (quantizeMode === 'none') return freq;
        // Convert to MIDI note
        const midi = 69 + 12 * Math.log2(freq / 440);
        let quantizedMidi;
        switch (quantizeMode) {
            case 'major': {
                // C major scale: C D E F G A B (0,2,4,5,7,9,11)
                const scale = [0, 2, 4, 5, 7, 9, 11];
                quantizedMidi = quantizeToScale(midi, scale);
                break;
            }
            case 'minor': {
                // C natural minor: C D D# F G G# A# (0,2,3,5,7,8,10)
                const scale = [0, 2, 3, 5, 7, 8, 10];
                quantizedMidi = quantizeToScale(midi, scale);
                break;
            }
            case 'fifths': {
                // Full circle of fifths within the octave: C G D A E B F# C# G# D# A# F
                // Semitone steps: [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5]
                const scale = [0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5];
                quantizedMidi = quantizeToScale(midi, scale);
                break;
            }
            case 'chromatic': {
                quantizedMidi = Math.round(midi);
                break;
            }
            case 'octaves': {
                // Quantize to C in each octave
                quantizedMidi = Math.round(midi / 12) * 12;
                break;
            }
            default:
                return freq;
        }
        // Convert back to frequency, clamp to min/max
        const quantFreq = 440 * Math.pow(2, (quantizedMidi - 69) / 12);
        return Math.max(minFreq, Math.min(maxFreq, quantFreq));
    }

    function quantizeToScale(midi, scale) {
        // Clamp negative midi to 0
        const midiClamped = midi < 0 ? 0 : midi;
        const base = Math.floor(midiClamped / 12) * 12;
        const note = Math.round(midiClamped) % 12;
        let best = scale[0];
        let minDist = Math.abs(note - scale[0]);
        for (let i = 1; i < scale.length; ++i) {
            const dist = Math.abs(note - scale[i]);
            if (dist < minDist) {
                best = scale[i];
                minDist = dist;
            }
        }
        return base + best + Math.round(midiClamped - Math.round(midiClamped));
    }

    // Utility: compare two arrays for equality
    function arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
        return true;
    }
}
new p5(sketch, document.getElementById("game-area-container"));
