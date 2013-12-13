describe("TrendsController", function() {
    "use strict";

    var observationService,
        observationFetchPromise,
        controller,
        scope,
        sortedKeys = function(array) {
            return Object.keys(array).sort();
        },
        serverCallForWeightAndHeight = function() {
            observationFetchPromise.callSuccessCallBack([
                {"observationDate":1371619826000,"conceptName":"WEIGHT","value":38.7},
                {"observationDate":1372227320000,"conceptName":"WEIGHT","value":40.0},
                {"observationDate":1372821738000,"conceptName":"WEIGHT","value":40.3},
                {"observationDate":1371619826000,"conceptName":"HEIGHT","value":147.0},
                {"observationDate":1372227320000,"conceptName":"HEIGHT","value":148.0}
            ]);
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

    describe("xAxisTickFormatAsDate", function() {
        it("converts epoch time to formatted date", inject(function() {
            var epochTimeFor21stDecember2013 = new Date(2013, 11, 21).getTime();
            expect(scope.xAxisTickFormatAsDate()(epochTimeFor21stDecember2013)).toEqual("21/12/13");
        }));
    });

    describe("after initialization", function() {
        describe("for populated categories", function() {
            beforeEach(function() {
                serverCallForWeightAndHeight();
            });

            it("pulls categorized observations", inject(function() {
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

            it("populates concepts", inject(function() {
                expect(scope.concepts).toEqual({
                    "HEIGHT": { name:"Height", displayed:false },
                    "WEIGHT": { name:"Weight", displayed:false }
                });
            }));
        });

        describe("for observations that need a different name from the sever send name", function() {
            beforeEach(function() {
                observationFetchPromise.callSuccessCallBack([
                    {"observationDate":1371619826000,"conceptName":"BMI","value":17.91},
                    {"observationDate":1372227320000,"conceptName":"BMI","value":18.27},
                    {"observationDate":1371619826000,"conceptName":"REGISTRATION FEES","value":15},
                    {"observationDate":1372227320000,"conceptName":"REGISTRATION FEES","value":10}
                ]);
            });

            it("renames keys names in the observations", inject(function() {
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

            it("renames concepts", inject(function() {
                expect(scope.concepts).toEqual({
                    "BMI": { name:"BMI", displayed:false },
                    "REGISTRATION FEES": { name:"Fees", displayed:false }
                });
            }));
        });

        describe("for observations with insufficient data", function() {
            beforeEach(function() {
                observationFetchPromise.callSuccessCallBack([
                    {"observationDate":1371619826000,"conceptName":"BMI","value":17.91}
                ]);
            });

            it("has empty observations", inject(function() {
                expect(scope.concepts).toEqual({});
            }));

            it("has empty categories", inject(function() {
                expect(scope.concepts).toEqual({});
            }));
        });
    });

    describe("addObservations", function() {
        beforeEach(function() {
            serverCallForWeightAndHeight();

            scope.addObservations("WEIGHT");
        });

        it("adds the specified observation to visible observation", inject(function() {
            expect(scope.visibleObservations).toEqual({
                "WEIGHT": [{
                    "key": "Weight",
                    "values": [ [1371619826000, 38.7], [1372227320000, 40.0], [1372821738000, 40.3] ]
                }]
            });
        }));

        it("marks the category as displayed", inject(function() {
            expect(scope.concepts.WEIGHT.displayed).toBeTruthy();
        }));
    });

    describe("removeObservations", function() {
        beforeEach(function() {
            serverCallForWeightAndHeight();
            scope.addObservations("WEIGHT");
            scope.addObservations("HEIGHT");

            scope.removeObservations("HEIGHT");
        });

        it("removes the specified observation from visible observation", inject(function() {
            expect(scope.visibleObservations).toEqual({
                "WEIGHT": [{
                    "key": "Weight",
                    "values": [ [1371619826000, 38.7], [1372227320000, 40.0], [1372821738000, 40.3] ]
                }]
            });
        }));

        it("marks the category as not displayed", inject(function() {
            expect(scope.concepts.HEIGHT.displayed).toBeFalsy();
        }));
    });
});
