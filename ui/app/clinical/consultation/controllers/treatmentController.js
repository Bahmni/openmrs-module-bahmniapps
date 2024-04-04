'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', 'treatmentConfig', '$stateParams', 'appService', '$filter',
        function ($scope, clinicalAppConfigService, treatmentConfig, $stateParams, appService, $filter) {
            var init = function () {
                var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
                $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
                $scope.tabConfigName = $stateParams.tabConfigName || 'default';
                var extensionParams = appService.getAppDescriptor().getExtensionById("bahmni.clinical.billing.treatment").extensionParams;
                $scope.medicationTabDisplayControls = extensionParams && extensionParams.sections ? extensionParams : {sections: {}};
                var dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.medicationTabDisplayControls || {}, $filter);
                $scope.sectionGroups = dashboard.getSections([]);

                var initializeTreatments = function () {
                    $scope.consultation.newlyAddedTabTreatments = $scope.consultation.newlyAddedTabTreatments || {};
                    $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] || {treatments: [], orderSetTreatments: [], newOrderSet: {}};
                    $scope.treatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments;
                    $scope.orderSetTreatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].orderSetTreatments;
                    $scope.newOrderSet = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].newOrderSet;
                };

                $scope.$watch('consultation.newlyAddedTabTreatments', initializeTreatments);

                $scope.enrollment = $stateParams.enrollment;
                $scope.treatmentConfig = treatmentConfig;
            };
            init();
        }]);
