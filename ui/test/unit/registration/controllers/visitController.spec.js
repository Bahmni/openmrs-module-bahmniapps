'use strict';

describe('VisitController', function () {
    var scope;
    var $controller;
    var success;
    var encounterService;
    var patientService;
    var patient;
    var dateUtil;
    var $timeout;
    var spinner;
    var getEncounterPromise;
    var getPatientPromise;
    var stateParams;
    var patientMapper;
    var q;
    var state;
    var appService;
    var appDescriptor;
    var sessionService;
    var messagingService;
    var rootScope;
    var visitService;
    var visitController;
    var location;
    var window;
    var bahmniCookieStore;

    var stubAllPromise = function () {
        return {
            then: function () {
                return stubAllPromise();
            }
        }
    };
    var stubOnePromise = function () {
        return {
            then: function (callBack) {
                return callBack();
            }
        }
    };

    var searchActiveVisits = function (data) {
        return {
            then: function (successFn) {
                successFn({data : {results: data}});
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
    beforeEach(module('stateMock'));
    beforeEach(module('pascalprecht.translate'))
    beforeEach(inject(['$injector', '$timeout', '$q', '$rootScope', '$state', '$translate', function ($injector, timeout, $q, $rootScope, $state, $translate) {
        q = $q;
        location = jasmine.createSpyObj('$location', ['url']);
        rootScope = $rootScope;
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);
        stateParams = {patientUuid: '21308498-2502-4495-b604-7b704a55522d'};
        patient = { "patient" : {
            uuid: "21308498-2502-4495-b604-7b704a55522d",
            isNew: "true",
            person: {
                names: [
                    "name"
                ]
            }
        }};
        state = $state;
        $controller = $injector.get('$controller');
        scope = {"$watch": jasmine.createSpy()};
        patientService = jasmine.createSpyObj('patientService', ['get','updateImage']);
        visitService = jasmine.createSpyObj('visitService', ['search', 'endVisit', 'getVisitSummary']);
        appService = jasmine.createSpyObj('appService', ['getDescription', 'getAppDescriptor']);
        appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue', 'getExtensions', 'formatUrl']);
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
            return;
        });
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
        encounterService = jasmine.createSpyObj('encounterService', ['create', 'find']);
        window = jasmine.createSpyObj('window', ['confirm']);
        bahmniCookieStore = jasmine.createSpyObj('$bahmniCookieStore',['put']);
        getEncounterPromise = specUtil.createServicePromise('find');
        getPatientPromise = specUtil.createServicePromise('get');
        encounterService.find.and.returnValue(getEncounterPromise);
        patientService.get.and.returnValue(getPatientPromise);
        scope.currentProvider = {uuid: ''};
        patientMapper.map.and.returnValue(patient);

        rootScope.currentUser = {privileges: []};
        visitService.search.and.returnValue(searchActiveVisits([]));

    }]));

    function createController() {
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
            $location: location
        });
    }

    describe('initialization', function () {
        it('should set the patient from patient data', function () {
            createController();
            getPatientPromise.callThenCallBack(patient);
            getEncounterPromise.callSuccessCallBack(sampleEncounter);

            expect(scope.patient).toBe(patient);
        });

    });

    describe("submit", function () {
        beforeEach(function () {
            createController();
            getPatientPromise.callThenCallBack(patient);
            getEncounterPromise.callSuccessCallBack(sampleEncounter);

            encounterService.create.and.callFake(stubOnePromise);
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d"};
        });

        it("should validate save and reload current page if afterVisitSaveForwardUrl not specified", function (done) {
            state.expectTransitionTo(state.current);
            var submit = scope.submit();
            submit.then(function (response) {
                expect(encounterService.create).toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'REGISTRATION_LABEL_SAVED');
                state.ensureAllTransitionsHappened();
                done();
            });
        });

        it("should validate save and redirect to url specify by afterVisitSaveForwardUrl", function (done) {

            appDescriptor.getConfigValue.and.callFake(function(value) {
                if (value == 'afterVisitSaveForwardUrl') {
                    return "/search";
                }
                else {
                    return "";
                }
            });

            appDescriptor.formatUrl.and.callFake(function(value) {
                return value;
            });

            var submit = scope.submit();
            submit.then(function (response) {
                expect(encounterService.create).toHaveBeenCalled();
                expect(messagingService.showMessage).toHaveBeenCalledWith('info', 'REGISTRATION_LABEL_SAVED');
                expect(location.url).toHaveBeenCalledWith("/search");
                done();
            });
        });

        it("should set the cookie with the current provider", function(done){
            state.expectTransitionTo(state.current);
            var submit = scope.submit();
            submit.then(function(response){
                expect(bahmniCookieStore.put).toHaveBeenCalled();
                done();
            })
        })
    });

    describe("close active visit", function () {

        it("should set the visitUuid and canCloseVisit if there is an active visit for the patient", function () {
            var patientUuid = 'uuid';
            rootScope.currentUser = {privileges: [{name: Bahmni.Common.Constants.closeVisitPrivilege}]};
            visitService.search.and.returnValue(searchActiveVisits([{uuid: patientUuid}]));
            createController();

            expect(visitController.visitUuid).toBe(patientUuid);
            expect(scope.canCloseVisit).toBeTruthy();
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
            var visitSummary = {admissionDetails: null, dischargeDetails: null};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));
            window.confirm.and.returnValue(true);
            visitService.endVisit.and.returnValue({
                then: function (successFn) {}
            });

            createController();
            scope.closeVisitIfDischarged();

            expect(visitService.endVisit).toHaveBeenCalled();
        });

        it("should not close visit when cancelled", function () {
            var visitSummary = {admissionDetails: null, dischargeDetails: null};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));
            window.confirm.and.returnValue(false);

            createController();
            scope.closeVisitIfDischarged();

            expect(visitService.endVisit).not.toHaveBeenCalled();
        });

        it('should show error message when the patient is not discharged', function () {
            var visitSummary = {admissionDetails: {}, dischargeDetails: null};
            visitService.getVisitSummary.and.returnValue(getVisitSummaryForUuid(visitSummary));

            createController();
            scope.closeVisitIfDischarged();

            expect(messagingService.showMessage).toHaveBeenCalled();
        });

    });

    it('update patient image', function() {
        var image = {replace: function() {}};
        scope.patient = {uuid: 1};
        createController();
        scope.updatePatientImage(image);
        expect(patientService.updateImage).toHaveBeenCalled();
    })

});