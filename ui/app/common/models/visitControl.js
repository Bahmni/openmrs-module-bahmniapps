'use strict';

Bahmni.Common.VisitControl = function(visitTypes, defaultVisitTypeName, encounterService, $translate){
    var self = this;
    self.visitTypes = visitTypes;
    self.defaultVisitTypeName = defaultVisitTypeName;
    self.defaultVisitType = visitTypes.filter(function(visitType) { return visitType.name === defaultVisitTypeName})[0];

    self.startButtonText = function(visitType) {
        return $translate.instant('REGISTRATION_START_VISIT', {visitType : visitType.name});
    };

    self.startVisit = function(visitType) {
        if(self.onStartVisit) {
            self.onStartVisit(visitType);
        }
        self.selectedVisitType = visitType;
    };

    self.createVisit = function(patientUuid, encounter) {
        var visitType = self.selectedVisitType || self.defaultVisitType;
        var encounterTransaction = {patientUuid: patientUuid, visitTypeUuid: visitType.uuid, locationUuid : encounter.locationUuid};
        if(encounter && encounter.encounterTypeUuid){
            encounterTransaction.encounterTypeUuid = encounter.encounterTypeUuid;
        }
        if(encounter && encounter.providers){
            encounterTransaction.providers = encounter.providers;
        }
        return encounterService.create(encounterTransaction);
    };
};

