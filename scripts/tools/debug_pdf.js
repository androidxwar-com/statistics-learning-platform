
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
    const lib = require('pdf-parse');
    console.log('Type:', typeof lib);
    if (typeof lib === 'object') console.log('Keys:', Object.keys(lib));
    console.log('Is Function:', typeof lib === 'function');
} catch (e) {
    console.error("Import failed:", e);
}
