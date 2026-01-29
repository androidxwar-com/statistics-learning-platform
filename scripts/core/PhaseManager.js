/**
 * PhaseManager - Gestore Fasi di Apprendimento
 * 
 * Centralizza la logica di rendering delle 5 fasi:
 * 1. Teoria Complessa
 * 2. Teoria Semplificata
 * 3. Applicazione Pratica
 * 4. Quiz Base
 * 5. Quiz Avanzato
 */
const PhaseManager = (function () {

    /**
     * Recupera la strategia di rendering corretta per la fase
     * Accesso Lazy per evitare ReferenceError al caricamento
     */
    function getStrategy(phaseNumber) {
        const state = StateManager.getState();
        const mode = state.appMode || 'standard';

        // --- ROUTING MODALITÀ AVANZATA (3 STEP) ---
        if (mode === 'advanced') {
            switch (phaseNumber) {
                case 1:
                    // Se il modulo non esiste ancora (lo stiamo creando), fallback intelligente o errore
                    return (typeof Phase1AdvancedTheory !== 'undefined') ? Phase1AdvancedTheory : null;
                case 2:
                    return (typeof Phase2DataPractice !== 'undefined') ? Phase2DataPractice : null;
                case 3:
                    return (typeof Phase3MasterQuiz !== 'undefined') ? Phase3MasterQuiz : null;
                default: return null;
            }
        }

        // --- ROUTING MODALITÀ STANDARD (5 STEP) ---
        switch (phaseNumber) {
            case 1: return Phase1ComplexTheory;
            case 2: return Phase2SimplifiedTheory;
            case 3: return Phase3PracticalApplication;
            case 4: return Phase4BasicQuiz;
            case 5: return Phase5AdvancedQuiz;
            default: return null;
        }
    }

    /**
     * Renderizza la fase specificata con i dati forniti
     * @param {number} phaseNumber - Numero della fase (1-5)
     * @param {object} data - Dati del concetto (teoria) o null per quiz
     */
    async function renderPhase(phaseNumber, data) {
        console.log(`[PhaseManager] Rendering Phase ${phaseNumber}...`);

        const strategy = getStrategy(phaseNumber);

        if (!strategy) {
            throw new Error(`Nessun renderer trovato per la Fase ${phaseNumber}`);
        }

        try {
            // Pulisci contenitore (opzionale, se i renderer non lo fanno)
            // document.getElementById('app-content').innerHTML = '';

            // Esegui render
            // Nota: Le fasi quiz (4-5) sono asincrone, quindi usiamo await
            if (phaseNumber >= 4) {
                await strategy.render();
            } else {
                strategy.render(data);
            }

            console.log(`[PhaseManager] Fase ${phaseNumber} renderizzata.`);
            return true;

        } catch (error) {
            console.error(`[PhaseManager] Errore render Fase ${phaseNumber}:`, error);
            throw error; // Rilancia per gestione superiore (ErrorHandler/AppController)
        }
    }

    /**
     * Verifica disponibilità dati per la fase
     * Le fasi 1-3 richiedono dati teoria, 4-5 no (caricano quiz autonomamente)
     */
    function validateDataForPhase(phaseNumber, data) {
        if (phaseNumber <= 3 && !data) {
            return false;
        }
        return true;
    }

    return {
        renderPhase,
        validateDataForPhase
    };

})();

// Export
window.PhaseManager = PhaseManager;
