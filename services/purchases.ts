import { authService } from './auth';
import { Platform } from 'react-native';

// Tipos mock para evitar errores de TypeScript
export type PurchasesOffering = any;
export type PurchasesPackage = any;
export type CustomerInfo = any;

// Configuración de RevenueCat (mock)
const REVENUECAT_API_KEYS = {
    ANDROID: 'goog_xxxxxxxxxxxxxxxxxxxxxx', // Reemplazar con tu Android API Key
    IOS: 'appl_xxxxxxxxxxxxxxxxxxxxxx', // Reemplazar con tu iOS API Key
};

// Identificadores de productos
const PRODUCT_IDS = {
    PREMIUM_MONTHLY: 'pathly_premium_monthly',
    PREMIUM_LIFETIME: 'pathly_premium_lifetime',
};

// Identificadores de entitelments
const ENTITLEMENT_IDS = {
    PREMIUM: 'premium',
};

class PurchasesService {
    private static instance: PurchasesService;
    private isInitialized = false;
    private currentOffering: PurchasesOffering | null = null;
    private customerInfo: CustomerInfo | null = null;

    private constructor() { }

    static getInstance(): PurchasesService {
        if (!PurchasesService.instance) {
            PurchasesService.instance = new PurchasesService();
        }
        return PurchasesService.instance;
    }

    // Inicializar RevenueCat (mock mode)
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        try {
            console.log('🛒 Initializing RevenueCat (Mock Mode)...');
            console.log('⚠️ RevenueCat not configured yet. Using mock mode.');

            // Simular customer info
            this.customerInfo = {
                entitlements: {
                    active: {},
                    all: {}
                }
            };

            this.isInitialized = true;
            console.log('✅ RevenueCat mock mode initialized');
        } catch (error) {
            console.error('❌ Error initializing RevenueCat:', error);
            this.isInitialized = true;
        }
    }

    // Cargar offerings disponibles (mock)
    private async loadOfferings(): Promise<void> {
        try {
            console.log('⚠️ Offerings loading disabled - RevenueCat not configured');
        } catch (error) {
            console.error('Error loading offerings:', error);
        }
    }

    // Manejar actualizaciones de customer info (mock)
    private async handleCustomerInfoUpdate(customerInfo: CustomerInfo): Promise<void> {
        try {
            const isPremium = customerInfo.entitlements.active[ENTITLEMENT_IDS.PREMIUM] !== undefined;

            // Actualizar estado premium en Firestore
            if (authService.getCurrentUser()) {
                await authService.updatePremiumStatus(isPremium);
            }

            console.log('✅ Premium status updated:', isPremium);
        } catch (error) {
            console.error('Error updating premium status:', error);
        }
    }

    // Obtener offerings disponibles (mock)
    async getOfferings(): Promise<PurchasesOffering | null> {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return this.currentOffering;
    }

    // Obtener paquetes disponibles (mock)
    async getPackages(): Promise<PurchasesPackage[]> {
        // Retornar paquetes mock para mostrar en la UI
        return [
            {
                identifier: 'monthly',
                product: {
                    priceString: '€1.99/mes',
                    description: 'Suscripción mensual'
                }
            },
            {
                identifier: 'lifetime',
                product: {
                    priceString: '€9.99',
                    description: 'Acceso de por vida'
                }
            }
        ];
    }

    // Comprar un paquete (mock)
    async purchasePackage(packageToPurchase: PurchasesPackage): Promise<CustomerInfo> {
        try {
            console.log('🛒 Mock purchase for package:', packageToPurchase.identifier);

            // Simular compra exitosa
            const mockCustomerInfo = {
                entitlements: {
                    active: {
                        [ENTITLEMENT_IDS.PREMIUM]: {
                            identifier: ENTITLEMENT_IDS.PREMIUM,
                            isActive: true
                        }
                    },
                    all: {}
                }
            };

            console.log('✅ Mock purchase successful');
            return mockCustomerInfo;
        } catch (error: any) {
            console.error('❌ Mock purchase failed:', error);
            throw new Error('Mock purchase failed');
        }
    }

    // Restaurar compras (mock)
    async restorePurchases(): Promise<CustomerInfo> {
        try {
            console.log('🔄 Mock restore purchases...');

            const mockCustomerInfo = {
                entitlements: {
                    active: {},
                    all: {}
                }
            };

            console.log('✅ Mock purchases restored');
            return mockCustomerInfo;
        } catch (error) {
            console.error('❌ Error restoring purchases:', error);
            throw error;
        }
    }

    // Verificar si el usuario tiene acceso premium (mock)
    async isPremium(): Promise<boolean> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // En modo mock, siempre retornar false
            return false;
        } catch (error) {
            console.error('Error checking premium status:', error);
            return false;
        }
    }

    // Obtener información del cliente (mock)
    async getCustomerInfo(): Promise<CustomerInfo | null> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            return this.customerInfo;
        } catch (error) {
            console.error('Error getting customer info:', error);
            return null;
        }
    }

    // Configurar user ID cuando el usuario se autentica (mock)
    async setUserID(userID: string): Promise<void> {
        try {
            console.log('✅ Mock user ID set in RevenueCat:', userID);
        } catch (error) {
            console.error('Error setting user ID:', error);
        }
    }

    // Obtener precio formateado de un paquete
    getFormattedPrice(packageToPurchase: PurchasesPackage): string {
        return packageToPurchase.product.priceString;
    }

    // Obtener descripción de un paquete
    getPackageDescription(packageToPurchase: PurchasesPackage): string {
        const identifier = packageToPurchase.identifier;

        switch (identifier) {
            case 'monthly':
                return 'Suscripción mensual - Sin anuncios y pistas ilimitadas';
            case 'lifetime':
                return 'Acceso de por vida - Sin anuncios y pistas ilimitadas';
            default:
                return packageToPurchase.product.description;
        }
    }

    // Limpiar recursos
    cleanup(): void {
        this.isInitialized = false;
        this.currentOffering = null;
        this.customerInfo = null;
    }
}

// Exportar instancia singleton
export const purchasesService = PurchasesService.getInstance();

// Funciones de conveniencia
export const initializePurchases = (): Promise<void> => purchasesService.initialize();
export const getOfferings = (): Promise<PurchasesOffering | null> => purchasesService.getOfferings();
export const getPackages = (): Promise<PurchasesPackage[]> => purchasesService.getPackages();
export const purchasePackage = (packageToPurchase: PurchasesPackage): Promise<CustomerInfo> => purchasesService.purchasePackage(packageToPurchase);
export const restorePurchases = (): Promise<CustomerInfo> => purchasesService.restorePurchases();
export const isPremium = (): Promise<boolean> => purchasesService.isPremium();
export const getCustomerInfo = (): Promise<CustomerInfo | null> => purchasesService.getCustomerInfo();
export const setUserID = (userID: string): Promise<void> => purchasesService.setUserID(userID);
export const getFormattedPrice = (packageToPurchase: PurchasesPackage): string => purchasesService.getFormattedPrice(packageToPurchase);
export const getPackageDescription = (packageToPurchase: PurchasesPackage): string => purchasesService.getPackageDescription(packageToPurchase);

export default purchasesService; 