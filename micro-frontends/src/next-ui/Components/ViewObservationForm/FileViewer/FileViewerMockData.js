export const mockInfoMap = {
  providerName: "test provider",
  encounterDateTime: "encounterDateTime",
  comment: "comment",
  fileName: "fileName",
  fileType: "image/jpeg",
  fileSource: "fileSource",
};

export const mockVideoInfoMap = {
  providerName: "test provider",
  encounterDateTime: "encounterDateTime",
  comment: "comment",
  fileName: "fileName",
  fileType: "image/jpeg",
  fileSource: "fileSource",
};

export const mockIndex = 0;

export const mockItem = {
  providers: [
    {
      name: "test provider",
    },
  ],
  encounterDateTime: 1713856719000,
  comment: "comment",
  complexData: {
    title: "fileName",
    mimeType: "image/jpeg",
  },
  value: "fileSource",
};

export const mockPdfItem = {
  providers: [
    {
      name: "test provider",
    },
  ],
  encounterDateTime: 1713856719000,
  comment: "comment",
  complexData: {
    title: "fileName",
    mimeType: "application/pdf",
  },
  value: "fileSource",
};

export const mockVideoItem = {
  providers: [
    {
      name: "test provider",
    },
  ],
  encounterDateTime: 1713856719000,
  comment: "comment",
  complexData: {
    title: "fileName",
    mimeType: "video/mp4",
  },
  value: "fileSource",
};

export const observationList = [
  {
    encounterDateTime: 1713856719000,
    groupMembers: [],
    providers: [
      {
        uuid: "c1c26908-3f10-11e4-adec-0800271c1b75",
        name: "test provider one",
        encounterRoleUuid: "a0b03050-c99b-11e0-9572-0800200c9a66",
      },
    ],
    isAbnormal: null,
    duration: null,
    type: "Complex",
    encounterUuid: "276f3f45-2bdb-4166-b495-8e3463774034",
    interpretation: null,
    complexData: {
      title: "51196-Consultation-3c01db16-e63a-4b83-9159-dc3f4e8ebb01.mp4",
      mimeType: "video/mp4",
    },
    conceptNameToDisplay: "Patient Video",
    concept: {
      uuid: "eef8e969-269d-40c4-b7c9-182da11c2653",
      name: "Patient Video",
      dataType: "Complex",
      shortName: "Patient Video",
    },
    conceptUuid: "eef8e969-269d-40c4-b7c9-182da11c2653",
    comment: "Sample comments are added one",
    value: "51200/51196-Consultation-3c01db16-e63a-4b83-9159-dc3f4e8ebb01.mp4",
  },
  {
    encounterDateTime: 1713856719000,
    groupMembers: [],
    providers: [
      {
        uuid: "c1c26908-3f10-11e4-adec-0800271c1b75",
        name: "test provider one",
      },
    ],
    isAbnormal: null,
    type: "Complex",
    interpretation: null,
    complexData: {
      title: "51196-Consultation-37e2a799-b44c-412f-9a16-1f04ae8f9a34.mp4",
      mimeType: "video/mp4",
    },
    conceptNameToDisplay: "Patient Video",
    concept: {
      uuid: "eef8e969-269d-40c4-b7c9-182da11c2653",
      name: "Patient Video",
      dataType: "Complex",
      shortName: "Patient Video",
    },
    conceptUuid: "eef8e969-269d-40c4-b7c9-182da11c2653",
    comment: "Sample comments are added two",
    value: "51200/51196-Consultation-37e2a799-b44c-412f-9a16-1f04ae8f9a34.mp4",
  },
  {
    encounterDateTime: 1713856719000,
    groupMembers: [],
    providers: [
      {
        uuid: "c1c26908-3f10-11e4-adec-0800271c1b75",
        name: "test provider one",
      },
    ],
    isAbnormal: null,
    type: "Complex",
    interpretation: null,
    complexData: {
      title: "51196-Consultation-445dd7fc-a7c7-4e9c-8ea6-70a3f567d8d4.jpeg",
      mimeType: "image/jpeg",
    },
    conceptNameToDisplay: "Image",
    concept: {
      uuid: "6ca8ddf3-4e3d-4116-bd4e-a5147e580931",
      name: "Image",
      dataType: "Complex",
      shortName: "Image",
    },
    comment: "Sample comments are added three",
    value: "51200/51196-Consultation-445dd7fc-a7c7-4e9c-8ea6-70a3f567d8d4.jpeg",
  },
  {
    encounterDateTime: 1713856719000,
    groupMembers: [],
    providers: [
      {
        uuid: "c1c26908-3f10-11e4-adec-0800271c1b75",
        name: "test provider one",
      },
    ],
    isAbnormal: null,
    type: "Complex",
    interpretation: null,
    complexData: {
      title: "51196-Consultation-46b1cbfc-00a7-4cbb-afdf-71ac2b040182.jpeg",
      mimeType: "image/jpeg",
    },
    conceptNameToDisplay: "Image",
    concept: {
      uuid: "6ca8ddf3-4e3d-4116-bd4e-a5147e580931",
      name: "Image",
      dataType: "Complex",
      shortName: "Image",
    },
    comment: "Sample comments are added four",
    value: "51200/51196-Consultation-46b1cbfc-00a7-4cbb-afdf-71ac2b040182.jpeg",
  },
  {
    encounterDateTime: 1713856719000,
    groupMembers: [],
    providers: [
      {
        uuid: "c1c26908-3f10-11e4-adec-0800271c1b75",
        name: "test provider one",
      },
    ],
    isAbnormal: null,
    type: "Complex",
    interpretation: null,
    complexData: {
      title: "51196-Consultation-aa0a417a-0a61-4c97-b4be-fe3fc43ea371.pdf",
      mimeType: "application/pdf",
    },
    conceptNameToDisplay: "Image",
    concept: {
      uuid: "6ca8ddf3-4e3d-4116-bd4e-a5147e580931",
      name: "Image",
      dataType: "Complex",
      shortName: "Image",
    },
    uuid: "8a643679-fcb2-4246-9b10-01a3d1eb4eb6",
    comment: null,
    value: "51200/51196-Consultation-aa0a417a-0a61-4c97-b4be-fe3fc43ea371.pdf",
  },
];

