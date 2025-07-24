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
    private isInitialized: boolean = false;

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
        if (this.isInitialized) {
            console.log('✅ Audio service already initialized');
            return;
        }

        try {
            console.log('🔄 Initializing audio service...');

            // Configurar audio mode primero
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: false, // Cambiar a false para que no continúe en background
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            console.log('✅ Audio mode configured');

            // Cargar efectos de sonido con manejo de errores
            try {
                const { sound: forward } = await Audio.Sound.createAsync(
                    require('../assets/song/forward.wav'),
                    { shouldPlay: false, volume: this.settings.soundVolume }
                );
                this.forwardSound = forward;
                console.log('✅ Forward sound loaded');
            } catch (error) {
                console.error('❌ Error loading forward sound:', error);
            }

            try {
                const { sound: back } = await Audio.Sound.createAsync(
                    require('../assets/song/back.wav'),
                    { shouldPlay: false, volume: this.settings.soundVolume }
                );
                this.backSound = back;
                console.log('✅ Back sound loaded');
            } catch (error) {
                console.error('❌ Error loading back sound:', error);
            }

            try {
                const { sound: win } = await Audio.Sound.createAsync(
                    require('../assets/song/win.mp3'),
                    { shouldPlay: false, volume: this.settings.soundVolume }
                );
                this.winSound = win;
                console.log('✅ Win sound loaded');
            } catch (error) {
                console.error('❌ Error loading win sound:', error);
            }

            this.isInitialized = true;
            console.log('✅ Audio service initialized successfully');

        } catch (error) {
            console.error('❌ Error initializing audio service:', error);
            this.isInitialized = false;
        }
    }

    async playBackgroundMusic(type: 'menu' | 'maze') {
        if (!this.settings.musicEnabled) {
            console.log('🔇 Music disabled, skipping playback');
            return;
        }

        if (this.currentMusic === type) {
            console.log(`🎵 Music ${type} already playing`);
            return;
        }

        try {
            // Asegurar que el servicio esté inicializado
            if (!this.isInitialized) {
                console.log('🔄 Audio service not initialized, initializing now...');
                await this.initialize();

                // Si aún no se inicializó después del intento, salir
                if (!this.isInitialized) {
                    console.error('❌ Audio service failed to initialize, cannot play music');
                    return;
                }
            }

            // Detener música actual si existe
            if (this.backgroundMusic) {
                try {
                    await this.backgroundMusic.stopAsync();
                    await this.backgroundMusic.unloadAsync();
                    console.log('✅ Previous music stopped and unloaded');
                } catch (error) {
                    console.error('❌ Error stopping previous music:', error);
                }
                this.backgroundMusic = null;
            }

            // Cargar nueva música con manejo de errores mejorado
            console.log(`🎵 Loading ${type} music...`);
            const musicFile = type === 'menu'
                ? require('../assets/song/MusicaMenu.mp3')
                : require('../assets/song/MazeLevel.mp3');

            // Crear el sonido con configuración más robusta
            const { sound } = await Audio.Sound.createAsync(
                musicFile,
                {
                    shouldPlay: false, // No reproducir inmediatamente
                    isLooping: true,
                    volume: this.settings.musicVolume,
                }
            );

            // Verificar que el sonido se creó correctamente
            if (!sound) {
                throw new Error('Failed to create sound object');
            }

            // Intentar reproducir el sonido
            await sound.playAsync();

            this.backgroundMusic = sound;
            this.currentMusic = type;
            console.log(`✅ ${type} music started successfully`);

        } catch (error) {
            console.error(`❌ Error playing ${type} background music:`, error);
            this.currentMusic = null;
            this.backgroundMusic = null;

            // Intentar reinicializar el servicio si hay error
            try {
                console.log('🔄 Attempting to reinitialize audio service...');
                this.isInitialized = false;
                await this.initialize();
            } catch (reinitError) {
                console.error('❌ Failed to reinitialize audio service:', reinitError);
            }
        }
    }

    async stopBackgroundMusic() {
        if (!this.backgroundMusic) {
            console.log('🔇 No background music to stop');
            return;
        }

        try {
            await this.backgroundMusic.stopAsync();
            await this.backgroundMusic.unloadAsync();
            this.backgroundMusic = null;
            this.currentMusic = null;
            console.log('✅ Background music stopped');
        } catch (error) {
            console.error('❌ Error stopping background music:', error);
            this.backgroundMusic = null;
            this.currentMusic = null;
        }
    }

    async playForwardSound() {
        if (!this.settings.soundEnabled) {
            return;
        }

        if (!this.forwardSound) {
            console.log('🔇 Forward sound not loaded, attempting to load...');
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/song/forward.wav'),
                    { shouldPlay: false, volume: this.settings.soundVolume }
                );
                this.forwardSound = sound;
            } catch (error) {
                console.error('❌ Error loading forward sound:', error);
                return;
            }
        }

        try {
            await this.forwardSound.replayAsync();
        } catch (error) {
            console.error('❌ Error playing forward sound:', error);
            // Intentar recargar el sonido
            this.forwardSound = null;
        }
    }

    async playBackSound() {
        if (!this.settings.soundEnabled) {
            return;
        }

        if (!this.backSound) {
            console.log('🔇 Back sound not loaded, attempting to load...');
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/song/back.wav'),
                    { shouldPlay: false, volume: this.settings.soundVolume }
                );
                this.backSound = sound;
            } catch (error) {
                console.error('❌ Error loading back sound:', error);
                return;
            }
        }

        try {
            await this.backSound.replayAsync();
        } catch (error) {
            console.error('❌ Error playing back sound:', error);
            // Intentar recargar el sonido
            this.backSound = null;
        }
    }

    async playWinSound() {
        if (!this.settings.soundEnabled) {
            return;
        }

        if (!this.winSound) {
            console.log('🔇 Win sound not loaded, attempting to load...');
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../assets/song/win.mp3'),
                    { shouldPlay: false, volume: this.settings.soundVolume }
                );
                this.winSound = sound;
            } catch (error) {
                console.error('❌ Error loading win sound:', error);
                return;
            }
        }

        try {
            await this.winSound.replayAsync();
        } catch (error) {
            console.error('❌ Error playing win sound:', error);
            // Intentar recargar el sonido
            this.winSound = null;
        }
    }

    getSettings(): AudioSettings {
        return { ...this.settings };
    }

    async setMusicVolume(volume: number) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        await this.saveSettings();

        if (this.backgroundMusic) {
            try {
                await this.backgroundMusic.setVolumeAsync(this.settings.musicVolume);
            } catch (error) {
                console.error('❌ Error setting music volume:', error);
            }
        }
    }

    async setSoundVolume(volume: number) {
        this.settings.soundVolume = Math.max(0, Math.min(1, volume));
        await this.saveSettings();

        // Actualizar volumen de efectos de sonido
        const sounds = [this.forwardSound, this.backSound, this.winSound];
        for (const sound of sounds) {
            if (sound) {
                try {
                    await sound.setVolumeAsync(this.settings.soundVolume);
                } catch (error) {
                    console.error('❌ Error setting sound volume:', error);
                }
            }
        }
    }

    async setMusicEnabled(enabled: boolean) {
        this.settings.musicEnabled = enabled;
        await this.saveSettings();

        if (!enabled && this.backgroundMusic) {
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

            this.backgroundMusic = null;
            this.forwardSound = null;
            this.backSound = null;
            this.winSound = null;
            this.isInitialized = false;

            console.log('✅ Audio service cleaned up');
        } catch (error) {
            console.error('❌ Error cleaning up audio service:', error);
        }
    }
}

export const audioService = new AudioService();
export default audioService; 