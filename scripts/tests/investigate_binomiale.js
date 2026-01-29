
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STRUCTURE_PATH = path.join(__dirname, '../../config/topics-structure.json');
const CONTENT_PATH = path.join(__dirname, '../../data/theory-content.json');

function investigate() {
    console.log("🔍 INVESTIGATING 'Binomiale'...");

    // 1. Load Structure
    const structure = JSON.parse(fs.readFileSync(STRUCTURE_PATH, 'utf-8'));
    let foundConcept = null;

    console.log("📂 Searching in Topics Structure...");
    structure.macro_topics.forEach(macro => {
        macro.subtopics.forEach(sub => {
            sub.concepts.forEach(c => {
                if (c.title.toLowerCase().includes('binomiale')) {
                    console.log(`   - Found in Structure: [${c.id}] ${c.title}`);
                    foundConcept = c;
                }
            });
        });
    });

    if (!foundConcept) {
        console.error("❌ 'Binomiale' NOT FOUND in topics-structure.json");
        return;
    }

    // 2. Check Content
    console.log(`\n📂 Checking Content for ID: ${foundConcept.id}`);
    const contentData = JSON.parse(fs.readFileSync(CONTENT_PATH, 'utf-8'));
    const conceptData = contentData.concepts[foundConcept.id];

    if (conceptData) {
        console.log(`   - Found in Theory Content ✅ (ID: ${foundConcept.id})`);
        console.log("   - Title:", conceptData.title);
        console.log("   - Phase 1 Object:", JSON.stringify(conceptData.phase1_complex, null, 2));
    } else {
        console.error("❌ ID NOT FOUND in theory-content.json");
        console.log("   - Available IDs (sample):", Object.keys(contentData.concepts).slice(0, 5));
    }
}

investigate();
