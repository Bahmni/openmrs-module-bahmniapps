'use strict';

angular.module('opd.consultation.controllers')
    .controller('DispositionController', ['$scope', '$rootScope','dispositionService', function ($scope, $rootScope,dispositionService) {


        var loadDispositionActions = function(){
            dispositionService.getDispositionActions().then(function (response) {
                if (response.data && response.data.results) {

                    if(response.data.results && response.data.results.length){
                        $rootScope.disposition.dispositionActionUuid = response.data.results[0].uuid;
                        $scope.dispositionActions = response.data.results[0].answers;
                    }

                    var disposition = $rootScope.disposition;
                    if(disposition){
                        $scope.dispositionAction =  disposition.code;
                        if(disposition.additionalObs){
                            $scope.dispositionNotes = disposition.additionalObs.filter(function(obs){
                                return  obs.concept.uuid === $scope.dispositionNoteConceptUuid;
                            })[0];
                        }

                    }
                }

            });

            dispositionService.getDispositionNoteConcept().then(function (response) {
                if (response.data) {
                    $scope.dispositionNoteConceptUuid = response.data.results[0].uuid;
                }
            });


        }


        $scope.getMappingCode = function(concept){
            var mappingCode="";
            if(concept.mappings){
                concept.mappings.forEach(function(mapping){
                    var mappingSource = mapping.display.split(":")[0];
                    if(mappingSource === Bahmni.Opd.Consultation.Constants.emrapiConceptMappingSource){
                        mappingCode = $.trim(mapping.display.split(":")[1]);;
                    }
                });
            }
            return mappingCode;
        }

        var getSelectedDisposition = function(){
            var selectedAction ='';
            if($scope.dispositionAction){
                for(var i=0;i< $scope.dispositionActions.length;i++){
                    if($scope.getMappingCode($scope.dispositionActions[i]) === $scope.dispositionAction){
                        selectedAction =   $scope.dispositionActions[i];
                        break;
                    }
                }
                var d = new Date();
                var additionalObs = constructDispositionNoteObs($scope.dispositionNotes);
                return {
                    dispositionDateTime : d,//.toDateString() +" "+d.getHours()+":"+d.getMinutes(),
                    additionalObs :additionalObs ,
                    code: $scope.getMappingCode(selectedAction),
                    conceptName: selectedAction.name.name
                };
            }

        }

        var constructDispositionNoteObs = function(notesObs){
            if(notesObs){
                var additionalObs =   [
                    {
                        concept:{
                            uuid:$scope.dispositionNoteConceptUuid
                        },
                        value: notesObs.value
                    }
                ];
                return additionalObs;
            }
            else{
                return "";
            }
        }

       /* var updateDispositionsList = function(){
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
        }*/




        loadDispositionActions();

        $scope.$on('$destroy', function() {
      //      updateDispositionsList();
            $rootScope.disposition  =   getSelectedDisposition();
        });
    }]);
