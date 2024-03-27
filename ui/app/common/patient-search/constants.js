var Bahmni = Bahmni || {};
Bahmni.Common = Bahmni.Common || {};
Bahmni.Common.PatientSearch = Bahmni.Common.PatientSearch || {};

Bahmni.Common.PatientSearch.Constants = {
    searchExtensionTileViewType: "tile",
    searchExtensionTabularViewType: "tabular",
    tabularViewIgnoreHeadingsList: ["display", "uuid", "image", "$$hashKey", "activeVisitUuid", "hasBeenAdmitted", "forwardUrl", "programUuid", "enrollment", "extraIdentifier", "kid"],
    identifierHeading: ["ID", "Id", "id", "identifier", "DQ_COLUMN_TITLE_ACTION", "Patient ID"],
    nameHeading: ["NAME", "Name", "name"],
    patientTileHeight: 100,
    patientTileWidth: 100,
    printIgnoreHeadingsList: ["DQ_COLUMN_TITLE_ACTION"],
    tileLoadRatio: 1 / 2
};
