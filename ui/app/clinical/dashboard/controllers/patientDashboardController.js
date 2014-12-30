'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$scope', '$location', '$stateParams',
        'encounterService', 'clinicalAppConfigService', 'diseaseTemplateService', 'configurations', 'retrospectiveEntryService',
        function ($scope, $location, $stateParams, encounterService, 
                  clinicalAppConfigService, diseaseTemplateService, configurations, retrospectiveEntryService) {


            $scope.patientUuid = $stateParams.patientUuid;
            $scope.patientSummary = {};
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
            $scope.patientDashboardSections = _.map(clinicalAppConfigService.getAllPatientDashboardSections(), Bahmni.Clinical.PatientDashboardSection.create);

            diseaseTemplateService.getLatestDiseaseTemplates($stateParams.patientUuid).then(function (diseaseTemplates) {
                $scope.diseaseTemplates = diseaseTemplates;
                $scope.diseaseTemplates.forEach(function (diseaseTemplate) {
                    if (diseaseTemplate.notEmpty()) {
                        $scope.patientDashboardSections.push(new Bahmni.Clinical.PatientDashboardSection({
                            title: diseaseTemplate.label,
                            name: 'diseaseTemplateSection',
                            data: {diseaseTemplateName: diseaseTemplate.name}
                        }));
                    }
                });
            });

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
                    $scope.visit = Bahmni.Clinical.Visit.create(encounterTransactionsResponse.data, configurations.consultationNoteConcept(), $scope.labOrderNotesConcept, configurations.encounterConfig(),
                        configurations.allTestsAndPanelsConcept(), $scope.obsIgnoreList, visitUuid, conceptSetUiConfigService.getConfig(), retrospectiveEntryService.getRetrospectiveEntry().encounterDate);

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

            $scope.getDiseaseTemplateSection = function (diseaseName) {
                return _.find($scope.diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === diseaseName;
                });
            };
        }]);
