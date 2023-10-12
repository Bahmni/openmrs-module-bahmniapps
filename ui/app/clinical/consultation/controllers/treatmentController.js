'use strict';

angular.module('bahmni.clinical')
    .controller('TreatmentController', ['$scope', 'clinicalAppConfigService', 'treatmentConfig', '$stateParams', '$rootScope', 'cdssService',
        function ($scope, clinicalAppConfigService, treatmentConfig, $stateParams, $rootScope, cdssService) {
            var init = function () {
                var drugOrderHistoryConfig = treatmentConfig.drugOrderHistoryConfig || {};
                $scope.drugOrderHistoryView = drugOrderHistoryConfig.view || 'default';
                $scope.tabConfigName = $stateParams.tabConfigName || 'default';
                $scope.medicationTabDisplayControls = appService.getAppDescriptor().getConfigValue("medicationTabDisplayControls") || {};
                var dashboard = Bahmni.Common.DisplayControl.Dashboard.create($scope.medicationTabDisplayControls || {}, $filter);
                $scope.sectionGroups = dashboard.getSections([]);

                var initializeTreatments = function () {
                    $scope.consultation.newlyAddedTabTreatments = $scope.consultation.newlyAddedTabTreatments || {};
                    $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName] || {treatments: [], orderSetTreatments: [], newOrderSet: {}};
                    $scope.treatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].treatments;
                    $scope.orderSetTreatments = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].orderSetTreatments;
                    $scope.newOrderSet = $scope.consultation.newlyAddedTabTreatments[$scope.tabConfigName].newOrderSet;
                };

                var getPreviousDrugAlerts = function () {
                    var treatments = $scope.treatments;
                    treatments && treatments.forEach(function (drugOrder) {
                        var drug = drugOrder.drug;
                        var cdssAlerts = angular.copy($rootScope.cdssAlerts);
                        if (!cdssAlerts) return;
                        drugOrder.alerts = cdssAlerts.filter(function (cdssAlert) {
                            return cdssAlert.referenceMedications.some(function (
                            referenceMedication
                        ) {
                                return referenceMedication.coding.some(function (
                            coding
                            ) {
                                    return (
                                drug.uuid === coding.code ||
                                drug.name === coding.display
                                    );
                                });
                            });
                        });
                        drugOrder.alerts = cdssService.sortInteractionsByStatus(drugOrder.alerts);
                    });
                };

                $scope.$watch('consultation.newlyAddedTabTreatments', initializeTreatments);
                $rootScope.$watch('cdssAlerts', function () {
                    if (!$rootScope.cdssAlerts) return;
                    getPreviousDrugAlerts();
                }, true);

                $scope.enrollment = $stateParams.enrollment;
                $scope.treatmentConfig = treatmentConfig;
            };
            init();
        }]);
