# 🎨 Iconos de Pathly para Google Play

## 📱 Iconos Configurados

### Google Play Store
- **playstore-icon.png** (512x512) - Icono principal para la store
- **icon.png** (1024x1024) - Icono de la aplicación
- **adaptive-icon.png** (1024x1024) - Icono adaptativo para Android
- **splash-icon.png** (1242x2436) - Pantalla de carga

### Web
- **favicon.png** (32x32) - Favicon para versión web

## 🔧 Configuración

Los iconos están configurados en `app.json`:

```json
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
```

## 📋 Requisitos Google Play

- ✅ Icono principal: 512x512 px
- ✅ Icono adaptativo: 1024x1024 px
- ✅ Pantalla de carga: 1242x2436 px
- ✅ Formato: PNG con transparencia

## 🚀 Próximos Pasos

1. Verificar que todos los iconos estén en el formato correcto
2. Ejecutar: `expo prebuild`
3. Ejecutar: `eas build --platform android`
4. Subir a Google Play Console

## 🎯 Notas

- Los iconos por defecto de Expo han sido eliminados
- Se usan las imágenes personalizadas de Pathly
- El color de fondo del icono adaptativo es #3B82F6 (azul Pathly)
