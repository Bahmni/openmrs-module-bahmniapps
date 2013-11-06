var EncounterConfig = (function() {
  function EncounterConfig(conceptData, encounterTypes, visitTypes) {
    this.conceptData = conceptData;
    this.encounterTypes = encounterTypes;
    this.visitTypes = visitTypes;
  }

  EncounterConfig.prototype = {
    visitTypeId: function(isNewPatient) {
      if (isNewPatient) {
        return this.visitTypes[constants.visitType.registration];
      } else {
        return this.visitTypes[constants.visitType.returningPatient];
      }
    },

    getVistTypesAsArray: function() {
      var visitTypesArray = [];
      for(var name in this.visitTypes) {
          visitTypesArray.push({name: name, uuid: this.visitTypes[name]});
      }
      return visitTypesArray;
    },

    getConceptUUID: function(conceptName) {
      var concept = this.conceptData[conceptName];
      return  concept !== undefined ?  concept.uuid : null;
    }
  }

  return EncounterConfig;
})();