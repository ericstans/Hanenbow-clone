// Sound and synthesis logic for Hanenbow
// Exports: playBounceSound, quantizeFreq, quantizeToScale

let audioCtx = null;
export function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

export function playBounceSound({leaf, droplet, nx, ny, pitchMode, quantizeMode, velocityMode, envAttack, envDecay, envSustain, envRelease, LEAF_COLORS}) {
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
        case 'speed': {
            const speed = Math.sqrt(droplet.vx * droplet.vx + droplet.vy * droplet.vy);
            freq = Math.max(minFreq, Math.min(maxFreq, minFreq + (speed * 60)));
            break;
        }
        case 'bounce': {
            const vlen = Math.sqrt(droplet.vx * droplet.vx + droplet.vy * droplet.vy);
            let dot = 0;
            if (vlen > 0) {
                dot = (droplet.vx * nx + droplet.vy * ny) / vlen;
            }
            freq = minFreq + ((dot + 1) / 2) * (maxFreq - minFreq);
            break;
        }
        default:
            freq = minFreq;
    }
    freq = quantizeFreq(freq, minFreq, maxFreq, quantizeMode);
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
    const ctx = getAudioContext();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(velocity, now + envAttack);
    gain.gain.linearRampToValueAtTime(envSustain * velocity, now + envAttack + envDecay);
    gain.gain.linearRampToValueAtTime(0, now + envAttack + envDecay + envRelease);
    if (oscType === 'noise') {
        // Create white noise buffer
        const bufferSize = ctx.sampleRate * (envAttack + envDecay + envRelease);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.connect(gain);
        noise.start(now);
        noise.stop(now + envAttack + envDecay + envRelease);
    } else {
        const osc = ctx.createOscillator();
        osc.type = oscType;
        osc.frequency.value = freq;
        osc.connect(gain);
        osc.start(now);
        osc.stop(now + envAttack + envDecay + envRelease);
    }
}

export function quantizeFreq(freq, minFreq, maxFreq, quantizeMode) {
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

export function quantizeToScale(midi, scale) {
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

// Helper for color comparison (should be moved to utils.js in next step)
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) if (a[i] !== b[i]) return false;
    return true;
}
