EncounterConfig = (function() {
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

    getConceptUUID: function(conceptName) {
      var concept = this.conceptData[conceptName];
      return  concept !== undefined ?  concept.uuid : null;
    }
  }

  return EncounterConfig;
})();