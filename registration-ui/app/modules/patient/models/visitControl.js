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

    self.createVisit = function(patientUuid) {
        var date = moment(Date.now()).format("YYYY-MM-DDTHH:mm:ss") + "Z";
        var visit = {patient: patientUuid, visitType: self.selectedVisitType.uuid, startDatetime: date, encounters: []}
        return visitService.create(visit);
    };
};

