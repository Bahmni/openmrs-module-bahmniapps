'use strict';

describe('FHIRExportController', function () {
    var scope, rootScope, controller, translate, fhirExportService, messagingService;

    var fhirTasksMockData = {
        "resourceType": "Bundle",
        "total": 1,
        "entry": [
            {
                "fullUrl": "http://localhost/openmrs/ws/fhir2/R4/Task/dummy",
                "resource": {
                    "resourceType": "Task",
                    "id": "dummy",
                    "status": "completed",
                    "authoredOn": "2023-10-11T12:21:03+00:00",
                    "owner": {
                        "reference": "Practitioner/superman",
                        "type": "Practitioner"
                    },
                    "input": [
                        {
                            "type": {
                                "coding": [
                                    {
                                        "code": "dummy",
                                        "display": "FHIR Export Start Date"
                                    }
                                ],
                                "text": "FHIR Export Start Date"
                            },
                            "valueString": "2023-09-11"
                        },
                        {
                            "type": {
                                "coding": [
                                    {
                                        "code": "dummy",
                                        "display": "FHIR Export End Date"
                                    }
                                ],
                                "text": "FHIR Export End Date"
                            },
                            "valueString": "2023-10-11"
                        },
                        {
                            "type": {
                                "coding": [
                                    {
                                        "code": "dummy",
                                        "display": "FHIR Export Anonymise Flag"
                                    }
                                ],
                                "text": "FHIR Export Anonymise Flag"
                            },
                            "valueString": "true"
                        }
                    ],
                    "output": [
                        {
                            "type": {
                                "coding": [
                                    {
                                        "code": "dummy",
                                        "display": "Download URL"
                                    }
                                ],
                                "text": "Download URL"
                            },
                            "valueString": "http://localhost/openmrs/ws/rest/v1/fhirExtension/export?file=dummy"
                        }
                    ]
                }
            }
        ]
    };

    var translatedMessages = {
        "INSUFFICIENT_PRIVILEGE_TO_EXPORT": "You do not have sufficient privilege to export data",
        "EXPORT_PATIENT_DATA_WARNING": "Note: Patient Data is confidential and should be handled carefully! It is recommended to export data in Anonymise mode, and ensure that the exported file is handled carefully by authorised parties only." };

    beforeEach(module('bahmni.admin'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        rootScope = $rootScope;
        $rootScope.currentUser = {privileges: [{name: Bahmni.Common.Constants.fhirExportPrivilege}, {name: Bahmni.Common.Constants.plainFhirExportPrivilege}]};
        translate = jasmine.createSpyObj('$translate', ['instant']);
        fhirExportService = jasmine.createSpyObj('fhirExportService', ['loadFhirTasks', 'export', 'submitAudit']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

        fhirExportService.loadFhirTasks.and.returnValue(specUtil.respondWith(fhirTasksMockData));
        
        fhirExportService.export.and.callFake(function () {
            return {
                success: function (callback) {
                    return callback({ status: 200 });
                }
            };
        });
        fhirExportService.submitAudit.and.callFake(function () {
            return {
                success: function (callback) {
                    return callback({ status: 200 });
                }
            };
        });
        messagingService.showMessage.and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ status: 200 });
                }
            };
        });
        
        controller = $controller('FHIRExportController', {
            $scope: scope,
            $rootScope: rootScope,
            $translate: translate,
            fhirExportService: fhirExportService,
            messagingService: messagingService
        });
    }));

    it('should load fhir tasks', function () {
        expect(scope.tasks).toEqual([]);
        scope.loadFhirTasksForPrivilegedUsers().then(function () {
            expect(scope.tasks).toEqual(fhirTasksMockData);
        });
    });

    it('should export patient data', function () {
        scope.exportFhirData().then(function (response) {
            console.log('IM HERE' + response);
            //expect(statusCode).toEqual(200);
        });
    });

    afterEach(function () {
    });
});
