/**
 * State Manager - Gestione Centralizzata dello Stato dell'Applicazione
 * 
 * Gestisce: fase corrente, argomento, modalità, progresso utente
 * Persistenza: localStorage per ripristino sessione
 */

const StateManager = (function () {
    // Stato di default dell'applicazione
    const DEFAULT_STATE = {
        // Modalità corrente: 'home' (con calcoli) | 'away' (logica)
        currentMode: 'home',

        // Navigazione contenuti
        currentTopicId: 'variabili-casuali-discrete',
        currentSubtopicId: 'vcd-definizione',
        currentConceptId: 'vcd-def-base',

        // Fase attuale del percorso didattico (1-5)
        currentPhase: 1,

        // Storico fasi per recovery
        phaseHistory: [],

        // Concetti completati (array di conceptId)
        completedConcepts: [],

        // Tentativi errati per concetto (per analytics)
        incorrectAttempts: {},

        // Timestamp ultima interazione
        lastUpdated: null,

        // Flag per riesecuzione spiegazioni alternative (Fase 1)
        requestedAlternativeExplanation: false,

        // Indice domanda corrente nel quiz (Fase 4-5)
        currentQuestionIndex: 0,
        totalQuestionsInQuiz: 3
    };

    let state = { ...DEFAULT_STATE };

    /**
     * Carica stato da localStorage
     */
    function loadState() {
        try {
            const saved = localStorage.getItem('learningPlatformState');
            if (saved) {
                const parsed = JSON.parse(saved);
                state = { ...DEFAULT_STATE, ...parsed };
                console.log('📥 Stato caricato da localStorage:', state);
                return true;
            }
        } catch (error) {
            console.error('❌ Errore caricamento stato:', error);
        }
        return false;
    }

    /**
     * Salva stato in localStorage e notifica listener
     */
    function saveState(notify = true) {
        try {
            state.lastUpdated = new Date().toISOString();
            localStorage.setItem('learningPlatformState', JSON.stringify(state));

            if (notify && window.EventBus) {
                window.EventBus.emit('STATE_UPDATED', getState());
            }
        } catch (error) {
            console.error('❌ Errore salvataggio stato:', error);
        }
    }

    /**
     * Ottieni stato corrente (copia per evitare mutazioni)
     */
    function getState() {
        return { ...state };
    }

    /**
     * Aggiorna stato (merge parziale)
     */
    function setState(updates) {
        state = { ...state, ...updates };
        saveState(true);
    }

    /**
     * Avanza alla fase successiva
     */
    function advancePhase() {
        if (state.currentPhase < 5) {
            state.phaseHistory.push(state.currentPhase);
            state.currentPhase++;
            saveState();
            console.log(`➡️ Avanzamento: Fase ${state.currentPhase}`);
            return true;
        }
        return false;
    }

    /**
     * Torna alla fase 1 (per recupero dopo errore)
     */
    function resetToPhase1() {
        state.currentPhase = 1;
        state.currentQuestionIndex = 0;
        state.requestedAlternativeExplanation = false;
        saveState();
        console.log('🔙 Reset a Fase 1 per ripasso');
    }

    /**
     * Completa concetto corrente e passa al successivo
     */
    function completeCurrentConcept() {
        const conceptId = state.currentConceptId;

        // Aggiungi a completati se non già presente
        if (!state.completedConcepts.includes(conceptId)) {
            state.completedConcepts.push(conceptId);
        }

        // Reset fase per nuovo concetto
        state.currentPhase = 1;
        state.currentQuestionIndex = 0;
        state.phaseHistory = [];

        saveState();
        console.log(`✅ Concetto completato: ${conceptId}`);
    }

    /**
     * Cambia modalità (home/away)
     */
    function toggleMode() {
        state.currentMode = state.currentMode === 'home' ? 'away' : 'home';

        // Se siamo in fase quiz, resetta domanda corrente
        if (state.currentPhase >= 4) {
            state.currentQuestionIndex = 0;
        }

        saveState();
        console.log(`🔄 Modalità cambiata: ${state.currentMode.toUpperCase()}`);
        return state.currentMode;
    }

    /**
     * Registra tentativo errato
     */
    function recordIncorrectAttempt(conceptId, questionId) {
        if (!state.incorrectAttempts[conceptId]) {
            state.incorrectAttempts[conceptId] = [];
        }
        state.incorrectAttempts[conceptId].push({
            questionId,
            timestamp: new Date().toISOString()
        });
        saveState();
    }

    /**
     * Reset completo (ricomincia da zero)
     */
    function resetProgress() {
        if (confirm('⚠️ Vuoi davvero ricominciare da zero? Tutto il progresso verrà perso.')) {
            state = { ...DEFAULT_STATE };
            saveState();
            location.reload();
        }
    }

    /**
     * Imposta concetto da caricare
     */
    function setCurrentConcept(topicId, subtopicId, conceptId) {
        state.currentTopicId = topicId;
        state.currentSubtopicId = subtopicId;
        state.currentConceptId = conceptId;
        state.currentPhase = 1;
        state.currentQuestionIndex = 0;
        state.phaseHistory = [];
        saveState();
    }

    /**
     * Avanza domanda quiz
     */
    function nextQuizQuestion() {
        if (state.currentQuestionIndex < state.totalQuestionsInQuiz - 1) {
            state.currentQuestionIndex++;
            saveState();
            return true;
        }
        return false; // Quiz completato
    }

    // Inizializza al caricamento modulo
    loadState();

    // Public API
    return {
        getState,
        setState,
        advancePhase,
        resetToPhase1,
        completeCurrentConcept,
        toggleMode,
        recordIncorrectAttempt,
        resetProgress,
        setCurrentConcept,
        nextQuizQuestion,
        saveState,
        loadState
    };
})();

// Export per utilizzo in altri moduli
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StateManager;
}
