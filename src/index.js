// Sound velocity mode: 'speed', 'fixed'
window.velocityMode = 'speed';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const vselect = document.getElementById('velocity-mode');
        if (vselect) {
            vselect.addEventListener('change', e => {
                window.velocityMode = vselect.value;
            });
        }
    });
}
// ASDR envelope values (seconds)
window.envAttack = 0.01;
window.envDecay = 0.05;
window.envSustain = 0.2;
window.envRelease = 0.15;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const a = document.getElementById('attack-slider');
        const d = document.getElementById('decay-slider');
        const s = document.getElementById('sustain-slider');
        const r = document.getElementById('release-slider');
    if (a) a.addEventListener('input', () => { window.envAttack = parseFloat(a.value); });
    if (d) d.addEventListener('input', () => { window.envDecay = parseFloat(d.value); });
    if (s) s.addEventListener('input', () => { window.envSustain = parseFloat(s.value); });
    if (r) r.addEventListener('input', () => { window.envRelease = parseFloat(r.value); });
    });
}
// Pitch quantization mode: 'none', 'major', 'minor', 'fifths', 'chromatic', 'octaves'
window.quantizeMode = 'none';
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
                window.quantizeMode = qselect.value;
            });
        }
    });
}
// Sound pitch mode: 'length', 'angle', 'speed', 'bounce'
window.pitchMode = 'length';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('pitch-mode');
        if (select) {
            select.addEventListener('change', e => {
                window.pitchMode = select.value;
            });
        }
    });
}
import p5 from "p5";
import { sketch } from "./sketch";
new p5(sketch, document.getElementById("game-area-container"));
