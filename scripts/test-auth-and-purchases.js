const { authService } = require('../services/auth');
const { purchasesService } = require('../services/purchases');

async function testAuthAndPurchases() {
    console.log('🧪 Testing Auth and Purchases...\n');

    try {
        // 1. Test Auth Service
        console.log('1️⃣ Testing Auth Service...');

        // Test anonymous login
        console.log('   Testing anonymous login...');
        const user = await authService.signInAnonymously();
        console.log('   ✅ Anonymous login successful:', user.displayName);

        // Test premium status
        console.log('   Testing premium status...');
        const isPremium = authService.isUserPremium();
        console.log('   ✅ Premium status:', isPremium);

        // 2. Test Purchases Service
        console.log('\n2️⃣ Testing Purchases Service...');

        // Initialize purchases
        console.log('   Initializing purchases...');
        await purchasesService.initialize();
        console.log('   ✅ Purchases initialized');

        // Test offerings
        console.log('   Testing offerings...');
        const offerings = await purchasesService.getOfferings();
        if (offerings) {
            console.log('   ✅ Offerings loaded:', offerings.identifier);

            // Test packages
            const packages = await purchasesService.getPackages();
            console.log('   ✅ Packages loaded:', packages.length);

            packages.forEach(pkg => {
                console.log(`      - ${pkg.identifier}: ${purchasesService.getFormattedPrice(pkg)}`);
            });
        } else {
            console.log('   ⚠️ No offerings available (normal in development)');
        }

        // Test customer info
        console.log('   Testing customer info...');
        const customerInfo = await purchasesService.getCustomerInfo();
        if (customerInfo) {
            console.log('   ✅ Customer info loaded');
            console.log('      - Entitlements:', Object.keys(customerInfo.entitlements.active));
        } else {
            console.log('   ⚠️ No customer info available');
        }

        // 3. Test Integration
        console.log('\n3️⃣ Testing Integration...');

        // Test user ID sync
        console.log('   Testing user ID sync...');
        await purchasesService.setUserID(user.uid);
        console.log('   ✅ User ID synced to RevenueCat');

        // Test premium status from purchases
        console.log('   Testing premium status from purchases...');
        const premiumFromPurchases = await purchasesService.isPremium();
        console.log('   ✅ Premium from purchases:', premiumFromPurchases);

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);

        if (error.message.includes('Google Auth not initialized')) {
            console.log('💡 Tip: Google Auth requires configuration. See GOOGLE_AUTH_SETUP.md');
        }

        if (error.message.includes('RevenueCat')) {
            console.log('💡 Tip: RevenueCat requires API keys. See GOOGLE_AUTH_SETUP.md');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    testAuthAndPurchases();
}

module.exports = { testAuthAndPurchases }; 