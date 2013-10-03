'use strict';

angular.module('opd.consultation.controllers')
    .controller('DispositionController', ['$scope', '$rootScope','dispositionService', function ($scope, $rootScope,dispositionService) {


        var loadDispositionActions = function(){
            $scope.dispositionActions = $rootScope.disposition.dispositionActions;

            if($rootScope.disposition){

                if($rootScope.disposition.currentActionIndex !== undefined){
                    var disposition = $rootScope.disposition.dispositions[$rootScope.disposition.currentActionIndex];
                    $scope.dispositionAction =  disposition.adtName;
                    $scope.dispositionNotes = disposition.adtNoteValue;
                }
            }
        }


        var getMappingCode = function(concept){
            var mappingCode="";
            if(concept.mappings){
                concept.mappings.forEach(function(mapping){
                    var mappingSource = mapping.display.split(":")[0];
                    if(mappingSource === Bahmni.Opd.Constants.emrapiConceptMappingSource){
                        mappingCode = mapping.display.split(":")[1].trim();;
                    }
                });
            }
            return mappingCode;
        }

        var getSelectedDispositionAction = function(){
            var selectedAction ='';

            if($scope.dispositionAction){
                for(var i=0;i< $scope.dispositionActions.length;i++){
                    if($scope.dispositionActions[i].name.name.toLowerCase() === $scope.dispositionAction.toLowerCase()){
                        selectedAction =   $scope.dispositionActions[i];
                        break;
                    }
                }
                return {
                    adtValueUuid : selectedAction.uuid,
                    adtDateTime : new Date(),
                    adtNoteValue : $scope.dispositionNotes,
                    adtName : selectedAction.name.name,
                    adtCode: getMappingCode(selectedAction)
                };
            }

        }


        var updateDispositionsList = function(){
            if(!$rootScope.disposition.dispositions){
                $rootScope.disposition.dispositions =  [];
            }

            var currentAction = getSelectedDispositionAction();
            if(currentAction){
                if($rootScope.disposition.currentActionIndex !== undefined){
                    $rootScope.disposition.dispositions[$rootScope.disposition.currentActionIndex] = currentAction;
                }
                else{
                    $rootScope.disposition.currentActionIndex =  $rootScope.disposition.dispositions.length-1;
                    $rootScope.disposition.dispositions.push(disposition);
                }
            }
        }

        var getDispositionInSaveFormat = function(){
            var selectedAction = getSelectedDispositionAction();
            if(selectedAction){
                return {
                    code : selectedAction.adtCode,
                    additionalObs :[{
                        conceptUuid:$rootScope.dispositionNoteConceptUuid,
                        value : selectedAction.adtNoteValue
                    }]
                }
            }
        }



        loadDispositionActions();

        $scope.$on('$destroy', function() {
            updateDispositionsList();
            $rootScope.disposition.adtToStore  =   getDispositionInSaveFormat();
        });
    }]);
