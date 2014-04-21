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
            datatype: {name: conceptData.dataType || "N/A"},
            set: conceptData.set,
            setMembers: conceptData.setMembers || [],
            hiNormal: conceptData.hiNormal,
            lowNormal: conceptData.lowNormal
        };
        return concept;
    },

    buildCompoundObservationConcept: function() {
        return this.build({name: Bahmni.Common.Constants.compoundObservationConceptName, set: true, setMembers: [ this.build({name: Bahmni.Common.Constants.abnormalObservationConceptName})]});
    }
}

Bahmni.Tests.conceptMother = {
    build: function(conceptData) {
        var defaultConcept = {
            uuid: Bahmni.Tests.genUUID(),
            name: "conceptName",
            dataType: "N/A",
            set: false,
            voided: false
        }
        return angular.extend(defaultConcept, conceptData);
    }
}

Bahmni.Tests.observationMother = {
    build: function(observationData) {
        var defaultObservation = {
            uuid: Bahmni.Tests.genUUID(),
            groupMembers: [],
            concept: Bahmni.Tests.conceptMother.build()
        }

        return angular.extend(defaultObservation, observationData);
    }
}



