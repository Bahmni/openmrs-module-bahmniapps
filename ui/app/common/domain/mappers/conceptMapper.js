'use strict';

Bahmni.Common.Domain.ConceptMapper = function () {
    this.map = function (openMrsConcept) {
        if (!openMrsConcept) {
            return null;
        }
        if (alreadyMappedConcept(openMrsConcept)) {
            return openMrsConcept;
        } // TODO: Clean up: God knows why people are passing already mapped concept. Keeping this non sense check in this one line alone to avoid confusion
        var openMrsDescription = openMrsConcept.descriptions ? openMrsConcept.descriptions[0] : null;
        var shortConceptName = _.find(openMrsConcept.names, {conceptNameType: "SHORT"});
        return {
            uuid: openMrsConcept.uuid,
            name: openMrsConcept.name.name,
            shortName: shortConceptName ? shortConceptName.name : null,
            description: openMrsDescription ? openMrsDescription.description : null,
            set: openMrsConcept.set,
            dataType: openMrsConcept.datatype ? openMrsConcept.datatype.name : null,
            hiAbsolute: openMrsConcept.hiAbsolute,
            lowAbsolute: openMrsConcept.lowAbsolute,
            hiNormal: openMrsConcept.hiNormal,
            handler: openMrsConcept.handler,
            allowDecimal: openMrsConcept.allowDecimal,
            lowNormal: openMrsConcept.lowNormal,
            conceptClass: openMrsConcept.conceptClass ? openMrsConcept.conceptClass.name : null,
            answers: openMrsConcept.answers,
            units: openMrsConcept.units,
            displayString: shortConceptName ? shortConceptName.name : openMrsConcept.name.name,
            names: openMrsConcept.names
        };
    };

    var alreadyMappedConcept = function (concept) {
        return !concept.name.name;
    };
};
