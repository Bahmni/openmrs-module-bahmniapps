describe("TrendsController", function() {
    "use strict";

    var observationService,
        observationFetchPromise,
        controller,
        scope,
        sortedKeys = function(array) {
            return Object.keys(array).sort();
        };

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
        it("pulls categorized observations", inject(function() {
            observationFetchPromise.callSuccessCallBack([
                {"observationDate":1371619826000,"conceptName":"WEIGHT","value":38.7},
                {"observationDate":1372227320000,"conceptName":"WEIGHT","value":40.0},
                {"observationDate":1372821738000,"conceptName":"WEIGHT","value":40.3},
                {"observationDate":1371619826000,"conceptName":"HEIGHT","value":147.0},
                {"observationDate":1372227320000,"conceptName":"HEIGHT","value":148.0}
            ]);

            expect(sortedKeys(scope.observations)).toEqual(["HEIGHT", "WEIGHT"]);
            expect(scope.observations.WEIGHT).toEqual([{
                "key": "Weight",
                "values": [ [1371619826000, 38.7], [1372227320000, 40.0], [1372821738000, 40.3] ]
            }]);
            expect(scope.observations.HEIGHT).toEqual([{
                "key": "Height",
                "values": [ [1371619826000, 147.0], [1372227320000, 148.0] ]
            }]);
        }));

        it("renames special keys like BMI & REGISTRATION FEES", inject(function() {
            observationFetchPromise.callSuccessCallBack([
                {"observationDate":1371619826000,"conceptName":"BMI","value":17.91},
                {"observationDate":1372227320000,"conceptName":"BMI","value":18.27},
                {"observationDate":1371619826000,"conceptName":"REGISTRATION FEES","value":15},
                {"observationDate":1372227320000,"conceptName":"REGISTRATION FEES","value":10}
            ]);

            expect(sortedKeys(scope.observations)).toEqual(["BMI", "REGISTRATION FEES"]);
            expect(scope.observations.BMI).toEqual([{
                "key": "BMI",
                "values": [ [1371619826000, 17.91], [1372227320000, 18.27] ]
            }]);
            expect(scope.observations["REGISTRATION FEES"]).toEqual([{
                "key": "Fees",
                "values": [ [1371619826000, 15], [1372227320000, 10] ]
            }]);
        }));

        it("rejects samples without enough data", inject(function() {
            observationFetchPromise.callSuccessCallBack([
                {"observationDate":1371619826000,"conceptName":"BMI","value":17.91}
            ]);

            expect(sortedKeys(scope.observations)).toEqual([]);
        }));
    });
});
