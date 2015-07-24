describe("DashboardController", function () {
    'use strict';

    var scope, controller, appServiceMock, appServiceLoadConfigPromise, typicalReportConfig = {
        data: [
            {
                "name": "Report with config that has dateRangeRequired=true",
                "type": "Dummy",
                "config": {
                    dateRangeRequired: true
                }
            },
            {
                "name": "Report with dateRangeRequired not specified",
                "type": "Dummy",
                "config": {}
            },
            {
                "name": "Report with dateChangeRequired false",
                "type": "Dummy",
                "config": {
                    "dateRangeRequired": false
                }
            }]
    };
    beforeEach(module('bahmni.reports'));

    beforeEach(inject(function ($controller, $rootScope) {
        controller = $controller;
        scope = $rootScope.$new();

        appServiceMock = jasmine.createSpyObj('appService', ['loadConfig']);
        appServiceLoadConfigPromise = specUtil.createServicePromise('loadConfig');
        appServiceMock.loadConfig.and.returnValue(appServiceLoadConfigPromise);
    }));

    it("initializes report sets based on whether date range required or not", function () {

        controller('DashboardController', {
            $scope: scope,
            appService: appServiceMock,
            reportService: null
        });
        appServiceLoadConfigPromise.callThenCallBack(typicalReportConfig);

        expect(appServiceMock.loadConfig).toHaveBeenCalled();
        expect(scope.reportsRequiringDateRange.length).toBe(2);
        expect(scope.reportsNotRequiringDateRange.length).toBe(1);
    });

    it('setDefault sets the right defaults based on section', function () {
        controller('DashboardController', {
            $scope: scope,
            appService: appServiceMock,
            reportService: null
        });
        appServiceLoadConfigPromise.callThenCallBack(typicalReportConfig);

        scope.default.reportsRequiringDateRange = {
            startDate: new Date()
        };
        scope.setDefault('startDate', 'reportsRequiringDateRange');

        expect(scope.reportsRequiringDateRange[0].startDate).toBe(scope.default.reportsRequiringDateRange.startDate);
        expect(scope.reportsRequiringDateRange[1].startDate).toBe(scope.default.reportsRequiringDateRange.startDate);
    })
});