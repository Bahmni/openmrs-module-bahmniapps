describe("AppConfigService", function () {
    beforeEach(module('bahmni.admin'));

    describe("MakeExtensions", function () {
        beforeEach(inject(['appConfigService', function (AppConfigServiceInjected) {
            AppConfigService = AppConfigServiceInjected;
        }]));

        it("Should use the params to create an extension if string", function () {
            var extn = AppConfigService.makeExtension("some");
            expect(extn.url).toBe("#/configEditor/some");
            expect(extn.label).toBe("some");
            expect(extn.icon).toBe("fa-user");
        });
        it("Should use the params to create an extension if object", function () {
            var extn = AppConfigService.makeExtension({configName: "config-name", appName: "app-name"})
            expect(extn.url).toBe("#/configEditor/app-name/config-name");
            expect(extn.label).toBe("config-name");
            expect(extn.icon).toBe("fa-user");
        });
    });

    describe("GetAllAppNames", function () {
        var wrapperPromise;
        beforeEach(module(function ($provide) {
            mockHttp = jasmine.createSpyObj('$http', ['get']);
            mockHttp.get.and.callFake(function (param) {
                wrapperPromise = specUtil.respondWith({"data": ["1", "2", "3"]});
                return wrapperPromise;
            });

            $provide.value('$http', mockHttp);
            $provide.value('$q', Q);
        }));

        beforeEach(inject(['appConfigService', function (AppConfigServiceInjected) {
            AppConfigService = AppConfigServiceInjected;
        }]));

        it("Should get all app names", function (done) {
            var appNames = AppConfigService.getAllAppNames();
            appNames.then(function (response) {
                expect(response.data.length).toBe(3);
                expect(response.data[0]).toBe('1');
                expect(response.data[1]).toBe('2');
                expect(response.data[2]).toBe('3');
            });
            done();
        });
    });
});