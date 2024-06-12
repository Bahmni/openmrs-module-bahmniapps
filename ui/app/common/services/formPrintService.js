'use strict';

angular.module('bahmni.common.util')
    .factory('formPrintService', ['$http', '$q', 'printer', 'diagnosisService', 'observationsService', 'encounterService', 'visitService', 'allergyService',
        function ($http, $q, printer, diagnosisService, observationsService, encounterService, visitService, allergyService) {
            var printForm = function (printData, encounterUuid, location) {
                var templateUrl = printData.printConfig.templateUrl;
                if (templateUrl) {
                    var promises = [];
                    printData.diagnosesWithCodes = "";
                    printData.observationsEntries = [];
                    var visitSummary = null;
                    if (printData.printConfig.observationsConcepts !== undefined) {
                        var promise = $q.all([diagnosisService.getPatientDiagnosis(printData.patient.uuid),
                            observationsService.fetch(printData.patient.uuid, printData.printConfig.observationsConcepts, "latest", null, null, null, null, null)]).then(function (response) {
                                const diagnoses = response[0].data;
                                printData.observationsEntries = response[1].data;
                                angular.forEach(diagnoses, function (diagnosis) {
                                    if (diagnosis.order === printData.printConfig.printDiagnosis.order &&
                                        diagnosis.certainty === printData.printConfig.printDiagnosis.certainity) {
                                        if (printData.diagnosesWithCodes.length > 0) {
                                            printData.diagnosesWithCodes += ", ";
                                        }
                                        if (diagnosis.codedAnswer !== null && diagnosis.codedAnswer.mappings.length !== 0) {
                                            printData.diagnosesWithCodes += diagnosis.codedAnswer.mappings[0].code + " - " + diagnosis.codedAnswer.name;
                                        }
                                        else if (diagnosis.codedAnswer !== null && diagnosis.codedAnswer.mappings.length == 0) {
                                            printData.diagnosesWithCodes += diagnosis.codedAnswer.name;
                                        }
                                        else if (diagnosis.codedAnswer == null && diagnosis.freeTextAnswer !== null) {
                                            printData.diagnosesWithCodes += diagnosis.freeTextAnswer;
                                        }
                                    }
                                });
                            });
                        promises.push(promise);
                    }
                    if (encounterUuid) {
                        var encounterPromise = encounterService.findByEncounterUuid(encounterUuid).then(function (response) {
                            return response.data.visitUuid;
                        });
                        promises.push(encounterPromise);
                    }
                    printData.allergies = "";
                    var allergyPromise = allergyService.getAllergyForPatient(printData.patient.uuid).then(function (response) {
                        var allergies = response.data;
                        var allergiesList = [];
                        if (response.status === 200 && allergies.entry) {
                            allergies.entry.forEach(function (allergy) {
                                if (allergy.resource.code.coding) {
                                    allergiesList.push(allergy.resource.code.coding[0].display);
                                }
                            });
                        }
                        printData.allergies = allergiesList.join(", ");
                    });
                    promises.push(allergyPromise);

                    Promise.all(promises)
                    .then(function (response) {
                        if (response[1]) {
                            return visitService.getVisitSummary(response[1]);
                        }
                    })
                    .then(function (response) {
                        visitSummary = response ? response.data : undefined;
                    })
                    .then(function () {
                        printData.additionalInfo = {};
                        printData.additionalInfo.visitType = visitSummary ? visitSummary.visitType : null;
                        printData.additionalInfo.currentDate = new Date();
                        printData.additionalInfo.facilityLocation = location;
                        var tabName = printData.printConfig.header ? printData.printConfig.header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
                            return chr.toUpperCase();
                        }).replace(/^[a-z]/, function (match) {
                            return match.toUpperCase();
                        }) : "";
                        var pageTitle = printData.patient.givenName + printData.patient.familyName + "_" + printData.patient.identifier + "_" + tabName;
                        printer.print(templateUrl, printData, pageTitle);
                    }).catch(function (error) {
                        console.error("Error fetching details for print: ", error);
                    });
                } else {
                    printer.print("../clinical/common/views/formPrint.html", printData);
                }
            };

            return {
                printForm: printForm
            };
        }]);
