import { useState, useEffect, useCallback } from 'react';
import {
    getCurrentLivesState,
    getTimeUntilNextLife,
    consumeLife,
    formatTimeRemaining,
    LIVES_CONFIG,
    LivesState,
} from '../services/livesService';

export const useLives = () => {
    const [livesState, setLivesState] = useState<LivesState>({
        currentLives: LIVES_CONFIG.MAX_LIVES,
        lastRegenerationTime: Date.now(),
    });
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadLivesState = useCallback(async () => {
        try {
            const [state, timeRemaining] = await Promise.all([
                getCurrentLivesState(),
                getTimeUntilNextLife(),
            ]);
            setLivesState(state);
            setTimeRemaining(timeRemaining);
        } catch (error) {
            console.error('Error cargando estado de vidas:', error);
        }
    }, []);

    const consumeLifeAndUpdate = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);

            // Verificar si ya no tiene vidas antes de intentar consumir
            if (livesState.currentLives <= 0) {
                return false;
            }

            const success = await consumeLife();
            if (success) {
                await loadLivesState(); // Recargar estado después de consumir
            }
            return success;
        } catch (error) {
            console.error('Error consumiendo vida:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, [loadLivesState, livesState.currentLives]);

    const updateLivesDisplay = useCallback(async () => {
        try {
            await loadLivesState();
        } catch (error) {
            console.error('Error actualizando display de vidas:', error);
        }
    }, [loadLivesState]);

    // Cargar estado inicial
    useEffect(() => {
        loadLivesState();
    }, [loadLivesState]);

    // Actualizar tiempo restante cada segundo
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const timeRemaining = await getTimeUntilNextLife();
                setTimeRemaining(timeRemaining);

                // Si hay tiempo restante 0, recargar estado de vidas
                if (timeRemaining === 0) {
                    loadLivesState();
                }
            } catch (error) {
                console.error('Error actualizando tiempo restante:', error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [loadLivesState]);

    // Recargar estado cada 30 segundos para mantener sincronizado
    useEffect(() => {
        const interval = setInterval(() => {
            loadLivesState();
        }, 30000);

        return () => clearInterval(interval);
    }, [loadLivesState]);

    return {
        livesState,
        timeRemaining,
        loading,
        loadLivesState,
        consumeLifeAndUpdate,
        updateLivesDisplay,
        formatTimeRemaining: (time: number) => formatTimeRemaining(time),
        canPlay: livesState.currentLives > 0,
    };
}; 