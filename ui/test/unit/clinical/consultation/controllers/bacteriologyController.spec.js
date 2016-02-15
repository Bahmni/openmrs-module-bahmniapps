describe("Bacteriology Controller", function () {
    var $scope, rootScope, contextChangeHandler, spinner, conceptSetService, appService, appDescriptor, controller;
    var existingSpecimen = new Bahmni.Clinical.Specimen({
        existingObs: "Existing Obs Uuid",
        dateCollected: "2015-10-01T18:30:00.000Z",
        type: "Blood",
        identifier: "1234",
        sample: {
            additionalAttributes: {}
        }
    });

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope) {
        $scope = $rootScope.$new();
        $scope.consultation = {
            mdrtbSpecimen: [],
            preSaveHandler: new Bahmni.Clinical.Notifier(),
            postSaveHandler: new Bahmni.Clinical.Notifier()
        };
        rootScope = $rootScope;

        var spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        conceptSetService = jasmine.createSpyObj('conceptSetService', ['getConcept']);
        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);

        spinner.forPromise.and.callFake(function () {
            return {
                then: function () {
                    return {};
                }
            }
        });


        conceptSetService.getConcept.and.returnValue({});

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getConfigValue.and.returnValue(true);

        spyOn($scope, '$broadcast');
        controller = $controller;

        $controller('BacteriologyController', {
            $scope: $scope,
            $rootScope: rootScope,
            contextChangeHandler: contextChangeHandler,
            spinner: spinner,
            conceptSetService: conceptSetService,
            bacteriologyConceptSet: {},
            appService:appService
        });
    }));

    describe("Edit Specimen", function () {
        it("should add specimen to new specimens list", function () {

            $scope.newSpecimens = [];

            $scope.editSpecimen(existingSpecimen);

            expect($scope.newSpecimens[0].existingObs).toBe(existingSpecimen.existingObs);
        });
    });

    describe("Delete Specimen", function () {
        it("should delete specimen from the existing specimen list", function () {

            $scope.savedSpecimens = [existingSpecimen];

            $scope.deleteSpecimen(existingSpecimen);

            expect(existingSpecimen.voided).toBeTruthy();
        });
    });

    describe("Clear Specimen should clear out specimen from new Specimen list", function () {
        var newSpecimen1 = new Bahmni.Clinical.Specimen({
            dateCollected: "2015-10-01T18:30:00.000Z",
            type: "Urine",
            identifier: "1235",
            sample: {
                additionalAttributes: []
            }
        });

        it("should remove sample", function () {
            $scope.newSpecimens = [newSpecimen1];
            $scope.clearSpecimen(newSpecimen1);
            expect($scope.newSpecimens.length).toBe(1);
            expect($scope.newSpecimens[0].isEmpty()).toBeTruthy();
        });
    });

    describe("Get Display Name", function () {
        it("Should return the Specimen short name if it present", function () {
            var specimenData = { type: { shortName: "short Name", name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.shortName);
        });

        it("Should return the Specimen short name if it present, otherwise return Specimen name", function () {
            var specimenData ={ type: {name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.name);
        });

        it("Should return the return Specimen name, if Specimen short name is null", function () {
            var specimenData = { type: {shortName:null ,name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.name);
        });

        it("Should return the return Specimen name, if Specimen short name is empty", function () {
            var specimenData = { type: {shortName:"" ,name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.name);
        });

        it("Should return freeText Type if sample type is Other", function(){
            var specimenData = { type: {shortName:"" ,name: "Other"}, typeFreeText:"Other Sample Type"};
            expect($scope.getDisplayName(specimenData)).toBe(specimenData.typeFreeText);
        });
    });

    describe("Specimen type Others", function(){
        var existingSpecimenOther = function () {
            return new Bahmni.Clinical.Specimen({
                existingObs: "Existing Obs Uuid",
                dateCollected: "2015-10-01T18:30:00.000Z",
                type: {name: "Other"},
                identifier: "1234",
                sample: {
                    additionalAttributes: {}
                }
            });
        };

        it("should set showNonCodedSampleText to be true on call of editSpecimen", function () {
            $scope.newSpecimens = [];
            $scope.editSpecimen(existingSpecimenOther());
            expect($scope.newSpecimens[0].showTypeFreeText).toBe(true);

        });

        it("should set showNonCodedSampleText to be true on call of handleUpdate", function () {

            $scope.newSpecimens = [];
            $scope.newSpecimens.push(existingSpecimenOther());
            $scope.handleUpdate();

            expect($scope.newSpecimens[0].showTypeFreeText).toBe(true);

        });

        it("should set typeFreeText to null if specimen is not of type Other  ", function () {
            $scope.newSpecimens = [];
            $scope.newSpecimens.push(existingSpecimen);
            $scope.handleUpdate();

            expect($scope.newSpecimens[0].typeFreeText).toBe(null);

        });

    });



    describe("initialization", function () {
        it("should broadcast event:pageUnload if configured to show popUp", function () {
            expect($scope.$broadcast).toHaveBeenCalledWith('event:pageUnload');
        });
    });
});
