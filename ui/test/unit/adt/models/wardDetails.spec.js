'use strict';

describe('WardDetails', function () {
    describe("create", function() {
        var getDetails = function() {
            return [
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
                    "Disposition By": "Super",
                    "Visit Uuid": "visit-uuid",
                    "Patient Uuid": "patient-uuid"
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
                    "Disposition By": "Super",
                    "Visit Uuid": "visit-uuid1",
                    "Patient Uuid": "patient-uuid1"
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

        it("should group all diagnosis for a patient", function() {
            var wardDetails = Bahmni.ADT.WardDetails.create(getDetails());

            expect(wardDetails.length).toBe(3);
            expect(wardDetails[0].Id).toBe("GAN200013");
            expect(wardDetails[0].Diagnosis.length).toBe(2);
            expect(wardDetails[0].Diagnosis[0].Diagnosis).toBe("Head injury, NOS");
            expect(wardDetails[0].Diagnosis[0]["Diagnosis Order"]).toBe("Primary");
            expect(wardDetails[0].Diagnosis[1].Diagnosis).toBe("Headache");
            expect(wardDetails[0].Diagnosis[1]["Diagnosis Order"]).toBe("Secondary");

            expect(wardDetails[1].Id).toBe("GAN200014");
            expect(wardDetails[1].Diagnosis.length).toBe(1);
            expect(wardDetails[1].Diagnosis[0].Diagnosis).toBe("Headache");

            expect(wardDetails[2].Id).toBe("GAN200015");
            expect(wardDetails[2].Diagnosis.length).toBe(0);
        });

        it("should remove duplicate diagnosis if one of them is marked as ruled out", function() {
            var details = getDetails();
            details.push({
                "Bed": "Bed 11",
                "Id": "GAN200013",
                "Admission By": "Super",
                "Diagnosis": "Headache",
                "Diagnosis Certainty": "Confirmed",
                "Diagnosis Order": "Secondary",
                "Diagnosis Status": "Ruled Out Diagnosis",
                "Diagnosis Provider": "Super",
                "Diagnosis Datetime": "25 Mar 15 08:06 AM",
                "Disposition By": "Super"
            });

            var wardDetails = Bahmni.ADT.WardDetails.create(details);

            expect(wardDetails.length).toBe(3);
            expect(wardDetails[0].Id).toBe("GAN200013");
            expect(wardDetails[0].Diagnosis.length).toBe(2);
            expect(wardDetails[0].Diagnosis[0].Diagnosis).toBe("Head injury, NOS");
            expect(wardDetails[0].Diagnosis[0]["Diagnosis Order"]).toBe("Primary");
            expect(wardDetails[0].Diagnosis[1].Diagnosis).toBe("Headache");
            expect(wardDetails[0].Diagnosis[1].ruledOut).toBeTruthy();
        });

        it("should add patientUuid and VisitUuid as hiddenAttributes", function(){
            var wardDetails = Bahmni.ADT.WardDetails.create(getDetails());
            expect(wardDetails[0].hiddenAttributes.patientUuid).toBe("patient-uuid1");
            expect(wardDetails[0].hiddenAttributes.visitUuid).toBe("visit-uuid1");

            expect(wardDetails[1].hiddenAttributes.patientUuid).toBe("patient-uuid2");
            expect(wardDetails[1].hiddenAttributes.visitUuid).toBe("visit-uuid2");

            expect(wardDetails[2].hiddenAttributes.patientUuid).toBe("patient-uuid3");
            expect(wardDetails[2].hiddenAttributes.visitUuid).toBe("visit-uuid3");

        });
    });
});