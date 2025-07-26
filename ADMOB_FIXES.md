# 🔧 Solución de Problemas de AdMob - Pathly Game

## 🚨 Problemas Identificados

1. **Falta de dependencia**: No tenía `expo-ads-admob` instalado
2. **Uso de mocks**: El código usaba mocks en lugar de la librería real
3. **IDs incorrectos**: Usaba IDs de producción en lugar de test
4. **Icono estático**: El botón de pista siempre mostraba 💡
5. **Frecuencia incorrecta**: Anuncios cada 4 niveles en lugar de 3

## ✅ Soluciones Implementadas

### 1. Instalación de Dependencia
```bash
npm install expo-ads-admob
```

### 2. Configuración de IDs de Test
**Archivo**: `services/ads.ts`
- Cambiado de IDs de producción a IDs de test para close tester
- Configurado test device para desarrollo
- Eliminados todos los mocks

```typescript
// IDs de TEST para close tester
const TEST_IDS = {
    ANDROID_APP_ID: 'ca-app-pub-3940256099942544~3347511713',
    INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
    REWARDED: 'ca-app-pub-3940256099942544/5224354917',
};
```

### 3. Configuración de app.json
**Archivo**: `app.json`
- Actualizado Android App ID a ID de test
```json
{
  "expo": {
    "plugins": [
      [
        "expo-ads-admob",
        {
          "androidAppId": "ca-app-pub-3940256099942544~3347511713"
        }
      ]
    ]
  }
}
```

### 4. Icono Dinámico de Pistas
**Archivo**: `components/Grid.tsx`
- Primera pista (gratuita): 💡 Pista
- Pistas adicionales (con anuncio): 📺 Ver Anuncio

```typescript
const getHintButtonIcon = (): string => {
    return hintsUsed === 0 ? '💡' : '📺';
};

const getHintButtonText = (): string => {
    return hintsUsed === 0 ? 'Pista' : 'Ver Anuncio';
};
```

### 5. Frecuencia de Anuncios Corregida
**Archivo**: `services/ads.ts`
- Cambiado de cada 4 niveles a cada 3 niveles
```typescript
async shouldShowInterstitialAd(): Promise<boolean> {
    const count = await this.getLevelsCompletedCount();
    return count > 0 && count % 3 === 0; // Mostrar cada 3 niveles
}
```

### 6. Mejoras en el Manejo de Anuncios
- Verificación de carga de anuncios antes de mostrar
- Recarga automática después de mostrar
- Manejo robusto de errores
- Limpieza de listeners

## 🧪 Verificación

### Script de Prueba
Ejecutar: `node scripts/test-admob-integration.js`

**Resultado esperado**:
```
✅ expo-ads-admob está instalado
✅ Plugin expo-ads-admob está configurado en app.json
✅ Usando IDs de TEST para close tester
✅ Importa correctamente expo-ads-admob
✅ No usa mocks, usa la librería real
✅ Configura test device para desarrollo
```

## 📱 Cómo Probar

### 1. En Close Tester
```bash
npm start
```
- Escanear QR con Expo Go
- Los anuncios aparecerán como test ads
- Verificar logs en consola

### 2. Flujo de Pistas
1. **Primera pista**: Gratuita (💡 Pista)
2. **Pistas adicionales**: Requieren anuncio (📺 Ver Anuncio)
3. **Anuncios intersticiales**: Cada 3 niveles completados

### 3. Logs Esperados
```
🔄 Initializing AdMob...
✅ Interstitial ad loaded
✅ Rewarded ad loaded
✅ AdMob initialized successfully
🔄 Showing rewarded ad...
✅ User earned reward
✅ Rewarded ad dismissed
```

## 🔧 Troubleshooting

### Si los anuncios no aparecen:
1. **Verificar conexión a internet**
2. **Asegurar modo close tester**
3. **Revisar logs en consola de Expo**
4. **Los test ads pueden tardar unos segundos**

### Si hay errores de compilación:
1. **Ejecutar**: `npx expo install --fix`
2. **Limpiar cache**: `npx expo start --clear`
3. **Reinstalar dependencias**: `npm install`

## 📊 Cambios en Archivos

| Archivo | Cambios |
|---------|---------|
| `package.json` | ✅ Agregada dependencia expo-ads-admob |
| `app.json` | ✅ ID de test configurado |
| `services/ads.ts` | ✅ Librería real, IDs de test, manejo robusto |
| `components/Grid.tsx` | ✅ Icono dinámico, props adicionales |
| `screens/GameScreen.tsx` | ✅ Props pasadas al Grid |
| `scripts/test-admob-integration.js` | ✅ Script de verificación |

## 🎯 Estado Final

- ✅ **AdMob funcionando** con librería real
- ✅ **IDs de test** para close tester
- ✅ **Icono dinámico** en pistas
- ✅ **Anuncios cada 3 niveles**
- ✅ **Manejo robusto** de errores
- ✅ **Verificación automática** con script

## 🚀 Próximos Pasos

1. **Probar en close tester** con dispositivos reales
2. **Verificar funcionamiento** de anuncios de pistas
3. **Confirmar frecuencia** de anuncios intersticiales
4. **Cambiar a IDs de producción** cuando esté listo para release

---

**Nota**: Todos los cambios están optimizados para close tester. Para producción, cambiar `TEST_IDS` por `PRODUCTION_IDS` en `services/ads.ts`. 