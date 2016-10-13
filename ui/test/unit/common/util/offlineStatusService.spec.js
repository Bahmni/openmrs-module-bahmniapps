describe("offlineStatusService", function () {
    var rootScope, appService, offlineStatusService, offline, interval;

    appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    interval = jasmine.createSpy('$interval');

    beforeEach(module('bahmni.common.util'));

    beforeEach(function () {
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (input) {
                if (input === "networkConnectivity") {
                    return {
                        "showNetworkStatusMessage": true,
                        "networkStatusCheckInterval": 9000
                    }
                }
            }
        });
        module(function ($provide) {
            $provide.value('appService', appService);
            $provide.value('$interval', interval);
        });
        inject(function ($rootScope, _offlineStatusService_) {
            rootScope = $rootScope;
            offlineStatusService = _offlineStatusService_;
        });

    });

    it("should set offline options when config is set true", function () {
        var xhrObject = {xhr: {url: Bahmni.Common.Constants.faviconUrl}};
        offlineStatusService.setOfflineOptions();
        expect(interval).toHaveBeenCalled();
        expect(interval).toHaveBeenCalledWith(offlineStatusService.checkOfflineStatus, 9000);
        expect(Offline.options.checks).toEqual(xhrObject);
    });


    it("should set offline options when config is not given", function () {
        appService.getAppDescriptor.and.returnValue({
            getConfigValue: function (input) {
                if (input === "networkConnectivity") {
                    return {
                    }
                }
            }
        });
        var xhrObject = {xhr: {url: Bahmni.Common.Constants.faviconUrl}};
        offlineStatusService.setOfflineOptions();
        expect(interval).toHaveBeenCalled();
        expect(interval).toHaveBeenCalledWith(offlineStatusService.checkOfflineStatus, 5000);
        expect(Offline.options.checks).toEqual(xhrObject);
    });

});