import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ⚠️ IMPORTANTE: Reemplaza esta configuración con tus credenciales reales de Firebase
// Puedes obtenerlas desde la consola de Firebase: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "tu-api-key-aqui",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "tu-app-id"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);

export default app;

/*
📋 Pasos para configurar Firebase:

1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "Project Settings" (⚙️ icono de engranaje)
4. En la pestaña "General", desplázate hacia abajo hasta "Your apps"
5. Haz clic en "Add app" y selecciona "Web"
6. Registra tu app con un nombre (ej: "Pathly Web")
7. Copia la configuración que aparece
8. Reemplaza la configuración de arriba con tus datos reales

🔐 Reglas de seguridad recomendadas para Firestore:

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura de niveles a todos los usuarios
    match /levels/{levelId} {
      allow read: if true;
      allow write: if false; // Solo lectura, no escritura
    }
  }
}
*/ 