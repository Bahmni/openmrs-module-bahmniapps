'use strict';

/* exported EncounterConfig */
var EncounterConfig = (function () {
    function EncounterConfig (encounterTypes) {
        this.encounterTypes = encounterTypes;
    }
    EncounterConfig.prototype = {
        getConsultationEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("Consultation");
        },
        getAdmissionEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("ADMISSION");
        },
        getDischargeEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("DISCHARGE");
        },
        getTransferEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("TRANSFER");
        },
        getRadiologyEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("RADIOLOGY");
        },
        getPatientDocumentEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid("Patient Document");
        },
        getValidationEncounterTypeUuid: function () {
            return this.getEncounterTypeUuid(Bahmni.Common.Constants.validationNotesEncounterType);
        },
        getEncounterTypeUuid: function (encounterTypeName) {
            return this.encounterTypes[encounterTypeName];
        },
        getVisitTypes: function () {
            var visitTypesArray = [];
            for (var name in this.visitTypes) {
                visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
            }
            return visitTypesArray;
        },
        getVisitTypeByUuid: function (uuid) {
            var visitTypes = this.getVisitTypes();
            return visitTypes.filter(function (visitType) {
                return visitType.uuid === uuid;
            })[0];
        }
    };
    return EncounterConfig;
})();
