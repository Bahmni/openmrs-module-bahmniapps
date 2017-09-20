describe('auditLogService', function () {
    var auditLogService;
    var DateUtil = Bahmni.Common.Util.DateUtil;
    var logs = [
        {
            "auditLogId": 9,
            "userId": "superman",
            "patientId": 4,
            "eventType": "VIEWED_DASHBOARD",
            "message": "VIEWED_DASHBOARD message",
            "dateCreated": 1490267210000,
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cd"
        },
        {
            "auditLogId": 10,
            "userId": "batman",
            "patientId": 8,
            "eventType": "VIEWED_CLINICAL_DASHBOARD",
            "message": "VIEWED_CLINICAL_DASHBOARD message",
            "dateCreated": 1490267211000,
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80ce"
        },
        {
            "auditLogId": 11,
            "userId": "batman",
            "patientId": null,
            "eventType": "RUN_REPORT",
            "message": 'RUN_REPORT message~{"reportName":"Visit Report"}',
            "dateCreated": 1490267211000,
            "uuid": "0c2b665e-0fe7-11e7-a6f7-0800270d80cf"
        }
    ];
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);
    mockHttp.get.and.callFake(function (params) {
        return specUtil.respondWith({data: logs});
    });
    mockHttp.post.and.callFake(function (params) {
        return specUtil.respondWith({data: {}});
    });

    var translate = jasmine.createSpyObj('$translate', ['instant']);
    var mockConfigurationService = jasmine.createSpyObj('configurationService', ['getConfigurations']);
    mockConfigurationService.getConfigurations.and.returnValue(specUtil.simplePromise({enableAuditLog: true}));

    beforeEach(function () {
        module('bahmni.common.logging');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
            $provide.value('$translate', translate);
            $provide.value('configurationService', mockConfigurationService);
        });

        inject(['auditLogService', function (auditLogServiceInjected) {
            auditLogService = auditLogServiceInjected;
        }]);
    });
    it("should retrieve logs", function (done) {
        var currentDate = new Date("2018-04-23T18:30:00.548Z");
        var params = {startFrom: currentDate, patientId: 4, username: "superman"};
        auditLogService.getLogs(params).then(function (response) {
            var log1 = response[0];
            var log2 = response[1];
            var log3 = response[2];

            expect(response.length).toBe(3);
            expect(log1.auditLogId).toBe(9);
            expect(log1.eventType).toBe("VIEWED_DASHBOARD");
            expect(log1.message).toBe("VIEWED_DASHBOARD message");
            expect(log1.userId).toBe("superman");
            expect(log1.params).toBe(undefined);
            expect(log1.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
                DateUtil.parseLongDateToServerFormat(1490267210000), 'MMMM Do, YYYY [at] h:mm:ss A'));

            expect(log2.auditLogId).toBe(10);
            expect(log2.eventType).toBe("VIEWED_CLINICAL_DASHBOARD");
            expect(log2.message).toBe("VIEWED_CLINICAL_DASHBOARD message");
            expect(log2.userId).toBe("batman");
            expect(log1.params).toBe(undefined);
            expect(log2.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
                DateUtil.parseLongDateToServerFormat(1490267211000), 'MMMM Do, YYYY [at] h:mm:ss A'));

            expect(log3.auditLogId).toBe(11);
            expect(log3.eventType).toBe("RUN_REPORT");
            expect(log3.message).toBe("RUN_REPORT message");
            expect(log3.userId).toBe("batman");
            expect(log3.params).toEqual({reportName: "Visit Report"});
            expect(log3.dateCreated).toBe(DateUtil.getDateTimeInSpecifiedFormat(
                DateUtil.parseLongDateToServerFormat(1490267211000), 'MMMM Do, YYYY [at] h:mm:ss A'));

            expect(mockHttp.get).toHaveBeenCalled();
            expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/auditlog");
            expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
            done();
        });
    });

    it("should post logs", function (done) {
        var params = {
            patientUuid: "patient Uuid",
            message: 'RUN_REPORT_MESSAGE~{"reportName":"Visit report"}',
            eventType: 'RUN_REPORT',
            module: 'MODULE_LABEL_REPORTS_KEY'
        };
        auditLogService.log('patient Uuid', 'RUN_REPORT', {reportName: 'Visit report'}, 'MODULE_LABEL_REPORTS_KEY').then(function (response) {
            expect(mockHttp.post).toHaveBeenCalled();
            expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(params);
            done();
        });
    });
});
