import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// Configurazione
dotenv.config();

const RAW_DIR = './raw_content';
const DATA_DIR = './data';
const CONFIG_DIR = './config';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
    console.error('❌ ERRORE: Chiave API Groq mancante nel file .env');
    process.exit(1);
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

async function main() {
    console.log('🤖 Ingestion Robot aumentato (PDF Support) avviato...');

    // 1. Leggi file raw
    try {
        const files = await fs.readdir(RAW_DIR);
        const supportedFiles = files.filter(f => f.endsWith('.txt') || f.endsWith('.md') || f.endsWith('.pdf'));

        if (supportedFiles.length === 0) {
            console.log('📂 Nessun file trovato in raw_content/. Aggiungi file .txt, .md o .pdf.');
            return;
        }

        console.log(`📄 Trovati ${supportedFiles.length} file da elaborare.`);

        // Carica Database esistenti
        const topicsStructure = JSON.parse(await fs.readFile(`${CONFIG_DIR}/topics-structure.json`, 'utf-8'));
        const theoryContent = JSON.parse(await fs.readFile(`${DATA_DIR}/theory-content.json`, 'utf-8'));
        const questionsBank = JSON.parse(await fs.readFile(`${DATA_DIR}/questions-bank.json`, 'utf-8'));

        for (const file of supportedFiles) {
            console.log(`\n⚡ Elaborazione: ${file}...`);
            let rawText = '';

            // Estrazione Testo in base al formato
            if (file.endsWith('.pdf')) {
                try {
                    console.log(`   📖 Leggo PDF: ${file}`);
                    const dataBuffer = await fs.readFile(`${RAW_DIR}/${file}`);
                    const pdfData = await pdf(dataBuffer);
                    rawText = pdfData.text;
                    console.log(`   ✅ PDF estratto: ${pdfData.numpages} pagine. Lunghezza testo: ${rawText.length}`);
                } catch (pdfErr) {
                    console.error('❌ Errore lettura PDF:', pdfErr);
                    continue; // Salta file danneggiato
                }
            } else {
                rawText = await fs.readFile(`${RAW_DIR}/${file}`, 'utf-8');
            }

            // 2. Chiedi all'IA di strutturare il contenuto
            const aiData = await processWithAI(rawText);

            if (!aiData) {
                console.error(`⚠️  Fallimento elaborazione per ${file}`);
                continue;
            }

            console.log(`✅ Contenuto generato per: ${aiData.title}`);

            // 3. Aggiorna Struttura (Menu)
            // Trova o crea macro-topic (per semplicità mettiamo in "Generale" o "Ingestion")
            const conceptId = aiData.id;

            // Aggiungi a un topic "Nuovi Arrivi" se non esiste, o prova a indovinare
            // Per ora aggiungiamo al primo topic "variabili-casuali-discrete" come demo, 
            // ma in produzione l'IA dovrebbe suggerire il topicId.
            const targetTopicId = 'variabili-casuali-discrete';
            const topic = topicsStructure.topics.find(t => t.id === targetTopicId);

            // Evita duplicati
            if (!topic.concepts.find(c => c.id === conceptId)) {
                topic.concepts.push({
                    id: conceptId,
                    title: aiData.title,
                    phases: [1, 2, 3, 4, 5]
                });
                console.log(`📌 Aggiunto al menu: ${aiData.title}`);
            }

            // 4. Aggiorna Teoria
            theoryContent[conceptId] = aiData.theory;
            console.log(`📚 Teoria salvata.`);

            // 5. Aggiorna Quiz
            questionsBank[conceptId] = aiData.quiz;
            console.log(`❓ Quiz salvati.`);

            // 6. Sposta file processed (opzionale, per ora lasciamo lì)
        }

        // 7. Salva tutto
        await fs.writeFile(`${CONFIG_DIR}/topics-structure.json`, JSON.stringify(topicsStructure, null, 4));
        await fs.writeFile(`${DATA_DIR}/theory-content.json`, JSON.stringify(theoryContent, null, 4));
        await fs.writeFile(`${DATA_DIR}/questions-bank.json`, JSON.stringify(questionsBank, null, 4));

        console.log('\n✨ INGESTION COMPLETATA! Il sito è aggiornato.');

    } catch (error) {
        console.error('❌ Errore fatale:', error);
    }
}

async function processWithAI(text) {
    const prompt = `
    Sei un professore esperto di statistica e programmatore.
    Analizza il seguente testo grezzo e trasformalo in una struttura dati JSON rigorosa per la mia app educativa.
    
    TESTO INPUT:
    """
    ${text.substring(0, 15000)}
    """

    Genera un JSON valido con questa struttura esatta (senza markdown, solo JSON):
    {
        "id": "slug-univoco-argomento (es. teorema-bayes)",
        "title": "Titolo Formale Argomento",
        "theory": {
            "phase1": {
                "title": "Definizione Formale",
                "content": "<h1>Titolo</h1><p>Definizione rigorosa...</p>..."
            },
            "phase2": {
                "title": "Spiegazione Intuitiva",
                "content": "<p>Immagina che...</p>..."
            },
            "phase3": {
                "title": "Applicazione Pratica",
                "content": "<p>Esempio reale...</p>..."
            }
        },
        "quiz": {
            "home_mode": {
                "basic": [
                    { "id": "q1", "question": "Domanda...", "options": ["A", "B", "C"], "correctIndex": 0, "explanation": "..." }
                ],
                "advanced": [
                     { "id": "q2", "question": "Domanda...", "options": ["A", "B", "C"], "correctIndex": 0, "explanation": "..." }
                ]
            },
            "away_mode": {
                "basic": [],
                "advanced": []
            }
        }
    }
    
    REGOLE:
    1. L'ID deve essere lowercase con trattini.
    2. La teoria deve usare tag HTML <h2>, <p>, <ul>, <li>, <strong>, <span class="math-formula"> per le formule.
    3. Genera almeno 3 domande per livello (basic/advanced) e per modalità (home/away).
    4. Home Mode = Calcoli matematici. Away Mode = Logica/Concetti.
    `;

    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.1,
        });

        const content = completion.choices[0]?.message?.content || '';

        // Pulisci markdown code blocks se presenti
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (e) {
        console.error('Errore IA:', e.message);
        return null;
    }
}

main();
