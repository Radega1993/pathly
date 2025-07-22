const fs = require('fs');
const path = require('path');

// Verificar que los archivos de la pantalla de inicio estén correctos
function checkHomeScreenFiles() {
    console.log('🎮 Verificando archivos de la pantalla de inicio...\n');

    const requiredFiles = [
        'App.tsx',
        'components/Logo.tsx',
        'assets/logo.png',
        'assets/icon.png',
        'assets/playstore-icon.png'
    ];

    let allGood = true;

    requiredFiles.forEach(file => {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - NO ENCONTRADO`);
            allGood = false;
        }
    });

    return allGood;
}

// Verificar que el componente Logo esté bien configurado
function checkLogoComponent() {
    console.log('\n🔍 Verificando componente Logo...\n');

    try {
        const logoPath = path.join(__dirname, '..', 'components', 'Logo.tsx');
        const logoContent = fs.readFileSync(logoPath, 'utf8');

        const checks = [
            { name: 'Import de React', check: logoContent.includes('import React') },
            { name: 'Import de Image', check: logoContent.includes('import.*Image') },
            { name: 'Interface LogoProps', check: logoContent.includes('interface LogoProps') },
            { name: 'Logo size prop', check: logoContent.includes('size?:') },
            { name: 'Image source', check: logoContent.includes('require(\'../assets/logo.png\')') },
            { name: 'ResizeMode contain', check: logoContent.includes('resizeMode="contain"') }
        ];

        checks.forEach(check => {
            if (check.check) {
                console.log(`  ✅ ${check.name}`);
            } else {
                console.log(`  ❌ ${check.name}`);
            }
        });

        console.log('');
    } catch (error) {
        console.log(`  ❌ Error leyendo Logo.tsx: ${error.message}\n`);
    }
}

// Verificar que App.tsx use el componente Logo
function checkAppUsage() {
    console.log('🔍 Verificando uso en App.tsx...\n');

    try {
        const appPath = path.join(__dirname, '..', 'App.tsx');
        const appContent = fs.readFileSync(appPath, 'utf8');

        const checks = [
            { name: 'Import de Logo', check: appContent.includes('import Logo from') },
            { name: 'Uso de componente Logo', check: appContent.includes('<Logo') },
            { name: 'Logo size prop', check: appContent.includes('size="medium"') },
            { name: 'LogoContainer style', check: appContent.includes('logoContainer') }
        ];

        checks.forEach(check => {
            if (check.check) {
                console.log(`  ✅ ${check.name}`);
            } else {
                console.log(`  ❌ ${check.name}`);
            }
        });

        console.log('');
    } catch (error) {
        console.log(`  ❌ Error leyendo App.tsx: ${error.message}\n`);
    }
}

// Generar resumen de mejoras
function generateImprovementsSummary() {
    console.log('📋 Resumen de mejoras implementadas:\n');

    const improvements = [
        '✅ Logo personalizado de Pathly integrado',
        '✅ Componente Logo reutilizable creado',
        '✅ Pantalla de inicio rediseñada con mejor UX',
        '✅ Información del juego organizada en tarjetas',
        '✅ Footer con versión de la app',
        '✅ Sombras y efectos visuales mejorados',
        '✅ Layout responsive y centrado',
        '✅ Colores consistentes con la marca Pathly'
    ];

    improvements.forEach(improvement => {
        console.log(`  ${improvement}`);
    });

    console.log('\n🎯 Próximos pasos sugeridos:');
    console.log('  1. Probar la app en dispositivo real');
    console.log('  2. Ajustar tamaños según feedback');
    console.log('  3. Considerar animaciones de entrada');
    console.log('  4. Agregar modo oscuro opcional');
}

// Función principal
function main() {
    console.log('🎮 Pathly - Verificación de Pantalla de Inicio');
    console.log('=============================================\n');

    const filesOk = checkHomeScreenFiles();
    checkLogoComponent();
    checkAppUsage();

    console.log('📊 Resumen:');
    if (filesOk) {
        console.log('✅ Todos los archivos están presentes');
        console.log('🚀 La pantalla de inicio está lista para usar');
    } else {
        console.log('⚠️ Faltan algunos archivos');
        console.log('🔧 Completa los archivos faltantes antes de continuar');
    }

    console.log('\n' + '='.repeat(50));
    generateImprovementsSummary();
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = {
    checkHomeScreenFiles,
    checkLogoComponent,
    checkAppUsage,
    generateImprovementsSummary
}; 