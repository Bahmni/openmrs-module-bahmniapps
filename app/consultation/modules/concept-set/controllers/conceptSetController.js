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


        $scope.$on('$destroy', function() {
            console.log($rootScope.vitals);
            $rootScope.vitals.recordedVitals = constructObsList();
        });

    }]).directive('showSimpleConcept',['$rootScope',function(rootScope){
        return {
            restrict: 'A',
            template : '<div ng-show="concept.set == false"><label>{{concept.display}}</label><input type="text" placeholder="{{concept.display}}"'+
                'ng-model="$parent.$parent.vitals.conceptToObservationMap[concept.uuid].value"></input></div>'
        }
    }]).directive('showComplexConcept',['$rootScope',function(rootScope){
    return {
        restrict: 'A',
        template : '<div ng-show="concept.set == true">' +
            '<div>{{concept.display}}<div ng-repeat="concept in concept.setMembers">'+
                '<div><label>{{concept.display}}</label><input type="text" placeholder="{{concept.display}}"'+
                'ng-model="$parent.$parent.$parent.vitals.conceptToObservationMap[concept.uuid].value"></input>'+
                '</div>'+
            '</div></div>'+
        '</div>'
    }
}])

