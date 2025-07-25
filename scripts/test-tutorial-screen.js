const fs = require('fs');
const path = require('path');

console.log('🧪 Testing TutorialScreen Configuration\n');

// Verificar que TutorialScreen.tsx existe
const tutorialScreenPath = path.join(__dirname, '../screens/TutorialScreen.tsx');
if (fs.existsSync(tutorialScreenPath)) {
    console.log('✅ TutorialScreen.tsx existe');

    const content = fs.readFileSync(tutorialScreenPath, 'utf8');

    // Verificar estructura básica
    if (content.includes('SafeAreaView') && content.includes('ScrollView')) {
        console.log('✅ Estructura básica correcta');
    } else {
        console.log('❌ Estructura básica incorrecta');
    }

    // Verificar contenido de las reglas
    const rules = ['Objetivo', 'Controles', 'Conexiones', 'Sin repetir', 'Orden correcto', 'Pistas', 'Completar'];
    let missingRules = [];

    rules.forEach(rule => {
        if (!content.includes(rule)) {
            missingRules.push(rule);
        }
    });

    if (missingRules.length === 0) {
        console.log('✅ Todas las reglas están presentes');
    } else {
        console.log('❌ Faltan reglas:', missingRules.join(', '));
    }

    // Verificar secciones adicionales
    if (content.includes('Consejos y Estrategias') && content.includes('Niveles de Dificultad')) {
        console.log('✅ Secciones adicionales presentes');
    } else {
        console.log('❌ Faltan secciones adicionales');
    }

} else {
    console.log('❌ TutorialScreen.tsx no existe');
}

// Verificar integración en App.tsx
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    console.log('✅ App.tsx existe');

    const appContent = fs.readFileSync(appPath, 'utf8');

    if (appContent.includes('import TutorialScreen')) {
        console.log('✅ TutorialScreen importado');
    } else {
        console.log('❌ TutorialScreen no importado');
    }

    if (appContent.includes("'tutorial'")) {
        console.log('✅ Pantalla tutorial añadida al tipo AppScreen');
    } else {
        console.log('❌ Pantalla tutorial no añadida al tipo AppScreen');
    }

    if (appContent.includes("case 'tutorial'")) {
        console.log('✅ Case tutorial añadido al renderScreen');
    } else {
        console.log('❌ Case tutorial no añadido al renderScreen');
    }

    if (appContent.includes('setCurrentScreen(\'tutorial\')')) {
        console.log('✅ Navegación a tutorial configurada');
    } else {
        console.log('❌ Navegación a tutorial no configurada');
    }

} else {
    console.log('❌ App.tsx no existe');
}

// Verificar que TutorialModal fue eliminado
const tutorialModalPath = path.join(__dirname, '../components/TutorialModal.tsx');
if (!fs.existsSync(tutorialModalPath)) {
    console.log('✅ TutorialModal.tsx eliminado correctamente');
} else {
    console.log('❌ TutorialModal.tsx aún existe');
}

console.log('\n🎯 Test de TutorialScreen completado'); 