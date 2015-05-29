'use strict';

describe("ConfigEditorController", function () {

    beforeEach(module('bahmni.admin'));

    var scope;
    var wrapperPromise;
    var wrapperPromise1;
    var wrapperPromise2;
    var _appConfigService;


    describe("Parse config json from string", function () {

        beforeEach(inject(function ($controller, $rootScope) {
            var appConfig = {
                configName: "app.json",
                appName: "clinical",
                config: "[{\"key\": \"value\"}]"
            };
            scope = {config: null, appConfig: null};

            wrapperPromise = specUtil.respondWith({"data": appConfig});

            _appConfigService = jasmine.createSpyObj('appConfigService', ['getAppConfig']);
            _appConfigService.getAppConfig.and.returnValue(wrapperPromise);

            $controller('ConfigEditorController', {
                $scope: scope,
                appNameInit: "app.json",
                configNameInit: "clinical",
                appConfigService: _appConfigService
            });
        }));

        it("Parse config Json and set to scope", function (done) {
            wrapperPromise.then(function (response) {
                expect(JSON.parse(scope.config).key).toBe("value");
                done();
            });

        });
    });

    describe("When saving", function () {

        beforeEach(inject(function ($controller, $rootScope) {
            var appConfig = {
                configName: "app.json",
                appName: "clinical",
                config: "[{\"key\": \"value\"}]"
            };
            scope = $rootScope.$new();

            wrapperPromise1 = specUtil.respondWith({"data": appConfig});
            wrapperPromise2 = specUtil.respondWith({"data": appConfig});

            _appConfigService = jasmine.createSpyObj('appConfigService', ['getAppConfig', 'save']);
            _appConfigService.getAppConfig.and.returnValue(wrapperPromise1);
            _appConfigService.save.and.returnValue(wrapperPromise);

            $controller('ConfigEditorController', {
                $scope: scope,
                appNameInit: "app.json",
                configNameInit: "clinical",
                appConfigService: _appConfigService
            });
        }));

        it("Stringify Json before saving", function (done) {
            wrapperPromise1.then(function (response) {
                scope.save();
                expect(scope.appConfig.config).toBe(JSON.stringify(scope.config));
                expect(_appConfigService.save).toHaveBeenCalledWith(scope.appConfig);
                done();
            });
        });
    });

});