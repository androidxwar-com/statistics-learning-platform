
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.join(__dirname, '../../');
const BACKUP_DIR = path.join(ROOT_DIR, 'backups/v1_functional');

const TARGETS = [
    { name: 'config', type: 'dir' },
    { name: 'data', type: 'dir' },
    { name: 'scripts', type: 'dir' },
    { name: 'styles', type: 'dir' },
    { name: 'index.html', type: 'file' },
    { name: 'package.json', type: 'file' }
];

function copyRecursive(src, dest) {
    if (!fs.existsSync(src)) return;
    const stats = fs.statSync(src);
    if (stats.isDirectory()) {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(child => {
            copyRecursive(path.join(src, child), path.join(dest, child));
        });
    } else {
        fs.copyFileSync(src, dest);
    }
}

function backup() {
    console.log(`📦 STARTING BACKUP to: ${BACKUP_DIR}`);

    if (fs.existsSync(BACKUP_DIR)) {
        console.log("⚠️ Backup folder exists. Cleaning up...");
        fs.rmSync(BACKUP_DIR, { recursive: true, force: true });
    }
    fs.mkdirSync(BACKUP_DIR, { recursive: true });

    TARGETS.forEach(target => {
        const src = path.join(ROOT_DIR, target.name);
        const dest = path.join(BACKUP_DIR, target.name);

        console.log(`   - Copying ${target.name}...`);
        copyRecursive(src, dest);
    });

    console.log("\n✅ BACKUP COMPLETED SUCCESSFULLY.");
    console.log(`📂 Location: ${BACKUP_DIR}`);
}

backup();
