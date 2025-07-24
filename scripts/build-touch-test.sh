#!/bin/bash

# Script para generar un build de prueba para touch en dispositivos reales

echo "🎮 Generando build de prueba para touch en dispositivos reales..."
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio del proyecto."
    exit 1
fi

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Error: No se encontró el archivo .env"
    echo "   Crea el archivo .env basado en env.example"
    exit 1
fi

# Verificar que EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "❌ Error: EAS CLI no está instalado"
    echo "   Instala con: npm install -g @expo/eas-cli"
    exit 1
fi

# Verificar login en EAS
echo "🔐 Verificando login en EAS..."
if ! eas whoami &> /dev/null; then
    echo "❌ Error: No estás logueado en EAS"
    echo "   Ejecuta: eas login"
    exit 1
fi

echo "✅ Login verificado"

# Ejecutar test de touch
echo ""
echo "👆 Ejecutando test de configuración de touch..."
node scripts/test-touch-device.js

if [ $? -ne 0 ]; then
    echo "❌ Error en el test de touch"
    exit 1
fi

echo ""
echo "🔧 Instalando dependencias..."
npm install

echo ""
echo "🔍 Verificando TypeScript..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ Error en TypeScript"
    exit 1
fi

echo ""
echo "📱 Generando build de prueba para Android..."

# Preguntar al usuario qué tipo de build quiere
echo ""
echo "¿Qué tipo de build quieres generar?"
echo "1) Internal (más rápido, para testing)"
echo "2) Production (más lento, para release)"
echo ""
read -p "Selecciona una opción (1 o 2): " build_type

case $build_type in
    1)
        echo "🚀 Generando build INTERNAL..."
        eas build --platform android --profile internal
        ;;
    2)
        echo "🚀 Generando build PRODUCTION..."
        eas build --platform android --profile production
        ;;
    *)
        echo "❌ Opción inválida. Usando INTERNAL por defecto."
        eas build --platform android --profile internal
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build generado exitosamente!"
    echo ""
    echo "📋 Instrucciones para testing en dispositivo real:"
    echo "   1. Descarga el APK/AAB desde el enlace que apareció arriba"
    echo "   2. Instala en tu dispositivo Android"
    echo "   3. Abre la app y ve a un nivel"
    echo "   4. Prueba tocar las celdas del grid"
    echo "   5. Verifica que aparece el debug info al tocar"
    echo "   6. Prueba long press como alternativa"
    echo "   7. Verifica que los botones funcionan"
    echo ""
    echo "🔍 Si el touch no funciona:"
    echo "   • Verifica que el dispositivo no está en modo desarrollador"
    echo "   • Prueba con diferentes velocidades de touch"
    echo "   • Verifica que no hay apps que interfieran"
    echo "   • Prueba en modo avión y luego con WiFi"
    echo "   • Reinicia el dispositivo si es necesario"
    echo ""
    echo "📞 Si sigue sin funcionar, comparte los logs del debug info"
else
    echo "❌ Error generando el build"
    exit 1
fi 