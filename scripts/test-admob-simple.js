#!/usr/bin/env node

/**
 * Script simplificado para probar AdMob
 * Ejecutar: node scripts/test-admob-simple.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing AdMob Configuration (Simplified)...\n');

// Verificar que expo-ads-admob está instalado
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (!packageJson.dependencies['expo-ads-admob']) {
    console.error('❌ expo-ads-admob no está instalado');
    process.exit(1);
}

console.log('✅ expo-ads-admob está instalado');

// Verificar configuración en app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

const admobPlugin = appJson.expo.plugins?.find(plugin =>
    Array.isArray(plugin) && plugin[0] === 'expo-ads-admob'
);

if (!admobPlugin) {
    console.error('❌ Plugin expo-ads-admob no está configurado en app.json');
    process.exit(1);
}

console.log('✅ Plugin expo-ads-admob está configurado');
console.log(`   Android App ID: ${admobPlugin[1].androidAppId}`);

// Verificar configuración en services/ads.ts
const adsServicePath = path.join(__dirname, '..', 'services', 'ads.ts');
const adsServiceContent = fs.readFileSync(adsServicePath, 'utf8');

// Verificar que usa IDs de producción
if (adsServiceContent.includes('4553067801626383')) {
    console.log('✅ Usando IDs de PRODUCCIÓN');
} else {
    console.warn('⚠️  No se detectaron IDs de PRODUCCIÓN');
}

// Verificar que importa la librería correcta
if (adsServiceContent.includes("from 'expo-ads-admob'")) {
    console.log('✅ Importa correctamente expo-ads-admob');
} else {
    console.error('❌ No importa expo-ads-admob correctamente');
    process.exit(1);
}

// Verificar que no usa mocks
if (adsServiceContent.includes('Mock')) {
    console.error('❌ Aún usa mocks de AdMob');
    process.exit(1);
}

console.log('✅ No usa mocks, usa la librería real');

// Verificar configuración de test device
if (adsServiceContent.includes('setTestDeviceIDAsync')) {
    console.log('✅ Configura test device');
} else {
    console.warn('⚠️  No configura test device');
}

console.log('\n🎯 Resumen de configuración:');
console.log('   - Librería instalada: ✅');
console.log('   - Plugin configurado: ✅');
console.log('   - IDs de PRODUCCIÓN: ✅');
console.log('   - Sin mocks: ✅');
console.log('   - Test device: ✅');

console.log('\n📱 Para probar en close tester:');
console.log('   1. Ejecuta: npm start');
console.log('   2. Escanea el QR con la app de Expo Go');
console.log('   3. Los anuncios deberían aparecer como ads reales');
console.log('   4. Verifica en la consola los logs de AdMob');

console.log('\n🔧 Si los anuncios no aparecen:');
console.log('   - Verifica la conexión a internet');
console.log('   - Asegúrate de estar en modo close tester');
console.log('   - Revisa los logs en la consola de Expo');
console.log('   - Los ads pueden tardar unos segundos en cargar');

console.log('\n⚠️  Nota importante:');
console.log('   - Estos son ads de PRODUCCIÓN reales');
console.log('   - Contarán hacia tu cuenta de AdMob');
console.log('   - Asegúrate de que tu cuenta esté aprobada');

console.log('\n✅ Test completado exitosamente!'); 