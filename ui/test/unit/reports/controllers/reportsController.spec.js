describe("ReportsController", function () {
    'use strict';

    var scope, controller, reportServiceMock, scheduleReportPromise, appServiceMock,
        messagingServiceMock, mockAppDescriptor, spinnerMock, rootScope, mockAuditLogService,
        typicalReportConfig = {
            "1": {
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
        rootScope = $rootScope;

        messagingServiceMock = jasmine.createSpyObj('messagingService', ['showMessage']);
        spinnerMock = jasmine.createSpyObj('spinner', ['forPromise']);
        mockAuditLogService = jasmine.createSpyObj("auditLogService", ["log"]);
        var promise = {
            then: function (a) {
                a();
            }
        };
        spinnerMock.forPromise.and.returnValue(promise);

        mockAppDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigForPage', 'getConfigValue']);
        appServiceMock = jasmine.createSpyObj('appService', ['getAppDescriptor']);

        mockAppDescriptor.getConfigForPage.and.returnValue(typicalReportConfig);
        appServiceMock.getAppDescriptor.and.returnValue(mockAppDescriptor);

        reportServiceMock = jasmine.createSpyObj('reportService', ['scheduleReport', 'getAvailableFormats', 'getMimeTypeForFormat']);
        scheduleReportPromise = specUtil.createServicePromise('scheduleReport');
        reportServiceMock.scheduleReport.and.returnValue(scheduleReportPromise);
        reportServiceMock.getAvailableFormats.and.returnValue({
            "CSV": "text/csv",
            "HTML": "text/html"
        });

        controller = $controller;
        controller('ReportsController', {
            $scope: scope,
            appService: appServiceMock,
            reportService: reportServiceMock,
            auditLogService: mockAuditLogService,
            messagingService: messagingServiceMock,
            spinner: spinnerMock,
            $rootScope: rootScope,
            FileUploader: function () {}
        });
    }));

    it("initializes report sets based on whether date range required or not", function () {
        expect(mockAppDescriptor.getConfigForPage).toHaveBeenCalledWith("reports");
        expect(rootScope.reportsRequiringDateRange.length).toBe(2);
        expect(rootScope.reportsNotRequiringDateRange.length).toBe(1);
    });

    it('should initialise formats based on the supportedFormats config', function () {
        mockAppDescriptor.getConfigValue.and.returnValue(['csv', 'html']);
        controller('ReportsController', {
            $scope: scope,
            appService: appServiceMock,
            reportService: reportServiceMock,
            messagingService: messagingServiceMock,
            $rootScope: rootScope,
            FileUploader: function () {}
        });

        expect(_.keys(scope.formats).length).toBe(2);
        expect(scope.formats['CSV']).toBe('text/csv');
        expect(scope.formats['HTML']).toBe('text/html');
    });

    it('should initialise all available formats when supportedFormats config is not specified', function () {
        mockAppDescriptor.getConfigValue.and.returnValue(undefined);

        expect(_.keys(scope.formats).length).toBe(2);
    });

    it('setDefault sets the right defaults based on section', function () {
        rootScope.default.reportsRequiringDateRange = {
            startDate: new Date()
        };
        scope.setDefault('startDate', 'reportsRequiringDateRange');

        expect(rootScope.reportsRequiringDateRange[0].startDate).toBe(rootScope.default.reportsRequiringDateRange.startDate);
        expect(rootScope.reportsRequiringDateRange[1].startDate).toBe(rootScope.default.reportsRequiringDateRange.startDate);
    });

    it("converts dates to string format before sending to reportService", function () {
        scope.scheduleReport({
            config: {},
            name: "Vitals",
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1),
            responseType: 'text/html'
        });

        expect(reportServiceMock.scheduleReport).toHaveBeenCalledWith({
            config: {},
            name: "Vitals",
            startDate: '2014-02-01',
            stopDate: '2015-02-01',
            responseType: 'text/html'
        });
    });

    it("should generate report without dates if the report does not require date range", function () {
        var report = {
            config: {},
            name: "Vitals",
            responseType: 'text/html'
        };
        rootScope.reportsNotRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(reportServiceMock.scheduleReport).toHaveBeenCalledWith({
            config: {},
            name: "Vitals",
            startDate: null,
            stopDate: null,
            responseType: 'text/html'
        });
    });

    it("show an error message when report which requires date range is initialized without both start date and end date", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: null,
            stopDate: null,
            responseType: 'text/html'
        };
        rootScope.reportsRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("error", "Please select the start date and end date");
        expect(reportServiceMock.scheduleReport).not.toHaveBeenCalled();
    });

    it("show an error message when report which requires date range is initialized without start date", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: null,
            stopDate: '2015-02-01',
            responseType: 'text/html'
        };
        rootScope.reportsRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("error", "Please select the start date");
        expect(reportServiceMock.scheduleReport).not.toHaveBeenCalled();
    });

    it("show an error message when report which requires date range is initialized without end date", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: null,
            responseType: 'text/html'
        };
        rootScope.reportsRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("error", "Please select the end date");
        expect(reportServiceMock.scheduleReport).not.toHaveBeenCalled();
    });

    it("show an error message when format is not selected", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: null
        };
        rootScope.reportsRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("error", "Select format for the report: Vitals");
        expect(reportServiceMock.scheduleReport).not.toHaveBeenCalled();
    });

    it("should not generate report when macro template is not selected for custom excel", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: null,
            responseType: 'application/vnd.ms-excel-custom',
            reportTemplateLocation: undefined
        };
        rootScope.reportsRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("error", "Workbook template should be selected for generating report: Vitals");
        expect(reportServiceMock.scheduleReport).not.toHaveBeenCalled();
    });

    it("should reset report template after generating custom excel", function () {
        var report = {
            config: {},
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: '2015-03-01',
            responseType: 'application/vnd.ms-excel-custom',
            reportTemplateLocation: "/tmp/"
        };
        rootScope.reportsRequiringDateRange.push(report);

        scope.scheduleReport(report);

        expect(reportServiceMock.scheduleReport).toHaveBeenCalled();
        expect(report.reportTemplateLocation).toBeUndefined();
    });

    it("should send macroTemplate File path if macroTemplate is configured", function () {
        var report = {
            config: {
                macroTemplatePath: "/xxx"
            },
            name: "Vitals",
            startDate: '2015-02-01',
            stopDate: '2015-03-01',
            responseType: 'application/vnd.ms-excel-custom'
        };
        rootScope.reportsRequiringDateRange.push(report);
        reportServiceMock.scheduleReport.and.callFake(function (reportSent) {
            expect(reportSent.reportTemplateLocation).toBe(report.config.macroTemplatePath);
        });

        scope.scheduleReport(report);

        expect(reportServiceMock.scheduleReport).toHaveBeenCalled();
        expect(report.reportTemplateLocation).toBeUndefined();
    });

    it("show an error message when csv format is selected for concatenated reports", function () {
        var report = {
            config: {},
            name: 'Vitals',
            type: 'concatenated',
            startDate: '2014-02-01',
            stopDate: '2015-02-01',
            responseType: 'text/csv'
        };
        rootScope.reportsRequiringDateRange.push(report);
        reportServiceMock.getMimeTypeForFormat.and.returnValue('text/csv');

        scope.scheduleReport(report);

        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith('error', 'CSV format is not supported for concatenated reports');
        expect(reportServiceMock.scheduleReport).not.toHaveBeenCalled();
    });

    it("should call scheduleReports if report is scheduled and succeeds", function () {
        var promise = {
            then: function (a) {
                a();
            }
        };
        spinnerMock.forPromise.and.returnValue(promise);
        reportServiceMock.scheduleReport.and.returnValue({});

        scope.scheduleReport({
            config: {},
            name: "Vitals",
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1),
            responseType: 'text/html'
        });

        expect(reportServiceMock.scheduleReport).toHaveBeenCalledWith({
            config: {},
            name: "Vitals",
            startDate: '2014-02-01',
            stopDate: '2015-02-01',
            responseType: 'text/html'
        });
        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith('info', 'Vitals added to My Reports');
    });

    it("should call scheduleReports if report is scheduled and show error", function () {
        var promise = {
            then: function (a, b) {
                b();
            }
        };
        spinnerMock.forPromise.and.returnValue(promise);
        reportServiceMock.scheduleReport.and.returnValue({});

        scope.scheduleReport({
            config: {},
            name: "Vitals",
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1),
            responseType: 'text/html'
        });

        expect(reportServiceMock.scheduleReport).toHaveBeenCalledWith({
            config: {},
            name: "Vitals",
            startDate: '2014-02-01',
            stopDate: '2015-02-01',
            responseType: 'text/html'
        });
        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith('error', 'Error in scheduling report');
    });

    it("should persist the previously set startDate, stopDate and format when redirecting between MyReports and Reports Tab", function () {
        expect(rootScope.reportsRequiringDateRange.length).toBe(2);
        expect(rootScope.reportsNotRequiringDateRange.length).toBe(1);

        beforeEach(inject(function ($controller) {
            rootScope.default.reportsRequiringDateRange = {
                startDate: '2014-02-01',
                stopDate: '2015-02-01',
                responseType: 'text/html'
            };

            controller = $controller;
            controller('ReportsController', {
                $scope: scope,
                appService: appServiceMock,
                reportService: reportServiceMock,
                messagingService: messagingServiceMock,
                spinner: spinnerMock,
                $rootScope: rootScope,
                FileUploader: function () {}
            });
        }));

        expect(rootScope.reportsRequiringDateRange.length).toBe(2);
        expect(rootScope.reportsNotRequiringDateRange.length).toBe(1);
        expect(rootScope.default.reportsRequiringDateRange['startDate']).toBe('2014-02-01');
        expect(rootScope.default.reportsRequiringDateRange['stopDate']).toBe('2015-02-01');
        expect(rootScope.default.reportsRequiringDateRange['responseType']).toBe('text/html');
    });

    it("should persist the previously set startDate, stopDate and format when redirecting between the MyReports and Reports Tab", function () {
        expect(rootScope.reportsRequiringDateRange.length).toBe(2);
        expect(rootScope.reportsNotRequiringDateRange.length).toBe(1);

        beforeEach(inject(function ($controller) {
            rootScope.reportsNotRequiringDateRange[0].startDate = '2014-02-01';
            rootScope.reportsNotRequiringDateRange[0].stopDate = '2015-02-01';
            rootScope.reportsNotRequiringDateRange[0].responseType = 'text';

            controller = $controller;
            controller('ReportsController', {
                $scope: scope,
                appService: appServiceMock,
                reportService: reportServiceMock,
                messagingService: messagingServiceMock,
                spinner: spinnerMock,
                $rootScope: rootScope,
                FileUploader: function () {}
            });
        }));

        expect(rootScope.reportsNotRequiringDateRange[0].startDate).toBe('2014-02-01');
        expect(rootScope.reportsNotRequiringDateRange[0].stopDate).toBe('2015-02-01');
        expect(rootScope.reportsNotRequiringDateRange[0].responseType).toBe('text');
    });

    it('should audit log the report details when auditLogging is enabled', function () {
        scope.scheduleReport({
            config: {},
            name: "Vitals",
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1),
            responseType: 'text/html'
        });

        var messageParams = {reportName: 'Vitals'};
        expect(mockAuditLogService.log).toHaveBeenCalledWith(undefined, 'RUN_REPORT', messageParams, 'MODULE_LABEL_REPORTS_KEY');
    });

    it('should not audit log the report details when auditLogging is disabled', function () {
        scope.scheduleReport({
            config: {},
            name: "Vitals",
            startDate: new Date(2014, 1, 1),
            stopDate: new Date(2015, 1, 1),
            responseType: 'text/html'
        });

        expect(mockAuditLogService.log.calls.count()).toBe(0);
    });

    it('should return true if the user has the given privilege', function (){
        rootScope.currentUser = {
            privileges: [{name: 'app:reports'},{name: 'app:registration'}]
        };

        expect(scope.hasPrivilege('app:registration')).toBe(true);
    });

    it('should return false if the user do not have  the given privilege', function (){
        rootScope.currentUser = {
            privileges: [{name: 'app:reports'}]
        };

        expect(scope.hasPrivilege('app:registration')).toBe(false);
    });

    it('should return true if the given privilege is undefined', function (){
        rootScope.currentUser = {
            privileges: [{name: 'app:reports'}]
        };

        expect(scope.hasPrivilege(undefined)).toBe(true);
    });

});
