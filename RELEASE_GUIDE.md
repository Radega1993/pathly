# 🚀 Pathly - Guía de Release

Esta guía detalla el proceso completo para crear y lanzar nuevas versiones de Pathly Game.

## 📋 Prerrequisitos

### Herramientas Necesarias
- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Android Studio** con SDK configurado
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git** configurado

### Variables de Entorno
Asegúrate de tener configurado el archivo `.env` con todas las variables necesarias:
```bash
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# AdMob
ADMOB_ANDROID_APP_ID=ca-app-pub-4553067801626383~6760188699
ADMOB_INTERSTITIAL_ID=your_interstitial_id
ADMOB_REWARDED_ID=your_rewarded_id
ADMOB_DEBUG_MODE=true
ADMOB_TIMEOUT=5000
```

## 🔄 Proceso de Release

### 1. Preparación del Entorno

```bash
# Clonar el repositorio (si no lo tienes)
git clone https://github.com/Radega1993/pathly.git
cd pathly

# Instalar dependencias
npm install

# Verificar que todo funciona
npx expo --version
```

### 2. Actualizar Versiones

#### A. Actualizar package.json
```bash
# Editar package.json y cambiar la versión
# Ejemplo: de "1.0.1" a "1.0.2"
```

#### B. Actualizar app.json
```bash
# Editar app.json y cambiar:
# - "version": "1.0.1" → "1.0.2"
# - "versionCode": 10 → 11 (incrementar siempre)
```

#### C. Actualizar build.gradle
```bash
# Editar android/app/build.gradle y cambiar:
# - versionCode 10 → 11
# - versionName "1.0.1" → "1.0.2"
```

### 3. Generar el Build

#### A. Limpiar Builds Anteriores
```bash
# Limpiar cache de Gradle
cd android
rm -rf .gradle build app/build
cd ..

# Limpiar cache de npm
npm cache clean --force
```

#### B. Generar Android App Bundle (AAB)
```bash
# Generar AAB para Google Play Store
cd android
./gradlew bundleRelease
cd ..

# El AAB se generará en:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### C. Verificar Version Code
```bash
# Verificar que el version code se aplicó correctamente
grep -n "versionCode\|versionName" android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml
```

### 4. Crear Release

#### A. Crear Carpeta de Release
```bash
# Crear carpeta para la nueva versión
mkdir -p releases/v1.0.2

# Copiar AAB
cp android/app/build/outputs/bundle/release/app-release.aab releases/v1.0.2/Pathly-v1.0.2-release.aab
```

#### B. Generar APK (Opcional - para distribución directa)
```bash
# Generar APK
cd android
./gradlew assembleRelease
cd ..

# Copiar APK
cp android/app/build/outputs/apk/release/app-release.apk releases/v1.0.2/Pathly-v1.0.2-release.apk
```

### 5. Actualizar Documentación

#### A. Actualizar CHANGELOG.md
```bash
# Editar CHANGELOG.md y añadir:
## [1.0.2] - 2024-12-XX

### ✨ Added
- Nueva funcionalidad X
- Mejora Y

### 🔧 Fixed
- Bug Z corregido

### 📦 Dependencies
- Actualizada dependencia X
```

#### B. Crear Release Notes
```bash
# Crear archivo de notas de release
cat > releases/v1.0.2/RELEASE_NOTES.md << 'EOF'
# 🎮 Pathly v1.0.2 - Release Notes

## 📦 Build Information
- **Version**: 1.0.2
- **Version Code**: 11
- **Build Date**: 2024-12-XX
- **Platform**: Android
- **Bundle Type**: Android App Bundle (AAB)
- **Bundle Size**: ~XX MB
- **Architecture**: Multi-ABI (ARM64, ARM32, x86)

## 🔧 Changes in this Release
[Describir cambios]

## 📱 Installation
### For Google Play Store
1. Sube el archivo `Pathly-v1.0.2-release.aab` a Google Play Console
2. El AAB será procesado automáticamente para generar APKs optimizados por dispositivo

### For Direct Distribution
1. Usa el archivo `Pathly-v1.0.2-release.apk` para distribución directa
2. Habilita "Instalar aplicaciones de fuentes desconocidas" en tu dispositivo Android
3. Instala el APK

