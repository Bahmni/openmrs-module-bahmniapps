angular.module('bahmni.common.obs')
    .directive('editObservation', ['$q', 'spinner', '$state','$rootScope', 'ngDialog', 'messagingService', 'encounterService', 'configurations', function ($q, spinner, $state, $rootScope, ngDialog, messagingService, encounterService,configurations) {
        var controller = function ($scope) {

            var ObservationUtil = Bahmni.Common.Obs.ObservationUtil;
            var findEditableObs = function (observations) {
                return _.find(observations, function(obs){
                    return obs.uuid === $scope.observation.uuid;
                })
            };

            var shouldEditSpecificObservation = function(){
                return $scope.observation.uuid ? true : false;
            };

            var init = function() {
                var consultationMapper = new Bahmni.ConsultationMapper(configurations.dosageFrequencyConfig(), configurations.dosageInstructionConfig(),
                    configurations.consultationNoteConcept(), configurations.labOrderNotesConcept(),configurations.stoppedOrderReasonConfig());

                return encounterService.findByEncounterUuid($scope.observation.encounterUuid).then(function(reponse) {
                    var encounterTransaction = reponse.data;
                    $scope.encounter = consultationMapper.map(encounterTransaction);
                    $scope.editableObservations = shouldEditSpecificObservation() ? [findEditableObs(ObservationUtil.flattenObsToArray($scope.encounter.observations))]: $scope.encounter.observations;
                    $scope.patient = {uuid: $scope.encounter.patientUuid};
                });
            };

            spinner.forPromise(init());

            $scope.save = function(){
              $scope.$parent.shouldPromptBeforeClose = false;
                $scope.$parent.shouldPromptBrowserReload = false;
                var updateEditedObservation =   function(observations) {
                    return _.map(observations, function (obs) {
                        if (obs.uuid == $scope.editableObservations[0].uuid) {
                            return $scope.editableObservations[0];
                        }else{
                            obs.groupMembers = updateEditedObservation(obs.groupMembers);
                            return obs;
                        }
                    })
                };

                if (shouldEditSpecificObservation()) {
                    $scope.encounter.observations = updateEditedObservation($scope.encounter.observations);
                }
                $scope.encounter.observations = new Bahmni.Common.Domain.ObservationFilter().filter($scope.encounter.observations);
                $scope.encounter.orders = addOrdersToEncounter();
                $scope.encounter.extensions={};
                var createPromise = encounterService.create($scope.encounter);
                spinner.forPromise(createPromise).then(function() {
                    $rootScope.hasVisitedConsultation = false;
                    $state.go($state.current, {}, {reload: true});
                    ngDialog.close();
                    messagingService.showMessage('info', "{{'CLINICAL_SAVE_SUCCESS_MESSAGE_KEY' | translate}}");
                });
            };

            var addOrdersToEncounter = function () {
                var modifiedOrders = _.filter($scope.encounter.orders, function(order){
                    return order.hasBeenModified || order.isDiscontinued || !order.uuid
                });
                var tempOrders = modifiedOrders.map(function (order) {
                    if(order.hasBeenModified && !order.isDiscontinued){
                        return Bahmni.Clinical.Order.revise(order);
                    }
                    else if(order.isDiscontinued){
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
                conceptDisplayName:"@"
            },
            controller: controller,
            template: '<ng-include src="\'../common/obs/views/editObservation.html\'" />'
        };
    }]);
