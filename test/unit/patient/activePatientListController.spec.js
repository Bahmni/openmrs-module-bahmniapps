'use strict';

describe("ActivePatientListController", function () {
    var patientService;
    var scope;
    var controller;
    var visitService;
    var route = {current : {params :{ location : "Ganiyari"}}};
    var visits =  [
                { patient: {display: "Ram Singh - GAN1234"} },
                { patient: {display: "Shyam Singh - BAM1234"} },
                { patient: {display: "Ganesh Singh - SEM1234"}}
            ];

    beforeEach(module('opd.patient'));
    beforeEach(inject(function () {
        patientService = jasmine.createSpyObj('PatientService', ['constructImageUrl']);
        patientService.constructImageUrl.andReturn("dumb");

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
                PatientService: patientService,
                VisitService : visitService,
                $route : route
            });
        });
    }

    describe("initialization", function () {
        it('should initialize configurations', function () {
            setUp();
            expect(visitService.getActiveVisits).toHaveBeenCalled();
            expect(patientService.constructImageUrl.callCount).toBe(3);
        });
    });

    describe("filterPatientListTest", function () {
        it('should filter the activePatients based on the search text (case insensitive)', function () {
            setUp();
            scope.searchParameter = "Gan"
            scope.activeVisits =
            [
                { patient: {display: "Ram Singh - GAN1234"} },
                { patient: {display: "Shyam Singh - BAM1234"} },
                { patient: {display: "Ganesh Singh - SEM1234"}}
            ]

            scope.filterPatientList();
            
            expect(scope.searchVisits.length).toBe(2);
        });
    });
});
