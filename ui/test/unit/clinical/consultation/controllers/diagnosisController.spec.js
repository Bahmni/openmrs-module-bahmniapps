describe("Diagnosis Controller", function () {
    var $scope, rootScope, contextChangeHandler,mockDiagnosisService, spinner, appService, mockAppDescriptor, q, deferred, mockDiagnosisData, translate, retrospectiveEntryService;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    beforeEach(module('bahmni.clinical'));

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
        rootScope.currentUser.userProperties = {defaultLocale: "en"};

        spyOn(DateUtil, 'today');
        mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfig','getConfigValue']);
        mockAppDescriptor.getConfig.and.returnValue({value: true});
        mockAppDescriptor.getConfigValue.and.returnValue(true);

        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue(mockAppDescriptor);

        contextChangeHandler = jasmine.createSpyObj('contextChangeHandler', ['add']);
        spyOn(diagnosisService, 'getDiagnosisConceptSet').and.returnValue(deferred.promise);

        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.callFake(function (param) {
            return {
                then: function () {
                    return {};
                }
            }
        });
        translate = jasmine.createSpyObj('$translate',['instant']);

        retrospectiveEntryService = jasmine.createSpyObj('retrospectiveEntryService', ['isRetrospectiveMode']);

        $controller('DiagnosisController', {
            $scope: $scope,
            $rootScope: rootScope,
            contextChangeHandler: contextChangeHandler,
            spinner: spinner,
            appService: appService,
            diagnosisService: mockDiagnosisService,
            $translate: translate,
            retrospectiveEntryService: retrospectiveEntryService
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

        it("should set conditions to be hidden on UI when configured", function () {
            expect(mockAppDescriptor.getConfigValue).toHaveBeenCalledWith("hideConditions");
            expect($scope.hideConditions).toBeTruthy();
        });
    });

    describe("getDiagnosis()", function () {
        it("should make a call to diagnosis service getAllFor", function () {
            $scope.getDiagnosis({term:"primary"}).then(function (list) {
                spyOn(diagnosisService, 'getAllFor').and.returnValue(specUtil.simplePromise({data: [{"conceptName":"Cold, unspec.","conceptUuid":"uuid1","matchedName":null,"code":"T69.9XXA"}]}));
                expect(mockDiagnosisService.getAllFor).toHaveBeenCalledWith("primary", "en");
                expect(list.length).toBe(1);
                expect(list[0].value).toBe("Cold, unspec. (T69.9XXA)");
                expect(list[0].concept.name).toBe("Cold, unspec.");
                expect(list[0].concept.uuid).toBe("uuid1");
                expect(list[0].lookup.name).toBe(undefined);
            });
        });

        it("should make a call to diagnosis service getAllFor with synonym", function () {
            spyOn(mockDiagnosisService, 'getAllFor').and.returnValue(specUtil.simplePromise({data: [{"conceptName":"Cold, unspec.","conceptUuid":"uuid1","matchedName":"Cold xyz","code":"T69.9XXA"}]}));
            $scope.getDiagnosis({term:"T69.9XXA"}).then(function (list) {
                expect(mockDiagnosisService.getAllFor).toHaveBeenCalledWith("T69.9XXA", "en");
                expect(list.length).toBe(1);
                expect(list[0].value).toBe("Cold xyz => Cold, unspec. (T69.9XXA)");
                expect(list[0].concept.name).toBe("Cold, unspec.");
                expect(list[0].concept.uuid).toBe("uuid1");
                expect(list[0].lookup.name).toBe("Cold xyz");
            });
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

    describe("filterConditions",function () {
        it("should filter only conditions with given status",function () {
            $scope.consultation.conditions = [
                {status: 'HISTORY_OF'},
                {status: 'INACTIVE'},
                {status: 'INACTIVE'},
                {status: 'ACTIVE'},
                {status: 'ACTIVE'}
            ];

            expect($scope.filterConditions('HISTORY_OF')).toEqual([$scope.consultation.conditions[0]]);
            expect($scope.filterConditions('INACTIVE')).toEqual([
                $scope.consultation.conditions[1],
                $scope.consultation.conditions[2]
            ]);
        });
    });

    describe("addCondition",function () {
        it("should add condition if does not exist",function () {
            $scope.consultation.conditions = [];
            $scope.consultation.condition.concept ={name:'Headache',uuid:'headacheUuid'};

            $scope.addCondition($scope.consultation.condition);

            expect($scope.consultation.conditions.length).toBe(1);
            expect($scope.consultation.conditions[0].concept.uuid).toBe('headacheUuid');

        });

        it("should not add condition if exists as active",function () {
            var condition = new Bahmni.Common.Domain.Condition({
                uuid: 'headacheConditionUuid',
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'ACTIVE'
            });
            $scope.consultation.conditions = [condition];

            $scope.consultation.condition.concept ={name:'Headache',uuid:'headacheUuid'};

            $scope.addCondition($scope.consultation.condition);

            expect($scope.consultation.conditions.length).toBe(1);
            expect($scope.consultation.conditions[0]).toBe(condition);
        });

        it("should replace existing unsaved condition",function(){
            var condition = new Bahmni.Common.Domain.Condition({
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'ACTIVE'
            });
            $scope.consultation.conditions = [condition];

            $scope.consultation.condition.concept ={name:'Headache',uuid:'headacheUuid'};

            $scope.addCondition($scope.consultation.condition);

            expect($scope.consultation.conditions.length).toBe(1);
            expect($scope.consultation.conditions[0]).not.toBe(condition);
            expect($scope.consultation.conditions[0].concept.uuid).toBe(condition.concept.uuid);
        });
    });

    describe("markAs",function () {
        it("should set condition status and date",function () {
            var condition = new Bahmni.Common.Domain.Condition({
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'ACTIVE'
            });
            var onSetDate = DateUtil.parse('2014-04-09');
            DateUtil.today.and.returnValue(onSetDate);

            $scope.markAs(condition,'INACTIVE');

            expect(condition.status).toBe('INACTIVE');
            expect(condition.onSetDate).toBe(onSetDate);
        });
    });

    describe("cannotBeACondition",function () {
        it("should return true when diagnosis's concept is an existing active condition",function () {
            var diagnosis = {
                codedAnswer:{uuid:'headacheUuid'},
                certainty: 'CONFIRMED'
            };
            var condition = new Bahmni.Common.Domain.Condition({
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'ACTIVE'
            });
            $scope.consultation.conditions = [condition];

            expect($scope.cannotBeACondition(diagnosis)).toBeTruthy();
        });

        it("should return true when diagnosis is presumed",function () {
            var diagnosis = {
                codedAnswer:{uuid:'headacheUuid'},
                certainty: 'PRESUMED'
            };
            $scope.consultation.conditions = [];

            expect($scope.cannotBeACondition(diagnosis)).toBeTruthy();
        });

        it("should return false when diagnosis's concept is an existing not 'active condition'",function () {
            var diagnosis = {
                codedAnswer:{uuid:'headacheUuid'},
                certainty: 'CONFIRMED'
            };
            var condition = new Bahmni.Common.Domain.Condition({
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'INACTIVE'
            });
            $scope.consultation.conditions = [condition];

            expect($scope.cannotBeACondition(diagnosis)).toBeFalsy();
        });
    });

    describe("addConditionAsFollowUp",function () {
        it("should set condition as follow up",function () {
            $scope.followUpConditionConcept = {uuid:'followUpConditionConceptUuid'};
            var condition = new Bahmni.Common.Domain.Condition({
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'INACTIVE'
            });
            $scope.addConditionAsFollowUp(condition);
            expect(condition.isFollowUp).toBeTruthy();
        });
        it("should create obs for follow up condition", function () {
            $scope.followUpConditionConcept = {uuid:'followUpConditionConceptUuid'};
            var condition = new Bahmni.Common.Domain.Condition({
                uuid: 'conditionUuid',
                concept: {name:'Headache',uuid:'headacheUuid'},
                status: 'INACTIVE'
            });
            $scope.addConditionAsFollowUp(condition);
            expect($scope.consultation.followUpConditions.length).toBe(1);
            expect($scope.consultation.followUpConditions[0].concept.uuid).toBe('followUpConditionConceptUuid');
            expect($scope.consultation.followUpConditions[0].value).toBe('conditionUuid');

        });
    });

    describe("isRetrospectiveMode",function () {
        it("should invoke retrospectiveEntryService",function () {
            retrospectiveEntryService.isRetrospectiveMode.and.returnValue(true);

            expect($scope.isRetrospectiveMode).toBe(retrospectiveEntryService.isRetrospectiveMode);
            expect($scope.isRetrospectiveMode()).toBeTruthy();
            expect(retrospectiveEntryService.isRetrospectiveMode).toHaveBeenCalled();
        });
    });


});
