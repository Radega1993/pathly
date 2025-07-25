const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Modal Content Structure\n');

// Leer TutorialModal.tsx
const modalPath = path.join(__dirname, '../components/TutorialModal.tsx');
const modalContent = fs.readFileSync(modalPath, 'utf8');

// Verificar estructura básica
console.log('📋 Verificando estructura del modal...');

if (modalContent.includes('<Modal')) {
    console.log('✅ Modal component presente');
} else {
    console.log('❌ Modal component no encontrado');
}

if (modalContent.includes('visible={visible}')) {
    console.log('✅ Prop visible configurada');
} else {
    console.log('❌ Prop visible no encontrada');
}

// Verificar contenido de las reglas
console.log('\n📋 Verificando contenido de las reglas...');

const rules = [
    'Objetivo:',
    'Controles:',
    'Conexiones:',
    'Sin repetir:',
    'Orden correcto:',
    'Pistas:',
    'Completar:'
];

rules.forEach((rule, index) => {
    if (modalContent.includes(rule)) {
        console.log(`✅ Regla ${index + 1}: ${rule}`);
    } else {
        console.log(`❌ Regla ${index + 1}: ${rule} - NO ENCONTRADA`);
    }
});

// Verificar estilos
console.log('\n📋 Verificando estilos...');

const requiredStyles = [
    'modalContainer',
    'content',
    'rulesContainer',
    'ruleItem',
    'ruleText',
    'tipContainer'
];

requiredStyles.forEach(style => {
    if (modalContent.includes(style)) {
        console.log(`✅ Estilo: ${style}`);
    } else {
        console.log(`❌ Estilo: ${style} - NO ENCONTRADO`);
    }
});

// Verificar que no hay ScrollView que pueda estar causando problemas
if (modalContent.includes('ScrollView')) {
    console.log('⚠️ ScrollView detectado - podría causar problemas de visualización');
} else {
    console.log('✅ No hay ScrollView - usando View simple');
}

// Mostrar fragmento del contenido para verificación
const contentStart = modalContent.indexOf('{/* Content */}');
if (contentStart !== -1) {
    const contentEnd = modalContent.indexOf('{/* Footer */}', contentStart);
    if (contentEnd !== -1) {
        const contentCode = modalContent.substring(contentStart, contentEnd);
        console.log('\n📋 Fragmento del contenido:');
        console.log(contentCode.substring(0, 500) + '...');
    }
}

console.log('\n🎯 Test de contenido completado'); 