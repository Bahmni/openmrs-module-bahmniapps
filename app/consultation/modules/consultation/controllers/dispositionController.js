'use strict';

angular.module('opd.consultation.controllers')
    .controller('DispositionController', ['$scope', '$rootScope','dispositionService', function ($scope, $rootScope,dispositionService) {

        var getOrderType = function(){
            return Bahmni.Opd.Constants.dispositionOrderType;
        }

        var loadDispositionActions = function(){
            $scope.dispositionActions = $rootScope.disposition.dispositionActions;

            if(!$rootScope.disposition){

                if($rootScope.disposition.currentActionIndex){
                    var disposition = $rootScope.disposition.dispositions[$rootScope.disposition.currentActionIndex];
                    $scope.dispositionAction =  disposition.adtName;
                    $scope.dispositionNotes = disposition.adtNoteValue;
                }
            }
        }


        var getSelectedDispositionAction = function(){
            var selectedAction ='';
            /*if(!$scope.dispositionActions){
                return{
                    order :{
                        conceptUUID : '',
                        orderType : ''
                    },
                    name : ''
                };
            }*/
            for(var i=0;i< $scope.dispositionActions.length;i++){
                if($scope.dispositionActions[i].name.name.toLowerCase() === $scope.dispositionAction.toLowerCase()){
                    selectedAction =   $scope.dispositionActions[i];
                    break;
                }
            }
            return {
                adtValueUuid : selectedAction.uuid,
                adtDateTime : 'latest',
                adtNoteValue : $scope.dispositionNotes,
                adtName : selectedAction.name.name
            };
        }


        var updateDispositionsList = function(){
            if(!$rootScope.disposition.dispositions){
                $rootScope.disposition.dispositions =  [];
            }

            var currentAction = getSelectedDispositionAction();
            if(currentAction){
                if($rootScope.disposition.currentActionIndex){
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
            return {
                conceptUuid : $rootScope.disposition.dispositionActionUuid,
                value : selectedAction.adtValueUuid,
                dispositionNote :{
                    conceptUuid:selectedAction.adtNoteConcept,
                    value : selectedAction.adtNoteValue
                }
            }
        }

        loadDispositionActions();

        $scope.$on('$destroy', function() {
            updateDispositionsList();
            $rootScope.disposition.adtToStore  =   getDispositionInSaveFormat();
        });
    }]);
