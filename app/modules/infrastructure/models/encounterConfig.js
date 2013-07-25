var EncounterConfig = (function() {
  function EncounterConfig(encounterTypes) {
    this.encounterTypes = encounterTypes;
  }

  EncounterConfig.prototype = {
    getOpdConsultationEncounterUUID: function() {
      return this.encounterTypes["OPD"];
    }
  }

  return EncounterConfig;
})();