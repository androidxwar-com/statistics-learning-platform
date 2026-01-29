
/**
 * Prompt Registry
 * 
 * Centralizza tutti i prompt inviati all'IA.
 * Permette di modificare la "personalità" del sistema senza toccare la logica core.
 */

const PromptRegistry = {

    /**
     * System Prompts (Personalità base)
     */
    SYSTEM: {
        TUTOR: "Sei un Tutor di Statistica. Rispondi SOLO in HTML. Mai Markdown.",
        DATA_SCIENTIST: "Sei un Chief Data Officer. Rispondi SOLO in HTML. Mai Markdown.",
        EXAMINER: "Sei un Esaminatore Severo che vuole testare la vera comprensione. Rispondi SOLO in JSON raw.",
        COACH: "Sei un tutor che aiuta gli studenti a capire i loro errori in modo costruttivo."
    },

    /**
     * Phase 1 Advanced: Lezione Magistrale
     */
    THEORY_ADVANCED: {
        // Primo tentativo: Lezione Accademica rigorosa
        INITIAL: (title, context) => `
            STRUTTURA CONCETTO [DOC1]:
            ${context}

            OBIETTIVO:
            Crea una SCHEDA TECNICA (Cheat Sheet) visivamente pulita.
            
            REQUISITI FORMATTAZIONE (TASSATIVI):
            1.  **NO MARKDOWN**: Non usare mai '#', '*', o '-'. 
            2.  **GRASSETTO**: Usa SOLO il tag <b>parola</b>. VIETATO usare **parola**.
            3.  **ICONE**: Usa queste icone specifiche:
                -   "⭐" per definizioni.
                -   "⚠️" per eccezioni.
                -   "➡️" per passaggi.
            
            PROMPT OTTIMIZZATO (LEZIONE MAGISTRALE):
            Definisci il concetto: "${title}".
            
            OBIETTIVO:
            Crea una lezione universitaria avanzata che copra:
            1. TEORIA: Definizione rigorosa (assiomatica).
            2. MATEMATICA: Formule, dimostrazioni o proprietà chiave.
            3. DATI: Un esempio numerico concreto o dataset di riferimento.
            4. CODICE/FUNZIONI: Pseudocodice o riferimento a funzioni R/Python (es. dnorm, pnorm).

            STRUTTURA HTML OBBLIGATORIA (NO MARKDOWN):
            <h3>🎓 Concetto Multidimensionale</h3>
            <p>...spiegazione teorica profonda...</p>

            <h3>📐 Analisi Matematica</h3>
            <p>...formule e derivazioni...</p>

            <h3>📊 Dati & Applicazione</h3>
            <p>...esempio numerico reale...</p>
            <div class="code-block">
                ...funzione statistica (es. R/Python)...
            </div>

            REGOLE:
            - Usa <b>bold</b> per enfasi.
            - Usa <i>italic</i> per variabili.
            - Sii "Professorale" ma chiaro.
            - NO MARKDOWN. SOLO HTML.
            
            OUTPUT: HTML formattato.
        `,

        // Fallback: Spiegazione Pratica (Data Scientist)
        RETRY: (title) => `
            PROMPT RETRY (AGENTE PRATICO):
            L'utente non ha capito la teoria su: "${title}".
            
            CAMBIO STRATEGIA:
            Spiega il concetto come un Data Scientist che analizza un dataset.
            FOCUS: Numeri, Interpretazione, Grafici mentali.

            STRUTTURA HTML:
            <h3>📉 L'Intuizione dai Dati</h3>
            <p>...spiegazione basata sui dati...</p>

            <h3>🧮 Esempio Passo-Passo</h3>
            <ul>
                <li><b>Input:</b> x = ...</li>
                <li><b>Processo:</b> ...</li>
                <li><b>Output:</b> ...</li>
            </ul>

            REGOLE:
            - Usa <b>bold</b>.
            - Concretezza assoluta.
            
            OUTPUT: HTML formattato.
        `
    },

    /**
     * Phase 2 Advanced: Analisi Dati (Case Study)
     */
    DATA_PRACTICE: {
        INITIAL: (title) => `
            CONCETTO: ${title}

            OBIETTIVO:
            Crea un'ANALISI PRATICA AVANZATA.

            FORMATO HTML RIGIDO(NO MARKDOWN):
            1. <h3>🏢 Scenario: [Nome]</h3>
            2. Genera una <table border="1"> con dati simulati.
            3. <p>⚙️ <b>Calcolo:</b> [Formula con numeri]</p>
            4. <p>🚀 <b>Decisione:</b> [Conclusione]</p>

            REGOLE:
            - Usa <b>bold</b> (NON ** bold **).
            - Usa <i>italic</i> (NON * italic *).

            OUTPUT: HTML formattato.
        `,

        RETRY: (title) => `
            L'utente NON HA CAPITO l'analisi precedente: ${title}.

            OBIETTIVO:
            Nuovo scenario (es. Medicina / Ingegneria).
            
            FORMATO HTML RIGIDO:
            <h3>🏥 Scenario Alternativo</h3>
            [Tabella HTML]
            <p>💉 <b>Risultato:</b> [Analisi con tag <b>bold</b>]</p>

            OUTPUT: HTML formattato.
        `
    },

    /**
     * Phase 1 Standard: Spiegazione Alternativa
     */
    ALTERNATIVE_EXPLANATION: (title, originalText, attempt, styleInstruction) => `
        CONTESTO:
        L'utente è bloccato sul concetto: "${title}".
        Ha letto la definizione formale ma non l'ha capita (Tentativo #${attempt}).
        
        TESTO ORIGINALE (che non ha funzionato): 
        "${originalText}"

        OBIETTIVO:
        Genera una spiegazione alternativa seguendo questa strategia:
        ${styleInstruction}

        REQUISITI FORMATTAZIONE (TASSATIVI):
        1.  **NO MARKDOWN**: Non usare mai '#', '*', o '-'. 
        2.  **ICONE OBBLIGATORIE**:
            -   💡 per l'intuizione/analogia.
            -   🔧 per la meccanica/funzionamento.
            -   ⭐ per il concetto chiave.
        3.  **STRUTTURA HTML**:
            <h3>💡 [Titolo Analogia]</h3>
            <p>...spiegazione...</p>
            <h3>🔧 Come Funziona</h3>
            <p>...dettagli...</p>

        OUTPUT: HTML formattato (senza tag body/html).
    `,

    /**
     * Quizzes (Master & Standard)
     */
    QUIZ: {
        MASTER: (title) => `
            ARGOMENTO: ${title}

            OBIETTIVO:
            Genera 1 DOMANDA DI ESAME "CATTIVA" (Livello Massimo Difficoltà).

            REGOLE:
            - La domanda deve essere insidiosa, testare eccezioni o casi limite.
            - Le 3 opzioni devono essere quasi identiche, differendo per dettagli sottili.
            
            JSON FORMAT:
            {
                "question": "Testo domanda...",
                "options": ["Opzione A (Distrattore Forte)", "Opzione B (Distrattore Forte)", "Opzione C (Corretta)"],
                "correctIndex": 2,
                "explanation": "Spiegazione tecnica del perché A e B sono sbagliate."
            }
        `,

        STANDARD: (concept, mode, descMode, difficulty, descDiff) => `
            Genera UNA domanda a risposta multipla sul concetto "${concept}".

            Modalità: ${mode.toUpperCase()}
            ${descMode}

            Difficoltà: ${difficulty.toUpperCase()}
            ${descDiff}

            Formato JSON richiesto:
            {
              "question": "Testo della domanda",
              "options": ["Opzione A", "Opzione B", "Opzione C"],
              "correctIndex": 0,
              "explanation": "Spiegazione della risposta corretta"
            }

            IMPORTANTE:
            - Esattamente 3 opzioni
            - correctIndex indica l'indice (0, 1 o 2) della risposta corretta
            - Explanation deve spiegare perché la risposta è corretta
            - Domanda in ITALIANO
        `
    },

    /**
     * Feedback Correzione
     */
    FEEDBACK: (question, wrong, correct) => `
        L'utente ha risposto ERRONEAMENTE a questa domanda:

        Domanda: "${question}"
        Ha scelto: "${wrong}"
        Risposta corretta: "${correct}"

        Fornisci un feedback che:
        1. Spiega perché la risposta scelta è sbagliata
        2. Chiarisce il concetto chiave non compreso
        3. Spiega perché la risposta corretta è giusta

        Usa un tono incoraggiante ma diretto. Max 150 parole, in italiano.
    `
};

// Export UMD Safe
(function (global) {
    global.PromptRegistry = PromptRegistry;
})(typeof window !== 'undefined' ? window : this);
