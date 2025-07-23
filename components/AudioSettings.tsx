import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    Switch,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { audioService } from '../services/audio';

interface AudioSettingsProps {
    style?: any;
}

export default function AudioSettings({ style }: AudioSettingsProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [settings, setSettings] = useState({
        musicVolume: 0.7,
        soundVolume: 0.8,
        musicEnabled: true,
        soundEnabled: true,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = () => {
        const currentSettings = audioService.getSettings();
        setSettings(currentSettings);
    };

    const handleMusicToggle = async (value: boolean) => {
        await audioService.setMusicEnabled(value);
        setSettings(prev => ({ ...prev, musicEnabled: value }));
    };

    const handleSoundToggle = async (value: boolean) => {
        await audioService.setSoundEnabled(value);
        setSettings(prev => ({ ...prev, soundEnabled: value }));
    };

    const handleMusicVolumeChange = async (value: number) => {
        await audioService.setMusicVolume(value);
        setSettings(prev => ({ ...prev, musicVolume: value }));
    };

    const handleSoundVolumeChange = async (value: number) => {
        await audioService.setSoundVolume(value);
        setSettings(prev => ({ ...prev, soundVolume: value }));
    };

    return (
        <>
            {/* Botón de configuración */}
            <TouchableOpacity
                style={[styles.settingsButton, style]}
                onPress={() => setIsModalVisible(true)}
                activeOpacity={0.7}
            >
                <Ionicons name="settings-outline" size={24} color="#3B82F6" />
            </TouchableOpacity>

            {/* Modal de configuración */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {/* Header */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Configuración de Audio</Text>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Contenido */}
                        <View style={styles.settingsContainer}>
                            {/* Música */}
                            <View style={styles.settingSection}>
                                <View style={styles.settingHeader}>
                                    <Ionicons name="musical-notes" size={20} color="#3B82F6" />
                                    <Text style={styles.settingTitle}>Música de Fondo</Text>
                                    <Switch
                                        value={settings.musicEnabled}
                                        onValueChange={handleMusicToggle}
                                        trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                        thumbColor={settings.musicEnabled ? '#FFFFFF' : '#F3F4F6'}
                                    />
                                </View>

                                {settings.musicEnabled && (
                                    <View style={styles.volumeContainer}>
                                        <Ionicons name="volume-low" size={16} color="#6B7280" />
                                        <Slider
                                            style={styles.slider}
                                            value={settings.musicVolume}
                                            onValueChange={handleMusicVolumeChange}
                                            minimumValue={0}
                                            maximumValue={1}
                                            step={0.1}
                                            minimumTrackTintColor="#3B82F6"
                                            maximumTrackTintColor="#E5E7EB"
                                            thumbTintColor="#3B82F6"
                                        />
                                        <Ionicons name="volume-high" size={16} color="#6B7280" />
                                    </View>
                                )}
                            </View>

                            {/* Efectos de Sonido */}
                            <View style={styles.settingSection}>
                                <View style={styles.settingHeader}>
                                    <Ionicons name="volume-high" size={20} color="#22C55E" />
                                    <Text style={styles.settingTitle}>Efectos de Sonido</Text>
                                    <Switch
                                        value={settings.soundEnabled}
                                        onValueChange={handleSoundToggle}
                                        trackColor={{ false: '#E5E7EB', true: '#22C55E' }}
                                        thumbColor={settings.soundEnabled ? '#FFFFFF' : '#F3F4F6'}
                                    />
                                </View>

                                {settings.soundEnabled && (
                                    <View style={styles.volumeContainer}>
                                        <Ionicons name="volume-low" size={16} color="#6B7280" />
                                        <Slider
                                            style={styles.slider}
                                            value={settings.soundVolume}
                                            onValueChange={handleSoundVolumeChange}
                                            minimumValue={0}
                                            maximumValue={1}
                                            step={0.1}
                                            minimumTrackTintColor="#22C55E"
                                            maximumTrackTintColor="#E5E7EB"
                                            thumbTintColor="#22C55E"
                                        />
                                        <Ionicons name="volume-high" size={16} color="#6B7280" />
                                    </View>
                                )}
                            </View>

                            {/* Información */}
                            <View style={styles.infoSection}>
                                <Text style={styles.infoText}>
                                    • La música cambia automáticamente según la pantalla
                                </Text>
                                <Text style={styles.infoText}>
                                    • Los efectos se reproducen durante el juego
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    settingsButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 1000,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 350,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    closeButton: {
        padding: 4,
    },
    settingsContainer: {
        gap: 24,
    },
    settingSection: {
        gap: 12,
    },
    settingHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
    },
    volumeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingLeft: 32,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    infoSection: {
        backgroundColor: '#F8FAFC',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 4,
    },
}); 