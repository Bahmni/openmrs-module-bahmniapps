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

    beforeEach(angular.mock.module('registration.patient.controllers'));
    beforeEach(angular.mock.inject(['dateUtil', function (dateUtilInjected) {
        dateUtil = dateUtilInjected;
        location = jasmine.createSpyObj('$location', ['path','absUrl']);
        spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise'])
        location.absUrl = function(){return "/patient/new"};
        patientService = jasmine.createSpyObj('patientService', ['create', 'getPatient', 'rememberPatient']);
        createPromise = specUtil.createServicePromise('patientCreate');
        patientService.create.andReturn(createPromise);
        appDescriptor = {
            getExtensions : function(id) {
                return [];
            }
        };
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor'])
        appService.getAppDescriptor.andReturn(appDescriptor);
        //$route.current.params.visitType
        route = { "current" : { "params" : { "visitType" : "REG" } }};
    }]));

    var setupController = function(preferenceObj){
        preferences = preferenceObj != undefined ? preferenceObj : {identifierPrefix: "GAN", hasOldIdentifier: false };
        var patientConfiguration = new PatientConfig();
        patientConfiguration.identifierSources = [{name: "SEM", prefix: "SEM"}, {name: "SIV", prefix: "SIV"}, {name: "GAN", prefix: "GAN"}];
        inject(function($controller, $rootScope){
            scope = $rootScope.$new();
            controller = $controller('CreatePatientController', {
                $scope: scope,
                patientService: patientService,
                $location: location,
                Preferences: preferences,
                spinner: spinner,
                $rootScope: {encounterConfiguration: new EncounterConfig({visitTypes: {}}), patientConfiguration: patientConfiguration},
                appService: appService,
                $route: route
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
                    spyOn(scope.visitControl, 'createVisit').andReturn(createVisitPromise);
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
                        expect(location.path).toHaveBeenCalledWith("/patient/someUUID/visit");
                    });

                    it('should set registration date to today', function () {
                        var today = new Date("01-10-2012");
                        spyOn(dateUtil, 'now').andReturn(today);
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
