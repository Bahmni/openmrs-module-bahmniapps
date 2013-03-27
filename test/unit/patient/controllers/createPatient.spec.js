'use strict';

describe('CreateNewPatientController', function () {
    var scope;
    var patientService;
    var controller;
    var patient = {givenName: "some", familyName: "name"};
    var createPatientResponse = {identifier: "someIdentifier", uuid: "someUUID", name: "some name"};
    var location;
    var preferences;

    beforeEach(angular.mock.module('registration.createPatient'));
    beforeEach(angular.mock.inject(function ($injector) {
        location = jasmine.createSpyObj('$location', ['path']);

        patientService = jasmine.createSpyObj('patientService', ['create', 'getPatient', 'rememberPatient']);
        patientService.getPatient.andReturn(patient);
        patientService.create.andReturn({
            success: function(callback) {
                callback(createPatientResponse)
            }
        });
    }));

    var setupController = function(preferenceObj){
        preferences = preferenceObj != undefined ? preferenceObj : {centerID: "GAN", hasOldIdentifier: false };
        inject(function($controller, $rootScope, $location){
            scope = $rootScope.$new();
            controller = $controller('CreateNewPatientController',{
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
        it('should call patient service to create a new patient and remeber it', function () {
            setupController();
            scope.create()

            expect(patientService.create).toHaveBeenCalledWith(patient);
            expect(scope.patient.identifier).toBe("someIdentifier");
            expect(scope.patient.uuid).toBe("someUUID");
            expect(scope.patient.name).toBe("some name");
            expect(patientService.rememberPatient).toHaveBeenCalledWith(patient);
        });

        it('should redirect to visitinformation page', function() {
            setupController();
     
            scope.create()
            expect(location.path).toHaveBeenCalledWith("/visitinformation");
        })

        it('should update preferences with current values of centerID and hasOldIdentifier', function () {
            setupController();

            scope.hasOldIdentifier = true;
            scope.patient.centerID = {name: "SEM"};
        
            scope.create();

            expect(preferences.hasOldIdentifier).toBe(true);
            expect(preferences.centerID).toBe("SEM");
        });
    });
});
