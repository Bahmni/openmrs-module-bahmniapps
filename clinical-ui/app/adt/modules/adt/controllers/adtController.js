"use strict";

angular.module('opd.adt.controllers')
    .controller('AdtController', ['$scope', '$q', '$rootScope', 'spinner', 'dispositionService', 'encounterService', 'BedService', 'appService', 'adtService',
        function ($scope, $q, $rootScope, spinner, dispositionService, encounterService, bedService, appService, adtService) {
            var rankActions = {};
            var actionConfigs = {};
            var init = function () {
                var dispositionActionsPromise = dispositionService.getDispositionActions().then(function (response) {
                    if (response.data && response.data.results) {
                        if (response.data.results && response.data.results.length) {
                            $rootScope.disposition = $rootScope.disposition || {};
                            $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                            $scope.dispositionActions = response.data.results[0].answers;
                            setLatestActionAndNotes();
                        }
                    }
                });

                var adtNotesPromise = adtService.getAdtNoteConcept().then(function (response) {
                    if (response.data) {
                        $scope.adtNotesUuid = response.data.results[0].uuid;
                    }
                });

                return $q.all([dispositionActionsPromise, adtNotesPromise]);
            };

            spinner.forPromise(init());

            $scope.save = function () {
                actionConfigs[getSelectedDispositionCode()].action();
            };

            $scope.cancel = function(){
                window.location = Bahmni.Opd.ADT.Constants.activePatientsListUrl;
            };

            $scope.getActionCode = function (concept) {
                var mappingCode = "";
                if (concept.mappings) {
                    concept.mappings.forEach(function (mapping) {
                        var mappingSource = mapping.display.split(":")[0];
                        if (mappingSource === Bahmni.Opd.Consultation.Constants.emrapiConceptMappingSource) {
                            mappingCode = $.trim(mapping.display.split(":")[1]);
                        }
                    });
                }
                return mappingCode;
            };

            $scope.changeNote = function () {
                var selectedCode = getSelectedDispositionCode();
                var selectedEncounter = $scope.visit.encounters.filter(function (encounter) {
                    return encounter.encounterType.uuid && encounter.encounterType.uuid == actionConfigs[selectedCode].encounterUuid;
                })[0];

                if (selectedEncounter) {
                    setAdtNotes(selectedEncounter);
                } else {
                    $scope.adtNotes = null;
                }
            };

            var setLatestActionAndNotes = function () {
                var latestEncounter = null;
                if ($scope.visit) {
                    var max = 0;
                    $scope.visit.encounters.forEach(function (encounter) {
                        if (rankActions[encounter.encounterType.uuid] && rankActions[encounter.encounterType.uuid] > max) {
                            max = rankActions[encounter.encounterType.uuid];
                            latestEncounter = encounter;
                        }
                    });
                    if (latestEncounter) {
                        setAdtNotes(latestEncounter);
                        setAdtAction(latestEncounter);
                    }
                }
            };

            function setAdtNotes(latestEncounter) {
                $scope.adtNotes = latestEncounter.obs.filter(function (observation) {
                    return observation.concept.display === Bahmni.Opd.ADT.Constants.adtNotes;
                })[0];
            }

            function setAdtAction(encounter) {
                $scope.dispositionAction = $scope.dispositionActions.filter(function (dispositionAction) {
                    return actionConfigs[$scope.getActionCode(dispositionAction)].encounterUuid === encounter.encounterType.uuid;
                })[0];
            }

            var getSelectedDispositionCode = function () {
                if ($scope.dispositionAction) {
                    return $scope.getActionCode($scope.dispositionAction);
                }
                return null;
            };

            var getEncounterData = function (encounterUuid) {
                var encounterData = {};
                var adtNotes = constructAdtNoteObs($scope.adtNotes);
                encounterData.patientUuid = $scope.patient.uuid;
                encounterData.encounterTypeUuid = encounterUuid;
                if(adtNotes) {
                    encounterData.observations = adtNotes;
                }
                return encounterData;
            };


            var constructAdtNoteObs = function (notesObs) {
                if (notesObs) {
                    if(notesObs.concept){
                        return [notesObs];
                    }
                    var additionalObs = [
                        {
                            concept: {
                                uuid: $scope.adtNotesUuid
                            },
                            value: notesObs.value
                        }
                    ];
                    return additionalObs;
                }
                return null;
            };

            var forwardUrl = function (response, option) {
                var appDescriptor = appService.getAppDescriptor();
                var forwardLink = appDescriptor.getConfig(option);
                forwardLink = forwardLink && forwardLink.value;

                var options = {'patientUuid': $scope.patient.uuid, 'encounterUuid': response.encounterUuid};
                if (forwardLink) {
                    window.location = appDescriptor.formatUrl(forwardLink, options);
                }
            };

            var admit = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getAdmissionEncounterUuid());
                encounterService.create(encounterData).success(function (response) {
                    forwardUrl(response, "onAdmissionForwardTo");
                });
            };

            var transfer = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getTransferEncounterUuid());
                encounterService.create(encounterData).then(function (response) {
                    forwardUrl(response.data, "onAdmissionForwardTo");
                });
            };

            var discharge = function () {
                var encounterData = getEncounterData($scope.encounterConfig.getDischargeEncounterUuid());
                encounterService.create(encounterData).then(function (response) {
                    bedService.getBedDetailsForPatient($scope.patient.uuid).then(function (response) {
                        bedService.freeBed(response.data.results[0].bedId).success(function () {
                            forwardUrl(response, "onDischargeForwardTo")
                        })
                    })
                });
            };

            if ($scope.encounterConfig) {
                rankActions[$rootScope.encounterConfig.getAdmissionEncounterUuid()] = 1;
                rankActions[$rootScope.encounterConfig.getTransferEncounterUuid()] = 2;
                rankActions[$rootScope.encounterConfig.getDischargeEncounterUuid()] = 3;
            }

            if ($scope.encounterConfig) {
                actionConfigs[Bahmni.Opd.ADT.Constants.admissionCode] = {encounterUuid: $scope.encounterConfig.getAdmissionEncounterUuid(), action: admit};
                actionConfigs[Bahmni.Opd.ADT.Constants.dischargeCode] = {encounterUuid: $scope.encounterConfig.getDischargeEncounterUuid(), action: discharge};
                actionConfigs[Bahmni.Opd.ADT.Constants.transferCode] = {encounterUuid: $scope.encounterConfig.getTransferEncounterUuid(), action: transfer};
            }
        }]);
