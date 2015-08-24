'use strict';

describe('EditPatientController', function () {

    var $aController;
    var scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
    var rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
    var stateMock = jasmine.createSpyObj('stateMock', ['go']);
    var patientServiceMock = jasmine.createSpyObj('patientServiceMock', ['get', 'update']);
    var preferencesMock = jasmine.createSpyObj('preferencesMock', ['']);
    var patientModelMock = jasmine.createSpyObj('patientModelMock', ['']);
    var spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
    var appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
    var openmrsPatientMapperMock = jasmine.createSpyObj('openmrsPatientMapper', ['map']);
    var encounterServiceMock = jasmine.createSpyObj('encounterService', ['getDigitized']);

    beforeEach(module('bahmni.registration'));

    beforeEach(
        inject(function ($controller) {
            $aController = $controller;
        })
    );

    it("should set read only fields after save", function () {
            appServiceMock.getAppDescriptor = function () {
                return { getConfigValue: function () {
                    return ["caste", "primaryRelative"];
                } }
            };

            patientServiceMock.get = function(uuid) {
                return {
                    success: function (successFn) {
                        successFn({data: "uuid"});
                    }
                }
            };
            patientServiceMock.update = function(uuid) {
                return {
                    success: function (successFn) {
                        successFn({data: "uuid"});
                    }
                }
            };
            openmrsPatientMapperMock.map = function(openmrsPatient) {
                return scopeMock.patient;
            };

            encounterServiceMock.getDigitized = function(uuid) {
                return {
                    success: function (successFn) {
                        return ({data: true});
                    }
                }
            };
            scopeMock.patientConfiguration = {identifierSources: []};

            var controller = $aController('EditPatientController', {
                $scope: scopeMock,
                patientService: patientServiceMock,
                openmrsPatientMapper: openmrsPatientMapperMock,
                encounterService: encounterServiceMock,
                spinner: spinnerMock,
                appService: appServiceMock
            });

            expect(scopeMock.readOnlyFields["caste"]).toBeFalsy()
            expect(scopeMock.readOnlyFields["primaryRelative"]).toBeFalsy();

            scopeMock.patient = {"caste":"someCaste", "relationships": []};
            scopeMock.actions = {
                followUpAction: function () {
                   scopeMock.afterSave();
                }
            };

            scopeMock.update();

            expect(scopeMock.readOnlyFields["caste"]).toBeTruthy()
            expect(scopeMock.readOnlyFields["primaryRelative"]).toBeFalsy();
        }
    );
});