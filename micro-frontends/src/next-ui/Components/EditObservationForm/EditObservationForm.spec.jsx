import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import EditObservationForm from './EditObservationForm';

describe('EditObservationForm', () => {
    const mockProps = {
        "isEditFormLoading": false,
        "formName": "Radiology Study Report",
        "patient": {
            "uuid": "3c05ad1e-573e-43c5-81d2-ac18bfe3efd2",
            "givenName": "new",
            "familyName": "patient",
            "name": "new patient",
            "age": 22,
            "ageText": "22 <span> years </span>",
            "gender": "F",
            "genderText": "<span>Female</span>",
            "address": {},
            "birthdateEstimated": false,
            "birthtime": null,
            "identifier": "BAH203002",
            "birthdate": "2001-10-14T18:30:00.000Z",
            "image": "/openmrs/ws/rest/v1/patientImage?patientUuid=3c05ad1e-573e-43c5-81d2-ac18bfe3efd2",
            "registrationLocation": {
                "label": "Registration Location",
                "value": {
                    "uuid": "0fbbeaf4-f3ea-11ed-a05b-0242ac123210",
                    "display": "G Mobile Clinic",
                    "links": [
                        {
                            "rel": "self",
                            "uri": "http://localhost/openmrs/ws/rest/v1/location/0fbbeaf4-f3ea-11ed-a05b-0242ac123210",
                            "resourceAlias": "location"
                        }
                    ]
                },
                "isDateField": false
            },
            "confirmedPatient": {
                "label": "confirmedPatient",
                "value": true,
                "isDateField": false
            }
        },
        "formData": {
                "encounterDateTime": 1697378779000,
                "visitStartDateTime": null,
                "targetObsRelation": null,
                "groupMembers": [],
                "providers": [
                    {
                        "uuid": "c1c26908-3f10-11e4-adec-0800271c1b75",
                        "name": "Bailly RURANGIRWA",
                        "encounterRoleUuid": "a0b03050-c99b-11e0-9572-0800200c9a66"
                    }
                ],
                "isAbnormal": null,
                "duration": null,
                "type": "Text",
                "encounterUuid": "847d26db-d1db-4176-b704-f906dee15fad",
                "obsGroupUuid": null,
                "creatorName": "Bailly RURANGIRWA",
                "conceptSortWeight": 1,
                "parentConceptUuid": null,
                "hiNormal": null,
                "lowNormal": null,
                "formNamespace": "Bahmni",
                "formFieldPath": "Radiology Study Report.1/15-0",
                "interpretation": null,
                "status": "FINAL",
                "encounterTypeName": null,
                "complexData": null,
                "abnormal": null,
                "unknown": false,
                "orderUuid": null,
                "observationDateTime": 1697378779000,
                "conceptNameToDisplay": "Study Site, Projections and Comment",
                "voided": false,
                "voidReason": null,
                "valueAsString": "Done",
                "concept": {
                    "uuid": "38bdca1d-a351-4c64-84ae-e3390891f637",
                    "name": "Study Site, Projections and Comment",
                    "dataType": "Text",
                    "shortName": "Study Site, Projections and Comment",
                    "units": null,
                    "conceptClass": "Misc",
                    "hiNormal": null,
                    "lowNormal": null,
                    "set": false,
                    "mappings": []
                },
                "uuid": "f030fecd-6b48-416e-a6f6-1192ae8c18cc",
                "conceptUuid": "38bdca1d-a351-4c64-84ae-e3390891f637",
                "comment": null,
                "value": "Done"
            },
        "encounterUuid": "847d26db-d1db-4176-b704-f906dee15fad",
        "consultationMapper": {},
        "handleEditSave": jest.fn(),
        "closeEditObservationForm": jest.fn(),
        "handleSave": jest.fn()
    };
    
  it('should render the component', async () => {
    render(<EditObservationForm {...mockProps} />);
    await waitFor(() => {
        expect(screen.getByText('Radiology Study Report')).toBeTruthy();
    });
  });

  it('should show Loading screen if form is loading', async () => {
    var updatedProps = mockProps;
    updatedProps.isEditFormLoading = true;

    render(<EditObservationForm {...updatedProps} />);
    await waitFor(() => {
        expect(screen.queryAllByText("Active loading indicator")).toHaveLength(2);
    });
  });

});
