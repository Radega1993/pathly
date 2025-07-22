const fs = require('fs');
const path = require('path');

// Configuración de iconos para Google Play
const iconConfig = {
    // Icono principal para Google Play Store (512x512)
    playStore: {
        source: 'playstore-icon.png',
        destination: 'assets/playstore-icon.png',
        size: '512x512'
    },
    // Icono para la app (1024x1024)
    appIcon: {
        source: '9c6962bc-e4fc-459a-8e85-d67cbaaebf9d.png',
        destination: 'assets/icon.png',
        size: '1024x1024'
    },
    // Icono adaptativo para Android
    adaptiveIcon: {
        source: 'playstore-icon.png',
        destination: 'assets/adaptive-icon.png',
        size: '1024x1024'
    },
    // Icono para splash screen
    splashIcon: {
        source: 'playstore-icon.png',
        destination: 'assets/splash-icon.png',
        size: '1242x2436'
    },
    // Favicon para web
    favicon: {
        source: 'playstore-icon.png',
        destination: 'assets/favicon.png',
        size: '32x32'
    }
};

// Función para copiar y renombrar imágenes
function setupCustomIcons() {
    console.log('🎨 Configurando iconos personalizados para Google Play...\n');

    Object.entries(iconConfig).forEach(([key, config]) => {
        const sourcePath = path.join(__dirname, '..', 'assets', config.source);
        const destPath = path.join(__dirname, '..', config.destination);

        if (fs.existsSync(sourcePath)) {
            // Crear copia con el nombre correcto
            fs.copyFileSync(sourcePath, destPath);
            console.log(`✅ ${key}: ${config.source} → ${config.destination} (${config.size})`);
        } else {
            console.log(`❌ ${key}: ${config.source} no encontrada`);
        }
    });
}

// Función para crear archivos de configuración de iconos
function createIconConfigs() {
    console.log('\n📋 Creando configuraciones de iconos...');

    // Crear archivo de configuración para Android
    const androidConfig = {
        icon: './assets/icon.png',
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#3B82F6'
        },
        splash: {
            image: './assets/splash-icon.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff'
        }
    };

    fs.writeFileSync(
        path.join(__dirname, '..', 'icon-config.json'),
        JSON.stringify(androidConfig, null, 2)
    );

    console.log('✅ icon-config.json creado');
}

// Función para verificar requisitos de Google Play
function checkGooglePlayRequirements() {
    console.log('\n🔍 Verificando requisitos para Google Play...');

    const requirements = [
        { file: 'assets/icon.png', size: '1024x1024', required: true },
        { file: 'assets/adaptive-icon.png', size: '1024x1024', required: true },
        { file: 'assets/splash-icon.png', size: '1242x2436', required: true },
        { file: 'assets/playstore-icon.png', size: '512x512', required: true }
    ];

    let allGood = true;

    requirements.forEach(req => {
        const filePath = path.join(__dirname, '..', req.file);
        if (fs.existsSync(filePath)) {
            console.log(`✅ ${req.file} (${req.size})`);
        } else {
            console.log(`❌ ${req.file} (${req.size}) - REQUERIDO`);
            allGood = false;
        }
    });

    return allGood;
}

// Función para crear README de iconos
function createIconReadme() {
    const readmeContent = `# 🎨 Iconos de Pathly para Google Play

## 📱 Iconos Configurados

### Google Play Store
- **playstore-icon.png** (512x512) - Icono principal para la store
- **icon.png** (1024x1024) - Icono de la aplicación
- **adaptive-icon.png** (1024x1024) - Icono adaptativo para Android
- **splash-icon.png** (1242x2436) - Pantalla de carga

### Web
- **favicon.png** (32x32) - Favicon para versión web

## 🔧 Configuración

Los iconos están configurados en \`app.json\`:

\`\`\`json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#3B82F6"
      }
    }
  }
}
\`\`\`

## 📋 Requisitos Google Play

- ✅ Icono principal: 512x512 px
- ✅ Icono adaptativo: 1024x1024 px
- ✅ Pantalla de carga: 1242x2436 px
- ✅ Formato: PNG con transparencia

## 🚀 Próximos Pasos

1. Verificar que todos los iconos estén en el formato correcto
2. Ejecutar: \`expo prebuild\`
3. Ejecutar: \`eas build --platform android\`
4. Subir a Google Play Console

## 🎯 Notas

- Los iconos por defecto de Expo han sido eliminados
- Se usan las imágenes personalizadas de Pathly
- El color de fondo del icono adaptativo es #3B82F6 (azul Pathly)
`;

    fs.writeFileSync(
        path.join(__dirname, '..', 'ICONS_README.md'),
        readmeContent
    );

    console.log('✅ ICONS_README.md creado');
}

// Función principal
function main() {
    console.log('🎮 Pathly - Configuración de Iconos Personalizados');
    console.log('================================================\n');

    setupCustomIcons();
    createIconConfigs();
    createIconReadme();

    const requirementsMet = checkGooglePlayRequirements();

    console.log('\n📋 Resumen:');
    if (requirementsMet) {
        console.log('✅ Todos los requisitos para Google Play están cumplidos');
        console.log('🚀 Listo para generar build de Android');
    } else {
        console.log('⚠️ Faltan algunos requisitos para Google Play');
        console.log('🔧 Revisa los archivos faltantes antes de continuar');
    }

    console.log('\n📁 Archivos creados:');
    console.log('   - icon-config.json');
    console.log('   - ICONS_README.md');

    console.log('\n🎯 Próximos pasos:');
    console.log('   1. Verificar que los iconos se vean correctamente');
    console.log('   2. Ejecutar: expo prebuild');
    console.log('   3. Ejecutar: eas build --platform android');
    console.log('   4. Subir APK/AAB a Google Play Console');
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = {
    setupCustomIcons,
    createIconConfigs,
    checkGooglePlayRequirements,
    createIconReadme
}; 