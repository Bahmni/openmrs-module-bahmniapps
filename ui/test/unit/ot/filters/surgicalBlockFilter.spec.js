'use strict';

describe("surgicalBlockFilter", function () {
    var surgicalBlockFilter;
    var surgicalBlock1 = {id: 1, uuid: "surgicalBlockUuid1", provider: {uuid: "providerUuid1"},location: {name: "location1"}, surgicalAppointments: []};
    var surgicalBlock2 = {id: 2, uuid: "surgicalBlockUuid2", provider: {uuid: "providerUuid1"}, location: {name: "location2"}, surgicalAppointments: []};
    var surgicalBlock3 = {id: 3, uuid: "surgicalBlockUuid3", provider: {uuid: "providerUuid2"}, location: {name: "location2"}, surgicalAppointments: []};
    var appointment1 = {
        id: 1,
        patient: {uuid:"patientUuid1", label: "firstName lastName", identifier: "IQ10001", given_name: "firstName", family_name: "lastName"},
        sortWeight: 0,
        status: "SCHEDULED",
        actualStartDatetime: undefined,
        actualEndDatetime: undefined
    };
    surgicalBlock1.surgicalAppointments.push(appointment1);

    var appointment2 = {
        id: 1,
        patient: {uuid:"patientUuid2", label: "firstName2 lastName2", identifier: "IQ10002", given_name: "firstName2", family_name: "lastName2"},
        sortWeight: 0,
        status: "SCHEDULED",
        actualStartDatetime: undefined,
        actualEndDatetime: undefined
    };
    var appointment3= {
        id: 1,
        patient: {uuid:"patientUuid3", label: "firstName3 lastName3", identifier: "IQ10003", given_name: "firstName3", family_name: "lastName3"},
        sortWeight: 0,
        status: "COMPLETED",
        actualStartDatetime: "2017-06-20T09:09:00.0Z",
        actualEndDatetime: "2017-06-20T10:09:00.0Z"
    };

    surgicalBlock2.surgicalAppointments.push(appointment2);
    surgicalBlock2.surgicalAppointments.push(appointment3);

    var surgicalBlocks = [surgicalBlock1, surgicalBlock2, surgicalBlock3];

    beforeEach(module('bahmni.ot'));
    beforeEach(inject(function($filter) {
        surgicalBlockFilter = $filter('surgicalBlock');
    }));

    it("Should not filter the blocks, when no filters were given", function() {
        var result = surgicalBlockFilter(surgicalBlocks);
        expect(result).toBeDefined();
        expect(result.length).toBe(3);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[1]).toBe(surgicalBlock2);
        expect(result[2]).toBe(surgicalBlock3);
    });

    it("Should filter the blocks with given filter location", function() {
        var filters = {locations: {"location1": true, "location2": false}};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]).toBe(surgicalBlock1);

        filters = {locations: {"location1": false, "location2": true}};
        var result2 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result2).toBeDefined();
        expect(result2.length).toBe(2);
        expect(result2[0]).toBe(surgicalBlock2);
        expect(result2[1]).toBe(surgicalBlock3);

        filters = {locations: {"location1": true, "location2": true}};
        var result3 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result3).toBeDefined();
        expect(result3.length).toBe(3);
        expect(result3[0]).toBe(surgicalBlock1);
        expect(result3[1]).toBe(surgicalBlock2);
        expect(result3[2]).toBe(surgicalBlock3);
    });


    it("Should filter the blocks with given filter providers", function() {
        var filters = {providers: [], locations: {"location1": true, "location2": true}};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(3);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[1]).toBe(surgicalBlock2);
        expect(result[2]).toBe(surgicalBlock3);

        var filters = {providers: [{uuid: "providerUuid1"}], locations: {"location1": true, "location2": true}};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[1]).toBe(surgicalBlock2);

        filters = {providers: [{uuid: "providerUuid2"}], locations: {"location1": true, "location2": true}};
        var result2 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result2).toBeDefined();
        expect(result2.length).toBe(1);
        expect(result2[0]).toBe(surgicalBlock3);

        filters = {providers: [{uuid: "providerUuid1"}, {uuid: "providerUuid2"}], locations: {"location1": true, "location2": true}};
        var result3 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result3).toBeDefined();
        expect(result3.length).toBe(3);
        expect(result3[0]).toBe(surgicalBlock1);
        expect(result3[1]).toBe(surgicalBlock2);
        expect(result3[2]).toBe(surgicalBlock3);
    });

    it("Should filter the blocks with given filter providers and locations", function() {
        var filters = {providers: [{uuid: "providerUuid1"}], locations: {"location1": true, "location2": false}};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]).toBe(surgicalBlock1);

        filters = {providers: [{uuid: "providerUuid2"}], locations: {"location1": true, "location2": false}};
        var result2 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result2).toEqual([]);

        filters = {providers: [{uuid: "providerUuid1"}], locations: {"location1": false, "location2": true}};
        var result3 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result3).toBeDefined();
        expect(result3.length).toBe(1);
        expect(result3[0]).toBe(surgicalBlock2);

        filters = {providers: [{uuid: "providerUuid2"}], locations: {"location1": false, "location2": true}};
        var result4 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result4).toBeDefined();
        expect(result4.length).toBe(1);
        expect(result4[0]).toBe(surgicalBlock3);

        filters = {providers: [{uuid: "providerUuid1"}, {uuid: "providerUuid2"}], locations: {"location1": false, "location2": false}};
        var result5 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result5).toEqual([]);
    });

    it("Should filter the blocks with given patientUuid, i.e. atleast one surgical appointment in the block with the patientUuid", function () {
        var filters = {providers: [], locations: {"location1": true, "location2": true}, patient: {uuid: "patientUuid1", label: "firstName lastName", identifier: "IQ10001"}};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[0].surgicalAppointments).toBeDefined();
        expect(result[0].surgicalAppointments.length).toBe(1);
        expect(result[0].surgicalAppointments[0]).toBe(appointment1);

        filters = {providers: [], locations: {"location1": true, "location2": true}};
        var result1 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result1).toBeDefined();
        expect(result1.length).toBe(3);
        expect(result1[0]).toBe(surgicalBlock1);
        expect(result1[1]).toBe(surgicalBlock2);
        expect(result1[2]).toBe(surgicalBlock3);
    });

    it("Should filter the blocks with given patient and locations and providers", function () {
        var filters = {providers: [{uuid: "providerUuid1"}], locations: {"location1": true, "location2": true}, patient: {uuid: "patientUuid1", label: "firstName lastName", identifier: "IQ10001"}};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[0].surgicalAppointments).toBeDefined();
        expect(result[0].surgicalAppointments.length).toBe(1);
        expect(result[0].surgicalAppointments[0]).toBe(appointment1);

        filters = {providers: [{uuid: "providerUuid1"}], locations: {"location1": false, "location2": true}, patient: {uuid: "patientUuid1", label: "firstName lastName", identifier: "IQ10001"}};
        var result1 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result1).toBeDefined();
        expect(result1.length).toBe(0);

        filters = {providers: [{uuid: "providerUuid1"}], locations: {"location1": true, "location2": true}, patient: {uuid: "patientUuid2", label: "firstName2 lastName2", identifier: "IQ10002"}};
        var result2 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result2).toBeDefined();
        expect(result2.length).toBe(1);
        expect(result2[0]).toBe(surgicalBlock2);
        expect(result2[0].surgicalAppointments).toBeDefined();
        expect(result2[0].surgicalAppointments.length).toBe(2);
        expect(result2[0].surgicalAppointments[0]).toBe(appointment2);
        expect(result2[0].surgicalAppointments[1]).toBe(appointment3);
    });

    it("Should filter surgical blocks with given appointment status, i.e. atleast one surgical appointment in the block with the appointment status", function () {
        var filters = {providers: [], locations: {"location1": true, "location2": true}, statusList: [{name: "SCHEDULED"}]};
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(2);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[0].surgicalAppointments).toBeDefined();
        expect(result[0].surgicalAppointments.length).toBe(1);
        expect(result[0].surgicalAppointments[0]).toBe(appointment1);
        expect(result[1]).toBe(surgicalBlock2);
        expect(result[1].surgicalAppointments).toBeDefined();
        expect(result[1].surgicalAppointments.length).toBe(2);
        expect(result[1].surgicalAppointments[0]).toBe(appointment2);
        expect(result[1].surgicalAppointments[1]).toBe(appointment3);

        filters = {providers: [], locations: {"location1": true, "location2": true}, statusList: []};
        var result2 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result2).toBeDefined();
        expect(result2.length).toBe(3);
        expect(result2[0]).toBe(surgicalBlock1);
        expect(result2[1]).toBe(surgicalBlock2);
        expect(result2[2]).toBe(surgicalBlock3);

        filters = {providers: [], locations: {"location1": true, "location2": true}, statusList: [{name: "COMPLETED"}]};
        var result3 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result3).toBeDefined();
        expect(result3.length).toBe(1);
        expect(result3[0]).toBe(surgicalBlock2);
        expect(result3[0].surgicalAppointments).toBeDefined();
        expect(result3[0].surgicalAppointments.length).toBe(2);
        expect(result3[0].surgicalAppointments[0]).toBe(appointment2);
        expect(result3[0].surgicalAppointments[1]).toBe(appointment3);

        filters = {providers: [], locations: {"location1": true, "location2": true}, statusList: [{name: "COMPLETED"}, {name: "SCHEDULED"}]};
        var result4 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result4).toBeDefined();
        expect(result4.length).toBe(2);
        expect(result4[0]).toBe(surgicalBlock1);
        expect(result4[0].surgicalAppointments).toBeDefined();
        expect(result4[0].surgicalAppointments.length).toBe(1);
        expect(result4[0].surgicalAppointments[0]).toBe(appointment1);
        expect(result4[1]).toBe(surgicalBlock2);
        expect(result4[1].surgicalAppointments).toBeDefined();
        expect(result4[1].surgicalAppointments.length).toBe(2);
        expect(result4[1].surgicalAppointments[0]).toBe(appointment2);
        expect(result4[1].surgicalAppointments[1]).toBe(appointment3);
    });

    it("should filter surgical blocks when multiple filter inputs are given such as providers, locations, patient, status", function () {
        var filters = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": true, "location2": true},
            patient: {uuid: "patientUuid1", label: "firstName lastName", identifier: "IQ10001"},
            statusList: [{name: "SCHEDULED"}]
        };
        var result = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0]).toBe(surgicalBlock1);
        expect(result[0].surgicalAppointments).toBeDefined();
        expect(result[0].surgicalAppointments.length).toBe(1);
        expect(result[0].surgicalAppointments[0]).toBe(appointment1);

        filters = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": true, "location2": false},
            statusList: [{name: "COMPLETED"}]
        };
        var result2 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result2).toBeDefined();
        expect(result2.length).toBe(0);

        filters = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "patientUuid1", label: "firstName lastName", identifier: "IQ10001"},
            statusList: [{name: "COMPLETED"}]
        };
        var result3 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result3).toBeDefined();
        expect(result3.length).toBe(0);

        filters = {
            providers: [{uuid: "providerUuid1"}],
            locations: {"location1": false, "location2": true},
            patient: {uuid: "patientUuid2", label: "firstName2 lastName2", identifier: "IQ10002"},
            statusList: [{name: "COMPLETED"}]
        };
        var result4 = surgicalBlockFilter(surgicalBlocks , filters);
        expect(result4).toBeDefined();
        expect(result4.length).toBe(0);

    });
});