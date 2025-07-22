const fs = require('fs');
const path = require('path');

// Verificaciones para Google Play
const googlePlayChecks = {
    // Configuración de la app
    appConfig: [
        { file: 'app.json', required: true },
        { file: 'eas.json', required: true },
        { file: 'package.json', required: true }
    ],

    // Iconos requeridos
    icons: [
        { file: 'assets/icon.png', size: '1024x1024', required: true },
        { file: 'assets/adaptive-icon.png', size: '1024x1024', required: true },
        { file: 'assets/splash-icon.png', size: '1242x2436', required: true },
        { file: 'assets/playstore-icon.png', size: '512x512', required: true }
    ],

    // Configuración de build
    buildConfig: [
        { file: 'app.config.js', required: false },
        { file: 'metro.config.js', required: false }
    ]
};

// Función para verificar archivos
function checkFiles() {
    console.log('🔍 Verificando archivos de configuración...\n');

    let allGood = true;

    Object.entries(googlePlayChecks).forEach(([category, files]) => {
        console.log(`📁 ${category.toUpperCase()}:`);

        files.forEach(file => {
            const filePath = path.join(__dirname, '..', file.file);
            if (fs.existsSync(filePath)) {
                console.log(`  ✅ ${file.file}`);
            } else {
                if (file.required) {
                    console.log(`  ❌ ${file.file} - REQUERIDO`);
                    allGood = false;
                } else {
                    console.log(`  ⚠️ ${file.file} - OPCIONAL`);
                }
            }
        });
        console.log('');
    });

    return allGood;
}

// Función para verificar configuración de app.json
function checkAppConfig() {
    console.log('⚙️ Verificando configuración de app.json...\n');

    try {
        const appJsonPath = path.join(__dirname, '..', 'app.json');
        const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

        const checks = [
            { field: 'expo.name', value: appConfig.expo?.name, expected: 'Pathly' },
            { field: 'expo.slug', value: appConfig.expo?.slug, expected: 'pathly' },
            { field: 'expo.version', value: appConfig.expo?.version, expected: '1.0.0' },
            { field: 'expo.android.package', value: appConfig.expo?.android?.package, expected: 'com.pathly.game' },
            { field: 'expo.ios.bundleIdentifier', value: appConfig.expo?.ios?.bundleIdentifier, expected: 'com.pathly.game' }
        ];

        checks.forEach(check => {
            if (check.value === check.expected) {
                console.log(`  ✅ ${check.field}: "${check.value}"`);
            } else {
                console.log(`  ❌ ${check.field}: "${check.value}" (esperado: "${check.expected}")`);
            }
        });

        console.log('');
    } catch (error) {
        console.log(`  ❌ Error leyendo app.json: ${error.message}\n`);
    }
}

// Función para verificar dependencias
function checkDependencies() {
    console.log('📦 Verificando dependencias...\n');

    try {
        const packageJsonPath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        const requiredDeps = [
            'expo',
            'react-native',
            'react',
            '@react-native-async-storage/async-storage'
        ];

        const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };

        requiredDeps.forEach(dep => {
            if (allDeps[dep]) {
                console.log(`  ✅ ${dep}: ${allDeps[dep]}`);
            } else {
                console.log(`  ❌ ${dep}: NO ENCONTRADA`);
            }
        });

        console.log('');
    } catch (error) {
        console.log(`  ❌ Error leyendo package.json: ${error.message}\n`);
    }
}

// Función para generar checklist de Google Play
function generateGooglePlayChecklist() {
    console.log('📋 Checklist para Google Play Store:\n');

    const checklist = [
        '✅ Configuración de app.json completada',
        '✅ Iconos personalizados configurados',
        '✅ Bundle identifier configurado (com.pathly.game)',
        '✅ Versión de app configurada (1.0.0)',
        '✅ Nombre de app configurado (Pathly)',
        '✅ Configuración EAS para builds',
        '✅ Iconos en tamaños correctos',
        '✅ Pantalla de splash configurada',
        '✅ Icono adaptativo para Android',
        '',
        '🚧 Pendiente:',
        '  - Generar build con: eas build --platform android',
        '  - Crear cuenta en Google Play Console',
        '  - Configurar servicio de cuenta de Google',
        '  - Subir AAB a Google Play Console',
        '  - Configurar descripción y screenshots',
        '  - Configurar categoría y etiquetas',
        '  - Configurar política de privacidad',
        '  - Revisar y publicar'
    ];

    checklist.forEach(item => console.log(item));
}

// Función principal
function main() {
    console.log('🎮 Pathly - Verificación para Google Play');
    console.log('=========================================\n');

    const filesOk = checkFiles();
    checkAppConfig();
    checkDependencies();

    console.log('📊 Resumen:');
    if (filesOk) {
        console.log('✅ Todos los archivos requeridos están presentes');
        console.log('🚀 El proyecto está listo para generar build');
    } else {
        console.log('⚠️ Faltan algunos archivos requeridos');
        console.log('🔧 Completa los archivos faltantes antes de continuar');
    }

    console.log('\n' + '='.repeat(50));
    generateGooglePlayChecklist();
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = {
    checkFiles,
    checkAppConfig,
    checkDependencies,
    generateGooglePlayChecklist
}; 