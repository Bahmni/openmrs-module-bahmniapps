'use strict';

describe("ActivePatientListController", function () {
    var patientService;
    var scope;
    var controller;
    var patientListService;
    var route = {current : {params :{ location : "Ganiyari"}}};
    var patientsList = {'activePatientsList' : [{},{},{}]};

    beforeEach(angular.mock.module('opd.activePatientsListController'));
    beforeEach(angular.mock.inject(function () {
        patientService = jasmine.createSpyObj('PatientService', ['constructImageUrl']);
        patientService.constructImageUrl.andReturn("dumb");

        patientListService = jasmine.createSpyObj('PatientsListService', ['getActivePatients'])
        patientListService.getActivePatients.andReturn({success:function (callBack) {
            return callBack(patientsList);
        }});
    }));

    var setUp = function(){
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('ActivePatientsListController',{
                $scope : scope,
                PatientService: patientService,
                PatientsListService : patientListService,
                $route : route
            });
        });
    }

    describe("initialization", function () {
        it('should initialize configurations', function () {
            setUp();
            expect(patientListService.getActivePatients).toHaveBeenCalled();
            expect(patientService.constructImageUrl.callCount).toBe(3);
        });
    });
});
