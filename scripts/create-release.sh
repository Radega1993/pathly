#!/bin/bash

# 🚀 Pathly Release Script
# Uso: ./scripts/create-release.sh <version> <version_code>
# Ejemplo: ./scripts/create-release.sh 1.0.2 11

set -e  # Exit on any error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar argumentos
if [ $# -ne 2 ]; then
    print_error "Uso: $0 <version> <version_code>"
    print_error "Ejemplo: $0 1.0.2 11"
    exit 1
fi

VERSION=$1
VERSION_CODE=$2
RELEASE_DATE=$(date +%Y-%m-%d)

print_status "🚀 Iniciando release de Pathly v$VERSION (version code: $VERSION_CODE)"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "app.json" ]; then
    print_error "No se encontraron archivos de configuración. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# 1. Actualizar versiones
print_status "📝 Actualizando versiones..."

# Actualizar package.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" package.json
print_success "package.json actualizado"

# Actualizar app.json
sed -i "s/\"version\": \"[^\"]*\"/\"version\": \"$VERSION\"/" app.json
sed -i "s/\"versionCode\": [0-9]*/\"versionCode\": $VERSION_CODE/" app.json
print_success "app.json actualizado"

# Actualizar build.gradle
sed -i "s/versionCode [0-9]*/versionCode $VERSION_CODE/" android/app/build.gradle
sed -i "s/versionName \"[^\"]*\"/versionName \"$VERSION\"/" android/app/build.gradle
print_success "build.gradle actualizado"

# 2. Limpiar builds anteriores
print_status "🧹 Limpiando builds anteriores..."
cd android
rm -rf .gradle build app/build 2>/dev/null || true
cd ..
npm cache clean --force 2>/dev/null || true
print_success "Limpieza completada"

# 3. Instalar dependencias
print_status "📦 Instalando dependencias..."
npm install
print_success "Dependencias instaladas"

# 4. Generar AAB
print_status "🔨 Generando Android App Bundle..."
cd android
./gradlew bundleRelease
cd ..
print_success "AAB generado exitosamente"

# 5. Verificar version code
print_status "🔍 Verificando version code..."
VERSION_CHECK=$(grep -n "versionCode\|versionName" android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml)
print_success "Version code verificado:"
echo "$VERSION_CHECK"

# 6. Crear carpeta de release
print_status "📁 Creando carpeta de release..."
mkdir -p "releases/v$VERSION"
print_success "Carpeta creada: releases/v$VERSION"

# 7. Copiar AAB
print_status "📋 Copiando AAB..."
cp "android/app/build/outputs/bundle/release/app-release.aab" "releases/v$VERSION/Pathly-v$VERSION-release.aab"
AAB_SIZE=$(ls -lh "releases/v$VERSION/Pathly-v$VERSION-release.aab" | awk '{print $5}')
print_success "AAB copiado (tamaño: $AAB_SIZE)"

# 8. Generar APK (opcional)
read -p "¿Generar también APK para distribución directa? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "🔨 Generando APK..."
    cd android
    ./gradlew assembleRelease
    cd ..
    cp "android/app/build/outputs/apk/release/app-release.apk" "releases/v$VERSION/Pathly-v$VERSION-release.apk"
    APK_SIZE=$(ls -lh "releases/v$VERSION/Pathly-v$VERSION-release.apk" | awk '{print $5}')
    print_success "APK generado (tamaño: $APK_SIZE)"
fi

# 9. Crear release notes
print_status "📝 Creando release notes..."
cat > "releases/v$VERSION/RELEASE_NOTES.md" << EOF
# 🎮 Pathly v$VERSION - Release Notes

## 📦 Build Information
- **Version**: $VERSION
- **Version Code**: $VERSION_CODE
- **Build Date**: $RELEASE_DATE
- **Platform**: Android
- **Bundle Type**: Android App Bundle (AAB)
- **Bundle Size**: $AAB_SIZE
- **Architecture**: Multi-ABI (ARM64, ARM32, x86)

## 🔧 Changes in this Release
[Describir cambios aquí]

## 📱 Installation

### For Google Play Store
1. Sube el archivo \`Pathly-v$VERSION-release.aab\` a Google Play Console
2. El AAB será procesado automáticamente para generar APKs optimizados por dispositivo

### For Direct Distribution
1. Usa el archivo \`Pathly-v$VERSION-release.apk\` para distribución directa
2. Habilita "Instalar aplicaciones de fuentes desconocidas" en tu dispositivo Android
3. Instala el APK
4. ¡Disfruta jugando Pathly!

## 🔍 Technical Details
- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **Target SDK**: 35
- **Min SDK**: 24
- **Build Tools**: 35.0.0

## 🐛 Known Issues
- Ninguno reportado en esta versión

## 📞 Support
Si encuentras algún problema, por favor reporta el issue en el repositorio del proyecto.

---

**Pathly Game Team**  
*Puzzle your way to victory!* 🧩
EOF
print_success "Release notes creadas"

# 10. Mostrar resumen
print_success "🎉 Release v$VERSION creado exitosamente!"
echo
echo "📋 Resumen del release:"
echo "   • Versión: $VERSION"
echo "   • Version Code: $VERSION_CODE"
echo "   • AAB: releases/v$VERSION/Pathly-v$VERSION-release.aab ($AAB_SIZE)"
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   • APK: releases/v$VERSION/Pathly-v$VERSION-release.apk ($APK_SIZE)"
fi
echo "   • Release Notes: releases/v$VERSION/RELEASE_NOTES.md"
echo
print_warning "⚠️  Próximos pasos:"
echo "   1. Actualizar CHANGELOG.md con los cambios"
echo "   2. Hacer commit y push de los cambios"
echo "   3. Crear tag git: git tag -a v$VERSION -m \"Release version $VERSION\""
echo "   4. Subir AAB a Google Play Console"
echo
print_status "📚 Para más información, consulta RELEASE_GUIDE.md" 