'use strict';

angular.module('bahmni.clinical')
    .controller('BacteriologyController', ['$scope', '$rootScope', 'contextChangeHandler', 'spinner', 'conceptSetService', 'messagingService', 'bacteriologyConceptSet',
        function ($scope, $rootScope, contextChangeHandler, spinner, conceptSetService, messagingService, bacteriologyConceptSet) {
            $scope.consultation.extensions = $scope.consultation.extensions ? $scope.consultation.extensions : {mdrtbSpecimen: []};
            $scope.savedSpecimens = $scope.consultation.extensions.mdrtbSpecimen;
            $scope.newSpecimens = $scope.consultation.newlyAddedSpecimens || [];

            var init = function () {
                $scope.clearEmptySpecimens();

                var additionalAttributes = _.find(bacteriologyConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Bacteriology Attributes"
                });
                $scope.additionalAttributesConceptName = additionalAttributes && additionalAttributes.name.name;

                var results = _.find(bacteriologyConceptSet.setMembers, function (member) {
                    return member.conceptClass.name === "Bacteriology Results"
                });
                $scope.resultsConceptName = results && results.name.name;

                var sampleSource = _.find(bacteriologyConceptSet.setMembers, function (member) {
                    return member.name.name === "Specimen Sample Source"
                });
                $scope.allSamples = sampleSource != undefined && _.map(sampleSource.answers, function (answer) {
                        return new Bahmni.Common.Domain.ConceptMapper().map(answer);
                    });
            };

            var createNewSpecimen = function () {
                var newSpecimen = new Bahmni.Clinical.Specimen();
                $scope.newSpecimens.push(newSpecimen);
            };

            var contextChange = function () {
                $scope.consultation.newlyAddedSpecimens = $scope.newSpecimens;
                var dirtySpecimen = _.find($scope.newSpecimens, function (specimen) {
                    return specimen.isDirty();
                });

                return {allow: dirtySpecimen == undefined};
            };

            var saveSpecimens = function () {
                var savableSpecimens = _.filter($scope.newSpecimens, function (specimen) {
                    return !specimen.isEmpty();
                });
                _.each(savableSpecimens, function (specimen) {
                    specimen.sample.additionalAttributes = specimen.sample.additionalAttributes ? specimen.sample.additionalAttributes[0] : {};
                    specimen.report.results = specimen.report.results ? specimen.report.results[0] : {};
                });

                $scope.consultation.newlyAddedSpecimens = savableSpecimens;
                if (!$scope.consultation.extensions.mdrtbSpecimen) {
                    $scope.consultation.extensions.mdrtbSpecimen = [];
                }
            };

            $scope.clearEmptySpecimens = function () {
                var iter;
                for (iter = 0; iter < $scope.newSpecimens.length; iter++) {
                    if ($scope.newSpecimens[iter].isEmpty()) {
                        $scope.newSpecimens.splice(iter, 1)
                    }
                }
                var emptyRows = $scope.newSpecimens.filter(function (diagnosis) {
                        return diagnosis.isEmpty();
                    }
                );
                if (emptyRows.length == 0) {
                    createNewSpecimen();
                }
            };

            $scope.clearSpecimen = function (specimen) {
                $scope.newSpecimens = _.without($scope.newSpecimens, specimen);
                $scope.clearEmptySpecimens();
            };

            $scope.editSpecimen = function(specimen){
                $scope.newSpecimens.push(specimen);
                $scope.clearEmptySpecimens();
            };

            $scope.consultation.preSaveHandler.register(saveSpecimens);

            contextChangeHandler.add(contextChange);

            init();
        }
    ])
;
