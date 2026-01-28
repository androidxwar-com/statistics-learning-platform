/**
 * EventBus - Sistema di comunicazione centrale (Pub/Sub)
 * Permette ai moduli di comunicare senza dipendenze dirette.
 */
class EventBus {
    constructor() {
        this.listeners = {};
        // Debug mode: set to true to see all events in console
        this.debug = false;
    }

    /**
     * Iscriviti a un evento
     * @param {string} event - Nome dell'evento
     * @param {function} callback - Funzione da chiamare
     * @returns {function} - Funzione per rimuovere l'ascoltatore (unsubscribe)
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    /**
     * Rimuovi un'iscrizione
     * @param {string} event 
     * @param {function} callback 
     */
    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    /**
     * Emetti un evento
     * @param {string} event - Nome dell'evento
     * @param {any} data - Dati da passare agli ascoltatori
     */
    emit(event, data) {
        if (this.debug) {
            console.log(`[EventBus] emit: ${event}`, data);
        }

        if (!this.listeners[event]) return;

        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`[EventBus] Error in listener for "${event}":`, error);
            }
        });
    }

    /**
     * Pulisce tutti gli ascoltatori (utile per reset app)
     */
    clear() {
        this.listeners = {};
    }
}

// Singleton instance
const GlobalEventBus = new EventBus();

// Espone sia la classe che l'istanza globale
window.EventBus = GlobalEventBus;
