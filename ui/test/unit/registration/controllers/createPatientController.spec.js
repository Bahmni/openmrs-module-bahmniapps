'use strict';

describe('CreatePatientController', function () {
    var scope;
    var patientService;
    var controller;
    var patient = {givenName: "some", familyName: "name"};
    var createPatientResponse = {patient: {identifier: "someIdentifier", uuid: "someUUID", name: "some name"}};
    var location;
    var preferences;
    var createPromise;
    var dateUtil;
    var spinner;
    var appDescriptor;
    var appService;
    var route;
    var registrationCardPrinter;
    var sessionService;

    beforeEach(module('bahmni.registration'));
    beforeEach(inject([function () {
        dateUtil = Bahmni.Common.Util.DateUtil;
        location = jasmine.createSpyObj('$location', ['url','absUrl','search']);
        spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise'])
        location.absUrl = function(){return "/patient/new"};
        patientService = jasmine.createSpyObj('patientService', ['create', 'getPatient']);
        createPromise = specUtil.createServicePromise('patientCreate');
        registrationCardPrinter = jasmine.createSpyObj('registrationCardPrinter', ['print']);
        patientService.create.and.returnValue(createPromise);
        appDescriptor = {
            getExtensions : function(id) {
                return [
                    {
                        "id": "bahmni.patient.edit.action.startVisit",
                        "extensionPointId": "org.bahmni.registration.patient.edit.action",
                        "type": "config",
                        "extensionParams" : {
                            "action" : "startVisit",
                            "display": "Start Visit",
                            "forwardUrl" : "/patient/{{patientUuid}}/visit"
                        },
                        "order": 1,
                        "requiredPrivilege": "Add Visits"
                    }
                ];
            },
            getConfigValue: function() {
                return 'OPD'
            },
            formatUrl: function(){
                return "/patient/someUUID/visit"
            }
        };
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.and.returnValue(appDescriptor);
        location.url.and.returnValue(location);
        //$route.current.params.visitType
        route = { "current" : { "params" : { "visitType" : "REG" } }};
        sessionService = jasmine.createSpyObj('sessionService', ['getLoginLocationUuid']);
    }]));

    var setupController = function(preferenceObj){
        preferences = preferenceObj != undefined ? preferenceObj : {identifierPrefix: "GAN", hasOldIdentifier: false };
        var patientConfiguration = new Bahmni.Registration.PatientConfig();
        patientConfiguration.identifierSources = [{name: "SEM", prefix: "SEM"}, {name: "SIV", prefix: "SIV"}, {name: "GAN", prefix: "GAN"}];
        inject(function($controller, $rootScope){
            scope = $rootScope.$new();
            controller = $controller('CreatePatientController', {
                $scope: scope,
                patientService: patientService,
                $location: location,
                Preferences: preferences,
                spinner: spinner,
                $rootScope: {regEncounterConfiguration: new Bahmni.Registration.RegistrationEncounterConfig({visitTypes: {}},{encounterTypes: {"REG" : "someUUID"}}), patientConfiguration: patientConfiguration },
                appService: appService,
                $route: route,
                registrationCardPrinter: registrationCardPrinter,
                sessionService: sessionService

        });
        });
    };

    describe('initialization', function () {
        it('should set up centers for ID prefix dropdown', function () {
            setupController();

            expect(Array.isArray(scope.identifierSources)).toBeTruthy();
            expect(scope.identifierSources.length).toBe(3);
        });

        it('should initialize identifierPrefix and hasOldIdentifier from preferences', function() {
            setupController({identifierPrefix: 'SIV', hasOldIdentifier: true});
            expect(scope.patient.identifierPrefix.prefix).toBe('SIV');
            expect(scope.hasOldIdentifier).toBe(true);
        });
    });

    describe('create', function () {
        describe("on sucessful patient create", function () {
            beforeEach(function () {
                setupController();
            });

            describe('when submit source is startVisit', function () {
                var createVisitPromise = specUtil.createServicePromise('createVisit');
                beforeEach(function () {
                    scope.submitSource = 'startVisit';
                    spyOn(scope.visitControl, 'createVisit').and.returnValue(createVisitPromise);
                });

                it('should create visit', function () {
                    scope.patient.identifier = "someid";
                    scope.create();
                    createPromise.callSuccessCallBack(createPatientResponse);
                    expect(scope.visitControl.createVisit).toHaveBeenCalled();
                });

                describe('on sucessful visit create', function () {
                    beforeEach(function () {
                        scope.patient.identifier = "someid";
                        scope.create();
                        createPromise.callSuccessCallBack(createPatientResponse);
                    });

                    it('should redirect to new visit page', function () {
                        createVisitPromise.callSuccessCallBack();
                        expect(location.url).toHaveBeenCalledWith("/patient/someUUID/visit");
                        expect(location.search).toHaveBeenCalledWith({newpatient: 'true'});
                    });

                    it('should set registration date to today', function () {
                        var today = new Date("01-10-2012");
                        spyOn(dateUtil, 'now').and.returnValue(today);
                        createVisitPromise.callSuccessCallBack();
                        expect(scope.patient.registrationDate).toBe(today);
                    });
                });
            });

            it('should update preferences with current values of centerID and hasOldIdentifier', function () {
                scope.hasOldIdentifier = true;
                scope.patient.identifierPrefix = {name: "SEM", prefix: "SEM"};
                scope.patient.identifier = "someid";
                scope.create();

                expect(preferences.hasOldIdentifier).toBe(true);
                expect(preferences.identifierPrefix).toBe("SEM");
            })
        });
    });
});
