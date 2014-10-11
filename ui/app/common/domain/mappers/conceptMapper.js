Bahmni.Common.Domain.ConceptMapper = function () {
    this.map = function (openMrsConcept) {
        if(!openMrsConcept) return null;
        var openMrsDescription = openMrsConcept.descriptions ? openMrsConcept.descriptions[0] : null;
        var conceptName = _.find(openMrsConcept.names, {conceptNameType: "SHORT"}) || _.find(openMrsConcept.names, {conceptNameType: "FULLY_SPECIFIED"});
        var displayLabel = conceptName ? conceptName.name : openMrsConcept.shortName || openMrsConcept.name.name ; // TODO : concept is either from webservice or encounter transaction
        return {
            uuid: openMrsConcept.uuid,
            name: openMrsConcept.name.name || openMrsConcept.name,
            shortName: openMrsConcept.shortName,
            displayLabel: displayLabel,
            description: openMrsDescription ? openMrsDescription.description : null,
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
