/**
 * ErrorHandler - Gestore Errori Centrale
 * 
 * Intercetta:
 * 1. Errori JS Globali (window.onerror)
 * 2. Promise non gestite (unhandledrejection)
 * 3. Errori applicativi via EventBus
 */
const ErrorHandler = (function () {

    function init() {
        // 1. Global JS Errors
        window.onerror = function (msg, url, line, col, error) {
            handleError({
                type: 'CRITICAL',
                message: msg,
                details: `File: ${url} (Line ${line}:${col})`,
                originalError: error
            });
            return true; // Prevents default browser console spam partial
        };

        // 2. Unhandled Promises
        window.addEventListener('unhandledrejection', function (event) {
            handleError({
                type: 'PROMISE',
                message: event.reason ? event.reason.message : 'Unknown Promise Error',
                originalError: event.reason
            });
        });

        // 3. App Events
        if (window.EventBus) {
            window.EventBus.on('DATA_ERROR', (data) => {
                handleError({
                    type: 'DATA',
                    message: data.message,
                    originalError: null
                });
            });
        }
    }

    function handleError(errorObj) {
        console.error('🔥 [ErrorHandler] Caught:', errorObj);

        // Prepara messaggio user-friendly
        let userTitle = 'Si è verificato un errore';
        let userMsg = errorObj.message;
        let isCritical = true;

        if (errorObj.type === 'DATA') {
            userTitle = 'Errore Dati';
            isCritical = true; // Dati corrotti = Stop App
        }

        showErrorModal(userTitle, userMsg, isCritical);
    }

    function showErrorModal(title, message, isCritical) {
        // Rimuovi modali esistenti
        const old = document.getElementById('error-modal');
        if (old) old.remove();

        // Crea nuova modale
        const modal = document.createElement('div');
        modal.id = 'error-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
            font-family: 'Poppins', sans-serif;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="font-size: 3rem; margin-bottom: 10px;">🤕</div>
                <h2 style="color: #e74c3c; margin: 0 0 10px 0;">${title}</h2>
                <p style="color: #34495e; font-size: 1.1rem; border: 1px solid #eee; padding: 10px; border-radius: 6px; background: #f9f9f9;">
                    ${message}
                </p>
                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="
                        background: #3498db; color: white; border: none; padding: 10px 20px;
                        font-size: 1rem; border-radius: 6px; cursor: pointer;
                    ">Ricarica Pagina 🔄</button>
                    ${!isCritical ? `<button onclick="document.getElementById('error-modal').remove()" style="margin-left:10px; padding: 10px 20px; cursor:pointer;">Ignora</button>` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    return { init };
})();

// Auto-init immediately to catch load errors
ErrorHandler.init();
