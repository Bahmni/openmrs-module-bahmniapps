'use strict';

describe('PatientCommonController', function () {

    var $aController, $httpBackend, scopeMock, rootScopeMock, patientAttributeServiceMock, spinnerMock, appServiceMock;

    beforeEach(module('bahmni.registration'));

    beforeEach(
        inject(function ($controller, _$httpBackend_,$rootScope) {
            $aController = $controller;
            $httpBackend = _$httpBackend_;
            rootScopeMock = $rootScope;
            scopeMock = $rootScope.$new();
        })
    );

    beforeEach(function() {
        patientAttributeServiceMock = jasmine.createSpyObj('patientAttributeServiceMock', ['']);
        spinnerMock = jasmine.createSpyObj('spinnerMock', ['forPromise']);
        appServiceMock = jasmine.createSpyObj('appServiceMock', ['getAppDescriptor']);
        rootScopeMock.genderMap = {}
    })

    it("should make calls for reason for death global property and concept sets", function () {
        $httpBackend.expectGET(Bahmni.Common.Constants.globalPropertyUrl);
        $httpBackend.expectGET(Bahmni.Common.Constants.conceptUrl);
    });

    it("showBirthTime should be true by default", function () {

        appServiceMock.getAppDescriptor = function() {
            return {
                getConfigValue: function(config) {
                    return null;
                }
            };
        };

        $aController('PatientCommonController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            http: $httpBackend,
            patientAttributeService: patientAttributeServiceMock,
            spinner: spinnerMock,
            appService: appServiceMock
        });

        expect(scopeMock.showBirthTime).toBe(true);
    });

    it("showBirthTime should be false if set false", function () {

        appServiceMock.getAppDescriptor = function() {
            return {
                getConfigValue: function(config) {
                    if (config == "showBirthTime") {
                        return false;
                    }
                }
            };
        };

        $aController('PatientCommonController', {
            $scope: scopeMock,
            $rootScope: rootScopeMock,
            http: $httpBackend,
            patientAttributeService: patientAttributeServiceMock,
            spinner: spinnerMock,
            appService: appServiceMock
        });

        expect(scopeMock.showBirthTime).toBe(false);
    });

});