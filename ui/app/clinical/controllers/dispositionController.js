'use strict';

angular.module('bahmni.clinical')
    .controller('DispositionController', ['$scope', '$q', '$rootScope','dispositionService', 'spinner', 'RegisterTabService', function ($scope, $q, $rootScope,dispositionService, spinner, registerTabService) {
        var getDispositionActionsPromise = function() {
            return dispositionService.getDispositionActions().then(function (response) {
                if (response.data && response.data.results) {

                    if(response.data.results && response.data.results.length){
                        $rootScope.disposition = $rootScope.disposition || {};
                        $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                        $scope.dispositionActions = response.data.results[0].answers;
                    }

                    var disposition = $rootScope.disposition;
                    if(disposition){
                        $scope.dispositionAction =  disposition.code;
                        $scope.dispositionNote = {concept:{uuid:$scope.dispositionNoteConceptUuid},value: undefined, voided: false};
                        if(disposition.additionalObs) {
                            var matchedObs = disposition.additionalObs.filter(function(obs){
                                return  obs.concept.uuid === $scope.dispositionNoteConceptUuid;
                            });
                            $scope.dispositionNote = matchedObs.length > 0 ? matchedObs[0] : $scope.dispositionNote;
                        }

                    }
                }

            });
        };

        var getDispositionNotePromise = function() {
            return dispositionService.getDispositionNoteConcept().then(function (response) {
                if (response.data) {
                    $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
                }
            });
        };

        var loadDispositionActions = function() {
            return getDispositionNotePromise().then(getDispositionActionsPromise);
        };

        $scope.getMappingCode = function(concept){
            var mappingCode="";
            if(concept.mappings){
                concept.mappings.forEach(function(mapping){
                    var mappingSource = mapping.display.split(":")[0];
                    if(mappingSource === Bahmni.Common.Constants.emrapiConceptMappingSource){
                        mappingCode = $.trim(mapping.display.split(":")[1]);
                    }
                });
            }
            return mappingCode;
        };

        $scope.clearDispositionNote = function(){
             $scope.dispositionNote = {concept:{uuid:$scope.dispositionNoteConceptUuid},value: undefined};
        };

        var getSelectedDisposition = function(){
            var selectedAction ='';
            if($scope.dispositionAction){
                for(var i=0;i< $scope.dispositionActions.length;i++){
                    if($scope.getMappingCode($scope.dispositionActions[i]) === $scope.dispositionAction){
                        selectedAction =   $scope.dispositionActions[i];
                        break;
                    }
                }
                if(!$scope.dispositionNote.value){$scope.dispositionNote.voided = true};
                return {
                    dispositionDateTime : new Date(),
                    additionalObs :[$scope.dispositionNote],
                    code: $scope.getMappingCode(selectedAction),
                    conceptName: selectedAction.name.name
                };
            }

        };

        spinner.forPromise(loadDispositionActions());


        var saveDispositions = function() {
            $rootScope.disposition  =  getSelectedDisposition();
        };

        registerTabService.register(saveDispositions);

        $scope.$on('$destroy', saveDispositions);
    }]);
