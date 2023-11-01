'use strict';

angular.module('bahmni.clinical')
.controller('cdssAlertRowController', ['$scope', '$rootScope', '$stateParams', 'appService', 'drugService', function ($scope, $rootScope, $stateParams, appService, drugService) {
    var sortInteractionsByStatus = function (arr) {
        var order = { "critical": 0, "warning": 1, "info": 2 };
        return arr.sort(function (a, b) {
            return order[a.indicator] - order[b.indicator];
        });
    };

    var getPreviousDrugAlerts = function () {
        var drugOrderGroups = $scope.consultation ? $scope.consultation.drugOrderGroups : [];
        if (!drugOrderGroups || (drugOrderGroups && !drugOrderGroups.length > 0)) return;

        drugOrderGroups.forEach(function (order) {
            var drugOrders = order.drugOrders;
            drugOrders && drugOrders.forEach(function (drugOrder) {
                var drug = drugOrder.drug;
                var cdssAlerts = angular.copy($rootScope.cdssAlerts);
                if (cdssAlerts) {
                    drugOrder.alerts = cdssAlerts.filter(function (cdssAlert) {
                        return cdssAlert.referenceMedications.some(function (referenceMedication) {
                            return referenceMedication.coding.some(function (coding) {
                                return (
                                    drug.uuid === coding.code || drug.name === coding.display
                                );
                            }
                          );
                        }
                        );
                    });

                    drugOrder.alerts = sortInteractionsByStatus(drugOrder.alerts);
                }
            });
        });
    };

    $scope.hasActiveAlerts = function (alerts) {
        return alerts.some(function (alert) {
            return alert.isActive;
        });
    };

    $scope.closeAlert = function (alert) {
        var alertItem = $rootScope.cdssAlerts.find(function (item) {
            return item.uuid === alert.uuid;
        });

        if (alertItem) {
            alertItem.isActive = false;
        }
    };

    $scope.toggleDetails = function (alert) {
        alert.showDetails = !alert.showDetails;
    };

    $scope.auditOptions = function () {
        return appService
          .getAppDescriptor()
          .getConfigValue('cdssDismissalOptionsToDisplay');
    };

    $scope.auditForm = {};

    $scope.submitAudit = function (alert) {
        var patientUuid = $stateParams.patientUuid;
        var message = alert.summary.replace(/"/g, '');
        var eventType = 'Dismissed: ' + $scope.auditForm.audit;

        $scope.closeAlert(alert);
        return drugService.cdssAudit(patientUuid, eventType, message, 'CDSS');
    };

    var cdssAlertsWatcher = $rootScope.$watch('cdssAlerts', function () {
        if (!$rootScope.cdssAlerts) return;
        getPreviousDrugAlerts();
    }, true);

    $scope.$on('$destroy', cdssAlertsWatcher);
}])
.directive('cdssAlertRow', function () {
    return {
        restrict: 'E',
        controller: 'cdssAlertRowController',
        templateUrl: './consultation/views/cdssAlertRow.html',
        scope: {
            alerts: '=',
            consultation: '='
        }
    };
});
