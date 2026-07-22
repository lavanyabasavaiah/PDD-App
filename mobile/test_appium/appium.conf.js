// WebdriverIO and Appium Configuration for VitalTrack Flutter App
exports.config = {
    runner: 'local',
    port: 4723,
    path: '/wd/hub',
    specs: [
        './test_specs/**/*.js'
    ],
    exclude: [],
    maxInstances: 1,
    capabilities: [{
        // Default capabilities for Android Testing
        platformName: 'Android',
        'appium:deviceName': 'Android Emulator',
        'appium:automationName': 'Flutter', // Use Flutter Driver extension integration
        'appium:app': '../build/app/outputs/flutter-apk/app-debug.apk',
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 30000,
        'appium:noReset': false
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 10000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: ['appium'],
    framework: 'mocha',
    reporters: ['spec'],
    mochaOpts: {
        ui: 'bdd',
        timeout: 60000
    }
};
