'use strict';

Bahmni.Registration.RegistrationEncounterConfig = (function() {
  function RegistrationEncounterConfig(conceptData, encounterTypes, visitTypes) {
    this.conceptData = conceptData;
    this.encounterTypes = encounterTypes;
    this.visitTypes = visitTypes;
  }

  RegistrationEncounterConfig.prototype = {
    getVistTypesAsArray: function() {
      var visitTypesArray = [];
      for(var name in this.visitTypes) {
          visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
      }
      return visitTypesArray;
    }
  }

  return RegistrationEncounterConfig;
})();