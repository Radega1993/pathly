import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from 'react-native';

interface TutorialScreenProps {
    onBack: () => void;
}

const TutorialScreen: React.FC<TutorialScreenProps> = ({ onBack }) => {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>📚 Cómo jugar Pathly</Text>
                <View style={styles.headerSpacer} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introSection}>
                    <Text style={styles.introTitle}>¡Bienvenido a Pathly!</Text>
                    <Text style={styles.introText}>
                        Un juego de puzzle donde debes conectar números en orden para completar el camino y llenar todo el grid.
                    </Text>
                </View>

                <View style={styles.rulesSection}>
                    <Text style={styles.sectionTitle}>🎯 Reglas del Juego</Text>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>1</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Objetivo</Text>
                            <Text style={styles.ruleText}>
                                Conecta todos los números en orden (1, 2, 3, 4...) para completar el camino y llenar todo el grid.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>2</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Controles</Text>
                            <Text style={styles.ruleText}>
                                Toca cada celda una por una, o arrastra el dedo por las celdas adyacentes para trazar el camino más rápido.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>3</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Conexiones</Text>
                            <Text style={styles.ruleText}>
                                Solo puedes conectar celdas que estén una al lado de la otra (horizontal o verticalmente, no en diagonal).
                            </Text>
                        </View>
                    </View>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>4</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Sin repetir</Text>
                            <Text style={styles.ruleText}>
                                No puedes seleccionar la misma celda dos veces. Cada celda debe usarse exactamente una vez.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>5</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Orden correcto</Text>
                            <Text style={styles.ruleText}>
                                Debes seguir el orden numérico: empieza en el número 1 y termina en el número más alto del tablero.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>6</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Pistas</Text>
                            <Text style={styles.ruleText}>
                                Si te quedas atascado, usa las pistas. La primera es gratuita, las siguientes requieren ver un anuncio.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.ruleItem}>
                        <View style={styles.ruleNumberContainer}>
                            <Text style={styles.ruleNumber}>7</Text>
                        </View>
                        <View style={styles.ruleContent}>
                            <Text style={styles.ruleTitle}>Completar</Text>
                            <Text style={styles.ruleText}>
                                Cuando hayas conectado todos los números y llenado todo el tablero, el nivel estará completo.
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tipsSection}>
                    <Text style={styles.sectionTitle}>💡 Consejos y Estrategias</Text>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>🎯</Text>
                        <Text style={styles.tipText}>
                            Planifica tu ruta antes de empezar. A veces es mejor pensar en el camino completo antes de hacer la primera selección.
                        </Text>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>🔍</Text>
                        <Text style={styles.tipText}>
                            Busca patrones en el grid. Los números suelen estar colocados de manera que formen un camino lógico.
                        </Text>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>⚡</Text>
                        <Text style={styles.tipText}>
                            Usa el arrastre (drag) para conectar celdas más rápido, especialmente en niveles grandes.
                        </Text>
                    </View>

                    <View style={styles.tipItem}>
                        <Text style={styles.tipIcon}>🔄</Text>
                        <Text style={styles.tipText}>
                            Si te equivocas, usa el botón de reinicio para empezar de nuevo sin perder progreso.
                        </Text>
                    </View>
                </View>

                <View style={styles.difficultySection}>
                    <Text style={styles.sectionTitle}>📊 Niveles de Dificultad</Text>

                    <View style={styles.difficultyItem}>
                        <Text style={styles.difficultyLevel}>Fácil</Text>
                        <Text style={styles.difficultyText}>Grids pequeños (3x3, 4x4) con pocos números</Text>
                    </View>

                    <View style={styles.difficultyItem}>
                        <Text style={styles.difficultyLevel}>Normal</Text>
                        <Text style={styles.difficultyText}>Grids medianos (5x5, 6x6) con más números</Text>
                    </View>

                    <View style={styles.difficultyItem}>
                        <Text style={styles.difficultyLevel}>Difícil</Text>
                        <Text style={styles.difficultyText}>Grids grandes (6x6, 8x8) con muchos números</Text>
                    </View>

                    <View style={styles.difficultyItem}>
                        <Text style={styles.difficultyLevel}>Extremo</Text>
                        <Text style={styles.difficultyText}>Grids muy grandes (7x7, 10x10) con desafíos complejos</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.startButton} onPress={onBack}>
                    <Text style={styles.startButtonText}>¡Empezar a Jugar!</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3B82F6',
        flex: 1,
        textAlign: 'center',
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    introSection: {
        marginBottom: 30,
        padding: 20,
        backgroundColor: '#EFF6FF',
        borderRadius: 15,
        borderLeftWidth: 4,
        borderLeftColor: '#3B82F6',
    },
    introTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 10,
        textAlign: 'center',
    },
    introText: {
        fontSize: 16,
        color: '#4B5563',
        lineHeight: 24,
        textAlign: 'center',
    },
    rulesSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 20,
        textAlign: 'center',
    },
    ruleItem: {
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: '#F8FAFC',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    ruleNumberContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    ruleNumber: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    ruleContent: {
        flex: 1,
    },
    ruleTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 5,
    },
    ruleText: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    tipsSection: {
        marginBottom: 30,
    },
    tipItem: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: '#FEF3C7',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F59E0B',
    },
    tipIcon: {
        fontSize: 24,
        marginRight: 15,
        marginTop: 2,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: '#92400E',
        lineHeight: 20,
    },
    difficultySection: {
        marginBottom: 30,
    },
    difficultyItem: {
        marginBottom: 15,
        padding: 15,
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#22C55E',
    },
    difficultyLevel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#166534',
        marginBottom: 5,
    },
    difficultyText: {
        fontSize: 14,
        color: '#166534',
        lineHeight: 20,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    startButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        alignItems: 'center',
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default TutorialScreen; 