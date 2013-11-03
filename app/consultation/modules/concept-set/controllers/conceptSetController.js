'use strict';

angular.module('opd.conceptSet.controllers')
    .controller('ConceptSetController', ['$scope', '$rootScope','$route', 'ConceptSetService', function ($scope, $rootScope,$route, conceptSetService) {

        if(!$rootScope.vitals || !$rootScope.vitals.conceptSet){
            $scope.getConceptSet = function (name) {
                console.log("in get concept set");
                conceptSetService.getConceptSetMembers(name).success(function(response){
                    if(response.results && response.results.length > 0){
                        $rootScope.vitals.conceptSet = response.results[0].setMembers
                    }
                })
            }

        }

        var conceptSetMap = {
            "vitals":"VITALS_CONCEPT"
        }

        var constructObsList = function(){
            var obsList = [];
            for(var conceptUuid in $rootScope.vitals.conceptToObservationMap){
                obsList.push($rootScope.vitals.conceptToObservationMap[conceptUuid]);
            }
            return obsList;
        }
       // var conceptSetName = $route.current.params.conceptSet;

        $scope.getObsForConceptUuid = function(conceptUuid){
            if($rootScope.vitals && $rootScope.vitals.conceptToObservationMap) {
                return  $rootScope.vitals.conceptToObservationMap[conceptUuid];
            }
            return {};
        }

        $scope.$on('$destroy', function() {
            console.log($rootScope.vitals);
            $rootScope.vitals.recordedVitals = constructObsList();
        });

    }]).directive('showConcept',['$rootScope',function(rootScope){
        var obsValueReference = "conceptObsMap[concept.uuid].value";
        return {
            restrict: 'E',
            scope :{
                conceptObsMap : "=",
                displayType:"@",
                concept:"="
            },
            template :
                '<div ng-switch on="concept.set" >' +
                    '<div ng-switch-when="false">' +
                        '<label>{{concept.display}}</label>' +
                        '<div ng-switch on="displayType">' +
                            '<span ng-switch-when="readonly">{{'+obsValueReference+'}}</span>'+
                            '<input ng-switch-default type="text" placeholder="{{concept.display}}" ng-model="'+obsValueReference+'"></input>' +
                        '</div>'+
                        '<span>{{concept.units}}</span>'+
                    '</div>'+
                    '<div ng-switch-when="true">' +
                        '<span>{{concept.display}}<span>' +
                        '<div ng-repeat="concept in concept.setMembers">'+
                            '<label>{{concept.display}}</label>' +
                            '<div ng-switch on="displayType">' +
                                '<span ng-switch-when="readonly">{{'+obsValueReference+'}}</span>'+
                                '<input ng-switch-default type="text" placeholder="{{concept.display}}" ng-model="'+obsValueReference+'"></input>' +
                            '</div>'+
                            '<span>{{concept.units}}</span>'+
                        '</div>'+
                    '</div>' +
                '</div>'
        }
    }])

