'use strict';

angular.module('bahmni.clinical')
    .service('cdssService', ['drugService', '$rootScope', function (drugService, $rootScope) {
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
                                    "durationUnit": 'd'
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
                            ],
                            "route": {
                                "coding": [{
                                    "system": conceptSource,
                                    "code": "",
                                    "display": medication.route
                                }
                                ],
                                "text": medication.route
                            }
                        }
                    ]

                };
                return {
                    resource: medicationRequest
                };
            });
        };

        var extractConditionInfo = function (condition) {
            var uuid = condition.concept.uuid.split('/');
            var code = uuid[uuid.length - 1];
            uuid.pop();
            var system = uuid.join('/');
            return {
                code: code,
                system: system,
                display: condition.concept.name
            };
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
            var conditionStatus = condition.status || condition.diagnosisStatus || condition.certainty;
            var activeConditions = ['CONFIRMED', 'PRESUMED', 'ACTIVE'];
            var status = (!conditionStatus || activeConditions.indexOf(conditionStatus) > -1) ? 'active' : 'inactive';
            var conditionCoding = condition.concept ? extractConditionInfo(condition) : {
                system: isDiagnosis ? condition.codedAnswer.conceptSystem : (conceptLimitIndex > -1 ? (condition.concept.uuid.substring(0, conceptLimitIndex) || '') : ''),
                code: isDiagnosis ? condition.codedAnswer.uuid : (conceptLimitIndex > -1 ? condition.concept.uuid.substring(conceptLimitIndex + 1) : condition.concept.uuid),
                display: isDiagnosis ? condition.codedAnswer.name : condition.concept.name
            };

            var conditionResource = {
                resourceType: 'Condition',
                id: condition.uuid,
                clinicalStatus: {
                    coding: [
                        {
                            code: status,
                            display: status,
                            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical'
                        }
                    ]
                },
                code: {
                    coding: [ conditionCoding ],
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

        function createPatientResource (patient) {
            var patientResource = {
                resourceType: 'Patient',
                id: patient.uuid
            };
            return {
                resource: patientResource
            };
        }

        var createFhirBundle = function (patient, conditions, medications, diagnosis, conceptSource) {
            var encounterResource = conditions.filter(function (condition) {
                return !condition.uuid;
            }).map(function (condition) {
                return createConditionResource(condition, patient.uuid, false);
            });
            encounterResource = encounterResource.concat(diagnosis.map(function (condition) {
                return createConditionResource(condition, patient.uuid, true);
            }));

            medications = medications.filter(function (medication) {
                return angular.isDefined(medication.include) && medication.include || medication.include === undefined;
            });

            return Promise.all(medications.map(function (medication) {
                return createMedicationRequest(medication, patient.uuid, conceptSource).then(function (medicationResource) {
                    return medicationResource;
                });
            })).then(function (medicationResources) {
                var bundleResource = {
                    resourceType: 'Bundle',
                    type: 'collection',
                    entry: []
                };
                if (medicationResources.length === 0 && encounterResource.length === 0) {
                    var patientResource = createPatientResource(patient);
                    bundleResource.entry = bundleResource.entry.concat(patientResource);
                    return bundleResource;
                }
                bundleResource.entry = bundleResource.entry.concat(encounterResource, medicationResources);
                return bundleResource;
            });
        };

        var getAlerts = function (cdssEnabled, consultation, patient) {
            if (cdssEnabled) {
                var consultationData = angular.copy(consultation);
                consultationData.patient = patient;

                var orderSetTreatments = consultationData.newlyAddedTabTreatments ? consultationData.newlyAddedTabTreatments.allMedicationTabConfig.orderSetTreatments : [];
                var drafts = consultationData.newlyAddedTabTreatments ? consultationData.newlyAddedTabTreatments.allMedicationTabConfig.treatments : [];
                consultationData.draftDrug = drafts.concat(orderSetTreatments);
                var params = createParams(consultationData);
                createFhirBundle(params.patient, params.conditions, params.medications, params.diagnosis)
                .then(function (bundle) {
                    var cdssAlerts = drugService.sendDiagnosisDrugBundle(bundle);
                    cdssAlerts.then(function (response) {
                        var alerts = response.data;
                        var existingAlerts = $rootScope.cdssAlerts || [];
                        $rootScope.cdssAlerts = addNewAlerts(alerts, existingAlerts, bundle);
                    });
                });
            }
        };

        var createParams = function (consultationData) {
            var patient = consultationData.patient;
            var conditions = consultationData.condition && consultationData.condition.concept.uuid ? consultationData.conditions.concat(consultationData.condition) : consultationData.conditions;
            var diagnosis = consultationData.newlyAddedDiagnoses && consultationData.newlyAddedDiagnoses.filter(function (diagnosis) {
                return diagnosis.codedAnswer && diagnosis.codedAnswer.name;
            }) || [];
            var medications = consultationData.draftDrug;
            return {
                patient: patient,
                conditions: conditions,
                diagnosis: diagnosis,
                medications: medications
            };
        };

        var getAlertMedicationCodes = function (alert) {
            if (alert.referenceMedications) {
                var codeList = [];
                alert.referenceMedications.forEach(function (med) {
                    var extractedCodes = med.coding.map(function (coding) {
                        return coding.code;
                    });
                    codeList = codeList.concat(extractedCodes);
                });
                return codeList;
            }
            return [];
        };

        var getAlertConditionCodes = function (alert) {
            if (alert.referenceConditions) {
                var codeList = [];
                alert.referenceConditions.forEach(function (med) {
                    var extractedCodes = med.coding.filter(function (cond) {
                        return !localStorage.getItem("conceptSource") || cond.system.includes(localStorage.getItem("conceptSource"));
                    }).map(function (coding) {
                        return coding.code;
                    });
                    codeList = codeList.concat(extractedCodes);
                });
                return codeList;
            }
            return [];
        };

        var getMedicationCodesFromEntry = function (entry) {
            return entry.resource.medicationCodeableConcept.coding[0].code;
        };

        var getConditionCodesFromEntry = function (entry) {
            return entry.resource.code.coding[0].code;
        };

        var isMedicationRequest = function (entry) {
            return entry.resource.resourceType === 'MedicationRequest';
        };

        var isCondition = function (entry) {
            return entry.resource.resourceType === 'Condition';
        };

        var checkAlertBundleMatch = function (alert, bundle) {
            var alertMedicationCodes = getAlertMedicationCodes(alert);
            var alertConditionCodes = getAlertConditionCodes(alert);

            var bundleMedicationCodes = bundle.entry
              .filter(isMedicationRequest)
              .map(getMedicationCodesFromEntry);

            var bundleConditionCodes = bundle.entry
              .filter(isCondition)
              .map(getConditionCodesFromEntry);

            return (
              alertMedicationCodes.some(function (code) {
                  return bundleMedicationCodes.includes(code);
              }) ||
              alertConditionCodes.some(function (code) {
                  return bundleConditionCodes.includes(code);
              })
            );
        };

        var addNewAlerts = function (newAlerts, currentAlerts, bundle) {
            var activeAlerts = newAlerts.map(function (item) {
                var isAlertInBundle = checkAlertBundleMatch(item, bundle);
                if (isAlertInBundle) {
                    item.isActive = true;
                }
                item.detail = item.detail.indexOf('\n') > -1 ? marked.parse(item.detail) : item.detail;
                return item;
            });
            if (!currentAlerts || (currentAlerts && currentAlerts.length === 0)) {
                return activeAlerts;
            }
            var alerts = activeAlerts.map(function (alert) {
                var getAlert = currentAlerts.find(function (currentAlert) {
                    return currentAlert.uuid === alert.uuid;
                });
                if (getAlert) {
                    if (alert.indicator !== getAlert.indicator || (alert.alertType === "High Dosage" && alert.summary.match(/\d+/g).sort().join('') !== getAlert.summary.match(/\d+/g).sort().join(''))) {
                        alert.isActive = true;
                    } else if (!isSubset(getAlertConditionCodes(getAlert), getAlertConditionCodes(alert)) || !isSubset(getAlertMedicationCodes(getAlert), getAlertMedicationCodes(alert))) {
                        alert.isActive = true;
                    } else {
                        alert.isActive = getAlert.isActive;
                    }
                }
                return alert;
            });

            return alerts;
        };
        var isSubset = function (oldList, newList) {
            return newList.every(function (newItem) {
                return oldList.includes(newItem);
            });
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
            sortInteractionsByStatus: sortInteractionsByStatus,
            getAlerts: getAlerts
        };
    }]);
