'use strict';

describe("ActivePatientListController", function () {
    var patientMapper;
    var scope;
    var controller;
    var visitService;
    var route = {current : {params :{ location : "Ganiyari"}}};

    var allActivePatients =  [
                {identifier:'GAN1234', name:'Ram Singh',   uuid:'p-uuid-1', activeVisitUuid:'v-uuid-1'},
                {identifier:'BAM1234', name:'Shyam Singh', uuid:'p-uuid-2', activeVisitUuid:'v-uuid-2'},
                {identifier:'SEM1234', name:'Ganesh Singh',uuid:'p-uuid-3', activeVisitUuid:'v-uuid-3'},
                {identifier:'GAN1235', name:'Gani Singh',  uuid:'p-uuid-4', activeVisitUuid:'v-uuid-4'}
            ];
    var allActivePatientsForAdmission =  [
                {identifier:'GAN1235', name:'Gani Singh',  uuid:'p-uuid-4', activeVisitUuid:'v-uuid-4'}
            ];


    beforeEach(module('opd.patient'));
    beforeEach(inject(function () {
        patientMapper = jasmine.createSpyObj('patientMapper', ['constructImageUrl']);
        patientMapper.constructImageUrl.andReturn("dumb");

        visitService = jasmine.createSpyObj('VisitService', ['getAllActivePatients', 'getAllActivePatientsForAdmission']);
        visitService.getAllActivePatients.andReturn({success:function (callBack) {
            return callBack(allActivePatients);
        }});

        visitService.getAllActivePatientsForAdmission.andReturn({success:function (callBack) {
            return callBack(allActivePatientsForAdmission);
        }});

    }));

    var setUp = function(){
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('ActivePatientsListController',{
                $scope : scope,
                patientMapper: patientMapper,
                VisitService : visitService,
                $route : route
            });
        });
    }

    describe("initialization", function () {
        it('should initialize configurations', function () {
            setUp();
            expect(visitService.getAllActivePatients).toHaveBeenCalled();
            expect(patientMapper.constructImageUrl.callCount).toBe(4);
        });
    });

    describe("searchPatientsTest", function () {
        it('should search the activePatients based on the search text (case insensitive)', function () {
            setUp();
            scope.searchCriteria.searchParameter = "Gan";
            scope.showPatientsForType('ALL');
            expect(scope.searchResults.length).toBe(3);
        });

        it('should filter the activePatients to be admitted based on the search text', function () {
            setUp();
            scope.searchCriteria.searchParameter = "Gan";
            scope.showPatientsForType('TO_ADMIT');
            expect(scope.searchResults.length).toBe(1);
        });
    });
});
