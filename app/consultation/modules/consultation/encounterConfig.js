var EncounterConfig = (function() {
  function EncounterConfig(encounterTypes) {
    this.encounterTypes = encounterTypes;
  }

  EncounterConfig.prototype = {
    getOpdConsultationEncounterUuid: function() {
      return this.encounterTypes["OPD"];
    }
  }

  return EncounterConfig;
})();