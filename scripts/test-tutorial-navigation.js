const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Tutorial Navigation\n');

// Verificar App.tsx
const appPath = path.join(__dirname, '../App.tsx');
if (fs.existsSync(appPath)) {
    console.log('✅ App.tsx existe');

    const appContent = fs.readFileSync(appPath, 'utf8');

    // Verificar que handleBack maneja el caso 'tutorial'
    if (appContent.includes("currentScreen === 'tutorial'")) {
        console.log('✅ handleBack maneja el caso tutorial');
    } else {
        console.log('❌ handleBack NO maneja el caso tutorial');
    }

    // Verificar que setCurrentScreen('menu') está presente para tutorial
    if (appContent.includes("setCurrentScreen('menu')") && appContent.includes("currentScreen === 'tutorial'")) {
        console.log('✅ Navegación a menu configurada para tutorial');
    } else {
        console.log('❌ Navegación a menu NO configurada para tutorial');
    }

    // Verificar que TutorialScreen recibe onBack
    if (appContent.includes('<TutorialScreen') && appContent.includes('onBack={handleBack}')) {
        console.log('✅ TutorialScreen recibe onBack correctamente');
    } else {
        console.log('❌ TutorialScreen NO recibe onBack correctamente');
    }

} else {
    console.log('❌ App.tsx no existe');
}

// Verificar TutorialScreen.tsx
const tutorialPath = path.join(__dirname, '../screens/TutorialScreen.tsx');
if (fs.existsSync(tutorialPath)) {
    console.log('✅ TutorialScreen.tsx existe');

    const tutorialContent = fs.readFileSync(tutorialPath, 'utf8');

    // Verificar que tiene la prop onBack
    if (tutorialContent.includes('onBack: () => void')) {
        console.log('✅ TutorialScreen tiene prop onBack definida');
    } else {
        console.log('❌ TutorialScreen NO tiene prop onBack definida');
    }

    // Verificar que el botón de regreso usa onBack
    if (tutorialContent.includes('onPress={onBack}')) {
        console.log('✅ Botón de regreso usa onBack');
    } else {
        console.log('❌ Botón de regreso NO usa onBack');
    }

    // Verificar que el botón "Empezar a Jugar" usa onBack
    if (tutorialContent.includes('¡Empezar a Jugar!') && tutorialContent.includes('onPress={onBack}')) {
        console.log('✅ Botón "Empezar a Jugar" usa onBack');
    } else {
        console.log('❌ Botón "Empezar a Jugar" NO usa onBack');
    }

} else {
    console.log('❌ TutorialScreen.tsx no existe');
}

console.log('\n🎯 Test de navegación completado'); 