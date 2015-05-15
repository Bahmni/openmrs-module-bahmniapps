var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.PatientSearch = Bahmni.Common.PatientSearch || {};

Bahmni.Common.PatientSearch.Constants = {
    searchExtensionTileViewType:"tile",
    searchExtensionTabularViewType:"tabular",
    tabularViewIgnoreHeadingsList: ["display","uuid","image","$$hashKey","activeVisitUuid"],
    identifierHeading: ["ID","Id","id","identifier"],
    patientTileHeight:100,
    patientTileWidth:100,
    tileLoadRatio:1 / 2
};