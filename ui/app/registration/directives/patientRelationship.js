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
    .controller('PatientRelationshipController', ['$window', '$scope', '$rootScope', 'spinner', 'patientService', 'providerService', 'appService', '$q',
        function ($window, $scope, $rootScope, spinner, patientService, providerService, appService, $q) {
            $scope.addPlaceholderRelationship = function () {
                $scope.patient.newlyAddedRelationships.push({});
            };

            $scope.removeRelationship = function (relationship, index) {
                if (relationship.uuid) {
                    relationship.voided = true;
                    $scope.patient.deletedRelationships.push(relationship);
                } else {
                    $scope.patient.newlyAddedRelationships.splice(index, 1);
                }
            };

            $scope.isPatientRelationship = function (relationship) {
                var relationshipType = getRelationshipType(relationship);
                return relationshipType && (_.isUndefined(relationshipType.searchType) || relationshipType.searchType === "patient");
            };

            var getRelationshipType = function (relationship) {
                if (angular.isUndefined(relationship['relationshipType'])) {
                    return false;
                }
                return $scope.getRelationshipType(relationship.relationshipType.uuid);
            };

            $scope.getChosenRelationshipType = function (relation) {
                if ($scope.isPatientRelationship(relation)) {
                    return "patient";
                } else if ($scope.isProviderRelationship(relation)) {
                    return "provider";
                }
            };

            $scope.isProviderRelationship = function (relationship) {
                var relationshipType = getRelationshipType(relationship);
                return relationshipType && relationshipType.searchType === "provider";
            };

            $scope.getRelationshipType = function (uuid) {
                return _.find($scope.relationshipTypes, {uuid: uuid});
            };

            $scope.getRelationshipTypeForDisplay = function (relationship) {
                var personUuid = $scope.patient.uuid;
                var relationshipType = $scope.getRelationshipType(relationship.relationshipType.uuid);
                if (!relationship.personA) {
                    return "";
                }
                if (relationship.personA.uuid === personUuid) {
                    return relationshipType.aIsToB;
                } else {
                    return relationshipType.bIsToA;
                }
            };

            $scope.getRelatedToPersonForDisplay = function (relationship) {
                var personRelatedTo = getPersonRelatedTo(relationship);
                return personRelatedTo ? personRelatedTo.display : "";
            };

            var getName = function (patient) {
                return patient.givenName + (patient.middleName ? " " + patient.middleName : "")
                + (patient.familyName ? " " + patient.familyName : "");
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
                return patientService.searchByIdentifier(relationship.patientIdentifier).then(function (response) {
                    if (angular.isUndefined(response)) {
                        return;
                    }

                    var patients = response.data.pageOfResults;
                    if (patients.length === 0) {
                        return;
                    }
                    relationship.content = getPatientGenderAndAge(patients[0]);
                    var personUuid = patients[0]['uuid'];
                    var personName = getName(patients[0]);

                    relationship.personB = {'display': personName, 'uuid': personUuid};
                });
            };

            $scope.showPersonNotFound = function (relationship) {
                return (relationship.patientIdentifier && !relationship.personB) &&
                    $scope.getChosenRelationshipType(relationship) !== 'patient';
            };

            var getPersonRelatedTo = function (relationship) {
                return relationship.personA && relationship.personA.uuid === $scope.patient.uuid ? relationship.personB : relationship.personA;
            };

            $scope.openPatientDashboardInNewTab = function (relationship) {
                var personRelatedTo = getPersonRelatedTo(relationship);
                $window.open(getPatientRegistrationUrl(personRelatedTo.uuid), '_blank');
            };

            var getPatientRegistrationUrl = function (patientUuid) {
                return '#/patient/' + patientUuid;
            };

            $scope.getProviderList = function () {
                return function (searchAttrs) {
                    return providerService.search(searchAttrs.term);
                };
            };

            $scope.providerSelected = function (relationship) {
                return function (providerData) {
                    relationship.providerName = providerData.identifier;
                    relationship.personB = {'display': providerData.identifier, 'uuid': providerData.uuid};
                };
            };

            var clearPersonB = function (relationship, fieldName) {
                if (!relationship[fieldName]) {
                    delete relationship.personB;
                }
            };

            $scope.clearProvider = function (relationship) {
                clearPersonB(relationship, 'providerName');
            };

            var getLimit = function (configName, defaultValue) {
                return appService.getAppDescriptor().getConfigValue(configName) || defaultValue;
            };

            $scope.searchByPatientIdentifierOrName = function (searchAttrs) {
                var term = searchAttrs.term;
                if (term && term.length >= getLimit("minCharRequireToSearch", 1)) {
                    return patientService.searchByNameOrIdentifier(term, getLimit("possibleRelativeSearchLimit", Bahmni.Common.Constants.defaultPossibleRelativeSearchLimit));
                }
                return $q.when();
            };

            $scope.clearPatient = function (relationship) {
                clearPersonB(relationship, 'patientIdentifier');
            };

            $scope.patientSelected = function (relationship) {
                return function (patientData) {
                    relationship.patientIdentifier = patientData.identifier;
                    relationship.personB = {'display': patientData.value, 'uuid': patientData.uuid};
                };
            };

            $scope.getPatientList = function (response) {
                if (angular.isUndefined(response)) {
                    return;
                }
                return response.data.pageOfResults.map(function (patient) {
                    return {
                        value: getName(patient) + " - " + patient.identifier,
                        uuid: patient.uuid,
                        identifier: patient.identifier
                    };
                });
            };

            $scope.getProviderDataResults = function (data) {
                return data.data.results.filter(function (provider) {
                    return provider.person;
                })
                    .map(function (providerDetails) {
                        return {
                            'value': providerDetails.display || providerDetails.person.display,
                            'uuid': providerDetails.person.uuid,
                            'identifier': providerDetails.identifier || providerDetails.person.display
                        };
                    });
            };

            $scope.onEdit = function (relationship) {
                return function () {
                    delete relationship.personB;
                };
            };

            $scope.clearRelationshipRow = function (relationship, index) {
                delete relationship.personB;
                delete relationship.patientIdentifier;
                delete relationship.providerName;
                delete relationship.endDate;
                delete relationship.content;
                managePlaceholderRelationshipRows(index);
            };

            var managePlaceholderRelationshipRows = function (index) {
                var iter;
                for (iter = 0; iter < $scope.patient.newlyAddedRelationships.length; iter++) {
                    if ($scope.isEmpty($scope.patient.newlyAddedRelationships[iter]) && iter !== index) {
                        $scope.patient.newlyAddedRelationships.splice(iter, 1);
                    }
                }

                var emptyRows = _.filter($scope.patient.newlyAddedRelationships, $scope.isEmpty);
                if (emptyRows.length === 0) {
                    $scope.addPlaceholderRelationship();
                }
            };

            $scope.isEmpty = function (relationship) {
                return !relationship.relationshipType || !relationship.relationshipType.uuid;
            };

            var getPatientGenderAndAge = function (patient) {
                var patientGenderAndAge = [patient.givenName, patient.age, $rootScope.genderMap[angular.uppercase(patient.gender)]];
                return patientGenderAndAge.join(", ");
            };

            var init = function () {
                $scope.relationshipTypes = $rootScope.relationshipTypes;
                $scope.patient.relationships = $scope.patient.relationships || [];
            };

            init();
        }
    ]);
