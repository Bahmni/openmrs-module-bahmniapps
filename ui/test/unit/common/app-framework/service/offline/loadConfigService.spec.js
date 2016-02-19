describe("loading config functionality", function () {

    var offlineService, offlineDbService, loadConfigService, $q= Q, mockHttp;

    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(module('bahmni.common.offline'));
    beforeEach(module(function($provide) {
        offlineService = jasmine.createSpyObj('offlineService',['isOfflineApp', 'isAndroidApp']);
        offlineDbService = jasmine.createSpyObj('offlineDbService',['getConfig']);
        mockHttp = jasmine.createSpyObj('$http',['get']);
        $provide.value('offlineService', offlineService);
        $provide.value('offlineDbService', offlineDbService);
        $provide.value('$q', $q);
        $provide.value('$http',mockHttp);
    }));

    beforeEach(inject(['loadConfigService',
        function (loadConfigServiceInjected) {
            loadConfigService = loadConfigServiceInjected;
        }]));



    it("should load config from offline db when offline", function (done) {

        var config = {
            "value": {
                "app.json": {
                    "id": "bahmni.test"
                }
            }
        };
        offlineService.isAndroidApp.and.returnValue(false);
        offlineService.isOfflineApp.and.returnValue(true);
        offlineDbService.getConfig.and.returnValue(specUtil.respondWithPromise($q, config));

        loadConfigService.loadConfig("something/app.json", "test").then(function(result){
           expect(result.data.id).toBe("bahmni.test");
            done();
        });

    });


    it("should load config online", function (done) {

        var config = {
            "value": {
                "app.json": {
                    "id": "bahmni.test"
                }
            }
        };

        offlineService.isOfflineApp.and.returnValue(false);
        offlineService.isAndroidApp.and.returnValue(false);
        mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, config.value["app.json"]));

        loadConfigService.loadConfig("something/app.json", "test").then(function(result){
            console.log("abc");
            expect(result.id).toBe("bahmni.test");
            done();
        });

    });


});
