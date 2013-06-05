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

    beforeEach(angular.mock.module('registration.createPatient'));
    beforeEach(angular.mock.inject(function (date) {
        dateModule = date;
        location = jasmine.createSpyObj('$location', ['path','absUrl']);
        spinner = jasmine.createSpyObj('spinner', ['show', 'hide', 'forPromise'])
        location.absUrl = function(){return "/patient/new"};
        patientService = jasmine.createSpyObj('patientService', ['create', 'getPatient', 'rememberPatient']);
        createPromise = specUtil.createServicePromise('patientCreate');
        patientService.create.andReturn(createPromise);
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
                spinner: spinner
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
        describe("on sucess", function(){
            beforeEach(function(){
                setupController();
            });

            it('should redirect to new visit page', function() {
                scope.create()

                createPromise.callSuccesCallBack(createPatientResponse);

                expect(location.path).toHaveBeenCalledWith("/visit/new");
            })

            it('should set registration date to today', function() {
                var today = new Date("01-10-2012");
                spyOn(dateModule, 'now').andReturn(today);
                scope.create()

                createPromise.callSuccesCallBack(createPatientResponse);

                expect(scope.patient.registrationDate).toBe(today);
            })

            it('should update preferences with current values of centerID and hasOldIdentifier', function () {
                scope.hasOldIdentifier = true;
                scope.patient.centerID = {name: "SEM"};
                scope.create();

                createPromise.callSuccesCallBack(createPatientResponse);

                expect(preferences.hasOldIdentifier).toBe(true);
                expect(preferences.centerID).toBe("SEM");
            })
        });
    });
});
