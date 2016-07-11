'use strict';

describe('AppUpdateService', function () {

    var appUpdateService, httpBackend, mockAppInfoStrategy;
    beforeEach(function () {
        module('bahmni.common.offline');
        module(function () {
            mockAppInfoStrategy = jasmine.createSpyObj('appInfoStrategy', ['getVersion']);
        });
        module(function ($provide) {
            $provide.value('appInfoStrategy', mockAppInfoStrategy);
            $provide.value('$q', Q);
        })
    });

    beforeEach(inject(function (_appUpdateService_, _$httpBackend_) {
        appUpdateService = _appUpdateService_;
        httpBackend = _$httpBackend_;
    }));


    it('should update the local storage with new metadata info and return it', function (done) {
        var offlineMetadata = {
            latestAndroidAppUrl: "android url",
            latestChromeAppUrl: "chrome url",
            compatibleVersions: [0.81, 0.82]
        };

        httpBackend.expectGET(Bahmni.Common.Constants.offlineMetadataUrl)
            .respond(200, offlineMetadata, {etag: 'some etag'});

        mockAppInfoStrategy.getVersion.and.returnValue(0.80);

        localStorage.removeItem("appUpdateInfo");
        appUpdateService.getUpdateInfo().then(function (data) {
            expect(data.forcedUpdateRequired).toBeTruthy();
            expect(data.latestAndroidAppUrl).toBe("android url");
            expect(data.latestChromeAppUrl).toBe("chrome url");
            expect(data.etag).toBe('some etag');
            expect(localStorage.getItem("appUpdateInfo")).toEqual('{"latestAndroidAppUrl":"android url","latestChromeAppUrl":"chrome url","compatibleVersions":[0.81,0.82],"etag":"some etag"}')
            done();
        });
        setTimeout(function () {
            httpBackend.flush();
        }, 100);
    });

    it('should return metadata info and recalculated forcedUpdateRequired flag from localstorage if http returns 304', function (done) {


        httpBackend.expectGET(Bahmni.Common.Constants.offlineMetadataUrl)
            .respond(304, {}, {etag: 'some etag'});

        mockAppInfoStrategy.getVersion.and.returnValue(0.82);
        localStorage.setItem("appUpdateInfo", '{"latestAndroidAppUrl":"android url","latestChromeAppUrl":"chrome url","etag":"some etag"}');

        appUpdateService.getUpdateInfo().then(function (data) {
            expect(data.forcedUpdateRequired).toBeFalsy();
            expect(data.latestAndroidAppUrl).toBe("android url");
            expect(data.latestChromeAppUrl).toBe("chrome url");
            expect(data.etag).toBe('some etag');
            expect(localStorage.getItem("appUpdateInfo")).toBe('{"latestAndroidAppUrl":"android url","latestChromeAppUrl":"chrome url","etag":"some etag"}');
            done();
        });
        setTimeout(function () {
            httpBackend.flush();
        }, 100);
    });

    it('should remove metadata info from localstorage if http returns 404', function (done) {


        httpBackend.expectGET(Bahmni.Common.Constants.offlineMetadataUrl)
            .respond(404, {}, {etag: 'some etag'});

        mockAppInfoStrategy.getVersion.and.returnValue(0.80);
        localStorage.setItem("appUpdateInfo", '{"forcedUpdateRequired":true,"latestAndroidAppUrl":"android url","latestChromeAppUrl":"chrome url","etag":"some etag"}');

        appUpdateService.getUpdateInfo().then(function (data) {
            expect(data).toEqual({});
            expect(localStorage.getItem("appUpdateInfo")).toBe(null);
            done();
        });
        setTimeout(function () {
            httpBackend.flush();
        }, 100);
    });


});