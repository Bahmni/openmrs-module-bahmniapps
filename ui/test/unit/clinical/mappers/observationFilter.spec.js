
describe("Observation Filter", function () {

    describe("voidIfNull ", function () {
        it('should void observation if value is null and observation uuid is not null', function () {
					var observationFilter = new Bahmni.ObservationFilter();

						observationFilter.voidIfNull(observation);

					  expect(observation.groupMembers[0].voided).toBe(true);
					  expect(observation.groupMembers[2].voided).toBe(false);
						expect(observation.groupMembers[1].voided).toBe(false);
						expect(observation.groupMembers[1].groupMembers[0].voided).toBe(false);
						expect(observation.groupMembers[1].groupMembers[1].voided).toBe(true);
        });
    });

});

var observation = {
        "uuid": "686bef90-acba-4e68-bc25-0e3871af1e27",
        "observationDateTime": "2014-03-10T00:49:21.000+0530",
        "groupMembers": [
          {
            "uuid": "8f227384-16a6-46c6-a402-ef5662548ff6",
            "observationDateTime": "2014-03-10T00:49:21.000+0530",
            "groupMembers": [],
            "voidReason": null,
            "orderUuid": null,
            "value": null,
            "comment": null,
            "concept": {
              "uuid": "2cbd4654-dd1c-43cf-b31e-05369473bcf1",
              "name": "BPDD",
              "set": false,
              "dataType": "Numeric"
            },
            "voided": false
          },
          {
            "uuid": "2c31494e-3af7-4174-af76-916262238a57",
            "observationDateTime": "2014-03-10T00:49:21.000+0530",
            "groupMembers": [
              {
                "uuid": "",
                "observationDateTime": "2014-03-10T00:49:21.000+0530",
                "groupMembers": [],
                "voidReason": null,
                "orderUuid": null,
                "value": null,
                "comment": null,
                "concept": {
                  "uuid": "3c58c9e0-a34d-4bff-a610-ec748f042e41",
                  "name": "Diastolic",
                  "set": false,
                  "dataType": "Numeric"
                },
                "voided": false
              },
              {
                "uuid": "89f9a14b-4e8e-4d37-9553-1e7a6ddcfc8e",
                "observationDateTime": "2014-03-10T00:49:21.000+0530",
                "groupMembers": [],
                "voidReason": null,
                "orderUuid": null,
                "value": null,
                "comment": null,
                "concept": {
                  "uuid": "cf81ed04-993a-4a11-b78a-ddec169f1b25",
                  "name": "Systolic",
                  "set": false,
                  "dataType": "Numeric"
                },
                "voided": false
              }
            ],
            "voidReason": null,
            "orderUuid": null,
            "value": "",
            "comment": null,
            "concept": {
              "uuid": "595ddb35-c117-48cc-827e-1f92f95c9da2",
              "name": "Blood Pressure",
              "set": true,
              "dataType": "N/A"
            },
            "voided": false
          },
          {
            "uuid": "7832f2f8-abd8-4866-87f9-4de301cd0eea",
            "observationDateTime": "2014-03-10T00:57:37.000+0530",
            "groupMembers": [],
            "voidReason": null,
            "orderUuid": null,
            "value": {
              "uuid": "c25c4a79-697c-11e3-9f3c-0800271c1b75",
              "name": "Admission",
              "set": true,
              "dataType": "N/A"
            },
            "comment": null,
            "concept": {
              "uuid": "6a9c7833-6be5-4a82-a01e-9b810f02d024",
              "name": "abcd",
              "set": false,
              "dataType": "Coded"
            },
            "voided": false
          }
        ],
        "voidReason": null,
        "orderUuid": null,
        "value": "Admission",
        "comment": null,
        "concept": {
          "uuid": "c2538a21-697c-11e3-9f3c-0800271c1b75",
          "name": "VITALS_CONCEPT",
          "set": true,
          "dataType": "N/A"
        },
        "voided": false
      }