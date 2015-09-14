'use strict';

angular.module('bahmni.clinical')
    .controller('DispositionController', ['$scope', '$q', 'dispositionService','retrospectiveEntryService', 'spinner', function ($scope, $q, dispositionService,retrospectiveEntryService, spinner) {
        var consultation = $scope.consultation;

        var getDispositionActionsPromise = function() {
            return dispositionService.getDispositionActions().then(function (response) {
                $scope.dispositionActions = new Bahmni.Clinical.DispostionActionMapper().map(response.data.results[0].answers);
                var previousDispositionNote = consultation.disposition &&
                    _.find(consultation.disposition.additionalObs,function(obs) {
                        return !obs.voided && obs.concept.uuid === $scope.dispositionNoteConceptUuid;
                    });
                $scope.dispositionNote =  previousDispositionNote || {concept: {uuid: $scope.dispositionNoteConceptUuid }};
                $scope.dispositionCode = consultation.disposition ? consultation.disposition.code : null;
            });
        };

        $scope.isRetrospectiveMode = function(){
            return retrospectiveEntryService.getRetrospectiveEntry().isRetrospective;
        };

        $scope.showWarningForEarlierDispositionNote = function(){
            return !$scope.dispositionCode && consultation.disposition;
        };


        var getDispositionNotePromise = function() {
            return dispositionService.getDispositionNoteConcept().then(function (response) {
                $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
            });
        };

        var loadDispositionActions = function() {
            return getDispositionNotePromise().then(getDispositionActionsPromise);
        };

        $scope.clearDispositionNote = function(){
            $scope.dispositionNote = {concept: {uuid: $scope.dispositionNoteConceptUuid }};
        };

        var getSelectedConceptName = function(dispositionCode){
            var selectedDispositionConceptName = _.findLast($scope.dispositionActions, {code: dispositionCode}) || {};
            return selectedDispositionConceptName.name;
        };

        var getSelectedDisposition = function(){
            if($scope.dispositionCode){
                if(!$scope.dispositionNote.value){ $scope.dispositionNote.voided = true};
                return {
                    dispositionDateTime : null,
                    additionalObs :[$scope.dispositionNote],
                    code: $scope.dispositionCode,
                    conceptName: getSelectedConceptName($scope.dispositionCode)
                };
            }
        };

        spinner.forPromise(loadDispositionActions());


        var saveDispositions = function() {
            var selectedDisposition = getSelectedDisposition();
            if(selectedDisposition) {
                consultation.disposition  =  selectedDisposition;
            } else {
                if(consultation.disposition){
                    consultation.disposition.voided = true;
                    consultation.disposition.voidReason = "Cancelled during encounter";
                }

            }
        };

        $scope.consultation.saveHandler.register(saveDispositions);

        $scope.$on('$destroy', saveDispositions);
    }]);
