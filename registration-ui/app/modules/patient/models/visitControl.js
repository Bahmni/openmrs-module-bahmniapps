Bahmni.Registration.VisitControl = function(visitTypes, defaultVisitTypeName, visitService){
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
        var visit = {patientUuid: patientUuid, visitTypeUuid: self.selectedVisitType.uuid}
        if(encounter && encounter.encounterTypeUuid){
            visit.encounterTypeUuid = encounter.encounterTypeUuid;
        }
        if(encounter && encounter.providers){
            visit.providers = encounter.providers;
        }
        return visitService.create(visit);
    };
};

