'use strict';

describe('CreatePatientController', function () {
    var scope;
    var patientService;
    var controller;
    var patient = {givenName: "some", familyName: "name"};
    var createPatientResponse = {identifier: "someIdentifier", uuid: "someUUID", name: "some name"};
    var location;
    var preferences;
    var createPromise;
    var dateModule;
    var spinner;
    var appService;
    var route;

    beforeEach(angular.mock.module('registration.patient.controllers'));
    beforeEach(angular.mock.inject(function (date) {
        dateModule = date;
        location = jasmine.createSpyObj('$location', ['path','absUrl']);
        spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise'])
        location.absUrl = function(){return "/patient/new"};
        patientService = jasmine.createSpyObj('patientService', ['create', 'getPatient', 'rememberPatient']);
        createPromise = specUtil.createServicePromise('patientCreate');
        patientService.create.andReturn(createPromise);
        appService = jasmine.createSpyObj('appService', ['allowedAppExtensions'])
        appService.allowedAppExtensions.andReturn([]);
        //$route.current.params.visitType
        route = { "current" : { "params" : { "visitType" : "REG" } }};
    }));

    var setupController = function(preferenceObj){
        preferences = preferenceObj != undefined ? preferenceObj : {centerID: "GAN", hasOldIdentifier: false };
        inject(function($controller, $rootScope){
            scope = $rootScope.$new();
            controller = $controller('CreatePatientController',{
                $scope: scope,
                patientService: patientService,
                $location: location,
                Preferences: preferences,
                spinner: spinner,
                $rootScope: {encounterConfiguration: new EncounterConfig({visitTypes: {}})},
                appService: appService,
                $route: route
            });
        });
    }

    describe('initialization', function () {
        it('should set up centers for Center ID dropdown', function () {
            setupController();

            expect(Array.isArray(scope.centers)).toBeTruthy();
            expect(scope.centers.length).toBe(4);
        });

        it('should initialize centerID and hasOldIdentifier from preferences', function() {
            setupController({centerID: "SIV", hasOldIdentifier: true});

            expect(scope.patient.centerID.name).toBe('SIV');
            expect(scope.hasOldIdentifier).toBe(true);
        });
    });

    describe('create', function () {
        describe("on sucessful patient create", function(){
            beforeEach(function(){
                setupController();
            });

            describe('when submit source is startVisit', function(){
                var createVisitPromise = specUtil.createServicePromise('createVisit');
                beforeEach(function() {
                    scope.submitSource = 'startVisit';
                    spyOn(scope.visitControl, 'createVisit').andReturn(createVisitPromise);
                });

                it('should create visit', function(){
                    scope.create()
                    
                    createPromise.callSuccessCallBack(createPatientResponse);

                    expect(scope.visitControl.createVisit).toHaveBeenCalled();
                });

                describe('on sucessful visit create', function(){
                    beforeEach(function(){
                        scope.create()
                        createPromise.callSuccessCallBack(createPatientResponse);
                    });

                    it('should redirect to new visit page', function() {
                        createVisitPromise.callSuccessCallBack();

                        expect(location.path).toHaveBeenCalledWith("/patient/someUUID/visit");
                    });

                    it('should set registration date to today', function() {
                        var today = new Date("01-10-2012");
                        spyOn(dateModule, 'now').andReturn(today);

                        createVisitPromise.callSuccessCallBack();

                        expect(scope.patient.registrationDate).toBe(today);
                    });
                });
            });

            it('should update preferences with current values of centerID and hasOldIdentifier', function () {
                scope.hasOldIdentifier = true;
                scope.patient.centerID = {name: "SEM"};
                scope.create();

                createPromise.callSuccessCallBack(createPatientResponse);

                expect(preferences.hasOldIdentifier).toBe(true);
                expect(preferences.centerID).toBe("SEM");
            })
        });
    });
});
