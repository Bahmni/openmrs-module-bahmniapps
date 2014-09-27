'use strict';

describe("EncounterTransactionToObsMapper", function () {
    var obsMatchingUuid = function(observations, uuid) {
        return observations.filter(function(observation) {
            return observation.uuid === uuid;
        });
    };

    it("should give a list of obs from all encounter transaction objects in an array", function () {
        var encounterTransactions = [
            {   providers: [{uuid: "provider"}],
                observations: [
                {uuid: "a61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []},
                {uuid: "b61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []}
            ]},
            {
                providers: [{uuid: "provider"}],
                observations: [
                {uuid: "c61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []}
            ]}
        ];

        var observations = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions, []);
        expect(observations.length).toBe(3);
        expect(obsMatchingUuid(observations, "a61436b6-7813-42fd-8af2-eb5d23ed726c").length).toBe(1);
        expect(obsMatchingUuid(observations, "b61436b6-7813-42fd-8af2-eb5d23ed726c").length).toBe(1);
        expect(obsMatchingUuid(observations, "c61436b6-7813-42fd-8af2-eb5d23ed726c").length).toBe(1);
    });

    it("should ignore voided observations", function () {
        var encounterTransactions = [
            {   providers: [{uuid: "provider"}],
                observations: [
                    {uuid: "a61436b6-7813-42fd-8af2-eb5d23ed726c", voided: true, value: 100, groupMembers: []},
                    {uuid: "b61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []}
                ]},
            {
                providers: [{uuid: "provider"}],
                observations: [
                    {uuid: "c61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []}
                ]}
        ];

        var observations = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions, []);
        expect(observations.length).toBe(2);
        expect(obsMatchingUuid(observations, "a61436b6-7813-42fd-8af2-eb5d23ed726c").length).toBe(0);
        expect(obsMatchingUuid(observations, "b61436b6-7813-42fd-8af2-eb5d23ed726c").length).toBe(1);
        expect(obsMatchingUuid(observations, "c61436b6-7813-42fd-8af2-eb5d23ed726c").length).toBe(1);
    });

    it("should inject provider into each observation", function () {
        var encounterTransactions = [
            {   providers: [{uuid: "provider1"}],
                observations: [
                    {uuid: "a61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []},
                    {uuid: "b61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []}
                ]},
            {
                providers: [{uuid: "provider2"}],
                observations: [
                    {uuid: "c61436b6-7813-42fd-8af2-eb5d23ed726c", voided: false, value: 100, groupMembers: []}
                ]}
        ];

        var observations = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions, []);
        expect(observations.length).toBe(3);
        expect(obsMatchingUuid(observations, "a61436b6-7813-42fd-8af2-eb5d23ed726c")[0].provider.uuid).toBe("provider1");
        expect(obsMatchingUuid(observations, "b61436b6-7813-42fd-8af2-eb5d23ed726c")[0].provider.uuid).toBe("provider1");
        expect(obsMatchingUuid(observations, "c61436b6-7813-42fd-8af2-eb5d23ed726c")[0].provider.uuid).toBe("provider2");
    });

    it("should create multiselectObservations in each observations list",function(){
        var encounterTransactions = [
            {
                "providers": [
                    {
                        "uuid": "d390d057-ec33-45c1-8342-9e23d706aa4d",
                        "name": "System Administrator"
                    }
                ],
                "observations": [
                    {
                        "uuid": "e670f8cb-b646-4b83-9416-47ea51bde512",
                        "voidReason": null,
                        "groupMembers": [
                            {
                                "uuid": "7530ccfb-09d5-4b8b-a510-a2ddf496bbd0",
                                "groupMembers": [],
                                "observationDateTime": "2014-09-15T11:32:04.000+0530",
                                "value": {
                                    "shortName": null,
                                    "uuid": "28521ec9-e34b-11e3-983a-91270dcbd3bf",
                                    "name": "HIV disease"
                                },
                                "concept": {
                                    "shortName": "mdco",
                                    "uuid": "2691bfae-d81e-4ba4-9935-bad77b0b3cb0",
                                    "name": "May die coz of"
                                }
                            },
                            {
                                "uuid": "41040410-6325-4b22-8bf5-08abe8c35228",
                                "groupMembers": [],
                                "observationDateTime": "2014-09-15T11:32:04.000+0530",
                                "value": {
                                    "shortName": null,
                                    "uuid": "3fc1b8a3-e34b-11e3-983a-91270dcbd3bf",
                                    "name": "Diabetes II, w/ unspec. complications"
                                },
                                "concept": {
                                    "shortName": "mdco",
                                    "uuid": "2691bfae-d81e-4ba4-9935-bad77b0b3cb0",
                                    "name": "May die coz of"
                                }
                            }
                        ],
                        "observationDateTime": "2014-09-15T11:32:04.000+0530",
                        "value": "HIV disease, Diabetes II, w/ unspec. complications",
                        "comment": null,
                        "concept": {
                            "shortName": "Vitals",
                            "uuid": "577d4c6b-9bc6-11e3-927e-8840ab96f0f1",
                            "name": "Vitals",
                            "set": true,
                            "conceptClass": "Misc",
                            "dataType": "N/A"
                        }
                    }
                ]
            }];

        var observations = new Bahmni.Clinical.EncounterTransactionToObsMapper().map(encounterTransactions,[],{'May die coz of':{multiSelect:true,buttonSelect:true}});
        expect(observations.length).toBe(1);
        var mappedObservations = observations[0].groupMembers;
        expect(mappedObservations.length).toBe(3);
        expect(mappedObservations[0].isMultiSelect).toBeTruthy();
        expect(_.values(mappedObservations[0].selectedObs).length).toBe(2);
    });

});

