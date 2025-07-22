const fs = require('fs');
const path = require('path');

// Configuración de tamaños para Android
const androidIconSizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192
};

// Función para verificar si las imágenes personalizadas existen
function checkCustomImages() {
    const customImages = [
        'playstore-icon.png',
        'ic_launcher-web.png',
        '9c6962bc-e4fc-459a-8e85-d67cbaaebf9d.png'
    ];

    console.log('🔍 Verificando imágenes personalizadas...');

    customImages.forEach(image => {
        const imagePath = path.join(__dirname, '..', 'assets', image);
        if (fs.existsSync(imagePath)) {
            console.log(`✅ ${image} encontrada`);
        } else {
            console.log(`❌ ${image} no encontrada`);
        }
    });
}

// Función para limpiar iconos por defecto de Expo
function cleanDefaultIcons() {
    console.log('\n🧹 Limpiando iconos por defecto de Expo...');

    const defaultIcons = [
        'assets/mipmap-mdpi/ic_launcher.png',
        'assets/mipmap-mdpi/ic_launcher_round.png',
        'assets/mipmap-mdpi/ic_launcher_foreground.png',
        'assets/mipmap-hdpi/ic_launcher.png',
        'assets/mipmap-hdpi/ic_launcher_round.png',
        'assets/mipmap-hdpi/ic_launcher_foreground.png',
        'assets/mipmap-xhdpi/ic_launcher.png',
        'assets/mipmap-xhdpi/ic_launcher_round.png',
        'assets/mipmap-xhdpi/ic_launcher_foreground.png',
        'assets/mipmap-xxhdpi/ic_launcher.png',
        'assets/mipmap-xxhdpi/ic_launcher_round.png',
        'assets/mipmap-xxhdpi/ic_launcher_foreground.png',
        'assets/mipmap-xxxhdpi/ic_launcher.png',
        'assets/mipmap-xxxhdpi/ic_launcher_round.png',
        'assets/mipmap-xxxhdpi/ic_launcher_foreground.png'
    ];

    defaultIcons.forEach(iconPath => {
        const fullPath = path.join(__dirname, '..', iconPath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            console.log(`🗑️ Eliminado: ${iconPath}`);
        }
    });
}

// Función para crear directorios si no existen
function ensureDirectories() {
    console.log('\n📁 Creando directorios necesarios...');

    Object.keys(androidIconSizes).forEach(dir => {
        const dirPath = path.join(__dirname, '..', 'assets', dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`📁 Creado: ${dir}`);
        }
    });
}

// Función para generar iconos usando ImageMagick (si está disponible)
function generateIcons() {
    console.log('\n🎨 Generando iconos de Android...');
    console.log('⚠️ Para generar los iconos automáticamente, necesitas:');
    console.log('   1. ImageMagick instalado');
    console.log('   2. Ejecutar: npm install -g @expo/cli');
    console.log('   3. Ejecutar: expo prebuild');
    console.log('\n📋 Pasos manuales recomendados:');
    console.log('   1. Usar tu imagen playstore-icon.png (512x512)');
    console.log('   2. Generar iconos con herramientas online como:');
    console.log('      - https://appicon.co/');
    console.log('      - https://www.appicon.co/');
    console.log('   3. Reemplazar los archivos en assets/mipmap-*/');
}

// Función principal
function main() {
    console.log('🎮 Pathly - Configuración de Iconos para Google Play');
    console.log('==================================================\n');

    checkCustomImages();
    cleanDefaultIcons();
    ensureDirectories();
    generateIcons();

    console.log('\n✅ Configuración completada!');
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Generar iconos con tus imágenes personalizadas');
    console.log('   2. Reemplazar archivos en assets/mipmap-*/');
    console.log('   3. Configurar app.json con bundleIdentifier correcto');
    console.log('   4. Ejecutar: expo prebuild');
    console.log('   5. Ejecutar: eas build --platform android');
}

// Ejecutar script
if (require.main === module) {
    main();
}

module.exports = {
    checkCustomImages,
    cleanDefaultIcons,
    ensureDirectories,
    generateIcons
}; 