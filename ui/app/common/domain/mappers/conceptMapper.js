Bahmni.Common.Domain.ConceptMapper = function () {
    this.map = function (openMrsConcept) {
        if(!openMrsConcept) return null;
        return {
            uuid: openMrsConcept.uuid,
            name: openMrsConcept.name.name || openMrsConcept.name,
            set: openMrsConcept.set,
            dataType: getDataTypeOfConcept(openMrsConcept),
            hiAbsolute: openMrsConcept.hiAbsolute,
            lowAbsolute: openMrsConcept.lowAbsolute,
            hiNormal: openMrsConcept.hiNormal,
            handler: openMrsConcept.handler,
            lowNormal: openMrsConcept.lowNormal,
            conceptClass: openMrsConcept.conceptClass ? (openMrsConcept.conceptClass.name || openMrsConcept.conceptClass) : null,
            answers: openMrsConcept.answers,
            units: openMrsConcept.units
        }
    };

    var getDataTypeOfConcept = function(concept){
        return concept.datatype ? concept.datatype.name : getObservationConceptDataType(concept);
    };

    var getObservationConceptDataType = function(concept){
        return concept.dataType ? concept.dataType : null
    };
};
