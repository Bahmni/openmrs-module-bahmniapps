'use strict';

angular.module('bahmni.registration')
    .controller('PatientRelationshipController', ['$scope', '$rootScope', 'spinner', 'patientService', 'providerService',
        function ($scope, $rootScope, spinner, patientService, providerService) {
            $rootScope.newlyAddedRelationships = [{voided:false}];

            $scope.displayRelationships = function () {
                return !angular.isUndefined($rootScope.relationshipTypes) && $rootScope.relationshipTypes.length > 0;
            };

            $scope.addRelationship = function (relationship) {
                if(!checkMandatoryFieldsPresent(relationship) || $scope.showPersonNotFound(relationship)) {
                    return;
                }

                if($scope.checkDuplicateRelationship(relationship)){
                    return;
                }
                $rootScope.newlyAddedRelationships.unshift({voided:false});
            };

            $scope.removeRelationship = function (relationship) {
                var elementIndex = $rootScope.newlyAddedRelationships.indexOf(relationship);
                if (elementIndex > -1) {
                    var relationshipToBeRemoved = $rootScope.newlyAddedRelationships[elementIndex],
                        isRelationshipExistingInDB = !angular.isUndefined(relationshipToBeRemoved.uuid);
                    if(isRelationshipExistingInDB) {
                        relationshipToBeRemoved.voided = true;
                    } else {
                        $rootScope.newlyAddedRelationships.splice(elementIndex, 1);
                    }
                }
            };

            $scope.showAddButton = function(index) {
                return index === 0;
            };

            $scope.hideRemoveButton = function(index) {
                return !$scope.showAddButton(index);
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

                var elementIndex = $rootScope.newlyAddedRelationships.indexOf(relationship);
                if($rootScope.newlyAddedRelationships[elementIndex].hasOwnProperty('personB')) {
                    $rootScope.newlyAddedRelationships[elementIndex].personB = null;
                }

                var service = getServiceForType(relationship.relationshipType.uuid);

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

                        $rootScope.newlyAddedRelationships[elementIndex].personB = {'uuid':personUuid};
                    });
                }
            };

            $scope.showPersonNotFound = function(relationship) {
                if(angular.isUndefined(relationship.personName)){
                    return false;
                }

                return (relationship.personName != null &&
                            (angular.isUndefined(relationship.personB)
                                || relationship.personB == null));
            };

            var checkMandatoryFieldsPresent = function(relationship) {
                return !angular.isUndefined(relationship.personName)
                    && !angular.isUndefined(relationship.personB);
            };

            $scope.checkDuplicateRelationship = function(relationship){
                return $rootScope.newlyAddedRelationships.some(function(existingRelationship) {
                    return relationship != existingRelationship && !angular.isUndefined(existingRelationship.relationshipType)
                        && !angular.isUndefined(relationship.relationshipType)
                        && (relationship['relationshipType']['uuid'] === existingRelationship['relationshipType']['uuid'] );
                });
            };

        }]);
