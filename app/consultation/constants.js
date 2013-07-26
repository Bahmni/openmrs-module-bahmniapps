var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.dummyPatient = function(patientUUID) { // TODO: Remove this once mapping patient story is palyed
  return { 
      name : "Ram Singh",
      age  : "34",
      village : "Ganiyari",
      uuid : patientUUID
  }
};

Bahmni.Opd.Constants = {
    bahmniConfigurationUrl: "/openmrs/ws/rest/v1/bahmnicore/conf",
    encounterConfigurationUrl: "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter/config",
    encounterUrl: "/openmrs/ws/rest/v1/bahmnicore/bahmniencounter",
    activePatientsListUrl: "../patients",
    conceptUrl: "/openmrs/ws/rest/v1/concept",
};