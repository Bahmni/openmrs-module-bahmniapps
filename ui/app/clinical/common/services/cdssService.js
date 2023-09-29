'use strict';

angular.module('bahmni.clinical')
    .service('cdssService', ['drugService', function (drugService) {
        var createMedicationRequest = function (medication, patientUuid, conceptSource) {
            return extractCodeInfo(medication, conceptSource).then(function (coding) {
                var medicationRequest = {
                    resourceType: 'MedicationRequest',
                    id: medication.uuid,
                    status: 'active',
                    intent: 'order',
                    subject: {
                        reference: 'Patient/' + patientUuid
                    },
                    medicationCodeableConcept: {
                        id: medication.drug.uuid,
                        coding: coding,
                        text: medication.drugNameDisplay
                    },
                    "dosageInstruction": [
                        {
                            "text": angular.toJson({ "instructions": medication.instructions }),
                            "timing": {
                                "event": [medication.effectiveStartDate],
                                "repeat": {
                                    "duration": medication.durationInDays,
                                    "durationUnit": medication.durationUnit && medication.durationUnit[0].toLowerCase()
                                },
                                "code": {
                                    "coding": [
                                        {
                                            "code": medication.drug.uuid,
                                            "display": medication.uniformDosingType.frequency
                                        }
                                    ],
                                    "text": medication.uniformDosingType.frequency
                                }
                            },
                            "asNeededBoolean": medication.asNeeded,
                            "doseAndRate": [
                                {
                                    "doseQuantity": {
                                        "value": medication.uniformDosingType.dose,
                                        "unit": medication.doseUnits,
                                        "code": medication.drug.uuid
                                    }
                                }
                            ]
                        }
                    ]

                };
                return {
                    resource: medicationRequest
                };
            });
        };

        var extractCodeInfo = function (medication, conceptSource) {
            if (!(medication.drug.drugReferenceMaps && medication.drug.drugReferenceMaps.length > 0)) {
                return Promise.resolve([{
                    code: medication.drug.uuid,
                    display: medication.drug.name,
                    system: 'https://fhir.openmrs.org'
                }]);
            } else {
                var drugReferenceMap = medication.drug.drugReferenceMaps[0];
                if (!conceptSource) {
                    return drugService.getDrugConceptSourceMapping(medication.drug.uuid).then(function (response) {
                        var bundle = response.data;
                        var code = bundle.entry && bundle.entry.length > 0 && bundle.entry[0].resource.code;
                        var conceptCode = code.coding.find(function (coding) {
                            return coding.system;
                        });
                        if (conceptCode) {
                            localStorage.setItem("conceptSource", conceptCode.system);
                            conceptSource = conceptCode.system;
                            return [{
                                system: conceptSource,
                                code: drugReferenceMap.conceptReferenceTerm && drugReferenceMap.conceptReferenceTerm.display && drugReferenceMap.conceptReferenceTerm.display.split(':')[1].trim(),
                                display: medication.drug.name
                            }, {
                                code: medication.drug.uuid,
                                system: 'https://fhir.openmrs.org',
                                display: medication.drug.name
                            }];
                        } else {
                            return [{
                                code: medication.drug.uuid,
                                display: medication.drug.name,
                                system: 'https://fhir.openmrs.org'
                            }];
                        }
                    });
                } else {
                    return Promise.resolve([{
                        system: conceptSource,
                        code: drugReferenceMap.conceptReferenceTerm && drugReferenceMap.conceptReferenceTerm.display && drugReferenceMap.conceptReferenceTerm.display.split(':')[1].trim(),
                        display: medication.drug.name
                    }, {
                        code: medication.drug.uuid,
                        system: 'https://fhir.openmrs.org',
                        display: medication.drug.name
                    }]);
                }
            }
        };

        var createConditionResource = function (condition, patientUuid, isDiagnosis) {
            var conceptLimitIndex = isDiagnosis ? -1 : condition.concept.uuid.lastIndexOf('/');
            var conditionStatus = condition.status || condition.certainty;
            var activeConditions = ['CONFIRMED', 'PRESUMED', 'ACTIVE'];
            var status = activeConditions.indexOf(conditionStatus) > -1 ? 'active' : 'inactive';
            var conditionResource = {
                resourceType: 'Condition',
                id: condition.uuid,
                clinicalStatus: {
                    coding: [
                        {
                            code: status,
                            display: status.charAt(0).toUpperCase() + status.slice(1),
                            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
                        }
                    ]
                },
                code: {
                    coding: [
                        {
                            system: isDiagnosis ? condition.codedAnswer.conceptSystem : (conceptLimitIndex > -1 ? (condition.concept.uuid.substring(0, conceptLimitIndex) || '') : ''),
                            code: isDiagnosis ? condition.codedAnswer.uuid : (conceptLimitIndex > -1 ? condition.concept.uuid.substring(conceptLimitIndex + 1) : condition.concept.uuid),
                            display: isDiagnosis ? condition.codedAnswer.name : condition.concept.name
                        }
                    ],
                    text: isDiagnosis ? condition.codedAnswer.name : condition.concept.name
                },
                subject: {
                    reference: 'Patient/' + patientUuid
                }
            };
            if (angular.isNumber(condition.onSetDate) === 'number') {
                conditionResource.onsetDateTime = new Date(condition.onSetDate).toLocaleDateString('en-CA');
            }
            if (!conditionResource.onsetDateTime) {
                delete conditionResource.onsetDateTime;
            }
            return {
                resource: conditionResource
            };
        };

        var createFhirBundle = function (patient, conditions, medications, diagnosis, conceptSource) {
            var encounterResource = conditions.filter(function (condition) {
                return !condition.uuid;
            }).map(function (condition) {
                return createConditionResource(condition, patient.uuid, false);
            });
            encounterResource = encounterResource.concat(diagnosis.map(function (condition) {
                return createConditionResource(condition, patient.uuid, true);
            }));

            return Promise.all(medications.map(function (medication) {
                return createMedicationRequest(medication, patient.uuid, conceptSource).then(function (medicationResource) {
                    return medicationResource;
                });
            })).then(function (medicationResources) {
                return {
                    resourceType: 'Bundle',
                    type: 'collection',
                    entry: [].concat(encounterResource, medicationResources)
                };
            });
        };

        var createParams = function (consultationData) {
            var patient = consultationData.patient;
            var conditions = consultationData.conditions;
            var diagnosis = consultationData.newlyAddedDiagnoses;
            var medications = consultationData.draftDrug;
            return {
                patient: patient,
                conditions: conditions,
                diagnosis: diagnosis,
                medications: medications
            };
        };

        var addNewAlerts = function (newAlerts, currentAlerts) {
            var activeAlerts = newAlerts.map(function (item) {
                item.isActive = true;
                item.detail = marked.parse(item.detail);
                if (item.source && item.source.url) {
                    item.detail = item.detail + ' <a href="' + item.source.url + '" target="_blank" ng-show="alert.source.url" class=""><i class="fa fa-question-circle"></i></a>';
                }
                return item;
            });
            if (!currentAlerts || (currentAlerts && currentAlerts.length === 0)) {
                return activeAlerts;
            }
            var alerts = activeAlerts.map(function (alert) {
                const getAlert = currentAlerts.find(function (currentAlert) {
                    return currentAlert.uuid === alert.uuid;
                });
                if (getAlert) {
                    if (alert.indicator !== getAlert.indicator) {
                        alert.isActive = true;
                    } else {
                        alert.isActive = getAlert.isActive;
                    }
                }
                return alert;
            });

            return alerts;
        };

        var sortInteractionsByStatus = function (alerts) {
            var order = { "critical": 0, "warning": 1, "info": 2 };
            return alerts.sort(function (a, b) {
                return order[a.indicator] - order[b.indicator];
            });
        };

        return {
            createFhirBundle: createFhirBundle,
            createParams: createParams,
            addNewAlerts: addNewAlerts,
            sortInteractionsByStatus: sortInteractionsByStatus
        };
    }]);