export const observationListWithGroupMembers = [{
  "encounterDateTime": 1713953624000,
  "groupMembers": [
    {
      "encounterDateTime": 1713953624000,
      "groupMembers": [],
      "providers": [
        {
          "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
          "name": "provider one",
        }
      ],
      "type": "Complex",
      "interpretation": null,
      "complexData": {
        "title": "51196-Consultation-e1e88b46-5db9-43c4-97fc-34096bdaad25.jpeg",
        "mimeType": "image/jpeg",
      },
      "conceptNameToDisplay": "Image 0-9-3",
      "valueAsString": "51200/51196-Consultation-e1e88b46-5db9-43c4-97fc-34096bdaad25.jpeg",
      "concept": {
        "uuid": "4fbf4b32-4411-436c-9c3b-1a907685a0a0",
        "name": "Image 0-9-3",
        "dataType": "Complex",
        "shortName": "Image 0-9-3",
      },
      "comment": "Notes 1",
      "value": "51200/51196-Consultation-e1e88b46-5db9-43c4-97fc-34096bdaad25.jpeg"
    },
    {
      "encounterDateTime": 1713953624000,
      "groupMembers": [],
      "providers": [
        {
          "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
          "name": "provider one",
        }
      ],
      "type": "Complex",
      "interpretation": null,
      "complexData": {
        "title": "51196-Consultation-1cb9db39-987b-4f36-bf9b-3f4538e9b478.png",
        "mimeType": "image/png",
      },
      "conceptNameToDisplay": "Image 0-9-3",
      "valueAsString": "51200/51196-Consultation-1cb9db39-987b-4f36-bf9b-3f4538e9b478.png",
      "concept": {
        "uuid": "4fbf4b32-4411-436c-9c3b-1a907685a0a0",
        "name": "Image 0-9-3",
        "dataType": "Complex",
        "shortName": "Image 0-9-3",
      },
      "conceptUuid": "4fbf4b32-4411-436c-9c3b-1a907685a0a0",
      "comment": "Notes 2",
      "value": "51200/51196-Consultation-1cb9db39-987b-4f36-bf9b-3f4538e9b478.png"
    }
  ],
  "providers": [
    {
      "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
      "name": "provider one",
    }
  ],
  "type": null,
  "interpretation": null,
  "conceptNameToDisplay": "Consultation Images",
  "concept": {
    "uuid": "c3ae29e3-9836-4df9-bcef-8d01b776854d",
    "name": "Consultation Images",
    "dataType": "N/A",
    "shortName": "Consultation Images",
  },
  "conceptUuid": "c3ae29e3-9836-4df9-bcef-8d01b776854d",
  "comment": null,
  "value": "51200/51196-Consultation-1cb9db39-987b-4f36-bf9b-3f4538e9b478.png, 51200/51196-Consultation-e1e88b46-5db9-43c4-97fc-34096bdaad25.jpeg"
}];