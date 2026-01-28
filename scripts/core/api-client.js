/**
 * Groq API Client
 * 
 * Gestisce chiamate all'API Groq per:
 * - Spiegazioni alternative (Fase 1)
 * - Generazione domande dinamiche (Fase 4-5)
 * - Feedback su risposte errate
 */

const GroqAPIClient = (function () {
    let config = null;
    let requestQueue = [];
    let isProcessing = false;
    let responseCache = new Map();

    /**
     * Inizializza client con configurazione
     */
    function init(apiConfig) {
        config = apiConfig;
        console.log('🤖 Groq API Client inizializzato:', config.demoMode ? 'DEMO MODE' : 'PRODUCTION MODE');
    }

    /**
     * Chiama API Groq con retry logic
     */
    async function callAPI(prompt, systemPrompt = 'Sei un tutor esperto di statistica e probabilità.') {
        // Check cache
        const cacheKey = `${systemPrompt}:${prompt}`;
        if (responseCache.has(cacheKey)) {
            console.log('📦 Risposta da cache');
            return responseCache.get(cacheKey);
        }

        // Modalità demo: ritorna risposta SIMULATA istantanea
        if (!config || config.demoMode || !config.apiKey || config.apiKey === 'YOUR_GROQ_API_KEY_HERE') {
            console.log('⚡ SIMULATION MODE: Generazione risposta istantanea (Mock)');
            await sleep(1000); // Piccolo delay per realismo
            return simulateResponse(prompt);
        }

        // Verifica API key (se non demo)
        if (!config.apiKey) {
            console.error('❌ API Key non configurata!');
            return simulateResponse(prompt); // Fallback to simulation safeguard
        }

        const requestBody = {
            model: config.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            max_tokens: config.maxTokens,
            temperature: config.temperature
        };

        let lastError = null;

        // Retry loop
        for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
            try {
                console.log(`🚀 Chiamata Groq API (tentativo ${attempt}/${config.maxRetries})...`);

                const response = await fetch(config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${config.apiKey}`
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(`API Error ${response.status}: ${errorData.error?.message || 'Unknown'}`);
                }

                const data = await response.json();
                const content = data.choices[0]?.message?.content;

                if (!content) {
                    throw new Error('Risposta vuota dall\'API');
                }

                // Salva in cache
                responseCache.set(cacheKey, content);
                console.log('✅ Risposta Groq ricevuta');

                return content;

            } catch (error) {
                lastError = error;
                console.error(`❌ Errore tentativo ${attempt}:`, error.message);

                // Attendi prima di retry
                if (attempt < config.maxRetries) {
                    await sleep(config.retryDelay);
                }
            }
        }

        console.error('❌ Tutti i tentativi falliti:', lastError);
        return null;
    }

    /**
     * Genera spiegazione alternativa ADATTIVA (Infinite Loop) - PROMPT ENGINEERED
     */
    async function generateAlternativeExplanation(conceptTitle, originalExplanation, attempt = 1) {
        let styleInstruction = "";

        // Strategia Adattiva Avanzata
        switch (attempt) {
            case 1:
                styleInstruction = `
                STRATEGIA: ANALOGIA CONCRETA (Life-Based)
                - Non usare MAI gergo tecnico senza spiegarlo.
                - Usa una metafora presa dalla vita reale (cucina, soldi, sport, traffico).
                - Collega l'analogia al concetto matematico: "Proprio come X, anche Y funziona così..."
                - Esempio: "La varianza è come l'incertezza del meteo: se c'è sempre sole varianza 0..."
                `;
                break;
            case 2:
                styleInstruction = `
                STRATEGIA: ESEMPIO NUMERICO PASSO-PASSO (Hands-on)
                - Inventa numeri semplicissimi (es. 2, 5, 10).
                - Scrivi i calcoli riga per riga.
                - Spiega COSA stai facendo in ogni passaggio e PERCHÉ.
                - Concludi con: "Vedi? Il risultato ci dice che..."
                `;
                break;
            case 3:
                styleInstruction = `
                STRATEGIA: ELI5 (Explain Like I'm 5)
                - Immagina di parlare a un bambino curioso.
                - Usa frasi brevi. Soggetto, Verbo, Oggetto.
                - Estremizza il concetto per renderlo ovvio.
                - Usa emoji per rendere il testo amichevole.
                `;
                break;
            default:
                styleInstruction = `
                STRATEGIA: SOCRATICA & VISIVA
                - Non spiegare, fai domande retoriche che guidano alla soluzione.
                - Usa bullet points per spezzare il ragionamento.
                - Prova a descrivere un grafico o un'immagine mentale.
                - "Immagina di vedere..."
                `;
                break;
        }

        const systemPrompt = `
        SEI IL MIGLIOR TUTOR DI STATISTICA DEL MONDO.
        La tua missione è sbloccare la comprensione dello studente a tutti i costi.
        
        REGOLE FERREE:
        1.  **BANALITÀ VIETATA**: Non dire mai "Proviamo a guardarla diversamente" senza aggiungere sostanza. Entra subito nel vivo.
        2.  **CONCRETEZZA**: Se parli di teoria, devi subito ancorarla alla realtà.
        3.  **STRUTTURA**: Usa grassetti (**text**) per i concetti chiave e liste puntate.
        4.  **TONO**: Empatico, paziente, ma estremamente competente. Mai freddo.
        
        Sei l'ultima speranza dello studente per capire questo concetto. Non fallire.
        `;

        const prompt = `
        CONTESTO:
        L'utente è bloccato sul concetto: "${conceptTitle}".
        Ha letto la definizione formale ma non l'ha capita (Tentativo #${attempt}).
        
        TESTO ORIGINALE (che non ha funzionato): 
        "${originalExplanation}"

        ORDINE ESECUTIVO:
        Genera una spiegazione alternativa seguendo RIGOROSAMENTE questa strategia:
        ---
        ${styleInstruction}
        ---

        Rispondi in italiano perfetto. Lunghezza: quanto serve per essere chiari (circa 150-200 parole).`;

        return await callAPI(prompt, systemPrompt);
    }

    /**
     * Genera nuova domanda quiz (Fase 4-5)
     */
    async function generateQuizQuestion(conceptId, mode, difficulty) {
        const modeDesc = mode === 'home'
            ? 'La domanda deve richiedere calcoli matematici (lo studente ha carta e penna)'
            : 'La domanda deve essere puramente logica/concettuale (senza calcoli)';

        const difficultyDesc = difficulty === 'basic'
            ? 'Domanda di difficoltà BASE (concetto singolo, applicazione diretta)'
            : 'Domanda AVANZATA (combinazione di concetti, pensiero critico)';

        const prompt = `Genera UNA domanda a risposta multipla sul concetto "${conceptId}".

Modalità: ${mode.toUpperCase()}
${modeDesc}

Difficoltà: ${difficulty.toUpperCase()}
${difficultyDesc}

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
- Domanda in ITALIANO`;

        const response = await callAPI(prompt, 'Sei un esperto di statistica che crea quiz educativi.');

        if (!response) return null;

        try {
            // Estrai JSON dalla risposta (può contenere markdown)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Nessun JSON trovato nella risposta');
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error) {
            console.error('❌ Errore parsing JSON da Groq:', error);
            return null;
        }
    }

    /**
     * Genera feedback su risposta errata
     */
    async function generateFeedback(question, wrongAnswer, correctAnswer) {
        const prompt = `L'utente ha risposto ERRONEAMENTE a questa domanda:

Domanda: "${question}"
Ha scelto: "${wrongAnswer}"
Risposta corretta: "${correctAnswer}"

Fornisci un feedback che:
1. Spiega perché la risposta scelta è sbagliata
2. Chiarisce il concetto chiave non compreso
3. Spiega perché la risposta corretta è giusta

Usa un tono incoraggiante ma diretto. Max 150 parole, in italiano.`;

        return await callAPI(prompt, 'Sei un tutor che aiuta gli studenti a capire i loro errori in modo costruttivo.');
    }

    /**
     * Utility: sleep
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Svuota cache risposte
     */
    function clearCache() {
        responseCache.clear();
        console.log('🗑️ Cache Groq svuotata');
    }

    /**
     * Simula una risposta AI intelligente basata sul prompt
     */
    function simulateResponse(prompt) {
        // Riconoscimento pattern semplice per decidere cosa rispondere

        // Caso 1: Feedback Errore
        if (prompt.includes('risposto ERRONEAMENTE')) {
            const feedbacks = [
                "Hai sbagliato perché hai confuso la definizione. Ricorda: La probabilità non può mai essere negativa!",
                "Attenzione! Hai considerato l'insieme sbagliato. Rileggi bene la domanda.",
                "Errore comune. Il valore atteso è una media ponderata, non il valore più frequente."
            ];
            return feedbacks[Math.floor(Math.random() * feedbacks.length)];
        }

        // Caso 2: Quiz JSON (Dynamic Generation)
        if (prompt.includes('Genera UNA domanda a risposta multipla')) {
            // Estrai topic dal prompt
            let topic = "di Statistica";
            if (prompt.includes('variabili-casuali')) topic = "sulle Variabili Casuali";
            if (prompt.includes('teorema')) topic = "sul Teorema";

            // Logica simulazione: crea 1 corretta e 2 errate
            const correctAnswer = "Questa è la risposta corretta basata sui principi fondamentali.";
            const wrong1 = "Questa opzione contiene un errore logico comune.";
            const wrong2 = "Questa opzione è matematicamente errata.";

            // Metti tutto in un array
            let allOptions = [correctAnswer, wrong1, wrong2];

            // SHUFFLE (Mescola) le risposte in modo casuale
            for (let i = allOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
            }

            // Trova dove è finita la risposta corretta
            const correctIndex = allOptions.indexOf(correctAnswer);

            return JSON.stringify({
                question: `Domanda Generativa ${topic} #${Math.floor(Math.random() * 900) + 100}: Quale delle seguenti affermazioni è corretta?`,
                options: allOptions,
                correctIndex: correctIndex, // Indice dinamico corretto
                explanation: `La risposta corretta è "${correctAnswer}" perché rispetta le definizioni assiomatiche. L'errore nelle altre opzioni deriva da un'errata interpretazione.`
            });
        }

        // Caso 3: Spiegazione Alternativa (MOCK AVANZATO)
        if (prompt.includes('spiegazione sul concetto') || prompt.includes('Rispigalo')) {
            if (prompt.includes('ANALOGIA')) {
                return `**Analogia della Bilancia ⚖️**\n\nImmagina il Valore Atteso come il punto esatto dove devi mettere il dito sotto un righello per tenerlo in equilibrio.\n\nNon è detto che su quel punto ci sia un "peso" (un valore reale), ma è il *centro di gravità* di tutto il sistema. Se hai pesi grossi a sinistra, il punto di equilibrio si sposta a sinistra. Ecco, la media è proprio quel punto di equilibrio matematico.`;
            }
            if (prompt.includes('ESEMPIO NUMERICO')) {
                return `**Facciamo i conti in tasca 💰**\n\nImmagina questo gioco:\n- Lanci una moneta.\n- Testa: Vinci 10€.\n- Croce: Perdi 2€.\n\nConviene giocare?\nCalcoliamo la "speranza" (Valore Atteso):\n\n1. Probabilità Testa (0.5) × Vincita (10) = **5€**\n2. Probabilità Croce (0.5) × Perdita (-2) = **-1€**\n\nSomma: 5 - 1 = **4€**.\n\nSignifica che *in media*, ogni volta che giochi, guadagni 4€. Ti conviene eccome!`;
            }
            if (prompt.includes('bambino di 5 anni')) {
                return `**Spiegazione Semplice 👶**\n\nPensa al Valore Atteso come alla promessa di un regalo.\nSe la mamma ti promette "forse un gelato" (buono!) o "forse niente" (uffa...), tu nella tua testa ti aspetti una via di mezzo.\n\nIn matematica facciamo la stessa cosa: calcoliamo una "via di mezzo" tra tutte le cose belle e brutte che possono succedere, per sapere se essere felici o tristi prima ancora che succedano!`;
            }
            return `**Cambiamo prospettiva 🔭**\n\nDimentica le formule per un secondo. Pensa alla 'frequenza'. Se ripetessi questo esperimento un milione di volte, cosa succederebbe alla maggior parte dei risultati? Si accumulerebbero tutti intorno a un valore specifico. Quel valore è ciò che stiamo cercando. È il 'destino' verso cui tendono i tuoi dati.`;
        }

        return "Risposta generata dal sistema locale. Per risposte real-time specifiche, configura l'API Key.";
    }

    // Public API
    return {
        init,
        generateAlternativeExplanation,
        generateQuizQuestion,
        generateFeedback,
        clearCache
    };
})();

// Export Semplificato e Sicuro
if (typeof window !== 'undefined') {
    window.GroqAPIClient = GroqAPIClient;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroqAPIClient;
}

