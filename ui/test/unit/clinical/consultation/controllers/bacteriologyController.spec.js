describe("Bacteriology Controller", function () {
    var $scope, rootScope, contextChangeHandler, spinner, conceptSetService;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        $scope = $rootScope.$new();
        $scope.consultation = {mdrtbSpecimen: [], preSaveHandler: new Bahmni.Clinical.Notifier(), postSaveHandler: new Bahmni.Clinical.Notifier()};
        rootScope = $rootScope;
        contextChangeHandler = {
            execute: function () {
                return {allow: true}
            }, reset: function () {
            }
        };

        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConceptSetMembers']);
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);

        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });


        conceptSetService.getConceptSetMembers.and.returnValue({});

        $controller('BacteriologyController', {
            $scope: $scope,
            $rootScope: rootScope,
            contextChangeHandler: contextChangeHandler,
            spinner: spinner,
            conceptSetService: conceptSetService,
            bacteriologyConceptSet: {}
        });
    }));

    describe("Add Sample", function () {
        it("should add sample", function () {
            var newSpecimen = {
                dateCollected: "2015-10-01T18:30:00.000Z",
                type: "Blood",
                identifier: "1234",
                sample: {
                    additionalAttributes: {}
                }
            };
            $scope.newSpecimens = [newSpecimen];

            $scope.addSpecimen();

            expect($scope.newSpecimens[1]).toBe(newSpecimen);
        });
    });
    
    describe("Remove Sample", function () {
        var newSpecimen1 = {
            dateCollected: "2015-10-01T18:30:00.000Z",
            type: "Urine",
            identifier: "1235",
            sample: {
                additionalAttributes: []
            }
        };
        var newSpecimen2 = {
            dateCollected: "2015-10-01T18:30:00.000Z",
            type: "Blood",
            identifier: "1236",
            sample: {
                additionalAttributes: []
            }
        };
        it("should remove sample", function () {
            $scope.newSpecimens = [newSpecimen1, newSpecimen2];
            $scope.removeSpecimen(newSpecimen1);
            expect($scope.newSpecimens.length).toBe(1);
            expect($scope.newSpecimens[0]).toBe(newSpecimen2);
        });
    });
});