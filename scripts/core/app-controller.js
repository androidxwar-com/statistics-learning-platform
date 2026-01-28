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

        // 2. Carica dati con gestione errori dettagliata (Nuovo DataManager)
        const success = await DataManager.init();
        if (!success) {
            // ErrorHandler ha già gestito la modale, interrompiamo solo il flusso
            return;
        }

        // 3. Carica o inizializza stato
        StateManager.loadState();

        // 4. Inizializza Sidebar
        try {
            // DataManager.getTopics() restituisce la struttura raw
            const structure = DataManager.getTopics();
            if (structure) {
                SidebarManager.init(structure);
                SidebarManager.updateActiveItem();
            } else {
                console.error('❌ Struttura argomenti non disponibile per Sidebar');
            }
        } catch (e) {
            console.error('❌ Errore init Sidebar:', e);
        }

        // 5. Renderizza interfaccia iniziale
        renderHeader();
        renderCurrentPhase();

        // 6. Setup Event Listeners
        if (window.EventBus) {
            window.EventBus.on('NAVIGATE_TO_CONCEPT', (data) => {
                loadConcept(data.topicId, data.subtopicId, data.conceptId);
            });
        }

        console.log('✅ App inizializzata');
    }

    /**
     * Carica uno specifico concetto (API Pubblica per Sidebar)
     */
    function loadConcept(topicId, subtopicId, conceptId) {
        console.log(`Navigazione a: ${topicId} > ${subtopicId} > ${conceptId}`);
        StateManager.setCurrentConcept(topicId, subtopicId, conceptId);
        renderHeader();
        renderCurrentPhase();
        // SidebarManager.updateActiveItem() rimosso: ora reagisce all'evento STATE_UPDATED
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ... funzioni private ...

    // Public API
    return {
        init,
        renderCurrentPhase,
        renderHeader,
        switchMode,
        loadConcept // Esposto per la sidebar
    };
    function renderHeader() {
        const state = StateManager.getState();
        // Usa DataManager.getConceptMetadata
        const conceptInfo = DataManager.getConceptMetadata(state.currentConceptId);

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
                        <strong>${conceptInfo.title}</strong>
                        <span class="concept-meta">${conceptInfo.macroTitle} • ${conceptInfo.subTitle}</span>
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
            // Carica dati concetto se necessario (Nuova API)
            const conceptData = DataManager.getConceptTheory(conceptId);

            if (!PhaseManager.validateDataForPhase(phase, conceptData)) {
                // Se manca teoria per fasi teoriche, è un problema
                throw new Error(`Dati non disponibili per concetto: ${conceptId}`);
            }

            // Renderizza fase appropriata tramite PhaseManager
            await PhaseManager.renderPhase(phase, conceptData);

            // Aggiorna header
            renderHeader();

        } catch (error) {
            console.error('Errore rendering fase:', error);
            showError(`Errore nel caricamento: ${error.message}`);
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
        switchMode,
        loadConcept // Esposto per la sidebar
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
