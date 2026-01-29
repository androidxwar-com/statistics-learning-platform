/**
 * FASE 2 ADVANCED: Pratica Basata sui Dati (Loop Verify)
 * 
 * Obiettivo: Applicazione su casi reali e dataset statistici.
 * Logica:
 * 1. Genera scenario Business/Research.
 * 2. Visualizza dati e analisi.
 * 3. Chiede: "Hai compreso?"
 * 4. SI -> Fase 3 (Esame).
 * 5. NO -> Rigenera con nuovo scenario (Loop).
 */

const Phase2DataPractice = (function () {
    let currentData = null;
    let retryCount = 0;

    async function render(conceptData) {
        currentData = conceptData;
        retryCount = 0;
        renderInitialState();
    }

    function renderInitialState() {
        const container = document.getElementById('app-content');
        container.innerHTML = `
            <div class="phase-container phase2-adv-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-advanced">FASE 2/3: ANALISI DATI</span>
                    <h2>Applicazione Pratica</h2>
                    <p class="phase-subtitle">Generazione Case Study in corso...</p>
                </div>
                <div class="loader-container">
                    <div class="loader"></div>
                </div>
            </div>
        `;
        fetchAndDisplayContent(false);
    }

    async function fetchAndDisplayContent(isRetry) {
        const container = document.getElementById('app-content');

        try {
            const dataContent = await GroqAPIClient.generateDataPractice(currentData, isRetry ? retryCount : null);

            container.innerHTML = `
                <div class="phase-container phase2-adv-container animated fadeIn">
                    <div class="phase-header">
                        <span class="phase-badge phase-badge-advanced">FASE 2/3: ANALISI DATI REALI</span>
                        <h2>${currentData.phase1_complex.title}</h2>
                        <p class="phase-subtitle">${isRetry ? 'Nuovo Scenario Applicativo' : 'Case Study Applicativo'}</p>
                    </div>

                    <div class="adv-data-content">
                        ${dataContent || "<p>Dati non disponibili.</p>"}
                    </div>

                    <div class="verification-section">
                        <h3>Hai compreso l'applicazione pratica?</h3>
                        <div class="verification-buttons">
                            <button class="btn-success btn-large" onclick="Phase2DataPractice.handleSuccess()">
                                ✅ Tutto Chiaro (Vai all'Esame)
                            </button>
                            <button class="btn-warning btn-large" onclick="Phase2DataPractice.handleFail()">
                                ❌ No, Non è chiaro (Nuovo Scenario)
                            </button>
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error("Errore Phase2Advanced:", error);
            container.innerHTML = `<div class="error-box">Errore caricamento dati: ${error.message}</div>`;
        }
    }

    function handleSuccess() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        StateManager.advancePhase();
        AppController.renderCurrentPhase();
    }

    function handleFail() {
        retryCount++;
        const container = document.querySelector('.adv-data-content');
        if (container) {
            container.innerHTML = `
                <div class="loader-container">
                    <div class="loader"></div>
                    <p>Sto cercando un esempio più adatto al tuo settore...</p>
                </div>
            `;
        }
        fetchAndDisplayContent(true);
    }

    return { render, handleSuccess, handleFail };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase2DataPractice;
}
