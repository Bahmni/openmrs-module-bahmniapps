'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', '$rootScope', '$q', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitSummary', '$timeout', 'printer', 'visitConfig', 'visitHistory', '$stateParams', 'locationService', 'visitService', 'appService', 'diagnosisService', 'observationsService', 'allergyService',
        function ($scope, $state, $rootScope, $q, encounterService, clinicalAppConfigService, configurations, visitSummary, $timeout, printer, visitConfig, visitHistory, $stateParams, locationService, visitService, appService, diagnosisService, observationsService, allergyService) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });
            $scope.currentVisitUrl = $state.current.views['dashboard-content'].templateUrl ||
                $state.current.views['print-content'].templateUrl;
            var showProviderInfo = appService.getAppDescriptor().getConfigValue('showProviderInfoinVisits');
            $scope.showProviderInfo = showProviderInfo !== false ? true : showProviderInfo;
            $scope.visitHistory = visitHistory; // required as this visit needs to be overridden when viewing past visits
            $scope.visitSummary = visitSummary;
            $scope.visitTabConfig = visitConfig;
            $scope.showTrends = true;
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.visitUuid = $stateParams.visitUuid;
            var tab = $stateParams.tab;
            var encounterTypes = visitConfig.currentTab.encounterContext ? visitConfig.currentTab.encounterContext.filterEncounterTypes : null;
            visitService.getVisit($scope.visitUuid, 'custom:(uuid,visitType,startDatetime,stopDatetime,encounters:(uuid,encounterDatetime,provider:(display),encounterType:(display)))').then(function (response) {
                if (response.data && response.data.encounters) {
                    var encounters = response.data.encounters;
                    if (encounterTypes) {
                        encounters = encounters.filter(function (enc) {
                            return encounterTypes.includes(enc.encounterType.display);
                        });
                    }
                    encounters = encounters.sort(function (a, b) {
                        return a.encounterDatetime.localeCompare(b.encounterDatetime);
                    });
                    if (encounters && encounters.length > 0) {
                        $scope.providerNames = encounters[0].provider.display;
                    }
                }
            });

            $scope.isNumeric = function (value) {
                return $.isNumeric(value);
            };

            $scope.toggle = function (item) {
                item.show = !item.show;
            };
            $scope.isEmpty = function (notes) {
                if (notes) {
                    return notes.trim().length < 2;
                }
                return true;
            };
            $scope.testResultClass = function (line) {
                var style = {};
                if ($scope.pendingResults(line)) {
                    style["pending-result"] = true;
                }
                if (line.isSummary) {
                    style["header"] = true;
                }
                return style;
            };

            $scope.pendingResults = function (line) {
                return line.isSummary && !line.hasResults && line.name !== "";
            };

            $scope.displayDate = function (date) {
                return moment(date).format("DD-MMM-YYYY");
            };

            $scope.$on("event:printVisitTab", function () {
                var printConfig = $scope.visitTabConfig.currentTab.printing;
                var templateUrl = printConfig.templateUrl;
                if (templateUrl) {
                    var promises = [];
                    $scope.diagnosesCodes = "";
                    $scope.observationsEntries = [];

                    if (printConfig.observationsConcepts !== undefined) {
                        var promise = $q.all([diagnosisService.getPatientDiagnosis($stateParams.patientUuid), observationsService.fetch($stateParams.patientUuid, printConfig.observationsConcepts, "latest", null, null, null, null, null)]).then(function (response) {
                            const diagnoses = response[0].data;
                            $scope.observationsEntries = response[1].data;
                            angular.forEach(diagnoses, function (diagnosis) {
                                if (diagnosis.order === printConfig.printDiagnosis.order &&
                                    diagnosis.certainty === printConfig.printDiagnosis.certainity) {
                                    if ($scope.diagnosesCodes.length > 0) {
                                        $scope.diagnosesCodes += ", ";
                                    }
                                    if (diagnosis.codedAnswer !== null && diagnosis.codedAnswer.mappings.length !== 0) {
                                        $scope.diagnosesCodes += diagnosis.codedAnswer.mappings[0].code + " - " + diagnosis.codedAnswer.name;
                                    }
                                    else if (diagnosis.codedAnswer !== null && diagnosis.codedAnswer.mappings.length == 0) {
                                        $scope.diagnosesCodes += diagnosis.codedAnswer.name;
                                    }
                                    else if (diagnosis.codedAnswer == null && diagnosis.freeTextAnswer !== null) {
                                        $scope.diagnosesCodes += diagnosis.freeTextAnswer;
                                    }
                                }
                            });
                        });
                        promises.push(promise);
                    }
                    $scope.allergies = "";
                    var allergyPromise = allergyService.getAllergyForPatient($scope.patient.uuid).then(function (response) {
                        var allergies = response.data;
                        var allergiesList = [];
                        if (response.status === 200 && allergies.entry) {
                            allergies.entry.forEach(function (allergy) {
                                if (allergy.resource.code.coding) {
                                    allergiesList.push(allergy.resource.code.coding[0].display);
                                }
                            });
                        }
                        $scope.allergies = allergiesList.join(", ");
                    });
                    promises.push(allergyPromise);

                    Promise.all(promises).then(function () {
                        $scope.additionalInfo = {};
                        $scope.additionalInfo.visitSummary = $scope.visitSummary;
                        $scope.additionalInfo.currentDate = new Date();
                        $scope.additionalInfo.facilityLocation = $rootScope.facilityLocation;
                        var tabName = printConfig.header.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, function (match, chr) {
                            return chr.toUpperCase();
                        }).replace(/^[a-z]/, function (match) {
                            return match.toUpperCase();
                        });
                        $scope.pageTitle = $scope.patient.givenName + $scope.patient.familyName + "_" + $scope.patient.identifier + "_" + tabName;
                        printer.printFromScope(templateUrl, $scope);
                    }).catch(function (error) {
                        console.error("Error fetching details for print: ", error);
                    });
                } else {
                    printer.printFromScope("common/views/visitTabPrint.html", $scope);
                }
            });

            $scope.$on("event:clearVisitBoard", function () {
                $scope.clearBoard = true;
                $timeout(function () {
                    $scope.clearBoard = false;
                });
            });

            $scope.loadVisit = function (visitUuid) {
                $state.go('patient.dashboard.visit', {visitUuid: visitUuid});
            };

            var getCertificateHeader = function () {
                $scope.certificateHeader = {};
                return locationService.getAllByTag("Login Location").then(function (response) {
                    var locations = response.data.results;
                    if (locations !== null && locations.length > 0) {
                        $scope.certificateHeader.name = locations[0].name;
                        if (locations[0].attributes && locations[0].attributes.length > 0) {
                            var attributeDisplay = locations[0].attributes[0].display.split(": ");
                            if (attributeDisplay[0] === Bahmni.Clinical.Constants.certificateHeader) {
                                $scope.certificateHeader.address = attributeDisplay[1];
                            }
                        }
                    }
                });
            };

            var printOnPrint = function () {
                if ($stateParams.print) {
                    printer.printFromScope("common/views/visitTabPrint.html", $scope, function () {
                        window.close();
                    });
                }
            };

            var getTab = function () {
                if (tab) {
                    for (var tabIndex in $scope.visitTabConfig.tabs) {
                        if ($scope.visitTabConfig.tabs[tabIndex].title === tab) {
                            return $scope.visitTabConfig.tabs[tabIndex];
                        }
                    }
                }
                return $scope.visitTabConfig.getFirstTab();
            };

            var init = function () {
                $scope.visitTabConfig.setVisitUuidsAndPatientUuidToTheSections([$scope.visitUuid], $scope.patientUuid);
                var tabToOpen = getTab();
                $scope.visitTabConfig.switchTab(tabToOpen);
                printOnPrint();
                $scope.showProviderInfo ? getCertificateHeader() : null;
            };
            init();
        }]);
