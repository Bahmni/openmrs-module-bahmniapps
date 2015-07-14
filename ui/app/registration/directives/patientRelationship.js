'use strict';

angular.module('bahmni.registration')
    .directive('patientRelationship', function () {
        return {
            restrict: 'AE',
            templateUrl: ' views/patientRelationships.html',
            controller: 'PatientRelationshipController',
            scope: {
                patient: "="
            }
        };
    })
    .controller('PatientRelationshipController', ['$window', '$scope', '$rootScope', 'spinner', 'patientService', 'providerService',
        function ($window, $scope, $rootScope, spinner, patientService, providerService) {
            $scope.newRelationship = {};
            $scope.relationshipTypes = $rootScope.relationshipTypes;
            $scope.patient.relationships = $scope.patient.relationships || [];

            $scope.addRelationship = function (relationship) {
                if (!checkMandatoryFieldsPresent(relationship)) {
                    return;
                }
                if ($scope.checkDuplicateRelationship(relationship)) {
                    return;
                }
                $scope.patient.relationships.push(relationship);
                $scope.newRelationship = {};
            };

            $scope.removeRelationship = function (relationship) {
                if (relationship.uuid) {
                    relationship.voided = true
                } else {
                    var elementIndex = $scope.patient.relationships.indexOf(relationship);
                    $scope.patient.relationships.splice(elementIndex, 1);
                }
            };

            $scope.hasNoRelationship = function (relationship) {
                return angular.isUndefined(relationship['relationshipType']);
            };

            $scope.isPatientRelationship = function (relationship) {
                if (angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                return getRelationshipType(relationship['relationshipType']['uuid']) == "patient";
            };

            $scope.isProviderRelationship = function (relationship) {
                if (angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                return getRelationshipType(relationship['relationshipType']['uuid']) == "provider";
            };

            var getRelationshipType = function (uuid) {
                var searchType;
                $scope.relationshipTypes.forEach(function (relationshipType) {
                    if (relationshipType['uuid'] === uuid) {
                        searchType = relationshipType.searchType;
                    }
                });
                return searchType;
            };

            $scope.searchByPatientIdentifier = function (relationship) {

                if (null == relationship.patientIdentifier) {
                    return;
                }

                if (relationship.hasOwnProperty('personB')) {
                    relationship.personB = null;
                }

                return spinner.forPromise(patientService.search(relationship.patientIdentifier)).then(function (response) {
                    if (angular.isUndefined(response)) {
                        return;
                    }

                    if (response.data.pageOfResults.length == 0) {
                        return;
                    }

                    relationship.content = getPatientGenderAndAge(response.data['pageOfResults'][0]);
                    var personUuid = response.data['pageOfResults'][0]['uuid'];

                    relationship.personB = {'uuid': personUuid};

                });
            };

            $scope.showPersonNotFound = function (relationship) {
                if (angular.isUndefined(relationship.patientIdentifier)) {
                    return false;
                }

                return (relationship.patientIdentifier != null &&
                (angular.isUndefined(relationship.personB)
                || relationship.personB == null));
            };

            var checkMandatoryFieldsPresent = function (relationship) {
                return relationship.relationshipType && relationship.personB;
            };

            $scope.checkDuplicateRelationship = function (relationship) {
                return $scope.patient.relationships.some(function (existingRelationship) {
                    return relationship != existingRelationship && !angular.isUndefined(existingRelationship.relationshipType)
                        && !angular.isUndefined(relationship.relationshipType)
                        && (relationship['relationshipType']['uuid'] === existingRelationship['relationshipType']['uuid'] );
                });
            };

            $scope.openPatientDashboardInNewTab = function (relationship) {
                $window.open(getPatientDashboardUrl(relationship['personB']['uuid']), '_blank');
            };

            var getPatientDashboardUrl = function (patientUuid) {
                return '/bahmni/clinical/#/patient/' + patientUuid + '/dashboard';
            };

            $scope.getProviderList = function () {
                return function (searchAttrs) {
                    return providerService.search(searchAttrs.term);
                };
            };

            $scope.providerSelected = function (relationship) {
                return function (providerData) {
                    relationship.providerName = providerData.identifier;
                    relationship.personB = {'uuid': providerData.uuid};
                }
            };

            $scope.getProviderDataResults = function (data) {
                return data.data.results.map(function (providerDetails) {
                    return {
                        'value': providerDetails.display,
                        'uuid': providerDetails.person.uuid,
                        'identifier': providerDetails.identifier
                    }
                });
            };

            $scope.clearRelationshipRow = function (relationship) {
                delete relationship.personB;
                delete relationship.patientIdentifier;
                delete relationship.providerName;
                delete relationship.endDate;
            };

            var getPatientGenderAndAge = function (patient) {
                var patientGenderAndAge = [patient.givenName, patient.age, $rootScope.genderMap[angular.uppercase(patient.gender)]];
                return patientGenderAndAge.join(", ");
            };

        }
    ]);