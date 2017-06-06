'use strict';

describe('VisitController', function () {
    var scope, $controller, success, encounterService, patientService, patient, dateUtil, $timeout, spinner,
        getEncounterPromise, getPatientPromise, stateParams, patientMapper, q, state, appService, appDescriptor,
        sessionService, messagingService, rootScope, visitService, visitController, location, window, bahmniCookieStore,
        offlineService, configurationService, auditLogService, params;

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

    beforeEach(module('bahmni.registration'));
    beforeEach(module('bahmni.common.offline'));
    beforeEach(module('stateMock'));
    beforeEach(module('pascalprecht.translate'));
    beforeEach(inject(['$injector', '$timeout', '$q', '$rootScope', '$state', '$translate', function ($injector, timeout, $q, $rootScope, $state) {
        q = $q;
        location = jasmine.createSpyObj('$location', ['url']);
        rootScope = $rootScope;
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
        offlineService = jasmine.createSpyObj('offlineService', ['isOfflineApp']);
        offlineService.isOfflineApp.and.returnValue(false);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        appDescriptor.getExtensions.and.returnValue([]);
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
        scope.currentProvider = {uuid: ''};
        patientMapper.map.and.returnValue(patient);

        rootScope.currentUser = {privileges: []};
        visitService.search.and.returnValue(searchActiveVisits([]));
        configurationService = jasmine.createSpyObj('configurationService', ['getConfigurations']);
        configurationService.getConfigurations.and.returnValue(specUtil.simplePromise({enableAuditLog: true}));
        auditLogService = jasmine.createSpyObj('auditLogService', ['auditLog']);
        auditLogService.auditLog.and.returnValue(specUtil.simplePromise({}));
    }]));

    function createController () {
        visitController = $controller('VisitController', {
            $window: window,
            $scope: scope,
            $bahmniCookieStore: bahmniCookieStore,
            $q: Q,
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
            offlineService: offlineService,
            configurationService: configurationService,
            auditLogService: auditLogService
        });
    }

    describe('initialization', function () {
        it('should set the patient from patient data', function () {
            createController();
            getPatientPromise.callThenCallBack(patient);
            getEncounterPromise.callThenCallBack({data: sampleEncounter });

            expect(scope.patient).toBe(patient);
        });
    });

    describe("submit", function () {
        beforeEach(function () {
            createController();
            visitController.visitUuid = 'visitUuid';
            getPatientPromise.callThenCallBack(patient);
            getEncounterPromise.callThenCallBack({data: sampleEncounter});
            encounterService.create.and.returnValue(specUtil.simplePromise({data: {visitTypeUuid: "visitTypeUuid"}}));
            var visitTypes = [{display: 'OPD', 'uuid': 'visitTypeUuid'}];
            visitService.getVisitType.and.returnValue(specUtil.simplePromise({data: {results: visitTypes}}));
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d"};
            params = {
                patientUuid: '21308498-2502-4495-b604-7b704a55522d',
                eventType: 'EDIT_VISIT',
                message: 'EDIT_VISIT_MESSAGE~{"visitUuid":"visitUuid","visitType":"OPD"}',
                module: 'registration'
            };
        });

        it("should validate save and reload current page if afterVisitSaveForwardUrl not specified", function (done) {
            state.expectTransitionTo(state.current);
            var submit = scope.submit();
            submit.then(function (response) {
                expect(encounterService.create).toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'REGISTRATION_LABEL_SAVED');
                state.ensureAllTransitionsHappened();
                expect(configurationService.getConfigurations).toHaveBeenCalledWith(['enableAuditLog']);
                expect(auditLogService.auditLog).toHaveBeenCalledWith(params);
                done();
            });
        });

        it("should validate save and redirect to url specify by afterVisitSaveForwardUrl", function (done) {
            appDescriptor.getConfigValue.and.callFake(function (value) {
                if (value == 'afterVisitSaveForwardUrl') {
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
                expect(configurationService.getConfigurations).toHaveBeenCalledWith(['enableAuditLog']);
                expect(auditLogService.auditLog).toHaveBeenCalledWith(params);
                done();
            });
        });

        it("should set the cookie with the current provider", function (done) {
            state.expectTransitionTo(state.current);
            var submit = scope.submit();
            submit.then(function (response) {
                expect(bahmniCookieStore.put).toHaveBeenCalled();
                expect(configurationService.getConfigurations).toHaveBeenCalledWith(['enableAuditLog']);
                expect(auditLogService.auditLog).toHaveBeenCalledWith(params);
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
            params = {
                patientUuid: '21308498-2502-4495-b604-7b704a55522d',
                eventType: 'CLOSE_VISIT',
                message: 'CLOSE_VISIT_MESSAGE~{"visitUuid":"visitUuid","visitType":"OPD"}',
                module: 'registration'
            };
            expect(configurationService.getConfigurations).toHaveBeenCalledWith(['enableAuditLog']);
            expect(auditLogService.auditLog).toHaveBeenCalledWith(params);
        });

        it("should not close visit when cancelled", function () {
            var visitSummary = {admissionDetails: null, dischargeDetails: null};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));
            window.confirm.and.returnValue(false);

            createController();
            scope.closeVisitIfDischarged();

            expect(visitService.endVisit).not.toHaveBeenCalled();
            expect(configurationService.getConfigurations).not.toHaveBeenCalled();
            expect(auditLogService.auditLog).not.toHaveBeenCalled();
        });

        it('should show error message when the patient is not discharged', function () {
            var visitSummary = {admissionDetails: {}, dischargeDetails: null, visitType: 'OPD'};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));

            createController();
            visitController.visitUuid = 'visitUuid';
            scope.closeVisitIfDischarged();

            expect(messagingService.showMessage).toHaveBeenCalled();
            params = {
                patientUuid: '21308498-2502-4495-b604-7b704a55522d',
                eventType: 'CLOSE_VISIT_FAILED',
                message: 'CLOSE_VISIT_FAILED_MESSAGE~{"visitUuid":"visitUuid","visitType":"OPD"}',
                module: 'registration'
            };
            expect(configurationService.getConfigurations).toHaveBeenCalledWith(['enableAuditLog']);
            expect(auditLogService.auditLog).toHaveBeenCalledWith(params);
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
});
