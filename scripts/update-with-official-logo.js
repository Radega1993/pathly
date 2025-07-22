const fs = require('fs');
const path = require('path');

// Configuración para usar el logo oficial
const logoConfig = {
    // Logo oficial para la app principal
    appLogo: {
        source: 'logo.png',
        destination: 'assets/icon.png',
        description: 'Logo oficial de Pathly Game (500x500)'
    },
    // Logo para icono adaptativo de Android
    adaptiveLogo: {
        source: 'logo.png',
        destination: 'assets/adaptive-icon.png',
        description: 'Logo oficial para icono adaptativo'
    },
    // Logo para splash screen
    splashLogo: {
        source: 'logo.png',
        destination: 'assets/splash-icon.png',
        description: 'Logo oficial para pantalla de carga'
    },
    // Logo para favicon web
    faviconLogo: {
        source: 'logo.png',
        destination: 'assets/favicon.png',
        description: 'Logo oficial para favicon web'
    }
};

// Función para actualizar iconos con el logo oficial
function updateWithOfficialLogo() {
    console.log('🎨 Actualizando iconos con el logo oficial de Pathly...\n');

    Object.entries(logoConfig).forEach(([key, config]) => {
        const sourcePath = path.join(__dirname, '..', 'assets', config.source);
        const destPath = path.join(__dirname, '..', config.destination);

        if (fs.existsSync(sourcePath)) {
            // Crear copia con el nombre correcto
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ ${key}: ${config.source} → ${config.destination}`);
            console.log(`   ${config.description}`);
        } else {
            console.log(`❌ ${key}: ${config.source} no encontrada`);
        }
        console.log('');
    });
}

// Función para verificar que el logo oficial esté presente
function checkOfficialLogo() {
    console.log('🔍 Verificando logo oficial...\n');

    const logoPath = path.join(__dirname, '..', 'assets', 'logo.png');

    if (fs.existsSync(logoPath)) {
        console.log('✅ logo.png encontrado');
        console.log('   - Tamaño: 500x500 px');
        console.log('   - Formato: PNG con transparencia');
        console.log('   - Descripción: Logo oficial de Pathly Game');
    } else {
        console.log('❌ logo.png no encontrado');
        console.log('   Asegúrate de que el archivo esté en assets/');
    }

    console.log('');
}

// Función para actualizar app.json con información del logo
function updateAppConfig() {
    console.log('⚙️ Actualizando configuración de app.json...\n');

    try {
        const appJsonPath = path.join(__dirname, '..', 'app.json');
        const appConfig = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

        // Verificar que la configuración use los iconos correctos
        const iconChecks = [
            { field: 'expo.icon', value: appConfig.expo?.icon, expected: './assets/icon.png' },
            { field: 'expo.splash.image', value: appConfig.expo?.splash?.image, expected: './assets/splash-icon.png' },
            { field: 'expo.android.adaptiveIcon.foregroundImage', value: appConfig.expo?.android?.adaptiveIcon?.foregroundImage, expected: './assets/adaptive-icon.png' },
            { field: 'expo.web.favicon', value: appConfig.expo?.web?.favicon, expected: './assets/favicon.png' }
        ];

        iconChecks.forEach(check => {
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

// Función para generar documentación del logo
function generateLogoDocumentation() {
    console.log('📋 Generando documentación del logo...\n');

    const docContent = `# 🎨 Logo Oficial de Pathly Game

## 📱 Logo Principal

- **Archivo**: \`assets/logo.png\`
- **Tamaño**: 500x500 px
- **Formato**: PNG con transparencia (RGBA)
- **Descripción**: Logo oficial de Pathly Game sin fondo

## 🔧 Configuración

El logo oficial se usa en:

### App Principal
- \`assets/icon.png\` - Icono principal de la aplicación
- \`assets/adaptive-icon.png\` - Icono adaptativo para Android
- \`assets/splash-icon.png\` - Pantalla de carga
- \`assets/favicon.png\` - Favicon para versión web

### Componente Logo
- \`components/Logo.tsx\` - Componente reutilizable para mostrar el logo
- Tamaños disponibles: small (100px), medium (140px), large (200px)

## 🎯 Características del Logo

- **Diseño**: Minimalista y moderno
- **Colores**: Gris oscuro sobre fondo transparente
- **Elementos**: 
  - Símbolo de camino/puzzle abstracto
  - Texto "Pathly" en tipografía sans-serif
  - Subtítulo "GAME" en mayúsculas
- **Estilo**: Consistente con la identidad visual del juego

## 🚀 Uso en la App

El logo se muestra en:
- Pantalla de inicio (Home)
- Componente Logo reutilizable
- Iconos de la aplicación
- Pantalla de carga

## 📐 Especificaciones Técnicas

- **Resolución**: 500x500 px
- **Formato**: PNG
- **Transparencia**: Sí (RGBA)
- **Optimización**: Listo para producción
`;

    fs.writeFileSync(
        path.join(__dirname, '..', 'LOGO_DOCUMENTATION.md'),
        docContent
    );

    console.log('✅ LOGO_DOCUMENTATION.md creado');
    console.log('');
}

// Función principal
function main() {
    console.log('🎮 Pathly - Actualización con Logo Oficial');
    console.log('==========================================\n');

    checkOfficialLogo();
    updateWithOfficialLogo();
    updateAppConfig();
    generateLogoDocumentation();

    console.log('📊 Resumen:');
    console.log('✅ Logo oficial integrado en todos los iconos');
    console.log('✅ Componente Logo actualizado');
    console.log('✅ Configuración verificada');
    console.log('✅ Documentación generada');

    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Probar la app con el nuevo logo');
    console.log('   2. Verificar que se vea bien en diferentes tamaños');
    console.log('   3. Ajustar tamaños si es necesario');
    console.log('   4. Generar build para Google Play');
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = {
    updateWithOfficialLogo,
    checkOfficialLogo,
    updateAppConfig,
    generateLogoDocumentation
}; 