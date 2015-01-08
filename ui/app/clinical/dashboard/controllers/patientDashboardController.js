'use strict';

angular.module('bahmni.clinical')
    .controller('PatientDashboardController', ['$scope', '$location',
        'encounterService', 'clinicalAppConfigService', 'diseaseTemplateService',
        function ($scope, $location, encounterService, clinicalAppConfigService, diseaseTemplateService) {

            $scope.activeVisit = $scope.visitHistory.activeVisit;
            $scope.patientSummary = {};
            $scope.activeVisitData = {};
            $scope.obsIgnoreList = clinicalAppConfigService.getObsIgnoreList();
            $scope.patientDashboardSections = _.map(clinicalAppConfigService.getAllPatientDashboardSections(), Bahmni.Clinical.PatientDashboardSection.create);

            diseaseTemplateService.getLatestDiseaseTemplates($scope.patient.uuid).then(function (diseaseTemplates) {
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
                    return index++ % 2 === 0;
                };
            };

            $scope.filterEven = function (index) {
                return function () {
                    return index++ % 2 === 1;
                };
            };

            $scope.getDiseaseTemplateSection = function (diseaseName) {
                return _.find($scope.diseaseTemplates, function (diseaseTemplate) {
                    return diseaseTemplate.name === diseaseName;
                });
            };
        }]);
