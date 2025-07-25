const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Tutorial Button Configuration\n');

// Leer App.tsx
const appPath = path.join(__dirname, '../App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

// Buscar el botón del tutorial
const tutorialButtonPattern = /TouchableOpacity.*tutorialCard.*onPress.*handleShowTutorial/;
if (tutorialButtonPattern.test(appContent)) {
    console.log('✅ Botón del tutorial encontrado y configurado correctamente');
} else {
    console.log('❌ Botón del tutorial no encontrado o mal configurado');
}

// Verificar que el botón tiene el contenido correcto
if (appContent.includes('🎮 Cómo jugar') && appContent.includes('Aprende las reglas')) {
    console.log('✅ Contenido del botón correcto');
} else {
    console.log('❌ Contenido del botón incorrecto o faltante');
}

// Verificar que tiene los estilos necesarios
const requiredStyles = ['tutorialCard', 'tutorialIcon', 'tutorialContent', 'tutorialTitle', 'tutorialText', 'tutorialButton'];
let missingStyles = [];

requiredStyles.forEach(style => {
    if (!appContent.includes(style)) {
        missingStyles.push(style);
    }
});

if (missingStyles.length === 0) {
    console.log('✅ Todos los estilos del botón están presentes');
} else {
    console.log('❌ Faltan estilos:', missingStyles.join(', '));
}

// Verificar que el modal está correctamente configurado
if (appContent.includes('visible={showTutorial}') && appContent.includes('onClose={handleCloseTutorial}')) {
    console.log('✅ Modal correctamente configurado');
} else {
    console.log('❌ Modal mal configurado');
}

// Mostrar el fragmento del botón para verificación
const buttonStart = appContent.indexOf('TouchableOpacity style={styles.tutorialCard}');
if (buttonStart !== -1) {
    const buttonEnd = appContent.indexOf('</TouchableOpacity>', buttonStart);
    if (buttonEnd !== -1) {
        const buttonCode = appContent.substring(buttonStart, buttonEnd + 18);
        console.log('\n📋 Código del botón:');
        console.log(buttonCode);
    }
}

console.log('\n🎯 Test del botón completado'); 