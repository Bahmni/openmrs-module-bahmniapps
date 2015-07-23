'use strict';

angular.module('bahmni.registration')
    .directive('patientRelationship', function () {
        return {
            restrict: 'AE',
            templateUrl: 'views/patientRelationships.html',
            controller: 'PatientRelationshipController',
            scope: {
                patient: "="
            }
        };
    })
    .controller('PatientRelationshipController', ['$window', '$scope', '$rootScope', 'spinner', 'patientService', 'providerService',
        function ($window, $scope, $rootScope, spinner, patientService, providerService) {

            $scope.addPlaceholderRelationship  = function(){
              $scope.patient.newlyAddedRelationships.push({});
            };

            $scope.removeRelationship = function (relationship) {
                if (relationship.uuid) {
                    relationship.voided = true;
                } else {
                    var elementIndex = $scope.patient.relationships.indexOf(relationship);
                    $scope.patient.relationships.splice(elementIndex, 1);
                }
            };

            $scope.isValidRelationship = function (relationship) {
                return $scope.isEmpty(relationship) || relationship.personB;
            };

            $scope.isPatientRelationship = function (relationship) {
                if (angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                var relationshipType = $scope.getRelationshipType(relationship.relationshipType.uuid);
                return relationshipType && relationshipType.searchType == "patient";
            };

            $scope.isProviderRelationship = function (relationship) {
                if (angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                var relationshipType = $scope.getRelationshipType(relationship.relationshipType.uuid);
                return relationshipType && relationshipType.searchType == "provider";
            };

            $scope.getRelationshipType = function (uuid) {
                return _.findWhere($scope.relationshipTypes, {uuid: uuid});
            };

            $scope.searchByPatientIdentifier = function (relationship) {
                if (!relationship.patientIdentifier) {
                    relationship.personB = null;
                    relationship.content = null;
                    return;
                }
                if (relationship.hasOwnProperty('personB')) {
                    relationship.personB = null;
                }
                return spinner.forPromise(patientService.searchByIdentifier(relationship.patientIdentifier)).then(function (response) {
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
                if (relationship.patientIdentifier) {
                    return false;
                }
                return relationship.patientIdentifier && !relationship.personB;
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

            $scope.clearRelationshipRow = function (relationship, index) {
                delete relationship.personB;
                delete relationship.patientIdentifier;
                delete relationship.providerName;
                delete relationship.endDate;
                delete relationship.content;
                managePlaceholderRelationshipRows(index);
            };

            var managePlaceholderRelationshipRows = function(index){
                var iter;
                for (iter = 0; iter < $scope.patient.newlyAddedRelationships.length; iter++) {
                    if ($scope.isEmpty($scope.patient.newlyAddedRelationships[iter]) && iter !== index) {
                        $scope.patient.newlyAddedRelationships.splice(iter, 1)
                    }
                }

                var emptyRows = _.filter($scope.patient.newlyAddedRelationships, $scope.isEmpty);
                if (emptyRows.length == 0) {
                    $scope.addPlaceholderRelationship();
                }
            };

            $scope.isEmpty  = function(relationship){
                return !relationship.relationshipType || !relationship.relationshipType.uuid;
            };

            var getPatientGenderAndAge = function (patient) {
                var patientGenderAndAge = [patient.givenName, patient.age, $rootScope.genderMap[angular.uppercase(patient.gender)]];
                return patientGenderAndAge.join(", ");
            };

           var init = function(){
               $scope.patient.newlyAddedRelationships = [];
               $scope.addPlaceholderRelationship();
               $scope.relationshipTypes = $rootScope.relationshipTypes;
               $scope.patient.relationships = $scope.patient.relationships || [];
           };

            init();
        }
    ]);