import fs from 'fs/promises';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const CONFIG_PATH = './config/topics-structure.json';
const DATA_PATH = './data/questions-bank.json';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error("❌ API Key mancante in .env");
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function main() {
    console.log("🕵️  Analisi buchi nel database...");

    // Load files
    const topicsStructure = JSON.parse(await fs.readFile(CONFIG_PATH, 'utf-8'));
    const questionsBank = JSON.parse(await fs.readFile(DATA_PATH, 'utf-8'));

    // Extract all concept IDs
    const allIds = [];
    topicsStructure.macro_topics.forEach(mt => {
        mt.subtopics.forEach(st => {
            st.concepts.forEach(c => allIds.push(c.id));
        });
    });

    // Find missing
    const missingIds = allIds.filter(id => !questionsBank.questions[id]);

    if (missingIds.length === 0) {
        console.log("✅ Nessun buco trovato! Tutto coperto.");
        return;
    }

    console.log(`⚠️  Trovati ${missingIds.length} concetti senza domande:`, missingIds);

    // Generate for each missing ID
    for (const id of missingIds) {
        console.log(`\n🤖 Generazione domande per: ${id}...`);

        // Find title for better prompting
        let title = id;
        topicsStructure.macro_topics.forEach(mt => mt.subtopics.forEach(st => st.concepts.forEach(c => {
            if (c.id === id) title = c.title;
        })));

        const newQuestions = await generateQuestionsForToipc(id, title);

        if (newQuestions) {
            questionsBank.questions[id] = newQuestions;
            // Save immediately just in case
            await fs.writeFile(DATA_PATH, JSON.stringify(questionsBank, null, 4));
            console.log(`✅ Salvato ${id}.`);
        } else {
            console.error(`❌ Fallita generazione per ${id}`);
        }
    }

    console.log("\n✨ COMPLETATO! Database riempito al 100%.");
}

async function generateQuestionsForToipc(id, title) {
    const prompt = `
    Sei un professore universitario di statistica.
    Devi creare un dataset di domande JSON per l'argomento: "${title}" (ID: ${id}).
    
    Devi generare:
    - 3 domande "Home Mode" (Calcoli/Pratcia) -> Basic
    - 3 domande "Home Mode" -> Advanced
    - 3 domande "Away Mode" (Concettuali/Logica) -> Basic
    - 3 domande "Away Mode" -> Advanced
    
    Totale 12 domande.
    
    FORMATO JSON UNICO RICHIESTO:
    {
        "conceptId": "${id}",
        "home_mode": {
            "basic": [ { "id": "${id}-h-b1", "question": "...", "options": ["A","B","C"], "correctIndex": 0, "explanation": "..." }, ... ],
            "advanced": [ ... ]
        },
        "away_mode": {
            "basic": [ ... ],
            "advanced": [ ... ]
        }
    }

    REGOLE:
    1. Risposta corretta NON deve essere sempre la prima (randomizza correctIndex).
    2. Italiano perfetto e accademico.
    3. Rispondi SOLO col JSON.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.3
        });

        const content = completion.choices[0]?.message?.content || '';
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Error calling Groq:", e.message);
        return null;
    }
}

main();
