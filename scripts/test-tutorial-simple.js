const fs = require('fs');
const path = require('path');

console.log('🧪 Testing TutorialModal - Simple Check\n');

// Verificar archivo TutorialModal.tsx
const tutorialPath = path.join(__dirname, '../components/TutorialModal.tsx');
if (fs.existsSync(tutorialPath)) {
    console.log('✅ TutorialModal.tsx existe');

    const content = fs.readFileSync(tutorialPath, 'utf8');

    // Verificar que tiene el contenido básico
    if (content.includes('Modal') && content.includes('visible') && content.includes('onClose')) {
        console.log('✅ Modal básico configurado correctamente');
    } else {
        console.log('❌ Falta configuración básica del Modal');
    }

    // Verificar que tiene las reglas
    if (content.includes('Objetivo:') && content.includes('Controles:')) {
        console.log('✅ Contenido de reglas presente');
    } else {
        console.log('❌ Falta contenido de reglas');
    }

} else {
    console.log('❌ TutorialModal.tsx no existe');
}

// Verificar integración en App.tsx
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    console.log('✅ App.tsx existe');

    const appContent = fs.readFileSync(appPath, 'utf8');

    if (appContent.includes('import TutorialModal')) {
        console.log('✅ TutorialModal importado');
    } else {
        console.log('❌ TutorialModal no importado');
    }

    if (appContent.includes('<TutorialModal')) {
        console.log('✅ TutorialModal usado en JSX');
    } else {
        console.log('❌ TutorialModal no usado en JSX');
    }

    if (appContent.includes('showTutorial')) {
        console.log('✅ Estado showTutorial presente');
    } else {
        console.log('❌ Estado showTutorial no encontrado');
    }

    if (appContent.includes('handleShowTutorial')) {
        console.log('✅ Función handleShowTutorial presente');
    } else {
        console.log('❌ Función handleShowTutorial no encontrada');
    }

} else {
    console.log('❌ App.tsx no existe');
}

console.log('\n�� Test completado'); 