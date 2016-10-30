'use strict';
var Bahmni = Bahmni || {};
Bahmni.ADT = Bahmni.ADT || {};

Bahmni.ADT.DispositionDisplayUtil = {
    getEncounterToDisplay: function (encounterConfig, visit) {
        var rankActions = {};
        rankActions[encounterConfig.getAdmissionEncounterTypeUuid()] = 1;
        rankActions[encounterConfig.getTransferEncounterTypeUuid()] = 2;
        rankActions[encounterConfig.getDischargeEncounterTypeUuid()] = 3;

        if (visit.isDischarged()) {
            return encounterConfig.getDischargeEncounterTypeUuid();
        } else if (visit.isAdmitted() && !visit.isDischarged()) {
            return encounterConfig.getTransferEncounterTypeUuid();
        } else {
            return encounterConfig.getAdmissionEncounterTypeUuid();
        }
    }
};
