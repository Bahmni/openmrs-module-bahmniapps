var Bahmni = Bahmni || {};
Bahmni.Tests = Bahmni.Tests || {};

Bahmni.Tests.tehsilMother = {
    build: function () {
        return {"name": "Bilaspur",
            "parent": {
                "name": "Distr",
                "parent": {
                    "name": "Chattisgarh"
                }
            }
        }
    }
};

Bahmni.Tests.villageMother = {
    build: function () {
        return {
            "name": "argaav",
            "parent":  Bahmni.Tests.tehsilMother.build()
        }
    }
};

Bahmni.Tests.genUUID = function() { return (Math.random() * Math.pow(10, 16)).toString(); };

Bahmni.Tests.openMRSConceptMother = {
    build: function(conceptData) {
        var concept = {
            uuid: conceptData.uuid || Bahmni.Tests.genUUID(),
            name: { name: conceptData.name || "conceptName"},
            datatype: {name: conceptData.dataTypeName || "N/A"},
            set: conceptData.set,
            setMembers: conceptData.setMembers || [],
            hiAbsolute: conceptData.hiAbsolute,
            lowAbsolute: conceptData.lowAbsolute
        };
        return concept;
    },

    buildCompoundObservationConcept: function() {
        return this.build({name: Bahmni.Common.Constants.compoundObservationConceptName, set: true, setMembers: [ this.build({name: Bahmni.Common.Constants.abnormalObservationConceptName})]});
    }
}

Bahmni.Tests.observationMother = {
    build: function(observationData) {
        return {
            uuid: observationData.uuid === undefined ? Bahmni.Tests.genUUID() : observationData.uuid,
            value: observationData.value,
            concept: observationData.concept,
            groupMembers: observationData.groupMembers || []
        }
    }
}



