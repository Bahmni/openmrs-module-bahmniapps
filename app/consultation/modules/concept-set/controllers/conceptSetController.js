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

        //$scope.conceptSet = $rootScope.vitals.conceptSet;

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


        $scope.$on('$destroy', function() {
            console.log($rootScope.vitals);
            $rootScope.vitals.recordedVitals = constructObsList();
        });

    }]);