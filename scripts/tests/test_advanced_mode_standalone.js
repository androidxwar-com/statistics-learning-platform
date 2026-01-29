
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("❌ ERROR: Missing GROQ_API_KEY in .env");
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });
const MODEL = 'llama-3.1-8b-instant';

// MOCK DATA for Concept
const TEST_CONCEPT = {
    title: "Distribuzione Normale",
    phase1_complex: {
        title: "Distribuzione Normale",
        content: "La distribuzione normale è una distribuzione di probabilità continua che è simmetrica rispetto alla sua media, mostra che i dati vicini alla media sono più frequenti di quelli lontani dalla media.",
    }
};

async function callGroq(prompt, system) {
    const completion = await groq.chat.completions.create({
        messages: [
            { role: 'system', content: system },
            { role: 'user', content: prompt }
        ],
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1500
    });
    return completion.choices[0]?.message?.content;
}

async function testAdvancedMode() {
    console.log("🔥 TESTING ADVANCED MODE (Fiamma) - 3 PHASES");

    // ----------------------------------------------------
    // PHASE 1: LEZIONE MAGISTRALE
    // ----------------------------------------------------
    console.log("\n[1/3] Testing 'Lezione Magistrale' generation...");

    const p1_prompt = `
    STRUTTURA CONCETTO [DOC1]:
    ${JSON.stringify(TEST_CONCEPT)}

    OBIETTIVO:
    Crea una SCHEDA TECNICA (Cheat Sheet) visivamente pulita.
    
    REQUISITI FORMATTAZIONE (TASSATIVI):
    1.  **NO MARKDOWN**: Non usare mai '#', '*', o '-'. 
    2.  **GRASSETTO**: Usa SOLO il tag <b>parola</b>. VIETATO usare **parola**.
    3.  **ICONE**: Usa queste icone specifiche:
        -   "⭐" per definizioni.
        -   "⚠️" per eccezioni.
        -   "➡️" per passaggi.
    
    STILE OUTPUT:
    <h3>[TITOLO]</h3>
    <p>⭐ <b>Definizione:</b> [Formula/Concetto]</p>
    <ul>
        <li>➡️ <b>Condizione:</b> [Testo...]</li>
        <li>➡️ <b>Esempio:</b> [Esempio...]</li>
    </ul>
    <p>⚠️ <b>Attenzione:</b> [Eccezione...]</p>
    
    OUTPUT: HTML formattato (senza tag body/html).`;

    try {
        const r1 = await callGroq(p1_prompt, 'Sei un Tutor di Statistica. Rispondi SOLO in HTML. Mai Markdown.');
        console.log(`✅ Phase 1 Response (${r1.length} chars):`);
        if (r1.includes('**')) console.warn("⚠️ Warning: Markdown detected in Phase 1");
        // console.log(r1.substring(0, 200) + "...");
    } catch (e) { console.error("❌ Phase 1 Failed", e.message); }


    // ----------------------------------------------------
    // PHASE 2: DATA PRACTICE
    // ----------------------------------------------------
    console.log("\n[2/3] Testing 'Analisi Dati' generation...");

    const p2_prompt = `
    CONCETTO: ${TEST_CONCEPT.phase1_complex.title}

    OBIETTIVO:
    Crea un'ANALISI PRATICA AVANZATA.

    FORMATO HTML RIGIDO (NO MARKDOWN):
    1.  <h3>🏢 Scenario: [Nome]</h3>
    2.  Genera una <table border="1"> con dati simulati.
    3.  <p>⚙️ <b>Calcolo:</b> [Formula con numeri]</p>
    4.  <p>🚀 <b>Decisione:</b> [Conclusione]</p>

    REGOLE:
    - Usa <b>bold</b> (NON **bold**).
    - Usa <i>italic</i> (NON *italic*).
    
    OUTPUT: HTML formattato.`;

    try {
        const r2 = await callGroq(p2_prompt, 'Sei un Chief Data Officer. Rispondi SOLO in HTML. Mai Markdown.');
        console.log(`✅ Phase 2 Response (${r2.length} chars):`);
        if (r2.includes('<table')) console.log("   - Table detected ✅");
        else console.warn("   - NO Table detected ⚠️");
    } catch (e) { console.error("❌ Phase 2 Failed", e.message); }


    // ----------------------------------------------------
    // PHASE 3: MASTER EXAM
    // ----------------------------------------------------
    console.log("\n[3/3] Testing 'Master Exam' generation...");

    const p3_prompt = `
        ARGOMENTO: ${TEST_CONCEPT.title}

        OBIETTIVO:
        Genera 1 DOMANDA DI ESAME "CATTIVA"(Livello Massimo Difficoltà).

        REGOLE:
        - La domanda deve essere insidiosa, testare eccezioni o casi limite.
        - Le 3 opzioni devono essere quasi identiche, differendo per dettagli sottili.
        
        JSON FORMAT:
        {
            "question": "Testo domanda...",
            "options": ["Opzione A (Distrattore Forte)", "Opzione B (Distrattore Forte)", "Opzione C (Corretta)"],
            "correctIndex": 2,
            "explanation": "Spiegazione tecnica del perché A e B sono sbagliate."
        } `;

    try {
        const r3 = await callGroq(p3_prompt, 'Sei un Esaminatore Severo che vuole testare la vera comprensione.');
        console.log(`✅ Phase 3 Response (${r3.length} chars):`);

        // Robust Parsing Logic (Mirroring api-client.js)
        const match = r3.match(/\{[\s\S]*\}|$/);
        if (match && match[0]) {
            const json = JSON.parse(match[0]);
            console.log(`   - Question: "${json.question}"`);
            console.log(`   - Options: ${json.options.length}`);
            console.log("   - JSON Parsed Successfully ✅");
        } else {
            throw new Error("No JSON structure found in response");
        }

    } catch (e) { console.error("❌ Phase 3 Failed", e.message); }

    console.log("\n✨ Verification Complete.");
}

testAdvancedMode();
