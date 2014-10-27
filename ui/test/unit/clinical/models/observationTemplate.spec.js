describe("ObservationTemplate", function () {
    it("should group observations by encounterDateTime", function () {
        var observationTemplate = new Bahmni.Clinical.ObservationTemplate({name : "Breast Cancer - Intake", shortName : "Breast Cancer - Intake -shortName"}, "1218997800000", bahmniObservations);
        expect(observationTemplate.name).toBe("Breast Cancer - Intake");
        expect(observationTemplate.label).toBe("Breast Cancer - Intake -shortName");
        expect(observationTemplate.encounters.length).toBe(2);
    });

    it("should sort encounters by encounterDateTime", function () {
        var observationTemplate = new Bahmni.Clinical.ObservationTemplate({name : "Breast Cancer - Intake", shortName : "Breast Cancer - Intake -shortName"}, "1218997800000", bahmniObservations);

        expect(observationTemplate.encounters[0].encounterDateTime).toBe('1412158286000');
        expect(observationTemplate.encounters[0].observations.length).toBe(1);
        expect(observationTemplate.encounters[0].observations[0].uuid).toBe('0f4dc38f-4588-49d9-a62c-ac045ddafa60');

        expect(observationTemplate.encounters[1].encounterDateTime).toBe('1412157286000');
        expect(observationTemplate.encounters[1].observations.length).toBe(1);
        expect(observationTemplate.encounters[1].observations[0].uuid).toBe('0f4dc38f-4588-49d9-a62c-ac045ddafa59');
    })
});

var bahmniObservations = [
    {
        "encounterDateTime": 1412157286000,
        "abnormal": null,
        "isAbnormal": null,
        "conceptSortWeight": 6,
        "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa59",
        "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
        "observationDateTime": "2014-10-01T15:30:59.000+0530",
        "value": "Paclitaxel",
        "type": null,
        "comment": null,
        "concept": {
            "shortName": null,
            "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
            "name": "Chemotherapy",
            "set": true,
            "dataType": "N/A",
            "units": null,
            "conceptClass": "Misc"
        }
    },
    {
        "encounterDateTime": 1412158286000,
        "abnormal": null,
        "isAbnormal": null,
        "conceptSortWeight": 6,
        "uuid": "0f4dc38f-4588-49d9-a62c-ac045ddafa60",
        "conceptUuid": "d1cbb048-d3e6-4da4-834f-7d97df21c172",
        "observationDateTime": "2014-10-02T15:30:59.000+0530",
        "value": "Cancer",
        "type": null,
        "comment": null,
        "concept": {
            "shortName": null,
            "uuid": "d1cbb048-d3e6-4da4-834f-7d97df21c171",
            "name": "Blood",
            "set": true,
            "dataType": "N/A",
            "units": null,
            "conceptClass": "Misc"
        }
    }
];