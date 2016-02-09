'use strict';

angular.module('bahmni.common.offline').service('offlineService', ['$rootScope', '$bahmniCookieStore', function ($rootScope, $bahmniCookieStore) {

    var offline = false;

    this.getAppPlatform = function () {
        return $bahmniCookieStore.get(Bahmni.Common.Constants.platform);
    };

    this.setAppPlatform = function (platform) {
        $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform, {path: '/', expires: 365});
    };

    this.isOfflineApp = function () {
        return this.isAndroidApp() || this.isChromeApp();
    };

    this.offline = function () {
        return offline;
    };

    this.isAndroidApp = function () {
        return this.getAppPlatform() === Bahmni.Common.Constants.platformType.android
    };

    this.isChromeApp = function () {
        return this.getAppPlatform() === Bahmni.Common.Constants.platformType.chromeApp
    };

    this.isChromeBrowser = function () {
        return this.getAppPlatform() === Bahmni.Common.Constants.platformType.chrome;
    };

    this.encrypt = function (value, encryptionType) {
        if (encryptionType === Bahmni.Common.Constants.encryptionType.SHA3) {
            return CryptoJS.SHA3(value);
        }
        return value;
    };

    this.setItem = function (key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    };

    this.getItem = function (key) {
        var value = localStorage.getItem(key);
        if (value) {
            return JSON.parse(value);
        }
        return value;
    };

    this.validateLoginInfo = function (loginInfo) {
        return (this.getItem(Bahmni.Common.Constants.LoginInformation)['username'] === loginInfo.username &&
        JSON.stringify(this.getItem(Bahmni.Common.Constants.LoginInformation)['password']) === JSON.stringify(CryptoJS.SHA3(loginInfo.password)));
    };

    Offline.options = {
        game: false,
        checkOnLoad: true,
        checks: {xhr: {url: Bahmni.Common.Constants.faviconUrl}}
    };

    Offline.on('up', function () {
        offline = false;
        $rootScope.$broadcast('offline', offline);
    });

    Offline.on('down', function () {
        offline = true;
        $rootScope.$broadcast('offline', offline);
    });
    var checkOfflineStatus = function () {
        if (Offline.state === 'up') {
            Offline.check();
        }
    };

    var init = function () {
        setInterval(checkOfflineStatus, 5000);
    };
    init();
    checkOfflineStatus();

}]);