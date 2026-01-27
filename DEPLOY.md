# 🚀 Deploy su GitHub Pages

Questa guida ti aiuta a pubblicare la piattaforma di apprendimento su GitHub Pages.

## ⚠️ IMPORTANTE: Sicurezza API Key

**ATTENZIONE**: La tua API key Groq è attualmente nel file `config/api-config.js`. 

### Opzioni:

#### Opzione 1: Repository Privato (Raccomandato)
1. Crea un repository **privato** su GitHub
2. La tua API key rimane sicura
3. GitHub Pages funziona anche con repo privati (con GitHub Pro o Education)

#### Opzione 2: Rimuovi API Key (Demo Mode)
1. Prima del deploy, modifica `config/api-config.js`:
   ```javascript
   apiKey: '', // Vuoto per sicurezza
   demoMode: true // Attiva demo mode
   ```
2. Le funzionalità AI non funzioneranno pubblicamente
3. Gli utenti dovranno inserire la propria API key

#### Opzione 3: Environment Variables (Avanzato)
1. Usa GitHub Actions per iniettare la key durante il build
2. Richiede setup CI/CD personalizzato

---

## 📋 Steps per Deploy

### 1. Prepara il Repository

```bash
# Nella cartella "Ema project"
git init
git add .
git commit -m "Initial commit: Statistics Learning Platform"
```

### 2. Crea Repository su GitHub

1. Vai su [github.com](https://github.com)
2. Click "New Repository"
3. Nome: `statistics-learning-platform` (o quello che preferisci)
4. **Importante**: Scegli **Private** se vuoi mantenere l'API key
5. NON inizializzare con README (già presente)
6. Click "Create repository"

### 3. Collega e Push

```bash
# Sostituisci TUOUSERNAME e NOME-REPO
git remote add origin https://github.com/TUOUSERNAME/NOME-REPO.git
git branch -M main
git push -u origin main
```

### 4. Attiva GitHub Pages

1. Vai nelle **Settings** del repository
2. Sezione **Pages** (sidebar sinistra)
3. Source: seleziona **main** branch
4. Folder: **/ (root)**
5. Click **Save**

### 5. Aspetta il Deploy

- GitHub impiega 1-3 minuti per costruire il sito
- Riceverai una notifica quando è pronto
- URL sarà: `https://TUOUSERNAME.github.io/NOME-REPO/`

---

## 🔧 Configurazione per GitHub Pages

### File `.nojekyll` (Opzionale ma Raccomandato)

Crea un file vuoto `.nojekyll` nella root per evitare che GitHub usi Jekyll:

```bash
# Nella cartella "Ema project"
touch .nojekyll
git add .nojekyll
git commit -m "Add .nojekyll for GitHub Pages"
git push
```

### Percorsi Assoluti (Se necessario)

Se il sito è in una sottocartella (es. `/statistics-learning-platform/`):

1. Modifica `data-loader.js`:
   ```javascript
   // Se NOME-REPO è "stats-platform"
   loadJSON('/stats-platform/config/topics-structure.json')
   ```

2. Oppure usa percorsi relativi (già fatto):
   ```javascript
   loadJSON('config/topics-structure.json') // Funziona sempre ✓
   ```

---

## ✅ Verifica Deployment

### Test Checklist

1. **Apri il sito**: `https://TUOUSERNAME.github.io/NOME-REPO/`
2. **Console Browser** (F12): Verifica nessun errore 404
3. **Test Fasi**:
   - Fase 1: Teoria complessa si carica?
   - Fase 2: Auto-advance funziona?
   - Quiz: Carte interattive rispondono?
4. **Test API** (se key presente):
   - Click "❌ Non mi è chiaro"
   - Console: `✅ Risposta Groq ricevuta`

### Errori Comuni

| Errore | Causa | Soluzione |
|--------|-------|-----------|
| 404 su file JSON | Percorsi sbagliati | Usa percorsi relativi senza `/` iniziale |
| API key esposta | Repository pubblico | Rendi privato o rimuovi key |
| Stili mancanti | Cache browser | Ctrl+Shift+R (hard refresh) |
| CORS errors | File locali | Sempre testa via `https://` (no `file://`) |

---

## 🔄 Update del Sito

Dopo modifiche:

```bash
git add .
git commit -m "Descrizione modifiche"
git push
```

GitHub Pages si aggiorna automaticamente in 1-2 minuti.

---

## 🌐 Custom Domain (Opzionale)

Se hai un dominio personale:

1. Settings → Pages → Custom domain
2. Inserisci: `learning.tuodominio.com`
3. Configura DNS:
   ```
   Type: CNAME
   Name: learning
   Value: TUOUSERNAME.github.io
   ```
4. **Attendi 24-48h** per propagazione DNS

---

## 📊 Analytics (Opzionale)

Per tracciare visite, aggiungi Google Analytics:

1. Ottieni tracking ID da [analytics.google.com](https://analytics.google.com)
2. Aggiungi in `index.html` (prima del `</head>`):
   ```html
   <!-- Google Analytics -->
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

---

## 🆘 Troubleshooting

### Sito non si carica

1. Verifica branch è **main** (non master)
2. Controlla URL: deve avere il nome del repo
3. Aspetta 5 minuti dal push

### File non trovati (404)

1. Usa DevTools → Network per vedere quali file falliscono
2. Verifica case-sensitivity dei nomi file
3. Controlla percorsi in `data-loader.js`

### API non funziona

1. Controlla console per errori CORS
2. Verifica `demoMode: false` in `api-config.js`
3. Testa API key con cURL:
   ```bash
   curl https://api.groq.com/openai/v1/chat/completions \
     -H "Authorization: Bearer TUA_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"test"}]}'
   ```

---

## 🎉 Successo!

Il tuo sito è live! Condividi il link:

```
🌐 https://TUOUSERNAME.github.io/NOME-REPO/
```

### Prossimi Passi

- [ ] Aggiungi più concetti teorici
- [ ] Personalizza colori/tema
- [ ] Aggiungi analytics
- [ ] Condividi con amici/colleghi
- [ ] Raccogli feedback

---

**Hai domande?** Apri un Issue su GitHub o contattami!
