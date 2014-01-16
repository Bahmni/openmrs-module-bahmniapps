var EncounterConfig = (function () {
    function EncounterConfig(encounterTypes) {
        this.encounterTypes = encounterTypes;
    }
    EncounterConfig.prototype = {
        getOpdConsultationEncounterTypeUuid:function () {
            return this.encounterTypes["OPD"];
        },
        getAdmissionEncounterTypeUuid:function () {
            return this.encounterTypes["ADMISSION"];
        },
        getInvestigationEncounterTypeUuid:function () {
            return this.encounterTypes["INVESTIGATION"];
        },
        getDischargeEncounterTypeUuid:function () {
            return this.encounterTypes["DISCHARGE"];
        },
        getTransferEncounterTypeUuid:function () {
            return this.encounterTypes["TRANSFER"];
        },
        getRadiologyEncounterTypeUuid:function () {
            return this.encounterTypes["RADIOLOGY"];
        }
    };
    return EncounterConfig;
})();