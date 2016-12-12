describe("Diagnosis Controller", function () {
    var $scope, rootScope, contextChangeHandler,mockDiagnosisService, spinner, appService, mockAppDescriptor, q, deferred, mockDiagnosisData;

    beforeEach(module('bahmni.clinical'));
    beforeEach(module('bahmni.common.offline'));

    beforeEach(inject(function ($controller, $rootScope, $q, diagnosisService) {
        $scope = $rootScope.$new();
        rootScope = $rootScope;
        mockDiagnosisService = diagnosisService;
        q = $q;
        deferred = $q.defer();
        $scope.consultation = {
            "newlyAddedDiagnoses": [], preSaveHandler: new Bahmni.Clinical.Notifier()
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

    describe("should validate the diagnosis", function(){
        it("should throw error message for duplicate diagnosis", function(){
            $scope.consultation.newlyAddedDiagnoses = [{codedAnswer:{name:"abc"}},{codedAnswer:{name:"abc"}}];
            $scope.checkInvalidDiagnoses();

            expect($scope.errorMessage).toBe("{{'CLINICAL_DUPLICATE_DIAGNOSIS_ERROR_MESSAGE' | translate }}");

        });

        it("should throw error message for duplicate diagnosis based on case insensitivity", function(){
            $scope.consultation.newlyAddedDiagnoses = [{codedAnswer:{name:"abc"}},{codedAnswer:{name:"AbC"}}];
            $scope.checkInvalidDiagnoses();

            expect($scope.errorMessage).toBe("{{'CLINICAL_DUPLICATE_DIAGNOSIS_ERROR_MESSAGE' | translate }}");

        })
    });

    describe("removing blank diagnosis", function() {
        it("happens when the presave handler is fired", function() {
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);

            $scope.consultation.preSaveHandler.fire();
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(0);
        });

        it("happens when the scope is destroyed", function() {
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);

            $scope.$destroy();
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(0);
        });

        it("should happen only once during the lifecycle of the controller", function() {
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);

            $scope.consultation.preSaveHandler.fire();
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(0);

            $scope.consultation.newlyAddedDiagnoses.push(new Bahmni.Common.Domain.Diagnosis(''));
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);
            $scope.consultation.preSaveHandler.fire();

            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);
        });
        it("should happens when empty rows has been reset to one ", function() {
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);

            $scope.consultation.preSaveHandler.fire();
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(0);

            $scope.consultation.newlyAddedDiagnoses.push(new Bahmni.Common.Domain.Diagnosis(''));
            $scope.restEmptyRowsToOne(0)
            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(1);
            $scope.consultation.preSaveHandler.fire();

            expect($scope.consultation.newlyAddedDiagnoses.length).toBe(0);
        });
    });

});