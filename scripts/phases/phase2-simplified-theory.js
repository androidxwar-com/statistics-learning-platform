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
