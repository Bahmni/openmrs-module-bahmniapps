describe("Bacteriology Controller", function () {
    var $scope, rootScope, contextChangeHandler, spinner, conceptSetService, appService, appDescriptor, controller, retrospectiveEntryService, $state;
    var existingSpecimen = new Bahmni.Clinical.Specimen({
        existingObs: "Existing Obs Uuid",
        dateCollected: "2015-10-01T18:30:00.000Z",
        type: "Blood",
        uuid: "Specimen uuid",
        identifier: "1234",
        sample: {
            additionalAttributes: {}
        }
    });

    beforeEach(module('bahmni.clinical'));

    var initController = function() {
        inject(function ($controller, $rootScope) {
            controller = $controller;
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
        })
    };

    var createController = function() {
        return controller('BacteriologyController', {
            $scope: $scope,
            $state: $state,
            $rootScope: rootScope,
            contextChangeHandler: contextChangeHandler,
            spinner: spinner,
            conceptSetService: conceptSetService,
            bacteriologyConceptSet: {},
            appService:appService,
            retrospectiveEntryService:retrospectiveEntryService
        });
    };

    beforeEach(initController);

    describe("Create specimen", function(){
        it("should add a new specimen to the specimens list", function(){
            createController();
            $scope.newSpecimens = [];

            $scope.createNewSpecimen();

            expect($scope.newSpecimens.length).toEqual(1);
        });
    });

    describe("Edit Specimen", function () {
        it("should add specimen to new specimens list", function () {
            createController();
            $scope.newSpecimens = [];
            $scope.savedSpecimens = [existingSpecimen];

            $scope.editSpecimen(existingSpecimen);

            expect($scope.newSpecimens[0].existingObs).toBe(existingSpecimen.existingObs);
            expect($scope.savedSpecimens).toEqual([]);
        });
    });

    describe("Delete Specimen", function () {
        it("should delete specimen from the existing specimen list", function () {
            createController();
            $scope.savedSpecimens = [existingSpecimen];

            $scope.deleteSpecimen(existingSpecimen);

            expect(existingSpecimen.voided).toBeTruthy();
        });

        it("should remove specimen from saved specimens and new specimens",function () {
            createController();
            $scope.newSpecimens = [existingSpecimen];
            $scope.savedSpecimens = [existingSpecimen];

            $scope.deleteSpecimen(existingSpecimen);

            expect($scope.savedSpecimens).toEqual([]);
            expect($scope.newSpecimens[0]).not.toEqual(existingSpecimen);
            expect($scope.newSpecimens[0].dateCollected).toBeNull();

        })
    });

    describe("Get Display Name", function () {
        it("Should return the Specimen short name if it present", function () {
            createController();
            var specimenData = { type: { shortName: "short Name", name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.shortName);
        });

        it("Should return the Specimen short name if it present, otherwise return Specimen name", function () {
            createController();
            var specimenData ={ type: {name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.name);
        });

        it("Should return the return Specimen name, if Specimen short name is null", function () {
            createController();
            var specimenData = { type: {shortName:null ,name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.name);
        });

        it("Should return the return Specimen name, if Specimen short name is empty", function () {
            createController();
            var specimenData = { type: {shortName:"" ,name: "name"}};

            expect($scope.getDisplayName(specimenData)).toBe(specimenData.type.name);
        });

        it("Should return freeText Type if sample type is Other", function(){
            createController();
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
            createController();
            $scope.newSpecimens = [];
            $scope.editSpecimen(existingSpecimenOther());
            expect($scope.newSpecimens[0].showTypeFreeText).toBe(true);

        });

        it("should set showNonCodedSampleText to be true on call of handleUpdate", function () {
            createController();
            $scope.newSpecimens = [];
            $scope.newSpecimens.push(existingSpecimenOther());
            $scope.handleUpdate();

            expect($scope.newSpecimens[0].showTypeFreeText).toBe(true);

        });

        it("should set typeFreeText to null if specimen is not of type Other  ", function () {
            createController();
            $scope.newSpecimens = [];
            $scope.newSpecimens.push(existingSpecimen);
            $scope.handleUpdate();

            expect($scope.newSpecimens[0].typeFreeText).toBe(null);

        });

    });

    describe("initialization", function () {
        it("should broadcast event:pageUnload if configured to show popUp", function () {
            createController();
            expect($scope.$broadcast).toHaveBeenCalledWith('event:pageUnload');
        });

        it("should add an empty specimen if there is no specimen", function(){
            createController();
            expect($scope.newSpecimens.length).toEqual(1);
        });

        it("should not add an empty specimen if there are already specimens", function(){
            $scope.consultation.newlyAddedSpecimens = [new Bahmni.Clinical.Specimen(null, $scope.samples), new Bahmni.Clinical.Specimen(null, $scope.samples)];
            createController();
            expect($scope.newSpecimens.length).toEqual(2);
        });
    });
});
