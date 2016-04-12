'use strict';

describe('consultationContextController', function () {
    var scope,mockAppService, controller, programConfig, mockAppDescriptor, visitHistory;
    mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    mockAppService= jasmine.createSpyObj('appService', ['getAppDescriptor']);

    beforeEach(function () {
        module('bahmni.clinical');

        inject(function ($controller, $rootScope) {
            controller = $controller;
            scope = $rootScope.$new();
        });

        visitHistory = {activeVisit:{uuid:'activeVisitUuid-00001'}};
    });

    function createController() {
        return controller('consultationContextController', {
            $scope: scope,
            $stateParams: {patientUuid: "patientUuid", visitUuid: "visitUuid"},
            appService: mockAppService,
            visitHistory: visitHistory
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

        it("should set visitUuid from visitHistory",function () {
            createController();
            expect(scope.visitUuid).toBe('activeVisitUuid-00001');
            visitHistory = {activeVisit:{uuid:'activeVisitUuid-00022'}};
            createController();
            expect(scope.visitUuid).toBe('activeVisitUuid-00022');
            visitHistory = null;
            createController();
            expect(scope.visitUuid).toBeFalsy();
            visitHistory = {};
            createController();
            expect(scope.visitUuid).toBeFalsy();
        });
    });

});