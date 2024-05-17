export const mockFormResponseData = [
    {
        "formType": "v2",
        "formName": "Orthopaedic Triage",
        "formVersion": 1,
        "visitUuid": "1bf8c151-1786-479b-9ea9-9d26b4247dc7",
        "visitStartDateTime": 1693277349000,
        "encounterUuid": "6e52cecd-a095-457f-9515-38cf9178cb50",
        "encounterDateTime": 1693277657000,
        "providers": [
            {
                "providerName": "Doctor Two",
                "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
            }
        ]
    },
    {
        "formType": "v2",
        "formName": "Pre Anaesthesia Assessment",
        "formVersion": 1,
        "visitUuid": "3f5145bb-70b1-4240-97c8-66c5cb1944af",
        "visitStartDateTime": 1692871165000,
        "encounterUuid": "8a5598e3-0598-410a-a8aa-778ca2264791",
        "encounterDateTime": 1693217959000,
        "providers": [
            {
                "providerName": "Doctor One",
                "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
            }
        ]
    },
    {
        "formType": "v2",
        "formName": "Patient Progress Notes and Orders",
        "formVersion": 1,
        "visitUuid": "1bf8c151-1786-479b-9ea9-9d26b4247dc7",
        "visitStartDateTime": 1693277349000,
        "encounterUuid": "6e52cecd-a095-457f-9515-38cf9178cb50",
        "encounterDateTime": 1693277657000,
        "providers": [
            {
                "providerName": "Doctor One",
                "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
            }
        ]
    },
    {
        "formType": "v2",
        "formName": "Pre Anaesthesia Assessment",
        "formVersion": 1,
        "visitUuid": "3f5145bb-70b1-4240-97c8-66c5cb1944af",
        "visitStartDateTime": 1692871165000,
        "encounterUuid": "4c73a202-0b2b-4195-b415-3151d69bfb73",
        "encounterDateTime": 1692950695000,
        "providers": [
            {
                "providerName": "Doctor One",
                "uuid": "c1c21e11-3f10-11e4-adec-0800271c1b75"
            }
        ]
    }
];

export const mockLatestPublishedForms = [
    {
        "name": "Orthopaedic Triage",
        "uuid": "54ce421b-3b8a-43b4-8af0-681317cf8a0b",
        "version": "2",
        "published": true,
        "id": 35,
        "resources": null,
        "privileges": [],
        "nameTranslation": "[{\"display\":\"Orthopaedic Triage\",\"locale\":\"en\"}]"
    },
    {
        "name": "Pre Anaesthesia Assessment",
        "uuid": "54ce421b-3b8a-43b4-8af0-681317cf8a01",
        "version": "1",
        "published": true,
        "id": 36,
        "resources": null,
        "privileges": [],
        "nameTranslation": "[{\"display\":\"Pre Anaesthesia Assessment\",\"locale\":\"en\"}]"
    },
    {
        "name": "Patient Progress Notes and Orders",
        "uuid": "54ce421b-3b8a-43b4-8af0-681317cf8a02",
        "version": "1",
        "published": true,
        "id": 37,
        "resources": null,
        "privileges": [],
        "nameTranslation": "[{\"display\":\"Patient Progress Notes and Orders\",\"locale\":\"en\"}]"
    }
]

