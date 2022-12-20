'use strict';

angular.module('bahmni.clinical')
    .controller('VisitController', ['$scope', '$state', 'encounterService', 'clinicalAppConfigService', 'configurations', 'visitSummary', '$timeout', 'printer', 'visitConfig', 'visitHistory', '$stateParams',
        'observationsService', 'spinner', 'appService', 'conceptSetUiConfigService', 'labOrderResultService', 'orderService', 'orderTypeService', 'treatmentService', 'treatmentConfig', '$q', 'visitService',
        function ($scope, $state, encounterService, clinicalAppConfigService, configurations, visitSummary, $timeout, printer, visitConfig, visitHistory, $stateParams,
                observationsService, spinner, appService, conceptSetUiConfigService, labOrderResultService, orderService, orderTypeService, treatmentService, treatmentConfig, $q, visitService) {
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
                if ($scope.visitTabConfig.currentTab.translationKey === 'DASHBOARD_TAB_GENERAL_KEY' && $scope.visitTabConfig.currentTab.customPrint) {
                    initCustomPrint();
                    printer.printFromScope("common/views/visitTabPrint_visitGeneralPrint.html", $scope);
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

            var printOnPrint = function () {
                if ($stateParams.print) {
                    if ($scope.visitTabConfig.currentTab.translationKey === 'DASHBOARD_TAB_GENERAL_KEY' && $scope.visitTabConfig.currentTab.customPrint) {
                        initCustomPrint();
                        printer.printFromScope("common/views/visitTabPrint_visitGeneralPrint.html", $scope, function () {
                            window.close();
                        });
                    } else {
                        printer.printFromScope("common/views/visitTabPrint.html", $scope, function () {
                            window.close();
                        });
                    }
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

            var fetchAllObservations = function () {
                var observationConfig = _.filter($scope.visitTabConfig.currentTab.printSections, function (cfg) {
                    return cfg.configType === "observation";
                });
                var config = observationConfig[0].config;
                config.numberOfVisits = config.numberOfVisits || 1;

                $scope.initializeObs = observationsService.fetch($scope.patientUuid, null,
                    config.scope, config.numberOfVisits, $scope.visitUuid, null, null).then(function (response) {
                        var conceptsConfig = clinicalAppConfigService.getAllConceptsConfig();
                        var observations = new Bahmni.Common.Obs.ObservationMapper().map(response.data, conceptsConfig);
                        $scope.patientVisitObservations = observations;
                    });
            };

            var fetchInvestigations = function () {
                var investigationsConfig = _.find($scope.visitTabConfig.currentTab.printSections, function (cfg) {
                    return cfg.configType === "investigationResult";
                });
                var param = investigationsConfig.config;

                var defaultParams = {
                    showTable: false,
                    showChart: true,
                    numberOfVisits: 1
                };
                param = angular.extend(defaultParams, param);

                var params = {
                    patientUuid: $scope.patient.uuid,
                    numberOfVisits: param.numberOfVisits,
                    visitUuids: [$scope.visitUuid],
                    initialAccessionCount: param.initialAccessionCount,
                    latestAccessionCount: param.latestAccessionCount
                };

                $scope.initializeLabOrders = labOrderResultService.getAllForPatient(params)
                .then(function (results) {
                    $scope.investigations = results.labAccessions[0];
                }).then(function () {
                    if ($scope.investigations && $scope.investigations.length > 0) {
                        var testOrderLabels = '';
                        for (var i = 0; i < $scope.investigations.length; i++) {
                            var test = $scope.investigations[i];
                            testOrderLabels += test.notes != null ? test.testName + " (" + test.notes + "); " : test.testName + "; ";
                        }
                        testOrderLabels = testOrderLabels.substr(0, testOrderLabels.lastIndexOf(";"));
                        $scope.testOrderLabels = testOrderLabels;
                    }
                });
            };

            var fetchOrders = function () {
                var pacsConfig = _.find($scope.visitTabConfig.currentTab.printSections, function (cfg) {
                    return cfg.configType === "pacsOrders";
                });
                var config = pacsConfig.config;
                var orderTypeUuid = orderTypeService.getOrderTypeUuid("Radiology Order");
                var includeAllObs = true;
                var params = {
                    patientUuid: $scope.patient.uuid,
                    orderTypeUuid: orderTypeUuid,
                    conceptNames: config.conceptNames,
                    includeObs: includeAllObs,
                    numberOfVisits: config.numberOfVisits || 1,
                    obsIgnoreList: config.obsIgnoreList,
                    visitUuid: $scope.visitUuid,
                    orderUuid: $scope.orderUuid
                };

                $scope.initializeRadiologyOrders = orderService.getOrders(params).then(function (response) {
                    var bahmniOrders = response.data;
                    var radiologyOrderNames = '';
                    _.each(bahmniOrders, function (order) {
                        radiologyOrderNames += order.commentToFulfiller != null ? getPacOrderLabel(order) + " (" + order.commentToFulfiller + "); "
                            : getPacOrderLabel(order) + "; ";
                    });
                    $scope.radiologyOrderNames = radiologyOrderNames.substr(0, radiologyOrderNames.lastIndexOf(";"));
                });
            };

            var fetchMedicines = function () {
                var medicinesConfig = _.find($scope.visitTabConfig.currentTab.printSections, function (cfg) {
                    return cfg.configType === "treatment";
                });
                var config = medicinesConfig.config;
                var Constants = Bahmni.Clinical.Constants;
                $scope.params = config;
                var programConfig = appService.getAppDescriptor().getConfigValue("program") || {};
                var startDate = null, endDate = null, getEffectiveOrdersOnly = false;
                if (programConfig.showDetailsWithinDateRange) {
                    startDate = $stateParams.dateEnrolled;
                    endDate = $stateParams.dateCompleted;
                    if (startDate || endDate) {
                        $scope.params.showOtherActive = false;
                    }
                    getEffectiveOrdersOnly = true;
                }
                $scope.initializePrescriptions = $q.all([treatmentConfig(), treatmentService.getPrescribedAndActiveDrugOrders($scope.params.patientUuid, $scope.params.numberOfVisits,
                $scope.params.showOtherActive, $scope.params.visitUuids || [], startDate, endDate, getEffectiveOrdersOnly)])
                .then(function (results) {
                    var config = results[0];
                    var drugOrderResponse = results[1].data;
                    var createDrugOrderViewModel = function (drugOrder) {
                        return Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, config);
                    };
                    for (var key in drugOrderResponse) {
                        drugOrderResponse[key] = drugOrderResponse[key].map(createDrugOrderViewModel);
                    }
                    var groupedByVisit = _.groupBy(drugOrderResponse.visitDrugOrders, function (drugOrder) {
                        return drugOrder.visit.startDateTime;
                    });
                    var treatmentSections = [];
                    for (var key in groupedByVisit) {
                        var values = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments(groupedByVisit[key]);
                        treatmentSections.push({visitDate: key, drugOrders: values});
                    }
                    if (!_.isEmpty(drugOrderResponse[Constants.otherActiveDrugOrders])) {
                        var mergedOtherActiveDrugOrders = Bahmni.Clinical.DrugOrder.Util.mergeContinuousTreatments(drugOrderResponse[Constants.otherActiveDrugOrders]);
                        treatmentSections.push({
                            visitDate: Constants.otherActiveDrugOrders,
                            drugOrders: mergedOtherActiveDrugOrders
                        });
                    }
                    $scope.treatmentSections = treatmentSections;
                });
            };

            var getMatchingConceptObservations = function (conceptName, obs) {
                conceptName = _.toLower(conceptName);
                var allObs = _.filter(obs, function (observation, index) {
                    return observation.concept && (_.toLower(observation.concept.name) === conceptName ||
                            _.toLower(observation.concept.shortName) === conceptName);
                });
                return allObs;
            };

            var removeMatchingConceptObservations = function (obs, cname) {
                cname = _.toLower(cname);
                var obsTemp = [];
                obsTemp = obsTemp.concat(obs);
                var found = false;
                do {
                    found = false;
                    for (var i = 0; i < obs.length; i++) {
                        if (obs[i].concept && (_.toLower(obs[i].concept.name) === cname ||
                            _.toLower(obs[i].concept.shortName) === cname)) {
                            obsTemp.splice(i, 1);
                            found = true;
                        }
                    }
                    if (found) {
                        obs = obsTemp;
                    }
                } while (found);
                return obsTemp;
            };

            var getMatchingConceptObservationsProcessed = function (conceptName, obs) {
                conceptName = _.toLower(conceptName);
                var allObs = _.filter(obs, function (observation, index) {
                    return observation.concept && (_.toLower(observation.concept.name) === conceptName ||
                            _.toLower(observation.concept.shortName) === conceptName);
                });
                if (allObs && allObs.length > 0) {
                    _.each(allObs, function (obs) {
                        if (obs.groupMembers.length > 0) {
                            _.each(obs.groupMembers, function (obsTemp) {
                                processObs(obsTemp);
                            });
                        } else {
                            if (obs.concept.dataType !== 'Text') {
                                obs.valueAsString = obs.valueAsString.replace(/true,/gi, '');
                                obs.valueAsString = obs.valueAsString.replace(/false,/gi, '');
                                obs.valueAsString = obs.valueAsString.replace(/true/gi, '');
                                obs.valueAsString = obs.valueAsString.replace(/false/gi, '');
                                if (obs.valueAsString.indexOf('\n') > -1) {
                                    obs.valueAsString = '<pre>' + obs.valueAsString + '</pre>';
                                    obs.valueAsString = obs.valueAsString.replace(/\n/g, '<br>');
                                }
                                if (obs.comment != null && obs.comment.indexOf('\n') > -1) {
                                    obs.comment = '<pre>' + obs.comment + '</pre>';
                                    obs.comment = obs.comment.replace(/\n/g, '<br>');
                                }
                            } else {
                                if (obs.valueAsString.indexOf('\n') > -1) {
                                    obs.valueAsString = '<pre>' + obs.valueAsString + '</pre>';
                                    obs.valueAsString = obs.valueAsString.replace(/\n/g, '<br>');
                                }
                                if (obs.comment != null && obs.comment.indexOf('\n') > -1) {
                                    obs.comment = '<pre>' + obs.comment + '</pre>';
                                    obs.comment = obs.comment.replace(/\n/g, '<br>');
                                }
                            }
                        }
                    });
                }
                return allObs;
            };

            var processObs = function (obs) {
                if (obs.groupMembers.length > 0) {
                    _.each(obs.groupMembers, function (member) {
                        if (member.groupMembers.length > 0) {
                            processObs(member);
                            if (member.concept.dataType !== 'Text') {
                                member.valueAsString = member.valueAsString.replace(/true,/gi, '');
                                member.valueAsString = member.valueAsString.replace(/false,/gi, '');
                                member.valueAsString = member.valueAsString.replace(/true/gi, '');
                                member.valueAsString = member.valueAsString.replace(/false/gi, '');
                                if (member.valueAsString.indexOf('\n') > -1) {
                                    member.valueAsString = '<pre>' + member.valueAsString + '</pre>';
                                    member.valueAsString = member.valueAsString.replace(/\n/g, '<br>');
                                }
                                if (member.comment != null && member.comment.indexOf('\n') > -1) {
                                    member.comment = '<pre>' + member.comment + '</pre>';
                                    member.comment = member.comment.replace(/\n/g, '<br>');
                                }
                            }
                        } else {
                            if (member.concept.dataType !== 'Text') {
                                member.valueAsString = member.valueAsString.replace(/true,/gi, '');
                                member.valueAsString = member.valueAsString.replace(/false,/gi, '');
                                member.valueAsString = member.valueAsString.replace(/true/gi, '');
                                member.valueAsString = member.valueAsString.replace(/false/gi, '');
                                if (member.valueAsString.indexOf('\n') > -1) {
                                    member.valueAsString = '<pre>' + member.valueAsString + '</pre>';
                                    member.valueAsString = member.valueAsString.replace(/\n/g, '<br>');
                                }
                                if (member.comment != null && member.comment.indexOf('\n') > -1) {
                                    member.comment = '<pre>' + member.comment + '</pre>';
                                    member.comment = member.comment.replace(/\n/g, '<br>');
                                }
                            } else {
                                if (member.valueAsString.indexOf('\n') > -1) {
                                    member.valueAsString = '<pre>' + member.valueAsString + '</pre>';
                                    member.valueAsString = member.valueAsString.replace(/\n/g, '<br>');
                                }
                                if (member.comment != null && member.comment.indexOf('\n') > -1) {
                                    member.comment = '<pre>' + member.comment + '</pre>';
                                    member.comment = member.comment.replace(/\n/g, '<br>');
                                }
                            }
                        }
                    });
                    if (obs.concept.dataType !== 'Text') {
                        obs.valueAsString = obs.valueAsString.replace(/true,/gi, '');
                        obs.valueAsString = obs.valueAsString.replace(/false,/gi, '');
                        obs.valueAsString = obs.valueAsString.replace(/true/gi, '');
                        obs.valueAsString = obs.valueAsString.replace(/false/gi, '');
                    }
                } else {
                    if (obs.concept.dataType !== 'Text') {
                        obs.valueAsString = obs.valueAsString.replace(/true,/gi, '');
                        obs.valueAsString = obs.valueAsString.replace(/false,/gi, '');
                        obs.valueAsString = obs.valueAsString.replace(/true/gi, '');
                        obs.valueAsString = obs.valueAsString.replace(/false/gi, '');
                        if (obs.valueAsString.indexOf('\n') > -1) {
                            obs.valueAsString = '<pre>' + obs.valueAsString + '</pre>';
                            obs.valueAsString = obs.valueAsString.replace(/\n/g, '<br>');
                        }
                        if (obs.comment != null && obs.comment.indexOf('\n') > -1) {
                            obs.comment = '<pre>' + obs.comment + '</pre>';
                            obs.comment = obs.comment.replace(/\n/g, '<br>');
                        }
                    } else {
                        if (obs.valueAsString.indexOf('\n') > -1) {
                            obs.valueAsString = '<pre>' + obs.valueAsString + '</pre>';
                            obs.valueAsString = obs.valueAsString.replace(/\n/g, '<br>');
                        }
                        if (obs.comment != null && obs.comment.indexOf('\n') > -1) {
                            obs.comment = '<pre>' + obs.comment + '</pre>';
                            obs.comment = obs.comment.replace(/\n/g, '<br>');
                        }
                    }
                }
            };

            var getToDate = function () {
                return $scope.visitSummary.stopDateTime || Bahmni.Common.Util.DateUtil.now();
            };

            var fetchConsultantInformation = function () {
                _.filter($scope.visitTabConfig.currentTab.printSections, function (cfg, index) {
                    if (cfg.configType === "patientInformation") {
                        getSelectedVisitDetails(cfg.config.visitAttributes);
                        var conceptsToFetchForPatientInformation = cfg.config.obsConcepts;
                        if ($scope.patientVisitObservations && conceptsToFetchForPatientInformation && conceptsToFetchForPatientInformation.length === 2) {
                            var observation = getMatchingConceptObservations(conceptsToFetchForPatientInformation[0], $scope.patientVisitObservations);
                            if (observation && observation.length > 0) {
                                if (observation[0].groupMembers.length > 0) {
                                    var obs = getMatchingConceptObservations(conceptsToFetchForPatientInformation[1], observation[0].groupMembers);
                                    if (obs && obs.length > 0) {
                                        $scope.visitConsultant = obs[0].valueAsString;
                                        return;
                                    }
                                }
                            }
                        }
                    }
                });
            };

            var buildUpObsConceptsData = function () {
                _.each($scope.visitTabConfig.currentTab.printSections, function (cfg, index) {
                    if (cfg.configType === "observation" || cfg.configType === "followup") {
                        var conceptsToFetch = cfg.config.obsConcepts;
                        var obs = [];
                        var allObsExtraToPrint = [];
                        if (cfg.sectionToAppendObs && $scope.visitTabConfig.currentTab.conceptsExcluded && $scope.visitTabConfig.currentTab.conceptsExcluded.length > 0) {
                            allObsExtraToPrint = allObsExtraToPrint.concat($scope.patientVisitObservations);
                            _.each($scope.visitTabConfig.currentTab.conceptsExcluded, function (cname) {
                                allObsExtraToPrint = removeMatchingConceptObservations(allObsExtraToPrint, cname);
                            });
                        }
                        if ($scope.patientVisitObservations && conceptsToFetch && conceptsToFetch.length > 0) {
                            _.each(conceptsToFetch, function (cname) {
                                var observation = getMatchingConceptObservationsProcessed(cname, $scope.patientVisitObservations);
                                if (observation && observation.length > 0) {
                                    if (cfg.config.persistOrderOfVisits) {
                                        observation = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().persistOrderOfConceptNames(observation);
                                    } else {
                                        observation = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(observation, true);
                                    }
                                    if (observation && observation.length > 0 && observation[0].value) {
                                        var obsGrpMembers = [];
                                        var objectTemp = {};
                                        _.each(observation[0].value, function (obsTemp) {
                                            if (obsTemp.groupMembers.length > 0) {
                                                obsGrpMembers = obsGrpMembers.concat(obsTemp.groupMembers);
                                            }
                                            else { // for concepts like Consultation Note
                                                obsGrpMembers.push(obsTemp);
                                            }
                                        });
                                        if (obsGrpMembers && obsGrpMembers.length > 0) {
                                            if (obsGrpMembers.length === 1) {
                                                obs.push(obsGrpMembers[0]);
                                            } else {
                                                obs.concat(obsGrpMembers);
                                            }
                                        }
                                    }
                                }
                            });
                            if (cfg.sectionToAppendObs && allObsExtraToPrint && allObsExtraToPrint.length > 0) {
                                var prevObsName = [];
                                _.each(allObsExtraToPrint, function (arrExtra) {
                                    if (prevObsName.indexOf(arrExtra.concept.name) === -1) {
                                        prevObsName.push(arrExtra.concept.name);
                                        var obsExtra = getMatchingConceptObservationsProcessed(arrExtra.concept.name, allObsExtraToPrint);
                                        if (obsExtra && obsExtra.length > 0) {
                                            if (cfg.config.persistOrderOfVisits) {
                                                obsExtra = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().persistOrderOfConceptNames(obsExtra);
                                            } else {
                                                obsExtra = new Bahmni.Common.DisplayControl.Observation.GroupingFunctions().groupByEncounterDate(obsExtra, true);
                                            }
                                        }
                                        if (obsExtra && obsExtra.length > 0 && obsExtra[0].value) {
                                            var obsGrpMembers = [];
                                            _.each(obsExtra[0].value, function (obsT) {
                                                if (obsT.groupMembers.length > 0) {
                                                    obsGrpMembers = obsGrpMembers.concat(obsT.groupMembers);
                                                } else { // for concepts like Consultation Note
                                                    obsGrpMembers.push(obsT);
                                                }
                                            });
                                            if (obsGrpMembers && obsGrpMembers.length > 0) {
                                                if (obsGrpMembers.length === 1) {
                                                    obs.push(obsGrpMembers[0]);
                                                } else {
                                                    obs.concat(obsGrpMembers);
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                            // if (obs && obs.length > 0) {
                            var obj = {};
                            obj.templateUrlName = cfg.config.templateUrlName || "";
                            obj.templateUrlName = 'common/views/' + obj.templateUrlName + '.html';
                            obj.obsData = obs;
                            obj.title = cfg.config.title;
                            $scope.patientVisitObsData.push(obj);
                            // }
                        }
                    }
                });
            };

            var getSelectedVisitDetails = function (visitAttributes) {
                var rep = "custom:(attributes:(value,attributeType:(display,name,description)))";
                $scope.initializeVisitAttributes = visitService.getVisit($scope.visitUuid, rep).then(function (response) {
                    if (response && response.data && response.data.attributes) {
                        var visitAttrTypes = [];
                        if (visitAttributes.length > 0) {
                            visitAttrTypes = _.filter(response.data.attributes, function (attr) {
                                return _.some(visitAttributes, function (name) {
                                    return (_.toLower(name) === _.toLower(attr.attributeType.name));
                                });
                            });
                        }
                        $scope.visitAttrTypes = visitAttrTypes;
                    }
                });
            };

            var getPacOrderLabel = function (bahmniOrder) {
                return bahmniOrder.concept.shortName || bahmniOrder.concept.name;
            };

            var init = function () {
                $scope.visitTabConfig.setVisitUuidsAndPatientUuidToTheSections([$scope.visitUuid], $scope.patientUuid);
                $scope.visitTabConfig.setVisitUuidsAndPatientUuidToThePrintSections([$scope.visitUuid], $scope.patientUuid);
                var tabToOpen = getTab();
                $scope.visitTabConfig.switchTab(tabToOpen);
                // printOnPrint();
                $scope.patientVisitObsData = [];
                fetchAllObservations();
                $scope.initializeObs && spinner.forPromise($scope.initializeObs);
            };

            var initCustomPrint = function () {
                $scope.patientVisitObsData = [];
                $scope.visitDate = $scope.visitSummary.startDateTime;
                if ($scope.visitTabConfig.currentTab.printInvestigations) {
                    fetchInvestigations();
                }
                if ($scope.visitTabConfig.currentTab.printOrders) {
                    fetchOrders();
                }
                if ($scope.visitTabConfig.currentTab.printMedicines) {
                    fetchMedicines();
                }
                if ($scope.visitTabConfig.currentTab.conceptsExcluded && $scope.visitTabConfig.currentTab.conceptsExcluded.length > 0) {
                    _.each($scope.visitTabConfig.currentTab.printSections, function (cfg, index) {
                        if (cfg.configType === "observation" || cfg.configType === "followup") {
                            $scope.visitTabConfig.currentTab.conceptsExcluded = $scope.visitTabConfig.currentTab.conceptsExcluded.concat(cfg.config.obsConcepts);
                        }
                    });
                }
                buildUpObsConceptsData();
                fetchConsultantInformation();
                $scope.initializeLabOrders && spinner.forPromise($scope.initializeLabOrders);
                $scope.initializeRadiologyOrders && spinner.forPromise($scope.initializeRadiologyOrders);
                $scope.initializePrescriptions && spinner.forPromise($scope.initializePrescriptions);
                $scope.initializeVisitAttributes && spinner.forPromise($scope.initializeVisitAttributes);
            };

            init();
        }
    ]);
