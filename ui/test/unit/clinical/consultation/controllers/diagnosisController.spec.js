describe("Diagnosis Controller", function () {
    var $scope, rootScope, contextChangeHandler,mockDiagnosisService, spinner, appService, mockAppDescriptor, q, deferred, mockDiagnosisData;

    beforeEach(module('bahmni.clinical'));

    beforeEach(inject(function ($controller, $rootScope, $q, diagnosisService) {
        $scope = $rootScope.$new();
        rootScope = $rootScope;
        mockDiagnosisService = diagnosisService
        q = $q;
        deferred = $q.defer();
        $scope.consultation = {
            "newlyAddedDiagnoses": [], preSaveHandler: {
                register: function () {

                }
            }
        };
        rootScope.currentUser = {privileges: [{name: "app:clinical:deleteDiagnosis"}, {name: "app:clinical"}]};

        mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfig']);
        mockAppDescriptor.getConfig.and.returnValue({value: true});

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue(mockAppDescriptor);

        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
        spyOn(diagnosisService, 'getDiagnosisConceptSet').and.returnValue(deferred.promise);
        spyOn(diagnosisService, 'getAllFor').and.returnValue({});

        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });

        $controller('DiagnosisController', {
            $scope: $scope,
            $rootScope: rootScope,
            contextChangeHandler: contextChangeHandler,
            spinner: spinner,
            appService: appService,
            diagnosisService: mockDiagnosisService
        });
    }));

    describe("initialization", function () {
        it("should add placeHolder for new diagnosis", function () {
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);
        });
        it("should call appService and set canDeleteDiagnosis,allowOnlyCodedDiagnosis", function () {
            expect(appService.getAppDescriptor).toHaveBeenCalled();
            expect(mockAppDescriptor.getConfig).toHaveBeenCalledWith("allowOnlyCodedDiagnosis");
            expect($scope.canDeleteDiagnosis).not.toBeUndefined();
            expect($scope.allowOnlyCodedDiagnosis).toBe(true);
        });

        it("should get diagnosis meta data and set isStatusConfigured", function () {
            expect(mockDiagnosisService.getDiagnosisConceptSet).toHaveBeenCalled();
            var diagnosisMetaData = {
                "data": {
                    "results": [{
                        "setMembers": [{"name": {"name": "Bahmni Diagnosis Status"}}]
                    }]
                }
            };
            deferred.resolve(diagnosisMetaData);
            $scope.$apply();
            expect($scope.isStatusConfigured).toBeTruthy();
            expect($scope.diagnosisMetaData).toBe(diagnosisMetaData.data.results[0]);
        });
    });

    describe("getDiagnosis()", function () {
        it("should make a call to diagnosis service getAllFor", function () {
            $scope.getDiagnosis({term:"primary"});
            expect(mockDiagnosisService.getAllFor).toHaveBeenCalledWith("primary");
        });
    });

});