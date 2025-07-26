import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Linking,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateService, UpdateInfo } from '../services/updateService';

interface UpdateAlertProps {
    visible: boolean;
    onClose: () => void;
    updateInfo: UpdateInfo;
}

const { width } = Dimensions.get('window');

const UpdateAlert: React.FC<UpdateAlertProps> = ({
    visible,
    onClose,
    updateInfo,
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpdate = async () => {
        setIsLoading(true);
        try {
            const canOpen = await Linking.canOpenURL(updateInfo.updateUrl);
            if (canOpen) {
                await Linking.openURL(updateInfo.updateUrl);
            } else {
                Alert.alert(
                    'Error',
                    'No se pudo abrir Google Play Store. Por favor, busca "Pathly Game" manualmente.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error opening update URL:', error);
            Alert.alert(
                'Error',
                'No se pudo abrir Google Play Store. Por favor, busca "Pathly Game" manualmente.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleDismiss = async () => {
        try {
            await updateService.dismissUpdate(updateInfo.latestVersion || '');
            onClose();
        } catch (error) {
            console.error('Error dismissing update:', error);
            onClose();
        }
    };

    const handleRemindLater = () => {
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header con icono */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="cloud-download" size={32} color="#3B82F6" />
                        </View>
                        <Text style={styles.title}>¡Nueva actualización disponible!</Text>
                    </View>

                    {/* Contenido */}
                    <View style={styles.content}>
                        <Text style={styles.description}>
                            Una nueva versión de Pathly Game está disponible con mejoras y correcciones.
                        </Text>

                        {/* Información de versiones */}
                        <View style={styles.versionInfo}>
                            <View style={styles.versionRow}>
                                <Text style={styles.versionLabel}>Versión actual:</Text>
                                <Text style={styles.versionValue}>{updateInfo.currentVersion}</Text>
                            </View>
                            <View style={styles.versionRow}>
                                <Text style={styles.versionLabel}>Nueva versión:</Text>
                                <Text style={styles.versionValueNew}>{updateInfo.latestVersion}</Text>
                            </View>
                        </View>

                        {/* Beneficios */}
                        <View style={styles.benefits}>
                            <Text style={styles.benefitsTitle}>✨ Nuevas características:</Text>
                            <Text style={styles.benefitItem}>• Mejoras de rendimiento</Text>
                            <Text style={styles.benefitItem}>• Corrección de errores</Text>
                            <Text style={styles.benefitItem}>• Nuevas funcionalidades</Text>
                        </View>
                    </View>

                    {/* Botones */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton]}
                            onPress={handleUpdate}
                            disabled={isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <Text style={styles.updateButtonText}>Abriendo...</Text>
                            ) : (
                                <>
                                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                                    <Text style={styles.updateButtonText}>Actualizar ahora</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.secondaryButtons}>
                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleRemindLater}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.secondaryButtonText}>Recordar más tarde</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.secondaryButton}
                                onPress={handleDismiss}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.dismissButtonText}>No mostrar de nuevo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: Math.min(width - 40, 400),
        maxWidth: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
    },
    content: {
        marginBottom: 24,
    },
    description: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 20,
    },
    versionInfo: {
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    versionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    versionLabel: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    versionValue: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '600',
    },
    versionValueNew: {
        fontSize: 14,
        color: '#22C55E',
        fontWeight: '600',
    },
    benefits: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 16,
    },
    benefitsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#166534',
        marginBottom: 8,
    },
    benefitItem: {
        fontSize: 14,
        color: '#166534',
        marginBottom: 4,
    },
    buttonContainer: {
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
    },
    updateButton: {
        backgroundColor: '#3B82F6',
        shadowColor: '#3B82F6',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    updateButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    secondaryButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    secondaryButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
    dismissButtonText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center',
    },
});

export default UpdateAlert; 