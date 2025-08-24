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
// Ball physics globals
window.ballWeight = 1;
window.bounciness = 0.9;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const w = document.getElementById('weight-slider');
        const b = document.getElementById('bounciness-slider');
        if (w) w.addEventListener('input', () => { window.ballWeight = parseFloat(w.value); });
        if (b) b.addEventListener('input', () => { window.bounciness = parseFloat(b.value); });
    });
}
window.envAttack = 0.01;
window.envDecay = 0.05;
window.envRelease = 0.15;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const a = document.getElementById('attack-slider');
        const d = document.getElementById('decay-slider');
    // const s = document.getElementById('sustain-slider');
        const r = document.getElementById('release-slider');
    if (a) a.addEventListener('input', () => { window.envAttack = parseFloat(a.value); });
    if (d) d.addEventListener('input', () => { window.envDecay = parseFloat(d.value); });
    if (r) r.addEventListener('input', () => { window.envRelease = parseFloat(r.value); });
    });
}
// Pitch quantization mode: 'none', 'major', 'minor', 'chromatic'
window.quantizeMode = 'none';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('pitch-mode');
        if (select) {
            select.addEventListener('change', e => {
                window.pitchMode = select.value;
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
// (Handled above)
import p5 from "p5";
import { sketch } from "./sketch";
new p5(sketch, document.getElementById("game-area-container"));
