describe("loading config functionality", function () {

    var loadConfigService, mockHttp, $q = Q, bahmniCookieStore;

    beforeEach(module('bahmni.common.appFramework'));
    beforeEach(module(function($provide) {
        mockHttp = jasmine.createSpyObj('$http',['get']);
        bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['get']);
        $provide.value('$http',mockHttp);
        $provide.value('$q', $q);
        $provide.value('$bahmniCookieStore', bahmniCookieStore);
    }));

    beforeEach(inject(['loadConfigService',
        function (loadConfigServiceInjected) {
            loadConfigService = loadConfigServiceInjected;
        }]));

    it("should load config", function (done) {

        var config = {
            "value": {
                "app.json": {
                    "id": "bahmni.test"
                }
            }
        };

        mockHttp.get.and.returnValue(specUtil.respondWithPromise($q, config.value["app.json"]));

        loadConfigService.loadConfig("something/app.json", "test").then(function(result){
            expect(result.id).toBe("bahmni.test");
            done();
        });

    });
});
