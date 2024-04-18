describe("MyReportsController", function () {
    'use strict';

    var data = [
        {
            "id": "6da64b5bd2ee-011602df-4d11-464d-a58c-3b731ff997bb",
            "name": "test report 1",
            "user": "superman",
            "fileName": null,
            "startDate": 1454025600000,
            "endDate": 1453420800000,
            "status": "Scheduled",
            "format": "application/pdf",
            "requestDatetime": 1474529795000,
            "errorMessage": null
        },
        {
            "id": "6da64b5bd2ee-043b4c8a-a5fc-4dc7-9d54-9d6a72f707ca",
            "name": "visit report 1",
            "user": "superman",
            "fileName": "Test_Observation_Report-2016-09-20_15:03:09.044_UTC.html",
            "startDate": 1454025600000,
            "endDate": 1453248000000,
            "status": "Finished",
            "format": "text/html",
            "requestDatetime": 1474383789000,
            "errorMessage": null
        },
        {
            "id": "6da64b5bd2ee-09cf4369-196e-4f49-b8ff-eed0976be905",
            "name": "obs report 2",
            "user": "superman",
            "fileName": "Test_Observation_Report-2016-09-20_14:59:09.087_UTC.html",
            "startDate": 1454025600000,
            "endDate": 1453248000000,
            "status": "Error",
            "format": "text/html",
            "requestDatetime": 1474383549000,
            "errorMessage": "Error"
        },
        {
            "id": "6da64b5bd2ee-a340290b-07a6-4b80-9cf5-d0920a72bfb1",
            "name": "obs report 1",
            "user": "superman",
            "fileName": "Test_Observation_Report-2016-09-20_15:03:14.754_UTC.html",
            "startDate": 1454025600000,
            "endDate": 1453248000000,
            "status": "Finished",
            "format": "text/html",
            "requestDatetime": 1474383794000,
            "errorMessage": null
        },
        {
            "id": "6da64b5bd2ee-b90d13d1-8a52-4349-8dc2-62a92b637f01",
            "name": "test report 2",
            "user": "superman",
            "fileName": "Visit_Report-2016-09-22_08:54:23.997_UTC.pdf",
            "startDate": 1451606400000,
            "endDate": 1453420800000,
            "status": "Finished",
            "format": "application/pdf",
            "requestDatetime": 1474534464000,
            "errorMessage": null
        },
        {
            "id": "6da64b5bd2ee-bee177a0-c54d-4d7b-9c66-ec2d93a29501",
            "name": "visit report 2",
            "user": "superman",
            "fileName": "Laboratory_Services-2016-09-20_15:02:25.210_UTC.html",
            "startDate": 1454025600000,
            "endDate": 1453248000000,
            "status": "Finished",
            "format": "text/html",
            "requestDatetime": 1474383745000,
            "errorMessage": null
        }
    ];
    var dateFormat = "MMM D YYYY";
    var days = [{unixTimeStamp: moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000, hidden: false}, {unixTimeStamp: moment(moment(1474383789000).format(dateFormat), dateFormat).unix()*1000, hidden: false}];
    var reports= {};
    reports[moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000] =
        [{
            id: '6da64b5bd2ee-b90d13d1-8a52-4349-8dc2-62a92b637f01',
            name: 'test report 2',
            user: 'superman',
            fileName: 'Visit_Report-2016-09-22_08:54:23.997_UTC.pdf',
            startDate: 1451606400000,
            endDate: 1453420800000,
            status: 'Finished',
            format: 'application/pdf',
            requestDatetime: 1474534464000,
            errorMessage: null,
            hidden: false
        },
        {
            id: '6da64b5bd2ee-011602df-4d11-464d-a58c-3b731ff997bb',
            name: 'test report 1',
            user: 'superman',
            fileName: null,
            startDate: 1454025600000,
            endDate: 1453420800000,
            status: 'Scheduled',
            format: 'application/pdf',
            requestDatetime: 1474529795000,
            errorMessage: null,
            hidden: false
        }];
    reports[moment(moment(1474383789000).format(dateFormat), dateFormat).unix()*1000] =
        [{
            id: '6da64b5bd2ee-a340290b-07a6-4b80-9cf5-d0920a72bfb1',
            name: 'obs report 1',
            user: 'superman',
            fileName: 'Test_Observation_Report-2016-09-20_15:03:14.754_UTC.html',
            startDate: 1454025600000,
            endDate: 1453248000000,
            status: 'Finished',
            format: 'text/html',
            requestDatetime: 1474383794000,
            errorMessage: null,
            hidden: false
        },
        {
            id: '6da64b5bd2ee-043b4c8a-a5fc-4dc7-9d54-9d6a72f707ca',
            name: 'visit report 1',
            user: 'superman',
            fileName: 'Test_Observation_Report-2016-09-20_15:03:09.044_UTC.html',
            startDate: 1454025600000,
            endDate: 1453248000000,
            status: 'Finished',
            format: 'text/html',
            requestDatetime: 1474383789000,
            errorMessage: null,
            hidden: false
        },
        {
            id: '6da64b5bd2ee-bee177a0-c54d-4d7b-9c66-ec2d93a29501',
            name: 'visit report 2',
            user: 'superman',
            fileName: 'Laboratory_Services-2016-09-20_15:02:25.210_UTC.html',
            startDate: 1454025600000,
            endDate: 1453248000000,
            status: 'Finished',
            format: 'text/html',
            requestDatetime: 1474383745000,
            errorMessage: null,
            hidden: false
        },
        {
            id: '6da64b5bd2ee-09cf4369-196e-4f49-b8ff-eed0976be905',
            name: 'obs report 2',
            user: 'superman',
            fileName: 'Test_Observation_Report-2016-09-20_14:59:09.087_UTC.html',
            startDate: 1454025600000,
            endDate: 1453248000000,
            status: 'Error',
            format: 'text/html',
            requestDatetime: 1474383549000,
            errorMessage: 'Error',
            hidden: false
        }];
    var scope, controller, reportServiceMock, messagingServiceMock, spinnerMock, ngDialog;

    beforeEach(module('bahmni.reports'));

    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();

        messagingServiceMock = jasmine.createSpyObj('messagingService', ['showMessage']);
        spinnerMock = jasmine.createSpyObj('spinner', ['forPromise']);
        ngDialog = jasmine.createSpyObj('ngDialog', ['open']);
        reportServiceMock = jasmine.createSpyObj('reportService', ['getScheduledReports', 'getFormatForMimeType', 'deleteReport']);
        var promise = {
            then: function (a) {
                a({data: data});
            }
        };
        spinnerMock.forPromise.and.returnValue(promise);
        reportServiceMock.getScheduledReports.and.returnValue(promise);

        controller = $controller;
        controller('MyReportsController', {
            $scope: scope,
            reportService: reportServiceMock,
            messagingService: messagingServiceMock,
            spinner: spinnerMock,
            ngDialog: ngDialog
        });
    }));

    it("should initialize with scheduled reports", function () {
        expect(reportServiceMock.getScheduledReports).toHaveBeenCalled();
        expect(scope.days).toEqual(days);
        expect(scope.reports).toEqual(reports);
    });

    it("should return the download link with id", function () {
        var downloadLink = scope.getDownloadLink({id: "123"});

        expect(downloadLink).toEqual("/bahmnireports/download/123");
    });

    it("should convert unixTimeStamps to given format", function () {
        expect(scope.convertToDate(1474529795000, 'hh:mm A')).toEqual(moment(1474529795000).format('hh:mm A'));
        expect(scope.convertToDate(1474529795000, "DD MMM YYYY")).toEqual(moment(1474529795000).format('DD MMM YYYY'));
        expect(scope.convertToDate(1474529795000, "MMMM Do YYYY, dddd")).toEqual(moment(1474529795000).format('MMMM Do YYYY, dddd'));
    });

    it("should get corresponding format for mimeType", function () {
        reportServiceMock.getFormatForMimeType.and.returnValue("HTML");

        expect(scope.getFormat("text/html")).toEqual("HTML");
        expect(reportServiceMock.getFormatForMimeType).toHaveBeenCalledWith("text/html");

    });

    it("should search reports by name", function () {
        scope.searchString = "obs report";
        scope.search();
        var expectedReports = {};
        expectedReports[moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000] = [
            {
                id: '6da64b5bd2ee-b90d13d1-8a52-4349-8dc2-62a92b637f01',
                name: 'test report 2',
                user: 'superman',
                fileName: 'Visit_Report-2016-09-22_08:54:23.997_UTC.pdf',
                startDate: 1451606400000,
                endDate: 1453420800000,
                status: 'Finished',
                format: 'application/pdf',
                requestDatetime: 1474534464000,
                errorMessage: null,
                hidden: true
            },
            {
                id: '6da64b5bd2ee-011602df-4d11-464d-a58c-3b731ff997bb',
                name: 'test report 1',
                user: 'superman',
                fileName: null,
                startDate: 1454025600000,
                endDate: 1453420800000,
                status: 'Scheduled',
                format: 'application/pdf',
                requestDatetime: 1474529795000,
                errorMessage: null,
                hidden: true
            }],
            expectedReports[moment(moment(1474383789000).format(dateFormat), dateFormat).unix()*1000] = [
            {
                id: '6da64b5bd2ee-a340290b-07a6-4b80-9cf5-d0920a72bfb1',
                name: 'obs report 1',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_15:03:14.754_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383794000,
                errorMessage: null,
                hidden: false
            },
            {
                id: '6da64b5bd2ee-043b4c8a-a5fc-4dc7-9d54-9d6a72f707ca',
                name: 'visit report 1',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_15:03:09.044_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383789000,
                errorMessage: null,
                hidden: true
            },
            {
                id: '6da64b5bd2ee-bee177a0-c54d-4d7b-9c66-ec2d93a29501',
                name: 'visit report 2',
                user: 'superman',
                fileName: 'Laboratory_Services-2016-09-20_15:02:25.210_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383745000,
                errorMessage: null,
                hidden: true
            },
            {
                id: '6da64b5bd2ee-09cf4369-196e-4f49-b8ff-eed0976be905',
                name: 'obs report 2',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_14:59:09.087_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Error',
                format: 'text/html',
                requestDatetime: 1474383549000,
                errorMessage: 'Error',
                hidden: false
            }];

        expect(scope.reports).toEqual(expectedReports);
    });

    it("should hide days if all reports are hidden for that day", function () {
        scope.searchString = "obs";
        scope.search();
        var expectedReports = {};
        expectedReports[moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000] =
            [{
                id: '6da64b5bd2ee-b90d13d1-8a52-4349-8dc2-62a92b637f01',
                name: 'test report 2',
                user: 'superman',
                fileName: 'Visit_Report-2016-09-22_08:54:23.997_UTC.pdf',
                startDate: 1451606400000,
                endDate: 1453420800000,
                status: 'Finished',
                format: 'application/pdf',
                requestDatetime: 1474534464000,
                errorMessage: null,
                hidden: true
            },
            {
                id: '6da64b5bd2ee-011602df-4d11-464d-a58c-3b731ff997bb',
                name: 'test report 1',
                user: 'superman',
                fileName: null,
                startDate: 1454025600000,
                endDate: 1453420800000,
                status: 'Scheduled',
                format: 'application/pdf',
                requestDatetime: 1474529795000,
                errorMessage: null,
                hidden: true
            }],
            expectedReports[moment(moment(1474383789000).format(dateFormat), dateFormat).unix()*1000] = [{
                id: '6da64b5bd2ee-a340290b-07a6-4b80-9cf5-d0920a72bfb1',
                name: 'obs report 1',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_15:03:14.754_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383794000,
                errorMessage: null,
                hidden: false
            },
            {
                id: '6da64b5bd2ee-043b4c8a-a5fc-4dc7-9d54-9d6a72f707ca',
                name: 'visit report 1',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_15:03:09.044_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383789000,
                errorMessage: null,
                hidden: true
            },
            {
                id: '6da64b5bd2ee-bee177a0-c54d-4d7b-9c66-ec2d93a29501',
                name: 'visit report 2',
                user: 'superman',
                fileName: 'Laboratory_Services-2016-09-20_15:02:25.210_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383745000,
                errorMessage: null,
                hidden: true
            },
            {
                id: '6da64b5bd2ee-09cf4369-196e-4f49-b8ff-eed0976be905',
                name: 'obs report 2',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_14:59:09.087_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Error',
                format: 'text/html',
                requestDatetime: 1474383549000,
                errorMessage: 'Error',
                hidden: false
            }];
        var expectedDays = [
            {
                unixTimeStamp: moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000,
                hidden: true},
            {
                unixTimeStamp: moment(moment(1474383789000).format(dateFormat), dateFormat).unix()*1000,
                hidden: false
            }];

        expect(scope.reports).toEqual(expectedReports);
        expect(scope.days).toEqual(expectedDays);
    });

    it("should show all reports when search by empty string", function () {
        scope.searchString = "";
        scope.search();
        expect(scope.reports).toEqual(reports);
    });

    it("should show a dialog", function () {
        var report = {errorMessage: "errorMessage first line\nsecond line", id: 1};
        scope.displayErrorPopup(report);

        expect(ngDialog.open).toHaveBeenCalledWith({
            template: 'views/errorMessagePopup.html',
            className: "ngdialog-theme-default report",
            data: "errorMessage first line\nsecond line"
        });
    });

    it("should delete report", function () {
        var promise = {
            then: function (a) {
                a();
            }
        };
        spinnerMock.forPromise.and.returnValue(promise);

        var report = {id: '6da64b5bd2ee-011602df-4d11-464d-a58c-3b731ff997bb'};
        var expectedReports = {};
        expectedReports[moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000] = [
            {
                id: '6da64b5bd2ee-b90d13d1-8a52-4349-8dc2-62a92b637f01',
                name: 'test report 2',
                user: 'superman',
                fileName: 'Visit_Report-2016-09-22_08:54:23.997_UTC.pdf',
                startDate: 1451606400000,
                endDate: 1453420800000,
                status: 'Finished',
                format: 'application/pdf',
                requestDatetime: 1474534464000,
                errorMessage: null,
                hidden: false
            }],
        expectedReports[moment(moment(1474383789000).format(dateFormat), dateFormat).unix()*1000] = [
            {
                id: '6da64b5bd2ee-a340290b-07a6-4b80-9cf5-d0920a72bfb1',
                name: 'obs report 1',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_15:03:14.754_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383794000,
                errorMessage: null,
                hidden: false
            },
            {
                id: '6da64b5bd2ee-043b4c8a-a5fc-4dc7-9d54-9d6a72f707ca',
                name: 'visit report 1',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_15:03:09.044_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383789000,
                errorMessage: null,
                hidden: false
            },
            {
                id: '6da64b5bd2ee-bee177a0-c54d-4d7b-9c66-ec2d93a29501',
                name: 'visit report 2',
                user: 'superman',
                fileName: 'Laboratory_Services-2016-09-20_15:02:25.210_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Finished',
                format: 'text/html',
                requestDatetime: 1474383745000,
                errorMessage: null,
                hidden: false
            },
            {
                id: '6da64b5bd2ee-09cf4369-196e-4f49-b8ff-eed0976be905',
                name: 'obs report 2',
                user: 'superman',
                fileName: 'Test_Observation_Report-2016-09-20_14:59:09.087_UTC.html',
                startDate: 1454025600000,
                endDate: 1453248000000,
                status: 'Error',
                format: 'text/html',
                requestDatetime: 1474383549000,
                errorMessage: 'Error',
                hidden: false
            }];

        scope.delete(report, {unixTimeStamp: moment(moment(1474529795000).format(dateFormat), dateFormat).unix()*1000});

        expect(scope.reports).toEqual(expectedReports);
        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("info", "REPORT_DELETE_SUCCESSFUL");
    });

    it("should show error if not able to delete the report", function () {
        var promise = {
            then: function (a, b) {
                b();
            }
        };
        spinnerMock.forPromise.and.returnValue(promise);
        var report = {id: '6da64b5bd2ee-011602df-4d11-464d-a58c-3b731ff997bb'};

        scope.delete(report, {unixTimeStamp: 1474482600000});

        expect(reportServiceMock.deleteReport).toHaveBeenCalledWith(report.id);
        expect(scope.reports).toEqual(reports);
        expect(messagingServiceMock.showMessage).toHaveBeenCalledWith("error", "REPORT_DELETE_ERROR");
    });

});
