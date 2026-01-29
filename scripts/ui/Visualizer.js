/**
 * Visualizer - Motore Grafico Interattivo
 * 
 * Gestisce renderizzazione grafici dinamici usando Chart.js
 * Pattern: Strategy per ogni concetto (Binomiale, Normale, ecc.)
 */
const Visualizer = (function () {

    let currentChart = null;

    /**
     * Mappa delle strategie di visualizzazione
     * Key: ID del concetto / Parte del titolo
     */
    const STRATEGIES = {
        'binomiale': {
            title: "Simulatore Distribuzione Binomiale",
            params: {
                n: { min: 1, max: 50, default: 10, label: "Prove (n)" },
                p: { min: 0.1, max: 0.9, step: 0.1, default: 0.5, label: "Probabilità (p)" }
            },
            generateData: (params) => {
                const n = parseInt(params.n);
                const p = parseFloat(params.p);
                const labels = [];
                const data = [];

                // Calcolo PMF Binomiale: P(X=k) = C(n,k) * p^k * (1-p)^(n-k)
                for (let k = 0; k <= n; k++) {
                    labels.push(k);
                    data.push(binomialProbability(n, k, p));
                }

                return {
                    labels: labels,
                    datasets: [{
                        label: `P(X=k) con n=${n}, p=${p}`,
                        data: data,
                        backgroundColor: 'rgba(142, 111, 163, 0.6)',
                        borderColor: 'rgba(142, 111, 163, 1)',
                        borderWidth: 1
                    }]
                };
            }
        },

        // Placeholder per altri concetti
        'normale': {
            title: "Simulatore Distribuzione Normale",
            params: {
                mu: { min: -10, max: 10, default: 0, label: "Media (μ)" },
                sigma: { min: 0.5, max: 5, step: 0.1, default: 1, label: "Dev. Std (σ)" }
            },
            generateData: (params) => {
                // Implementazione futura
                return { labels: [], datasets: [] };
            }
        }
    };

    /**
     * Calcola coeff. binomiale e probabilità
     */
    function binomialProbability(n, k, p) {
        if (k < 0 || k > n) return 0;
        let c = 1;
        for (let i = 0; i < k; i++) c = c * (n - i) / (i + 1);
        return c * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    /**
     * Verifica se un concetto può essere visualizzato
     */
    function canVisualize(conceptTitle) {
        if (!conceptTitle) return false;
        const key = Object.keys(STRATEGIES).find(k => conceptTitle.toLowerCase().includes(k));
        return key ? true : false;
    }

    /**
     * Renderizza il visualizzatore in un container
     */
    function render(containerId, conceptTitle) {
        if (!conceptTitle) return;
        const key = Object.keys(STRATEGIES).find(k => conceptTitle.toLowerCase().includes(k));
        if (!key) return;

        const strategy = STRATEGIES[key];
        const container = document.getElementById(containerId);
        if (!container) return;

        // 1. Costruisci UI controlli
        let controlsHTML = '<div class="viz-controls" style="display:flex; justify-content:center; gap:20px; margin-bottom:20px; flex-wrap:wrap;">';

        Object.keys(strategy.params).forEach(paramKey => {
            const param = strategy.params[paramKey];
            controlsHTML += `
                <div class="control-group" style="text-align:center;">
                    <label style="display:block; font-weight:bold; color:#5a4a6b; margin-bottom:5px;">${param.label}: <span id="val-${paramKey}">${param.default}</span></label>
                    <input type="range" id="input-${paramKey}" 
                        min="${param.min}" max="${param.max}" step="${param.step || 1}" value="${param.default}"
                        oninput="Visualizer.updateChart('${key}')">
                </div>
            `;
        });
        controlsHTML += '</div>';

        // 2. Canvas
        const canvasHTML = `<div style="position:relative; height:300px; width:100%;"><canvas id="viz-canvas"></canvas></div>`;

        container.innerHTML = `
            <div class="visualizer-box" style="background:rgba(255,255,255,0.7); padding:20px; border-radius:20px; border:1px solid rgba(142,111,163,0.3); margin:20px 0;">
                <h4 style="text-align:center; margin-top:0; color:#8e6fa3;">📈 ${strategy.title}</h4>
                ${controlsHTML}
                ${canvasHTML}
            </div>
        `;

        // 3. Inizializza Chart
        updateChart(key, true);
    }

    /**
     * Aggiorna il grafico in base agli input
     */
    function updateChart(strategyKey, isInit = false) {
        const strategy = STRATEGIES[strategyKey];
        const params = {};

        // Recupera valori attuali
        Object.keys(strategy.params).forEach(p => {
            const input = document.getElementById(`input-${p}`);
            if (input) {
                params[p] = input.value;
                document.getElementById(`val-${p}`).innerText = input.value;
            } else {
                params[p] = strategy.params[p].default;
            }
        });

        const chartData = strategy.generateData(params);
        const ctx = document.getElementById('viz-canvas');

        if (!ctx) return;

        if (currentChart) {
            currentChart.data = chartData;
            currentChart.update();
        } else {
            currentChart = new Chart(ctx, {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: 1.0 }, // Probabilità max 1
                        x: { title: { display: true, text: 'k (Successi)' } }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    }

    return {
        render,
        updateChart,
        canVisualize
    };

})();

window.Visualizer = Visualizer;
