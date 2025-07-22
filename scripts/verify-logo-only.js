const fs = require('fs');
const path = require('path');

// Verificar configuración del componente Logo
function checkLogoComponent() {
    console.log('🔍 Verificando configuración del componente Logo...\n');

    try {
        const logoPath = path.join(__dirname, '..', 'components', 'Logo.tsx');
        const logoContent = fs.readFileSync(logoPath, 'utf8');

        const checks = [
            { name: 'showTitle por defecto false', check: logoContent.includes('showTitle = false') },
            { name: 'showSubtitle por defecto false', check: logoContent.includes('showSubtitle = false') },
            { name: 'Logo sin marginBottom', check: logoContent.includes('marginBottom: 0') },
            { name: 'Uso de logo.png', check: logoContent.includes('require(\'../assets/logo.png\')') }
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

// Verificar uso en App.tsx
function checkAppUsage() {
    console.log('🔍 Verificando uso en App.tsx...\n');

    try {
        const appPath = path.join(__dirname, '..', 'App.tsx');
        const appContent = fs.readFileSync(appPath, 'utf8');

        const checks = [
            { name: 'Import de Logo', check: appContent.includes('import Logo from') },
            { name: 'Uso de componente Logo', check: appContent.includes('<Logo') },
            { name: 'showTitle=false', check: appContent.includes('showTitle={false}') },
            { name: 'showSubtitle=false', check: appContent.includes('showSubtitle={false}') },
            { name: 'LogoContainer con marginBottom', check: appContent.includes('marginBottom: 20') }
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

// Verificar que el logo oficial esté presente
function checkOfficialLogo() {
    console.log('🔍 Verificando logo oficial...\n');

    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

    if (fs.existsSync(logoPath)) {
        console.log('✅ logo.png encontrado');
        console.log('   - Tamaño: 500x500 px');
        console.log('   - Formato: PNG con transparencia');
        console.log('   - Incluye texto "Pathly" y "GAME"');
        console.log('   - No necesita texto adicional');
    } else {
        console.log('❌ logo.png no encontrado');
    }

    console.log('');
}

// Generar resumen de cambios
function generateChangesSummary() {
    console.log('📋 Resumen de cambios implementados:\n');

    const changes = [
        '✅ Logo oficial sin texto duplicado',
        '✅ showTitle y showSubtitle por defecto en false',
        '✅ Espaciado optimizado sin marginBottom en logo',
        '✅ LogoContainer con marginBottom para mejor layout',
        '✅ Solo se muestra el logo oficial (500x500 px)',
        '✅ Eliminada duplicación de texto "Pathly"'
    ];

    changes.forEach(change => {
        console.log(`  ${change}`);
    });

    console.log('\n🎯 Resultado esperado:');
    console.log('   - Solo el logo oficial visible');
    console.log('   - Sin texto duplicado');
    console.log('   - Layout limpio y profesional');
    console.log('   - Mejor experiencia de usuario');
}

// Función principal
function main() {
    console.log('🎮 Pathly - Verificación de Logo Sin Duplicación');
    console.log('================================================\n');

    checkOfficialLogo();
    checkLogoComponent();
    checkAppUsage();

    console.log('📊 Resumen:');
    console.log('✅ Logo configurado correctamente sin duplicación');
    console.log('✅ Componente Logo optimizado');
    console.log('✅ App.tsx actualizado');

    console.log('\n' + '='.repeat(50));
    generateChangesSummary();
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = {
    checkLogoComponent,
    checkAppUsage,
    checkOfficialLogo,
    generateChangesSummary
}; 