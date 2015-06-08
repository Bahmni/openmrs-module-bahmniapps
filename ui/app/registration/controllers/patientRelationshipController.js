'use strict';

angular.module('bahmni.registration')
    .controller('PatientRelationshipController', ['$scope', '$rootScope', 'spinner', 'patientService', 'providerService',
        function ($scope, $rootScope, spinner, patientService, providerService) {
            $scope.newlyAddedRelationships = [{voided:false}];

            $scope.displayRelationships = function () {
                return !angular.isUndefined($rootScope.relationshipTypes) && $rootScope.relationshipTypes.length > 0;
            };

            $scope.addRelationship = function (relationship) {
                if(angular.isUndefined(relationship.personName) || angular.isUndefined(relationship.type)) {
                    return;
                }
                $scope.newlyAddedRelationships.push({voided:false});
            };

            $scope.removeRelationship = function (relationship) {
                var elementIndex = $scope.newlyAddedRelationships.indexOf(relationship);
                if (elementIndex > -1) {
                    $scope.newlyAddedRelationships.splice(elementIndex, 1);
                }
            };

            $scope.hideAddButton = function(index) {
                return $scope.newlyAddedRelationships.length == index+1;
            };

            $scope.hideRemoveButton = function(index) {
                return !$scope.hideAddButton(index);
            };

            var getServiceForType = function (uuid) {
                var searchType;
                $rootScope.relationshipTypes.forEach(function(relationshipType) {
                    if(relationshipType['uuid'] === uuid) {
                        searchType = relationshipType.searchType;
                    }
                });
                switch(searchType){
                    case "patient": return patientService;
                    case "provider": return providerService;
                    default: return null;
                }
            };

            $scope.searchByType = function (relationship) {

                if(null == relationship.personName){
                    return;
                }

                var elementIndex = $scope.newlyAddedRelationships.indexOf(relationship);
                if($scope.newlyAddedRelationships[elementIndex].hasOwnProperty('personUuid')) {
                    $scope.newlyAddedRelationships[elementIndex].personUuid = null;
                }

                var service = getServiceForType(relationship.typeUuid);

                if(null != service) {
                    return spinner.forPromise(service.search(relationship.personName)).then(function (response) {
                        if(angular.isUndefined(response)) {
                            return;
                        }

                        var personUuid;
                        if(service == patientService) {
                            if(response.data.pageOfResults.length == 0) {
                                return;
                            }
                            personUuid = response.data['pageOfResults'][0]['uuid'];
                        } else {
                            if(response.data.results.length == 0) {
                                return;
                            }
                            personUuid = response.data['results'][0]['uuid'];
                        }

                        $scope.newlyAddedRelationships[elementIndex].personUuid = personUuid;
                    });
                }
            };

            $scope.showPersonNotFound = function(relationship) {
                if(angular.isUndefined(relationship.personName)){
                    return false;
                }

                return (relationship.personName != null && angular.isUndefined(relationship.personUuid));
            };

        }]);
