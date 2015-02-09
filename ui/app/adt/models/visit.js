'use strict';

Bahmni.ADT.Visit = function (visit) {
    var self = this;
    angular.extend(this, visit);

    var getAllEncounters = function(encounterTypeName) {
        return _.filter(self.encounters, function(encounter) {
            return !encounter.voided && encounter.encounterType.name == encounterTypeName;
        });
    }

    var allAdmissionEncounters = getAllEncounters(Bahmni.Common.Constants.admissionEncounterTypeName);
    var allDischargeEncounters = getAllEncounters(Bahmni.Common.Constants.dischargeEncounterTypeName);

    this.isAdmitted = function() {
        return allAdmissionEncounters.length > 0 && !this.isDischarged();
    }

    this.isDischarged = function() {
        return allDischargeEncounters.length > 0;
    }

    this.getDischargeEncounter = function() {
        return allDischargeEncounters.length > 0 ? allDischargeEncounters[0] : null;
    }

    this.getEncounters = function(includeVoided) {
        return _.filter(this.encounters, function(encounter) {
            return includeVoided == true ? true : encounter.voided == false;
        });
    }
}