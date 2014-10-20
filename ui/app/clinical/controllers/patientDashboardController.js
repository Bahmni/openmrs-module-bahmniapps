'use strict';

angular.module('opd.patientDashboard', [])
    .controller('PatientDashboardController', ['$scope', '$rootScope', '$location', '$stateParams', 'patientVisitHistoryService',
        'urlHelper', 'encounterService', 'clinicalConfigService', 'diseaseTemplates',
        function ($scope, $rootScope, $location, $stateParams, patientVisitHistoryService, urlHelper, encounterService, clinicalConfigService, diseaseTemplates) {
            $scope.patientUuid = $stateParams.patientUuid;
            $scope.patientSummary = {};
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalConfigService.getObsIgnoreList();
            $scope.patientDashboardSections = clinicalConfigService.getAllPatientDashboardSections();

            diseaseTemplates.forEach(function (diseaseTemplate) {
                diseaseTemplate.obsTemplates.forEach(function (obsTemplate) {
                    obsTemplate.observations = _.map(obsTemplate.encounters, function (encounter) {
                        encounter.observations = _.map(encounter.observations, function(observation) {
                            return new Bahmni.Clinical.DashboardObservation(observation);    
                        })
                    });
                })
            });

            $scope.diseaseTemplates = diseaseTemplates;
            console.log($scope.diseaseTemplates);
            Bahmni.Clinical.DiseaseTemplateSectionHelper.populateDiseaseTemplateSections($scope.patientDashboardSections, $scope.diseaseTemplates);

            $scope.filterOdd = function (index) {
                return function () {
                    return index++ % 2 == 0;
                };
            };

            $scope.filterEven = function (index) {
                return function () {
                    return index++ % 2 == 1;
                };
            };

            var getEncountersForVisit = function (visitUuid) {
                encounterService.search(visitUuid).then(function (encounterTransactionsResponse) {
                    $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, $scope.consultationNoteConcept, $scope.labOrderNotesConcept, $scope.encounterConfig, $rootScope.allTestsAndPanelsConcept, $scope.obsIgnoreList, visitUuid, conceptSetUiConfigService.getConfig());
                });
            };

            var clearPatientSummary = function () {
                $scope.patientSummary = undefined;
            };

            $scope.showVisitSummary = function (visit) {
                clearPatientSummary();
                $scope.selectedVisit = visit;
                getEncountersForVisit($scope.selectedVisit.uuid);
            };

            var createPatientDashboardSection = function (section) {
                return new Bahmni.Clinical.PatientDashboardSection(section);
            };

            $scope.getDiseaseTemplateSection = function (diseaseName) {
                return _.find($scope.diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === diseaseName;
                });
            };

            $scope.showSummary = function () {
                $scope.patientSummary = {};
                $scope.patientDashboardSections = _.map($scope.patientDashboardSections, createPatientDashboardSection);
            };

            var init = function () {
                $scope.showSummary();
            };
            init();

        }]);
