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
                {"observationDate":1371619826000,"conceptName":"WEIGHT","value":38.7,"units":"kg"},
                {"observationDate":1372227320000,"conceptName":"WEIGHT","value":40.0,"units":"kg"},
                {"observationDate":1372821738000,"conceptName":"WEIGHT","value":40.3,"units":"kg"},
                {"observationDate":1371619826000,"conceptName":"HEIGHT","value":147.0,"units":"cm"},
                {"observationDate":1372227320000,"conceptName":"HEIGHT","value":148.0,"units":"cm"}
            ]);
        };

    beforeEach(function () {
        module("trends");
        observationService = jasmine.createSpyObj("observationService", ["fetch"]);
        observationFetchPromise = specUtil.createServicePromise("observationService");
        observationService.fetch.and.returnValue(observationFetchPromise);
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller("TrendsController", {
                $scope: scope,
                $routeParams: {},
                observationService: observationService,
                backlinkService: jasmine.createSpyObj("backlinkService", ["addUrl"])
            });
        });
    });

    describe("xAxisTickFormatAsDate", function() {
        it("converts epoch time to formatted date", inject(function() {
            var epochTimeFor21stDecember2013 = new Date(2013, 11, 21,1,1).getTime();
            expect(scope.xAxisTickFormatAsDate()(epochTimeFor21stDecember2013)).toEqual('\'21/12/13 01:01\'');
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
                    "values": [ [1371619826000, 38.7,"kg"], [1372227320000, 40.0,"kg"], [1372821738000, 40.3,"kg"] ]
                }]);
                expect(scope.observations.HEIGHT).toEqual([{
                    "key": "Height",
                    "values": [ [1371619826000, 147.0,"cm"], [1372227320000, 148.0,"cm"] ]
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
                    {"observationDate":1371619826000,"conceptName":"BMI","value":17.91,"units":"kg/m sq"},
                    {"observationDate":1372227320000,"conceptName":"BMI","value":18.27,"units":"kg/m sq"},
                    {"observationDate":1371619826000,"conceptName":"REGISTRATION FEES","value":15,"units":"rupees"},
                    {"observationDate":1372227320000,"conceptName":"REGISTRATION FEES","value":10,"units":"rupees"}
                ]);
            });

            it("renames keys names in the observations", inject(function() {
                expect(sortedKeys(scope.observations)).toEqual(["BMI", "REGISTRATION FEES"]);
                expect(scope.observations.BMI).toEqual([{
                    "key": "BMI",
                    "values": [ [1371619826000, 17.91,"kg/m sq"], [1372227320000, 18.27,"kg/m sq"] ]
                }]);
                expect(scope.observations["REGISTRATION FEES"]).toEqual([{
                    "key": "Fees",
                    "values": [ [1371619826000, 15,"rupees"], [1372227320000, 10,"rupees"] ]
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
                    {"observationDate":1371619826000,"conceptName":"BMI","value":17.91,"units":"kg/m sq"}
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
                    "values": [ [1371619826000, 38.7,"kg"], [1372227320000, 40.0,"kg"], [1372821738000, 40.3,"kg"] ]
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
                    "values": [ [1371619826000, 38.7,"kg"], [1372227320000, 40.0,"kg"], [1372821738000, 40.3,'kg'] ]
                }]
            });
        }));

        it("marks the category as not displayed", inject(function() {
            expect(scope.concepts.HEIGHT.displayed).toBeFalsy();
        }));
    });
});
