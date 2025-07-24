import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { audioService } from '../services/audio';

interface AudioSettingsProps {
    visible: boolean;
    onClose: () => void;
}

const AudioSettings: React.FC<AudioSettingsProps> = ({ visible, onClose }) => {
    const [musicVolume, setMusicVolume] = useState(0.5);
    const [soundVolume, setSoundVolume] = useState(0.7);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Memoizar los valores para evitar re-renders innecesarios
    const musicVolumeDisplay = useMemo(() => Math.round(musicVolume * 100), [musicVolume]);
    const soundVolumeDisplay = useMemo(() => Math.round(soundVolume * 100), [soundVolume]);

    // Callbacks estables para evitar re-renders
    const handleMusicVolumeChange = useCallback(async (newVolume: number) => {
        setMusicVolume(newVolume);
        await audioService.setMusicVolume(newVolume);
    }, []);

    const handleSoundVolumeChange = useCallback(async (newVolume: number) => {
        setSoundVolume(newVolume);
        await audioService.setSoundVolume(newVolume);
    }, []);

    const handleMusicToggle = useCallback(async (enabled: boolean) => {
        setMusicEnabled(enabled);
        await audioService.setMusicEnabled(enabled);
    }, []);

    const handleSoundToggle = useCallback(async (enabled: boolean) => {
        setSoundEnabled(enabled);
        await audioService.setSoundEnabled(enabled);
    }, []);

    const handleVolumeButtonPress = useCallback((type: 'music' | 'sound', direction: 'up' | 'down') => {
        const currentVolume = type === 'music' ? musicVolume : soundVolume;
        const step = 0.1;
        let newVolume = currentVolume;

        if (direction === 'up') {
            newVolume = Math.min(1, currentVolume + step);
        } else {
            newVolume = Math.max(0, currentVolume - step);
        }

        if (type === 'music') {
            handleMusicVolumeChange(newVolume);
        } else {
            handleSoundVolumeChange(newVolume);
        }
    }, [musicVolume, soundVolume, handleMusicVolumeChange, handleSoundVolumeChange]);

    useEffect(() => {
        if (visible) {
            // Cargar configuración actual
            const settings = audioService.getSettings();
            setMusicVolume(settings.musicVolume);
            setSoundVolume(settings.soundVolume);
            setMusicEnabled(settings.musicEnabled);
            setSoundEnabled(settings.soundEnabled);
        }
    }, [visible]);

    const renderVolumeBar = useCallback((volume: number, type: 'music' | 'sound') => {
        const segments = 10;
        const filledSegments = Math.round(volume * segments);

        return (
            <View style={styles.volumeBarContainer}>
                {Array.from({ length: segments }, (_, index) => (
                    <View
                        key={index}
                        style={[
                            styles.volumeSegment,
                            index < filledSegments
                                ? (type === 'music' ? styles.musicSegmentFilled : styles.soundSegmentFilled)
                                : styles.volumeSegmentEmpty
                        ]}
                    />
                ))}
            </View>
        );
    }, []);

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Configuración de Audio</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    {/* Música */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="musical-notes" size={20} color="#3B82F6" />
                            <Text style={styles.sectionTitle}>Música de Fondo</Text>
                            <Switch
                                value={musicEnabled}
                                onValueChange={handleMusicToggle}
                                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                thumbColor={musicEnabled ? '#FFFFFF' : '#F3F4F6'}
                            />
                        </View>

                        {musicEnabled && (
                            <View style={styles.volumeControl}>
                                <TouchableOpacity
                                    onPress={() => handleVolumeButtonPress('music', 'down')}
                                    style={styles.volumeButton}
                                    disabled={musicVolume <= 0}
                                >
                                    <Ionicons
                                        name="remove"
                                        size={20}
                                        color={musicVolume <= 0 ? '#D1D5DB' : '#3B82F6'}
                                    />
                                </TouchableOpacity>

                                <View style={styles.volumeDisplay}>
                                    {renderVolumeBar(musicVolume, 'music')}
                                    <Text style={styles.volumeText}>{musicVolumeDisplay}%</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleVolumeButtonPress('music', 'up')}
                                    style={styles.volumeButton}
                                    disabled={musicVolume >= 1}
                                >
                                    <Ionicons
                                        name="add"
                                        size={20}
                                        color={musicVolume >= 1 ? '#D1D5DB' : '#3B82F6'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Efectos de Sonido */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Ionicons name="volume-high" size={20} color="#22C55E" />
                            <Text style={styles.sectionTitle}>Efectos de Sonido</Text>
                            <Switch
                                value={soundEnabled}
                                onValueChange={handleSoundToggle}
                                trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                                thumbColor={soundEnabled ? '#FFFFFF' : '#F3F4F6'}
                            />
                        </View>

                        {soundEnabled && (
                            <View style={styles.volumeControl}>
                                <TouchableOpacity
                                    onPress={() => handleVolumeButtonPress('sound', 'down')}
                                    style={styles.volumeButton}
                                    disabled={soundVolume <= 0}
                                >
                                    <Ionicons
                                        name="remove"
                                        size={20}
                                        color={soundVolume <= 0 ? '#D1D5DB' : '#22C55E'}
                                    />
                                </TouchableOpacity>

                                <View style={styles.volumeDisplay}>
                                    {renderVolumeBar(soundVolume, 'sound')}
                                    <Text style={styles.volumeText}>{soundVolumeDisplay}%</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleVolumeButtonPress('sound', 'up')}
                                    style={styles.volumeButton}
                                    disabled={soundVolume >= 1}
                                >
                                    <Ionicons
                                        name="add"
                                        size={20}
                                        color={soundVolume >= 1 ? '#D1D5DB' : '#22C55E'}
                                    />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        flex: 1,
        marginLeft: 8,
    },
    volumeControl: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    volumeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    volumeDisplay: {
        flex: 1,
        alignItems: 'center',
    },
    volumeBarContainer: {
        flexDirection: 'row',
        gap: 2,
        marginBottom: 4,
    },
    volumeSegment: {
        width: 20,
        height: 8,
        borderRadius: 4,
    },
    volumeSegmentEmpty: {
        backgroundColor: '#E5E7EB',
    },
    volumeSegmentFilled: {
        backgroundColor: '#3B82F6',
    },
    musicSegmentFilled: {
        backgroundColor: '#3B82F6',
    },
    soundSegmentFilled: {
        backgroundColor: '#22C55E',
    },
    volumeText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
    },
});

export default AudioSettings; 