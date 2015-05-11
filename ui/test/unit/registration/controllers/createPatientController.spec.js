'use strict';

describe('CreatePatientController', function () {

    var $aController;
    var scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
    var rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
    var stateMock = jasmine.createSpyObj('stateMock', ['go']);
    var patientServiceMock = jasmine.createSpyObj('patientServiceMock', ['generateIdentifier']);
    var preferencesMock = jasmine.createSpyObj('preferencesMock', ['']);
    var patientModelMock = jasmine.createSpyObj('patientModelMock', ['']);
    var spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
    var appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);

    beforeEach(module('bahmni.registration'));

    beforeEach(
        inject(function ($controller) {
            $aController = $controller;
        })
    );

    it("should create a patient and go to edit page", function () {
            appServiceMock.getAppDescriptor = function () {
                return { getConfigValue: function () {} }
            };
            rootScopeMock.patientConfiguration = { identifierSources: [] };
            var controller = $aController('CreatePatientController', {
                $scope: scopeMock,
                $rootScope: rootScopeMock,
                $state: stateMock,
                patientService: patientServiceMock,
                preferences: preferencesMock,
                patientModel: patientModelMock,
                spinner: spinnerMock,
                appService: appServiceMock
            });
            scopeMock.patient = {identifierPrefix: {}};
            scopeMock.actions = {followUpAction: function() { scopeMock.afterSave() } };
            patientServiceMock.generateIdentifier = function() {
                return {
                    then: function (successFn) {
                        successFn({data: "uuid"});
                    }
                }
            };
            patientServiceMock.create = function() {
                return {
                    success: function (successFn) {
                        var patientProfileData = {patient: { uuid: "patientUuid", person: {names: [{display: "somename"}]}} }
                        successFn(patientProfileData);
                    }
                };
            };

            scopeMock.create();

            expect(scopeMock.patient.identifier).toBe("uuid");
            expect(stateMock.go).toHaveBeenCalledWith("patient.edit", { patientUuid : 'patientUuid' });
        }
    );

    it("should create a patient with custom id and go to edit page", function () {
            appServiceMock.getAppDescriptor = function () {
                return { getConfigValue: function () {} }
            };
            rootScopeMock.patientConfiguration = { identifierSources: [] };
            var controller = $aController('CreatePatientController', {
                $scope: scopeMock,
                $rootScope: rootScopeMock,
                $state: stateMock,
                patientService: patientServiceMock,
                preferences: preferencesMock,
                patientModel: patientModelMock,
                spinner: spinnerMock,
                appService: appServiceMock
            });
            scopeMock.patient = {identifierPrefix: {}};
            scopeMock.actions = {followUpAction: function() { scopeMock.afterSave() } };
            scopeMock.hasOldIdentifier = true;
            patientServiceMock.create = function() {
                return {
                    success: function (successFn) {
                        var patientProfileData = {patient: { uuid: "patientUuid", person: {names: [{display: "somename"}]}} }
                        successFn(patientProfileData);
                    }
                };
            };

            scopeMock.create();

            expect(stateMock.go).toHaveBeenCalledWith("patient.edit", { patientUuid : 'patientUuid' });
        }
    );

});