describe("DashboardController", function () {
    'use strict';

    var scope, controller, reportServiceMock, generateReportPromise, appServiceMock,messagingServiceMock, appServiceLoadConfigPromise, typicalReportConfig = {
        "1":
            {
                "name": "Report with config that has dateRangeRequired=true",
                "type": "Dummy",
                "config": {
                    dateRangeRequired: true
                }
            },
           "2": {
                "name": "Report with dateRangeRequired not specified",
                "type": "Dummy",
                "config": {}
            },
           "3": {
               "name": "Report with dateChangeRequired false",
               "type": "Dummy",
               "config": {
                   "dateRangeRequired": false
               }
           }
    };
    beforeEach(module('bahmni.reports'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        messagingServiceMock = jasmine.createSpyObj('messagingService', ['showMessage']);

        appServiceMock = jasmine.createSpyObj('appService', ['loadConfig']);
        appServiceLoadConfigPromise = specUtil.createServicePromise('loadConfig');
        appServiceMock.loadConfig.and.returnValue(appServiceLoadConfigPromise);

        reportServiceMock = jasmine.createSpyObj('reportService', ['generateReport']);
        generateReportPromise = specUtil.createServicePromise('generateReport');
        reportServiceMock.generateReport.and.returnValue(generateReportPromise);
        scope.reportsRequiringDateRange = [];
        scope.reportsNotRequiringDateRange = [];

        controller = $controller;
        controller('DashboardController', {
            $scope: scope,
            appService: appServiceMock,
            reportService: reportServiceMock,
            messagingService: messagingServiceMock,
            FileUploader: function(){}
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
            config: {},
            name: "Vitals",
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1)
        });

        expect(reportServiceMock.generateReport).toHaveBeenCalledWith({
            config: {},
            name: "Vitals",
            startDate: '2014-02-01',
            stopDate: '2015-02-01'
        });
    });

    it("should generate report without dates if the report does not require date range", function () {
        var report ={
            config: {},
            name: "Vitals"
        };
        scope.reportsNotRequiringDateRange.push(report);

        scope.runReport(report);

        expect(reportServiceMock.generateReport).toHaveBeenCalledWith({
            config: {},
            name: "Vitals",
            startDate: null,
            stopDate: null
        });
    });

    it("show an error message when report which requires date range is initialized without both start date and end date", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: null,
            stopDate: null
        };
        scope.reportsRequiringDateRange.push(report);

        scope.runReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("formError", "Please select the start date and end date");
        expect(reportServiceMock.generateReport).not.toHaveBeenCalled();
    });

    it("show an error message when report which requires date range is initialized without start date", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: null,
            stopDate: '2015-02-01'
        };
        scope.reportsRequiringDateRange.push(report);

        scope.runReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("formError", "Please select the start date");
        expect(reportServiceMock.generateReport).not.toHaveBeenCalled();
    });

    it("show an error message when report which requires date range is initialized without end date", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: null
        };
        scope.reportsRequiringDateRange.push(report);

        scope.runReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("formError", "Please select the end date");
        expect(reportServiceMock.generateReport).not.toHaveBeenCalled();
    });

    it("should not generate report when macro template is not selected for custom excel", function(){
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: null,
            responseType: 'application/vnd.ms-excel-custom',
            reportTemplateLocation: undefined
        };
        scope.reportsRequiringDateRange.push(report);

        scope.runReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("formError", "Workbook template should be selected for generating report: Vitals");
        expect(reportServiceMock.generateReport).not.toHaveBeenCalled();
    });

    it("should reset report template after generating custom excel", function(){
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: '2015-03-01',
            responseType: 'application/vnd.ms-excel-custom',
            reportTemplateLocation: "/tmp/"
        };
        scope.reportsRequiringDateRange.push(report);

        scope.runReport(report);

        expect(reportServiceMock.generateReport).toHaveBeenCalled();
        expect(report.reportTemplateLocation).toBeUndefined();
    })
});