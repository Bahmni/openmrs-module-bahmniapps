'use strict';

var $aController, scopeMock, rootScopeMock, stateMock, patientServiceMock, preferencesMock, patientModelMock, spinnerMock,
    appServiceMock, ngDialogMock, ngDialogLocalScopeMock;

describe('CreatePatientController', function () {

    beforeEach(module('bahmni.registration'));

    beforeEach(
        inject(function ($controller) {
            $aController = $controller;
        })
    );
    beforeEach(function () {
        scopeMock = jasmine.createSpyObj('scopeMock', ['actions']);
        rootScopeMock = jasmine.createSpyObj('rootScopeMock', ['patientConfiguration']);
        stateMock = jasmine.createSpyObj('stateMock', ['go']);
        patientServiceMock = jasmine.createSpyObj('patientServiceMock', ['generateIdentifier', 'getLatestIdentifier', 'setLatestIdentifier', 'create']);
        preferencesMock = jasmine.createSpyObj('preferencesMock', ['']);
        patientModelMock = jasmine.createSpyObj('patientModelMock', ['']);
        spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);

        ngDialogMock = jasmine.createSpyObj('ngDialogMock', ['open', 'close']);
        ngDialogLocalScopeMock = scopeMock;
        scopeMock.$new = function () {
            return ngDialogLocalScopeMock;
        };

        appServiceMock.getAppDescriptor = function () {
            return {
                getConfigValue: function () {
                }
            }
        };
        patientServiceMock.generateIdentifierMock = function (data) {
            patientServiceMock.generateIdentifier.and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: data})
                    }
                }
            });
        };
        patientServiceMock.getLatestIdentifierMock = function (data) {
            patientServiceMock.getLatestIdentifier.and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: data})
                    }
                }
            });
        };
        patientServiceMock.setLatestIdentifierMock = function (data) {
            patientServiceMock.setLatestIdentifier.and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: data})
                    }
                }
            });
        };
        patientServiceMock.createMock = function (data) {
            patientServiceMock.create.and.callFake(function () {
                return {
                    success: function (successFn) {
                        successFn(data);
                    }
                };
            });
        };

        rootScopeMock.patientConfiguration = {identifierSources: []};

        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        scopeMock.actions = {
            followUpAction: function () {
                scopeMock.afterSave()
            }
        };

        scopeMock.patientConfiguration = {identifierSources: []};
        scopeMock.patient = {identifierPrefix: {}, relationships: []};
    });

    it("should set patient identifierPrefix details with the matching one",function(){
        rootScopeMock.patientConfiguration = {identifierSources: [
            {prefix:"GAN"},
            {prefix:"SEM"}
        ]};
        preferencesMock.identifierPrefix = "GAN";
        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(scopeMock.patient.identifierPrefix.prefix).toBe("GAN");
    });

    it("should set patient identifierPrefix details with the first source details when it doesn't match",function(){
        rootScopeMock.patientConfiguration = {identifierSources: [
            {prefix:"SEM"},
            {prefix:"BAN"}
        ]};
        preferencesMock.identifierPrefix = "GAN";
        $aController('CreatePatientController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            $state: stateMock,
            patientService: patientServiceMock,
            preferences: preferencesMock,
            patientModel: patientModelMock,
            spinner: spinnerMock,
            appService: appServiceMock,
            ngDialog: ngDialogMock
        });

        expect(scopeMock.patient.identifierPrefix.prefix).toBe("SEM");
    });

    it("should create a patient and go to edit page", function () {

        scopeMock.patient.identifierPrefix.prefix = "GAN";

        patientServiceMock.generateIdentifierMock("uuid");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(scopeMock.patient.identifier).toBe("uuid");
        expect(stateMock.go).toHaveBeenCalledWith("patient.edit", {patientUuid: 'patientUuid'});
    });

    it("should create a patient with custom id and go to edit page", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";

        scopeMock.hasOldIdentifier = true;
        patientServiceMock.getLatestIdentifierMock("100000");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(stateMock.go).toHaveBeenCalledWith("patient.edit", {patientUuid: 'patientUuid'});
    });

    it("should open the pop up when the custom identifier is greater then the next identifier in the sequence", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.hasOldIdentifier = true;

        patientServiceMock.getLatestIdentifierMock("1000");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(patientServiceMock.getLatestIdentifier).toHaveBeenCalledWith("GAN");
        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: {sizeOfTheJump: 50},
            scope: ngDialogLocalScopeMock
        });
    });

    it("should not open the pop up when the custom identifier is less then the next identifier in the sequence", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.hasOldIdentifier = true;

        patientServiceMock.getLatestIdentifierMock("1055");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(patientServiceMock.getLatestIdentifier).toHaveBeenCalledWith("GAN");
        expect(ngDialogMock.open).not.toHaveBeenCalled();
        expect(patientServiceMock.create).toHaveBeenCalledWith(scopeMock.patient);
        expect(scopeMock.patient.uuid).toBe("patientUuid");
    });

    it("should not open the pop up when the custom identifier is equal to the next identifier in the sequence", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.hasOldIdentifier = true;

        patientServiceMock.getLatestIdentifierMock("1050");
        patientServiceMock.setLatestIdentifierMock("1051");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(patientServiceMock.getLatestIdentifier).toHaveBeenCalledWith("GAN");
        expect(ngDialogMock.open).not.toHaveBeenCalled();
        expect(patientServiceMock.create).toHaveBeenCalledWith(scopeMock.patient);
        expect(patientServiceMock.setLatestIdentifier).toHaveBeenCalledWith("GAN", 1051);
        expect(scopeMock.patient.uuid).toBe("patientUuid");
    });

    it("should not create patient when the set Identifier throws error", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.hasOldIdentifier = true;

        patientServiceMock.getLatestIdentifierMock("1050");

        var serverError = new Error("Server Error : User is logged in but doesn't have the relevant privilege");
        patientServiceMock.setLatestIdentifier.and.callFake(function () {
            throw serverError;
        });

        expect(scopeMock.create).toThrow(serverError);

        expect(patientServiceMock.getLatestIdentifier).toHaveBeenCalledWith("GAN");
        expect(patientServiceMock.setLatestIdentifier).toHaveBeenCalledWith("GAN", 1051);
        expect(patientServiceMock.create).not.toHaveBeenCalled();
    });

    it("should create patient when the user says yes to the pop up", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.hasOldIdentifier = true;

        patientServiceMock.getLatestIdentifierMock("1000");
        patientServiceMock.setLatestIdentifierMock("1051");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(patientServiceMock.getLatestIdentifier).toHaveBeenCalledWith("GAN");
        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: {sizeOfTheJump: 50},
            scope: ngDialogLocalScopeMock
        });
        ngDialogLocalScopeMock.yes();
        expect(patientServiceMock.setLatestIdentifier).toHaveBeenCalledWith("GAN", 1051);
        expect(patientServiceMock.create).toHaveBeenCalledWith(scopeMock.patient);
    });

    it("should not create patient when the user says no to the pop up", function () {
        scopeMock.patient.identifierPrefix.prefix = "GAN";
        scopeMock.patient.registrationNumber = "1050";

        scopeMock.hasOldIdentifier = true;

        patientServiceMock.getLatestIdentifierMock("1000");
        patientServiceMock.setLatestIdentifierMock("1051");
        patientServiceMock.createMock({patient: {uuid: "patientUuid", person: {names: [{display: "somename"}]}}});

        scopeMock.create();

        expect(patientServiceMock.getLatestIdentifier).toHaveBeenCalledWith("GAN");
        expect(ngDialogMock.open).toHaveBeenCalledWith({
            template: 'views/customIdentifierConfirmation.html',
            data: {sizeOfTheJump: 50},
            scope: ngDialogLocalScopeMock
        });
        ngDialogLocalScopeMock.no();
        expect(patientServiceMock.setLatestIdentifier).not.toHaveBeenCalled();
        expect(patientServiceMock.create).not.toHaveBeenCalled();
    });
});