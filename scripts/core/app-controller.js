/**
 * App Controller - Orchestratore Principale
 * 
 * Gestisce:
 * - Inizializzazione app
 * - Routing tra fasi (1-5)
 * - Rendering interfaccia
 * - Event delegation
 */

const AppController = (function () {

    /**
     * Inizializza applicazione
     */
    async function init() {
        console.log('🚀 Inizializzazione App...');

        // 1. Carica configurazione Groq
        if (typeof GROQ_CONFIG !== 'undefined') {
            GroqAPIClient.init(GROQ_CONFIG);
        } else {
            console.warn('⚠️ GROQ_CONFIG non trovato');
        }

        // 2. Carica dati
        const dataLoaded = await DataLoader.init();
        if (!dataLoaded) {
            showError('Errore nel caricamento dei dati. Ricarica la pagina.');
            return;
        }

        // 3. Carica o inizializza stato
        StateManager.loadState();

        // 4. Renderizza interfaccia iniziale
        renderHeader();
        renderCurrentPhase();

        console.log('✅ App inizializzata');
    }

    /**
     * Renderizza header (modalità + progresso)
     */
    function renderHeader() {
        const state = StateManager.getState();
        const conceptInfo = DataLoader.getConceptInfo(state.currentConceptId);

        const header = `
            <div class="app-header">
                <h1 class="app-title">📊 Probabilità & Statistica</h1>
                
                <div class="mode-toggle">
                    <button 
                        class="mode-btn ${state.currentMode === 'home' ? 'active' : ''}"
                        onclick="AppController.switchMode('home')">
                        🏠 Casa
                    </button>
                    <button 
                        class="mode-btn ${state.currentMode === 'away' ? 'active' : ''}"
                        onclick="AppController.switchMode('away')">
                        🌍 Fuori Casa
                    </button>
                </div>

                ${conceptInfo ? `
                    <div class="current-concept-info">
                        <strong>${conceptInfo.concept}</strong>
                        <span class="concept-meta">${conceptInfo.topic} • ${conceptInfo.subtopic}</span>
                    </div>
                ` : ''}

                <div class="progress-bar">
                    ${renderProgressBar()}
                </div>
            </div>
        `;

        document.getElementById('app-header').innerHTML = header;
    }

    /**
     * Renderizza barra progresso
     */
    function renderProgressBar() {
        const state = StateManager.getState();
        const phases = [1, 2, 3, 4, 5];

        return phases.map(phase => {
            let status = '';
            if (phase < state.currentPhase) status = 'completed';
            else if (phase === state.currentPhase) status = 'current';
            else status = 'pending';

            return `<div class="progress-step ${status}">${phase}</div>`;
        }).join('');
    }

    /**
     * Renderizza fase corrente
     */
    async function renderCurrentPhase() {
        const state = StateManager.getState();
        const conceptId = state.currentConceptId;
        const phase = state.currentPhase;

        // Mostra loader
        showLoader();

        try {
            // Carica dati concetto se necessario
            const conceptData = DataLoader.loadTheoryContent(conceptId);

            if (!conceptData && phase <= 3) {
                showError(`Dati non disponibili per concetto: ${conceptId}`);
                return;
            }

            // Renderizza fase appropriata
            switch (phase) {
                case 1:
                    Phase1ComplexTheory.render(conceptData);
                    break;
                case 2:
                    Phase2SimplifiedTheory.render(conceptData);
                    break;
                case 3:
                    Phase3PracticalApplication.render(conceptData);
                    break;
                case 4:
                    await Phase4BasicQuiz.render();
                    break;
                case 5:
                    await Phase5AdvancedQuiz.render();
                    break;
                default:
                    showError(`Fase non valida: ${phase}`);
            }

            // Aggiorna header
            renderHeader();

        } catch (error) {
            console.error('Errore rendering fase:', error);
            showError('Errore nel caricamento. Riprova.');
        }
    }

    /**
     * Cambia modalità (casa/fuori casa)
     */
    function switchMode(newMode) {
        const currentMode = StateManager.getState().currentMode;

        if (newMode === currentMode) return;

        console.log(`🔄 Cambio modalità: ${currentMode} → ${newMode}`);

        StateManager.toggleMode();

        // Se siamo in fase quiz (4-5), ricarica quiz
        const currentPhase = StateManager.getState().currentPhase;
        if (currentPhase >= 4) {
            renderCurrentPhase();
        } else {
            // Altrimenti solo aggiorna header
            renderHeader();
        }
    }

    /**
     * Mostra loader
     */
    function showLoader() {
        document.getElementById('app-content').innerHTML = `
            <div class="loader-container">
                <div class="loader"></div>
                <p>Caricamento...</p>
            </div>
        `;
    }

    /**
     * Mostra errore
     */
    function showError(message) {
        document.getElementById('app-content').innerHTML = `
            <div class="error-box">
                <h3>⚠️ Errore</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="location.reload()">Ricarica Pagina</button>
            </div>
        `;
    }

    // Public API
    return {
        init,
        renderCurrentPhase,
        renderHeader,
        switchMode
    };
})();

// Auto-init quando DOM è pronto
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        AppController.init();
    });
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppController;
}
