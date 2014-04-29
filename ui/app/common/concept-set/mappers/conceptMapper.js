Bahmni.ConceptSet.ConceptMapper = function () {
    this.map = function (openMrsConcept) {
        return {
            uuid: openMrsConcept.uuid,
            name: openMrsConcept.name.name,
            set: openMrsConcept.set,
            dataType: openMrsConcept.datatype.name,
            hiAbsolute: openMrsConcept.hiAbsolute,
            lowAbsolute: openMrsConcept.lowAbsolute,
            hiNormal: openMrsConcept.hiNormal,
            lowNormal: openMrsConcept.lowNormal,
            conceptClass: openMrsConcept.conceptClass,
            answers: openMrsConcept.answers
        }
    };
};
