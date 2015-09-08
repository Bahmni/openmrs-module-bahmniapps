'use strict';

describe("EncounterTransactionMapper", function () {

    describe("map", function () {
        var mapper;

        beforeEach(function () {
            mapper = new Bahmni.Clinical.EncounterTransactionMapper();
        });

        it('should set default visit type in encounter when there is no active visit', function () {
            var obs = {uuid: "obsUuid"};
            var defaultVisitType = "OPD";
            var consulation = { observations: obs };
            var patient = { uuid:"patientUuid"};
            
            var encounterData = mapper.map(consulation, patient, null, {}, null, defaultVisitType, false);

            expect(encounterData.visitType).toBe(defaultVisitType)
        });

        it('should set encounter uuid in retrospective mode only', function () {
            var obs = {uuid: "obsUuid"};
            var defaultVisitType = "OPD";
            var consulation = { observations: obs, encounterUuid: "encounterUuid" };
            var patient = { uuid:"patientUuid"};

            var encounterData = mapper.map(consulation, patient, null, {isRetrospective:true}, null, defaultVisitType, false);

            expect(encounterData.encounterUuid).toBe("encounterUuid")
        });

        it('should not set encounter uuid if not in retrospective mode', function () {
            var obs = {uuid: "obsUuid"};
            var defaultVisitType = "OPD";
            var consulation = { observations: obs, encounterUuid: "encounterUuid" };
            var patient = { uuid:"patientUuid"};

            var encounterData = mapper.map(consulation, patient, null, {}, null, defaultVisitType, false);

            expect(encounterData.encounterUuid).toBe(undefined)
        });
    });
});

