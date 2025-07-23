import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import { PurchasesPackage } from 'react-native-purchases';
import {
    purchasesService,
    getPackages,
    purchasePackage,
    restorePurchases,
    getFormattedPrice,
    getPackageDescription,
} from '../services/purchases';
import { authService } from '../services/auth';

interface PremiumModalProps {
    visible: boolean;
    onClose: () => void;
    onPurchaseSuccess?: () => void;
}

export default function PremiumModal({ visible, onClose, onPurchaseSuccess }: PremiumModalProps) {
    const [packages, setPackages] = useState<PurchasesPackage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPackages, setIsLoadingPackages] = useState(true);

    useEffect(() => {
        if (visible) {
            loadPackages();
        }
    }, [visible]);

    const loadPackages = async () => {
        setIsLoadingPackages(true);
        try {
            await purchasesService.initialize();
            const availablePackages = await getPackages();
            setPackages(availablePackages);
        } catch (error) {
            console.error('Error loading packages:', error);
            // En modo mock, mostrar paquetes de ejemplo
            setPackages([]);
            Alert.alert(
                'RevenueCat No Configurado',
                'Las suscripciones no están configuradas aún. Se mostrarán cuando se configure RevenueCat.'
            );
        } finally {
            setIsLoadingPackages(false);
        }
    };

    const handlePurchase = async (packageToPurchase: PurchasesPackage) => {
        setIsLoading(true);
        try {
            await purchasePackage(packageToPurchase);
            Alert.alert(
                '¡Compra Exitosa!',
                'Tu suscripción premium está activa. Disfruta de Pathly sin anuncios y con pistas ilimitadas.',
                [
                    {
                        text: '¡Genial!',
                        onPress: () => {
                            onPurchaseSuccess?.();
                            onClose();
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Purchase error:', error);

            if (error.message.includes('cancelled')) {
                // Usuario canceló la compra, no mostrar error
                return;
            }

            Alert.alert(
                'Error en la Compra',
                'No se pudo completar la compra. Inténtalo de nuevo.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestorePurchases = async () => {
        setIsLoading(true);
        try {
            await restorePurchases();
            Alert.alert(
                'Compras Restauradas',
                'Se han restaurado tus compras anteriores.',
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Restore error:', error);
            Alert.alert(
                'Error al Restaurar',
                'No se pudieron restaurar las compras.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const renderPackage = (packageToPurchase: PurchasesPackage) => {
        const isPopular = packageToPurchase.identifier === 'lifetime';

        return (
            <TouchableOpacity
                key={packageToPurchase.identifier}
                style={[styles.packageCard, isPopular && styles.popularPackage]}
                onPress={() => handlePurchase(packageToPurchase)}
                disabled={isLoading}
            >
                {isPopular && (
                    <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>⭐ MÁS POPULAR</Text>
                    </View>
                )}

                <View style={styles.packageHeader}>
                    <Text style={styles.packageTitle}>
                        {packageToPurchase.identifier === 'monthly' ? 'Mensual' : 'De Por Vida'}
                    </Text>
                    <Text style={styles.packagePrice}>
                        {getFormattedPrice(packageToPurchase)}
                    </Text>
                </View>

                <Text style={styles.packageDescription}>
                    {getPackageDescription(packageToPurchase)}
                </Text>

                <View style={styles.benefitsList}>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>🚫</Text>
                        <Text style={styles.benefitText}>Sin anuncios</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>💡</Text>
                        <Text style={styles.benefitText}>Pistas ilimitadas</Text>
                    </View>
                    <View style={styles.benefitItem}>
                        <Text style={styles.benefitIcon}>☁️</Text>
                        <Text style={styles.benefitText}>Sincronización en la nube</Text>
                    </View>
                    {packageToPurchase.identifier === 'lifetime' && (
                        <View style={styles.benefitItem}>
                            <Text style={styles.benefitIcon}>🎁</Text>
                            <Text style={styles.benefitText}>Acceso de por vida</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>🚀 Pathly Premium</Text>
                        <Text style={styles.subtitle}>
                            Desbloquea todo el potencial de Pathly
                        </Text>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {isLoadingPackages ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#3B82F6" />
                                <Text style={styles.loadingText}>Cargando suscripciones...</Text>
                            </View>
                        ) : packages.length > 0 ? (
                            <View style={styles.packagesContainer}>
                                {packages.map(renderPackage)}
                            </View>
                        ) : (
                            <View style={styles.noPackagesContainer}>
                                <Text style={styles.noPackagesText}>
                                    No hay suscripciones disponibles en este momento.
                                </Text>
                            </View>
                        )}

                        <View style={styles.infoSection}>
                            <Text style={styles.infoTitle}>¿Qué incluye Premium?</Text>
                            <View style={styles.infoList}>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoIcon}>🚫</Text>
                                    <Text style={styles.infoText}>Elimina todos los anuncios</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoIcon}>💡</Text>
                                    <Text style={styles.infoText}>Pistas ilimitadas en todos los niveles</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoIcon}>☁️</Text>
                                    <Text style={styles.infoText}>Sincronización automática del progreso</Text>
                                </View>
                                <View style={styles.infoItem}>
                                    <Text style={styles.infoIcon}>📊</Text>
                                    <Text style={styles.infoText}>Estadísticas detalladas de juego</Text>
                                </View>
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.restoreButton}
                            onPress={handleRestorePurchases}
                            disabled={isLoading}
                        >
                            <Text style={styles.restoreButtonText}>🔄 Restaurar Compras</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>

                    {isLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#FFFFFF" />
                            <Text style={styles.loadingOverlayText}>Procesando...</Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        margin: 20,
        maxHeight: '90%',
        width: '100%',
        maxWidth: 400,
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
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6B7280',
    },
    packagesContainer: {
        gap: 16,
        marginBottom: 24,
    },
    packageCard: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 20,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        position: 'relative',
    },
    popularPackage: {
        borderColor: '#3B82F6',
        backgroundColor: '#EFF6FF',
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 20,
        backgroundColor: '#3B82F6',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    popularText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    packageTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    packagePrice: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#3B82F6',
    },
    packageDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20,
    },
    benefitsList: {
        gap: 8,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    benefitIcon: {
        fontSize: 16,
        width: 20,
    },
    benefitText: {
        fontSize: 14,
        color: '#374151',
    },
    noPackagesContainer: {
        alignItems: 'center',
        padding: 40,
    },
    noPackagesText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    infoSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    infoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    infoList: {
        gap: 12,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoIcon: {
        fontSize: 18,
        width: 24,
    },
    infoText: {
        fontSize: 14,
        color: '#4B5563',
        flex: 1,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    restoreButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
    },
    restoreButtonText: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '500',
    },
    closeButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#E5E7EB',
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#374151',
        fontSize: 14,
        fontWeight: '500',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    loadingOverlayText: {
        color: '#FFFFFF',
        fontSize: 16,
        marginTop: 12,
    },
}); 