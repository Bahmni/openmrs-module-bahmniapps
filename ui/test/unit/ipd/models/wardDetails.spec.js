'use strict';

describe('WardDetails', function () {
    describe("create", function() {
        var getDetails = function() {
            return [
                {
                    "Bed": "Bed 11",
                    "Id": "GAN200013",
                    "Admission By": "Super",
                    "Disposition By": "Super",
                    "Visit Uuid": "visit-uuid",
                    "Patient Uuid": "patient-uuid"
                },
                {
                    "Bed": "Bed 12",
                    "Id": "GAN200014",
                    "Admission By": "Super",
                    "Disposition By": "Super",
                    "Visit Uuid": "visit-uuid2",
                    "Patient Uuid": "patient-uuid2"
                },
                {
                    "Bed": "Bed 13",
                    "Id": "GAN200015",
                    "Admission By": "Super",
                    "Disposition By": "Super",
                    "Visit Uuid": "visit-uuid3",
                    "Patient Uuid": "patient-uuid3"
                }
            ];
        }

        var listViewBedLayoutConfig = {
            "attributes": ["Bed", "Name", "Id", "Name", "Age", "Gender", "Country", "Bed Tags", "ADT Notes"],
            "hiddenAttributes": ["Patient Uuid", "Visit Uuid"]
        };

        it("should provide ward details for all beds", function() {
            var wardDetails = Bahmni.IPD.WardDetails.create(getDetails(), listViewBedLayoutConfig);

            expect(wardDetails.length).toBe(3);
            expect(wardDetails[0].Id).toBe("GAN200013");
            expect(wardDetails[1].Id).toBe("GAN200014");
            expect(wardDetails[2].Id).toBe("GAN200015");
        });
    });
});