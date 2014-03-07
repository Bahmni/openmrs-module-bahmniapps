'use strict';

describe("ActivePatientListController", function () {
    var patientMapper;
    var scope;
    var controller;
    var patientService;
    var appService;
    var spinner;
    var route = {current: {params: { location: "Ganiyari"}}};

    var appExtensions = [
        {
            "id": "bahmni.clinical.patients.allPatients",
            "extensionPointId": "org.bahmni.patient.search",
            "type": "config",
            "extensionParams": {
                "searchHandler": "emrapi.sqlSearch.activePatients",
                "display": "All active patients"
            },
            "label": "All active patients",
            "order": 1,
            "requiredPrivilege": "app:clinical"
        },
        {
            "id": "bahmni.clinical.patients.patientsToAdmit",
            "extensionPointId": "org.bahmni.patient.search",
            "type": "config",
            "extensionParams": {
                "searchHandler": "emrapi.sqlSearch.patientsToAdmit",
                "display": "Patients to be admitted"
            },
            "label": "Patients to be admitted",
            "order": 2,
            "requiredPrivilege": "app:clinical"
        }
    ];

    var allActivePatients = [
        {identifier: 'GAN1234', name: 'Ram Singh', uuid: 'p-uuid-1', activeVisitUuid: 'v-uuid-1'},
        {identifier: 'BAM1234', name: 'Shyam Singh', uuid: 'p-uuid-2', activeVisitUuid: 'v-uuid-2'},
        {identifier: 'SEM1234', name: 'Ganesh Singh', uuid: 'p-uuid-3', activeVisitUuid: 'v-uuid-3'},
        {identifier: 'GAN1235', name: 'Gani Singh', uuid: 'p-uuid-4', activeVisitUuid: 'v-uuid-4'}
    ];
    var allActivePatientsForAdmission = [
        {identifier: 'GAN1235', name: 'Gani Singh', uuid: 'p-uuid-4', activeVisitUuid: 'v-uuid-4'}
    ];


    beforeEach(module('bahmni.common.patientSearch'));
    beforeEach(inject(function () {
        spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        patientMapper = jasmine.createSpyObj('patientMapper', ['constructImageUrl']);
        patientMapper.constructImageUrl.andReturn("dumb");

        var appDescriptor = {'getExtensions' : function() {return appExtensions;} };
        appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
        appService.getAppDescriptor.andReturn(appDescriptor);

        patientService = jasmine.createSpyObj('patientService',['findPatients']);
        patientService.findPatients.andCallFake(function (param) {
            if (param === "emrapi.sqlSearch.activePatients") {
                return {
                    success: function (callback) {
                        return callback(allActivePatients);
                    }
                };
            } else if (param === "emrapi.sqlSearch.patientsToAdmit") {
                return {
                    success: function (callback) {
                        return callback(allActivePatientsForAdmission);
                    }
                };
            } else {
                return {
                    success: function(callback) {
                        return callback([]);
                    }
                };
            }
        });
    }));

    var setUp = function () {
        inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();
            controller = $controller('ActivePatientsListController', {
                $scope: scope,
                patientMapper: patientMapper,
                patientService: patientService,
                appService: appService,
                spinner: spinner,
                $route: route
            });
        });
    }

    describe("initialization", function () {
        it('should initialize configurations', function () {
            setUp();
            expect(patientService.findPatients).toHaveBeenCalled();
            expect(patientMapper.constructImageUrl.callCount).toBe(4);
        });
    });

    describe("searchPatientsTest", function () {
        it('should search the activePatients based on the search text (case insensitive)', function () {
            setUp();
            scope.showPatientsForType({handler:"emrapi.sqlSearch.activePatients"});
            scope.searchCriteria.searchParameter = "Gan";
            scope.searchPatients();
            expect(scope.searchResults.length).toBe(3);
        });

        it('should filter the activePatients to be admitted based on the search text', function () {
            setUp();
            scope.showPatientsForType({handler:"emrapi.sqlSearch.patientsToAdmit"});
            scope.searchCriteria.searchParameter = "Gan";
            scope.searchPatients();
            expect(scope.searchResults.length).toBe(1);
        });
    });
});
