#!/bin/bash

# Script para generar build de producción con las correcciones implementadas
# Pathly Game - Versión 1.0.1

set -e

echo "🚀 Generando build de producción con correcciones..."
echo "📱 Pathly Game - Versión 1.0.1"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Verificar que las correcciones están implementadas
echo "🔍 Verificando correcciones implementadas..."
node scripts/test-production-fixes.js

if [ $? -ne 0 ]; then
    echo "❌ Error: Las correcciones no están completamente implementadas."
    exit 1
fi

echo ""
echo "✅ Todas las correcciones están implementadas correctamente."

# Verificar variables de entorno
echo ""
echo "🔧 Verificando configuración..."

if [ ! -f ".env" ]; then
    echo "⚠️  Advertencia: No se encontró archivo .env"
    echo "   Copia env.example a .env y configura las variables necesarias"
    echo "   cp env.example .env"
    echo ""
fi

# Verificar que EAS CLI está instalado
if ! command -v eas &> /dev/null; then
    echo "❌ Error: EAS CLI no está instalado."
    echo "   Instala con: npm install -g @expo/eas-cli"
    exit 1
fi

# Verificar que estás logueado en EAS
echo "🔐 Verificando autenticación de EAS..."
if ! eas whoami &> /dev/null; then
    echo "❌ Error: No estás autenticado en EAS."
    echo "   Ejecuta: eas login"
    exit 1
fi

echo "✅ Autenticación verificada."

# Limpiar cache si es necesario
echo ""
echo "🧹 Limpiando cache..."
npx expo install --fix

# Verificar que no hay errores de TypeScript
echo ""
echo "🔍 Verificando TypeScript..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
    echo "❌ Error: Hay errores de TypeScript. Corrige los errores antes de continuar."
    exit 1
fi

echo "✅ TypeScript verificado sin errores."

# Generar build de Android
echo ""
echo "📱 Generando build de Android..."
echo "   Versión: 1.0.1"
echo "   Version Code: 3"
echo ""

# Preguntar si generar build interno o de producción
echo "¿Qué tipo de build quieres generar?"
echo "1) Internal (para testing)"
echo "2) Production (para Google Play Store)"
read -p "Selecciona una opción (1-2): " build_type

case $build_type in
    1)
        echo "🔧 Generando build interno..."
        eas build --platform android --profile internal
        ;;
    2)
        echo "🚀 Generando build de producción..."
        eas build --platform android --profile production
        ;;
    *)
        echo "❌ Opción inválida. Saliendo..."
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 ¡Build generado exitosamente!"
    echo ""
    echo "📋 Resumen de correcciones incluidas:"
    echo "   ✅ Parpadeo en barras de volumen solucionado"
    echo "   ✅ Touch en dispositivo real solucionado"
    echo "   ✅ Auth de Google implementado con fallback"
    echo "   ✅ Performance optimizada"
    echo ""
    echo "📱 Próximos pasos:"
    echo "   1. Descarga el APK/AAB desde EAS"
    echo "   2. Prueba en dispositivo real"
    echo "   3. Verifica que todos los problemas están solucionados"
    echo "   4. Sube a Google Play Console si es build de producción"
    echo ""
    echo "🔗 Enlaces útiles:"
    echo "   - EAS Dashboard: https://expo.dev/accounts/[tu-usuario]/projects/pathly-game"
    echo "   - Google Play Console: https://play.google.com/console"
    echo ""
else
    echo "❌ Error generando el build. Revisa los logs de EAS."
    exit 1
fi

echo "✅ Script completado." 