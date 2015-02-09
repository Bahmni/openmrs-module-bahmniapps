'use strict';
var Bahmni = Bahmni || {};
Bahmni.ADT = Bahmni.ADT || {};

Bahmni.ADT.DispositionDisplayUtil = {
    getEncounterToDisplay: function(encounterConfig, visit) {
    	var rankActions = {};
    	rankActions[encounterConfig.getAdmissionEncounterTypeUuid()] = 1;
        rankActions[encounterConfig.getTransferEncounterTypeUuid()] = 2;
        rankActions[encounterConfig.getDischargeEncounterTypeUuid()] = 3;
        var max = 0;
        var encounterWithHigestRank = null;
        visit.getEncounters().forEach(function (encounter) {
            if (rankActions[encounter.encounterType.uuid] && rankActions[encounter.encounterType.uuid] > max) {
                max = rankActions[encounter.encounterType.uuid];
                encounterWithHigestRank = encounter;
            }
        });
        return encounterWithHigestRank;
    }
}