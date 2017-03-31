'use strict';

angular.module('bahmni.common.obs')
    .directive('editObservation', ['$q', 'spinner', '$state', '$rootScope', 'ngDialog', 'messagingService', 'encounterService', 'configurations', 'contextChangeHandler', function ($q, spinner, $state, $rootScope, ngDialog, messagingService, encounterService, configurations, contextChangeHandler) {
        var controller = function ($scope) {
            var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;
            var findEditableObs = function (observations) {
                return _.find(observations, function (obs) {
                    return obs.uuid === $scope.observation.uuid;
                });
            };

            var shouldEditSpecificObservation = function () {
                return $scope.observation.uuid ? true : false;
            };
            var contextChange = function () {
                return contextChangeHandler.execute();
            };

            var init = function () {
                var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept());

                return encounterService.findByEncounterUuid($scope.observation.encounterUuid).then(function (reponse) {
                    var encounterTransaction = reponse.data;
                    $scope.encounter = consultationMapper.map(encounterTransaction);
                    $scope.editableObservations = [];
                    if (shouldEditSpecificObservation()) {
                        var editableObs = findEditableObs(ObservationUtil.flattenObsToArray($scope.encounter.observations));
                        if (editableObs) {
                            $scope.editableObservations.push(editableObs);
                        } else {
                            messagingService.showMessage('error', "{{'CLINICAL_FORM_EDIT_ERROR_MESSAGE_KEY' | translate}}");
                        }
                    } else {
                        $scope.editableObservations = $scope.encounter.observations;
                    }
                    $scope.patient = {uuid: $scope.encounter.patientUuid};
                });
            };

            spinner.forPromise(init());

            var isFormValid = function () {
                var contxChange = contextChange();
                var shouldAllow = contxChange["allow"];
                if (!shouldAllow) {
                    var errorMessage = contxChange["errorMessage"] ? contxChange["errorMessage"] : "{{'CLINICAL_FORM_ERRORS_MESSAGE_KEY' | translate }}";
                    messagingService.showMessage('error', errorMessage);
                }
                return shouldAllow;
            };

            $scope.$parent.resetContextChangeHandler = function () {
                contextChangeHandler.reset();
            };

            $scope.save = function () {
                if (!isFormValid()) {
                    $scope.$parent.$parent.$broadcast("event:errorsOnForm");
                    return;
                }
                $scope.$parent.shouldPromptBeforeClose = false;
                $scope.$parent.shouldPromptBrowserReload = false;
                var updateEditedObservation = function (observations) {
                    return _.map(observations, function (obs) {
                        if (obs.uuid == $scope.editableObservations[0].uuid) {
                            return $scope.editableObservations[0];
                        } else {
                            obs.groupMembers = updateEditedObservation(obs.groupMembers);
                            return obs;
                        }
                    });
                };

                var getEditedObservation = function (observations) {
                    return _.find(observations, function (obs) {
                        return obs.uuid == $scope.editableObservations[0].uuid || getEditedObservation(obs.groupMembers);
                    });
                };

                if (shouldEditSpecificObservation()) {
                    var allObservations = updateEditedObservation($scope.encounter.observations);
                    $scope.encounter.observations = [getEditedObservation(allObservations)];
                }
                $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);
                $scope.encounter.orders = addOrdersToEncounter();
                $scope.encounter.extensions = {};
                var createPromise = encounterService.create($scope.encounter);
                spinner.forPromise(createPromise).then(function () {
                    $rootScope.hasVisitedConsultation = false;
                    $state.go($state.current, {}, {reload: true});
                    ngDialog.close();
                    messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                });
            };

            var addOrdersToEncounter = function () {
                var modifiedOrders = _.filter($scope.encounter.orders, function (order) {
                    return order.hasBeenModified || order.isDiscontinued || !order.uuid;
                });
                var tempOrders = modifiedOrders.map(function (order) {
                    if (order.hasBeenModified && !order.isDiscontinued) {
                        return Bahmni.Clinical.Order.revise(order);
                    } else if (order.isDiscontinued) {
                        return Bahmni.Clinical.Order.discontinue(order);
                    }
                    return { uuid: order.uuid, concept: {name: order.concept.name, uuid: order.concept.uuid },
                        commentToFulfiller: order.commentToFulfiller};
                });
                return tempOrders;
            };
        };

        return {
            restrict: 'E',
            scope: {
                observation: "=",
                conceptSetName: "@",
                conceptDisplayName: "@"
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/editObservation.html\'" />'
        };
    }]);
