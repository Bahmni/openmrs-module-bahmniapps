'use strict';

describe("auditLogController", function () {
    var scope, httpBackend, _spinner;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var logs = [
        {
            "auditLogId": 9,
            "userId": 3,
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": 1490267210000,
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        },
        {
            "auditLogId": 10,
            "userId": 2,
            "patientId": 8,
            "eventType": "VIEWED_CLINICAL_DASHBOARD",
            "message": "VIEWED_CLINICAL_DASHBOARD message",
            "dateCreated": 1490267220000,
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80ce"
        }
    ];

    beforeEach(function () {
        module('bahmni.admin');
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        _spinner.forPromise.and.returnValue(specUtil.simplePromise({}));
        inject(['$controller', '$rootScope', '$httpBackend', function ($controller, $rootScope, $httpBackend) {
            scope = $rootScope.$new();
            httpBackend = $httpBackend;

        }]);
    });

    afterEach(function () {
        httpBackend.verifyNoOutstandingRequest();
        httpBackend.verifyNoOutstandingExpectation();
    });


    var setUp = function () {
        inject(function ($controller) {
            $controller('auditLogController', {
                $scope: scope,
                spinner: _spinner
            });
        });
    };

    it('should provide audit log after initialization', function () {
        var currentDate = new Date("2017-03-23T18:30:00.548Z");
        scope.startDate = currentDate;
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond(angular.copy(logs).reverse());

        scope.$apply(setUp);
        httpBackend.flush();

        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);

        expect(log1.eventType).toBe("VIEWED_DASHBOARD");
        expect(log1.message).toBe("VIEWED_DASHBOARD message");
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log1.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(log2.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should provider audit logs from given date", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        var startForm = new Date("2017-02-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + startForm.toISOString())
            .respond(logs);

        scope.startDate = currentDate;
        scope.$apply(setUp);

        httpBackend.flush();
        expect(scope.errorMessage).toBe("No records to display !!");
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        scope.startDate = startForm;
        scope.runReport();
        httpBackend.flush();

        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);

        expect(log1.eventType).toBe("VIEWED_DASHBOARD");
        expect(log1.message).toBe("VIEWED_DASHBOARD message");
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log1.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(log2.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(scope.errorMessage).toBe("");
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should provide previous logs from given index", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([logs[1]]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=10&prev=true")
            .respond([logs[0]]);

        scope.startDate = currentDate;
        scope.$apply(setUp);
        httpBackend.flush();
        var log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        scope.prev();
        httpBackend.flush();

        log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should provide next logs from given index", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([logs[0]]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=9")
            .respond([logs[1]]);

        scope.startDate = currentDate;
        scope.$apply(setUp);
        httpBackend.flush();

        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        scope.next();
        httpBackend.flush();

        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should display warning if not event found", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([]);

        scope.startDate = currentDate;
        scope.$apply(setUp);
        httpBackend.flush();

        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(scope.errorMessage).toBe("No records to display !!");
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should take today's date as default date during initialization", function () {
        var currentDate = new Date(DateUtil.getDateWithoutHours());
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([{
                "auditLogId": 9,
                "userId": 3,
                "patientId": 4,
                "eventType": "VIEWED_DASHBOARD",
                "message": "VIEWED_DASHBOARD message",
                "dateCreated": currentDate.getTime(),
                "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
            }]);


        scope.$apply(setUp);
        httpBackend.flush();
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        var log = scope.logs[0];
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(currentDate, 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should provide recent audit logs if there is no event after initialization", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([]);

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog")
            .respond([logs[0]]);

        scope.startDate = currentDate;
        scope.$apply(setUp);
        httpBackend.flush();

        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(scope.errorMessage).toBe("No records to display !!");

        scope.prev();
        httpBackend.flush();

        var log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(scope.errorMessage).toBe("");
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should display warning and set default index if there is no event found after pressed prev button", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([logs[1]]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=10&prev=true")
            .respond([logs[0]]);

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=9&prev=true")
            .respond([]);

        scope.startDate = currentDate;
        scope.$apply(setUp);
        httpBackend.flush();
        var log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        scope.prev();
        httpBackend.flush();

        log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        scope.prev();
        httpBackend.flush();

        log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(scope.errorMessage).toBe("No records to display !!");
    });

    it("should display warning if there is no event found after pressed next button again and again", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");

        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([logs[0]]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=9")
            .respond([logs[1]]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=10")
            .respond([]);

        scope.startDate = currentDate;
        scope.$apply(setUp);
        httpBackend.flush();

        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        scope.next();
        httpBackend.flush();

        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        scope.next();
        httpBackend.flush();

        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(scope.errorMessage).toBe("No records to display !!");
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should not update present logs if no logs found", function () {
        var currentDate = new Date("2017-03-23T18:30:00.548Z");
        scope.startDate = currentDate;
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond(angular.copy(logs).reverse());
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?lastAuditLogId=10")
            .respond([]);

        scope.$apply(setUp);
        httpBackend.flush();

        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(_spinner.forPromise).toHaveBeenCalled();

        scope.next();
        httpBackend.flush();

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(scope.errorMessage).toBe("No records to display !!");
    });

    it("should replace logs when user use run report to show logs", function () {
        var currentDate = new Date("2017-03-23T18:30:00.548Z");
        var startForm1 = new Date("2017-02-24T18:30:00.548Z");
        var startForm2 = new Date("2017-02-25T18:30:00.548Z");
        scope.startDate = currentDate;
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + currentDate.toISOString())
            .respond([logs[0]]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + startForm1.toISOString())
            .respond([]);
        httpBackend.whenGET(Bahmni.Common.Constants.adminUrl + "/auditLog?startFrom=" + startForm2.toISOString())
            .respond(logs);

        scope.$apply(setUp);
        httpBackend.flush();

        var log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(log.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();

        scope.startDate = startForm1;
        scope.runReport();
        httpBackend.flush();
        expect(scope.errorMessage).toBe("No records found for given criteria !!");
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(_spinner.forPromise).toHaveBeenCalled();

        scope.startDate = startForm2;
        scope.runReport();
        httpBackend.flush();
        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);

        expect(log1.eventType).toBe("VIEWED_DASHBOARD");
        expect(log1.message).toBe("VIEWED_DASHBOARD message");
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log1.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

        expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(log2.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
            DateUtil.parseLongDateToServerFormat(1490267220000), 'MMMM Do, YYYY [at] h:mm:ss A'));
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

});

