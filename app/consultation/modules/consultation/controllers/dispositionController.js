'use strict';

angular.module('opd.consultation.controllers')
    .controller('DispositionController', ['$scope', '$rootScope','dispositionService', function ($scope, $rootScope,dispositionService) {

        var loadDispositionActions = function(){
            dispositionService.getDispositionActions().success(function(data){
                $scope.dispositionActions = data.results[0].setMembers;
            });

            if($rootScope.disposition !== undefined){

                $scope.dispositionNotes =  $rootScope.disposition.dispositionNotes.value;
                $scope.dispositionType =  $rootScope.disposition.dispositionType.name;
            }
        }


        var getSelectedDispositionOrder = function(){
            var selectedAction ='';
            for(var i=0;i< $scope.dispositionActions.length;i++){
                if($scope.dispositionActions[i].name.name.toLowerCase().search( $scope.dispositionType.toLowerCase())>= 0){
                    selectedAction =   $scope.dispositionActions[i];
                    break;
                }
            }
            return {
                order :{
                    conceptUUID : selectedAction.uuid
                },
                name : selectedAction.name.name
            };
        }



        var getDispositionNotesAsObs = function(){
            var dispositionNoteConcept = $rootScope.disposition.dispositionNoteConcept;
            return {
                conceptUUID : dispositionNoteConcept.uuid,
                conceptName : dispositionNoteConcept.name.name,
                value : $scope.dispositionNotes
            }
        }

       /* $rootScope.consultation.dispositionNotesAsObs = getDispositionNotesAsObs;
        $rootScope.consultation.selectedDispositionAction = $scope.getSelectedAction;*/

        loadDispositionActions();

        $scope.$on('$destroy', function() {
            $rootScope.disposition = {
                dispositionNotes : getDispositionNotesAsObs(),
                dispositionType : getSelectedDispositionOrder()
            }
        });
    }]);
