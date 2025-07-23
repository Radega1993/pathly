import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioSettings {
    musicVolume: number;
    soundVolume: number;
    musicEnabled: boolean;
    soundEnabled: boolean;
}

class AudioService {
    private backgroundMusic: Audio.Sound | null = null;
    private forwardSound: Audio.Sound | null = null;
    private backSound: Audio.Sound | null = null;
    private winSound: Audio.Sound | null = null;

    private settings: AudioSettings = {
        musicVolume: 0.7,
        soundVolume: 0.8,
        musicEnabled: true,
        soundEnabled: true,
    };

    private currentMusic: 'menu' | 'maze' | null = null;

    constructor() {
        this.loadSettings();
    }

    private async loadSettings() {
        try {
            const savedSettings = await AsyncStorage.getItem('audioSettings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
        } catch (error) {
            console.error('Error loading audio settings:', error);
        }
    }

    private async saveSettings() {
        try {
            await AsyncStorage.setItem('audioSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving audio settings:', error);
        }
    }

    async initialize() {
        try {
            // Cargar efectos de sonido
            const { sound: forward } = await Audio.Sound.createAsync(
                require('../assets/song/forward.wav'),
                { shouldPlay: false }
            );
            this.forwardSound = forward;

            const { sound: back } = await Audio.Sound.createAsync(
                require('../assets/song/back.wav'),
                { shouldPlay: false }
            );
            this.backSound = back;

            const { sound: win } = await Audio.Sound.createAsync(
                require('../assets/song/win.mp3'),
                { shouldPlay: false }
            );
            this.winSound = win;

            // Configurar audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

        } catch (error) {
            console.error('Error initializing audio service:', error);
        }
    }

    async playBackgroundMusic(type: 'menu' | 'maze') {
        if (!this.settings.musicEnabled || this.currentMusic === type) {
            return;
        }

        try {
            // Detener música actual si existe
            if (this.backgroundMusic) {
                await this.backgroundMusic.stopAsync();
                await this.backgroundMusic.unloadAsync();
                this.backgroundMusic = null;
            }

            // Cargar nueva música
            const musicFile = type === 'menu'
                ? require('../assets/song/MusicaMenu.mp3')
                : require('../assets/song/MazeLevel.mp3');

            const { sound } = await Audio.Sound.createAsync(
                musicFile,
                {
                    shouldPlay: true,
                    isLooping: true,
                    volume: this.settings.musicVolume,
                }
            );

            this.backgroundMusic = sound;
            this.currentMusic = type;

        } catch (error) {
            console.error('Error playing background music:', error);
        }
    }

    async stopBackgroundMusic() {
        try {
            if (this.backgroundMusic) {
                await this.backgroundMusic.stopAsync();
                await this.backgroundMusic.unloadAsync();
                this.backgroundMusic = null;
                this.currentMusic = null;
            }
        } catch (error) {
            console.error('Error stopping background music:', error);
        }
    }

    async playForwardSound() {
        if (!this.settings.soundEnabled || !this.forwardSound) return;

        try {
            await this.forwardSound.setVolumeAsync(this.settings.soundVolume);
            await this.forwardSound.replayAsync();
        } catch (error) {
            console.error('Error playing forward sound:', error);
        }
    }

    async playBackSound() {
        if (!this.settings.soundEnabled || !this.backSound) return;

        try {
            await this.backSound.setVolumeAsync(this.settings.soundVolume);
            await this.backSound.replayAsync();
        } catch (error) {
            console.error('Error playing back sound:', error);
        }
    }

    async playWinSound() {
        if (!this.settings.soundEnabled || !this.winSound) return;

        try {
            await this.winSound.setVolumeAsync(this.settings.soundVolume);
            await this.winSound.replayAsync();
        } catch (error) {
            console.error('Error playing win sound:', error);
        }
    }

    // Getters para configuración
    getSettings(): AudioSettings {
        return { ...this.settings };
    }

    // Setters para configuración
    async setMusicVolume(volume: number) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        await this.saveSettings();

        if (this.backgroundMusic) {
            await this.backgroundMusic.setVolumeAsync(this.settings.musicVolume);
        }
    }

    async setSoundVolume(volume: number) {
        this.settings.soundVolume = Math.max(0, Math.min(1, volume));
        await this.saveSettings();
    }

    async setMusicEnabled(enabled: boolean) {
        this.settings.musicEnabled = enabled;
        await this.saveSettings();

        if (!enabled) {
            await this.stopBackgroundMusic();
        }
    }

    async setSoundEnabled(enabled: boolean) {
        this.settings.soundEnabled = enabled;
        await this.saveSettings();
    }

    async cleanup() {
        try {
            if (this.backgroundMusic) {
                await this.backgroundMusic.unloadAsync();
            }
            if (this.forwardSound) {
                await this.forwardSound.unloadAsync();
            }
            if (this.backSound) {
                await this.backSound.unloadAsync();
            }
            if (this.winSound) {
                await this.winSound.unloadAsync();
            }
        } catch (error) {
            console.error('Error cleaning up audio service:', error);
        }
    }
}

export const audioService = new AudioService(); 