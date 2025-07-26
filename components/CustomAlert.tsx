import React from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
} from 'react-native';

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message: string;
    type?: 'error' | 'success' | 'warning' | 'info';
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
}

const { width } = Dimensions.get('window');

const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    title,
    message,
    type = 'info',
    onClose,
    onConfirm,
    confirmText = 'OK',
    cancelText = 'Cancelar',
    showCancel = false,
}) => {
    const scaleValue = React.useRef(new Animated.Value(0)).current;
    const opacityValue = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacityValue, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.spring(scaleValue, {
                    toValue: 0,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacityValue, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, scaleValue, opacityValue]);

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return {
                    container: styles.errorContainer,
                    icon: '❌',
                    titleColor: '#DC2626',
                    backgroundColor: '#FEF2F2',
                    borderColor: '#FECACA',
                };
            case 'success':
                return {
                    container: styles.successContainer,
                    icon: '✅',
                    titleColor: '#059669',
                    backgroundColor: '#F0FDF4',
                    borderColor: '#BBF7D0',
                };
            case 'warning':
                return {
                    container: styles.warningContainer,
                    icon: '⚠️',
                    titleColor: '#D97706',
                    backgroundColor: '#FFFBEB',
                    borderColor: '#FED7AA',
                };
            default:
                return {
                    container: styles.infoContainer,
                    icon: 'ℹ️',
                    titleColor: '#3B82F6',
                    backgroundColor: '#EFF6FF',
                    borderColor: '#BFDBFE',
                };
        }
    };

    const typeStyles = getTypeStyles();

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm();
        }
        onClose();
    };

    const handleCancel = () => {
        onClose();
    };

    if (!visible) return null;

    return (
        <>
            <StatusBar backgroundColor="rgba(0, 0, 0, 0.5)" barStyle="light-content" />
            <Modal
                transparent
                visible={visible}
                animationType="none"
                onRequestClose={onClose}
            >
                <View style={styles.overlay}>
                    <Animated.View
                        style={[
                            styles.overlayBackground,
                            {
                                opacity: opacityValue,
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.alertContainer,
                            typeStyles.container,
                            {
                                transform: [{ scale: scaleValue }],
                                opacity: opacityValue,
                            },
                        ]}
                    >
                        <View style={styles.iconContainer}>
                            <Text style={styles.icon}>{typeStyles.icon}</Text>
                        </View>

                        <View style={styles.contentContainer}>
                            <Text style={[styles.title, { color: typeStyles.titleColor }]}>
                                {title}
                            </Text>
                            <Text style={styles.message}>{message}</Text>
                        </View>

                        <View style={styles.buttonContainer}>
                            {showCancel && (
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={handleCancel}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.cancelButtonText}>{cancelText}</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    styles.confirmButton,
                                    showCancel && styles.confirmButtonWithCancel,
                                ]}
                                onPress={handleConfirm}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.confirmButtonText}>{confirmText}</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    overlayBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertContainer: {
        width: width - 40,
        maxWidth: 400,
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
        borderWidth: 1,
    },
    errorContainer: {
        backgroundColor: '#FEF2F2',
        borderColor: '#FECACA',
    },
    successContainer: {
        backgroundColor: '#F0FDF4',
        borderColor: '#BBF7D0',
    },
    warningContainer: {
        backgroundColor: '#FFFBEB',
        borderColor: '#FED7AA',
    },
    infoContainer: {
        backgroundColor: '#EFF6FF',
        borderColor: '#BFDBFE',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    icon: {
        fontSize: 48,
    },
    contentContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        lineHeight: 28,
    },
    message: {
        fontSize: 16,
        color: '#374151',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    cancelButton: {
        backgroundColor: '#F3F4F6',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    confirmButton: {
        backgroundColor: '#3B82F6',
    },
    confirmButtonWithCancel: {
        flex: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default CustomAlert; 