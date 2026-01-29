
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: GROQ_API_KEY });

// Test Candidates
const SAMPLES = [
    { title: "Media", type: "Standard" },
    { title: "Teorema del Limite Centrale", type: "Complex" },
    { title: "Distr. Binomiale Negativa", type: "Edge Case" } // Was broken
];

const REQUIRED_HEADERS = [
    "🎓 Concetto Multidimensionale",
    "📐 Analisi Matematica",
    "📊 Dati & Applicazione"
];

async function generateAndVerify(concept) {
    console.log(`\n🧪 TESTING: [${concept.type}] "${concept.title}"...`);
    const start = Date.now();

    const prompt = `
        PROMPT OTTIMIZZATO (LEZIONE MAGISTRALE):
        Definisci il concetto: "${concept.title}".
        
        OBIETTIVO:
        Crea una lezione universitaria avanzata che copra:
        1. TEORIA: Definizione rigorosa (assiomatica).
        2. MATEMATICA: Formule, dimostrazioni o proprietà chiave.
        3. DATI: Un esempio numerico concreto o dataset di riferimento.
        4. CODICE/FUNZIONI: Pseudocodice o riferimento a funzioni R/Python.

        STRUTTURA HTML OBBLIGATORIA (NO MARKDOWN):
        <h3>🎓 Concetto Multidimensionale</h3>
        <p>...spiegazione...</p>
        <h3>📐 Analisi Matematica</h3>
        <p>...formule...</p>
        <h3>📊 Dati & Applicazione</h3>
        <p>...esempio...</p>
        <div class="code-block">...codice...</div>

        REGOLE: SOLO HTML. NO MARKDOWN.
        OUTPUT: HTML formattato.`;

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'Sei un Tutor di Statistica. Rispondi SOLO in HTML.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama-3.1-8b-instant',
            max_tokens: 1500
        });

        const duration = Date.now() - start;
        const content = completion.choices[0]?.message?.content || "";

        // Verification
        let passed = true;
        REQUIRED_HEADERS.forEach(h => {
            if (!content.includes(h.split(' ')[1])) { // Check for "Concetto", "Analisi", "Dati"
                console.error(`   ❌ Missing Header part: "${h}"`);
                passed = false;
            }
        });

        const loops = (content.match(/<h3>/g) || []).length;
        const codeBlocks = (content.match(/<div class="code-block">/g) || []).length;

        console.log(`   ⏱️  Latency: ${duration}ms`);
        console.log(`   📝 Length:  ${content.length} chars`);
        console.log(`   🏗️  Headers: ${loops}/3+`);
        console.log(`   💻 Code:    ${codeBlocks > 0 ? 'YES' : 'NO'}`);

        if (passed) console.log("   ✅ QA PASSED: Rich Structure Verified.");
        else console.log("   ⚠️ QA WARNING: Structure incomplete.");

        return duration;

    } catch (e) {
        console.error("   ❌ API Error:", e.message);
        return 9999;
    }
}

async function runConsistencyTest() {
    console.log("🚀 STARTING CONSISTENCY & EFFICIENCY TEST...");
    let totalLatency = 0;

    for (const sample of SAMPLES) {
        totalLatency += await generateAndVerify(sample);
    }

    console.log(`\n📊 AVERAGE LATENCY: ${(totalLatency / SAMPLES.length).toFixed(0)}ms`);
}

runConsistencyTest();
