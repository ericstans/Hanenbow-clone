import '../public/styles.css';
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
        function handleSliderInput(slider, callback) {
            if (!slider) return;
            slider.addEventListener('input', callback);
            slider.addEventListener('touchstart', e => { e.stopPropagation(); }, { passive: true });
            slider.addEventListener('touchmove', e => { e.stopPropagation(); }, { passive: true });
            slider.addEventListener('touchend', e => {
                e.stopPropagation();
                // For some browsers, fire input event manually
                callback();
            }, { passive: true });
        }
        handleSliderInput(w, () => { window.ballWeight = parseFloat(w.value); });
        handleSliderInput(b, () => { window.bounciness = parseFloat(b.value); });
    });
}
window.envAttack = 0.01;
window.envDecay = 0.05;
window.envRelease = 0.15;
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const a = document.getElementById('attack-slider');
        const d = document.getElementById('decay-slider');
        const r = document.getElementById('release-slider');
        function handleSliderInput(slider, callback) {
            if (!slider) return;
            slider.addEventListener('input', callback);
            slider.addEventListener('touchstart', e => { e.stopPropagation(); }, { passive: true });
            slider.addEventListener('touchmove', e => { e.stopPropagation(); }, { passive: true });
            slider.addEventListener('touchend', e => {
                e.stopPropagation();
                callback();
            }, { passive: true });
        }
        handleSliderInput(a, () => { window.envAttack = parseFloat(a.value); });
        handleSliderInput(d, () => { window.envDecay = parseFloat(d.value); });
        handleSliderInput(r, () => { window.envRelease = parseFloat(r.value); });
    });
}
// Pitch quantization mode: 'none', 'major', 'minor', 'chromatic'
window.quantizeMode = 'none';
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const select = document.getElementById('pitch-mode');
        const qselect = document.getElementById('quantize-mode');
        if (select) {
            select.addEventListener('change', () => { window.pitchMode = select.value; });
        }
        if (qselect) {
            qselect.addEventListener('change', () => { window.quantizeMode = qselect.value; });
        }
    });
}
// Sound pitch mode: 'length', 'angle', 'speed', 'bounce'
window.pitchMode = 'length';
// (Handled above)
import p5 from "p5";
import { sketch } from "./sketch";
new p5(sketch, document.getElementById("game-area-container"));
