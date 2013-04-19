'use strict';

describe('CreatePatientController', function () {
    var scope;
    var patientService;
    var controller;
    var patient = {givenName: "some", familyName: "name"};
    var createPatientResponse = {identifier: "someIdentifier", uuid: "someUUID", name: "some name"};
    var location;
    var preferences;
    var success;
    var errorCallback;

    beforeEach(angular.mock.module('registration.createPatient'));
    beforeEach(angular.mock.inject(function () {
        location = jasmine.createSpyObj('$location', ['path','absUrl']);
        location.absUrl = function(){return "/patient/new"};
        success = jasmine.createSpy('Successful');
        errorCallback = jasmine.createSpy('errorCallback');

        patientService = jasmine.createSpyObj('patientService', ['create', 'getPatient', 'rememberPatient']);
        patientService.getPatient.andReturn(patient);
        var createPromise =   {
            success: function(callback) {
                callback(createPatientResponse);
                return this;
            },
            error: function(callback) {
                return this;
            }
        }
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
                Preferences: preferences
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
            setupController({centerID: "SHI", hasOldIdentifier: true});

            expect(scope.patient.centerID.name).toBe('SHI');
            expect(scope.hasOldIdentifier).toBe(true);
        });
    });

    describe('create', function () {
        it('should redirect to new visit page', function() {
            setupController();
     
            scope.create()
            expect(location.path).toHaveBeenCalledWith("/visit/new");
        })

        it('should update preferences with current values of centerID and hasOldIdentifier', function () {
            setupController();

            scope.hasOldIdentifier = true;
            scope.patient.centerID = {name: "SEM"};
        
            scope.create();

            expect(preferences.hasOldIdentifier).toBe(true);
            expect(preferences.centerID).toBe("SEM");
        })
    });
});
