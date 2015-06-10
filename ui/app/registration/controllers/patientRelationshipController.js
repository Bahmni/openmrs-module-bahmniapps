'use strict';

angular.module('bahmni.registration')
    .controller('PatientRelationshipController', ['$window','$scope', '$rootScope', 'spinner', 'patientService', 'providerService',
        function ($window, $scope, $rootScope, spinner, patientService, providerService) {
            $rootScope.newlyAddedRelationships = [{voided:false}];

            $scope.displayRelationships = function () {
                return !angular.isUndefined($rootScope.relationshipTypes) && $rootScope.relationshipTypes.length > 0;
            };

            $scope.addRelationship = function (relationship) {
                if(!checkMandatoryFieldsPresent(relationship)) {
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

            $scope.hasNoRelationship = function(relationship) {
                if(angular.isUndefined(relationship['relationshipType'])) {
                    return true;
                }
                return false;
            }

            $scope.isPatientRelationship = function(relationship) {
                if(angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                return $scope.getRelationshipType(relationship['relationshipType']['uuid']) == "patient";
            }

            $scope.isProviderRelationship = function(relationship) {
                if(angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                return $scope.getRelationshipType(relationship['relationshipType']['uuid']) == "provider";
            }

            $scope.getRelationshipType = function(uuid) {
                var searchType;
                $rootScope.relationshipTypes.forEach(function(relationshipType) {
                    if(relationshipType['uuid'] === uuid) {
                        searchType = relationshipType.searchType;
                    }
                });
                return searchType;
            }

            $scope.searchByPatientName = function (relationship) {

                if(null == relationship.patientName){
                    return;
                }

                var elementIndex = $rootScope.newlyAddedRelationships.indexOf(relationship);
                if($rootScope.newlyAddedRelationships[elementIndex].hasOwnProperty('personB')) {
                    $rootScope.newlyAddedRelationships[elementIndex].personB = null;
                }

                return spinner.forPromise(patientService.search(relationship.patientName)).then(function (response) {
                    if(angular.isUndefined(response)) {
                        return;
                    }

                    if(response.data.pageOfResults.length == 0) {
                        return;
                    }
                    var personUuid = response.data['pageOfResults'][0]['uuid'];

                    $rootScope.newlyAddedRelationships[elementIndex].personB = {'uuid':personUuid};
                });
            };

            $scope.showPersonNotFound = function(relationship) {
                if(angular.isUndefined(relationship.patientName)){
                    return false;
                }

                return (relationship.patientName != null &&
                            (angular.isUndefined(relationship.personB)
                                || relationship.personB == null));
            };

            var checkMandatoryFieldsPresent = function(relationship) {

                if($scope.isPatientRelationship(relationship) && angular.isUndefined(relationship.patientName)) {
                    return false;
                }
                if($scope.isProviderRelationship(relationship) && angular.isUndefined(relationship.providerName)) {
                    return false;
                }

                return !angular.isUndefined(relationship.personB);
            };

            $scope.checkDuplicateRelationship = function(relationship){
                return $rootScope.newlyAddedRelationships.some(function(existingRelationship) {
                    return relationship != existingRelationship && !angular.isUndefined(existingRelationship.relationshipType)
                        && !angular.isUndefined(relationship.relationshipType)
                        && (relationship['relationshipType']['uuid'] === existingRelationship['relationshipType']['uuid'] );
                });
            };

            $scope.openPatientDashboardInNewTab = function (relationship) {
                $window.open($scope.getPatientDashboardUrl(relationship['personB']['uuid']), '_blank');
            };

            $scope.getPatientDashboardUrl = function (patientUuid) {
                return '/bahmni/clinical/#/patient/' + patientUuid + '/dashboard';
            };

            $scope.getProviderList = function() {
                return function (searchAttrs) {
                    return providerService.search(searchAttrs.term);
                };
            };

            $scope.providerSelected = function(relationship) {
                return function(providerData){
                    relationship.providerName = providerData.identifier;
                    relationship.personB = { 'uuid' : providerData.uuid};
                }
            };

            $scope.getProviderDataResults = function(data) {
                return data.data.results.map(function (providerDetails) {
                    return {
                        'value': providerDetails.display,
                        'uuid': providerDetails.uuid,
                        'identifier' : providerDetails.identifier
                    }
                });
            };

            $scope.clearRelationshipRow = function(relationship) {
                delete relationship.personB;
                delete relationship.patientName;
                delete relationship.providerName;
                delete relationship.endDate;
            }

        }]);
