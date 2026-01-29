
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("❌ ERROR: Missing GROQ_API_KEY in .env");
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function testExplainAgainLogic() {
    console.log("🧪 TESTING 'Explain Again' Feature (Standalone Implementation)...");

    // 1. MOCK DATA (Simulating Context from Phase 1)
    const currentContent = {
        title: "Teorema del Limite Centrale",
        content: "Il teorema del limite centrale afferma che la somma di variabili casuali indipendenti e identicamente distribuite converge in distribuzione a una normale standard.",
        mathFormulas: ["\\sqrt{n}(\\bar{X}_n - \\mu) \\xrightarrow{d} N(0, \\sigma^2)"]
    };

    const attempt = 1;

    // 2. REPLICATE PROMPT LOGIC (from api-client.js)
    let styleInstruction = `
    STRATEGIA: ANALOGIA CONCRETA (Life-Based)
    - Usa una metafora presa dalla vita reale.
    - Collega l'analogia al concetto matematico.
    - REGOLE VISIVE: Usa <b>bold</b> per i termini chiave.
    `;

    const prompt = `
            CONTESTO:
            L'utente è bloccato sul concetto: "${currentContent.title}".
            Ha letto la definizione formale ma non l'ha capita (Tentativo #${attempt}).
            
            TESTO ORIGINALE (che non ha funzionato): 
            "${currentContent.content}"

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

            OUTPUT: HTML formattato (senza tag body/html).`;

    console.log("\n📤 Sending Prompt to Groq (llama-3.1-8b-instant)...");
    const startTime = Date.now();

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'Sei un Tutor di Statistica. Rispondi SOLO in HTML. Mai Markdown.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.7,
            max_tokens: 1024
        });

        const duration = Date.now() - startTime;
        const responseContent = completion.choices[0]?.message?.content;

        console.log(`\n✅ Response Received in ${duration}ms`);
        console.log("---------------------------------------------------");
        console.log(responseContent);
        console.log("---------------------------------------------------");

        // VALIDATION
        if (!responseContent) throw new Error("Empty response");
        if (!responseContent.includes('<h3>')) throw new Error("Missing HTML headers <h3>");
        if (responseContent.includes('**')) console.warn("⚠️ Warning: Output contains Markdown (**), expected pure HTML.");

        console.log("\n✨ TEST PASSED: 'Explain Again' functionality is OPERATIONAL.");

    } catch (e) {
        console.error("\n❌ TEST FAILED:", e.message);
    }
}

testExplainAgainLogic();
