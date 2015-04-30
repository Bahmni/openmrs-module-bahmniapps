"use strict";

angular.module('bahmni.clinical')
    .directive('labOrders', ['conceptSetService','$q','spinner',
        function (conceptSetService, $q ,spinner) {

            var link = function(scope, element, attrs) {
                var fields = ['uuid','name', 'names'];
                var numberOfLevels = 2;
                var customRepresentation = Bahmni.ConceptSet.CustomRepresentationBuilder.build(fields, 'setMembers', numberOfLevels);
                if($scope.consultation.selectedObsTemplate.length == 0){
                    conceptSetService.getConceptSetMembers({name:concept.name,v:"custom:"+customRepresentation}).success(function(response){
                        var allTemplates = response.results[0].setMembers;
                        var allConceptSections  = allTemplates.map(function(template){
                            var conceptSetExtension = _.find(extensions,function(extension){
                                return extension.extensionParams.conceptName === template.name.name;
                            }) || {};
                            var conceptSetConfig = configs[template.name.name] || {};
                            return new Bahmni.ConceptSet.ConceptSetSection(conceptSetExtension, $rootScope.currentUser, conceptSetConfig, $scope.consultation.observations, template);
                        });
                        $scope.consultation.selectedObsTemplate= allConceptSections.filter(function(conceptSet){
                        if(conceptSet.isAvailable($scope.context)){
                            return true;
                        }
                        });
                    });
                }

            };

            return {
                restrict:'E',
                link:link,
                templateUrl:'consultation/views/labOrders.html',
                scope: {
                    consultation: "=",
                    orders: "=",
                    conceptClass: "=",
                    concept: "="
                }
            };
        }]);