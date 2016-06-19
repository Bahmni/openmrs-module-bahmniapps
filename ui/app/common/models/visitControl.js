'use strict';

Bahmni.Common.VisitControl = function(visitTypes, defaultVisitTypeName, encounterService, $translate, visitService){
    var self = this;
    self.visitTypes = visitTypes;
    self.defaultVisitTypeName = defaultVisitTypeName;
    self.defaultVisitType = visitTypes.filter(function(visitType) { return visitType.name === defaultVisitTypeName})[0];

    self.startButtonText = function(visitType) {
        return $translate.instant('REGISTRATION_START_VISIT', {visitType : visitType.name});
    };

    self.startVisit = function(visitType) {
        self.onStartVisit();
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

    self.createOnlyVisit = function (patientUuid, loginLocationUuid){
        var visitType = self.selectedVisitType || self.defaultVisitType;
        var visitDetails = {patient: patientUuid, visitType: visitType.uuid, location : loginLocationUuid};
        return visitService.createVisit(visitDetails);
    }
};

