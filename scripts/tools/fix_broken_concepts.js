
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(__dirname, '../../data/theory-content.json');

function fixBrokenConcepts() {
    console.log("🛠️ STARTING AUTO-FIX FOR BROKEN CONCEPTS...");

    try {
        const raw = fs.readFileSync(CONTENT_PATH, 'utf-8');
        const data = JSON.parse(raw);
        let fixedCount = 0;

        Object.keys(data.concepts).forEach(key => {
            const c = data.concepts[key];
            const p1 = c.phase1_complex || {};

            const hasContent = p1.content && p1.content.trim().length > 0;
            const hasDefinition = p1.definition && p1.definition.trim().length > 0;

            if (!hasContent && !hasDefinition) {
                console.log(`   - Fixing: [${c.id}] ${c.title}`);

                // Inject Placeholder
                data.concepts[key].phase1_complex = {
                    ...p1, // Keep existing keys
                    content: `Definizione formale di **${c.title}** in fase di elaborazione.\n\nContenuto generato automaticamente per garantire la stabilità del sistema.`
                };
                fixedCount++;
            }
        });

        if (fixedCount > 0) {
            fs.writeFileSync(CONTENT_PATH, JSON.stringify(data, null, 4), 'utf-8');
            console.log(`\n✅ FIXED ${fixedCount} CONCEPTS. Saved to theory-content.json`);
        } else {
            console.log("\n✨ No broken concepts found to fix.");
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e.message);
    }
}

fixBrokenConcepts();
