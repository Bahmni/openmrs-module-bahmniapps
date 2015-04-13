'use strict';

describe("RecordsMapper", function () {
    var encounters = [
        {
            "id": 66796,
            "src": "/document_images/152000/151915-RADIOLOGY-4fa7281b-6499-4392-8243-99fbe6da834b.jpeg",
            "concept": {
                "display": "CHEST AP",
                "uuid": "0983ad38-b4ce-11e3-9f29-0800271c1b75",
                "name": "CHEST AP"
            },
            imageObservation: {
                "observationDateTime": "2014-04-18T15:22:42.000+0530"
            },
            "visitUuid": "644a4443-b794-409f-95c4-e385c9affc68",
            "title": "CHEST AP, 18-Apr-2014"
        },
        {
            "id": 66798,
            "src": "/document_images/152000/151915-RADIOLOGY-6eb0486a-fcf8-47e1-9327-90b47e03b70b.png",
            "concept": {
                "display": "ARM Scapula Lateral",
                "uuid": "08a5dfef-b4ce-11e3-9f29-0800271c1b75",
                "name": "ARM Scapula Lateral"
            },
            imageObservation: {
                "observationDateTime": "2014-04-21T00:00:00.000+0530"
            },
            "visitUuid": "aa15a8fe-6aaa-40d6-8294-6df528d77817",
            "title": "ARM Scapula Lateral, 21-Apr-2014"
        },
        {
            "id": 66800,
            "src": "/document_images/152000/151915-RADIOLOGY-4e56f658-6a34-420a-ba26-60aa9e503973.jpeg",
            "concept": {
                "display": "Shoulder - Right, 2 views (X-ray)",
                "uuid": "07522831-b4ce-11e3-9f29-0800271c1b75",
                "name": "Shoulder - Right, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-21T00:00:00.000+0530"
            },
            "visitUuid": "aa15a8fe-6aaa-40d6-8294-6df528d77817",
            "title": "Shoulder - Right, 2 views (X-ray), 21-Apr-2014"
        },
        {
            "id": 66802,
            "src": "/document_images/152000/151915-RADIOLOGY-fdd62754-84ea-4d9a-8665-3a21d99f9b12.jpeg",
            "concept": {
                "display": "HEAD Skull AP",
                "uuid": "09c3c0db-b4ce-11e3-9f29-0800271c1b75",
                "name": "HEAD Skull AP"
            },
            imageObservation: {
                "observationDateTime": "2014-04-18T15:22:42.000+0530"
            },
            "visitUuid": "644a4443-b794-409f-95c4-e385c9affc68",
            "title": "HEAD Skull AP, 18-Apr-2014"
        },
        {
            "id": 66804,
            "src": "/document_images/152000/151915-RADIOLOGY-1257c5bf-ae78-4ea4-8ad5-c6bc51d423c0.jpeg",
            "concept": {
                "display": "HEAD Skull AP",
                "uuid": "09c3c0db-b4ce-11e3-9f29-0800271c1b75",
                "name": "HEAD Skull AP"
            },
            imageObservation: {
                "observationDateTime": "2014-04-18T15:22:42.000+0530"
            },
            "visitUuid": "644a4443-b794-409f-95c4-e385c9affc68",
            "title": "HEAD Skull AP, 18-Apr-2014"
        },
        {
            "id": 66806,
            "src": "/document_images/152000/151915-RADIOLOGY-ae8ad6cc-47f4-409a-b437-0ad7b1920dcf.jpeg",
            "concept": {
                "display": "Chest, 2 views (X-ray)",
                "uuid": "0670d355-b4ce-11e3-9f29-0800271c1b75",
                "name": "Chest, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-21T00:00:00.000+0530"
            },
            "visitUuid": "a2960f37-79f1-4915-a997-11cb745e0a2a",
            "title": "Chest, 2 views (X-ray), 21-Apr-2014"
        },
        {
            "id": 66808,
            "src": "/document_images/152000/151915-RADIOLOGY-834b8349-a750-4911-b0db-a664d5ed286d.jpeg",
            "concept": {
                "display": "Chest, 2 views (X-ray)",
                "uuid": "0670d355-b4ce-11e3-9f29-0800271c1b75",
                "name": "Chest, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-21T00:00:00.000+0530"
            },
            "visitUuid": "a2960f37-79f1-4915-a997-11cb745e0a2a",
            "title": "Chest, 2 views (X-ray), 21-Apr-2014"
        },
        {
            "id": 66810,
            "src": "/document_images/152000/151915-RADIOLOGY-5e7c6c08-c1a9-43b0-bec2-4677c7915848.jpeg",
            "concept": {
                "display": "Chest, 2 views (X-ray)",
                "uuid": "0670d355-b4ce-11e3-9f29-0800271c1b75",
                "name": "Chest, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-21T00:00:00.000+0530"
            },
            "visitUuid": "a2960f37-79f1-4915-a997-11cb745e0a2a",
            "title": "Chest, 2 views (X-ray), 21-Apr-2014"
        },
        {
            "id": 66861,
            "src": "/document_images/152000/151915-RADIOLOGY-c10d233d-f14c-4382-99f7-ca26b54aede6.png",
            "concept": {
                "display": "ARM Humerus AP",
                "uuid": "08b53c15-b4ce-11e3-9f29-0800271c1b75",
                "name": "ARM Humerus AP"
            },
            imageObservation: {
                "observationDateTime": "2014-04-23T17:29:59.000+0530"
            },
            "visitUuid": "644a4443-b794-409f-95c4-e385c9affc68",
            "title": "ARM Humerus AP, 23-Apr-2014"
        },
        {
            "id": 66863,
            "src": "/document_images/152000/151915-RADIOLOGY-3f983869-6cc9-48df-beb9-7023fbe8361f.png",
            "concept": {
                "display": "Shoulder - Right, 2 views (X-ray)",
                "uuid": "07522831-b4ce-11e3-9f29-0800271c1b75",
                "name": "Shoulder - Right, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-23T17:32:56.000+0530"
            },
            "visitUuid": "644a4443-b794-409f-95c4-e385c9affc68",
            "title": "Shoulder - Right, 2 views (X-ray), 23-Apr-2014"
        },
        {
            "id": 66865,
            "src": "/document_images/152000/151915-RADIOLOGY-52f50407-b264-4567-8dca-9a42eb7463b7.png",
            "concept": {
                "display": "ARM Elbow Lateral",
                "uuid": "08cc4b63-b4ce-11e3-9f29-0800271c1b75",
                "name": "ARM Elbow Lateral"
            },
            imageObservation: {
                "observationDateTime": "2014-04-23T17:35:26.000+0530"
            },
            "visitUuid": "644a4443-b794-409f-95c4-e385c9affc68",
            "title": "ARM Elbow Lateral, 23-Apr-2014"
        },
        {
            "id": 66867,
            "src": "/document_images/152000/151915-RADIOLOGY-5175668d-f724-4f77-b51b-95ebba9fefc0.png",
            "concept": {
                "display": "Shoulder - Left, 2 views (X-ray)",
                "uuid": "07491e10-b4ce-11e3-9f29-0800271c1b75",
                "name": "Shoulder - Left, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-23T17:37:15.000+0530"
            },
            "visitUuid": "59fb00c4-cbae-4edf-9851-65fd8f077b60",
            "title": "Shoulder - Left, 2 views (X-ray), 23-Apr-2014"
        },
        {
            "id": 66869,
            "src": "/document_images/152000/151915-RADIOLOGY-538173cb-1a73-4ad7-8338-d09e6bdac141.png",
            "concept": {
                "display": "ARM Wrist PA",
                "uuid": "08e43484-b4ce-11e3-9f29-0800271c1b75",
                "name": "ARM Wrist PA"
            },
            imageObservation: {
                "observationDateTime": "2014-04-23T17:46:26.000+0530"
            },
            "visitUuid": "59fb00c4-cbae-4edf-9851-65fd8f077b60",
            "title": "ARM Wrist PA, 23-Apr-2014"
        },
        {
            "id": 66871,
            "src": "/document_images/152000/151915-RADIOLOGY-b5634161-6c28-4bde-8c18-8c965a60f444.png",
            "concept": {
                "display": "LEG Lower leg including ankle",
                "uuid": "094c2c9c-b4ce-11e3-9f29-0800271c1b75",
                "name": "LEG Lower leg including ankle"
            },
            imageObservation: {
                "observationDateTime": "2014-04-23T17:47:13.000+0530"
            },
            "visitUuid": "59fb00c4-cbae-4edf-9851-65fd8f077b60",
            "title": "LEG Lower leg including ankle, 23-Apr-2014"
        },
        {
            "id": 66909,
            "src": "/document_images/152000/151915-RADIOLOGY-ba8ea929-67c0-4cc4-8e8d-f443d1827197.jpeg",
            "concept": {
                "display": "Hip - Right, 2 views (X-ray)",
                "uuid": "068e91e0-b4ce-11e3-9f29-0800271c1b75",
                "name": "Hip - Right, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-24T00:19:12.000+0530"
            },
            "visitUuid": "59fb00c4-cbae-4edf-9851-65fd8f077b60"
        },
        {
            "id": 66100,
            "src": "/document_images/152000/151915-RADIOLOGY-abcda929-67c0-4cc4-8e8d-f443d1827197.jpeg",
            "concept": {
                "display": "Face - Right, 2 views (X-ray)",
                "uuid": "068e91e0-b4ce-11e3-9f29-0800271c1b77",
                "name": "Face - Right, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-24T00:19:12.000+0530"
            },
            "visitUuid": "59fb00c4-cbae-4edf-9851-65fd8f077b61"
        },
        {
            "id": 66101,
            "src": "/document_images/152000/151915-RADIOLOGY-xyz4a929-67c0-4cc4-8e8d-f443d1827197.jpeg",
            "concept": {
                "display": "Face - Right, 2 views (X-ray)",
                "uuid": "068e91e0-b4ce-11e3-9f29-0800271c1b77",
                "name": "Face - Right, 2 views (X-ray)"
            },
            imageObservation: {
                "observationDateTime": "2014-04-24T00:19:14.000+0530"
            },
            "visitUuid": "59fb00c4-cbae-4edf-9851-65fd8f077b61"
        }
    ];

    it("should map radiology record observations", function () {
        var recordGroups = new Bahmni.Clinical.RecordsMapper().map(encounters);

        var recordsForChest2Views = recordGroups.filter(function (group) { return group.conceptName =="Chest, 2 views (X-ray)" })[0];
        var headSkullAP = recordGroups.filter(function (group) { return group.conceptName =="HEAD Skull AP" })[0];
        var hipRightXRay = recordGroups.filter(function (group) { return group.conceptName =="Hip - Right, 2 views (X-ray)" })[0];

        expect(recordGroups.length).toBe(12);
        expect(recordsForChest2Views.records.length).toBe(3);
        expect(headSkullAP.records.length).toBe(2);
        expect(hipRightXRay.records.length).toBe(1);

    })
});
