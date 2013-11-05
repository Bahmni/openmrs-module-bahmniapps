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
        var getObsValueReference = function(conceptReference){
            return "conceptObsMap["+conceptReference+".uuid].value";
        }


        return {
            restrict: 'E',
            scope :{
                conceptObsMap : "=",
                displayType:"@",
                concept:"=",
                emptyObsCheck:"@"
            },
            template :
                '<div ng-switch on="concept.set" >' +
                    '<div class="form-field" ng-switch-when="false" ng-hide="emptyObsCheck && !'+getObsValueReference("concept")+'">' +
                        '<div class="field-attribute"><label>{{concept.display}}</label><div><label ng-show="concept.units">({{concept.units}})</label></div></div>' +
                        '<div class="field-value" ng-switch on="displayType">' +
                            '<span ng-switch-when="readonly">{{'+getObsValueReference("concept")+'}}</span>'+
                            '<input ng-switch-default type="text" placeholder="{{concept.display}}" ng-model="'+getObsValueReference("concept")+'"></input>' +
                        '</div>'+
                    '</div>'+
                    '<fieldset ng-switch-when="true"><legend ng-switch on="$index"><span>{{concept.display}}</span></legend><div class="form-field-inline">' +
                        '<div class="form-field" ng-repeat="childConcept in concept.setMembers" ng-hide="emptyObsCheck && !'+getObsValueReference("childConcept")+'">' +

                            '<div class="field-attribute"><label>{{childConcept.display}}</label><div><label ng-show="concept.units">({{concept.units}})</label></div>'+'</div>' +
                            '<div  class="field-value" ng-switch on="displayType">' +
                                '<span ng-switch-when="readonly">{{'+getObsValueReference("childConcept")+'}}</span>'+
                                '<input ng-switch-default type="text" placeholder="{{childConcept.display}}" ng-model="'+getObsValueReference("childConcept")+'"></input>' +
                            '</div>'+
                        '</div>'+
                    '</div></fieldset>' +
                '</div>'
        }
    }])

