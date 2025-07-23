import 'dotenv/config';

export default {
    expo: {
        name: "Pathly Game",
        slug: "pathly-game",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        userInterfaceStyle: "light",
        newArchEnabled: true,
        splash: {
            image: "./assets/splash-icon.png",
            resizeMode: "contain",
            backgroundColor: "#ffffff"
        },
        ios: {
            supportsTablet: true,
            bundleIdentifier: "com.pathly.game"
        },
        android: {
            package: "com.pathly.game",
            versionCode: 2,
            adaptiveIcon: {
                foregroundImage: "./assets/adaptive-icon.png",
                backgroundColor: "#3B82F6"
            },
            edgeToEdgeEnabled: true,
            permissions: [
                "android.permission.INTERNET",
                "android.permission.ACCESS_NETWORK_STATE"
            ]
        },
        web: {
            favicon: "./assets/favicon.png"
        },
        extra: {
            // Variables de entorno de Firebase
            firebaseApiKey: process.env.FIREBASE_API_KEY,
            firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
            firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
            firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            firebaseAppId: process.env.FIREBASE_APP_ID,
            firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
            // EAS Project ID
            eas: {
                projectId: "0271abae-4b26-4a4b-a48a-f9e5c4f8fe90"
            }
        },
        // plugins: [
        //     [
        //         "expo-ads-admob",
        //         {
        //             "androidAppId": "ca-app-pub-4553067801626383~6760188699"
        //         }
        //     ]
        // ],
    },
}; 