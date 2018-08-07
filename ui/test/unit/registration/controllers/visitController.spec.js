'use strict';

describe('VisitController', function () {
    var scope, $controller, success, encounterService, patientService, patient, dateUtil, $timeout, spinner,
        getEncounterPromise, getPatientPromise, stateParams, patientMapper, q, state, appService, appDescriptor,
        sessionService, messagingService, rootScope, visitService, visitController, location, window, bahmniCookieStore, auditLogService, messageParams, formService;

    var compile, provide;
    var html = '<div class="submit-btn-container"><button type="button" class="cancel" tabindex="-1" ng-click="cancelFunction()"></button><div class="right"><button ng-click="back()"></button><button single-click="clickFunction()" class="confirm"></button></div></div>';

    var stubAllPromise = function () {
        return {
            then: function () {
                return stubAllPromise();
            }
        };
    };
    var stubOnePromise = function (data) {
        return {
            then: function (callBack) {
                return callBack(data);
            }
        };
    };

    var searchActiveVisits = function (data) {
        return {
            then: function (successFn) {
                successFn({data: {results: data}});
            }
        };
    };
    var getVisitSummaryForUuid = function (summaryData) {
        return {
            then: function (successFn) {
                successFn({data: summaryData});
            }
        };
    };

    var sampleConfig = {
        "conceptData": {
            "WEIGHT": {
                "uuid": "b4aa3728-c79a-11e2-b0c0-8e397087571c"
            },
            "BMI": {
                "uuid": "b4acc09c-c79a-11e2-b0c0-8e397087571c"
            },
            "HEIGHT": {
                "uuid": "b4a7aa80-c79a-11e2-b0c0-8e397087571c"
            }
        },
        "encounterTypes": {
            "REG": "b45de99a-c79a-11e2-b0c0-8e397087571c"
        },
        "visitTypes": {
            "REG": "b45ca846-c79a-11e2-b0c0-8e397087571c",
            "REVISIT": "b5ba5576-c79a-11e2-b0c0-8e397087571c"
        }

    };
    var sampleEncounter = {
        "observations": []
    };

    var observationForms = [
        {
            "name": "Nutritional Values",
            "uuid": "f9041078-c6d7-4b9d-89a6-c97da2ce6164",
            "version": "1",
            "published": true
        }
    ];

    var extensions = [{
        "id": "bahmni.registration.conceptSetGroup.feeInformation",
            "extensionPointId": "org.bahmni.registration.conceptSetGroup.observations",
            "type": "forms",
            "extensionParams": {
            "formName": "Nutritional Values",
                "conceptNames": ["Height", "Weight", "BMI Data", "BMI Status Data"],
                "required":true,
                "showLatest": true
        },
        "order": 2,
        "requiredPrivilege": "Edit Visits"
    }];

    beforeEach(module('bahmni.common.uiHelper', function ($provide) {
        provide = $provide;
    }));

    beforeEach(module('bahmni.registration'));
    beforeEach(module('stateMock'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(inject(['$compile', '$injector', '$timeout', '$q', '$rootScope', '$state', '$translate', function ($compile, $injector, timeout, $q, $rootScope, $state) {
        q = $q;
        location = jasmine.createSpyObj('$location', ['url']);
        rootScope = $rootScope;
        compile = $compile;
        provide.value('$rootScope', $rootScope);

        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        stateParams = {patientUuid: '21308498-2502-4495-b604-7b704a55522d'};
        patient = {
            "patient": {
                uuid: "21308498-2502-4495-b604-7b704a55522d",
                isNew: "true",
                person: {
                    names: [
                        "name"
                    ]
                }
            }
        };
        state = $state;
        $controller = $injector.get('$controller');
        scope = {"$watch": jasmine.createSpy()};
        patientService = jasmine.createSpyObj('patientService', ['get', 'updateImage']);
        visitService = jasmine.createSpyObj('visitService', ['search', 'endVisit', 'getVisitSummary', 'getVisitType']);
        appService = jasmine.createSpyObj('appService', ['getDescription', 'getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue', 'getExtensions', 'formatUrl']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getExtensions.and.callFake(function(id, type){
            if (type === "forms") return extensions;
            return [];
        });
        patientMapper = jasmine.createSpyObj('patientMapper', ['map']);
        dateUtil = Bahmni.Common.Util.DateUtil;
        $timeout = timeout;
        success = jasmine.createSpy();
        $rootScope.regEncounterConfiguration = new Bahmni.Registration.RegistrationEncounterConfig({visitTypes: {}}, {encounterTypes: {"REG": "someUUID"}});
        $rootScope.currentProvider = {"uuid": "someUUID"};
        scope.regEncounterConfiguration = angular.extend(new Bahmni.Registration.RegistrationEncounterConfig(), sampleConfig);
        scope.encounterConfig = angular.extend(new EncounterConfig(), sampleConfig);
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        spinner.forPromise.and.callFake(function () {
        });
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        encounterService = jasmine.createSpyObj('encounterService', ['create', 'find']);
        window = jasmine.createSpyObj('window', ['confirm']);
        bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore', ['put']);
        getEncounterPromise = specUtil.createServicePromise('find');
        getPatientPromise = specUtil.createServicePromise('get');
        encounterService.find.and.returnValue(getEncounterPromise);
        patientService.get.and.returnValue(getPatientPromise);
        formService = jasmine.createSpyObj('formService', ['getFormList']);
        formService.getFormList.and.returnValue(specUtil.respondWithPromise(q, { data: observationForms }));
        scope.currentProvider = {uuid: ''};
        patientMapper.map.and.returnValue(patient);

        rootScope.currentUser = { privileges: [], isFavouriteObsTemplate: function() { return false; } };
        visitService.search.and.returnValue(searchActiveVisits([]));
        auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
        auditLogService.log.and.returnValue(specUtil.simplePromise({}));
    }]));

    function createController (digestEnabled) {
        visitController = $controller('VisitController', {
            $window: window,
            $scope: scope,
            $bahmniCookieStore: bahmniCookieStore,
            $q: digestEnabled ? q : Q,
            encounterService: encounterService,
            patientService: patientService,
            spinner: spinner,
            $state: state,
            $stateParams: stateParams,
            appService: appService,
            openmrsPatientMapper: patientMapper,
            sessionService: sessionService,
            messagingService: messagingService,
            visitService: visitService,
            $location: location,
            auditLogService: auditLogService,
            formService: formService
        });
    }

    describe('initialization', function () {
        afterEach(function () {
            rootScope.$apply();
        });

        it('should set the patient from patient data', function () {
            createController(true);
            getPatientPromise.callThenCallBack(patient);
            getEncounterPromise.callThenCallBack({data: sampleEncounter });
            rootScope.$digest();
            expect(scope.patient).toBe(patient);
            expect(scope.observationForms.length).toBe(1);
            expect(scope.observationForms[0].formName).toBe('Nutritional Values');
            expect(scope.observationForms[0].formVersion).toBe('1');
            expect(scope.observationForms[0].options.showLatest).toBe(true);
        });
    });

    describe("submit", function () {
        beforeEach(function () {
            createController(false);
            visitController.visitUuid = 'visitUuid';
            getPatientPromise.callThenCallBack(patient);
            getEncounterPromise.callThenCallBack({data: sampleEncounter});
            var encounterResponse = {
                visitTypeUuid: "visitTypeUuid",
                encounterUuid: "encounterUuid",
                encounterType: "REG"
            };
            encounterService.create.and.returnValue(specUtil.simplePromise({data: encounterResponse}));
            var visitTypes = [{display: 'OPD', 'uuid': 'visitTypeUuid'}];
            visitService.getVisitType.and.returnValue(specUtil.simplePromise({data: {results: visitTypes}}));
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d"};
            messageParams = {
                encounterUuid: encounterResponse.encounterUuid,
                encounterType: encounterResponse.encounterType
            };
        });

        it("should validate save and reload current page if afterVisitSaveForwardUrl not specified", function (done) {
            state.expectTransitionTo(state.current);
            var submit = scope.submit();
            submit.then(function (response) {
                expect(encounterService.create).toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'REGISTRATION_LABEL_SAVED');
                expect(auditLogService.log).toHaveBeenCalledWith(stateParams.patientUuid, 'EDIT_ENCOUNTER', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
                state.ensureAllTransitionsHappened();
                done();
            });
        });

        it("should validate save and redirect to url specify by afterVisitSaveForwardUrl", function (done) {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value === 'afterVisitSaveForwardUrl') {
                    return "#/search";
                } else {
                    return "";
                }
            });

            appDescriptor.formatUrl.and.callFake(function (value) {
                return value;
            });

            window.location = {
                href: ""
            };

            var submit = scope.submit();
            submit.then(function (response) {
                expect(encounterService.create).toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'REGISTRATION_LABEL_SAVED');
                expect(window.location.href).toBe('#/search');
                expect(auditLogService.log).toHaveBeenCalledWith(stateParams.patientUuid, 'EDIT_ENCOUNTER', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
                done();
            });
        });

        it("should set the cookie with the current provider", function (done) {
            state.expectTransitionTo(state.current);
            var submit = scope.submit();
            submit.then(function (response) {
                expect(bahmniCookieStore.put).toHaveBeenCalled();
                expect(auditLogService.log).toHaveBeenCalledWith(stateParams.patientUuid, 'EDIT_ENCOUNTER', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
                done();
            });
        });
    });

    describe("close active visit", function () {
        it("should set the visitUuid and canCloseVisit if there is an active visit for the patient", function () {
            var patientUuid = 'uuid';
            rootScope.visitLocation = 'visitLocation';
            rootScope.currentUser = {privileges: [{name: Bahmni.Common.Constants.closeVisitPrivilege}]};

            var mockSearchResults = [{uuid: patientUuid, location: {uuid: 'visitLocation'}}];
            visitService.search.and.returnValue(searchActiveVisits(mockSearchResults));
            createController();

            expect(visitController.visitUuid).toBe(patientUuid);
            expect(scope.canCloseVisit).toBeTruthy();
        });

        it("should not set the visitUuid and canCloseVisit if there is no an active visit for the patient in that location", function () {
            var patientUuid = 'uuid';
            rootScope.visitLocation = 'visitLocation';
            rootScope.currentUser = {privileges: [{name: Bahmni.Common.Constants.closeVisitPrivilege}]};

            var mockSearchResults = [{uuid: patientUuid, location: {uuid: 'someOtherVisitLocation'}}];
            visitService.search.and.returnValue(searchActiveVisits(mockSearchResults));
            createController();

            expect(visitController.visitUuid).toEqual("");
            expect(scope.canCloseVisit).toBeFalsy();
        });

        it("should NOT set the visitUuid and canCloseVisit if there is no active visit for the patient", function () {
            rootScope.currentUser = {privileges: [{name: Bahmni.Common.Constants.closeVisitPrivilege}]};
            visitService.search.and.returnValue(searchActiveVisits([]));
            createController();

            expect(visitController.visitUuid).toEqual("");
            expect(scope.canCloseVisit).toBeFalsy();
        });
    });

    describe('getMessage', function () {
        it('should return message', function () {
            scope.message = "message";
            createController();
            expect(scope.getMessage()).toBe(scope.message);
        });
    });

    describe('close visit', function () {
        it("should close visit on confirmation", function () {
            var visitSummary = {admissionDetails: null, dischargeDetails: null, visitType: 'OPD'};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));
            window.confirm.and.returnValue(true);
            visitService.endVisit.and.returnValue(specUtil.createFakePromise());
            createController();
            visitController.visitUuid = 'visitUuid';

            scope.closeVisitIfDischarged();

            expect(visitService.endVisit).toHaveBeenCalledWith('visitUuid');
            messageParams = {visitUuid: visitController.visitUuid, visitType: visitSummary.visitType};
            expect(auditLogService.log).toHaveBeenCalledWith(stateParams.patientUuid, 'CLOSE_VISIT', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });

        it("should not close visit when cancelled", function () {
            var visitSummary = {admissionDetails: null, dischargeDetails: null};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));
            window.confirm.and.returnValue(false);

            createController();
            scope.closeVisitIfDischarged();

            expect(visitService.endVisit).not.toHaveBeenCalled();
            expect(auditLogService.log).not.toHaveBeenCalled();
        });

        it('should show error message when the patient is not discharged', function () {
            var visitSummary = {admissionDetails: {}, dischargeDetails: null, visitType: 'OPD'};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));

            createController();
            visitController.visitUuid = 'visitUuid';
            scope.closeVisitIfDischarged();

            expect(messagingService.showMessage).toHaveBeenCalled();
            messageParams = {visitUuid: visitController.visitUuid, visitType: visitSummary.visitType};
            expect(auditLogService.log).toHaveBeenCalledWith(stateParams.patientUuid, 'CLOSE_VISIT_FAILED', messageParams, 'MODULE_LABEL_REGISTRATION_KEY');
        });
    });

    it('update patient image', function () {
        var image = {
            replace: function () {
            }
        };
        scope.patient = {uuid: 1};
        createController();
        scope.updatePatientImage(image);
        expect(patientService.updateImage).toHaveBeenCalled();
    });

    it('should check if it is a form template', function() {
       createController();
       expect(scope.isFormTemplate({formUuid :'someUuid' })).toEqual('someUuid');
       expect(scope.isFormTemplate({name :'someName' })).toEqual(undefined);
    });

    it("should not call save twice", function () {
        var element = angular.element("<button single-click='clickFunction()'></button>");
        var compiled = compile(element)(rootScope);
        rootScope.$digest();

        var deferred = q.defer();
        rootScope.clickFunction = jasmine.createSpy('clickFunction');
        rootScope.clickFunction.and.returnValue(deferred.promise);

        expect(element).not.toBeUndefined();

        compiled.triggerHandler('click');
        expect(rootScope.clickFunction.calls.count()).toEqual(1);

        compiled.triggerHandler('click');
        deferred.resolve();
        rootScope.$apply();
        expect(rootScope.clickFunction.calls.count()).toEqual(1);

        compiled.triggerHandler('click');
        expect(rootScope.clickFunction.calls.count()).toEqual(2);
    });

    it("should not call save twice for a visit", function () {
        var ele = angular.element(html);
        var element = $(ele).find(".confirm");
        var compiled = compile(element)(rootScope);
        rootScope.$digest();

        var deferred = q.defer();
        rootScope.clickFunction = jasmine.createSpy('clickFunction');
        rootScope.clickFunction.and.returnValue(deferred.promise);

        expect(element).not.toBeUndefined();
        expect(element.hasClass('confirm')).toBeTruthy();

        compiled.triggerHandler('click');
        expect(rootScope.clickFunction.calls.count()).toEqual(1);

        compiled.triggerHandler('click');
        deferred.resolve();
        rootScope.$apply();
        expect(rootScope.clickFunction.calls.count()).toEqual(1);

        compiled.triggerHandler('click');
        expect(rootScope.clickFunction.calls.count()).toEqual(2);
    });

});
