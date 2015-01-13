angular.module('bahmni.common.conceptSet')
.controller('ConceptSetGroupController', ['$scope', 'appService', 'contextChangeHandler', 'spinner',
        'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig', 'messagingService', 'retrospectiveEntryService',
        function ($scope, appService, contextChangeHandler, spinner, conceptSetService, $rootScope, sessionService,
                  encounterService, treatmentConfig, messagingService, retrospectiveEntryService) {

    $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupValidationHandler($scope.conceptSets);

    $scope.getNormalized = function(conceptName){
        return conceptName.replace(/['\.\s\(\)\/,\\]+/g,"_");
    };

    $scope.computeField = function(conceptSet){
        event.stopPropagation();
        $scope.consultation.saveHandler.fire();
        var encounterData =new Bahmni.Clinical.EncounterTransactionMapper().map(angular.copy($scope.consultation), $scope.patient, sessionService.getLoginLocationUuid(),
            retrospectiveEntryService.getRetrospectiveEntry());
        encounterData = encounterService.buildEncounter(encounterData);
        encounterData.drugOrders = [];

        var conceptSetData = {name: conceptSet.conceptName, uuid: conceptSet.uuid};
        var data = {bahmniEncounterTransaction: encounterData, conceptSetData: conceptSetData};

        spinner.forPromise(conceptSetService.getComputedValue(data)).then(function (response) {
            response = response.data;
            copyValues($scope.consultation.observations, response.observations);
            var drugOrderAppConfig = appService.getAppDescriptor().getConfigValue("drugOrder") || {};
            $scope.consultation.newlyAddedTreatments = $scope.consultation.newlyAddedTreatments || [];
            response.drugOrders.forEach(function(drugOrder){
                $scope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, treatmentConfig));
            });
        });
    };
    var copyValues = function(existingObservations, modifiedObservations) {
        existingObservations.forEach(function(observation, index) {
            var correspondingModifiedObservation = _.find(modifiedObservations, function(modifiedObservation) {
                return modifiedObservation.concept.uuid === observation.concept.uuid;

            });
            if(observation.groupMembers && observation.groupMembers.length > 0) {
                copyValues(observation.groupMembers, correspondingModifiedObservation.groupMembers);
            } else {
                observation.value = modifiedObservations[index].value;
            }
        });
    };

    contextChangeHandler.add($scope.validationHandler.validate);
}])
.directive('conceptSetGroup', function () {
    return {
        restrict: 'EA',
        scope: {
            conceptSetGroupExtensionId: "=",
            observations: "=",
            allTemplates: "=",
            context: "=",
            autoScrollEnabled:"=",
            patient: "=",
            consultation: "="
            
        },
        controller: 'ConceptSetGroupController',
        template:
                '<div id="{{getNormalized(conceptSet.conceptName)}}"  ng-repeat="conceptSet in allTemplates track by $index" ng-if="conceptSet.isAvailable(context) && conceptSet.isAdded" class="concept-set-group section-grid"  auto-scroll="{{getNormalized(conceptSet.conceptName)}}" auto-scroll-enabled="autoScrollEnabled" >' +
                    '<div ng-click="conceptSet.toggleDisplay()" class="concept-set-title" >' +
                        '<h2 class="section-title">' +
                            '<i class="icon-caret-right" ng-hide="conceptSet.isOpen"></i>' +
                            '<i class="icon-caret-down" ng-show="conceptSet.isOpen"></i>' +
                            '<strong>{{conceptSet.label}}</strong>' +
                            '<button type="button" ng-if="conceptSet.showComputeButton()" ng-click="computeField(conceptSet)" class="fr btn-small">Compute</button>' +
                        '</h2>' +
                    '</div>' +
                    '<concept-set ng-if="conceptSet.isLoaded" patient="patient" ng-show="conceptSet.isOpen" concept-set-name="conceptSet.conceptName" required="conceptSet.options.required" observations="observations" show-title="false" validation-handler="validationHandler"></concept-set>' +
                '</div>'

    }
});