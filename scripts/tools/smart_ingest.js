
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfLib = require('../../node_modules/pdf-parse/dist/pdf-parse/cjs/index.cjs');
// Attempt to find the function
let pdf = pdfLib.default || pdfLib;
if (typeof pdf !== 'function') {
    const funcKey = Object.keys(pdfLib).find(k => typeof pdfLib[k] === 'function');
    if (funcKey) pdf = pdfLib[funcKey];
}

dotenv.config();

const CONFIG = {
    inputFile: './Documentazione/text1.txt',
    theoryFile: './data/theory-content.json',
    structureFile: './config/topics-structure.json',
    chunkSize: 12000,
    overlap: 1000,
    apiKey: process.env.GROQ_API_KEY || 'YOUR_API_KEY'
};

const groq = new Groq({ apiKey: CONFIG.apiKey });

async function main() {
    console.log('📖 STARTING TXT INGESTION (EXHAUSTIVE MODE)...');
    console.log(`📂 Source: ${CONFIG.inputFile}`);

    let rawText = '';
    try {
        rawText = await fs.readFile(CONFIG.inputFile, 'utf8');
        console.log(`✅ File Loaded. Length: ${rawText.length} chars`);
    } catch (e) {
        console.error(`❌ Failed to read file: ${e.message}`);
        process.exit(1);
    }

    const chunks = createChunks(rawText, CONFIG.chunkSize, CONFIG.overlap);
    console.log(`🔪 Split into ${chunks.length} chunks.`);

    let theoryContent;
    try {
        console.log("DEBUG: Reading theory content...");
        theoryContent = JSON.parse(await fs.readFile(CONFIG.theoryFile, 'utf8'));
        console.log("DEBUG: Theory content loaded.");
    } catch {
        theoryContent = { concepts: {} };
    }

    let topicsStructure;
    try {
        console.log("DEBUG: Reading structure...");
        topicsStructure = JSON.parse(await fs.readFile(CONFIG.structureFile, 'utf8'));
        console.log("DEBUG: Structure loaded.");
    } catch {
        console.error("❌ Structure file not found!");
        process.exit(1);
    }

    // PROCESS ALL CHUNKS
    for (let i = 0; i < chunks.length; i++) {
        console.log(`\n🧠 Analyzing Chunk ${i + 1}/${chunks.length}...`);
        const extraction = await extractConcepts(chunks[i]);

        if (extraction && extraction.length > 0) {

            for (const concept of extraction) {
                // 1. Update Content
                theoryContent.concepts[concept.id] = concept;
                console.log(`   ✨ Concept: ${concept.title}`);

                // 2. Update Structure (Sidebar)
                updateStructure(topicsStructure, concept);
            }

            // Save Progress
            await fs.writeFile(CONFIG.theoryFile, JSON.stringify(theoryContent, null, 4));
            await fs.writeFile(CONFIG.structureFile, JSON.stringify(topicsStructure, null, 4));
            console.log(`💾 Saved.`);
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('\n🎉 INGESTION COMPLETE.');
}

function createChunks(text, size, overlap) {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + size, text.length);
        chunks.push(text.substring(start, end));
        start += size - overlap;
    }
    return chunks;
}

async function extractConcepts(textChunk) {
    const prompt = `
    You are an Expert Professor of Statistics. 
    Analyze the following text from a University Textbook and extract EVERY SINGLE theoretical concept, definition, theorem, or method found.
    
    GOAL: Create a comprehensive knowledge base. Do not summarize. Extract the full depth.

    For EACH concept found:
    1.  **id**: Unique slug (e.g., "teorema-bayes", "stimatore-ols").
    2.  **title**: Formal Title.
    3.  **category**: Macro-category (e.g., "Variabili Casuali", "Inferenza", "Modelli").
    4.  **subcategory**: Specific sub-field (e.g., "Stima Puntuale", "Test di Ipotesi").
    5.  **phase1_complex**: The formal definition, theorem statement, and ALL relevant LaTeX formulas.
    6.  **phase2_simplified**: An intuitive explanation for a beginner.
    7.  **phase3_practical**: A concrete real-world example or exercised scenario from the text.

    RULES:
    - Use LaTeX for match (e.g., $E[X] = \\mu$).
    - Output valid JSON.
    - Be EXHAUSTIVE. If the text mentions "Kurtosis", "Moments", "MSE", extract them all.
    
    TEXT CHUNK:
    """
    ${textChunk.substring(0, 30000)}
    """

    OUTPUT JSON OBJECT:
    {
        "concepts": [
            { "id": "...", "title": "...", "category": "...", "subcategory": "...", "phase1_complex": {...}, ... }
        ]
    }
    `;

    const maxRetries = 5;
    let attempt = 0;

    while (attempt < maxRetries) {
        try {
            console.log(`DEBUG: Calling Groq (70b JSON Mode)... Attempt ${attempt + 1}/${maxRetries}`);
            const completion = await groq.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.1-8b-instant',
                temperature: 0.0,
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(content);
            return parsed.concepts || [];

        } catch (e) {
            console.error(`❌ AI Error (Attempt ${attempt + 1}):`, e.message);

            if (e.message.includes('429') || e.message.includes('rate_limit')) {
                const waitTime = Math.pow(2, attempt) * 5000; // 5s, 10s, 20s, 40s...
                console.log(`⏳ Rate limit hit. Waiting ${waitTime / 1000}s before retry...`);
                await new Promise(r => setTimeout(r, waitTime));
                attempt++;
            } else {
                // Non-retriable error
                return null;
            }
        }
    }
    console.error("❌ Failed after max retries.");
    return null;
}

function updateStructure(structure, concept) {
    // 1. Find or Create Macro Topic
    let macro = structure.macro_topics.find(m => m.title.toLowerCase().includes(concept.category.toLowerCase()));

    if (!macro) {
        macro = {
            id: concept.category.toLowerCase().replace(/\s+/g, '-'),
            title: concept.category,
            order: structure.macro_topics.length + 1,
            subtopics: []
        };
        structure.macro_topics.push(macro);
    }

    // 2. Find or Create Subtopic
    let sub = macro.subtopics.find(s => s.title.toLowerCase().includes(concept.subcategory.toLowerCase()));
    if (!sub) {
        sub = {
            id: concept.subcategory.toLowerCase().replace(/\s+/g, '-'),
            title: concept.subcategory,
            order: macro.subtopics.length + 1,
            concepts: []
        };
        macro.subtopics.push(sub);
    }

    // 3. Add Concept if not exists
    if (!sub.concepts.find(c => c.id === concept.id)) {
        sub.concepts.push({
            id: concept.id,
            title: concept.title,
            estimatedMinutes: 15 // Default
        });
    }
}

main();
