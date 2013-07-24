var Bahmni = Bahmni || {};
Bahmni.Opd = Bahmni.Opd || {};
Bahmni.Opd.dummyPatient = function() { // TODO: Remove this once mapping patient story is palyed
  return { 
      name : "Ram Singh",
      age  : "34",
      village : "Ganiyari"
  }
};
Bahmni.Opd.currentPatient = Bahmni.Opd.dummyPatient(); // TODO: Set it to null once mapping patient story is palyed

Bahmni.Opd.Constants = {
    bahmniBaseRestUrl: "/openmrs/ws/rest/v1",
    bahmniConfigurationUrl: "/openmrs/ws/rest/v1/bahmnicore/conf",
    activePatientsListUrl: "/patients/active",
    conceptUrl: "/openmrs/ws/rest/v1/concept",
    patientTileHeight:100,
    patientTileWidth:100,
    tileLoadRatio:1/2,
};