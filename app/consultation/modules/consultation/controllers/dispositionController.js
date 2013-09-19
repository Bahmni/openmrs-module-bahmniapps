'use strict';

angular.module('opd.consultation.controllers')
    .controller('DispositionController', ['$scope', '$rootScope','dispositionService', function ($scope, $rootScope,dispositionService) {

        var getOrderType = function(){
            return Bahmni.Opd.Constants.dispositionOrderType;
        }

        var loadDispositionActions = function(){
            $scope.dispositionActions = $rootScope.disposition.dispositionActions;

            if($rootScope.disposition !== undefined){

                if($rootScope.disposition.dispositionOrder){
                    $scope.dispositionOrder =  $rootScope.disposition.dispositionOrder.name;
                }
                else  {
                    $rootScope.disposition.dispositionOrder = {}
                }

                if($rootScope.disposition.dispositionNotes){
                    $scope.dispositionNotes = $rootScope.disposition.dispositionNotes.value;
                }
                else  {
                    $rootScope.disposition.dispositionNotes = {}
                }
            }
        }


        var getSelectedDispositionOrder = function(){
            var selectedAction ='';
            if(!$scope.dispositionActions){
                return{
                    order :{
                        conceptUUID : '',
                        orderType : ''
                    },
                    name : ''
                };
            }
            for(var i=0;i< $scope.dispositionActions.length;i++){
                if($scope.dispositionActions[i].name.name.toLowerCase() === $scope.dispositionOrder.toLowerCase()){
                    selectedAction =   $scope.dispositionActions[i];
                    break;
                }
            }
            return {
                order :{
                    conceptUUID : selectedAction.uuid,
                    orderType : getOrderType()
                },
                name : selectedAction.name.name

            };
        }


        var syncDispositionNotes = function(){
             $rootScope.disposition.dispositionNotes.value = $scope.dispositionNotes;
        }

        loadDispositionActions();

        $scope.$on('$destroy', function() {
            syncDispositionNotes(),
            $rootScope.disposition.dispositionOrder = getSelectedDispositionOrder()
        });
    }]);
