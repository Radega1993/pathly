import React, { useState, useEffect, useCallback } from 'react';
import { livesStore } from './livesStore';
import { LivesState } from '../services/livesService';

export const useLives = () => {
    const [livesState, setLivesState] = useState<LivesState>(livesStore.getState());
    const [timeRemaining, setTimeRemaining] = useState(livesStore.getTimeRemaining());
    const [loading, setLoading] = useState(false);

    // Suscribirse a cambios del store
    useEffect(() => {
        const unsubscribe = livesStore.subscribe(() => {
            setLivesState(livesStore.getState());
            setTimeRemaining(livesStore.getTimeRemaining());
        });

        return unsubscribe;
    }, []);

    const consumeLifeAndUpdate = useCallback(async (): Promise<boolean> => {
        try {
            setLoading(true);
            const success = await livesStore.consumeLife();
            return success;
        } catch (error) {
            console.error('❌ Error consumiendo vida:', error);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateLivesDisplay = useCallback(async () => {
        try {
            await livesStore.updateDisplay();
        } catch (error) {
            console.error('❌ Error actualizando display de vidas:', error);
        }
    }, []);

    return {
        livesState,
        timeRemaining,
        loading,
        loadLivesState: updateLivesDisplay,
        consumeLifeAndUpdate,
        updateLivesDisplay,
        formatTimeRemaining: (time: number) => livesStore.formatTimeRemaining(time),
        canPlay: livesStore.canPlay,
    };
}; 