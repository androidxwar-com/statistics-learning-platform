/**
 * FASE 2: Teoria Semplificata
 * 
 * Mostra la versione semplificata del concetto:
 * - Spiegazione accessibile
 * - Analogie quotidiane
 * - Avanzamento automatico dopo lettura
 */

const Phase2SimplifiedTheory = (function () {
    let autoAdvanceTimer = null;

    /**
     * Renderizza Fase 2
     */
    function render(conceptData) {
        // --- SELF-HEALING: Check data validity ---
        if (!conceptData || !conceptData.phase2_simplified || !conceptData.phase2_simplified.content) {
            console.warn('[Phase2] Dati mancanti, avvio generazione IA...');
            renderFallbackWithAI();
            return;
        }

        const content = conceptData.phase2_simplified;

        const html = `
            <div class="phase-container phase2-container">
                <div class="phase-header">
                    <span class="phase-badge">FASE 2/5</span>
                    <h2>${content.title}</h2>
                    <p class="phase-subtitle">Versione Semplificata - Intuizione</p>
                </div>

                <div class="simplified-content">
                    <div class="simplified-text">
                        ${formatContent(content.content)}
                    </div>

                    ${content.analogy ? `
                        <div class="analogy-box">
                            <h4>🌟 Analogia</h4>
                            <p>${content.analogy}</p>
                        </div>
                    ` : ''}
                </div>

                <div class="phase-actions">
                    <button class="btn-primary" onclick="Phase2SimplifiedTheory.advance()">
                        Ho capito, proseguiamo! →
                    </button>
                </div>

                <div class="auto-advance-notice">
                    💡 <em>Questa sezione avanza automaticamente tra <span id="countdown">30</span> secondi</em>
                </div>
            </div>
        `;

        document.getElementById('app-content').innerHTML = html;

        // Avvio countdown auto-avanzamento (30 secondi)
        startAutoAdvanceCountdown(30);
    }

    /**
     * Avanza a Fase 3
     */
    function advance() {
        console.log('➡️ Avanzamento da Fase 2 → Fase 3');

        // Cancella timer se esistente
        if (autoAdvanceTimer) {
            clearInterval(autoAdvanceTimer);
        }

        StateManager.advancePhase();
        AppController.renderCurrentPhase();
    }

    /**
     * Countdown auto-avanzamento
     */
    function startAutoAdvanceCountdown(seconds) {
        let remaining = seconds;
        const countdownEl = document.getElementById('countdown');

        autoAdvanceTimer = setInterval(() => {
            remaining--;
            if (countdownEl) {
                countdownEl.textContent = remaining;
            }

            if (remaining <= 0) {
                clearInterval(autoAdvanceTimer);
                advance();
            }
        }, 1000);
    }

    /**
     * Formatta contenuto
     */
    function formatContent(text) {
        return text
            .split('\n\n')
            .map(para => `<p>${para.trim()}</p>`)
            .join('');
    }

    /**
     * FALLBACK: Generazione via IA (Stile ELI5)
     */
    async function renderFallbackWithAI() {
        const state = StateManager.getState();
        const meta = DataManager.getConceptMetadata(state.currentConceptId);
        const title = meta ? meta.title : "Concetto";

        const container = document.getElementById('app-content');
        container.innerHTML = `
            <div class="phase-container phase2-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-warning">FASE 2/5 (GENERATA DA IA)</span>
                    <h2>${title}</h2>
                    <p class="phase-subtitle">Semplificazione in corso...</p>
                </div>
                <div class="loader-container">
                    <div class="loader"></div>
                    <p>L'IA sta semplificando il concetto per te...</p>
                </div>
            </div>
        `;

        try {
            // Usa generateAlternativeExplanation con attempt=3 (ELI5 Mode)
            const generatedText = await GroqAPIClient.generateAlternativeExplanation(title, null, 3);

            if (!generatedText) throw new Error("Risposta vuota dall'IA");

            // Costruiamo oggetto content fittizio
            const mockContent = {
                title: title,
                content: generatedText,
                analogy: "Spiegazione generata automaticamente dall'IA per massima chiarezza."
            };

            // Override render standard
            renderGeneratedContent(container, mockContent);

        } catch (error) {
            console.error("Errore fallback Phase2:", error);
            container.innerHTML += `<div class="error-box">Errore generazione: ${error.message}</div>`;
        }
    }

    function renderGeneratedContent(container, content) {
        const html = `
            <div class="phase-container phase2-container">
                <div class="phase-header">
                    <span class="phase-badge phase-badge-success">FASE 2/5 (GENERATA DA IA)</span>
                    <h2>${content.title}</h2>
                    <p class="phase-subtitle">Versione Semplificata - Intuizione</p>
                </div>

                <div class="simplified-content">
                    <div class="simplified-text">
                        ${formatContent(content.content)}
                    </div>

                    <div class="analogy-box">
                        <h4>🌟 Analogia (IA)</h4>
                        <p>${content.analogy}</p>
                    </div>
                </div>

                <div class="phase-actions">
                    <button class="btn-primary" onclick="Phase2SimplifiedTheory.advance()">
                        Ho capito, proseguiamo! →
                    </button>
                </div>
                
                 <div class="auto-advance-notice">
                    💡 <em>Questa sezione avanza automaticamente tra <span id="countdown">30</span> secondi</em>
                </div>
            </div>
        `;
        container.innerHTML = html;
        startAutoAdvanceCountdown(30);
    }

    // Public API
    return {
        render,
        advance
    };
})();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Phase2SimplifiedTheory;
}
