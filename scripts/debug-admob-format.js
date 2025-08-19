#!/usr/bin/env node

console.log('🔍 Diagnóstico de Formato de Anuncios AdMob');
console.log('===========================================\n');

console.log('❌ Error actual: "Ad unit doesn\'t match format"');
console.log('📍 ID que falla: ca-app-pub-4553067801626383/6963330688');
console.log('🔧 Usado como: InterstitialAd (para pistas)');
console.log('');

console.log('🎯 Verificaciones necesarias en AdMob Console:');
console.log('');

console.log('PASO 1: Ve a https://admob.google.com/');
console.log('PASO 2: Selecciona "Pathly Game"');
console.log('PASO 3: Ve a "Bloques de anuncios"');
console.log('');

console.log('PASO 4: Para CADA bloque de anuncios, verifica:');
console.log('');

console.log('📋 Para "intrinsecal_pista" (ID: ...6975611425):');
console.log('   - Formato: ¿Qué dice exactamente?');
console.log('   - Tipo: ¿Intersticial? ¿Intersticial bonificado? ¿Recompensado?');
console.log('   - Estado: ¿Activo? ¿Pausado?');
console.log('   - Elementos habilitados: ¿Cuántos?');
console.log('');

console.log('📋 Para "pista" (ID: ...6963330688):');
console.log('   - Formato: ¿Qué dice exactamente?');
console.log('   - Tipo: ¿Intersticial? ¿Intersticial bonificado? ¿Recompensado?');
console.log('   - Estado: ¿Activo? ¿Pausado?');
console.log('   - Elementos habilitados: ¿Cuántos?');
console.log('');

console.log('🔍 Posibles causas del error:');
console.log('');

console.log('1. 📱 Formato real diferente:');
console.log('   - Uno puede ser "Intersticial" y otro "Intersticial bonificado"');
console.log('   - Uno puede ser "Recompensado" real');
console.log('   - La interfaz web puede mostrar información incorrecta');
console.log('');

console.log('2. ⚙️ Configuración interna:');
console.log('   - El formato puede ser diferente al mostrado');
console.log('   - Puede haber configuraciones específicas por ID');
console.log('');

console.log('3. 🕐 Tiempo de propagación:');
console.log('   - Los cambios recientes pueden no haberse propagado');
console.log('   - El cache de AdMob puede mostrar info antigua');
console.log('');

console.log('🧪 Soluciones para probar:');
console.log('');

console.log('SOLUCIÓN A: Usar ambos como RewardedAd');
console.log('   - Cambiar el código para crear ambos con RewardedAd');
console.log('   - Aunque diga "Intersticial bonificado"');
console.log('');

console.log('SOLUCIÓN B: Crear un nuevo bloque de anuncios');
console.log('   - Crear un nuevo "Recompensado" específicamente para pistas');
console.log('   - Usar el nuevo ID en lugar del problemático');
console.log('');

console.log('SOLUCIÓN C: Verificar el formato real');
console.log('   - Contactar soporte de AdMob para verificar formato');
console.log('   - Usar herramientas de debug de AdMob');
console.log('');

console.log('🎯 Información que necesito:');
console.log('');
console.log('Por favor, verifica en AdMob Console y dime EXACTAMENTE:');
console.log('');
console.log('Para ID ...6975611425 (intrinsecal_pista):');
console.log('   - Formato exacto: _______________');
console.log('   - Estado: _______________');
console.log('   - Elementos habilitados: _______________');
console.log('');
console.log('Para ID ...6963330688 (pista):');
console.log('   - Formato exacto: _______________');
console.log('   - Estado: _______________');
console.log('   - Elementos habilitados: _______________');
console.log('');

console.log('⚡ Prueba inmediata - Cambiar ambos a RewardedAd:');
console.log('   Si me confirmas que ambos son realmente "bonificados",');
console.log('   podemos probar cambiando el código para usar RewardedAd');
console.log('   en lugar de InterstitialAd para ambos.'); 