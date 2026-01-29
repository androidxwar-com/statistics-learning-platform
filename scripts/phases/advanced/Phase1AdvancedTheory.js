/**
 * FASE 1 ADVANCED: Teoria Magistrale (Loop Verify)
 * 
 * Obiettivo: Fornire una conoscenza "a 360 gradi" dell'argomento.
 * Logica:
 * 1. Recupera dati base dal JSON.
 * 2. Chiama IA per lezione universitaria.
 * 3. Chiede: "Hai compreso?"
 * 4. SI -> Fase 2.
 * 5. NO -> Rigenera spiegazione con nuova angolazione (Loop).
 */

const Phase1AdvancedTheory = (function () {
    let currentData = null;
    let retryCount = 0;

    async function render(conceptData) {
        currentData = conceptData;
        retryCount = 0; // Reset al primo render
        renderInitialState();
    }

    function renderInitialState() {
        const container = document.getElementById('app-content');
        container.innerHTML = `
            <div class="phase-container phase1-adv-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-advanced">MODALITÀ STUDIO AGGRESSIVO</span>
                    <h2>${currentData?.phase1_complex?.title || 'Titolo non disponibile'}</h2>
                    <p class="phase-subtitle">Generazione Lezione Magistrale in corso...</p>
                </div>
                <div class="loader-container">
                    <div class="loader"></div>
                    <p>Espansione concetti e recupero definizioni accademiche...</p>
                </div>
            </div>
        `;
        fetchAndDisplayContent(false);
    }

    async function fetchAndDisplayContent(isRetry) {
        const container = document.getElementById('app-content');

        try {
            // Chiamata all'IA (con retry context se necessario)
            let advancedContent = await GroqAPIClient.generateAdvancedTheory(currentData, isRetry ? retryCount : null);

            if (!advancedContent) {
                const title = currentData?.phase1_complex?.title || 'Concetto';

                // Normalizzazione schema
                let content = currentData?.phase1_complex?.content;
                if (!content && currentData?.phase1_complex?.definition) {
                    content = currentData.phase1_complex.definition;
                }
                content = content || 'Contenuto base non disponibile.';

                advancedContent = `
                    <h3>${title}</h3>
                    <div class="academic-text">${content}</div>
                    <div class="academic-note">Nota: Connessione IA limitata. Dati base.</div>
                `;
            }

            // Render del contenuto + Bottoni Feedback
            container.innerHTML = `
                <div class="phase-container phase1-adv-container animated fadeIn">
                    <div class="phase-header">
                        <span class="phase-badge phase-badge-advanced">FASE 1/3: TEORIA MAGISTRALE</span>
                        <h2 class="text-gradient">${currentData?.phase1_complex?.title || 'Titolo'}</h2>
                        ${isRetry ? `<span class="retry-badge">Approfondimento #${retryCount}</span>` : ''}
                    </div>

                    <div class="adv-theory-content">
                        ${advancedContent}
                    </div>

                    <div class="verification-section">
                        <h3>Hai compreso la teoria?</h3>
                        <div class="verification-buttons">
                            <button class="btn-success btn-large" onclick="Phase1AdvancedTheory.handleSuccess()">
                                ✅ Tutto Chiaro (Procedi)
                            </button>
                            <button class="btn-warning btn-large" onclick="Phase1AdvancedTheory.handleFail()">
                                ❌ No, Non è chiaro (Spiega ancora)
                            </button>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error("Errore Phase1Advanced:", error);
            container.innerHTML = `<p class="error-text">Errore generazione: ${error.message}</p>`;
        }
    }

    // --- HANDLERS ---

    function handleSuccess() {
        // Logica: Avanza alla prossima fase
        // Opzionale: scroll top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        StateManager.advancePhase();
        AppController.renderCurrentPhase();
    }

    function handleFail() {
        // Logica: Incrementa retry e rigenera
        retryCount++;

        // Feedback visivo immediato (Loader locale)
        const container = document.querySelector('.adv-theory-content');
        if (container) {
            container.innerHTML = `
                <div class="loader-container">
                    <div class="loader"></div>
                    <p>Sto analizzando le tue difficoltà. Generazione nuova spiegazione...</p>
                </div>
            `;
        }

        fetchAndDisplayContent(true);
    }

    return {
        render,
        handleSuccess,
        handleFail
    };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase1AdvancedTheory;
}
