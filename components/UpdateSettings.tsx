import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Switch,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateService, UpdatePreferences } from '../services/updateService';

interface UpdateSettingsProps {
    visible: boolean;
    onClose: () => void;
}

const UpdateSettings: React.FC<UpdateSettingsProps> = ({
    visible,
    onClose,
}) => {
    const [preferences, setPreferences] = useState<UpdatePreferences>({
        showUpdateAlerts: true,
        checkFrequency: 'weekly',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            loadPreferences();
        }
    }, [visible]);

    const loadPreferences = async () => {
        try {
            const prefs = updateService.getPreferences();
            setPreferences(prefs);
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    };

    const savePreferences = async (newPreferences: Partial<UpdatePreferences>) => {
        setIsLoading(true);
        try {
            const updatedPrefs = { ...preferences, ...newPreferences };
            await updateService.savePreferences(updatedPrefs);
            setPreferences(updatedPrefs);
        } catch (error) {
            console.error('Error saving preferences:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleAlerts = (value: boolean) => {
        savePreferences({ showUpdateAlerts: value });
    };

    const handleFrequencyChange = (frequency: UpdatePreferences['checkFrequency']) => {
        savePreferences({ checkFrequency: frequency });
    };

    const getFrequencyLabel = (frequency: UpdatePreferences['checkFrequency']) => {
        switch (frequency) {
            case 'daily':
                return 'Diariamente';
            case 'weekly':
                return 'Semanalmente';
            case 'monthly':
                return 'Mensualmente';
            case 'never':
                return 'Nunca';
            default:
                return 'Semanalmente';
        }
    };

    const getFrequencyDescription = (frequency: UpdatePreferences['checkFrequency']) => {
        switch (frequency) {
            case 'daily':
                return 'Verificar actualizaciones cada día';
            case 'weekly':
                return 'Verificar actualizaciones cada semana';
            case 'monthly':
                return 'Verificar actualizaciones cada mes';
            case 'never':
                return 'No verificar actualizaciones automáticamente';
            default:
                return 'Verificar actualizaciones cada semana';
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                        <Text style={styles.title}>Configuración de Actualizaciones</Text>
                        <View style={styles.placeholder} />
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* Sección de Alertas */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="notifications" size={20} color="#3B82F6" />
                                <Text style={styles.sectionTitle}>Alertas de Actualización</Text>
                            </View>

                            <View style={styles.settingRow}>
                                <View style={styles.settingInfo}>
                                    <Text style={styles.settingLabel}>Mostrar alertas</Text>
                                    <Text style={styles.settingDescription}>
                                        Recibir notificaciones cuando hay nuevas actualizaciones disponibles
                                    </Text>
                                </View>
                                <Switch
                                    value={preferences.showUpdateAlerts}
                                    onValueChange={handleToggleAlerts}
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor="#FFFFFF"
                                    disabled={isLoading}
                                />
                            </View>
                        </View>

                        {/* Sección de Frecuencia */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Ionicons name="time" size={20} color="#3B82F6" />
                                <Text style={styles.sectionTitle}>Frecuencia de Verificación</Text>
                            </View>

                            <Text style={styles.sectionDescription}>
                                Con qué frecuencia verificar automáticamente nuevas actualizaciones
                            </Text>

                            {(['daily', 'weekly', 'monthly', 'never'] as const).map((frequency) => (
                                <TouchableOpacity
                                    key={frequency}
                                    style={[
                                        styles.frequencyOption,
                                        preferences.checkFrequency === frequency && styles.frequencyOptionSelected,
                                    ]}
                                    onPress={() => handleFrequencyChange(frequency)}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.frequencyInfo}>
                                        <Text style={[
                                            styles.frequencyLabel,
                                            preferences.checkFrequency === frequency && styles.frequencyLabelSelected,
                                        ]}>
                                            {getFrequencyLabel(frequency)}
                                        </Text>
                                        <Text style={[
                                            styles.frequencyDescription,
                                            preferences.checkFrequency === frequency && styles.frequencyDescriptionSelected,
                                        ]}>
                                            {getFrequencyDescription(frequency)}
                                        </Text>
                                    </View>
                                    {preferences.checkFrequency === frequency && (
                                        <Ionicons name="checkmark-circle" size={24} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Información Adicional */}
                        <View style={styles.infoSection}>
                            <View style={styles.infoHeader}>
                                <Ionicons name="information-circle" size={20} color="#6B7280" />
                                <Text style={styles.infoTitle}>Información</Text>
                            </View>
                            <Text style={styles.infoText}>
                                • Las actualizaciones se verifican automáticamente según la frecuencia seleccionada
                            </Text>
                            <Text style={styles.infoText}>
                                • Siempre puedes verificar manualmente desde la pantalla principal
                            </Text>
                            <Text style={styles.infoText}>
                                • Las alertas te llevarán directamente a Google Play Store
                            </Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginTop: 50,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    sectionDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingInfo: {
        flex: 1,
        marginRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    frequencyOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: '#F9FAFB',
        marginBottom: 8,
    },
    frequencyOptionSelected: {
        backgroundColor: '#EFF6FF',
        borderWidth: 2,
        borderColor: '#3B82F6',
    },
    frequencyInfo: {
        flex: 1,
    },
    frequencyLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 4,
    },
    frequencyLabelSelected: {
        color: '#3B82F6',
    },
    frequencyDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    frequencyDescriptionSelected: {
        color: '#3B82F6',
    },
    infoSection: {
        marginTop: 32,
        marginBottom: 40,
        padding: 16,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    infoText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
        marginBottom: 8,
    },
});

export default UpdateSettings; 