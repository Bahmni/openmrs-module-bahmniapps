'use strict';

describe('EditPatientController', function () {

    var $aController, patient = {};
    var scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
    var rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
    var patientServiceMock = jasmine.createSpyObj('patientServiceMock', ['get', 'update','getAllPatientIdentifiers']);
    var patientModelMock = jasmine.createSpyObj('patientModelMock', ['']);
    var spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
    var appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
    var openmrsPatientMapperMock = jasmine.createSpyObj('openmrsPatientMapper', ['map']);
    var encounterServiceMock = jasmine.createSpyObj('encounterService', ['getDigitized']);
    var auditLogService = jasmine.createSpyObj('auditLogService', ['log']);
    auditLogService.log.and.returnValue(specUtil.simplePromise({}));

    beforeEach(module('bahmni.registration'));

    beforeEach(
        inject(function ($controller) {
            $aController = $controller;
        })
    );

    beforeEach(function () {
        appServiceMock.getAppDescriptor = function () {
            return {
                getConfigValue: function () {
                    return ["caste", "primaryRelative"];
                }
            }
        };

        patientServiceMock.get = function (uuid) {
            return {
                then: function (successFn) {
                    successFn({data: "uuid"});
                }
            }
        };

        patientServiceMock.getAllPatientIdentifiers = function (uuid) {
            return {
                then: function (successFn) {
                    successFn({data: {results:[] }});
                }
            }
        };
        patientServiceMock.update = function (uuid) {
            return {
                then: function (successFn) {
                    successFn({data: "uuid"});
                }
            }
        };
        openmrsPatientMapperMock.map = function (openmrsPatient) {
            return patient;
        };

        encounterServiceMock.getDigitized = function (uuid) {
            return {
                then: function (successFn) {
                    return ({data: {data: true}});
                }
            }
        };
        scopeMock.patientConfiguration = {identifierSources: []};
    });

    it("should set read only fields after save", function () {
        var controller = $aController('EditPatientController', {
            $scope: scopeMock,
            patientService: patientServiceMock,
            openmrsPatientMapper: openmrsPatientMapperMock,
            encounterService: encounterServiceMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            auditLogService: auditLogService
        });

        expect(scopeMock.readOnlyFields["caste"]).toBeFalsy()
        expect(scopeMock.readOnlyFields["primaryRelative"]).toBeFalsy();

        patient = {"caste": "someCaste", "relationships": []};
        scopeMock.actions = {
            followUpAction: function () {
                scopeMock.afterSave();
            }
        };

        scopeMock.update();

        expect(scopeMock.readOnlyFields["caste"]).toBeTruthy()
        expect(scopeMock.readOnlyFields["primaryRelative"]).toBeFalsy();
    });

    it("should expand the section when there are any default values specified for an attribute in that section", function () {
        var sections = {
            "additionalPatientInformation": {
                attributes: [{
                    name: "primaryContact"
                }, {
                    foo: "bar"
                }],
                expanded: true
            }
        };
        patient = {"caste": "someCaste", "relationships": []};
        rootScopeMock.patientConfiguration.getPatientAttributesSections = function () {
            return sections;
        };

        $aController('EditPatientController', {
            $scope: scopeMock,
            patientService: patientServiceMock,
            openmrsPatientMapper: openmrsPatientMapperMock,
            encounterService: encounterServiceMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            $rootScope: rootScopeMock,
            auditLogService: auditLogService
        });

        expect(sections["additionalPatientInformation"].expand).toBeTruthy();
    });

    it("should expand the section when there are saved values in the section", function () {
        var sections = {
            "additionalPatientInformation": {
                attributes: [{
                    name: "caste"
                }, {
                    foo: "bar"
                }]
            }
        };

        rootScopeMock.patientConfiguration.getPatientAttributesSections = function () {
            return sections;
        };

        patient = {"caste": "someCaste", "relationships": []};

        $aController('EditPatientController', {
            $scope: scopeMock,
            patientService: patientServiceMock,
            openmrsPatientMapper: openmrsPatientMapperMock,
            encounterService: encounterServiceMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            $rootScope: rootScopeMock,
            auditLogService: auditLogService
        });

        expect(sections["additionalPatientInformation"].expand).toBeTruthy();
    });

    it("should return true if there is disablePhotoCapture config defined to be true", function () {
        appServiceMock.getAppDescriptor = function () {
            return {
                getConfigValue: function (config) {
                    if (config == "disablePhotoCapture") {
                        return true;
                    }
                }
            }
        };

        var controller = $aController('EditPatientController', {
            $scope: scopeMock,
            patientService: patientServiceMock,
            openmrsPatientMapper: openmrsPatientMapperMock,
            encounterService: encounterServiceMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            auditLogService: auditLogService
        });

        expect(scopeMock.disablePhotoCapture).toBeTruthy();
    });
});