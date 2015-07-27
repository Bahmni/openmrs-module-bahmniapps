describe("DashboardController", function () {
    'use strict';

    var scope, controller, reportServiceMock, generateReportPromise, appServiceMock, appServiceLoadConfigPromise, typicalReportConfig = {
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
        scope = $rootScope.$new();

        appServiceMock = jasmine.createSpyObj('appService', ['loadConfig']);
        appServiceLoadConfigPromise = specUtil.createServicePromise('loadConfig');
        appServiceMock.loadConfig.and.returnValue(appServiceLoadConfigPromise);

        reportServiceMock = jasmine.createSpyObj('reportService', ['generateReport']);
        generateReportPromise = specUtil.createServicePromise('generateReport');
        reportServiceMock.generateReport.and.returnValue(generateReportPromise);

        controller = $controller;
        controller('DashboardController', {
            $scope: scope,
            appService: appServiceMock,
            reportService: reportServiceMock
        });
    }));

    it("initializes report sets based on whether date range required or not", function () {
        appServiceLoadConfigPromise.callThenCallBack(typicalReportConfig);

        expect(appServiceMock.loadConfig).toHaveBeenCalled();
        expect(scope.reportsRequiringDateRange.length).toBe(2);
        expect(scope.reportsNotRequiringDateRange.length).toBe(1);
    });

    it('setDefault sets the right defaults based on section', function () {
        appServiceLoadConfigPromise.callThenCallBack(typicalReportConfig);

        scope.default.reportsRequiringDateRange = {
            startDate: new Date()
        };
        scope.setDefault('startDate', 'reportsRequiringDateRange');

        expect(scope.reportsRequiringDateRange[0].startDate).toBe(scope.default.reportsRequiringDateRange.startDate);
        expect(scope.reportsRequiringDateRange[1].startDate).toBe(scope.default.reportsRequiringDateRange.startDate);
    });

    it("converts dates to string format before sending to reportService", function () {
        scope.runReport({
            someDummyObject: {},
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1)
        });

        expect(reportServiceMock.generateReport).toHaveBeenCalledWith({
            someDummyObject: {},
            startDate: '2014-02-01',
            stopDate: '2015-02-01'
        });
    });

    it("sends null dates when not available in report object", function () {
        scope.runReport({
            someDummyObject: {}
        });

        expect(reportServiceMock.generateReport).toHaveBeenCalledWith({
            someDummyObject: {},
            startDate: null,
            stopDate: null
        });
    });
});