/**
 * UserProfile (Il "Cervello" della Memoria)
 * 
 * Gestisce la persistenza dei dati utente:
 * - Progressi per concetto (Mastery Level)
 * - Punti deboli (Weak Spots)
 * - Statistiche globali (XP, Streak)
 * - Salvataggio locale su localStorage
 */

const UserProfile = (function () {

    const STORAGE_KEY = 'ema_user_profile_v1';

    // Stato Iniziale Default
    const defaultState = {
        username: 'Studente',
        xp: 0,
        streak: 0,
        lastActive: Date.now(),
        concepts: {
            // "binomiale": { mastery: 0-100, visits: 0, errors: [] }
        },
        stats: {
            quizzesTaken: 0,
            correctAnswers: 0
        }
    };

    let state = { ...defaultState };

    /**
     * Carica profilo da localStorage
     */
    function init() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                state = { ...defaultState, ...JSON.parse(stored) };
                console.log('🧠 UserProfile caricato:', state);
            } else {
                console.log('🧠 Nuovo UserProfile creato.');
                save();
            }
            checkStreak();
        } catch (e) {
            console.error('Errore caricamento UserProfile:', e);
        }
    }

    function save() {
        try {
            state.lastActive = Date.now();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            console.error('Errore salvataggio UserProfile:', e);
        }
    }

    /**
     * Registra visita a un concetto
     */
    function trackVisit(conceptId) {
        if (!state.concepts[conceptId]) {
            state.concepts[conceptId] = { mastery: 0, visits: 0, errors: 0 };
        }
        state.concepts[conceptId].visits++;
        save();
    }

    /**
     * Registra risultato quiz
     * @param {string} conceptId - ID del concetto
     * @param {boolean} isCorrect - Esito
     * @param {number} difficulty - 1 (Basic), 2 (Advanced), 3 (Master)
     */
    function trackQuizResult(conceptId, isCorrect, difficulty = 1) {
        if (!state.concepts[conceptId]) trackVisit(conceptId);

        const concept = state.concepts[conceptId];

        // Aggiorna Stats Globali
        state.stats.quizzesTaken++;
        if (isCorrect) state.stats.correctAnswers++;

        // Aggiorna Mastery
        const impact = isCorrect ? (10 * difficulty) : (-5 * difficulty);
        concept.mastery = Math.max(0, Math.min(100, concept.mastery + impact));

        if (!isCorrect) concept.errors++;

        // XP Reward
        if (isCorrect) {
            state.xp += (50 * difficulty);
        }

        save();
        console.log(`🧠 Progress Updated [${conceptId}]: Mastery ${concept.mastery}%`);
        return {
            newMastery: concept.mastery,
            xpGained: isCorrect ? (50 * difficulty) : 0
        };
    }

    /**
     * Identifica i punti deboli (Mastery < 40% con almeno 1 visita)
     */
    function getWeakSpots() {
        return Object.entries(state.concepts)
            .filter(([id, data]) => data.visits > 0 && data.mastery < 40)
            .map(([id, data]) => ({ id, mastery: data.mastery }));
    }

    /**
     * Gestione Streak (Giornaliero)
     */
    function checkStreak() {
        const lastDate = new Date(state.lastActive).setHours(0, 0, 0, 0);
        const today = new Date().setHours(0, 0, 0, 0);

        const diffDays = (today - lastDate) / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
            state.streak++; // Consecutivo
        } else if (diffDays > 1) {
            state.streak = 1; // Reset
        }
        // Se diffDays === 0, stessa giornata, non cambiare nulla
    }

    return {
        init,
        trackVisit,
        trackQuizResult,
        getWeakSpots,
        getState: () => ({ ...state })
    };

})();

// Export
if (typeof window !== 'undefined') window.UserProfile = UserProfile;
