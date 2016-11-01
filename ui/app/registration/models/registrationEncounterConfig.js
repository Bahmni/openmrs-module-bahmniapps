'use strict';

Bahmni.Registration.RegistrationEncounterConfig = (function () {
    function RegistrationEncounterConfig (conceptData, encounterTypes, visitTypes) {
        this.conceptData = conceptData;
        this.encounterTypes = encounterTypes;
        this.visitTypes = visitTypes;
    }

    RegistrationEncounterConfig.prototype = {
        getVisitTypesAsArray: function () {
            var visitTypesArray = [];
            for (var name in this.visitTypes) {
                visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
            }
            return visitTypesArray;
        },
        getDefaultVisitType: function (locationUuid) {
            var visitType = null;
            _.each(this.loginLocationToVisitTypeMap.results, function (result) {
                if (result.entity.uuid === locationUuid) {
                    visitType = result.mappings[0].name;
                }
            });
            return visitType;
        }
    };
    return RegistrationEncounterConfig;
})();
