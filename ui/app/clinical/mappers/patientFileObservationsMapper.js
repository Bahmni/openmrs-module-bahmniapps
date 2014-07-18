Bahmni.Clinical.PatientFileObservationsMapper = function () {
    var DateUtil = Bahmni.Common.Util.DateUtil;

    this.map = function (encounters) {
        var conceptMapper = new Bahmni.Common.Domain.ConceptMapper();
        var observationMapper = new Bahmni.Common.Domain.ObservationMapper();
        var patientFileRecords = [];
        encounters.forEach(function (encounter) {
            var visitUuid = encounter.visit && encounter.visit.uuid;
            encounter.obs.forEach(function (parentObservation) {
                parentObservation.groupMembers.forEach(function (member) {
                    patientFileRecords.push({
                        id: member.id,
                        concept: conceptMapper.map(parentObservation.concept),
                        imageObservation: observationMapper.map(member),
                        visitUuid: visitUuid
                    });
                })
            })
        });
        patientFileRecords.sort(function (record1, record2) {
            return record1.imageObservation.observationDateTime !==  record2.imageObservation.observationDateTime ?
                DateUtil.parse(record1.imageObservation.observationDateTime) -  DateUtil.parse(record2.imageObservation.observationDateTime):
                record1.id - record2.id;
        });
        return patientFileRecords;
    };
};