'use strict';

angular.module('bahmni.clinical')
    .controller('BacteriologyController', ['$scope', '$rootScope', 'contextChangeHandler', 'spinner', 'conceptSetService', 'messagingService', 'bacteriologyConceptSet',
        function ($scope, $rootScope, contextChangeHandler, spinner, conceptSetService, messagingService, bacteriologyConceptSet) {
            $scope.consultation.extensions = $scope.consultation.extensions ? $scope.consultation.extensions : {mdrtbSpecimen: []};
            $scope.savedSpecimens = $scope.consultation.extensions.mdrtbSpecimen;
            $scope.newSpecimens = $scope.consultation.newlyAddedSpecimens || [];

            var init = function () {
                console.log($scope.consultation);
                createNewSpecimen();

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
                $scope.allSamples = sampleSource != undefined && _.map(sampleSource.answers, function (member) {
                        return new Bahmni.Common.Domain.ConceptMapper().map(member);
                    });
            };

            var createNewSpecimen = function () {
                var newSpecimen = {"sample": {"additionalAttributes": []}, "report": {"results": []}};
                $scope.newSpecimens.unshift(newSpecimen);
            };

            var isEmptySpecimen = function (specimen) {
                return specimen == undefined || (!specimen.dateCollected && !specimen.type);
            };

            $scope.clearSpecimen = function (specimen) {
                $scope.newSpecimens = _.without($scope.newSpecimens, specimen);
            };

            $scope.addSpecimen = function () {
                createNewSpecimen();
            };

            $scope.removeSpecimen = function (specimen) {
                $scope.newSpecimens = _.without($scope.newSpecimens, specimen);
            };

            var contextChange = function () {
                $scope.consultation.newlyAddedSpecimens = $scope.newSpecimens;
                return {allow: isEmptySpecimen()};
            };

            var saveSpecimens = function () {
                var savableSpecimens = _.filter($scope.newSpecimens, function (specimen) {
                    return !isEmptySpecimen(specimen);
                });
                _.each(savableSpecimens, function (specimen) {
                    specimen.sample.additionalAttributes = specimen.sample.additionalAttributes ? specimen.sample.additionalAttributes[0] : [];
                    specimen.report.results = specimen.report.results ? specimen.report.results[0] : [];
                });

                $scope.consultation.newlyAddedSpecimens = savableSpecimens;
                if(!$scope.consultation.extensions.mdrtbSpecimen){
                    $scope.consultation.extensions.mdrtbSpecimen = [];
                }
                $scope.consultation.extensions.mdrtbSpecimen = $scope.consultation.extensions.mdrtbSpecimen.concat($scope.consultation.newlyAddedSpecimens);
            };

            $scope.consultation.preSaveHandler.register(saveSpecimens);
            $scope.consultation.postSaveHandler.register(init);

            contextChangeHandler.add(contextChange);

            init();
        }
    ])
;
