describe("TrendsController", function() {
    "use strict";

    var observationService,
        observationFetchPromise,
        controller,
        scope;

    beforeEach(function () {
        module("trends");
        observationService = jasmine.createSpyObj("observationService", ["fetch"]);
        observationFetchPromise = specUtil.createServicePromise("observationService");
        observationService.fetch.andReturn(observationFetchPromise);
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller("TrendsController", {
                $scope: scope,
                $routeParams: {},
                observationService: observationService
            });
        });
    });

    describe("xAxisTickFormatFunction", function() {
        it("converts epoch time to formatted date", inject(function() {
            var epochTimeFor21stDecember2013 = new Date(2013, 11, 21).getTime();
            expect(scope.xAxisTickFormatFunction()(epochTimeFor21stDecember2013)).toEqual("21/12/13");
        }));
    });

    describe("when initialized", function() {
        it("pulls weight observation", inject(function() {
            observationFetchPromise.callSuccessCallBack([
                {"observationDate":1371619826000,"conceptName":"WEIGHT","value":38.7},
                {"observationDate":1371619826000,"conceptName":"BMI","value":17.91},
                {"observationDate":1371619826000,"conceptName":"HEIGHT","value":147.0},
                {"observationDate":1372227320000,"conceptName":"WEIGHT","value":40.0},
                {"observationDate":1372821738000,"conceptName":"WEIGHT","value":40.3}
            ]);
            expect(scope.observations).toEqual([{
                "key": "Weight",
                "values": [
                    [1371619826000, 38.7],
                    [1372227320000, 40.0],
                    [1372821738000, 40.3],
                ]
            }]);
        }));
    });
});
