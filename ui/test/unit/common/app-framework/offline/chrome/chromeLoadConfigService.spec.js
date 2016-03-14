describe("loading config functionality", function () {

    var offlineDbService, loadConfigService, $q= Q;

    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(module('bahmni.common.offline'));
    beforeEach(module(function($provide) {
        offlineDbService = jasmine.createSpyObj('offlineDbService',['getConfig']);
        $provide.value('offlineDbService', offlineDbService);
        $provide.value('$q', $q);
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

        offlineDbService.getConfig.and.returnValue(specUtil.respondWithPromise($q, config));

        loadConfigService.loadConfig("something/app.json", "test").then(function(result){
           expect(result.data.id).toBe("bahmni.test");
            done();
        });

    });

});
