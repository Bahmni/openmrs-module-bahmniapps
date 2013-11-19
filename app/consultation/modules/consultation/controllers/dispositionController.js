'use strict';

angular.module('opd.consultation.controllers')
    .controller('DispositionController', ['$scope', '$rootScope','dispositionService', function ($scope, $rootScope,dispositionService) {


        var loadDispositionActions = function(){
            dispositionService.getDispositionActions().then(function (response) {
                if (response.data && response.data.results) {

                    if(response.data.results && response.data.results.length){
                        $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                        $scope.dispositionActions = response.data.results.filter(function(concept){
                            return concept.name.name === Bahmni.Opd.Constants.dispositionConcept
                        })[0].answers;
                    }

                    var disposition = $rootScope.disposition.dispositions[$rootScope.disposition.currentActionIndex];
                    if(disposition){
                        $scope.dispositionAction =  disposition.adtName;
                        $scope.dispositionNotes = disposition.adtNoteValue;
                    }
                }

            });

            dispositionService.getDispositionNoteConcept().then(function (response) {
                if (response.data) {
                    $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
                }
            });


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

                var d = new Date();
                return {
                    adtValueUuid : selectedAction.uuid,
                    adtDateTime : d.toDateString() +" "+d.getHours()+":"+d.getMinutes(),
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
                    $rootScope.disposition.dispositions.push(currentAction);
                }
            }
        }

        var getDispositionInSaveFormat = function(){
            var selectedAction = getSelectedDispositionAction();
            if(selectedAction){
                return {
                    code : selectedAction.adtCode,
                    additionalObs :[{
                        concept: { uuid: $scope.dispositionNoteConceptUuid },
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
