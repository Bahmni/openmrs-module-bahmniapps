var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.PatientSearch = Bahmni.Common.PatientSearch || {};

Bahmni.Common.PatientSearch.Constants = {
    searchExtensionTileViewType:"tile",
    searchExtensionTabularViewType:"tabular",
    tabularViewIgnoreHeadingsList: ["display","uuid","image","$$hashKey","activeVisitUuid", "hasBeenAdmitted"],
    identifierHeading: ["ID","Id","id","identifier"],
    nameHeading: ["NAME","Name","name"],
    patientTileHeight:100,
    patientTileWidth:100,
    tileLoadRatio:1 / 2
};