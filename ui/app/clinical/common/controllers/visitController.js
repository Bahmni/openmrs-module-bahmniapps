'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitSummary', '$timeout', 'printer', 'visitConfig', 'visitHistory', '$stateParams', 'locationService', 'visitService',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitSummary, $timeout, printer, visitConfig, visitHistory, $stateParams, locationService, visitService) {
            var encounterTypeUuid = configurations.encounterConfig().getPatientDocumentEncounterTypeUuid();
            $scope.documentsPromise = encounterService.getEncountersForEncounterType($scope.patient.uuid, encounterTypeUuid).then(function (response) {
                return new Bahmni.Clinical.PatientFileObservationsMapper().map(response.data.results);
            });
            $scope.currentVisitUrl = $state.current.views['dashboard-content'].templateUrl ||
                $state.current.views['print-content'].templateUrl;
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
                return moment(date).format("DD-MMM-YY");
            };

            $scope.$on("event:printVisitTab", function () {
                printer.printFromScope("common/views/visitTabPrint.html", $scope);
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
                getCertificateHeader();
            };
            init();
        }]);