export const mockEncounterData = {
    encounterUuid: "123",
    observations: [{
        "formFieldPath": "Dummy form.1/4-0",
        "groupMembers": [{
            "encounterDateTime": 1715245423000,
            "providers": [{
              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
              "name": "Super Man"
            }],
            "type": "Numeric",
            "concept": {
              "shortName": "Systolic",
              "units": "mm Hg"
            },
            "observationDateTime": 1715245524000,
            "valueAsString": "150.0",
            "value": 150
          },
          {
            "formFieldPath": "Dummy form.1/4-0",
            "encounterDateTime": 1715245423000,
            "providers": [{
              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
              "name": "Super Man"
            }],
            "type": "Boolean",
            "concept": {
              "shortName": "Systolic Abnormal"
            },
            "observationDateTime": 1715245524000,
            "valueAsString": "Yes",
            "value": true
          }
        ],
        "concept": {
          "shortName": "Dummy form"
        },
        "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa"
      },
      {
        "formFieldPath": "Dummy form2.1/4-0",
        "groupMembers": [{
            "encounterDateTime": 1715245423000,
            "providers": [{
              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
              "name": "Super Man"
            }],
            "type": "Numeric",
            "concept": {
              "shortName": "Systolic",
              "units": "mm Hg"
            },
            "observationDateTime": 1715245524000,
            "valueAsString": "150.0",
            "value": 150
          },
          {
            "formFieldPath": "Dummy form.1/4-0",
            "encounterDateTime": 1715245423000,
            "providers": [{
              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
              "name": "Super Man"
            }],
            "type": "Boolean",
            "concept": {
              "shortName": "Systolic Abnormal"
            },
            "observationDateTime": 1715245524000,
            "valueAsString": "Yes",
            "value": true
          }
        ],
        "concept": {
          "shortName": "Dummy form"
        },
        "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa"
      },
      {
        "groupMembers": [{
            "encounterDateTime": 1715245423000,
            "providers": [{
              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
              "name": "Super Man"
            }],
            "type": "Numeric",
            "concept": {
              "shortName": "Systolic",
              "units": "mm Hg"
            },
            "observationDateTime": 1715245524000,
            "valueAsString": "150.0",
            "value": 150
          },
          {
            "formFieldPath": "Dummy form.1/4-0",
            "encounterDateTime": 1715245423000,
            "providers": [{
              "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
              "name": "Super Man"
            }],
            "type": "Boolean",
            "concept": {
              "shortName": "Systolic Abnormal"
            },
            "observationDateTime": 1715245524000,
            "valueAsString": "Yes",
            "value": true
          }
        ],
        "concept": {
          "shortName": "Dummy form"
        },
        "encounterUuid": "73164be4-c61a-4c7e-934c-ee48821cfdaa"
      }
    ],
};

export const mockObservations = [
    {
        "value": [{
            "groupMembers": [{
                "encounterDateTime": 1715245423000,
                "providers": [{
                  "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                  "name": "Super Man"
                }],
                "type": "Numeric",
                "concept": {
                  "shortName": "Systolic",
                  "units": "mm Hg"
                },
                "observationDateTime": 1715245524000,
                "valueAsString": "150.0",
                "value": 150
              },
              {
                "formFieldPath": "Dummy form.1/4-0",
                "encounterDateTime": 1715245423000,
                "providers": [{
                  "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                  "name": "Super Man"
                }],
                "type": "Boolean",
                "concept": {
                  "shortName": "Systolic Abnormal"
                },
                "observationDateTime": 1715245524000,
                "valueAsString": "Yes",
                "value": true
              }
            ],
            "groupMembers": [{
                "encounterDateTime": 1715245423000,
                "providers": [{
                  "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                  "name": "Super Man"
                }],
                "type": "Numeric",
                "concept": {
                  "shortName": "Systolic",
                  "units": "mm Hg"
                },
                "observationDateTime": 1715245524000,
                "valueAsString": "150.0",
                "value": 150
              },
              {
                "formFieldPath": "Dummy form.1/4-0",
                "encounterDateTime": 1715245423000,
                "providers": [{
                  "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                  "name": "Super Man"
                }],
                "type": "Boolean",
                "concept": {
                  "shortName": "Systolic Abnormal"
                },
                "observationDateTime": 1715245524000,
                "valueAsString": "Yes",
                "value": true
              }
            ],
            "groupMembers": [{
                "encounterDateTime": 1715245423000,
                "providers": [{
                  "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                  "name": "Super Man"
                }],
                "type": "Numeric",
                "concept": {
                  "shortName": "Systolic",
                  "units": "mm Hg"
                },
                "observationDateTime": 1715245524000,
                "valueAsString": "150.0",
                "value": 150
              },
              {
                "formFieldPath": "Dummy form.1/4-0",
                "encounterDateTime": 1715245423000,
                "providers": [{
                  "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                  "name": "Super Man"
                }],
                "type": "Boolean",
                "concept": {
                  "shortName": "Systolic Abnormal"
                },
                "observationDateTime": 1715245524000,
                "valueAsString": "Yes",
                "value": true
              }
            ],},]
    }
]