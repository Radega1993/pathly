import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
    size?: 'small' | 'medium' | 'large';
    showTitle?: boolean;
    showSubtitle?: boolean;
}

export default function Logo({
    size = 'medium',
    showTitle = false,
    showSubtitle = false
}: LogoProps) {
    const getLogoSize = () => {
        switch (size) {
            case 'small': return 100;
            case 'large': return 200;
            default: return 140;
        }
    };

    const getTitleSize = () => {
        switch (size) {
            case 'small': return 28;
            case 'large': return 56;
            default: return 42;
        }
    };

    const getSubtitleSize = () => {
        switch (size) {
            case 'small': return 12;
            case 'large': return 20;
            default: return 16;
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/logo.png')}
                style={[
                    styles.logo,
                    { width: getLogoSize(), height: getLogoSize() }
                ]}
                resizeMode="contain"
            />

            {showTitle && (
                <Text style={[
                    styles.title,
                    { fontSize: getTitleSize() }
                ]}>
                    Pathly
                </Text>
            )}

            {showSubtitle && (
                <Text style={[
                    styles.subtitle,
                    { fontSize: getSubtitleSize() }
                ]}>
                    Conecta los números en orden
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    logo: {
        marginBottom: 0,
        // Añadir sombra sutil para el logo
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontWeight: 'bold',
        color: '#3B82F6',
        marginBottom: 8,
    },
    subtitle: {
        color: '#6B7280',
        textAlign: 'center',
    },
}); 