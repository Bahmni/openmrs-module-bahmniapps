var EncounterConfig = (function () {
    function EncounterConfig(encounterTypes) {
        this.encounterTypes = encounterTypes;
    }
    EncounterConfig.prototype = {
        getOpdConsultationEncounterUuid:function () {
            return this.encounterTypes["OPD"];
        },
        getAdmissionEncounterUuid:function () {
            return this.encounterTypes["ADMISSION"];
        },
        getInvestigationEncounterUuid:function () {
            return this.encounterTypes["INVESTIGATION"];
        }
    };
    return EncounterConfig;
})();