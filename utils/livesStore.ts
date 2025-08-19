import {
    getCurrentLivesState,
    getTimeUntilNextLife,
    consumeLife,
    formatTimeRemaining,
    LIVES_CONFIG,
    LivesState,
} from '../services/livesService';

// Store global para las vidas
class LivesStore {
    private static instance: LivesStore;
    private state: LivesState = {
        currentLives: LIVES_CONFIG.MAX_LIVES,
        lastRegenerationTime: Date.now(),
    };
    private timeRemaining: number = 0;
    private listeners: Set<() => void> = new Set();
    private updateInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.initialize();
    }

    public static getInstance(): LivesStore {
        if (!LivesStore.instance) {
            LivesStore.instance = new LivesStore();
        }
        return LivesStore.instance;
    }

    private async initialize() {
        await this.loadState();
        this.startUpdateInterval();
    }

    private async loadState() {
        try {
            const [state, timeRemaining] = await Promise.all([
                getCurrentLivesState(),
                getTimeUntilNextLife(),
            ]);
            this.state = state;
            this.timeRemaining = timeRemaining;
            +            this.notifyListeners();
        } catch (error) {
            console.error('❌ LivesStore: Error cargando estado de vidas:', error);
        }
    }

    private startUpdateInterval() {
        // Actualizar cada segundo
        this.updateInterval = setInterval(async () => {
            try {
                const timeRemaining = await getTimeUntilNextLife();
                this.timeRemaining = timeRemaining;

                // Si el tiempo es 0, recargar estado completo
                if (timeRemaining === 0) {
                    await this.loadState();
                } else {
                    this.notifyListeners();
                }
            } catch (error) {
                console.error('Error actualizando tiempo restante:', error);
            }
        }, 1000);
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    public subscribe(listener: () => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    public getState(): LivesState {
        return { ...this.state };
    }

    public getTimeRemaining(): number {
        return this.timeRemaining;
    }

    public async consumeLife(): Promise<boolean> {
        try {
            const success = await consumeLife();
            if (success) {
                await this.loadState();
            } else {
                console.log('❌ LivesStore: No se pudo consumir vida');
            }
            return success;
        } catch (error) {
            console.error('❌ LivesStore: Error consumiendo vida:', error);
            return false;
        }
    }

    public async updateDisplay(): Promise<void> {
        await this.loadState();
    }

    public formatTimeRemaining(time: number): string {
        return formatTimeRemaining(time);
    }

    public get canPlay(): boolean {
        return this.state.currentLives > 0;
    }

    public destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.listeners.clear();
    }
}

export const livesStore = LivesStore.getInstance(); 