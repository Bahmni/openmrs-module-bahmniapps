'use strict';

describe('consultationContextController', function () {
    var scope,mockAppService, controller, programConfig, mockAppDescriptor;
    mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    mockAppService= jasmine.createSpyObj('appService', ['getAppDescriptor']);


    beforeEach(function () {
        module('bahmni.clinical');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });
    });

    function createController() {
        return controller('consultationContextController', {
            $scope: scope,
            $stateParams: {patientUuid: "patientUuid", visitUuid: "visitUuid"},
            appService: mockAppService
        });
    }

    beforeEach(function() {
        mockAppDescriptor.getConfigValue.and.returnValue(programConfig);
        mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);
    });


    describe('initialization', function () {
        it("should call the app service to retrieve program config from app descriptor", function () {
            createController();
            expect(mockAppService.getAppDescriptor).toHaveBeenCalled();
            expect(mockAppDescriptor.getConfigValue).toHaveBeenCalledWith("program");
            expect(scope.patientInfoSection).not.toBeUndefined();
        });

        it("should populate patientInfoSection with ageLimit picked from config", function () {
            mockAppDescriptor.getConfigValue.and.returnValue({patientInformation : { ageLimit : "21"}});
            mockAppService.getAppDescriptor.and.returnValue(mockAppDescriptor);
            createController();
            expect(scope.patientInfoSection).not.toBeUndefined();
            expect(scope.patientInfoSection.patientInformation.ageLimit).toBe("21");
        });
    });

});