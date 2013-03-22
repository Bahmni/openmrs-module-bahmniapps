'use strict';

describe('VisitController', function () {
    var scope = { "$watch": jasmine.createSpy() }, $controller, conceptService, success, visitService, patientService, patient, date;

    var sampleConcepts={
        "results": [
            {
                "setMembers": [
                    {
                        "uuid": "d7c66ef3-1f55-4b83-8f10-009e4acec1e3",
                        "name": {
                            "name": "CHIEF COMPLAINT"
                        }
                    },
                    {
                        "uuid": "8032ad29-0591-4ec6-9776-22e7a3062df8",
                        "name": {
                            "name": "REGISTRATION FEES"
                        }
                    }
                ]
            }
        ]
    }

    beforeEach(angular.mock.module('registration.visitController'));
    beforeEach(angular.mock.inject(['$injector', 'date', function ($injector, dateModule) {
        $controller = $injector.get('$controller');
        patientService = jasmine.createSpyObj('patientService', ['getPatient']);
        date = dateModule;
        patient = {};
        patientService.getPatient.andReturn(patient);
        visitService = jasmine.createSpyObj('visit', ['create']);
        success = jasmine.createSpy();
        conceptService = {
            getRegistrationConcepts: function () {
                return {
                    success: function (callBack) {
                        callBack(sampleConcepts);
                    }
                }
            }
        };

    }]));

    describe('initialization', function () {
        it('should set the patient from patient data and the default registration fee', function () {
            $controller('VisitController', {
                $scope: scope,
                concept: conceptService,
                patientService: patientService
            });

           expect(scope.obs.registration_fees).toBe(defaults.registration_fees);
           expect(scope.patient).toBe(patient);
        });
    });

    describe("create", function(){
        it("should create visit", function(){
            $controller('VisitController', {
                $scope: scope,
                concept: conceptService,
                patientService: patientService,
                visitService: visitService,
                date: date
            });
            var now = new Date();
            spyOn(date, "now").andReturn(now)
            scope.patient = {uuid: "21308498-2502-4495-b604-7b704a55522d"}
            scope.obs.chief_complaint = "ache";
            scope.obs.registration_fees = "100";

            scope.create();

            expect(scope.visit.patient).toBe(scope.patient.uuid);
            expect(scope.visit.startDatetime).toBe(now.toISOString());
            expect(scope.visit.visitType).toBe(constants.visitType.registration);
            expect(scope.encounter.patient).toBe(scope.patient.uuid);
            expect(scope.encounter.encounterDatetime).toBe(now.toISOString());
            expect(scope.encounter.encounterType).toBe(constants.visitType.registration);
            expect(scope.encounter.obs).toEqual([{concept: "d7c66ef3-1f55-4b83-8f10-009e4acec1e3",value: "ache"},{concept: "8032ad29-0591-4ec6-9776-22e7a3062df8",value: "100"}])
            expect(scope.visit.encounters).toEqual([scope.encounter]) ;
            expect(visitService.create).toHaveBeenCalledWith(scope.visit);

        });
    });
});