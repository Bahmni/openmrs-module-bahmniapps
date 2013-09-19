'use strict';

describe("ActivePatientListController", function () {
    var patientMapper;
    var scope;
    var controller;
    var visitService;
    var route = {current : {params :{ location : "Ganiyari"}}};
    var visits =  [
                { patient: {identifiers:[{identifier:'GAN1234'}], names:[{display:   'Ram Singh'}]}, encounters:[] },
                { patient: {identifiers:[{identifier:'BAM1234'}], names:[{display: 'Shyam Singh'}]}, encounters:[] }, 
                { patient: {identifiers:[{identifier:'SEM1234'}], names:[{display:'Ganesh Singh'}]}, encounters:[] },
                { patient: {identifiers:[{identifier:'GAN1235'}], names:[{display:'  Gani Singh'}]}, encounters:[{orders:[{concept:{display:'Anaemia Panel'}}]}] }
            ];

    beforeEach(module('opd.patient'));
    beforeEach(inject(function () {
        patientMapper = jasmine.createSpyObj('patientMapper', ['constructImageUrl']);
        patientMapper.constructImageUrl.andReturn("dumb");

        visitService = jasmine.createSpyObj('VisitService', ['getActiveVisits'])
        visitService.getActiveVisits.andReturn({success:function (callBack) {
            return callBack({results: visits});
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
            expect(visitService.getActiveVisits).toHaveBeenCalled();
            expect(patientMapper.constructImageUrl.callCount).toBe(4);
        });
    });

    describe("filterPatientListTest", function () {
        it('should filter the activePatients based on the search text (case insensitive)', function () {
            setUp();
            scope.searchCriteria.searchParameter = "Gan";
            scope.showPatientsForType('ALL');
            scope.filterPatientList();
            expect(scope.searchVisits.length).toBe(3);
        });

        it('should filter the activePatients to be admitted based on the search text', function () {
            setUp();
            scope.searchCriteria.searchParameter = "Gan";
            scope.showPatientsForType('TO_ADMIT');
            scope.filterPatientList();
            expect(scope.searchVisits.length).toBe(1);
        });
    });
});
