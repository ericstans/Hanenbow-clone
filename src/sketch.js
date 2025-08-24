import { setupLeafOverlay, setupSpawnerOverlay } from './ui-overlays.js';
import { playBounceSound, quantizeFreq } from './sound.js';
import { LEAF_COLORS, REF_WIDTH, REF_HEIGHT, REF_LEAFS } from './constants.js';
import { arraysEqual, dist } from './utils.js';

export const sketch = (p) => {
    // Show/hide instructions panel
    let showInstructions = true;
    // --- DANCING LEAF UI OVERLAY ---
    let selectedLeaf = null;
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            const leafOverlay = document.getElementById('leaf-ui-overlay');
            function updateLeafOverlay() {
                if (!leafOverlay) return;
                leafOverlay.innerHTML = '';
                const canvas = document.querySelector('canvas');
                if (!canvas) return;
                const rect = canvas.getBoundingClientRect();
                if (selectedLeaf !== null && LEAFS[selectedLeaf] && LEAFS[selectedLeaf].dancing) {
                    const leaf = LEAFS[selectedLeaf];
                    // Project leaf position to page coordinates
                    const x = rect.left + leaf.x;
                    const y = rect.top + leaf.y + 30; // 30px below leaf
                    const wrapper = document.createElement('div');
                    wrapper.style.position = 'absolute';
                    wrapper.style.left = `${x - 60}px`;
                    wrapper.style.top = `${y}px`;
                    wrapper.style.pointerEvents = 'auto';
                    wrapper.style.background = 'rgba(34,34,34,0.85)';
                    wrapper.style.borderRadius = '8px';
                    wrapper.style.padding = '2px 7px 2px 7px';
                    wrapper.style.display = 'flex';
                    wrapper.style.alignItems = 'center';
                    wrapper.style.boxShadow = '0 2px 8px #0006';
                    wrapper.style.zIndex = '101';
                    // Dance rate slider
                    const rateLabel = document.createElement('label');
                    rateLabel.textContent = 'Rate:';
                    rateLabel.style.color = '#6cf6ff';
                    rateLabel.style.fontWeight = '600';
                    rateLabel.style.fontSize = '0.95em';
                    rateLabel.style.marginRight = '0.3em';
                    const rateSlider = document.createElement('input');
                    rateSlider.type = 'range';
                    rateSlider.min = '0.2';
                    rateSlider.max = '3';
                    rateSlider.step = '0.01';
                    rateSlider.value = leaf.danceRate || 1;
                    rateSlider.style.width = '50px';
                    rateSlider.style.height = '18px';
                    rateSlider.style.margin = '0 0.3em 0 0';
                    const rateValue = document.createElement('span');
                    rateValue.textContent = `${parseFloat(rateSlider.value).toFixed(2)} Hz`;
                    rateValue.style.fontSize = '0.95em';
                    rateValue.style.color = '#fff';
                    rateSlider.addEventListener('input', () => {
                        leaf.danceRate = parseFloat(rateSlider.value);
                        rateValue.textContent = `${parseFloat(rateSlider.value).toFixed(2)} Hz`;
                    });
                    // Max angle slider
                    const angleLabel = document.createElement('label');
                    angleLabel.textContent = 'Angle:';
                    angleLabel.style.color = '#6cf6ff';
                    angleLabel.style.fontWeight = '600';
                    angleLabel.style.fontSize = '0.95em';
                    angleLabel.style.margin = '0 0.3em 0 0.7em';
                    const angleSlider = document.createElement('input');
                    angleSlider.type = 'range';
                    angleSlider.min = '5';
                    angleSlider.max = '40';
                    angleSlider.step = '0.1';
                    angleSlider.value = leaf.danceRange || 15;
                    angleSlider.style.width = '50px';
                    angleSlider.style.height = '18px';
                    const angleValue = document.createElement('span');
                    angleValue.textContent = `${parseFloat(angleSlider.value).toFixed(1)}°`;
                    angleValue.style.fontSize = '0.95em';
                    angleValue.style.color = '#fff';
                    angleSlider.addEventListener('input', () => {
                        leaf.danceRange = parseFloat(angleSlider.value);
                        angleValue.textContent = `${parseFloat(angleSlider.value).toFixed(1)}°`;
                    });
                    wrapper.appendChild(rateLabel);
                    wrapper.appendChild(rateSlider);
                    wrapper.appendChild(rateValue);
                    wrapper.appendChild(angleLabel);
                    wrapper.appendChild(angleSlider);
                    wrapper.appendChild(angleValue);
                    leafOverlay.appendChild(wrapper);
                }
            }
            window.addEventListener('resize', updateLeafOverlay);
            window.addEventListener('scroll', updateLeafOverlay);
            setInterval(updateLeafOverlay, 40);
            updateLeafOverlay();
        });
    }
    // Canvas and game constants
    let WIDTH = 0;
    let HEIGHT = 0;

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
    let selectedSpawner = null;
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
                    if (selectedSpawner !== i) return;
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
                    slider.max = '10000';
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
        // Preserve dance state if present
        return {
            x: leaf.x / REF_WIDTH * WIDTH,
            y: leaf.y / REF_HEIGHT * HEIGHT,
            angle: leaf.angle,
            length: leaf.length * (WIDTH / REF_WIDTH),
            color: leaf.color.slice(),
            dancing: leaf.dancing || false,
            danceRange: leaf.danceRange,
            dancePhase: leaf.dancePhase || 0,
            baseAngle: leaf.baseAngle !== undefined ? leaf.baseAngle : leaf.angle,
        };
    }
    function updateLeafsToCanvas() {
        LEAFS = REF_LEAFS.map(scaleLeaf);
    }
    p.setup = () => {
        const container = document.getElementById('game-area-container');
        if (container) {
            WIDTH = container.clientWidth;
            HEIGHT = container.clientHeight;
        } else {
            WIDTH = window.innerWidth;
            HEIGHT = window.innerHeight;
        }
        p.createCanvas(WIDTH, HEIGHT);
        p.background(34);
        updateLeafsToCanvas();
    };
    p.windowResized = () => {
        const container = document.getElementById('game-area-container');
        if (container) {
            WIDTH = container.clientWidth;
            HEIGHT = container.clientHeight;
        } else {
            WIDTH = window.innerWidth;
            HEIGHT = window.innerHeight;
        }
        p.resizeCanvas(WIDTH, HEIGHT);
        updateLeafsToCanvas();
    };

    p.draw = () => {
        p.background(34);
        // Draw instructions panel if visible
        if (showInstructions) {
            p.push();
            p.textSize(18);
            const panelX = 16, panelY = 16, panelW = 420, panelH = 128;
            const textX = panelX + 12, textY = panelY + 12;
            // Draw panel background
            p.fill(0, 0, 0, 120);
            p.noStroke();
            p.rect(panelX, panelY, panelW, panelH, 12);
            // Draw instructions text
            p.textAlign(p.LEFT, p.TOP);
            p.fill(255);
            const lines = [
                "Click to launch a ball.",
                "Double click a leaf to change its sound.",
                "Add spawners to launch balls automatically.",
                "Shift+double click a leaf to make it dance.",
                "Select a dancing leaf for options."
            ];
            let lineHeight = 24;
            for (let i = 0; i < lines.length; ++i) {
                p.text(lines[i], textX, textY + i * lineHeight);
            }
            // Draw close button
            const closeBtnCX = panelX + panelW - 18;
            const closeBtnCY = textY + lineHeight / 2;
            p.noStroke();
            p.fill(220, 60, 60);
            p.textAlign(p.CENTER, p.CENTER);
            p.textSize(22);
            p.text('×', closeBtnCX, closeBtnCY);
            p.pop();
        }
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
        for (const [i, leaf] of LEAFS.entries()) {
            p.push();
            p.translate(leaf.x, leaf.y);
            // Animate dancing leaves
            if (leaf.dancing) {
                // Animate at user-set rate and angle
                const now = performance.now() / 1000;
                const range = leaf.danceRange !== undefined ? leaf.danceRange : 15;
                const rate = leaf.danceRate !== undefined ? leaf.danceRate : 1;
                const base = leaf.baseAngle !== undefined ? leaf.baseAngle : leaf.angle;
                leaf.angle = base + (range * Math.PI / 180) * Math.sin(2 * Math.PI * rate * now);
            }
            p.rotate(leaf.angle);
            p.fill(...leaf.color);
            // Double-click handler for color change, delete, or dance
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
                            // Toggle dance mode
                            if (!leaf.dancing) {
                                leaf.dancing = true;
                                leaf.danceRange = 10 + Math.random() * 10; // 10-20 deg
                                leaf.danceRate = 1;
                                leaf.baseAngle = leaf.angle;
                            } else {
                                leaf.dancing = false;
                                leaf.angle = leaf.baseAngle !== undefined ? leaf.baseAngle : leaf.angle;
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

            // Make leaves thinner as viewport gets smaller
            let leafThickness = 20;
            if (WIDTH < 700) leafThickness = 16;
            if (WIDTH < 500) leafThickness = 12;
            if (WIDTH < 350) leafThickness = 8;
            p.ellipse(0, 0, leaf.length, leafThickness);
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
        // Handle close button for instructions panel
        if (showInstructions) {
            // Match close button position to draw loop
            const panelX = 16, panelW = 420, textY = 16 + 12, lineHeight = 24;
            const closeBtnCX = panelX + panelW - 18;
            const closeBtnCY = textY + lineHeight / 2;
            const dx = p.mouseX - closeBtnCX;
            const dy = p.mouseY - closeBtnCY;
            // Use a slightly larger hitbox for the '×'
            if (dx * dx + dy * dy <= 14 * 14) {
                showInstructions = false;
                return;
            }
        }
        // Spawner handles for all spawners
        // Prevent deselection if clicking inside spawner overlay
        let spawnerOverlay = document.getElementById('spawner-ui-overlay');
        if (spawnerOverlay && window.event && spawnerOverlay.contains(window.event.target)) {
            // Don't clear selection
        } else {
            selectedSpawner = null;
        }
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
                selectedSpawner = s;
                return;
            }
            // Angle handle (arrow)
            if (Math.abs(localY) < 12 && localX > 28 && localX < 52) {
                dragMode = 'spawner-angle';
                dragOffset.angle = Math.atan2(p.mouseY - spawner.y, p.mouseX - spawner.x) - spawner.angle;
                dragOffset.spawnerIndex = s;
                selectedSpawner = s;
                return;
            }
            // Velocity handle (circle at end)
            const velHandleX = 40 + spawner.velocity * 3;
            if (Math.abs(localY) < 12 && Math.abs(localX - velHandleX) < 12) {
                dragMode = 'spawner-velocity';
                dragOffset.velocity = spawner.velocity - (localX - 40) / 3;
                dragOffset.spawnerIndex = s;
                selectedSpawner = s;
                return;
            }
        }
        // Check if clicking a leaf handle
        // Prevent deselection if clicking inside leaf overlay
        let leafOverlay = document.getElementById('leaf-ui-overlay');
        if (leafOverlay && window.event && leafOverlay.contains(window.event.target)) {
            // Don't clear selection
        } else {
            selectedLeaf = null;
        }
        for (let i = 0; i < LEAFS.length; i++) {
            const leaf = LEAFS[i];
            const local = toLeafLocal(leaf, p.mouseX, p.mouseY);
            // Move handle (center)
            if (dist(local.x, local.y, 0, 0) < 16) {
                draggingLeaf = i;
                dragMode = 'move';
                dragOffset.x = p.mouseX - leaf.x;
                dragOffset.y = p.mouseY - leaf.y;
                if (leaf.dancing) selectedLeaf = i;
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
            pitchMode: window.pitchMode,
            quantizeMode: window.quantizeMode,
            velocityMode: window.velocityMode,
            envAttack: window.envAttack,
            envDecay: window.envDecay,
            envSustain: window.envSustain,
            envRelease: window.envRelease,
        });
    }
}