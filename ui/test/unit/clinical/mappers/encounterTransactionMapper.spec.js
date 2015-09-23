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
            var consulation = { observations: obs, providers: [{uuid: "provider-uuid"}] };
            var patient = { uuid:"patientUuid"};
            
            var encounterData = mapper.map(consulation, patient, null, {}, null, defaultVisitType, false);

            expect(encounterData.visitType).toBe(defaultVisitType);
            expect(encounterData.providers).toEqual([{uuid: "provider-uuid"}]);
        });
    });
});

