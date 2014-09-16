'use strict';

Bahmni.Common.VisitControl = function(visitTypes, defaultVisitTypeName, encounterService){
    var self = this;
    self.visitTypes = visitTypes;
    self.defaultVisitTypeName = defaultVisitTypeName;
    self.defaultVisitType = visitTypes.filter(function(visitType) { return visitType.name === defaultVisitTypeName})[0];

    self.startButtonText = function(visitType) {
        return "Start " + visitType.name + " visit";
    };

    self.startVisit = function(visitType) {
        if(self.onStartVisit) self.onStartVisit(visitType);
        self.selectedVisitType = visitType;
    };

    self.createVisit = function(patientUuid, encounter) {
        var encounterTransaction = {patientUuid: patientUuid, visitTypeUuid: self.selectedVisitType.uuid, locationUuid : encounter.locationUuid};
        if(encounter && encounter.encounterTypeUuid){
            encounterTransaction.encounterTypeUuid = encounter.encounterTypeUuid;
        }
        if(encounter && encounter.providers){
            encounterTransaction.providers = encounter.providers;
        }
        return encounterService.create(encounterTransaction);
    };
};

