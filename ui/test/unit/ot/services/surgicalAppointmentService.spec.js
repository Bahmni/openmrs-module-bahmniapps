'use strict';

describe('surgicalAppointmentService', function () {
    var surgicalAppointmentService;
    var mockHttp = jasmine.createSpyObj('$http', ['get', 'post']);
    var appService = jasmine.createSpyObj('appService', ['getAppDescriptor']);
    var appDescriptor = jasmine.createSpyObj('appDescriptor', ['getConfigValue']);
    appDescriptor.getConfigValue.and.returnValue({additionalCustomParam: ""});
    appService.getAppDescriptor.and.returnValue(appDescriptor);

    beforeEach(function () {
        module('bahmni.ot');
        module(function ($provide) {
            $provide.value('$http', mockHttp);
            $provide.value('appService', appService);
        });

        inject(['surgicalAppointmentService', function (surgicalAppointmentServiceInjected) {
            surgicalAppointmentService = surgicalAppointmentServiceInjected;
        }]);
    });

    //This function converts a date into locale specific date
    var toDateString = function(dateValue){
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue,"YYYY-MM-DD HH:mm:ss").format();
    };

    var toDate = function(dateValue){
        //dateValue expected in the format -> 2017-08-18 20:00:00
        return moment(dateValue,"YYYY-MM-DD HH:mm:ss").toDate();
    };

    it('should retrieve providers', function (done) {
        var data = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var surgeonsConcept = "FSTG, Name (s) of Surgeon 1";
        var params = {v: 'custom:(id,uuid,person:(uuid,display),attributes:(attributeType:(display),value))'};

        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.getSurgeons(surgeonsConcept).then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/provider");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
        expect(mockHttp.get.calls.mostRecent().args[1].method).toEqual("GET");
        expect(mockHttp.get.calls.mostRecent().args[1].withCredentials).toBeTruthy();
    });

    it('should save providers', function (done) {
        var data = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {v: 'full'};
        var surgicalBlock = {location : {uuid: "123"}, provider : {uuid: "234"}, endDatetime : "2017-09-09T11:30:00Z", startDatetime : "2017-09-09T12:30:00Z"};

        mockHttp.post.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.saveSurgicalBlock(surgicalBlock).then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/surgicalBlock");
        expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(surgicalBlock);
        expect(mockHttp.post.calls.mostRecent().args[2].params).toEqual(params);
        expect(mockHttp.post.calls.mostRecent().args[2].withCredentials).toBeTruthy();
        expect(mockHttp.post.calls.mostRecent().args[2].headers).toEqual(headers);
    });

    it('should get the surgical block with given block uuid', function (done) {
        var data = {id: 1, uuid: "surgicalBlockUuid", location:{uuid: "locationUuid", name: "OT1"}, provider: {uuid: "providerUuid", person: {given_name: "Given name", family_name: "Last name"},
            startDatetime: "2039-08-26T12:00:00.000+0530", endDatetime: "2039-08-26T15:00:00.000+0530", surgicalAppointments: []}};

        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.getSurgicalBlockFor("surgicalBlockUuid").then(function (response) {
            expect(response).toEqual(data);
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/surgicalBlock/surgicalBlockUuid");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual({v: "full"});
        expect(mockHttp.get.calls.mostRecent().args[1].withCredentials).toBeTruthy();
        expect(mockHttp.get.calls.mostRecent().args[1].headers).toEqual({"Accept": "application/json", "Content-Type": "application/json"});
    });

    it('should get the surgical blocks in the given date range with custom representation', function (done) {
        var data = {id: 1, uuid: "surgicalBlockUuid", location:{uuid: "locationUuid", name: "OT1"}, provider: {uuid: "providerUuid", person: {given_name: "Given name", family_name: "Last name"},
            startDatetime: toDateString("2039-08-26 12:00:00"), endDatetime: toDateString("2039-08-26 15:00:00"), surgicalAppointments: []}};
        var startDatetime = toDateString("2039-08-26 12:00:00");
        var endDatetime = toDateString("2039-08-26 15:00:00");
        var additionalCustomParam = appService.getAppDescriptor().getConfigValue("additionalCustomParam");

        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.getSurgicalBlocksInDateRange(startDatetime, endDatetime, false, true).then(function (response) {
            expect(response).toEqual(data);
            done();
        });

        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/surgicalBlock");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual({ startDatetime : '2039-08-26T12:00:00.000+0000', endDatetime : '2039-08-26T15:00:00.000+0000', includeVoided: false, activeBlocks: true, v: "custom:(id,uuid," +
        "provider:(uuid,person:(uuid,display),attributes:(attributeType:(display),value,voided))," +
        "location:(uuid,name),startDatetime,endDatetime,surgicalAppointments:(id,uuid,patient:(uuid,display,person:(age,gender,birthdate))," +
        "actualStartDatetime,actualEndDatetime,status,notes,sortWeight,bedNumber,bedLocation,surgicalAppointmentAttributes" +
        (additionalCustomParam ? "," + additionalCustomParam : "") + "))"});
        expect(mockHttp.get.calls.mostRecent().args[1].withCredentials).toBeTruthy();
    });

    it('should update the saved surgical Block', function (done) {
        var data = {results: [{answers: [{displayString: "sample name"}, {displayString: "sample name2"}, {displayString: "sample name3"}]}]};
        var headers = {"Accept": "application/json", "Content-Type": "application/json"};
        var params = {v: 'full'};
        var surgicalBlock = {uuid: "someUuid", location : {uuid: "123"}, provider : {uuid: "234"}, endDatetime : "2017-09-09T11:30:00Z", startDatetime : "2017-09-09T12:30:00Z"};

        mockHttp.post.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.updateSurgicalBlock(surgicalBlock).then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.post).toHaveBeenCalled();
        expect(mockHttp.post.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/surgicalBlock/someUuid");
        expect(mockHttp.post.calls.mostRecent().args[1]).toEqual(surgicalBlock);
        expect(mockHttp.post.calls.mostRecent().args[2].params).toEqual(params);
        expect(mockHttp.post.calls.mostRecent().args[2].withCredentials).toBeTruthy();
        expect(mockHttp.post.calls.mostRecent().args[2].headers).toEqual(headers);
    });

    it('should get global property config for showing primary diagnosis in list view', function (done) {
        var data = "org.openmrs.module.emrapi:Coded Diagnosis"
        var headers = {"Accept": "text/plain"};
        var params = {property: 'obs.conceptMappingsForOT'};
        mockHttp.get.and.returnValue(specUtil.respondWith(data));

        surgicalAppointmentService.getPrimaryDiagnosisConfigForOT().then(function (response) {
            expect(response).toEqual(data);
            done();
        });
        expect(mockHttp.get).toHaveBeenCalled();
        expect(mockHttp.get.calls.mostRecent().args[0]).toBe("/openmrs/ws/rest/v1/bahmnicore/sql/globalproperty");
        expect(mockHttp.get.calls.mostRecent().args[1].params).toEqual(params);
        expect(mockHttp.get.calls.mostRecent().args[1].method).toEqual("GET");
        expect(mockHttp.get.calls.mostRecent().args[1].withCredentials).toBeTruthy();
        expect(mockHttp.get.calls.mostRecent().args[1].headers).toEqual(headers);
    });

});