## 🔍 Technical Details
- **React Native**: 0.79.5
- **Expo**: ~53.0.20
- **Target SDK**: 35
- **Min SDK**: 24
- **Build Tools**: 35.0.0
EOF
```

### 6. Git y Tags

#### A. Commit de Cambios
```bash
# Añadir archivos modificados
git add package.json app.json android/app/build.gradle CHANGELOG.md releases/

# Commit
git commit -m "release: version 1.0.2 - [descripción de cambios]"

# Push
git push origin main
```

#### B. Crear Tag
```bash
# Crear tag
git tag -a v1.0.2 -m "Release version 1.0.2"

# Push tag
git push origin main --tags
```

### 7. Subir a Google Play Console

#### A. Preparar Release
1. Ir a [Google Play Console](https://play.google.com/console)
2. Seleccionar la app "Pathly Game"
3. Ir a "Production" → "Create new release"

#### B. Subir AAB
1. Arrastrar el archivo `Pathly-v1.0.2-release.aab` al área de upload
2. Verificar que no hay errores de version code
3. Añadir notas de release
4. Revisar y publicar

## 🐛 Solución de Problemas

### Error: "Version code X has already been used"
```bash
# Solución: Incrementar version code
# 1. Editar app.json: "versionCode": X+1
# 2. Editar android/app/build.gradle: versionCode X+1
# 3. Limpiar y regenerar build
cd android
rm -rf .gradle build app/build
./gradlew bundleRelease
cd ..
```

### Error: "Build failed"
```bash
# Limpiar completamente
cd android
./gradlew clean
rm -rf .gradle build app/build
cd ..
npm cache clean --force
npm install
cd android
./gradlew bundleRelease
cd ..
```

### Error: "Expo CLI not found"
```bash
# Instalar Expo CLI
npm install -g @expo/cli

# O usar npx
npx expo --version
```

## 📊 Verificación de Build

### Verificar Version Code
```bash
# Verificar en AndroidManifest.xml
grep -n "versionCode\|versionName" android/app/build/intermediates/merged_manifests/release/processReleaseManifest/AndroidManifest.xml

# Verificar en metadata
cat android/app/build/intermediates/merged_manifests/release/processReleaseManifest/output-metadata.json
```

### Verificar Tamaño del AAB
```bash
# Verificar tamaño
ls -lh android/app/build/outputs/bundle/release/app-release.aab
ls -lh releases/v1.0.2/Pathly-v1.0.2-release.aab
```

## 🔄 Checklist de Release

- [ ] Versiones actualizadas en package.json, app.json y build.gradle
- [ ] Version code incrementado
- [ ] Build generado exitosamente
- [ ] Version code verificado en AndroidManifest.xml
- [ ] AAB copiado a carpeta de releases
- [ ] CHANGELOG.md actualizado
- [ ] RELEASE_NOTES.md creado
- [ ] Git commit y push realizado
- [ ] Tag creado y subido
- [ ] AAB subido a Google Play Console
- [ ] Release publicado en Google Play Console

## 📝 Notas Importantes

1. **Version Code**: Siempre debe incrementarse, nunca puede repetirse
2. **Version Name**: Puede ser la misma que versiones anteriores
3. **AAB vs APK**: Usar AAB para Google Play Store, APK para distribución directa
4. **Testing**: Siempre probar el build antes de publicar
5. **Backup**: Mantener copias de seguridad de releases anteriores

## 🆘 Comandos de Emergencia

### Rollback de Release
```bash
# Si necesitas hacer rollback
git checkout v1.0.1
git checkout -b hotfix/rollback-1.0.2
# Hacer cambios necesarios
git commit -m "hotfix: rollback to v1.0.1"
git push origin hotfix/rollback-1.0.2
```

### Limpieza Completa
```bash
# Limpieza completa del proyecto
rm -rf node_modules
rm -rf android/.gradle android/build android/app/build
npm install
cd android
./gradlew clean
cd ..
```

---

**Pathly Game Team**  
*Puzzle your way to victory!* 🧩 