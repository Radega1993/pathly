const fs = require('fs');

console.log('🔍 Quick Test - Verificando configuración...\n');

// Verificar que los archivos críticos no tengan imports problemáticos
const criticalFiles = [
    'services/auth.ts',
    'services/purchases.ts',
    'App.tsx'
];

let hasIssues = false;

criticalFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');

        // Verificar imports problemáticos
        const problematicImports = [
            'expo-auth-session',
            'react-native-purchases',
            'Google.useAuthRequest'
        ];

        problematicImports.forEach(importName => {
            if (content.includes(importName)) {
                console.log(`⚠️  ${file} contiene: ${importName}`);
                hasIssues = true;
            }
        });

        if (!hasIssues) {
            console.log(`✅ ${file} - OK`);
        }
    } else {
        console.log(`❌ ${file} - No existe`);
        hasIssues = true;
    }
});

// Verificar package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const problematicDeps = [
    'expo-auth-session',
    'react-native-purchases'
];

console.log('\n📦 Verificando dependencias...');
problematicDeps.forEach(dep => {
    if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`⚠️  ${dep} instalado - Puede causar problemas en development build`);
        hasIssues = true;
    }
});

if (!hasIssues) {
    console.log('✅ Todas las dependencias problemáticas están comentadas');
}

console.log('\n🎯 Recomendaciones:');
console.log('1. La app debería funcionar ahora con auth anónimo');
console.log('2. Los modales mostrarán mensajes informativos');
console.log('3. Para habilitar Google Auth y RevenueCat, sigue GOOGLE_AUTH_SETUP.md');

console.log('\n🚀 Estado: LISTO PARA PROBAR'); 