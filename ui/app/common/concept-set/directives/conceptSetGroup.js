angular.module('bahmni.common.conceptSet')
.controller('ConceptSetGroupController', ['$scope', 'appService', 'contextChangeHandler', 'spinner', 'conceptSetService', '$rootScope', 'sessionService', 'encounterService', 'treatmentConfig',
        function ($scope, appService, contextChangeHandler, spinner, conceptSetService, $rootScope, sessionService, encounterService, treatmentConfig) {

    $scope.validationHandler = new Bahmni.ConceptSet.ConceptSetGroupValidationHandler($scope.conceptSets);

    $scope.getNormalized = function(conceptName){
        return conceptName.replace(/['\.\s\(\)\/,\\]+/g,"_");
    };
    $scope.recompile = false;

    $scope.computeField = function(conceptSet){
        event.stopPropagation();

        var observationFilter = new Bahmni.Common.Domain.ObservationFilter();
        $rootScope.consultation.observations = observationFilter.filter($rootScope.consultation.observations);
        $rootScope.consultation.consultationNote = observationFilter.filter([$rootScope.consultation.consultationNote])[0];
        $rootScope.consultation.labOrderNote = observationFilter.filter([$rootScope.consultation.labOrderNote])[0];

        var encounterData =new Bahmni.Clinical.EncounterTransactionMapper().map($rootScope.consultation, $rootScope.patient, sessionService.getLoginLocationUuid());
        encounterData = encounterService.buildEncounter(encounterData);

        var conceptSetData = {name: conceptSet.conceptName, uuid: conceptSet.uuid};
        var data = {bahmniEncounterTransaction: encounterData, conceptSetData: conceptSetData};

        spinner.forPromise(conceptSetService.getComputedValue(data)).then(function (response) {
            $rootScope.consultation.observations = response.observations;
            $scope.recompile = $scope.recompile ? false : true;

            var drugOrderAppConfig = appService.getAppDescriptor().getConfigValue("drugOrder") || {};
            $rootScope.consultation.newlyAddedTreatments = [];
            response.drugOrders.forEach(function(drugOrder){
                $rootScope.consultation.newlyAddedTreatments.push(Bahmni.Clinical.DrugOrderViewModel.createFromContract(drugOrder, drugOrderAppConfig, treatmentConfig));
            });
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
            autoScrollEnabled:"="
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
                    '<concept-set ng-if="conceptSet.isLoaded && !recompile" ng-show="conceptSet.isOpen" concept-set-name="conceptSet.conceptName" required="conceptSet.options.required" observations="observations" show-title="false" validation-handler="validationHandler"></concept-set>' +
                    '<concept-set ng-if="conceptSet.isLoaded && recompile" ng-show="conceptSet.isOpen" concept-set-name="conceptSet.conceptName" required="conceptSet.options.required" observations="observations" show-title="false" validation-handler="validationHandler"></concept-set>' +
                '</div>'

    }
});