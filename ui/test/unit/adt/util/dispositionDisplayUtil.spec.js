describe('DispositionDisplayUtil', function () {
    describe("getEncounterToDisplay", function() {
        var encounterConfig = {
            getAdmissionEncounterTypeUuid: function() {return "AdmissionEncounterTypeUuid"},
            getTransferEncounterTypeUuid: function() {return "TransferEncounterTypeUuid"},
            getDischargeEncounterTypeUuid: function() {return "DischargeEncounterTypeUuid"},
        }

        it("should return admission encounter if no discharge or transfer ecnounters present", function() {
            var visit = {
                getEncounters: function() {
                    return [
                        {encounterType: {uuid: "IPDUuid"}, uuid: "ENC1"},
                        {encounterType: {uuid: "AdmissionEncounterTypeUuid"}, uuid: "ENC2"},
                        {encounterType: {uuid: "OPDUuid"}, uuid: "ENC3"},
                    ]
                }
            }

            var enc = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, visit);
            expect(enc.uuid).toEqual("ENC2")
        });

        it("should return transfer encounter if no discharge ecnounters present", function() {
            var visit = {
                getEncounters: function() {
                    return [
                        {encounterType: {uuid: "IPDUuid"}, uuid: "ENC1"},
                        {encounterType: {uuid: "AdmissionEncounterTypeUuid"}, uuid: "ENC2"},
                        {encounterType: {uuid: "TransferEncounterTypeUuid"}, uuid: "ENC4"},
                        {encounterType: {uuid: "OPDUuid"}, uuid: "ENC3"},
                    ]
                }
            }

            var enc = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, visit);
            expect(enc.uuid).toEqual("ENC4")
        });

        it("should return discharge encounter if present", function() {
            var visit = {
                getEncounters: function() {
                    return [
                        {encounterType: {uuid: "IPDUuid"}, uuid: "ENC1"},
                        {encounterType: {uuid: "AdmissionEncounterTypeUuid"}, uuid: "ENC2"},
                        {encounterType: {uuid: "DischargeEncounterTypeUuid"}, uuid: "ENC5"},
                        {encounterType: {uuid: "TransferEncounterTypeUuid"}, uuid: "ENC4"},
                        {encounterType: {uuid: "OPDUuid"}, uuid: "ENC3"},
                    ]
                }
            }

            var enc = Bahmni.ADT.DispositionDisplayUtil.getEncounterToDisplay(encounterConfig, visit);
            expect(enc.uuid).toEqual("ENC5")
        });
    });
});