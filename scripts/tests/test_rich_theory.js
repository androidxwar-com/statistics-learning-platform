
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

async function testRichTheory() {
    console.log("🎓 TESTING RICH THEORY GENERATION (Binomiale)...");

    const prompt = `
    PROMPT OTTIMIZZATO (LEZIONE MAGISTRALE):
    Definisci il concetto: "Distribuzione Binomiale".
    
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
    - Sii "Professorale" ma chiaro.
    - NO MARKDOWN. SOLO HTML.
    
    OUTPUT: HTML formattato.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'Sei un Tutor di Statistica. Rispondi SOLO in HTML. Mai Markdown.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.1-8b-instant',
            max_tokens: 1500
        });

        const content = completion.choices[0]?.message?.content;
        console.log("\n✅ Generated Content:");
        console.log(content);

        if (content.includes("<h3>🎓")) console.log("\n✅ Structure Verified: 🎓 Header found.");
        else console.error("\n❌ Structure Failed: Missing specific headers.");

    } catch (e) {
        console.error("❌ Generation Failed:", e.message);
    }
}

testRichTheory();
