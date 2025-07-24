#!/bin/bash

# 🔍 Pathly Release Readiness Checker
# Uso: ./scripts/verify-release-readiness.sh

set -e

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
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

echo "🔍 Verificando preparación para release de Pathly..."
echo "=================================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ] || [ ! -f "app.json" ]; then
    print_error "No se encontraron archivos de configuración. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# 1. Verificar herramientas necesarias
print_status "Verificando herramientas necesarias..."

# Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js: $NODE_VERSION"
else
    print_error "Node.js no está instalado"
fi

# npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm: $NPM_VERSION"
else
    print_error "npm no está instalado"
fi

# Expo CLI
if command -v expo &> /dev/null; then
    EXPO_VERSION=$(expo --version)
    print_success "Expo CLI: $EXPO_VERSION"
else
    print_warning "Expo CLI no está instalado globalmente (se puede usar npx)"
fi

# Git
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git: $GIT_VERSION"
else
    print_error "Git no está instalado"
fi

# Android SDK
if [ -n "$ANDROID_HOME" ]; then
    print_success "ANDROID_HOME configurado: $ANDROID_HOME"
else
    print_warning "ANDROID_HOME no está configurado"
fi

# 2. Verificar archivos de configuración
print_status "Verificando archivos de configuración..."

# package.json
if [ -f "package.json" ]; then
    PACKAGE_VERSION=$(grep '"version"' package.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
    print_success "package.json encontrado (versión: $PACKAGE_VERSION)"
else
    print_error "package.json no encontrado"
fi

# app.json
if [ -f "app.json" ]; then
    APP_VERSION=$(grep '"version"' app.json | sed 's/.*"version": "\([^"]*\)".*/\1/')
    VERSION_CODE=$(grep '"versionCode"' app.json | sed 's/.*"versionCode": \([0-9]*\).*/\1/')
    print_success "app.json encontrado (versión: $APP_VERSION, version code: $VERSION_CODE)"
else
    print_error "app.json no encontrado"
fi

# build.gradle
if [ -f "android/app/build.gradle" ]; then
    GRADLE_VERSION_CODE=$(grep 'versionCode' android/app/build.gradle | sed 's/.*versionCode \([0-9]*\).*/\1/')
    GRADLE_VERSION_NAME=$(grep 'versionName' android/app/build.gradle | sed 's/.*versionName "\([^"]*\)".*/\1/')
    print_success "build.gradle encontrado (version code: $GRADLE_VERSION_CODE, version name: $GRADLE_VERSION_NAME)"
else
    print_error "android/app/build.gradle no encontrado"
fi

# 3. Verificar consistencia de versiones
print_status "Verificando consistencia de versiones..."

if [ "$PACKAGE_VERSION" = "$APP_VERSION" ] && [ "$APP_VERSION" = "$GRADLE_VERSION_NAME" ]; then
    print_success "Versiones consistentes: $PACKAGE_VERSION"
else
    print_error "Versiones inconsistentes:"
    echo "  • package.json: $PACKAGE_VERSION"
    echo "  • app.json: $APP_VERSION"
    echo "  • build.gradle: $GRADLE_VERSION_NAME"
fi

if [ "$VERSION_CODE" = "$GRADLE_VERSION_CODE" ]; then
    print_success "Version codes consistentes: $VERSION_CODE"
else
    print_error "Version codes inconsistentes:"
    echo "  • app.json: $VERSION_CODE"
    echo "  • build.gradle: $GRADLE_VERSION_CODE"
fi

# 4. Verificar variables de entorno
print_status "Verificando variables de entorno..."

if [ -f ".env" ]; then
    print_success "Archivo .env encontrado"
    
    # Verificar variables críticas
    if grep -q "FIREBASE_API_KEY" .env; then
        print_success "FIREBASE_API_KEY configurada"
    else
        print_warning "FIREBASE_API_KEY no encontrada"
    fi
    
    if grep -q "ADMOB_ANDROID_APP_ID" .env; then
        print_success "ADMOB_ANDROID_APP_ID configurada"
    else
        print_warning "ADMOB_ANDROID_APP_ID no encontrada"
    fi
else
    print_warning "Archivo .env no encontrado"
fi

# 5. Verificar dependencias
print_status "Verificando dependencias..."

if [ -d "node_modules" ]; then
    print_success "node_modules encontrado"
else
    print_warning "node_modules no encontrado (ejecuta 'npm install')"
fi

# 6. Verificar estado de Git
print_status "Verificando estado de Git..."

if [ -d ".git" ]; then
    # Verificar si hay cambios sin commit
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Hay cambios sin commit:"
        git status --short
    else
        print_success "No hay cambios pendientes"
    fi
    
    # Verificar si estamos en main
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" = "main" ]; then
        print_success "Estás en la rama main"
    else
        print_warning "Estás en la rama: $CURRENT_BRANCH"
    fi
else
    print_error "No es un repositorio Git"
fi

# 7. Verificar estructura de Android
print_status "Verificando estructura de Android..."

if [ -d "android" ]; then
    print_success "Directorio android encontrado"
    
    if [ -f "android/gradlew" ]; then
        print_success "gradlew encontrado"
    else
        print_error "gradlew no encontrado"
    fi
    
    if [ -f "android/app/build.gradle" ]; then
        print_success "build.gradle encontrado"
    else
        print_error "build.gradle no encontrado"
    fi
else
    print_error "Directorio android no encontrado"
fi

# 8. Verificar archivos de assets
print_status "Verificando archivos de assets..."

if [ -f "assets/icon.png" ]; then
    print_success "Icono encontrado"
else
    print_warning "Icono no encontrado"
fi

if [ -f "assets/splash-icon.png" ]; then
    print_success "Splash icon encontrado"
else
    print_warning "Splash icon no encontrado"
fi

# 9. Resumen
echo
echo "=================================================="
print_status "Resumen de verificación:"

# Contar errores y warnings
ERRORS=$(grep -c "\[✗\]" <<< "$(cat /dev/stdin)" || echo "0")
WARNINGS=$(grep -c "\[⚠\]" <<< "$(cat /dev/stdin)" || echo "0")

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    print_success "✅ Proyecto listo para release!"
    echo
    print_status "Próximos pasos:"
    echo "1. Ejecutar: ./scripts/create-release.sh <version> <version_code>"
    echo "2. Actualizar CHANGELOG.md"
    echo "3. Hacer commit y push"
    echo "4. Crear tag git"
    echo "5. Subir a Google Play Console"
elif [ "$ERRORS" -eq 0 ]; then
    print_warning "⚠️  Proyecto casi listo ($WARNINGS warnings)"
    echo
    print_status "Revisa los warnings antes de continuar"
else
    print_error "❌ Proyecto no está listo ($ERRORS errores, $WARNINGS warnings)"
    echo
    print_status "Corrige los errores antes de continuar"
fi

echo
print_status "Para más información, consulta RELEASE_GUIDE.md" 