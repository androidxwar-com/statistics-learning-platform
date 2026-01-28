/**
 * DataManager - Gestore Dati Avanzato "Antigravity"
 * 
 * Responsabilità:
 * 1. Caricamento centralizzato di tutti i JSON
 * 2. VALIDAZIONE RIGOROSA (Schema & Link integrity)
 * 3. Notifica errori dettagliata
 */

const DataManager = (function () {
    // Stato interno
    const state = {
        topics: null,
        theory: null,
        questions: null,
        isLoaded: false
    };

    /**
     * Inizializzazione Core
     * @returns {Promise<boolean>} Successo/Fallimento
     */
    async function init() {
        console.log('[DataManager] Init avviato...');

        try {
            // 1. Caricamento Parallelo
            const [topicsRaw, theoryRaw, questionsRaw] = await Promise.all([
                fetchJSON('config/topics-structure.json'),
                fetchJSON('data/theory-content.json'),
                fetchJSON('data/questions-bank.json')
            ]);

            // 2. Validazione Strutturale (Syntax & Base Schema)
            validateTopicsStructure(topicsRaw);
            validateTheoryContent(theoryRaw);
            // Questions validation optional for now

            // 3. Validazione Integrità (Referential Integrity)
            // Ogni ID in Structure DEVE esistere in Content
            const missingIDs = checkReferentialIntegrity(topicsRaw, theoryRaw);

            if (missingIDs.length > 0) {
                console.warn('[DataManager] Warning: Concept IDs mancanti nel contenuto:', missingIDs);
                // Non blocchiamo l'app, ma la UI saprà gestire i dati mancanti
            }

            // 4. Salvataggio nello stato
            state.topics = topicsRaw;
            state.theory = theoryRaw;
            state.questions = questionsRaw;
            state.isLoaded = true;

            console.log('[DataManager] Init completato con successo. Dati pronti.');

            // Notifica evento globale (se EventBus esiste)
            if (window.EventBus) {
                window.EventBus.emit('DATA_READY', { missingIDs });
            }

            return true;

        } catch (error) {
            console.error('[DataManager] CRITICAL ERROR:', error);
            if (window.EventBus) {
                window.EventBus.emit('DATA_ERROR', { message: error.message });
            } else {
                alert(`Errore Critico Dati: ${error.message}`);
            }
            return false;
        }
    }

    /**
     * Wrapper Fetch con controllo Protocollo e Errori HTTP
     */
    async function fetchJSON(path) {
        // Controllo Protocollo file:// (Ridondante con index.html ma sicurezza in più)
        if (window.location.protocol === 'file:') {
            throw new Error('Impossibile caricare dati via file:// protocol. Usa Live Server.');
        }

        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`File non trovato: ${path} (Status ${response.status})`);
        }

        try {
            return await response.json();
        } catch (e) {
            throw new Error(`Errore SINTASSI JSON in ${path}: ${e.message}`);
        }
    }

    /**
     * Validatori Specifici
     */
    function validateTopicsStructure(data) {
        if (!data.macro_topics || !Array.isArray(data.macro_topics)) {
            throw new Error('topics-structure.json non valido: Manca array "macro_topics"');
        }
    }

    function validateTheoryContent(data) {
        if (!data.concepts || typeof data.concepts !== 'object') {
            throw new Error('theory-content.json non valido: Manca oggetto "concepts"');
        }
    }

    /**
     * Controllo Integrità Referenziale
     * @returns {Array<string>} Lista ID mancanti
     */
    function checkReferentialIntegrity(structure, content) {
        const missing = [];
        const contentIDs = Object.keys(content.concepts);

        structure.macro_topics.forEach(macro => {
            macro.subtopics.forEach(sub => {
                sub.concepts.forEach(concept => {
                    if (!contentIDs.includes(concept.id)) {
                        missing.push(concept.id);
                    }
                });
            });
        });

        return missing;
    }

    // --- Public API (Getters) ---

    function getTopics() {
        return state.topics;
    }

    function getConceptTheory(id) {
        if (!state.theory) return null;
        return state.theory.concepts[id] || null;
    }

    function getConceptQuestions(id) {
        if (!state.questions || !state.questions.questions) return null;
        return state.questions.questions[id] || [];
    }

    /**
     * Trova metadati concetto (Titolo, Padre, ecc.) dato ID
     */
    function getConceptMetadata(conceptId) {
        if (!state.topics) return null;

        for (const macro of state.topics.macro_topics) {
            for (const sub of macro.subtopics) {
                const found = sub.concepts.find(c => c.id === conceptId);
                if (found) {
                    return {
                        macroTitle: macro.title,
                        subTitle: sub.title,
                        title: found.title,
                        id: found.id
                    };
                }
            }
        }
        return null;
    }

    return {
        init,
        getTopics,
        getConceptTheory,
        getConceptQuestions,
        getConceptMetadata
    };

})();

// Export per compatibilità
window.DataManager = DataManager;
