'use strict';

describe('WardDetails', function () {
    describe("create", function() {
        it("should group all diagnosis for a patient", function() {
            var details = [
              {
                "Bed": "Bed 11",
                "Id": "GAN200013",
                "Admission By": "Super",
                "Diagnosis": "Head injury, NOS",
                "Diagnosis Certainty": "Confirmed",
                "Diagnosis Order": "Primary",
                "Diagnosis Status": "",
                "Diagnosis Provider": "Super",
                "Diagnosis Datetime": "23 Mar 15 08:06 AM",
                "Disposition By": "Super"
              },
              {
                "Bed": "Bed 11",
                "Id": "GAN200013",
                "Admission By": "Super",
                "Diagnosis": "Headache",
                "Diagnosis Certainty": "Confirmed",
                "Diagnosis Order": "Secondary",
                "Diagnosis Status": "",
                "Diagnosis Provider": "Super",
                "Diagnosis Datetime": "23 Mar 15 08:06 AM",
                "Disposition By": "Super"
              },
              {
                "Bed": "Bed 12",
                "Id": "GAN200014",
                "Admission By": "Super",
                "Diagnosis": "Headache",
                "Diagnosis Certainty": "Confirmed",
                "Diagnosis Order": "Secondary",
                "Diagnosis Status": "",
                "Diagnosis Provider": "Super",
                "Diagnosis Datetime": "24 Mar 15 08:06 AM",
                "Disposition By": "Super"
              },
              {
                "Bed": "Bed 13",
                "Id": "GAN200015",
                "Admission By": "Super",
                "Disposition By": "Super"
              }
            ]

            var wardDetails = Bahmni.ADT.WardDetails.create(details);

            expect(wardDetails.length).toBe(3);
            expect(wardDetails[0].Id).toBe("GAN200013");
            expect(wardDetails[0].DiagnosisList.length).toBe(2);
            expect(wardDetails[0].DiagnosisList[0].Diagnosis).toBe("Head injury, NOS");
            expect(wardDetails[0].DiagnosisList[0]["Diagnosis Order"]).toBe("Primary");
            expect(wardDetails[0].DiagnosisList[1].Diagnosis).toBe("Headache");
            expect(wardDetails[0].DiagnosisList[1]["Diagnosis Order"]).toBe("Secondary");

            expect(wardDetails[1].Id).toBe("GAN200014");
            expect(wardDetails[1].DiagnosisList.length).toBe(1);
            expect(wardDetails[1].DiagnosisList[0].Diagnosis).toBe("Headache");

            expect(wardDetails[2].Id).toBe("GAN200015");
            expect(wardDetails[2].DiagnosisList.length).toBe(0);
       });
    });
});