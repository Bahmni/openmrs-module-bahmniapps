'use strict';

angular.module('bahmni.offline').service('offlineService', ['$rootScope','$bahmniCookieStore', function ($rootScope, $bahmniCookieStore) {
    var offline = false;

    var setPlatformCookie = function () {
        var platform = Bahmni.Common.Constants.platformType.chrome;
        if (window.navigator.userAgent.match(/Android/i)) {
            platform = Bahmni.Common.Constants.platformType.android;
        }
        else if ($rootScope.loginDevice) {
            platform = Bahmni.Common.Constants.platformType.chromeApp;
        }
        $bahmniCookieStore.put(Bahmni.Common.Constants.platform, platform, {path: '/', expires: 365});
    };

    this.getAppPlatform = function () {
        return $bahmniCookieStore.get(Bahmni.Common.Constants.platform);
    };

    this.isOfflineApp = function () {
        return this.getAppPlatform() !== Bahmni.Common.Constants.platformType.chrome;
    };

    this.offline = function() {
        return offline;
    };

    Offline.options = {
        game: false,
        checkOnLoad: true
    };

    Offline.on('up', function () {
        console.log("Internet is up.");
        offline = false;
        $rootScope.$broadcast('offline', offline);
    });
    Offline.on('down', function () {
        console.log("Internet is down.");
        offline = true;
        $rootScope.$broadcast('offline', offline);
    });
    var checkOfflineStatus = function () {
        if (Offline.state === 'up') {
            Offline.check();
        }
    };

    var init = function() {
        setPlatformCookie();
        setInterval(checkOfflineStatus, 5000);
    };
    init();

}]);