'use strict';

describe('offlineService', function () {
    var offlineServiceInjected, bahmniCookieStore, rootScope;
    beforeEach(module('bahmni.common.offline'));

    beforeEach(function () {
        module(function ($provide) {
            bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get', 'remove', 'put']);
            $provide.value('$bahmniCookieStore', bahmniCookieStore);
        });
        inject(function ($rootScope, offlineService) {
            offlineServiceInjected = offlineService;
            rootScope = $rootScope;
        })
    });

    describe("getAppPlatform", function () {
        it('should fetch the App Platform', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            var appPlatform = offlineServiceInjected.getAppPlatform();

            expect(appPlatform).toEqual("chrome");
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
            expect(bahmniCookieStore.get.calls.count()).toBe(1);
        });
    });
    describe("setAppPlatform", function () {
        it('should set the App Platform', function () {
            bahmniCookieStore.put.and.callFake(function () {
                return undefined;
            });

            offlineServiceInjected.setAppPlatform(Bahmni.Common.Constants.platformType.android);

            expect(bahmniCookieStore.put).toHaveBeenCalledWith(Bahmni.Common.Constants.platform, Bahmni.Common.Constants.platformType.android, {
                path: '/',
                expires: 365
            });
            expect(bahmniCookieStore.put.calls.count()).toBe(1);
        });
    });

    describe("isOfflineApp", function () {
        it('should return false if platformType is chrome browser', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            expect(offlineServiceInjected.isOfflineApp()).toBeFalsy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });

        it('should return true if platformType is not chrome browser', function () {
            bahmniCookieStore.put.and.callFake(function () {
                return undefined;
            });

            bahmniCookieStore.get.and.callFake(function () {
                return "android";
            });

            expect(offlineServiceInjected.isOfflineApp()).toBeTruthy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });

    });
    describe("isAndroidApp", function () {
        it('should return true if platformType is android', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "android";
            });

            expect(offlineServiceInjected.isAndroidApp()).toBeTruthy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);

        });
        it('should return false if platformType is not android', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            expect(offlineServiceInjected.isAndroidApp()).toBeFalsy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);

        });
    });

    describe("isChromeApp", function () {
        it('should return true if platformType is chromeApp', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome-app";
            });

            expect(offlineServiceInjected.isChromeApp()).toBeTruthy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);

        });
        it('should return false if platformType is not chromeApp', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            expect(offlineServiceInjected.isChromeApp()).toBeFalsy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
    });

    describe("isChromeBrowser", function () {
        it('should return true if platformType is chrome', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            expect(offlineServiceInjected.isChromeBrowser()).toBeTruthy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
        it('should return false if platformType is not chrome', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome-app";
            });

            expect(offlineServiceInjected.isChromeBrowser()).toBeFalsy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
    });

    describe("isChromeBrowser", function () {
        it('should return true if platformType is chrome', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            expect(offlineServiceInjected.isChromeBrowser()).toBeTruthy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
        it('should return false if platformType is not chrome', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome-app";
            });

            expect(offlineServiceInjected.isChromeBrowser()).toBeFalsy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
    });

    describe("isChromeBrowser", function () {
        it('should return true if platformType is chrome', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome";
            });

            expect(offlineServiceInjected.isChromeBrowser()).toBeTruthy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
        it('should return false if platformType is not chrome', function () {
            bahmniCookieStore.get.and.callFake(function () {
                return "chrome-app";
            });

            expect(offlineServiceInjected.isChromeBrowser()).toBeFalsy();
            expect(bahmniCookieStore.get).toHaveBeenCalledWith(Bahmni.Common.Constants.platform);
        });
    });

    describe("encrypt", function () {
        it('should encrypt the value as it is if encrypt type is not SHA3', function () {
            expect(offlineServiceInjected.encrypt('password', 'SHA')).toEqual('password');
        });

    });

});