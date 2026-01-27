# 🚀 Quick Deploy su GitHub Pages

## Step 1: Inizializza Git e Push

```bash
cd "c:/Users/Fedd/Desktop/Ema project"

# Inizializza repository
git init

# Aggiungi tutti i file
git add .

# Primo commit
git commit -m "Initial commit: Statistics Learning Platform"

# Crea repository su GitHub (via browser):
# 1. Vai su https://github.com/new
# 2. Nome: statistics-learning-platform
# 3. Visibilità: Public o Private
# 4. NON inizializzare con README
# 5. Crea repository

# Collega e push (sostituisci TUOUSERNAME)
git remote add origin https://github.com/TUOUSERNAME/statistics-learning-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Attiva GitHub Pages

1. Vai su: `https://github.com/TUOUSERNAME/statistics-learning-platform/settings/pages`
2. Source: **main** branch
3. Folder: **/ (root)**
4. Click **Save**

## Step 3: Visita il Sito

Dopo 1-2 minuti:
```
https://TUOUSERNAME.github.io/statistics-learning-platform/
```

## 🔧 Per Uso Locale con API Groq

Crea file `config/api-config-local.js`:

```javascript
// Copia e incolla in api-config.js (SOLO IN LOCALE)
GROQ_CONFIG.apiKey = 'TUA_API_KEY_QUI';
GROQ_CONFIG.demoMode = false;
```

**NON committare questo file!**

## ✅ Verifica

- [ ] Sito carica correttamente
- [ ] Fase 1 mostra teoria
- [ ] Quiz funzionano
- [ ] Nessun errore console (F12)

---

Per dettagli completi, vedi `DEPLOY.md`
