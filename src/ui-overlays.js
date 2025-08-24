// Handles UI overlays for leaves and spawners
// Exports: setupLeafOverlay, setupSpawnerOverlay

export function setupLeafOverlay(selectedLeafRef, LEAFS) {
    if (typeof window === 'undefined') return;
    window.addEventListener('DOMContentLoaded', () => {
        const leafOverlay = document.getElementById('leaf-ui-overlay');
        function updateLeafOverlay() {
            if (!leafOverlay) return;
            leafOverlay.innerHTML = '';
            const canvas = document.querySelector('canvas');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            const selectedLeaf = selectedLeafRef.current;
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

export function setupSpawnerOverlay(spawners, spawnerIntervals, droplets, selectedSpawnerRef) {
    if (typeof window === 'undefined') return;
    window.addEventListener('DOMContentLoaded', () => {
        const spawnerOverlay = document.getElementById('spawner-ui-overlay');
        function updateSpawnerOverlay() {
            if (!spawnerOverlay) return;
            spawnerOverlay.innerHTML = '';
            const canvas = document.querySelector('canvas');
            if (!canvas) return;
            const rect = canvas.getBoundingClientRect();
            spawners.forEach((spawner, i) => {
                if (selectedSpawnerRef.current !== i) return;
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
        window.addEventListener('resize', updateSpawnerOverlay);
        window.addEventListener('scroll', updateSpawnerOverlay);
        setInterval(updateSpawnerOverlay, 40);
        updateSpawnerOverlay();
    });
}
