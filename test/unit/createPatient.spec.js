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
                patientService: patientService,
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
                patientService: patientService,
                patientAttributeType: patientAttributeTypeService
            });

            expect(scope.patient.attributes.length).toBe(2);
        });
    });

    describe('create', function () {
        it('should call patient service to create a new patient', function () {
            $controller('CreateNewPatientController', {
                $scope: scope,
                patientService: patientService,
                patientAttributeType: patientAttributeTypeService
            });
            patientService.create.andReturn({success: jasmine.createSpy() });
            scope['oldPatientIdentifier'] = '56565'
            scope['caste'] = 'foobar'

            scope.create();

            expect(scope.patient.attributes.map(function(obj){return obj.attributeType;})).toContain('be4f3f8a-862c-11e2-a490-afe87ebb32c9');
            expect(scope.patient.attributes.map(function(obj){return obj.name;})).toContain('caste');

            expect(patientService.create).toHaveBeenCalled();
            expect(patientService.create.mostRecentCall.args[0]).toBe(scope.patient);
        });

        it('should remember the patient and server response on success', function () {
            var response = {"uuid":"1a04eae7-f326-49e8-8e90-eebb9c59f1a4","name":"dsds dss","identifier":"NEW63513"};
            var patientData = jasmine.createSpyObj('PatientData', ['patientObject', 'rememberResponse', 'rememberPatient']);
            var patient = {};
            patientData.patientObject.andReturn(patient);
            $controller('CreateNewPatientController', {
                $scope: scope,
                patientService: patientService,
                patientAttributeType: patientAttributeTypeService,
                patientData: patientData
            });
            patientService.create.andReturn({success: function(callback){ callback(response)} });

            scope.create();

            expect(patientData.rememberPatient).toHaveBeenCalledWith(patient);
            expect(patientData.rememberResponse).toHaveBeenCalledWith(response);
        });
    });
});
