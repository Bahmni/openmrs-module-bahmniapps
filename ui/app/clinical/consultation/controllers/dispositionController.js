'use strict';

angular.module('bahmni.clinical')
    .controller('DispositionController', ['$scope', '$q', '$rootScope','dispositionService', 'spinner', function ($scope, $q, $rootScope,dispositionService, spinner) {
        var consultation = $rootScope.consultation;


        var getDispositionActionsPromise = function() {
            return dispositionService.getDispositionActions().then(function (response) {
                $scope.dispositionActions = new Bahmni.Clinical.DispostionActionMapper().map(response.data.results[0].answers);
                var previousDispositionNote = consultation.disposition ? consultation.disposition.additionalObs.filter(function(obs) { return !obs.voided && obs.concept.uuid === $scope.dispositionNoteConceptUuid; })[0] : null;
                $scope.dispositionNote =  previousDispositionNote || {concept: {uuid: $scope.dispositionNoteConceptUuid }};
                $scope.dispositionCode = consultation.disposition ? consultation.disposition.code : null;
            });
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
            var selectedDispositionConceptName;
            $scope.dispositionActions.forEach(function(dispositionAction){
                if(dispositionAction.code === dispositionCode){
                    selectedDispositionConceptName = dispositionAction.name;
                }
            });
            return selectedDispositionConceptName;
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
