'use strict';

describe("auditLogController", function () {
    var scope, httpBackend, _spinner, mockAuditLogService, counter, mockResponses, messagingService, translate;
    var DateUtil = Bahmni.Common.Util.DateUtil;

    var translatedMessages = {
        "MATCHING_EVENTS_NOT_FOUND": "No matching events found for given criteria !!",
        "INVALID_DATE": "Please enter valid date !!",
        "NO_EVENTS_FOUND": "No events to display !!",
        "NO_MORE_EVENTS_FOUND": "No more events to be displayed !!"
    };

    var logs = [
        {
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": "March 23rd, 2017 at 4:36:50 PM",
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        },
        {
            "auditLogId": 10,
            "userId": "batman",
            "patientId": 8,
            "eventType": "VIEWED_CLINICAL_DASHBOARD",
            "message": "VIEWED_CLINICAL_DASHBOARD message",
            "dateCreated": "March 23rd, 2017 at 4:37:00 PM",
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80ce"
        }
    ];

    beforeEach(function () {
        counter = 0;
        module('bahmni.admin');
        _spinner = jasmine.createSpyObj('spinner', ['forPromise']);
        messagingService = jasmine.createSpyObj('messagingService', ['showMessage']);

        _spinner.forPromise.and.returnValue(specUtil.simplePromise({}));
        inject(['$controller', '$rootScope', '$httpBackend', function ($controller, $rootScope, $httpBackend) {
            scope = $rootScope.$new();
            httpBackend = $httpBackend;

        }]);
        mockAuditLogService = jasmine.createSpyObj("auditLogService", ["getLogs"]);
        mockAuditLogService.getLogs.and.callFake(function () {
            return mockResponses[counter++];
        });
        translate = jasmine.createSpyObj('$translate', ['instant']);
        translate.instant.and.callFake(function (key) {
            return translatedMessages[key];
        })

    });

    afterEach(function () {
        httpBackend.verifyNoOutstandingRequest();
        httpBackend.verifyNoOutstandingExpectation();
    });


    var setUp = function () {
        inject(function ($controller) {
            $controller('auditLogController', {
                $scope: scope,
                spinner: _spinner,
                auditLogService: mockAuditLogService,
                messagingService: messagingService,
                $translate: translate
            });
        });
    };

    it('should provide audit log after initialization', function () {
        var startDate = new Date("2017-03-23T18:30:00.548Z");
        scope.startDate = startDate;
        mockResponses = [specUtil.simplePromise(angular.copy(logs).reverse())];
        scope.$apply(setUp);

        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);

        expect(log1.eventType).toBe("VIEWED_DASHBOARD");
        expect(log1.message).toBe("VIEWED_DASHBOARD message");
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log1.dateCreated).toBe("March 23rd, 2017 at 4:36:50 PM");

        expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(log2.dateCreated).toBe("March 23rd, 2017 at 4:37:00 PM");
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs.calls.count()).toBe(1);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: startDate, defaultView: true});
        expect(messagingService.showMessage).not.toHaveBeenCalled();
    });

    it("should gives audit logs from given date", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        var startForm = new Date("2017-02-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([]), specUtil.simplePromise(logs)];

        scope.startDate = currentDate;
        scope.$apply(setUp);

        expect(translate.instant).toHaveBeenCalledWith("NO_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No events to display !!");
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        scope.startDate = startForm;
        scope.runReport();

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
        expect(scope.errorMessage).toBe("");
        expect(mockAuditLogService.getLogs.calls.count()).toBe(2);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: startForm});
    });

    it("should provide previous logs from given index", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([logs[1]]), specUtil.simplePromise([logs[0]])];
        mockAuditLogService.getLogs.and.callFake(function () {
            return mockResponses[counter++];
        });

        scope.startDate = currentDate;
        scope.$apply(setUp);
        var log = scope.logs[0];
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);

        scope.prev();
        log = scope.logs[0];

        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(mockAuditLogService.getLogs.calls.count()).toBe(2);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({
            startFrom: currentDate,
            lastAuditLogId: 10,
            prev: true
        });
    });

    it("should display warning message when there is no event after initialization", function () {
        mockResponses = [specUtil.simplePromise([]), specUtil.simplePromise([])];
        scope.$apply(setUp);
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(translate.instant).toHaveBeenCalledWith("NO_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No events to display !!");
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalled();

        scope.prev();
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(translate.instant).toHaveBeenCalledWith("NO_MORE_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No more events to be displayed !!");
        expect(mockAuditLogService.getLogs.calls.count()).toBe(2);
    });

    it("should provide next logs from given index", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([logs[0]]), specUtil.simplePromise([logs[1]])];
        scope.startDate = currentDate;
        scope.$apply(setUp);

        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(log.auditLogId).toBe(9);
        scope.next();

        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs.calls.count()).toBe(2);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({
            startFrom: currentDate,
            lastAuditLogId: 9
        });
    });

    it("should display warning if not event found", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([])];
        scope.startDate = currentDate;
        scope.$apply(setUp);

        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(translate.instant).toHaveBeenCalledWith("NO_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No events to display !!");
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs.calls.count()).toBe(1);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});
    });

    it("should take today's date as default date during initialization", function () {
        var currentDate = new Date(DateUtil.getDateWithoutHours());
        mockResponses = [specUtil.simplePromise([{
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": currentDate.getTime(),
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        }])];

        scope.$apply(setUp);
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);

        var log = scope.logs[0];
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs.calls.count()).toBe(1);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});
    });

    it("should display warning and set default index if there is no event found after pressed prev button", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([logs[1]]), specUtil.simplePromise([logs[0]]), specUtil.simplePromise([])];

        scope.startDate = currentDate;
        scope.$apply(setUp);

        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);
        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        scope.prev();
        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({
            startFrom: currentDate,
            prev: true,
            lastAuditLogId: 10
        });

        scope.prev();
        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({
            startFrom: currentDate,
            prev: true,
            lastAuditLogId: 9
        });
        expect(mockAuditLogService.getLogs.calls.count()).toBe(3);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(translate.instant).toHaveBeenCalledWith("NO_MORE_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No more events to be displayed !!");
    });

    it("should display warning if there is no event found after pressed next button again and again", function () {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([logs[0]]), specUtil.simplePromise([logs[1]]), specUtil.simplePromise([])];

        scope.startDate = currentDate;
        scope.$apply(setUp);

        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);

        scope.next();
        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, lastAuditLogId: 9});

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);

        scope.next();
        log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);

        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, lastAuditLogId: 10});
        expect(translate.instant).toHaveBeenCalledWith("NO_MORE_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No more events to be displayed !!");
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs.calls.count()).toBe(3);
    });

    it("should not update present logs if no logs found", function () {
        var currentDate = new Date("2017-03-23T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise(angular.copy(logs).reverse()), specUtil.simplePromise([])];
        scope.startDate = currentDate;
        scope.$apply(setUp);

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
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        scope.next();
        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, lastAuditLogId: 10});
        expect(translate.instant).toHaveBeenCalledWith("NO_MORE_EVENTS_FOUND");
        expect(scope.errorMessage).toBe("No more events to be displayed !!");
    });

    it("should replace logs when user use run report to show logs", function () {
        var currentDate = new Date("2017-03-23T18:30:00.548Z");
        var startForm1 = new Date("2017-02-24T18:30:00.548Z");
        var startForm2 = new Date("2017-02-25T18:30:00.548Z");
        mockResponses = [specUtil.simplePromise([logs[0]]), specUtil.simplePromise([]), specUtil.simplePromise(logs)];
        scope.startDate = currentDate;
        scope.$apply(setUp);

        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});
        expect(_spinner.forPromise).toHaveBeenCalled();

        scope.startDate = startForm1;
        scope.runReport();

        expect(translate.instant).toHaveBeenCalledWith("MATCHING_EVENTS_NOT_FOUND");
        expect(scope.errorMessage).toBe("No matching events found for given criteria !!");
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: startForm1});
        expect(_spinner.forPromise).toHaveBeenCalled();

        scope.startDate = startForm2;
        scope.runReport();

        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);
        expect(log1.eventType).toBe("VIEWED_DASHBOARD");
        expect(log1.message).toBe("VIEWED_DASHBOARD message");
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);

        expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: startForm2});
        expect(mockAuditLogService.getLogs.calls.count()).toBe(3);
        expect(_spinner.forPromise).toHaveBeenCalled();
    });

    it("should not send if filter values is empty", function () {
        var currentDate = new Date(DateUtil.getDateWithoutHours());
        var response1 = [{
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": currentDate.getTime(),
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        }];
        mockResponses = [specUtil.simplePromise(response1), specUtil.simplePromise(logs)];

        scope.$apply(setUp);
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        var log = scope.logs[0];
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(_spinner.forPromise).toHaveBeenCalled();
        scope.runReport();
        expect(scope.logs.length).toBe(2);
        var log1 = scope.logs[0];
        var log2 = scope.logs[1];

        expect(scope.logs.length).toBe(2);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(9);
        expect(log1.eventType).toBe("VIEWED_DASHBOARD");
        expect(log1.message).toBe("VIEWED_DASHBOARD message");
        expect(log1.patientId).toBe(4);
        expect(log1.auditLogId).toBe(9);

        expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log2.patientId).toBe(8);
        expect(log2.auditLogId).toBe(10);
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate});
        expect(mockAuditLogService.getLogs.calls.count()).toBe(2);
    });

    it("should give all logs filter by given username", function () {
        var currentDate = new Date(DateUtil.getDateWithoutHours());
        var response1 = [{
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": currentDate.getTime(),
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        }];
        mockResponses = [specUtil.simplePromise(response1), specUtil.simplePromise([logs[1]])];

        scope.$apply(setUp);
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        var log = scope.logs[0];
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.userId).toBe("superman");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        scope.username = "batman";
        scope.runReport();
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(10);
        expect(scope.firstIndex).toBe(10);
        log = scope.logs[0];
        expect(log.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
        expect(log.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
        expect(log.patientId).toBe(8);
        expect(log.auditLogId).toBe(10);
        expect(log.userId).toBe("batman");
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, username: "batman"});

    });

    it("should give all logs filter by given patient identifier", function () {
        var currentDate = new Date(DateUtil.getDateWithoutHours());
        var response = [{
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": currentDate.getTime(),
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        }];
        mockResponses = [specUtil.simplePromise([]), specUtil.simplePromise(response)];

        scope.$apply(setUp);
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);

        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        scope.patientId = 4;
        scope.runReport();
        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.userId).toBe("superman");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, patientId: 4});
    });

    it("should give all logs filter by given patient identifier and username", function () {
        var currentDate = new Date(DateUtil.getDateWithoutHours());
        var response = [{
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": currentDate.getTime(),
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        }];
        mockResponses = [specUtil.simplePromise([]), specUtil.simplePromise(response)];

        scope.$apply(setUp);
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);

        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({startFrom: currentDate, defaultView: true});

        scope.patientId = 4;
        scope.username = "superman";
        scope.runReport();
        var log = scope.logs[0];
        expect(scope.logs.length).toBe(1);
        expect(log.eventType).toBe("VIEWED_DASHBOARD");
        expect(log.message).toBe("VIEWED_DASHBOARD message");
        expect(log.userId).toBe("superman");
        expect(log.patientId).toBe(4);
        expect(log.auditLogId).toBe(9);
        expect(scope.logs.length).toBe(1);
        expect(scope.lastIndex).toBe(9);
        expect(scope.firstIndex).toBe(9);
        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalledWith({
            startFrom: currentDate,
            patientId: 4,
            username: "superman"
        });
    });

    it("should not run report if given date field has future date", function () {
        spyOn($.fn, "hasClass").and.returnValue(true);
        mockResponses = [specUtil.simplePromise([])];
        scope.$apply(setUp);
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);

        expect(_spinner.forPromise).toHaveBeenCalled();
        expect(mockAuditLogService.getLogs).toHaveBeenCalled();

        scope.runReport();
        expect(scope.logs.length).toBe(0);
        expect(scope.lastIndex).toBe(0);
        expect(scope.firstIndex).toBe(0);
        expect(mockAuditLogService.getLogs.calls.count()).toBe(1);
        expect(translate.instant).toHaveBeenCalledWith("INVALID_DATE");
        expect(messagingService.showMessage).toHaveBeenCalledWith("error", "Please enter valid date !!");
    });
});
