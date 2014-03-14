describe('DispositionNote', function () {
    var visit = {
        "encounters": [{
            "obs": [{
                "concept": {
                    "display": "Disposition Set",
                    "name": {
                        "display": "Disposition Set",
                        "uuid": "9167c752-3c7f-11e3-8f4c-005056823ee5",
                        "name": "Disposition Set"
                    }
                },
                "groupMembers": [{
                    "concept": {
                        "name": {
                            "name": "Disposition Note"
                        }
                    },
                    "value": "adf"
                }, {
                    "concept": {
                        "name": {
                            "name": "Disposition"
                        }
                    },
                    "value": {
                        "uuid": "9161ce14-3c7f-11e3-8f4c-005056823ee5",
                        "name": {
                            "display": "Admit Patient",
                            "uuid": "9162f8de-3c7f-11e3-8f4c-005056823ee5",
                            "name": "Admit Patient"
                        }
                    }
                }]
            }]
        }]
    };

    it("Extracts the disposition note from a visit object", function () {
        expect(Bahmni.ADT.dispositionNote(visit)).toBe("adf");
    });
});