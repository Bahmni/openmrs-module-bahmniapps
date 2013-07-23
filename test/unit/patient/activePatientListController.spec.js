'use strict';

describe("ActivePatientListController", function () {
    var patientService;
    var scope;
    var controller;
    var patientListService;
    var route = {current : {params :{ location : "Ganiyari"}}};
    var patientsList = [{},{},{}];

    beforeEach(module('opd.patient'));
    beforeEach(inject(function () {
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

    describe("matchesNameOrId_name_Test", function () {
        it('should return if the patient name matches the search text', function () {
            setUp();
            scope.searchParameter = "ab"
            var patient = {name : "abc xyz",identifier:"pqr123",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"}
            var result = scope.matchesNameOrId(patient);
            expect(result).toBe(true);
        });
    });

    describe("matchesNameOrId_id_Test", function () {
        it('should return if the patient Id matches the search text', function () {
            setUp();
            scope.searchParameter = "r1"
            var patient = {name : "abc xyz",identifier:"pqr123",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"}
            var result = scope.matchesNameOrId(patient);
            expect(result).toBe(true);
        });
    });

    describe("matchesNameOrId_uuid_Test", function () {
        it('should not match uuid with the search text', function () {
            setUp();
            scope.searchParameter = "ed"
            var patient = {name : "abc xyz",identifier:"pqr123",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"}
            var result = scope.matchesNameOrId(patient);
            expect(result).toBe(false);
        });
    });

    describe("filterPatientListTest", function () {
        it('should filter the activePatientlist based on the search text', function () {
            setUp();
            scope.searchParameter = "abc"
            scope.activePatientsList =
            [
                {name : "abc xyz",identifier:"pqr123",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"},
                {name : "def ghi",identifier:"abc456",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"},
                {name : "jkl mno",identifier:"pqr123",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"}
            ]

            scope.filterPatientList();
            expect(scope.searchPatientList.length).toBe(2);
        });
    });

    describe("filterPatientList_uuid_Test", function () {
        it('should not filter the activePatientlist by matcing the search text in uuid', function () {
            setUp();
            scope.searchParameter = "ef"
            scope.activePatientsList =
                [
                    {name : "abc xyz",identifier:"pqr123",uuid:"0c3435ef-b590-4c8c-93e2-bee34f3e43b8"},
                    {name : "def ghi",identifier:"abc456",uuid:"0c3435ed-b590-4c8c-93e2-bee34f3e43b8"},
                    {name : "jkl mno",identifier:"pqr123",uuid:"0c3435ef-b590-4c8c-93e2-bee34f3e43b8"}
                ]

            scope.filterPatientList();
            expect(scope.searchPatientList.length).toBe(1);
        });
    });
});
