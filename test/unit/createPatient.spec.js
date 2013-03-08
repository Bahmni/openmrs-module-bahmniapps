'use strict';

describe('CreateNewPatientController', function () {
    var scope = {}, patientService, patientAttributeTypeService = {}, success,
        $controller,
        samplePatientAttributeTypes = {
            "results": [
                {
                    "uuid": "be4f3f8a-862c-11e2-a490-afe87ebb32c9",
                    "display": "oldPatientIdentifier - Old Patient Identifier",
                    "name": "oldPatientIdentifier",
                    "links": [
                        {
                            "uri": "http://localhost:8080/openmrs/ws/rest/v1/personattributetype/be4f3f8a-862c-11e2-a490-afe87ebb32c9",
                            "rel": "self"
                        }
                    ]
                },
                {
                    "uuid": "c3a345c6-862c-11e2-a490-afe87ebb32c9",
                    "display": "caste - Caste",
                    "name": "caste",
                    "links": [
                        {
                            "uri": "http://localhost:8080/openmrs/ws/rest/v1/personattributetype/c3a345c6-862c-11e2-a490-afe87ebb32c9",
                            "rel": "self"
                        }
                    ]
                }
            ]};

    beforeEach(angular.mock.module('registration.createPatient'));
    beforeEach(angular.mock.inject(function ($injector) {
        $controller = $injector.get('$controller');
        patientService = jasmine.createSpyObj('patientService', ['create']);
        success = jasmine.createSpy();
        patientAttributeTypeService = {
            getAll: function () {
                return {
                    success: function (callBack) {
                        callBack(samplePatientAttributeTypes);
                    }
                }
            }
        };
    }));

    describe('initialization', function () {

        it('should set up centers for Center ID dropdown', function () {
            $controller('CreateNewPatientController', {
                $scope: scope,
                patient: patientService,
                patientAttributeType: patientAttributeTypeService
            });
            expect(Array.isArray(scope.centers)).toBeTruthy();
            expect(scope.centers.length).toBeGreaterThan(0);
        });

        it('should set up attributes in patient', function () {
            patientAttributeTypeService = {
                getAll: function () {
                    return {
                        success: function (callBack) {
                            callBack(samplePatientAttributeTypes);
                        }
                    }
                }
            };

            $controller('CreateNewPatientController', {
                $scope: scope,
                patient: patientService,
                patientAttributeType: patientAttributeTypeService
            });

            expect(scope.patient.attributes.length).toBe(2);
            expect(scope.patient.attributes.map(function(obj){return obj.attributeType;})).toContain('be4f3f8a-862c-11e2-a490-afe87ebb32c9');
            expect(scope.patient.attributes.map(function(obj){return obj.name;})).toContain('caste');
        });
    });

    describe('at run time', function () {

        it('should call patient service to create a new patient', function () {
            $controller('CreateNewPatientController', {
                $scope: scope,
                patient: patientService,
                patientAttributeType: patientAttributeTypeService
            });

            scope.create();

            expect(patientService.create).toHaveBeenCalled();
            expect(patientService.create.mostRecentCall.args[0]).toBe(scope.patient);
        });

        xit('should move to the ', function () {
            $controller('CreateNewPatientController', {
                $scope: scope,
                patient: patientService,
                patientAttributeType: patientAttributeTypeService
            });

            scope.create();

            expect(patientService.create).toHaveBeenCalled();
            expect(patientService.create.mostRecentCall.args[0]).toBe(scope.patient);
        });
    });
});
